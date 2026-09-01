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

/// Which certification path of the release certificate this record represents.
///
/// FAA Form 8130-3 carries two mutually exclusive certification block sets, and
/// the regulator treats them as different documents with different rules,
/// different signers and different Block 11 vocabularies:
///
/// - **Blocks 13a–13e, Airworthiness Approval.** FAA Order 8130.21J (25 Sep
///   2025), which covers only articles produced under 14 CFR part 21.
/// - **Blocks 14a–14e, Approval for Return to Service.** AC 43-9D (22 Sep
///   2025), for work performed under 14 CFR part 43.
///
/// They may not both appear on one form: AC 43-9D ¶B.13 tells the maintenance
/// signer to "Shade, darken, or otherwise mark" blocks 13a–13e "to preclude
/// inadvertent or unauthorized use", 8130.21J ¶11.r says the same of 14a–14e,
/// and ¶8.k(3) forbids "release of a mixture of production- and
/// maintenance-released" articles on one form.
///
/// Until 2026-09-01 this distinction lived only in the demo's two pages. It is
/// now part of the record, because a verifier that cannot tell the paths apart
/// cannot apply either path's rules.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub enum CertificationPath {
    /// Blocks 13a–13e. A production approval holder releasing what it made.
    AirworthinessApproval,
    /// Blocks 14a–14e. Work under part 43, released by a §43.7(b)–(e) person.
    ReturnToService,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Binding {
    /// Which set of certification blocks this record represents. Governs the
    /// permitted vocabulary, who may sign, and whether a predecessor is allowed.
    pub certification_path: CertificationPath,
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
    ///
    /// Because that ground *exempts* anything claiming to be a rotation, this
    /// field is exactly what a corrupt issuer would set to grant one certificate
    /// to two agents and immunise the double-grant. So a rotation must prove the
    /// old key consented: the two fields below are required whenever this is
    /// `Some`, and validation checks the handoff was authored by the key being
    /// replaced and the acceptance by the key replacing it.
    pub predecessor_membership_hash: Option<ActionHash>,
    /// The `KeyHandoff`, authored by the key being replaced.
    pub rotation_handoff_hash: Option<ActionHash>,
    /// The `KeyAcceptance`, authored by the key replacing it.
    pub rotation_acceptance_hash: Option<ActionHash>,
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
    /// The attestation this counters. Without it the entry names no target and
    /// the binding lives only in the link, so one counter could be linked onto
    /// unlimited attestations - a broker filing a single Disagree against every
    /// attestation a competitor ever published.
    pub attestation_hash: ActionHash,
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

/// Which certification path an accreditation may sign.
///
/// The two paths have different signer populations, and neither regulator lets
/// one accreditation cover both:
///
/// - **Airworthiness approval (blocks 13).** A production approval. FAA: a
///   production approval holder issuing under 14 CFR §21.137(o). EASA: a Part-21
///   production organisation under 21.A.163, or 21.A.130 with competent-authority
///   validation.
/// - **Return to service (blocks 14).** AC 43-9D: "Only those persons authorized
///   by 14 CFR §43.7(b)-(e) may issue FAA Form 8130-3 for approval for return to
///   service." EASA: Part-145 certifying staff under 145.A.50.
///
/// A distributor holds neither. Under 8130.21J ¶11.l(2) a distributor re-issuing
/// a form adds a traceability statement naming the producer — it does not
/// certify the article itself, so it signs no certification block here.
///
/// Honest caveat: the regulations partition this **by construction rather than
/// by prohibition**. No sentence says "NEW is forbidden in block 14". The
/// partition follows from each appendix declaring its own list exhaustive for
/// its own purpose, each shading out the other block set, and both forbidding a
/// mixture of production- and maintenance-released items on one certificate.
pub fn accreditation_may_sign(accred: &AccreditationType, path: &CertificationPath) -> bool {
    use AccreditationType::*;
    use CertificationPath::*;
    matches!(
        (accred, path),
        (FaaPma, AirworthinessApproval)
            | (EasaPart21g, AirworthinessApproval)
            | (OemAuthorized, AirworthinessApproval)
            | (FaaRepairStation, ReturnToService)
            | (EasaPart145, ReturnToService)
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
