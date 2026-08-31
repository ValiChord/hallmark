use hdi::prelude::*;

pub const RAF_VERSION: &str = "0.1";

pub const BINDS_SERIAL: &str = "serial_number";
pub const BINDS_PART: &str = "part_number";
pub const BINDS_BOTH: &str = "serial_and_part";

// ---------------------------------------------------------------------------
// Attestation
// ---------------------------------------------------------------------------

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
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

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Subject {
    pub part_type: PartType,
    pub part_number: String,
    pub serial_number: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum PartType {
    Engine,
    Propeller,
    LifeLimited,
    Serialized,
    Standard,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Binding {
    /// One of `serial_number`, `part_number`, `serial_and_part`.
    pub binds_field: String,
    pub document_type: DocumentType,
    pub document_id: String,
    /// Hex or base64 digest of the source document. Algorithm is implied by
    /// length; validators only require a non-trivial digest, not a particular
    /// codec. Relying parties recompute against the document they hold.
    pub document_digest: String,
    pub predecessor_document_hash: Option<ActionHash>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum DocumentType {
    Faa81303,
    EasaForm1,
    CasaForm1,
    TccaFormOne,
    CertificateOfConformance,
    TransferDocument,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Scope {
    pub observed: Vec<Assertion>,
    /// Assertion ids from the vocabulary that were in scope but not claimed.
    pub not_observed: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Assertion {
    pub assertion_id: String,
    pub value: AssertionValue,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum AssertionValue {
    Bool(bool),
    String(String),
    NotApplicable,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct Evidence {
    pub evidence_type: String,
    pub digest: String,
    pub locator: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Attester {
    pub agent_pubkey: AgentPubKey,
    pub role: AttesterRole,
    pub organisation: String,
    pub organisation_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum AttesterRole {
    RepairStation,
    Airline,
    Oem,
    Mro,
    Distributor,
    Broker,
    Lessor,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct Anchor {
    pub qualified_timestamp: String,
    pub timestamp_service_id: String,
}

// ---------------------------------------------------------------------------
// Membership — the capability. Issuance time is the Create action timestamp.
// ---------------------------------------------------------------------------

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct MembershipProof {
    pub agent_pubkey: AgentPubKey,
    pub role: AttesterRole,
    pub organisation: String,
    pub organisation_id: String,
    pub accreditation: Accreditation,
    pub expires_at: Timestamp,
    pub issuer_agent: AgentPubKey,
    /// `None` iff the issuer is a DNA root (`initial_members`).
    pub issuer_membership_hash: Option<ActionHash>,
    /// Set when this proof replaces a rotated key's membership. Lets
    /// `DuplicateCertIssuance` distinguish rotation from double-granting.
    pub predecessor_membership_hash: Option<ActionHash>,
    pub depth: u8,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct Accreditation {
    pub accreditation_type: AccreditationType,
    pub cert_number: String,
    pub issuing_authority: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum AccreditationType {
    FaaRepairStation,
    EasaPart145,
    EasaPart21g,
    FaaPma,
    OemAuthorized,
    DistributorAccredited,
}

// ---------------------------------------------------------------------------
// Revocation — a Create, not an Update, so a third party can author it.
// ---------------------------------------------------------------------------

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct MembershipRevocation {
    /// Membership being revoked (not the agent — an agent may have later proofs).
    pub membership_hash: ActionHash,
    pub agent_pubkey: AgentPubKey,
    pub grounds: RevocationGrounds,
    pub evidence_hashes: Vec<ActionHash>,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum RevocationGrounds {
    /// Same `document_type` + `document_id` on two attestations by this agent.
    DuplicateDocument,
    /// Same part+serial, same assertion id, different values, and neither
    /// attestation lists the other as predecessor (so it is not a supersede).
    ConflictingAssertions { assertion_id: String },
    /// Same cert_number + issuing_authority granted to two different agents
    /// with overlapping validity, and neither membership is a key-rotation
    /// predecessor of the other.
    DuplicateCertIssuance,
    /// Root or original issuer pulling a capability. No evidence hashes required.
    Administrative,
    /// Old membership retired as part of a completed key rotation.
    KeyRotated,
}

// ---------------------------------------------------------------------------
// Key rotation — two signatures, two agents.
// ---------------------------------------------------------------------------

/// Authored by the old key.
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct KeyHandoff {
    pub old_membership_hash: ActionHash,
    pub new_key: AgentPubKey,
}

/// Authored by the new key.
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct KeyAcceptance {
    pub handoff_hash: ActionHash,
}

// ---------------------------------------------------------------------------
// Counter-attestation — no membership required (airlines, lessors, brokers).
// ---------------------------------------------------------------------------

#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct CounterAttestation {
    pub attester: Attester,
    pub agreement: AgreementStatus,
    pub discrepancy_notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum AgreementStatus {
    Agree,
    Disagree,
    Partial,
}

/// Role ↔ accreditation. Airline / Broker / Lessor are counter-only.
pub fn role_matches_accreditation(accred: &AccreditationType, role: &AttesterRole) -> bool {
    use AccreditationType::*;
    use AttesterRole::*;
    matches!(
        (accred, role),
        (FaaRepairStation, RepairStation)
            | (EasaPart145, RepairStation)
            | (EasaPart145, Mro)
            | (OemAuthorized, Oem)
            | (DistributorAccredited, Distributor)
            | (FaaPma, Oem)
            | (EasaPart21g, Oem)
    )
}

/// Non-root issuers may only grant along this matrix. Roots may grant any
/// mapped accreditation. With `max_delegation_depth: 2` the live path is
/// `root → OEM → shop/distributor`.
pub fn allowed_new_accreditation(issuer: &AccreditationType, new: &AccreditationType) -> bool {
    use AccreditationType::*;
    matches!(
        (issuer, new),
        (OemAuthorized, DistributorAccredited)
            | (OemAuthorized, FaaRepairStation)
            | (OemAuthorized, EasaPart145)
    )
}
