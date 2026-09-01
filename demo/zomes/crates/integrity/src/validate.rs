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
    for ev in &attestation.evidence {
        if ev.evidence_type.trim().is_empty() || ev.digest.trim().len() < 16 {
            return invalid("evidence type and digest are required");
        }
    }

    let mut seen_ids: HashSet<&str> = HashSet::new();
    for assertion in &attestation.scope.observed {
        if !props.assertion_vocabulary.contains(&assertion.assertion_id) {
            return invalid(format!(
                "assertion '{}' is not in the DNA vocabulary",
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
        if !props.assertion_vocabulary.contains(id) {
            return invalid(format!("not_observed '{id}' is not in the DNA vocabulary"));
        }
        if seen_ids.contains(id.as_str()) {
            return invalid(format!("'{id}' cannot be both observed and not_observed"));
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
            if a1.binding.document_type != a2.binding.document_type
                || a1.binding.document_id != a2.binding.document_id
            {
                return invalid("documents are not the same type+id");
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
            if a1.subject.serial_number != a2.subject.serial_number
                || a1.subject.part_number != a2.subject.part_number
            {
                return invalid("attestations refer to different parts");
            }
            // A predecessor chain is a supersede, not a conflict.
            if predecessor_of(&a1, &revocation.evidence_hashes[1])
                || predecessor_of(&a2, &revocation.evidence_hashes[0])
            {
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
            if p1.issuer_agent != p2.issuer_agent {
                return invalid("different issuers");
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

fn predecessor_of(attestation: &Attestation, other_hash: &ActionHash) -> bool {
    attestation.binding.predecessor_document_hash.as_ref() == Some(other_hash)
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
            if record.action().author() != &author
                && !matches!(
                    link_type,
                    // Revocation and counters may be linked by their own author
                    // onto a base they do not own (the membership / attestation).
                    LinkTypes::MembershipToRevocation
                        | LinkTypes::AttestationToCounter
                        | LinkTypes::HandoffToAcceptance
                )
            {
                // For index links the linker must be the entry author. Checked
                // per-type below where it matters.
            }
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
                LinkTypes::AgentToAttestation => {
                    let att = match require_app_entry::<Attestation>(&record)? {
                        Ok(a) => a,
                        Err(inv) => return Ok(inv),
                    };
                    if record.action().author() != &author {
                        return invalid("agent-attestation link author must be the attester");
                    }
                    if expected_agent_base(&att.attester.agent_pubkey)? != base {
                        return invalid("agent path does not match attester");
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
