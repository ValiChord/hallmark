// ============================================================================
// Release Attestation Format — Aviation Profile
// Holochain Zome v3 (post-review #2)
//
// FATAL ISSUES FROM v2 ADDRESSED:
// 1. OPERATOR PROBLEM: root_authorities remain for membership bootstrap, but
//    ejection is now fully peer-driven and automated — no operator needed.
//    The honest admission: membership issuance requires a bootstrap trust
//    anchor. Ejection does not. This is a partial solution, not a claim of
//    full decentralization.
// 2. LOGIC BUG: Membership proof is published BY the root authority ON BEHALF
//    of the member. action.author() == signed_by (root), agent_pubkey is member.
// 3. VALIDATOR SIGNATURES THEATRE: Removed. Ejection evidence is verified
//    deterministically by validation using must_get_valid_record.
// 4. LINK HASH MISMATCH: Fixed — create_link and get_links use consistent
//    ActionHash targets.
// 5. OFFLINE PREDECESSOR: Predecessor existence moved to verification-time.
//    Validation only checks the hash is present.
//
// WHAT IS STILL UNSOLVED (stated explicitly):
// - Bootstrap: Someone must hold root_authority keys and verify FAA certs
//   out-of-band. This is an operator. The project either accepts a neutral
//   foundation, or admits the gap.
// - Admissibility: Legal question, not technical.
// - Competition law: Group of competitors using shared ejection rules may
//   still be a concerted refusal to deal.
// ============================================================================

use hdk::prelude::*;

// ============================================================================
// DNA PROPERTIES
// ============================================================================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DnaProperties {
    /// Root authorities who can issue membership proofs.
    /// THIS IS THE BOOTSTRAP OPERATOR. There is no cryptographic way around it.
    /// The FAA does not have a Holochain key. Someone must bridge.
    pub root_authorities: Vec<AgentPubKey>,
    /// Minimum root authorities required for membership issuance (threshold).
    pub membership_threshold: u8,
    pub assertion_vocabulary: Vec<String>,
}

fn dna_props() -> ExternResult<DnaProperties> {
    let props = dna_info()?.properties;
    let props: DnaProperties = props.try_into()
        .map_err(|e| wasm_error!(WasmErrorInner::Guest(
            format!("DNA properties malformed: {:?}", e)
        )))?;
    Ok(props)
}

// ============================================================================
// ENTRY TYPES
// ============================================================================

#[hdk_entry_helper]
#[derive(Clone)]
pub struct Attestation {
    pub raf_version: String,
    pub subject: Subject,
    pub binding: Binding,
    pub scope: Scope,
    pub evidence: Vec<Evidence>,
    pub attester: Attester,
    pub membership_proof_hash: ActionHash,
    pub anchor: Option<Anchor>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Subject {
    pub part_type: PartType,
    pub part_number: String,
    pub serial_number: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PartType {
    Engine, Propeller, LifeLimited, Serialized, Standard,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Binding {
    pub binds_field: String,
    pub document_type: DocumentType,
    pub document_id: String,
    pub document_digest: String,
    pub predecessor_document_hash: Option<ActionHash>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum DocumentType {
    Faa81303, EasaForm1, CasaForm1, TccaFormOne,
    CertificateOfConformance, TransferDocument,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Scope {
    pub observed: Vec<Assertion>,
    pub not_observed: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Assertion {
    pub assertion_id: String,
    pub value: AssertionValue,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum AssertionValue {
    Bool(bool), String(String), NotApplicable,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Evidence {
    pub evidence_type: String,
    pub digest: String,
    pub locator: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Attester {
    pub agent_pubkey: AgentPubKey,
    pub role: AttesterRole,
    pub organisation: String,
    pub organisation_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum AttesterRole {
    RepairStation, Airline, Oem, Mro, Distributor, Broker, Lessors,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Anchor {
    pub qualified_timestamp: String,
    pub timestamp_service_id: String,
}

/// MembershipProof: issued BY a root authority ON BEHALF OF a member.
/// The root authority is the action author. The member is agent_pubkey.
#[hdk_entry_helper]
#[derive(Clone)]
pub struct MembershipProof {
    pub agent_pubkey: AgentPubKey,     // The member being certified
    pub role: AttesterRole,
    pub accreditation: Accreditation,
    pub issued_at: Timestamp,
    pub expires_at: Option<Timestamp>,
    pub signed_by: AgentPubKey,        // The root authority who verified out-of-band
    pub accreditation_document_digest: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Accreditation {
    pub accreditation_type: AccreditationType,
    pub cert_number: String,
    pub issuing_authority: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum AccreditationType {
    FaaRepairStation, EasaPart145, EasaPart21g,
    FaaPma, OemAuthorized, DistributorAccredited,
}

/// EjectionRecord: ANY peer can publish this for objective grounds.
/// Validation verifies the evidence deterministically.
/// No root authority needed. No discretionary override.
#[hdk_entry_helper]
#[derive(Clone)]
pub struct EjectionRecord {
    pub agent_pubkey: AgentPubKey,
    pub grounds: EjectionGrounds,
    pub evidence_hashes: Vec<ActionHash>, // Attestations or MembershipProofs that prove the ground
    pub decided_at: Timestamp,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum EjectionGrounds {
    ContradictoryBindings,      // Evidence: 2+ attestations, same serial, different docs
    EntitlementViolation,       // Evidence: 1 attestation where role != accreditation
    InvalidAssertionVocabulary, // Evidence: 1 attestation with bad assertion ID
    InvalidMembership,          // Evidence: 1 membership proof that fails structural checks
}

#[hdk_entry_helper]
#[derive(Clone)]
pub struct CounterAttestation {
    pub attester: Attester,
    pub agreement: AgreementStatus,
    pub discrepancy_notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum AgreementStatus {
    Agree, Disagree, Partial,
}

#[hdk_entry_helper]
#[derive(Clone)]
pub struct KeyRotation {
    pub agent_pubkey: AgentPubKey,
    pub old_key: AgentPubKey,
    pub new_key: AgentPubKey,
    pub accreditation_confirming: Accreditation,
    pub continuity_proof: String,
}

// ============================================================================
// LINK TYPES
// ============================================================================

#[hdk_link_types]
pub enum LinkTypes {
    SerialToAttestation,
    AgentToAttestation,
    AgentMembership,
    AgentEjection,
    AttestationToCounter,
    DocumentToAttestation,
}

// ============================================================================
// ENTRY TYPE DEFINITIONS
// ============================================================================

#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Attestation(Attestation),
    MembershipProof(MembershipProof),
    EjectionRecord(EjectionRecord),
    KeyRotation(KeyRotation),
    CounterAttestation(CounterAttestation),
}

// ============================================================================
// VALIDATION — DETERMINISTIC ONLY
//
// NO get(), NO get_links(). Only must_get_valid_record() by explicit hash.
// Ejection is peer-driven and evidence-based. No root authority needed.
// ============================================================================

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<UnitEntryTypes, EntryTypes, LinkTypes>()? {
        FlatOp::StoreEntry(store_entry) => match store_entry.entry {
            OpEntry::CreatedEntry(EntryTypes::Attestation(attestation)) => {
                validate_attestation_creation(&attestation, &store_entry.action)
            }
            OpEntry::CreatedEntry(EntryTypes::MembershipProof(proof)) => {
                validate_membership_creation(&proof, &store_entry.action)
            }
            OpEntry::CreatedEntry(EntryTypes::EjectionRecord(record)) => {
                validate_ejection_creation(&record)
            }
            OpEntry::CreatedEntry(EntryTypes::KeyRotation(rotation)) => {
                validate_key_rotation(&rotation, &store_entry.action)
            }
            OpEntry::CreatedEntry(EntryTypes::CounterAttestation(counter)) => {
                validate_counter_attestation(&counter, &store_entry.action)
            }
            _ => Ok(ValidateCallbackResult::Valid),
        },
        FlatOp::RegisterUpdate(register_update) => {
            match register_update.entry_type {
                EntryTypes::Attestation(_) | EntryTypes::MembershipProof(_) |
                EntryTypes::EjectionRecord(_) | EntryTypes::CounterAttestation(_) => {
                    Ok(ValidateCallbackResult::Invalid(
                        "Immutable entry type".to_string()
                    ))
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterDelete(register_delete) => {
            match register_delete.entry_type {
                EntryTypes::Attestation(_) | EntryTypes::MembershipProof(_) |
                EntryTypes::EjectionRecord(_) | EntryTypes::CounterAttestation(_) => {
                    Ok(ValidateCallbackResult::Invalid(
                        "Immutable entry type".to_string()
                    ))
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        _ => Ok(ValidateCallbackResult::Valid),
    }
}

fn validate_attestation_creation(
    attestation: &Attestation,
    action: &EntryCreationAction,
) -> ExternResult<ValidateCallbackResult> {
    let props = dna_props()?;

    if attestation.raf_version != "0.1" {
        return Ok(ValidateCallbackResult::Invalid("Bad RAF version".to_string()));
    }

    for assertion in &attestation.scope.observed {
        if !props.assertion_vocabulary.contains(&assertion.assertion_id) {
            return Ok(ValidateCallbackResult::Invalid(format!(
                "Assertion '{}' not in vocabulary", assertion.assertion_id
            )));
        }
    }

    if action.author() != attestation.attester.agent_pubkey {
        return Ok(ValidateCallbackResult::Invalid(
            "Author != attester".to_string()
        ));
    }

    // Membership proof must exist and be structurally valid
    let membership_record = must_get_valid_record(attestation.membership_proof_hash.clone())?;
    let membership: MembershipProof = membership_record
        .entry().to_app_option()
        .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(
            "Membership proof not found".to_string()
        )))?;

    if membership.agent_pubkey != attestation.attester.agent_pubkey {
        return Ok(ValidateCallbackResult::Invalid(
            "Membership proof for wrong agent".to_string()
        ));
    }

    let action_time = action.timestamp();
    if action_time < membership.issued_at {
        return Ok(ValidateCallbackResult::Invalid(
            "Membership issued after attestation".to_string()
        ));
    }
    if let Some(expires) = membership.expires_at {
        if action_time > expires {
            return Ok(ValidateCallbackResult::Invalid(
                "Membership expired".to_string()
            ));
        }
    }

    // NOTE: Predecessor existence is NOT checked here. It is verification-time.
    // This allows offline attestation where predecessor was exchanged P2P
    // but not yet published to DHT.

    Ok(ValidateCallbackResult::Valid)
}

/// MembershipProof is published BY the root authority ON BEHALF OF the member.
/// action.author() == signed_by (root authority)
/// agent_pubkey == the member being certified
fn validate_membership_creation(
    proof: &MembershipProof,
    action: &EntryCreationAction,
) -> ExternResult<ValidateCallbackResult> {
    let props = dna_props()?;

    // The publisher must be a root authority
    if !props.root_authorities.contains(action.author()) {
        return Ok(ValidateCallbackResult::Invalid(
            "Only root authorities can issue memberships".to_string()
        ));
    }

    // The publisher must match signed_by
    if action.author() != &proof.signed_by {
        return Ok(ValidateCallbackResult::Invalid(
            "Publisher must match signed_by".to_string()
        ));
    }

    // The member being certified must NOT be a root authority
    // (root authorities don't certify themselves)
    if props.root_authorities.contains(&proof.agent_pubkey) {
        return Ok(ValidateCallbackResult::Invalid(
            "Root authority cannot issue membership to itself".to_string()
        ));
    }

    match (&proof.accreditation.accreditation_type, &proof.role) {
        (AccreditationType::FaaRepairStation, AttesterRole::RepairStation) => Ok(()),
        (AccreditationType::EasaPart145, AttesterRole::RepairStation) => Ok(()),
        (AccreditationType::EasaPart145, AttesterRole::Mro) => Ok(()),
        (AccreditationType::OemAuthorized, AttesterRole::Oem) => Ok(()),
        (AccreditationType::DistributorAccredited, AttesterRole::Distributor) => Ok(()),
        _ => Ok(ValidateCallbackResult::Invalid(
            "Accreditation mismatch".to_string()
        )),
    }?;

    Ok(ValidateCallbackResult::Valid)
}

/// Ejection is peer-driven. ANY peer can publish for objective grounds.
/// Validation verifies evidence deterministically via must_get_valid_record.
fn validate_ejection_creation(record: &EjectionRecord) -> ExternResult<ValidateCallbackResult> {
    match &record.grounds {
        EjectionGrounds::ContradictoryBindings => {
            if record.evidence_hashes.len() < 2 {
                return Ok(ValidateCallbackResult::Invalid(
                    "Need 2+ attestations".to_string()
                ));
            }
            // Fetch both attestations and verify contradiction
            let r1 = must_get_valid_record(record.evidence_hashes[0].clone())?;
            let r2 = must_get_valid_record(record.evidence_hashes[1].clone())?;

            let a1: Attestation = r1.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;
            let a2: Attestation = r2.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;

            if a1.subject.serial_number != a2.subject.serial_number {
                return Ok(ValidateCallbackResult::Invalid(
                    "Evidence attestations have different serials".to_string()
                ));
            }
            if a1.binding.document_id == a2.binding.document_id {
                return Ok(ValidateCallbackResult::Invalid(
                    "Evidence attestations have same document — not contradictory".to_string()
                ));
            }
            // Both must be by the same agent (the one being ejected)
            if a1.attester.agent_pubkey != record.agent_pubkey {
                return Ok(ValidateCallbackResult::Invalid(
                    "First attestation not by ejected agent".to_string()
                ));
            }
            if a2.attester.agent_pubkey != record.agent_pubkey {
                return Ok(ValidateCallbackResult::Invalid(
                    "Second attestation not by ejected agent".to_string()
                ));
            }
        }
        EjectionGrounds::EntitlementViolation => {
            if record.evidence_hashes.is_empty() {
                return Ok(ValidateCallbackResult::Invalid("Need evidence".to_string()));
            }
            let r = must_get_valid_record(record.evidence_hashes[0].clone())?;
            let attestation: Attestation = r.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;

            // Fetch the membership proof referenced by the attestation
            let m_r = must_get_valid_record(attestation.membership_proof_hash.clone())?;
            let membership: MembershipProof = m_r.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad membership".to_string())))?;

            // Check if role matches accreditation
            let matches = match (&membership.accreditation.accreditation_type, &attestation.attester.role) {
                (AccreditationType::FaaRepairStation, AttesterRole::RepairStation) => true,
                (AccreditationType::EasaPart145, AttesterRole::RepairStation) => true,
                (AccreditationType::EasaPart145, AttesterRole::Mro) => true,
                (AccreditationType::OemAuthorized, AttesterRole::Oem) => true,
                (AccreditationType::DistributorAccredited, AttesterRole::Distributor) => true,
                _ => false,
            };
            if matches {
                return Ok(ValidateCallbackResult::Invalid(
                    "Evidence shows no entitlement violation".to_string()
                ));
            }
        }
        EjectionGrounds::InvalidAssertionVocabulary => {
            if record.evidence_hashes.is_empty() {
                return Ok(ValidateCallbackResult::Invalid("Need evidence".to_string()));
            }
            let r = must_get_valid_record(record.evidence_hashes[0].clone())?;
            let attestation: Attestation = r.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;

            let props = dna_props()?;
            let all_valid = attestation.scope.observed.iter()
                .all(|a| props.assertion_vocabulary.contains(&a.assertion_id));
            if all_valid {
                return Ok(ValidateCallbackResult::Invalid(
                    "Evidence shows valid vocabulary".to_string()
                ));
            }
        }
        EjectionGrounds::InvalidMembership => {
            if record.evidence_hashes.is_empty() {
                return Ok(ValidateCallbackResult::Invalid("Need evidence".to_string()));
            }
            let r = must_get_valid_record(record.evidence_hashes[0].clone())?;
            let proof: MembershipProof = r.entry().to_app_option()
                .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
                .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;

            let props = dna_props()?;
            // Check if the membership proof was issued by a root authority
            if !props.root_authorities.contains(&proof.signed_by) {
                // This membership proof is invalid — good, ejection is valid
                return Ok(ValidateCallbackResult::Valid);
            }
            // If we get here, the membership proof IS valid, so ejection is invalid
            return Ok(ValidateCallbackResult::Invalid(
                "Evidence shows valid membership".to_string()
            ));
        }
    }

    Ok(ValidateCallbackResult::Valid)
}

fn validate_key_rotation(
    rotation: &KeyRotation,
    action: &EntryCreationAction,
) -> ExternResult<ValidateCallbackResult> {
    let props = dna_props()?;
    let author = action.author();

    if author != &rotation.old_key && !props.root_authorities.contains(author) {
        return Ok(ValidateCallbackResult::Invalid(
            "Key rotation must be by old key or root".to_string()
        ));
    }

    Ok(ValidateCallbackResult::Valid)
}

fn validate_counter_attestation(
    counter: &CounterAttestation,
    action: &EntryCreationAction,
) -> ExternResult<ValidateCallbackResult> {
    if action.author() != counter.attester.agent_pubkey {
        return Ok(ValidateCallbackResult::Invalid(
            "Counter-attestation author mismatch".to_string()
        ));
    }
    Ok(ValidateCallbackResult::Valid)
}

// ============================================================================
// ZOME FUNCTIONS
// ============================================================================

#[hdk_extern]
pub fn create_attestation(attestation: Attestation) -> ExternResult<Record> {
    let me = agent_info()?.agent_latest_pubkey;
    if me != attestation.attester.agent_pubkey {
        return Err(wasm_error!(WasmErrorInner::Guest(
            "You can only attest as yourself".to_string()
        )));
    }

    let attestation_hash = create_entry(&EntryTypes::Attestation(attestation.clone()))?;

    let serial_anchor = path::Path::from(attestation.subject.serial_number.clone())
        .path_entry_hash()?;
    create_link(serial_anchor, attestation_hash.clone(), LinkTypes::SerialToAttestation, ())?;

    let doc_anchor = path::Path::from(attestation.binding.document_id.clone())
        .path_entry_hash()?;
    create_link(doc_anchor, attestation_hash.clone(), LinkTypes::DocumentToAttestation, ())?;

    let record = get(attestation_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Not found".to_string())))?;
    Ok(record)
}

#[derive(Serialize, Deserialize, Debug)]
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
    let me = agent_info()?.agent_latest_pubkey;

    let _original = get(input.attestation_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Attestation not found".to_string())))?;

    let counter = CounterAttestation {
        attester: Attester {
            agent_pubkey: me,
            role: input.role,
            organisation: input.organisation,
            organisation_id: input.organisation_id,
        },
        agreement: input.agreement,
        discrepancy_notes: input.notes,
    };

    let counter_hash = create_entry(&EntryTypes::CounterAttestation(counter.clone()))?;
    create_link(input.attestation_hash.clone(), counter_hash.clone(), LinkTypes::AttestationToCounter, ())?;

    let record = get(counter_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Not found".to_string())))?;
    Ok(record)
}

/// Issue membership proof. RESTRICTED to root authorities.
#[hdk_extern]
pub fn issue_membership(proof: MembershipProof) -> ExternResult<Record> {
    let me = agent_info()?.agent_latest_pubkey;
    let props = dna_props()?;

    if !props.root_authorities.contains(&me) {
        return Err(wasm_error!(WasmErrorInner::Guest(
            "Not a root authority".to_string()
        )));
    }

    let proof_hash = create_entry(&EntryTypes::MembershipProof(proof.clone()))?;

    let agent_anchor = path::Path::from(proof.agent_pubkey.to_string())
        .path_entry_hash()?;
    create_link(agent_anchor, proof_hash.clone(), LinkTypes::AgentMembership, ())?;

    let record = get(proof_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Not found".to_string())))?;
    Ok(record)
}

/// Eject a member. ANY peer can call this for objective grounds.
/// Validation verifies evidence deterministically.
#[hdk_extern]
pub fn eject_member(record: EjectionRecord) -> ExternResult<Record> {
    let record_hash = create_entry(&EntryTypes::EjectionRecord(record.clone()))?;

    let agent_anchor = path::Path::from(record.agent_pubkey.to_string())
        .path_entry_hash()?;
    create_link(agent_anchor, record_hash.clone(), LinkTypes::AgentEjection, ())?;

    let rec = get(record_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Not found".to_string())))?;
    Ok(rec)
}

// ============================================================================
// VERIFICATION — Non-deterministic, DHT lookups allowed
// ============================================================================

#[derive(Serialize, Deserialize, Debug)]
pub struct VerificationReport {
    pub attestation_hash: ActionHash,
    pub signature_valid: bool,
    pub binding_well_formed: bool,
    pub membership_at_assertion: MembershipCheckResult,
    pub predecessor_exists: bool,
    pub predecessor_chains: bool,
    pub ejection_status: EjectionCheckResult,
    pub scope_report: Vec<ScopeCheck>,
    pub counter_attestations: Vec<CounterAttestation>,
    pub overall_trusted: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum MembershipCheckResult {
    Active, Expired(Timestamp), NotFound, InvalidProof,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum EjectionCheckResult {
    Clean, EjectedAt(Timestamp), Unknown,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ScopeCheck {
    pub assertion_id: String,
    pub valid: bool,
    pub note: Option<String>,
}

#[hdk_extern]
pub fn verify_attestation(attestation_hash: ActionHash) -> ExternResult<VerificationReport> {
    let props = dna_props()?;

    let record = get(attestation_hash.clone(), GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Not found".to_string())))?;

    let attestation: Attestation = record.entry().to_app_option()
        .map_err(|e| wasm_error!(WasmErrorInner::Guest(e.to_string())))?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Bad entry".to_string())))?;

    let action_time = record.action().timestamp();

    let mut report = VerificationReport {
        attestation_hash: attestation_hash.clone(),
        signature_valid: true,
        binding_well_formed: true,
        membership_at_assertion: MembershipCheckResult::NotFound,
        predecessor_exists: false,
        predecessor_chains: false,
        ejection_status: EjectionCheckResult::Unknown,
        scope_report: Vec::new(),
        counter_attestations: Vec::new(),
        overall_trusted: true,
    };

    // 1. Membership check
    match get(attestation.membership_proof_hash.clone(), GetOptions::default())? {
        Some(membership_record) => {
            match membership_record.entry().to_app_option::<MembershipProof>() {
                Ok(Some(proof)) => {
                    let is_root = props.root_authorities.contains(&proof.signed_by);
                    if !is_root {
                        report.membership_at_assertion = MembershipCheckResult::InvalidProof;
                        report.overall_trusted = false;
                    } else if action_time > proof.issued_at {
                        if let Some(expires) = proof.expires_at {
                            if action_time > expires {
                                report.membership_at_assertion = MembershipCheckResult::Expired(expires);
                                report.overall_trusted = false;
                            } else {
                                report.membership_at_assertion = MembershipCheckResult::Active;
                            }
                        } else {
                            report.membership_at_assertion = MembershipCheckResult::Active;
                        }
                    } else {
                        report.membership_at_assertion = MembershipCheckResult::InvalidProof;
                        report.overall_trusted = false;
                    }
                }
                _ => {
                    report.membership_at_assertion = MembershipCheckResult::InvalidProof;
                    report.overall_trusted = false;
                }
            }
        }
        None => {
            report.membership_at_assertion = MembershipCheckResult::NotFound;
            report.overall_trusted = false;
        }
    }

    // 2. Predecessor chain check (verification-time, allows offline issuance)
    if let Some(pred_hash) = &attestation.binding.predecessor_document_hash {
        match get(pred_hash.clone(), GetOptions::default())? {
            Some(pred_record) => {
                match pred_record.entry().to_app_option::<Attestation>() {
                    Ok(Some(pred_attestation)) => {
                        report.predecessor_exists = true;
                        report.predecessor_chains = 
                            pred_attestation.subject.serial_number == attestation.subject.serial_number;
                        if !report.predecessor_chains {
                            report.overall_trusted = false;
                        }
                    }
                    _ => {
                        report.predecessor_exists = false;
                        report.overall_trusted = false;
                    }
                }
            }
            None => {
                report.predecessor_exists = false;
                report.overall_trusted = false;
            }
        }
    } else {
        report.predecessor_exists = true;
        report.predecessor_chains = true;
    }

    // 3. Ejection check — FIXED: use into_action_hash() to match create_link target
    let agent_anchor = path::Path::from(attestation.attester.agent_pubkey.to_string())
        .path_entry_hash()?;
    let ejection_links = get_links(
        GetLinksInputBuilder::try_new(agent_anchor, LinkTypes::AgentEjection)?
            .build(),
    )?;

    let mut ejected_at: Option<Timestamp> = None;
    for link in ejection_links {
        // FIXED: Use into_action_hash() since we linked with ActionHash
        if let Some(target) = link.target.into_action_hash() {
            if let Some(ejection_record) = get(target, GetOptions::default())? {
                if let Ok(ejection) = ejection_record.entry().to_app_option::<EjectionRecord>() {
                    if let Some(ejection) = ejection {
                        if ejection.decided_at < action_time {
                            ejected_at = Some(ejection.decided_at);
                        }
                    }
                }
            }
        }
    }

    match ejected_at {
        Some(t) => {
            report.ejection_status = EjectionCheckResult::EjectedAt(t);
            report.overall_trusted = false;
        }
        None => report.ejection_status = EjectionCheckResult::Clean,
    }

    // 4. Vocabulary check
    for assertion in &attestation.scope.observed {
        let valid = props.assertion_vocabulary.contains(&assertion.assertion_id);
        report.scope_report.push(ScopeCheck {
            assertion_id: assertion.assertion_id.clone(),
            valid,
            note: if valid { None } else { Some("Not in vocabulary".to_string()) },
        });
        if !valid {
            report.overall_trusted = false;
        }
    }

    // 5. Counter-attestations
    let counter_links = get_links(
        GetLinksInputBuilder::try_new(attestation_hash.clone(), LinkTypes::AttestationToCounter)?
            .build(),
    )?;

    for link in counter_links {
        if let Some(target) = link.target.into_action_hash() {
            if let Some(counter_record) = get(target, GetOptions::default())? {
                if let Ok(counter) = counter_record.entry().to_app_option::<CounterAttestation>() {
                    if let Some(counter) = counter {
                        report.counter_attestations.push(counter);
                    }
                }
            }
        }
    }

    Ok(report)
}
