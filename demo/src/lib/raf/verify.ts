import {
  BINDS_FIELDS,
  type CounterAttestation,
  type DhtLink,
  type MembershipProof,
  type MembershipRevocation,
  type RevocationGrounds,
  vocabularyFor,
} from "./types";
import { lookup, type EngineState } from "./engine";
import type { Lookup } from "./validate";

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
  | { kind: "RevokedAfterAssertion"; at: number; grounds: RevocationGrounds }
  /** Superseded by a key rotation, not withdrawn. Affects neither answer. */
  | { kind: "Rotated"; at: number }
  /** Revocation state could not be established. currentlyTrusted is false. */
  | { kind: "Unknown" };

export type VerificationReport = {
  attestationHash: string;
  signatureCheckedBySys: boolean;
  authorMatchesAttester: boolean;
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

/**
 * Leaf-first list of membership hashes up to (and including) the root-issued
 * proof.
 *
 * Re-checks the per-hop invariants integrity enforces rather than assuming they
 * ran — mirrors `membership_chain_hashes` in the coordinator zome. Takes the
 * lookup map rather than rebuilding it, so one verify builds it once instead of
 * three times.
 */
function membershipChainHashes(
  state: EngineState,
  lu: Lookup,
  start: string,
): { ok: true; chain: string[] } | { ok: false; reason: string } {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current = start;
  let child: MembershipProof | null = null;

  for (let i = 0; i <= state.dna.maxDelegationDepth; i++) {
    if (seen.has(current)) return { ok: false, reason: "cycle in membership chain" };
    seen.add(current);
    const rec = lu.get(current);
    if (!rec) return { ok: false, reason: "membership record missing" };
    if (rec.entry.type !== "MembershipProof") return { ok: false, reason: "not a membership proof" };
    const proof = rec.entry.value;

    if (rec.author !== proof.issuerAgent) {
      return { ok: false, reason: "membership was not published by its declared issuer" };
    }
    if (proof.issuerAgent === proof.agentPubkey) {
      return { ok: false, reason: "self-issued membership in chain" };
    }
    if (child && proof.agentPubkey !== child.issuerAgent) {
      return { ok: false, reason: "chain link does not match the issuer it claims" };
    }

    chain.push(current);
    const next = proof.issuerMembershipHash;
    if (!next) {
      if (!state.dna.initialMembers.includes(proof.issuerAgent)) {
        return { ok: false, reason: "terminal issuer is not a DNA root" };
      }
      if (proof.depth !== 1) {
        return { ok: false, reason: "root-issued membership does not have depth 1" };
      }
      return { ok: true, chain };
    }
    child = proof;
    current = next;
  }
  return { ok: false, reason: "chain exceeded max depth without a root" };
}

/** Links grouped by base, so a verify does not scan every link in the DHT. */
function linksByBase(state: EngineState): Map<string, DhtLink[]> {
  const index = new Map<string, DhtLink[]>();
  for (const link of state.links) {
    const bucket = index.get(link.base);
    if (bucket) bucket.push(link);
    else index.set(link.base, [link]);
  }
  return index;
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

  // Does the key that signed this record match the attester it names? Mirrors
  // the same check in the coordinator zome.
  const authorMatchesAttester = record.author === attestation.attester.agentPubkey;

  // Walked once, used twice: the membership check needs the verdict, the
  // revocation sweep needs the hashes.
  const chainResult = membershipChainHashes(state, lu, attestation.membershipProofHash);

  const bindingWellFormed =
    BINDS_FIELDS.includes(attestation.binding.bindsField) &&
    attestation.binding.documentDigest.trim().length >= 16 &&
    attestation.binding.documentId.trim().length > 0;

  let historicallyValid = bindingWellFormed && authorMatchesAttester;
  let currentlyTrusted = bindingWellFormed && authorMatchesAttester;

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
      if (!chainResult.ok) {
        historicallyValid = false;
        currentlyTrusted = false;
        membership = { kind: "ChainBroken", reason: chainResult.reason };
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
  const byBase = linksByBase(state);
  if (!chainResult.ok) {
    currentlyTrusted = false;
    revocation = { kind: "Unknown" };
  } else {
    const allRevs: { at: number; grounds: RevocationGrounds }[] = [];
    let incomplete = false;
    for (const mHash of chainResult.chain) {
      for (const link of byBase.get(mHash) ?? []) {
        if (link.type !== "MembershipToRevocation") continue;
        const rec = lu.get(link.target);
        if (!rec || rec.entry.type !== "MembershipRevocation") {
          // The link resolved but the record did not. Fail closed.
          incomplete = true;
          continue;
        }
        const rev = rec.entry.value as MembershipRevocation;
        allRevs.push({ at: rec.timestamp, grounds: rev.grounds });
      }
    }
    allRevs.sort((a, b) => a.at - b.at);
    for (const { at, grounds } of allRevs) {
      // A key rotation is hygiene, not misconduct.
      if (grounds.kind === "KeyRotated") {
        if (revocation.kind === "Clean") revocation = { kind: "Rotated", at };
        continue;
      }
      if (at < actionTime) {
        historicallyValid = false;
        currentlyTrusted = false;
        revocation = { kind: "RevokedBeforeAssertion", at, grounds };
        break;
      }
      currentlyTrusted = false;
      revocation = { kind: "RevokedAfterAssertion", at, grounds };
    }
    if (incomplete) {
      currentlyTrusted = false;
      if (revocation.kind === "Clean" || revocation.kind === "Rotated") {
        revocation = { kind: "Unknown" };
      }
    }
  }

  // Scope (observed + not_observed). Integrity already rejects unknown IDs;
  // surface both here so the report is complete.
  // The vocabulary for THIS record's path. A term valid on the other path is
  // not valid here.
  const pathVocabulary = vocabularyFor(state.dna, attestation.binding.certificationPath);
  const scope: { assertionId: string; inVocabulary: boolean }[] = [];
  for (const a of attestation.scope.observed) {
    const inVocabulary = pathVocabulary.includes(a.assertionId);
    if (!inVocabulary) {
      historicallyValid = false;
      currentlyTrusted = false;
    }
    scope.push({ assertionId: a.assertionId, inVocabulary });
  }
  for (const id of attestation.scope.notObserved ?? []) {
    const inVocabulary = pathVocabulary.includes(id);
    if (!inVocabulary) {
      historicallyValid = false;
      currentlyTrusted = false;
    }
    scope.push({ assertionId: id, inVocabulary });
  }

  const counters: CounterAttestation[] = [];
  for (const l of byBase.get(attestationHash) ?? []) {
    if (l.type !== "AttestationToCounter") continue;
    const rec = lu.get(l.target);
    if (rec?.entry.type === "CounterAttestation") counters.push(rec.entry.value);
  }

  return {
    attestationHash,
    signatureCheckedBySys: true,
    authorMatchesAttester,
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
