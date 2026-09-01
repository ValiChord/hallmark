export const RAF_VERSION = "0.1";

export const BINDS_FIELDS = ["serial_number", "part_number", "serial_and_part"] as const;
export type BindsField = (typeof BINDS_FIELDS)[number];

/**
 * Which set of certification blocks a record represents.
 *
 * FAA Form 8130-3 carries two mutually exclusive certification block sets, and
 * the regulator treats them as different documents with different rules,
 * different signers and different Block 11 vocabularies. Each side's guidance
 * tells the signer to shade out the other side's blocks, and both forbid a
 * mixture of production- and maintenance-released items on one form.
 */
export const CERTIFICATION_PATHS = ["AirworthinessApproval", "ReturnToService"] as const;
export type CertificationPath = (typeof CERTIFICATION_PATHS)[number];

/**
 * Block 11 (Status/Work) terms, **partitioned by certification path**.
 *
 * These are no longer provisional. Both lists are taken verbatim from the
 * regulator, and both documents were reissued in September 2025:
 *
 * - Blocks 13a–13e — FAA Order 8130.21J (25 Sep 2025) ¶11.k: "Enter one of the
 *   terms below." Closed and mandatory.
 * - Blocks 14a–14e — AC 43-9D (22 Sep 2025) Table B-1: "The following table
 *   describes what to enter in a specific situation… The use of upper case or
 *   lowercase in this block does not matter." Enumerated but advisory, and the
 *   table's note adds: "The applicable standard must be described in block 12."
 *
 * EASA's equivalents differ — its production list is PROTOTYPE/NEW only, and it
 * combines "Inspected/Tested" into one term. That is why the live vocabulary is
 * a DNA property rather than this constant: a different regulator is a different
 * install, not a different build. These are the FAA defaults.
 *
 * LIFE_LIMITED_SCRAP used to be here and is gone. It is in neither regulator's
 * list, and a release certificate is the wrong instrument: EASA AMC1 145.A.50(d)
 * says a certificate "should not be issued for any item when it is known that
 * the item is unserviceable".
 */
export const AIRWORTHINESS_VOCABULARY = ["NEW", "PROTOTYPE", "USED"] as const;
export const RETURN_TO_SERVICE_VOCABULARY = [
  "OVERHAULED",
  "REPAIRED",
  "INSPECTED",
  "TESTED",
  "MODIFIED",
] as const;

/** Every term, for display only. Validation always uses one path's list. */
export const ASSERTION_VOCABULARY = [
  ...AIRWORTHINESS_VOCABULARY,
  ...RETURN_TO_SERVICE_VOCABULARY,
] as const;
export type AssertionId = (typeof ASSERTION_VOCABULARY)[number];

export function vocabularyFor(dna: DnaProperties, path: CertificationPath): string[] {
  return path === "AirworthinessApproval"
    ? dna.airworthinessVocabulary
    : dna.returnToServiceVocabulary;
}

export const PART_TYPES = [
  "Engine",
  "Propeller",
  "LifeLimited",
  "Serialized",
  "Standard",
] as const;
export type PartType = (typeof PART_TYPES)[number];

export const DOCUMENT_TYPES = [
  "Faa81303",
  "EasaForm1",
  "CasaForm1",
  "TccaFormOne",
  "CertificateOfConformance",
  "TransferDocument",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const ATTESTER_ROLES = [
  "RepairStation",
  "Airline",
  "Oem",
  "Mro",
  "Distributor",
  "Broker",
  "Lessor",
] as const;
export type AttesterRole = (typeof ATTESTER_ROLES)[number];

export const ACCREDITATION_TYPES = [
  "FaaRepairStation",
  "EasaPart145",
  "EasaPart21g",
  "FaaPma",
  "OemAuthorized",
  "DistributorAccredited",
] as const;
export type AccreditationType = (typeof ACCREDITATION_TYPES)[number];

export const AGREEMENT_STATUSES = ["Agree", "Disagree", "Partial"] as const;
export type AgreementStatus = (typeof AGREEMENT_STATUSES)[number];

export type AssertionValue =
  | { kind: "Bool"; value: boolean }
  | { kind: "String"; value: string }
  | { kind: "NotApplicable" };

export type Assertion = {
  assertionId: string;
  value: AssertionValue;
};

export type Evidence = {
  evidenceType: string;
  digest: string;
  locator?: string;
};

export type Attester = {
  agentPubkey: string;
  role: AttesterRole;
  organisation: string;
  organisationId: string;
};

export type Subject = {
  partType: PartType;
  partNumber: string;
  serialNumber: string;
  description: string;
};

export type Binding = {
  /** Which certification block set this record represents. Governs the
   *  permitted vocabulary, who may sign, and whether a predecessor is allowed. */
  certificationPath: CertificationPath;
  bindsField: BindsField;
  documentType: DocumentType;
  documentId: string;
  documentDigest: string;
  predecessorDocumentHash?: string;
};

export type Attestation = {
  rafVersion: string;
  subject: Subject;
  binding: Binding;
  scope: { observed: Assertion[]; notObserved: string[] };
  evidence: Evidence[];
  attester: Attester;
  membershipProofHash: string;
};

export type Accreditation = {
  accreditationType: AccreditationType;
  certNumber: string;
  issuingAuthority: string;
};

export type MembershipProof = {
  agentPubkey: string;
  role: AttesterRole;
  organisation: string;
  organisationId: string;
  accreditation: Accreditation;
  expiresAt: number;
  issuerAgent: string;
  issuerMembershipHash?: string;
  predecessorMembershipHash?: string;
  /** The KeyHandoff, authored by the key being replaced. */
  rotationHandoffHash?: string;
  /** The KeyAcceptance, authored by the key replacing it. */
  rotationAcceptanceHash?: string;
  depth: number;
};

export type RevocationGrounds =
  | { kind: "DuplicateDocument" }
  | { kind: "ConflictingAssertions"; assertionId: string }
  | { kind: "DuplicateCertIssuance" }
  | { kind: "Administrative" }
  | { kind: "KeyRotated" };

export type MembershipRevocation = {
  membershipHash: string;
  agentPubkey: string;
  grounds: RevocationGrounds;
  evidenceHashes: string[];
  notes?: string;
};

export type KeyHandoff = {
  oldMembershipHash: string;
  newKey: string;
};

export type KeyAcceptance = {
  handoffHash: string;
};

export type CounterAttestation = {
  /** The attestation this counters. Named in the entry, not just the link. */
  attestationHash: string;
  attester: Attester;
  agreement: AgreementStatus;
  discrepancyNotes?: string;
};

export type Entry =
  | { type: "Attestation"; value: Attestation }
  | { type: "MembershipProof"; value: MembershipProof }
  | { type: "MembershipRevocation"; value: MembershipRevocation }
  | { type: "KeyHandoff"; value: KeyHandoff }
  | { type: "KeyAcceptance"; value: KeyAcceptance }
  | { type: "CounterAttestation"; value: CounterAttestation };

export type LinkType =
  | "SerialToAttestation"
  | "DocumentToAttestation"
  | "AgentMembership"
  | "AgentRevocation"
  | "MembershipToRevocation"
  | "AttestationToCounter"
  | "HandoffToAcceptance";

export type DhtRecord = {
  hash: string;
  author: string;
  timestamp: number;
  entry: Entry;
};

export type DhtLink = {
  base: string;
  target: string;
  type: LinkType;
  author: string;
};

export type Agent = {
  pubkey: string;
  name: string;
  organisation: string;
  organisationId: string;
  isRoot: boolean;
};

export type DnaProperties = {
  initialMembers: string[];
  /** Blocks 13a-13e. Closed and mandatory (8130.21J para 11.k). */
  airworthinessVocabulary: string[];
  /** Blocks 14a-14e. Enumerated, advisory in the source (AC 43-9D Table B-1). */
  returnToServiceVocabulary: string[];
  maxDelegationDepth: number;
  maxMembershipTtlMs: number;
};

export const DEFAULT_DNA: DnaProperties = {
  initialMembers: [],
  airworthinessVocabulary: [...AIRWORTHINESS_VOCABULARY],
  returnToServiceVocabulary: [...RETURN_TO_SERVICE_VOCABULARY],
  maxDelegationDepth: 2,
  maxMembershipTtlMs: 365 * 24 * 60 * 60 * 1000,
};

/**
 * Which certification path an accreditation may sign.
 *
 * - **Blocks 13** need a production approval: FAA production approval holder
 *   (14 CFR §21.137(o)), or EASA Part-21 production organisation (21.A.163).
 * - **Blocks 14** need maintenance authority: AC 43-9D — "Only those persons
 *   authorized by 14 CFR §43.7(b)-(e) may issue FAA Form 8130-3 for approval for
 *   return to service" — or EASA Part-145 certifying staff (145.A.50).
 *
 * A distributor holds neither: re-issuing a form with a traceability statement
 * (8130.21J ¶11.l(2)) is not certifying the article.
 *
 * The regulations partition this by construction rather than by prohibition —
 * no sentence says "NEW is forbidden in block 14". It follows from each
 * appendix declaring its own list exhaustive for its own purpose, each shading
 * out the other block set, and both forbidding a mixture on one certificate.
 */
export function accreditationMaySign(
  accred: AccreditationType,
  path: CertificationPath,
): boolean {
  switch (accred) {
    case "FaaPma":
    case "EasaPart21g":
    case "OemAuthorized":
      return path === "AirworthinessApproval";
    case "FaaRepairStation":
    case "EasaPart145":
      return path === "ReturnToService";
    case "DistributorAccredited":
      return false;
  }
}

export function roleMatchesAccreditation(
  accred: AccreditationType,
  role: AttesterRole,
): boolean {
  switch (accred) {
    case "FaaRepairStation":
      return role === "RepairStation";
    case "EasaPart145":
      return role === "RepairStation" || role === "Mro";
    case "OemAuthorized":
    case "FaaPma":
    case "EasaPart21g":
      return role === "Oem";
    case "DistributorAccredited":
      return role === "Distributor";
  }
}

export function allowedNewAccreditation(
  issuer: AccreditationType,
  next: AccreditationType,
): boolean {
  return (
    issuer === "OemAuthorized" &&
    (next === "DistributorAccredited" ||
      next === "FaaRepairStation" ||
      next === "EasaPart145")
  );
}

export function assertionValueEqual(a: AssertionValue, b: AssertionValue): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "Bool" && b.kind === "Bool") return a.value === b.value;
  if (a.kind === "String" && b.kind === "String") return a.value === b.value;
  return true;
}

export function formatAssertionValue(v: AssertionValue): string {
  if (v.kind === "Bool") return v.value ? "true" : "false";
  if (v.kind === "String") return v.value;
  return "n/a";
}

export function groundsLabel(g: RevocationGrounds): string {
  switch (g.kind) {
    case "DuplicateDocument":
      return "Duplicate document";
    case "ConflictingAssertions":
      return `Conflicting ${g.assertionId}`;
    case "DuplicateCertIssuance":
      return "Duplicate cert issuance";
    case "Administrative":
      return "Administrative";
    case "KeyRotated":
      return "Key rotated";
  }
}
