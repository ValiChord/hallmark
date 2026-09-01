//! Coordinator zome — CRUD, getters, and the non-deterministic verify report.
//!
//! `verify_attestation` uses `get` / `get_links` and is fail-closed on missing
//! data. DHT-valid (integrity passed) is not the same as currently trusted.

use hdk::prelude::*;
use aviation_attestation_integrity::*;

mod verify;
pub use verify::*;

fn missing(what: &str) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(format!("{what} not found")))
}

fn guest(msg: impl Into<String>) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(msg.into()))
}

fn get_record(hash: ActionHash) -> ExternResult<Record> {
    get(hash, GetOptions::default())?.ok_or_else(|| missing("record"))
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------

#[hdk_extern]
pub fn issue_membership(mut proof: MembershipProof) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    let props = DnaProperties::load()?;
    let now = sys_time()?;

    if me != proof.issuer_agent {
        return Err(guest("you can only issue as yourself"));
    }
    if proof.expires_at <= now {
        return Err(guest("expires_at must be in the future"));
    }
    let ttl = proof.expires_at.as_micros().saturating_sub(now.as_micros());
    if ttl > props.max_membership_ttl_micros {
        return Err(guest("TTL exceeds DNA maximum"));
    }

    match &proof.issuer_membership_hash {
        None => {
            if !props.is_root(&me) {
                return Err(guest("not a DNA root and no issuer membership provided"));
            }
            proof.depth = 1;
        }
        Some(_) => {
            if proof.depth < 2 {
                return Err(guest("non-root membership must have depth >= 2"));
            }
        }
    }

    let hash = create_entry(&EntryTypes::MembershipProof(proof.clone()))?;
    create_link(
        agent_path_hash(&proof.agent_pubkey)?,
        hash.clone(),
        LinkTypes::AgentMembership,
        (),
    )?;
    get_record(hash)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RevokeInput {
    pub membership_hash: ActionHash,
    pub grounds: RevocationGrounds,
    pub evidence_hashes: Vec<ActionHash>,
    pub notes: Option<String>,
}

#[hdk_extern]
pub fn revoke_membership(input: RevokeInput) -> ExternResult<Record> {
    let membership_record = get_record(input.membership_hash.clone())?;
    let membership: MembershipProof = membership_record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("target is not a membership proof"))?;

    let revocation = MembershipRevocation {
        membership_hash: input.membership_hash.clone(),
        agent_pubkey: membership.agent_pubkey.clone(),
        grounds: input.grounds,
        evidence_hashes: input.evidence_hashes,
        notes: input.notes,
    };
    let hash = create_entry(&EntryTypes::MembershipRevocation(revocation))?;
    create_link(
        input.membership_hash,
        hash.clone(),
        LinkTypes::MembershipToRevocation,
        (),
    )?;
    create_link(
        agent_path_hash(&membership.agent_pubkey)?,
        hash.clone(),
        LinkTypes::AgentRevocation,
        (),
    )?;
    get_record(hash)
}

// ---------------------------------------------------------------------------
// Attestation
// ---------------------------------------------------------------------------

#[hdk_extern]
pub fn create_attestation(attestation: Attestation) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    if me != attestation.attester.agent_pubkey {
        return Err(guest("you can only attest as yourself"));
    }
    let hash = create_entry(&EntryTypes::Attestation(attestation.clone()))?;
    create_link(
        serial_path_hash(
            &attestation.subject.part_number,
            &attestation.subject.serial_number,
        )?,
        hash.clone(),
        LinkTypes::SerialToAttestation,
        (),
    )?;
    create_link(
        document_path_hash(
            &attestation.binding.document_type,
            &attestation.binding.document_id,
        )?,
        hash.clone(),
        LinkTypes::DocumentToAttestation,
        (),
    )?;
    get_record(hash)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateCounterInput {
    pub attestation_hash: ActionHash,
    pub role: AttesterRole,
    pub organisation: String,
    pub organisation_id: String,
    pub agreement: AgreementStatus,
    pub notes: Option<String>,
}

#[hdk_extern]
pub fn create_counter_attestation(input: CreateCounterInput) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    let original = get_record(input.attestation_hash.clone())?;
    let _: Attestation = original
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("target is not an attestation"))?;

    let counter = CounterAttestation {
        attestation_hash: input.attestation_hash.clone(),
        attester: Attester {
            agent_pubkey: me,
            role: input.role,
            organisation: input.organisation,
            organisation_id: input.organisation_id,
        },
        agreement: input.agreement,
        discrepancy_notes: input.notes,
    };
    let hash = create_entry(&EntryTypes::CounterAttestation(counter))?;
    create_link(
        input.attestation_hash,
        hash.clone(),
        LinkTypes::AttestationToCounter,
        (),
    )?;
    get_record(hash)
}

// ---------------------------------------------------------------------------
// Key rotation
// ---------------------------------------------------------------------------

#[hdk_extern]
pub fn create_key_handoff(handoff: KeyHandoff) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    let old = get_record(handoff.old_membership_hash.clone())?;
    let proof: MembershipProof = old
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("old_membership_hash is not a membership proof"))?;
    if me != proof.agent_pubkey {
        return Err(guest("handoff must be signed by the old key"));
    }
    let hash = create_entry(&EntryTypes::KeyHandoff(handoff))?;
    get_record(hash)
}

#[hdk_extern]
pub fn accept_key_handoff(handoff_hash: ActionHash) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    let handoff_record = get_record(handoff_hash.clone())?;
    let handoff: KeyHandoff = handoff_record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("not a key handoff"))?;
    if me != handoff.new_key {
        return Err(guest("acceptance must be signed by the new key"));
    }
    let acceptance = KeyAcceptance {
        handoff_hash: handoff_hash.clone(),
    };
    let hash = create_entry(&EntryTypes::KeyAcceptance(acceptance))?;
    create_link(
        handoff_hash,
        hash.clone(),
        LinkTypes::HandoffToAcceptance,
        (),
    )?;
    get_record(hash)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CompleteRotationInput {
    pub handoff_hash: ActionHash,
    pub acceptance_hash: ActionHash,
    pub new_expires_at: Timestamp,
}

/// Called by the original issuer (or a root). Copies accreditation onto the
/// new key, points `predecessor_membership_hash` at the old proof, then
/// revokes the old proof with `KeyRotated`.
#[hdk_extern]
pub fn complete_key_rotation(input: CompleteRotationInput) -> ExternResult<Record> {
    let me = agent_info()?.agent_initial_pubkey;
    let props = DnaProperties::load()?;

    let hand_record = get_record(input.handoff_hash.clone())?;
    let handoff: KeyHandoff = hand_record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("not a key handoff"))?;
    let accept_record = get_record(input.acceptance_hash.clone())?;
    let acceptance: KeyAcceptance = accept_record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("not a key acceptance"))?;
    if acceptance.handoff_hash != input.handoff_hash {
        return Err(guest("acceptance does not match handoff"));
    }

    let old_record = get_record(handoff.old_membership_hash.clone())?;
    let old: MembershipProof = old_record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("old membership missing"))?;

    if me != old.issuer_agent && !props.is_root(&me) {
        return Err(guest("only the original issuer or a DNA root can complete rotation"));
    }

    let root_reissue = props.is_root(&me) && me != old.issuer_agent;
    let new_proof = MembershipProof {
        agent_pubkey: handoff.new_key.clone(),
        role: old.role.clone(),
        organisation: old.organisation.clone(),
        organisation_id: old.organisation_id.clone(),
        accreditation: old.accreditation.clone(),
        expires_at: input.new_expires_at,
        issuer_agent: me.clone(),
        issuer_membership_hash: if root_reissue {
            None
        } else {
            old.issuer_membership_hash.clone()
        },
        predecessor_membership_hash: Some(handoff.old_membership_hash.clone()),
        depth: if root_reissue { 1 } else { old.depth },
    };

    let new_record = issue_membership(new_proof)?;

    let _rev = revoke_membership(RevokeInput {
        membership_hash: handoff.old_membership_hash,
        grounds: RevocationGrounds::KeyRotated,
        evidence_hashes: vec![input.handoff_hash, input.acceptance_hash],
        notes: Some("key rotation".into()),
    })?;

    Ok(new_record)
}

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------

fn records_from_links(base: impl Into<AnyLinkableHash>, link_type: LinkTypes) -> ExternResult<Vec<Record>> {
    let links = get_links(
        LinkQuery::try_new(base, link_type)?, GetStrategy::default(),
    )?;
    let mut out = Vec::new();
    for link in links {
        if let Some(target) = link.target.into_action_hash() {
            if let Some(record) = get(target, GetOptions::default())? {
                out.push(record);
            }
        }
    }
    Ok(out)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SerialQuery {
    pub part_number: String,
    pub serial_number: String,
}

#[hdk_extern]
pub fn get_attestations_for_serial(q: SerialQuery) -> ExternResult<Vec<Record>> {
    records_from_links(
        serial_path_hash(&q.part_number, &q.serial_number)?,
        LinkTypes::SerialToAttestation,
    )
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DocumentQuery {
    pub document_type: DocumentType,
    pub document_id: String,
}

#[hdk_extern]
pub fn get_attestations_for_document(q: DocumentQuery) -> ExternResult<Vec<Record>> {
    records_from_links(
        document_path_hash(&q.document_type, &q.document_id)?,
        LinkTypes::DocumentToAttestation,
    )
}

#[hdk_extern]
pub fn get_memberships_for_agent(agent: AgentPubKey) -> ExternResult<Vec<Record>> {
    records_from_links(agent_path_hash(&agent)?, LinkTypes::AgentMembership)
}

#[hdk_extern]
pub fn get_revocations_for_agent(agent: AgentPubKey) -> ExternResult<Vec<Record>> {
    records_from_links(agent_path_hash(&agent)?, LinkTypes::AgentRevocation)
}

#[hdk_extern]
pub fn get_counters_for_attestation(attestation_hash: ActionHash) -> ExternResult<Vec<Record>> {
    records_from_links(attestation_hash, LinkTypes::AttestationToCounter)
}
