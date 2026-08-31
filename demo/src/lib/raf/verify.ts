import { BINDS_FIELDS, type CounterAttestation, type MembershipRevocation, type RevocationGrounds } from "./types";
import { lookup, type EngineState } from "./engine";

export type MembershipCheck =
  | { kind: "Active"; depth: number; expiresAt: number }
  | { kind: "Expired"; expiresAt: number }
  | { kind: "InvalidProof"; reason: string }
  | { kind: "NotFound" }
  | { kind: "ChainBroken"; reason: string };

export type PredecessorCheck = "None" | "Ok" | "Missing" | "DifferentPart" | "NotEarlier";

export type RevocationCheck =
  | { kind: "Clean" }
  | { kind: "RevokedBeforeAssertion"; at: number; grounds: RevocationGrounds }
  | { kind: "RevokedAfterAssertion"; at: number; grounds: RevocationGrounds };

export type VerificationReport = {
  attestationHash: string;
  signatureCheckedBySys: boolean;
  bindingWellFormed: boolean;
  membership: MembershipCheck;
  predecessor: PredecessorCheck;
  revocation: RevocationCheck;
  scope: { assertionId: string; inVocabulary: boolean }[];
  counters: CounterAttestation[];
  countersAreInformational: true;
  historicallyValid: boolean;
  currentlyTrusted: boolean;
};

/** Leaf-first list of membership hashes up to (and including) the root-issued proof. */
function membershipChainHashes(
  state: EngineState,
  start: string,
): { ok: true; chain: string[] } | { ok: false; reason: string } {
  const lu = lookup(state);
  const chain: string[] = [];
  const seen = new Set<string>();
  let current = start;
  for (let i = 0; i <= state.dna.maxDelegationDepth; i++) {
    if (seen.has(current)) return { ok: false, reason: "cycle in membership chain" };
    seen.add(current);
    const rec = lu.get(current);
    if (!rec) return { ok: false, reason: "membership record missing" };
    if (rec.entry.type !== "MembershipProof") return { ok: false, reason: "not a membership proof" };
    chain.push(current);
    const next = rec.entry.value.issuerMembershipHash;
    if (!next) {
      if (!state.dna.initialMembers.includes(rec.entry.value.issuerAgent)) {
        return { ok: false, reason: "terminal issuer is not a DNA root" };
      }
      return { ok: true, chain };
    }
    current = next;
  }
  return { ok: false, reason: "chain exceeded max depth without a root" };
}

function chainStatus(state: EngineState, start: string): { ok: true } | { ok: false; reason: string } {
  const result = membershipChainHashes(state, start);
  return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

export function verifyAttestation(
  state: EngineState,
  attestationHash: string,
): VerificationReport | { error: string } {
  const record = state.records.find((r) => r.hash === attestationHash);
  if (!record || record.entry.type !== "Attestation") {
    return { error: "attestation not found" };
  }
  const attestation = record.entry.value;
  const actionTime = record.timestamp;
  const lu = lookup(state);

  const bindingWellFormed =
    BINDS_FIELDS.includes(attestation.binding.bindsField) &&
    attestation.binding.documentDigest.trim().length >= 16 &&
    attestation.binding.documentId.trim().length > 0;

  let historicallyValid = bindingWellFormed;
  let currentlyTrusted = bindingWellFormed;

  let membership: MembershipCheck;
  const mRec = lu.get(attestation.membershipProofHash);
  if (!mRec) {
    historicallyValid = false;
    currentlyTrusted = false;
    membership = { kind: "NotFound" };
  } else if (mRec.entry.type !== "MembershipProof") {
    historicallyValid = false;
    currentlyTrusted = false;
    membership = { kind: "InvalidProof", reason: "could not deserialize membership" };
  } else {
    const proof = mRec.entry.value;
    if (actionTime < mRec.timestamp) {
      historicallyValid = false;
      currentlyTrusted = false;
      membership = { kind: "InvalidProof", reason: "membership issued after attestation" };
    } else if (actionTime > proof.expiresAt) {
      historicallyValid = false;
      currentlyTrusted = false;
      membership = { kind: "Expired", expiresAt: proof.expiresAt };
    } else if (
      proof.agentPubkey !== attestation.attester.agentPubkey ||
      proof.role !== attestation.attester.role ||
      proof.organisation !== attestation.attester.organisation ||
      proof.organisationId !== attestation.attester.organisationId
    ) {
      historicallyValid = false;
      currentlyTrusted = false;
      membership = { kind: "InvalidProof", reason: "attester does not match membership" };
    } else {
      const chain = chainStatus(state, attestation.membershipProofHash);
      if (!chain.ok) {
        historicallyValid = false;
        currentlyTrusted = false;
        membership = { kind: "ChainBroken", reason: chain.reason };
      } else {
        membership = { kind: "Active", depth: proof.depth, expiresAt: proof.expiresAt };
      }
    }
  }

  let predecessor: PredecessorCheck = "None";
  if (attestation.binding.predecessorDocumentHash) {
    const pred = lu.get(attestation.binding.predecessorDocumentHash);
    if (!pred || pred.entry.type !== "Attestation") {
      historicallyValid = false;
      currentlyTrusted = false;
      predecessor = "Missing";
    } else {
      const p = pred.entry.value;
      if (
        p.subject.serialNumber !== attestation.subject.serialNumber ||
        p.subject.partNumber !== attestation.subject.partNumber
      ) {
        historicallyValid = false;
        currentlyTrusted = false;
        predecessor = "DifferentPart";
      } else if (pred.timestamp >= actionTime) {
        historicallyValid = false;
        currentlyTrusted = false;
        predecessor = "NotEarlier";
      } else {
        predecessor = "Ok";
      }
    }
  }

  // Revocations of this membership *and* every ancestor. Sort by timestamp so
  // link insertion order does not affect the report. Prefer any revocation
  // dated before the attestation over later ones.
  let revocation: RevocationCheck = { kind: "Clean" };
  const chainResult = membershipChainHashes(state, attestation.membershipProofHash);
  if (chainResult.ok) {
    const allRevs: { at: number; grounds: RevocationGrounds }[] = [];
    for (const mHash of chainResult.chain) {
      for (const link of state.links) {
        if (link.type !== "MembershipToRevocation" || link.base !== mHash) continue;
        const rec = lu.get(link.target);
        if (!rec || rec.entry.type !== "MembershipRevocation") continue;
        const rev = rec.entry.value as MembershipRevocation;
        allRevs.push({ at: rec.timestamp, grounds: rev.grounds });
      }
    }
    allRevs.sort((a, b) => a.at - b.at);
    for (const { at, grounds } of allRevs) {
      if (at < actionTime) {
        historicallyValid = false;
        currentlyTrusted = false;
        revocation = { kind: "RevokedBeforeAssertion", at, grounds };
        break;
      }
      currentlyTrusted = false;
      revocation = { kind: "RevokedAfterAssertion", at, grounds };
    }
  }

  // Scope (observed + not_observed). Integrity already rejects unknown IDs;
  // surface both here so the report is complete.
  const scope: { assertionId: string; inVocabulary: boolean }[] = [];
  for (const a of attestation.scope.observed) {
    const inVocabulary = state.dna.assertionVocabulary.includes(a.assertionId);
    if (!inVocabulary) {
      historicallyValid = false;
      currentlyTrusted = false;
    }
    scope.push({ assertionId: a.assertionId, inVocabulary });
  }
  for (const id of attestation.scope.notObserved ?? []) {
    const inVocabulary = state.dna.assertionVocabulary.includes(id);
    if (!inVocabulary) {
      historicallyValid = false;
      currentlyTrusted = false;
    }
    scope.push({ assertionId: id, inVocabulary });
  }

  const counters: CounterAttestation[] = [];
  for (const l of state.links) {
    if (l.type !== "AttestationToCounter" || l.base !== attestationHash) continue;
    const rec = lu.get(l.target);
    if (rec?.entry.type === "CounterAttestation") counters.push(rec.entry.value);
  }

  return {
    attestationHash,
    signatureCheckedBySys: true,
    bindingWellFormed,
    membership,
    predecessor,
    revocation,
    scope,
    counters,
    countersAreInformational: true,
    historicallyValid,
    currentlyTrusted,
  };
}
