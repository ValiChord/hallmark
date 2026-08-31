export const RAF_VERSION = "0.1";

export const BINDS_FIELDS = ["serial_number", "part_number", "serial_and_part"] as const;
export type BindsField = (typeof BINDS_FIELDS)[number];

/**
 * Status/work terms, the Block 11 field on FAA Form 8130-3.
 *
 * ⚠️ PROVISIONAL. FAA Order 8130.21J §4-1(k) defines Block 11 for the *airworthiness
 * approval* path as exactly three terms — NEW, PROTOTYPE, USED. The *return to service*
 * path this demo models is governed by AC 43-9 instead, where INSPECTED and TESTED are
 * documented (FAA 8130-3 Q&A, Q32: "the term entered in block 11 should reflect the
 * majority of the work performed").
 *
 * So this list mixes real terms from both paths with plausible ones. OVERHAULED, REPAIRED
 * and MODIFIED are ordinary maintenance language but are not enumerated in 8130.21J;
 * LIFE_LIMITED_SCRAP is ours. The real vocabulary has to be settled with airworthiness
 * practitioners against AC 43-9 — it is the largest piece of domain work outstanding, and
 * it is deliberately visible here rather than buried.
 */
export const ASSERTION_VOCABULARY = [
  // Block 11 terms for the airworthiness-approval path, verbatim from
  // FAA Order 8130.21J section 4-1(k). These three are real.
  "NEW",
  "PROTOTYPE",
  "USED",
  // Return-to-service terms. INSPECTED is documented (8130-3 Q&A, Q32);
  // the rest are ordinary maintenance language, not enumerated anywhere.
  "INSPECTED",
  "OVERHAULED",
  "MODIFIED",
  "REPAIRED",
  "LIFE_LIMITED_SCRAP",
] as const;
export type AssertionId = (typeof ASSERTION_VOCABULARY)[number];

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
  | "AgentToAttestation"
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
  assertionVocabulary: string[];
  maxDelegationDepth: number;
  maxMembershipTtlMs: number;
};

export const DEFAULT_DNA: DnaProperties = {
  initialMembers: [],
  assertionVocabulary: [...ASSERTION_VOCABULARY],
  maxDelegationDepth: 2,
  maxMembershipTtlMs: 365 * 24 * 60 * 60 * 1000,
};

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
