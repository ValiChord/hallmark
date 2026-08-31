import {
  allowedNewAccreditation,
  assertionValueEqual,
  BINDS_FIELDS,
  RAF_VERSION,
  roleMatchesAccreditation,
  type Attestation,
  type CounterAttestation,
  type DnaProperties,
  type DhtRecord,
  type Entry,
  type KeyAcceptance,
  type KeyHandoff,
  type MembershipProof,
  type MembershipRevocation,
} from "./types";

export type ActionCtx = {
  author: string;
  timestamp: number;
};

export type Lookup = {
  get(hash: string): DhtRecord | undefined;
  dna: DnaProperties;
};

export type Verdict = { ok: true } | { ok: false; reason: string };

const ok: Verdict = { ok: true };
// Precise return type: `bad` is also returned from helpers whose ok-branch carries
// a value, and a plain `Verdict` is not assignable to those unions.
const bad = (reason: string): { ok: false; reason: string } => ({ ok: false, reason });

function requireEntry<T>(
  record: DhtRecord | undefined,
  type: Entry["type"],
): { ok: true; value: T } | { ok: false; reason: string } {
  if (!record) return { ok: false, reason: "dependency not found" };
  if (record.entry.type !== type) {
    return { ok: false, reason: "dependency is not the expected entry type" };
  }
  return { ok: true, value: record.entry.value as T };
}

export function validateCreate(entry: Entry, action: ActionCtx, lookup: Lookup): Verdict {
  switch (entry.type) {
    case "MembershipProof":
      return validateMembership(entry.value, action, lookup);
    case "Attestation":
      return validateAttestation(entry.value, action, lookup);
    case "MembershipRevocation":
      return validateRevocation(entry.value, action, lookup);
    case "KeyHandoff":
      return validateHandoff(entry.value, action, lookup);
    case "KeyAcceptance":
      return validateAcceptance(entry.value, action, lookup);
    case "CounterAttestation":
      return validateCounter(entry.value, action);
  }
}

function validateMembership(
  proof: MembershipProof,
  action: ActionCtx,
  lookup: Lookup,
): Verdict {
  const { dna } = lookup;
  if (action.author !== proof.issuerAgent) return bad("publisher is not the declared issuer");
  if (proof.issuerAgent === proof.agentPubkey) return bad("self-issuance is not allowed");
  if (!proof.organisation.trim() || !proof.organisationId.trim()) {
    return bad("organisation and organisation_id are required");
  }
  if (!proof.accreditation.certNumber.trim() || !proof.accreditation.issuingAuthority.trim()) {
    return bad("accreditation cert_number and issuing_authority are required");
  }
  if (proof.expiresAt <= action.timestamp) {
    return bad("expires_at must be after issuance");
  }
  if (proof.expiresAt - action.timestamp > dna.maxMembershipTtlMs) {
    return bad("membership TTL exceeds DNA maximum");
  }
  if (!roleMatchesAccreditation(proof.accreditation.accreditationType, proof.role)) {
    return bad("role does not match accreditation type");
  }

  if (proof.predecessorMembershipHash) {
    const pred = requireEntry<MembershipProof>(
      lookup.get(proof.predecessorMembershipHash),
      "MembershipProof",
    );
    if (!pred.ok) return pred;
    if (
      pred.value.accreditation.certNumber !== proof.accreditation.certNumber ||
      pred.value.accreditation.issuingAuthority !== proof.accreditation.issuingAuthority
    ) {
      return bad("rotated membership must keep the same certificate");
    }
    if (pred.value.agentPubkey === proof.agentPubkey) {
      return bad("key rotation predecessor is the same agent");
    }
  }

  if (!proof.issuerMembershipHash) {
    if (!dna.initialMembers.includes(proof.issuerAgent)) {
      return bad("issuer is not a DNA root and no issuer membership was provided");
    }
    if (proof.depth !== 1) return bad("root-issued membership must have depth 1");
  } else {
    const rec = lookup.get(proof.issuerMembershipHash);
    const issuer = requireEntry<MembershipProof>(rec, "MembershipProof");
    if (!issuer.ok) return issuer;
    if (!rec) return bad("issuer membership missing");
    if (issuer.value.agentPubkey !== proof.issuerAgent) {
      return bad("issuer membership does not belong to issuer_agent");
    }
    if (action.timestamp < rec.timestamp) {
      return bad("issuer membership is dated after this proof");
    }
    if (action.timestamp > issuer.value.expiresAt) {
      return bad("issuer membership expired before this proof");
    }
    const expected = issuer.value.depth + 1;
    if (expected > dna.maxDelegationDepth) {
      return bad(`delegation depth ${expected} exceeds max ${dna.maxDelegationDepth}`);
    }
    if (proof.depth !== expected) {
      return bad(`declared depth ${proof.depth} does not match computed ${expected}`);
    }
    if (
      !allowedNewAccreditation(
        issuer.value.accreditation.accreditationType,
        proof.accreditation.accreditationType,
      )
    ) {
      return bad("issuer is not authorized to grant this accreditation type");
    }
  }
  return ok;
}

function walkToRoot(start: string, lookup: Lookup): Verdict {
  const seen = new Set<string>();
  let current = start;
  for (let i = 0; i <= lookup.dna.maxDelegationDepth; i++) {
    if (seen.has(current)) return bad("membership chain contains a cycle");
    seen.add(current);
    const rec = lookup.get(current);
    const proof = requireEntry<MembershipProof>(rec, "MembershipProof");
    if (!proof.ok) return proof;
    if (!proof.value.issuerMembershipHash) {
      if (!lookup.dna.initialMembers.includes(proof.value.issuerAgent)) {
        return bad("terminal issuer is not a DNA root");
      }
      return ok;
    }
    current = proof.value.issuerMembershipHash;
  }
  return bad("membership chain exceeded max depth without reaching a root");
}

function validateAttestation(
  attestation: Attestation,
  action: ActionCtx,
  lookup: Lookup,
): Verdict {
  if (attestation.rafVersion !== RAF_VERSION) return bad(`raf_version must be ${RAF_VERSION}`);
  if (action.author !== attestation.attester.agentPubkey) return bad("author is not the attester");
  if (!attestation.subject.partNumber.trim() || !attestation.subject.serialNumber.trim()) {
    return bad("part_number and serial_number are required");
  }
  if (!attestation.binding.documentId.trim()) return bad("document_id is required");
  if (attestation.binding.documentDigest.trim().length < 16) {
    return bad("document_digest is too short");
  }
  if (!BINDS_FIELDS.includes(attestation.binding.bindsField)) {
    return bad(`unknown binds_field '${attestation.binding.bindsField}'`);
  }
  for (const ev of attestation.evidence) {
    if (!ev.evidenceType.trim() || ev.digest.trim().length < 16) {
      return bad("evidence type and digest are required");
    }
  }

  const seen = new Set<string>();
  for (const a of attestation.scope.observed) {
    if (!lookup.dna.assertionVocabulary.includes(a.assertionId)) {
      return bad(`assertion '${a.assertionId}' is not in the DNA vocabulary`);
    }
    if (seen.has(a.assertionId)) return bad(`duplicate observed assertion '${a.assertionId}'`);
    seen.add(a.assertionId);
  }
  for (const id of attestation.scope.notObserved) {
    if (!lookup.dna.assertionVocabulary.includes(id)) {
      return bad(`not_observed '${id}' is not in the DNA vocabulary`);
    }
    if (seen.has(id)) return bad(`'${id}' cannot be both observed and not_observed`);
  }

  const mRec = lookup.get(attestation.membershipProofHash);
  const membership = requireEntry<MembershipProof>(mRec, "MembershipProof");
  if (!membership.ok) return membership;
  if (!mRec) return bad("membership missing");
  if (membership.value.agentPubkey !== attestation.attester.agentPubkey) {
    return bad("membership belongs to a different agent");
  }
  if (membership.value.role !== attestation.attester.role) {
    return bad("attester role does not match membership role");
  }
  if (
    membership.value.organisation !== attestation.attester.organisation ||
    membership.value.organisationId !== attestation.attester.organisationId
  ) {
    return bad("attester organisation does not match membership");
  }
  if (action.timestamp < mRec.timestamp) return bad("membership issued after this attestation");
  if (action.timestamp > membership.value.expiresAt) return bad("membership expired");

  const walk = walkToRoot(attestation.membershipProofHash, lookup);
  if (!walk.ok) return walk;

  if (attestation.binding.predecessorDocumentHash) {
    const pRec = lookup.get(attestation.binding.predecessorDocumentHash);
    const pred = requireEntry<Attestation>(pRec, "Attestation");
    if (!pred.ok) return pred;
    if (!pRec) return bad("predecessor missing");
    if (
      pred.value.subject.serialNumber !== attestation.subject.serialNumber ||
      pred.value.subject.partNumber !== attestation.subject.partNumber
    ) {
      return bad("predecessor is a different part");
    }
    if (pRec.timestamp >= action.timestamp) {
      return bad("predecessor must be earlier than this attestation");
    }
  }
  return ok;
}

function validateRevocation(
  revocation: MembershipRevocation,
  action: ActionCtx,
  lookup: Lookup,
): Verdict {
  const mRec = lookup.get(revocation.membershipHash);
  const membership = requireEntry<MembershipProof>(mRec, "MembershipProof");
  if (!membership.ok) return membership;
  if (membership.value.agentPubkey !== revocation.agentPubkey) {
    return bad("revocation agent does not match membership agent");
  }

  const g = revocation.grounds;
  if (g.kind === "Administrative") {
    const issuerOk = action.author === membership.value.issuerAgent;
    const rootOk = lookup.dna.initialMembers.includes(action.author);
    if (!issuerOk && !rootOk) {
      return bad("administrative revocation requires the original issuer or a DNA root");
    }
    return ok;
  }

  if (g.kind === "KeyRotated") {
    if (revocation.evidenceHashes.length < 2) {
      return bad("KeyRotated requires handoff and acceptance hashes");
    }
    const hRec = lookup.get(revocation.evidenceHashes[0]!);
    const handoff = requireEntry<KeyHandoff>(hRec, "KeyHandoff");
    if (!handoff.ok) return handoff;
    const aRec = lookup.get(revocation.evidenceHashes[1]!);
    const acceptance = requireEntry<KeyAcceptance>(aRec, "KeyAcceptance");
    if (!acceptance.ok) return acceptance;
    if (handoff.value.oldMembershipHash !== revocation.membershipHash) {
      return bad("handoff does not point at this membership");
    }
    if (acceptance.value.handoffHash !== revocation.evidenceHashes[0]) {
      return bad("acceptance does not point at this handoff");
    }
    if (hRec && hRec.author !== membership.value.agentPubkey) {
      return bad("handoff was not authored by the old key");
    }
    if (aRec && aRec.author !== handoff.value.newKey) {
      return bad("acceptance was not authored by the new key");
    }
    if (
      action.author !== membership.value.issuerAgent &&
      action.author !== membership.value.agentPubkey &&
      !lookup.dna.initialMembers.includes(action.author)
    ) {
      return bad("KeyRotated revocation author is not authorized");
    }
    return ok;
  }

  if (g.kind === "DuplicateDocument") {
    const pair = twoAttestations(revocation.evidenceHashes, lookup);
    if (!pair.ok) return pair;
    const [a1, a2] = pair.value;
    if (
      a1.attester.agentPubkey !== revocation.agentPubkey ||
      a2.attester.agentPubkey !== revocation.agentPubkey
    ) {
      return bad("attestations were not authored by the revoked agent");
    }
    if (
      a1.binding.documentType !== a2.binding.documentType ||
      a1.binding.documentId !== a2.binding.documentId
    ) {
      return bad("documents are not the same type+id");
    }
    if (revocation.evidenceHashes[0] === revocation.evidenceHashes[1]) {
      return bad("duplicate evidence hash");
    }
    return ok;
  }

  if (g.kind === "ConflictingAssertions") {
    if (revocation.evidenceHashes.length < 2) {
      return bad("need two attestation hashes");
    }
    if (revocation.evidenceHashes[0] === revocation.evidenceHashes[1]) {
      return bad("evidence hashes must be distinct attestations");
    }
    const pair = twoAttestations(revocation.evidenceHashes, lookup);
    if (!pair.ok) return pair;
    const [a1, a2] = pair.value;
    if (
      a1.attester.agentPubkey !== revocation.agentPubkey ||
      a2.attester.agentPubkey !== revocation.agentPubkey
    ) {
      return bad("attestations were not authored by the revoked agent");
    }
    if (
      a1.subject.serialNumber !== a2.subject.serialNumber ||
      a1.subject.partNumber !== a2.subject.partNumber
    ) {
      return bad("attestations refer to different parts");
    }
    const h0 = revocation.evidenceHashes[0];
    const h1 = revocation.evidenceHashes[1];
    if (
      a1.binding.predecessorDocumentHash === h1 ||
      a2.binding.predecessorDocumentHash === h0
    ) {
      return bad("attestations are a predecessor chain, not a conflict");
    }
    const v1 = a1.scope.observed.find((x) => x.assertionId === g.assertionId);
    const v2 = a2.scope.observed.find((x) => x.assertionId === g.assertionId);
    if (!v1 || !v2) return bad("both attestations must observe the named assertion");
    if (assertionValueEqual(v1.value, v2.value)) {
      return bad("assertion values do not conflict");
    }
    return ok;
  }

  // DuplicateCertIssuance
  if (revocation.evidenceHashes.length < 2) return bad("need two membership proofs");
  const r1 = lookup.get(revocation.evidenceHashes[0]!);
  const r2 = lookup.get(revocation.evidenceHashes[1]!);
  const p1 = requireEntry<MembershipProof>(r1, "MembershipProof");
  const p2 = requireEntry<MembershipProof>(r2, "MembershipProof");
  if (!p1.ok) return p1;
  if (!p2.ok) return p2;
  if (!r1 || !r2) return bad("membership evidence missing");
  if (
    p1.value.issuerAgent !== revocation.agentPubkey ||
    p2.value.issuerAgent !== revocation.agentPubkey
  ) {
    return bad("revoked agent is not the issuer of both proofs");
  }
  if (
    p1.value.accreditation.certNumber !== p2.value.accreditation.certNumber ||
    p1.value.accreditation.issuingAuthority !== p2.value.accreditation.issuingAuthority
  ) {
    return bad("certificates differ");
  }
  if (p1.value.agentPubkey === p2.value.agentPubkey) {
    return bad("same subject agent — not a duplicate grant");
  }
  if (
    p1.value.predecessorMembershipHash === revocation.evidenceHashes[1] ||
    p2.value.predecessorMembershipHash === revocation.evidenceHashes[0]
  ) {
    return bad("memberships are a key rotation, not a duplicate grant");
  }
  const overlap = !(p1.value.expiresAt < r2.timestamp || p2.value.expiresAt < r1.timestamp);
  if (!overlap) return bad("validity windows do not overlap — this is a re-issue");
  return ok;
}

function twoAttestations(
  hashes: string[],
  lookup: Lookup,
): { ok: true; value: [Attestation, Attestation] } | { ok: false; reason: string } {
  if (hashes.length < 2) return bad("need two attestation hashes");
  const a = requireEntry<Attestation>(lookup.get(hashes[0]!), "Attestation");
  const b = requireEntry<Attestation>(lookup.get(hashes[1]!), "Attestation");
  if (!a.ok) return a;
  if (!b.ok) return b;
  return { ok: true, value: [a.value, b.value] };
}

function validateHandoff(handoff: KeyHandoff, action: ActionCtx, lookup: Lookup): Verdict {
  const rec = lookup.get(handoff.oldMembershipHash);
  const proof = requireEntry<MembershipProof>(rec, "MembershipProof");
  if (!proof.ok) return proof;
  if (action.author !== proof.value.agentPubkey) {
    return bad("handoff must be authored by the old key");
  }
  if (handoff.newKey === proof.value.agentPubkey) {
    return bad("new key must differ from old key");
  }
  if (action.timestamp > proof.value.expiresAt) {
    return bad("cannot hand off an expired membership");
  }
  return ok;
}

function validateAcceptance(
  acceptance: KeyAcceptance,
  action: ActionCtx,
  lookup: Lookup,
): Verdict {
  const rec = lookup.get(acceptance.handoffHash);
  const handoff = requireEntry<KeyHandoff>(rec, "KeyHandoff");
  if (!handoff.ok) return handoff;
  if (action.author !== handoff.value.newKey) {
    return bad("acceptance must be authored by the new key");
  }
  return ok;
}

function validateCounter(counter: CounterAttestation, action: ActionCtx): Verdict {
  if (action.author !== counter.attester.agentPubkey) {
    return bad("author is not the counter-attester");
  }
  if (!counter.attester.organisation.trim()) return bad("organisation is required");
  return ok;
}

export function serialBase(partNumber: string, serialNumber: string): string {
  return `path:pn:${partNumber}/sn:${serialNumber}`;
}
export function documentBase(documentType: string, documentId: string): string {
  return `path:doc:${documentType}/id:${documentId}`;
}
export function agentBase(agent: string): string {
  return `path:agent:${agent}`;
}
