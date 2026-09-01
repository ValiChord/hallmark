use std::collections::HashSet;

use hdi::prelude::*;

use crate::dna::DnaProperties;
use crate::paths::{expected_agent_base, expected_document_base, expected_serial_base};
use crate::types::*;
use crate::{EntryTypes, LinkTypes};

/// Deserialize an already-validated dependency. Wrong type → `Invalid`, never
/// a `WasmError` (that would look like a validator crash).
pub fn require_app_entry<T>(record: &Record) -> ExternResult<Result<T, ValidateCallbackResult>>
where
    // `to_app_option` needs the SerializedBytes conversion the entry derives emit,
    // not a bare serde bound.
    T: TryFrom<SerializedBytes, Error = SerializedBytesError>,
{
    match record.entry().to_app_option::<T>() {
        Ok(Some(v)) => Ok(Ok(v)),
        Ok(None) => Ok(Err(ValidateCallbackResult::Invalid(
            "dependency is not the expected entry type".into(),
        ))),
        Err(e) => Ok(Err(ValidateCallbackResult::Invalid(format!(
            "dependency failed to deserialize: {e}"
        )))),
    }
}

fn invalid(reason: impl Into<String>) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(reason.into()))
}

// Field bounds. This format is a wire contract, and every field below was
// previously unbounded up to Holochain's entry-size limit — a megabyte-long
// organisation name was well-formed. These are deliberately generous: they exist
// to stop absurd input, not to encode business rules about name lengths.
const MAX_NAME: usize = 200;
const MAX_CERT: usize = 100;
const MAX_TEXT: usize = 2_000;
const MAX_LOCATOR: usize = 1_000;
const MAX_DIGEST: usize = 512;
const MAX_ASSERTIONS: usize = 64;
const MAX_EVIDENCE: usize = 32;
const MAX_EVIDENCE_HASHES: usize = 8;

/// `None` when within bounds, `Some(Invalid)` when over.
fn too_long(field: &str, value: &str, max: usize) -> Option<ExternResult<ValidateCallbackResult>> {
    if value.len() > max {
        Some(invalid(format!(
            "{field} exceeds {max} bytes ({} given)",
            value.len()
        )))
    } else {
        None
    }
}

fn too_many(field: &str, len: usize, max: usize) -> Option<ExternResult<ValidateCallbackResult>> {
    if len > max {
        Some(invalid(format!("{field} exceeds {max} entries ({len} given)")))
    } else {
        None
    }
}

fn valid() -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_create(
    app_entry: EntryTypes,
    action: TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    match app_entry {
        EntryTypes::Attestation(a) => validate_attestation(&a, &action),
        EntryTypes::MembershipProof(p) => validate_membership(&p, &action),
        EntryTypes::MembershipRevocation(r) => validate_revocation(&r, &action),
        EntryTypes::KeyHandoff(h) => validate_handoff(&h, &action),
        EntryTypes::KeyAcceptance(a) => validate_acceptance(&a, &action),
        EntryTypes::CounterAttestation(c) => validate_counter(&c, &action),
    }
}

// ===========================================================================
// Membership
// ===========================================================================

fn validate_membership(
    proof: &MembershipProof,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    let props = DnaProperties::load()?;
    let author = action.author();
    let issued_at = action.timestamp();

    if author != &proof.issuer_agent {
        return invalid("publisher is not the declared issuer");
    }
    if proof.issuer_agent == proof.agent_pubkey {
        return invalid("self-issuance is not allowed");
    }
    if proof.organisation.trim().is_empty() || proof.organisation_id.trim().is_empty() {
        return invalid("organisation and organisation_id are required");
    }
    if proof.accreditation.cert_number.trim().is_empty()
        || proof.accreditation.issuing_authority.trim().is_empty()
    {
        return invalid("accreditation cert_number and issuing_authority are required");
    }
    if proof.expires_at <= issued_at {
        return invalid("expires_at must be after issuance (action timestamp)");
    }
    // Timestamps are i64 micros; the guard above ensures a non-negative delta.
    // saturating_sub is defensive against any pathological clock values.
    let ttl = proof.expires_at.as_micros().saturating_sub(issued_at.as_micros());
    if ttl > props.max_membership_ttl_micros {
        return invalid("membership TTL exceeds DNA max_membership_ttl_micros");
    }
    if let Some(inv) = too_long("organisation", &proof.organisation, MAX_NAME) { return inv; }
    if let Some(inv) = too_long("organisation_id", &proof.organisation_id, MAX_NAME) { return inv; }
    if let Some(inv) = too_long("cert_number", &proof.accreditation.cert_number, MAX_CERT) { return inv; }
    if let Some(inv) = too_long(
        "issuing_authority",
        &proof.accreditation.issuing_authority,
        MAX_CERT,
    ) { return inv; }
    if !role_matches_accreditation(&proof.accreditation.accreditation_type, &proof.role) {
        return invalid("role does not match accreditation type");
    }

    if let Some(pred_hash) = &proof.predecessor_membership_hash {
        let pred_record = must_get_valid_record(pred_hash.clone())?;
        let pred = match require_app_entry::<MembershipProof>(&pred_record)? {
            Ok(p) => p,
            Err(inv) => return Ok(inv),
        };
        if pred.accreditation.cert_number != proof.accreditation.cert_number
            || pred.accreditation.issuing_authority != proof.accreditation.issuing_authority
        {
            return invalid("rotated membership must keep the same certificate");
        }
        if pred.agent_pubkey == proof.agent_pubkey {
            return invalid("key rotation predecessor is the same agent");
        }

        // The old key must have consented, and the new key accepted. Without
        // this a rotation is simply an assertion by the issuer, and the
        // DuplicateCertIssuance carve-out makes that assertion unchallengeable.
        let (Some(handoff_hash), Some(acceptance_hash)) = (
            proof.rotation_handoff_hash.clone(),
            proof.rotation_acceptance_hash.clone(),
        ) else {
            return invalid("a key rotation requires both a handoff and an acceptance");
        };
        let handoff_record = must_get_valid_record(handoff_hash.clone())?;
        let handoff = match require_app_entry::<KeyHandoff>(&handoff_record)? {
            Ok(h) => h,
            Err(inv) => return Ok(inv),
        };
        let acceptance_record = must_get_valid_record(acceptance_hash)?;
        let acceptance = match require_app_entry::<KeyAcceptance>(&acceptance_record)? {
            Ok(a) => a,
            Err(inv) => return Ok(inv),
        };
        if &handoff.old_membership_hash != pred_hash {
            return invalid("handoff does not point at the predecessor membership");
        }
        if acceptance.handoff_hash != handoff_hash {
            return invalid("acceptance does not point at this handoff");
        }
        if handoff_record.action().author() != &pred.agent_pubkey {
            return invalid("handoff was not authored by the key being replaced");
        }
        if handoff.new_key != proof.agent_pubkey {
            return invalid("handoff names a different new key");
        }
        if acceptance_record.action().author() != &proof.agent_pubkey {
            return invalid("acceptance was not authored by the new key");
        }
    }

    match &proof.issuer_membership_hash {
        None => {
            if !props.is_root(&proof.issuer_agent) {
                return invalid("issuer is not a DNA root and no issuer membership was provided");
            }
            if proof.depth != 1 {
                return invalid("root-issued membership must have depth 1");
            }
        }
        Some(issuer_hash) => {
            let issuer_record = must_get_valid_record(issuer_hash.clone())?;
            let issuer = match require_app_entry::<MembershipProof>(&issuer_record)? {
                Ok(p) => p,
                Err(inv) => return Ok(inv),
            };
            if issuer.agent_pubkey != proof.issuer_agent {
                return invalid("issuer membership does not belong to issuer_agent");
            }
            let issuer_issued = issuer_record.action().timestamp();
            if issued_at < issuer_issued {
                return invalid("issuer membership is dated after this proof");
            }
            if issued_at > issuer.expires_at {
                return invalid("issuer membership expired before this proof");
            }
            // Expiry inheritance (SPEC §6.1). Without this a delegated grant
            // outlives the accreditation that authorised it, and because the
            // chain walk deliberately does not re-check ancestor expiry at
            // attestation time — it relies on this rule holding — an attestation
            // signed after the issuer's approval lapsed would still verify as
            // Active.
            if proof.expires_at > issuer.expires_at {
                return invalid("delegated membership may not outlive the issuer's accreditation");
            }
            let expected_depth = issuer.depth.checked_add(1);
            let expected_depth = match expected_depth {
                Some(d) => d,
                // Invalid data, not a validator fault: an Err here leaves the op
                // unresolved rather than rejected.
                None => return invalid("delegation depth overflow"),
            };
            if expected_depth > props.max_delegation_depth {
                return invalid(format!(
                    "delegation depth {expected_depth} exceeds max {}",
                    props.max_delegation_depth
                ));
            }
            if proof.depth != expected_depth {
                return invalid(format!(
                    "declared depth {} does not match computed {expected_depth}",
                    proof.depth
                ));
            }
            if !allowed_new_accreditation(
                &issuer.accreditation.accreditation_type,
                &proof.accreditation.accreditation_type,
            ) {
                return invalid("issuer is not authorized to grant this accreditation type");
            }
        }
    }

    valid()
}

// ===========================================================================
// Attestation
// ===========================================================================

fn validate_attestation(
    attestation: &Attestation,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    let props = DnaProperties::load()?;
    let author = action.author();
    let at = action.timestamp();

    if attestation.raf_version != RAF_VERSION {
        return invalid(format!("raf_version must be {RAF_VERSION}"));
    }
    if author != &attestation.attester.agent_pubkey {
        return invalid("author is not the attester");
    }
    if attestation.subject.part_number.trim().is_empty()
        || attestation.subject.serial_number.trim().is_empty()
    {
        return invalid("part_number and serial_number are required");
    }
    if attestation.binding.document_id.trim().is_empty() {
        return invalid("document_id is required");
    }
    if attestation.binding.document_digest.trim().len() < 16 {
        return invalid("document_digest is too short");
    }
    match attestation.binding.binds_field.as_str() {
        BINDS_SERIAL | BINDS_PART | BINDS_BOTH => {}
        other => return invalid(format!("unknown binds_field '{other}'")),
    }
    if let Some(inv) = too_long("part_number", &attestation.subject.part_number, MAX_CERT) { return inv; }
    if let Some(inv) = too_long("serial_number", &attestation.subject.serial_number, MAX_CERT) { return inv; }
    if let Some(inv) = too_long("description", &attestation.subject.description, MAX_TEXT) { return inv; }
    if let Some(inv) = too_long("document_id", &attestation.binding.document_id, MAX_NAME) { return inv; }
    if let Some(inv) = too_long("document_digest", &attestation.binding.document_digest, MAX_DIGEST) { return inv; }
    if let Some(inv) = too_long("organisation", &attestation.attester.organisation, MAX_NAME) { return inv; }
    if let Some(inv) = too_long("organisation_id", &attestation.attester.organisation_id, MAX_NAME) { return inv; }
    if let Some(inv) = too_many("evidence", attestation.evidence.len(), MAX_EVIDENCE) { return inv; }
    if let Some(inv) = too_many("observed", attestation.scope.observed.len(), MAX_ASSERTIONS) { return inv; }
    if let Some(inv) = too_many("not_observed", attestation.scope.not_observed.len(), MAX_ASSERTIONS) { return inv; }

    for ev in &attestation.evidence {
        if ev.evidence_type.trim().is_empty() || ev.digest.trim().len() < 16 {
            return invalid("evidence type and digest are required");
        }
        if let Some(inv) = too_long("evidence_type", &ev.evidence_type, MAX_CERT) { return inv; }
        if let Some(inv) = too_long("evidence digest", &ev.digest, MAX_DIGEST) { return inv; }
        if let Some(locator) = &ev.locator {
            if let Some(inv) = too_long("evidence locator", locator, MAX_LOCATOR) { return inv; }
        }
    }

    // Block 11 is partitioned by certification path. The two lists are disjoint
    // in the regulator's own documents, and a term from the wrong one is not a
    // near-miss — it is a claim the signer has no authority to make.
    let (vocabulary, path_name) = match attestation.binding.certification_path {
        CertificationPath::AirworthinessApproval => {
            (&props.airworthiness_vocabulary, "blocks 13a-13e")
        }
        CertificationPath::ReturnToService => {
            (&props.return_to_service_vocabulary, "blocks 14a-14e")
        }
    };

    let mut seen_ids: HashSet<&str> = HashSet::new();
    for assertion in &attestation.scope.observed {
        if !vocabulary.contains(&assertion.assertion_id) {
            return invalid(format!(
                "assertion '{}' is not permitted on {path_name}",
                assertion.assertion_id
            ));
        }
        if !seen_ids.insert(assertion.assertion_id.as_str()) {
            return invalid(format!(
                "duplicate observed assertion '{}'",
                assertion.assertion_id
            ));
        }
    }
    for id in &attestation.scope.not_observed {
        if !vocabulary.contains(id) {
            return invalid(format!("not_observed '{id}' is not permitted on {path_name}"));
        }
        if seen_ids.contains(id.as_str()) {
            return invalid(format!("'{id}' cannot be both observed and not_observed"));
        }
    }

    match attestation.binding.certification_path {
        CertificationPath::AirworthinessApproval => {
            // 8130.21J ¶11.k: "Enter one of the terms below" — one term, and the
            // form has one Block 11.
            if attestation.scope.observed.len() != 1 {
                return invalid("the airworthiness path takes exactly one Block 11 term");
            }
            // This path is where a chain begins: the article is being released
            // by whoever produced it, so there is no earlier certificate for it.
            if attestation.binding.predecessor_document_hash.is_some() {
                return invalid("an airworthiness approval cannot have a predecessor certificate");
            }
        }
        CertificationPath::ReturnToService => {
            if attestation.scope.observed.is_empty() {
                return invalid("the return to service path requires a Block 11 term");
            }
            // AC 43-9D Table B-1 note: "The applicable standard must be
            // described in block 12." Our nearest field is `evidence`, so a
            // return to service must cite at least one.
            if attestation.evidence.is_empty() {
                return invalid(
                    "a return to service must cite the applicable standard (at least one evidence entry)",
                );
            }
        }
    }

    let membership_record = must_get_valid_record(attestation.membership_proof_hash.clone())?;
    let membership = match require_app_entry::<MembershipProof>(&membership_record)? {
        Ok(p) => p,
        Err(inv) => return Ok(inv),
    };
    if membership.agent_pubkey != attestation.attester.agent_pubkey {
        return invalid("membership belongs to a different agent");
    }
    if membership.role != attestation.attester.role {
        return invalid("attester role does not match membership role");
    }
    if membership.organisation != attestation.attester.organisation
        || membership.organisation_id != attestation.attester.organisation_id
    {
        return invalid("attester organisation does not match membership");
    }
    let membership_issued = membership_record.action().timestamp();
    if at < membership_issued {
        return invalid("membership issued after this attestation");
    }
    if at > membership.expires_at {
        return invalid("membership expired");
    }
    // The signer must hold an accreditation that can sign *this* path. Without
    // this the path discriminator is decoration: a repair station could file an
    // airworthiness approval simply by setting the field.
    if !accreditation_may_sign(
        &membership.accreditation.accreditation_type,
        &attestation.binding.certification_path,
    ) {
        return invalid(format!(
            "{:?} may not sign {:?}",
            membership.accreditation.accreditation_type, attestation.binding.certification_path
        ));
    }

    if let Err(inv) = walk_membership_to_root(
        attestation.membership_proof_hash.clone(),
        &props,
    )? {
        return Ok(inv);
    }

    if let Some(pred_hash) = &attestation.binding.predecessor_document_hash {
        let pred_record = must_get_valid_record(pred_hash.clone())?;
        let pred = match require_app_entry::<Attestation>(&pred_record)? {
            Ok(a) => a,
            Err(inv) => return Ok(inv),
        };
        if pred.subject.serial_number != attestation.subject.serial_number
            || pred.subject.part_number != attestation.subject.part_number
        {
            return invalid("predecessor is a different part");
        }
        if pred_record.action().timestamp() >= at {
            return invalid("predecessor must be earlier than this attestation");
        }
        // Transfers are allowed: predecessor attester may differ.
    }

    valid()
}

/// Structural walk: every hop exists, no cycle, terminates at a DNA root.
/// Ancestor *expiry at attestation time* is intentionally not required —
/// that was already checked when each child membership was created.
fn walk_membership_to_root(
    start: ActionHash,
    props: &DnaProperties,
) -> ExternResult<Result<(), ValidateCallbackResult>> {
    let mut current = start;
    let mut seen: HashSet<ActionHash> = HashSet::new();

    for _ in 0..=props.max_delegation_depth {
        if !seen.insert(current.clone()) {
            return Ok(Err(ValidateCallbackResult::Invalid(
                "membership chain contains a cycle".into(),
            )));
        }
        let record = must_get_valid_record(current.clone())?;
        let proof = match require_app_entry::<MembershipProof>(&record)? {
            Ok(p) => p,
            Err(inv) => return Ok(Err(inv)),
        };
        match proof.issuer_membership_hash {
            None => {
                if !props.is_root(&proof.issuer_agent) {
                    return Ok(Err(ValidateCallbackResult::Invalid(
                        "terminal issuer is not a DNA root".into(),
                    )));
                }
                return Ok(Ok(()));
            }
            Some(next) => current = next,
        }
    }
    Ok(Err(ValidateCallbackResult::Invalid(
        "membership chain exceeded max depth without reaching a root".into(),
    )))
}

// ===========================================================================
// Revocation
// ===========================================================================

fn validate_revocation(
    revocation: &MembershipRevocation,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    let props = DnaProperties::load()?;
    let author = action.author();

    let membership_record = must_get_valid_record(revocation.membership_hash.clone())?;
    let membership = match require_app_entry::<MembershipProof>(&membership_record)? {
        Ok(p) => p,
        Err(inv) => return Ok(inv),
    };
    if membership.agent_pubkey != revocation.agent_pubkey {
        return invalid("revocation agent does not match membership agent");
    }

    // A revocation cannot predate what it revokes. Without this, an author with
    // a quiescent chain can stamp a revocation before an existing attestation
    // and flip that attestation's `historically_valid` to false — destroying the
    // one property this format exists to protect. The other entry types already
    // impose ordering (see `validate_membership` and `validate_attestation`);
    // this one did not.
    if let Some(inv) = too_many(
        "evidence_hashes",
        revocation.evidence_hashes.len(),
        MAX_EVIDENCE_HASHES,
    ) { return inv; }
    if let Some(notes) = &revocation.notes {
        if let Some(inv) = too_long("notes", notes, MAX_TEXT) { return inv; }
    }
    let revoked_at = action.timestamp();
    let membership_issued = membership_record.action().timestamp();
    if revoked_at < membership_issued {
        return invalid("revocation predates the membership it revokes");
    }

    match &revocation.grounds {
        RevocationGrounds::Administrative => {
            let issuer_ok = author == &membership.issuer_agent;
            let root_ok = props.is_root(author);
            if !issuer_ok && !root_ok {
                return invalid("administrative revocation requires the original issuer or a DNA root");
            }
        }
        RevocationGrounds::KeyRotated => {
            if revocation.evidence_hashes.len() < 2 {
                return invalid("KeyRotated requires handoff and acceptance hashes");
            }
            let handoff_record = must_get_valid_record(revocation.evidence_hashes[0].clone())?;
            let handoff = match require_app_entry::<KeyHandoff>(&handoff_record)? {
                Ok(h) => h,
                Err(inv) => return Ok(inv),
            };
            let accept_record = must_get_valid_record(revocation.evidence_hashes[1].clone())?;
            let acceptance = match require_app_entry::<KeyAcceptance>(&accept_record)? {
                Ok(a) => a,
                Err(inv) => return Ok(inv),
            };
            if handoff.old_membership_hash != revocation.membership_hash {
                return invalid("handoff does not point at this membership");
            }
            if acceptance.handoff_hash != revocation.evidence_hashes[0] {
                return invalid("acceptance does not point at this handoff");
            }
            if handoff_record.action().author() != &membership.agent_pubkey {
                return invalid("handoff was not authored by the old key");
            }
            if accept_record.action().author() != &handoff.new_key {
                return invalid("acceptance was not authored by the new key");
            }
            // Issuer of the old membership, a root, or the old key may file this.
            if author != &membership.issuer_agent
                && author != &membership.agent_pubkey
                && !props.is_root(author)
            {
                return invalid("KeyRotated revocation author is not authorized");
            }
        }
        RevocationGrounds::DuplicateDocument => {
            let (a1, a2) = two_attestations(&revocation.evidence_hashes)?;
            let (a1, a2) = match (a1, a2) {
                (Ok(x), Ok(y)) => (x, y),
                (Err(inv), _) | (_, Err(inv)) => return Ok(inv),
            };
            if a1.attester.agent_pubkey != revocation.agent_pubkey
                || a2.attester.agent_pubkey != revocation.agent_pubkey
            {
                return invalid("attestations were not authored by the revoked agent");
            }
            if a1.membership_proof_hash != revocation.membership_hash
                || a2.membership_proof_hash != revocation.membership_hash
            {
                return invalid("evidence was not signed under the membership being revoked");
            }
            if a1.binding.document_type != a2.binding.document_type
                || a1.binding.document_id != a2.binding.document_id
            {
                return invalid("documents are not the same type+id");
            }
            // A corrected form issued under the same document_id, correctly
            // linked to the one it replaces, is a supersede — not a duplicate.
            // `ConflictingAssertions` has always excused this; omitting it here
            // let an organisation's own correction be used to revoke it.
            if is_supersede_chain(
                &a1,
                &revocation.evidence_hashes[0],
                &a2,
                &revocation.evidence_hashes[1],
                props.max_delegation_depth,
            )? {
                return invalid("documents are a supersede chain, not a duplicate");
            }
            if revocation.evidence_hashes[0] == revocation.evidence_hashes[1] {
                return invalid("duplicate evidence hash");
            }
        }
        RevocationGrounds::ConflictingAssertions { assertion_id } => {
            if revocation.evidence_hashes.len() < 2 {
                return invalid("need two attestation hashes");
            }
            if revocation.evidence_hashes[0] == revocation.evidence_hashes[1] {
                return invalid("evidence hashes must be distinct attestations");
            }
            let (a1, a2) = two_attestations(&revocation.evidence_hashes)?;
            let (a1, a2) = match (a1, a2) {
                (Ok(x), Ok(y)) => (x, y),
                (Err(inv), _) | (_, Err(inv)) => return Ok(inv),
            };
            if a1.attester.agent_pubkey != revocation.agent_pubkey
                || a2.attester.agent_pubkey != revocation.agent_pubkey
            {
                return invalid("attestations were not authored by the revoked agent");
            }
            if a1.membership_proof_hash != revocation.membership_hash
                || a2.membership_proof_hash != revocation.membership_hash
            {
                return invalid("evidence was not signed under the membership being revoked");
            }
            if a1.subject.serial_number != a2.subject.serial_number
                || a1.subject.part_number != a2.subject.part_number
            {
                return invalid("attestations refer to different parts");
            }
            // A predecessor chain is a supersede, not a conflict — following the
            // whole chain, not just one hop, so A1 <- A2 <- A3 cannot be cited
            // as a conflict between A1 and A3.
            if is_supersede_chain(
                &a1,
                &revocation.evidence_hashes[0],
                &a2,
                &revocation.evidence_hashes[1],
                props.max_delegation_depth,
            )? {
                return invalid("attestations are a predecessor chain, not a conflict");
            }
            let v1 = a1
                .scope
                .observed
                .iter()
                .find(|a| &a.assertion_id == assertion_id);
            let v2 = a2
                .scope
                .observed
                .iter()
                .find(|a| &a.assertion_id == assertion_id);
            match (v1, v2) {
                (Some(x), Some(y)) if x.value != y.value => {}
                (Some(_), Some(_)) => {
                    return invalid("assertion values do not conflict");
                }
                _ => return invalid("both attestations must observe the named assertion"),
            }
        }
        RevocationGrounds::DuplicateCertIssuance => {
            if revocation.evidence_hashes.len() < 2 {
                return invalid("need two membership proofs");
            }
            let r1 = must_get_valid_record(revocation.evidence_hashes[0].clone())?;
            let r2 = must_get_valid_record(revocation.evidence_hashes[1].clone())?;
            let p1 = match require_app_entry::<MembershipProof>(&r1)? {
                Ok(p) => p,
                Err(inv) => return Ok(inv),
            };
            let p2 = match require_app_entry::<MembershipProof>(&r2)? {
                Ok(p) => p,
                Err(inv) => return Ok(inv),
            };
            if p1.issuer_agent != revocation.agent_pubkey
                || p2.issuer_agent != revocation.agent_pubkey
            {
                return invalid("revoked agent is not the issuer of both proofs");
            }
            // Both grants must have been made *under the membership being
            // revoked*. Without this, grants issued under an earlier, long-since
            // replaced membership can be cited against every membership the
            // agent is ever issued afterwards.
            if p1.issuer_membership_hash.as_ref() != Some(&revocation.membership_hash)
                || p2.issuer_membership_hash.as_ref() != Some(&revocation.membership_hash)
            {
                return invalid("grants were not issued under the membership being revoked");
            }
            if p1.accreditation.cert_number != p2.accreditation.cert_number
                || p1.accreditation.issuing_authority != p2.accreditation.issuing_authority
            {
                return invalid("certificates differ");
            }
            if p1.agent_pubkey == p2.agent_pubkey {
                return invalid("same subject agent — not a duplicate grant");
            }
            // Key rotation: the later proof names the earlier as predecessor.
            if p1.predecessor_membership_hash.as_ref() == Some(&revocation.evidence_hashes[1])
                || p2.predecessor_membership_hash.as_ref() == Some(&revocation.evidence_hashes[0])
            {
                return invalid("memberships are a key rotation, not a duplicate grant");
            }
            let t1 = r1.action().timestamp();
            let t2 = r2.action().timestamp();
            let overlap = !(p1.expires_at < t2 || p2.expires_at < t1);
            if !overlap {
                return invalid("validity windows do not overlap — this is a re-issue");
            }
        }
    }

    valid()
}

/// Is one of these two attestations reachable from the other by following
/// `predecessor_document_hash`? A single-hop check misses A1 <- A2 <- A3, which
/// let a revision chain be cited as if it were a conflict or a duplicate.
///
/// Bounded by `max_hops` and guarded by a `seen` set, so a long or circular
/// chain terminates rather than running away. Deterministic: every fetch is
/// `must_get_valid_record`.
fn is_supersede_chain(
    a1: &Attestation,
    h1: &ActionHash,
    a2: &Attestation,
    h2: &ActionHash,
    max_hops: u8,
) -> ExternResult<bool> {
    Ok(walks_back_to(a1, h2, max_hops)? || walks_back_to(a2, h1, max_hops)?)
}

fn walks_back_to(from: &Attestation, target: &ActionHash, max_hops: u8) -> ExternResult<bool> {
    let mut seen: HashSet<ActionHash> = HashSet::new();
    let mut cursor = from.binding.predecessor_document_hash.clone();

    for _ in 0..=max_hops {
        let Some(hash) = cursor else { return Ok(false) };
        if &hash == target {
            return Ok(true);
        }
        if !seen.insert(hash.clone()) {
            return Ok(false);
        }
        let record = must_get_valid_record(hash)?;
        // A predecessor that is not an attestation ends the walk; the entry's
        // own validation is what rejects it, not this helper.
        let Ok(Ok(prev)) = require_app_entry::<Attestation>(&record) else {
            return Ok(false);
        };
        cursor = prev.binding.predecessor_document_hash.clone();
    }
    Ok(false)
}

fn two_attestations(
    hashes: &[ActionHash],
) -> ExternResult<(
    Result<Attestation, ValidateCallbackResult>,
    Result<Attestation, ValidateCallbackResult>,
)> {
    if hashes.len() < 2 {
        return Ok((
            Err(ValidateCallbackResult::Invalid(
                "need two attestation hashes".into(),
            )),
            Err(ValidateCallbackResult::Invalid(
                "need two attestation hashes".into(),
            )),
        ));
    }
    let r1 = must_get_valid_record(hashes[0].clone())?;
    let r2 = must_get_valid_record(hashes[1].clone())?;
    Ok((
        require_app_entry::<Attestation>(&r1)?,
        require_app_entry::<Attestation>(&r2)?,
    ))
}

// ===========================================================================
// Key rotation + counters
// ===========================================================================

fn validate_handoff(
    handoff: &KeyHandoff,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    let record = must_get_valid_record(handoff.old_membership_hash.clone())?;
    let proof = match require_app_entry::<MembershipProof>(&record)? {
        Ok(p) => p,
        Err(inv) => return Ok(inv),
    };
    if action.author() != &proof.agent_pubkey {
        return invalid("handoff must be authored by the old key");
    }
    if handoff.new_key == proof.agent_pubkey {
        return invalid("new key must differ from old key");
    }
    if action.timestamp() > proof.expires_at {
        return invalid("cannot hand off an expired membership");
    }
    valid()
}

fn validate_acceptance(
    acceptance: &KeyAcceptance,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    let record = must_get_valid_record(acceptance.handoff_hash.clone())?;
    let handoff = match require_app_entry::<KeyHandoff>(&record)? {
        Ok(h) => h,
        Err(inv) => return Ok(inv),
    };
    if action.author() != &handoff.new_key {
        return invalid("acceptance must be authored by the new key");
    }
    valid()
}

fn validate_counter(
    counter: &CounterAttestation,
    action: &TypedAction<CreateData>,
) -> ExternResult<ValidateCallbackResult> {
    if action.author() != &counter.attester.agent_pubkey {
        return invalid("author is not the counter-attester");
    }
    if counter.attester.organisation.trim().is_empty() {
        return invalid("organisation is required");
    }
    if let Some(inv) = too_long("organisation", &counter.attester.organisation, MAX_NAME) { return inv; }
    if let Some(inv) = too_long("organisation_id", &counter.attester.organisation_id, MAX_NAME) { return inv; }
    if let Some(notes) = &counter.discrepancy_notes {
        if let Some(inv) = too_long("discrepancy_notes", notes, MAX_TEXT) { return inv; }
    }
    let target = must_get_valid_record(counter.attestation_hash.clone())?;
    if let Err(inv) = require_app_entry::<Attestation>(&target)? {
        return Ok(inv);
    }
    valid()
}

// ===========================================================================
// Links
// ===========================================================================

pub fn validate_link(link: OpLink<LinkTypes>) -> ExternResult<ValidateCallbackResult> {
    match link {
        OpLink::DeleteLink { .. } => invalid("RAF links are immutable"),
        OpLink::CreateLink { link_type, action } => {
            let author = action.author().clone();
            let base = action.data.base_address.clone();
            let target = action.data.target_address.clone();
            let Some(target_hash) = target.into_action_hash() else {
                return invalid("link target must be an action hash");
            };
            let record = must_get_valid_record(target_hash)?;
            // Every arm below independently requires the linker to be the target
            // entry's author, so there is no shared pre-check here. (There used
            // to be an `if` with an empty body and a comment claiming three link
            // types were exempt. They are not — each of those arms checks
            // authorship too.)
            match link_type {
                LinkTypes::SerialToAttestation => {
                    let att = match require_app_entry::<Attestation>(&record)? {
                        Ok(a) => a,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("serial link author must be the attester");
                    }
                    if expected_serial_base(&att)? != base {
                        return invalid("serial path does not match attestation subject");
                    }
                    valid()
                }
                LinkTypes::DocumentToAttestation => {
                    let att = match require_app_entry::<Attestation>(&record)? {
                        Ok(a) => a,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("document link author must be the attester");
                    }
                    if expected_document_base(&att)? != base {
                        return invalid("document path does not match attestation binding");
                    }
                    valid()
                }
                LinkTypes::AgentMembership => {
                    let proof = match require_app_entry::<MembershipProof>(&record)? {
                        Ok(p) => p,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("membership link author must be the issuer");
                    }
                    if expected_agent_base(&proof.agent_pubkey)? != base {
                        return invalid("agent path does not match membership subject");
                    }
                    valid()
                }
                LinkTypes::AgentRevocation => {
                    let rev = match require_app_entry::<MembershipRevocation>(&record)? {
                        Ok(r) => r,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("revocation link author must be the revocation author");
                    }
                    if expected_agent_base(&rev.agent_pubkey)? != base {
                        return invalid("agent path does not match revoked agent");
                    }
                    valid()
                }
                LinkTypes::MembershipToRevocation => {
                    let rev = match require_app_entry::<MembershipRevocation>(&record)? {
                        Ok(r) => r,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("revocation link author must be the revocation author");
                    }
                    let expected: AnyLinkableHash = rev.membership_hash.clone().into();
                    if expected != base {
                        return invalid("revocation link base is not the membership hash");
                    }
                    valid()
                }
                LinkTypes::AttestationToCounter => {
                    let counter = match require_app_entry::<CounterAttestation>(&record)? {
                        Ok(c) => c,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("counter link author must be the counter-attester");
                    }
                    // Base is the original attestation action hash — must exist.
                    let Some(att_hash) = action.data.base_address.clone().into_action_hash() else {
                        return invalid("counter link base must be an attestation action hash");
                    };
                    if att_hash != counter.attestation_hash {
                        return invalid("counter link base is not the attestation the counter names");
                    }
                    let att_record = must_get_valid_record(att_hash)?;
                    match require_app_entry::<Attestation>(&att_record)? {
                        Ok(_) => {}
                        Err(inv) => return Ok(inv),
                    }
                    let _ = counter;
                    valid()
                }
                LinkTypes::HandoffToAcceptance => {
                    let acceptance = match require_app_entry::<KeyAcceptance>(&record)? {
                        Ok(a) => a,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("acceptance link author must be the new key");
                    }
                    let expected: AnyLinkableHash = acceptance.handoff_hash.clone().into();
                    if expected != base {
                        return invalid("acceptance link base is not the handoff hash");
                    }
                    valid()
                }
            }
        }
    }
}
