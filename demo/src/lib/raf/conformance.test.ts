/**
 * Conformance: the browser engine must agree with the Holochain zome.
 *
 * `demo/` reimplements the RAF rules in TypeScript so the demo can run without
 * a conductor. That is a second implementation, and second implementations
 * drift. This test pins the verdicts the real zome produces for the smoke-test
 * scenario (`zomes/tests/conductor-smoke.mjs`) and asserts the TypeScript
 * engine produces the same ones.
 *
 * Be clear about what this is and is not. The verdicts below are **transcribed
 * by hand** from a zome run — this test never invokes the zome, and the two
 * implementations are never executed against each other in one process. It is a
 * regression guard on the TypeScript side.
 *
 * What makes the pin bite on the Rust side is that `conductor-smoke.mjs`
 * asserts every field named here, in CI, against a real conductor. Add a field
 * to `ZOME_VERDICTS` and you must add it there too, or that field is pinned in
 * name only.
 *
 * Verdicts below were produced by holochain 0.7.0 on 2026-09-01 and last
 * confirmed against the smoke test on 2026-09-01.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  addAgent,
  createAttestation,
  emptyState,
  issueMembership,
  revokeMembership,
  yearFromNow,
  type EngineState,
} from "./engine.ts";
import { verifyAttestation } from "./verify.ts";
import { RAF_VERSION, type Attestation } from "./types.ts";

/** What the zome reports, at both verification points. */
const ZOME_VERDICTS = {
  beforeRevocation: {
    membership: "Active",
    revocation: "Clean",
    historicallyValid: true,
    currentlyTrusted: true,
  },
  afterRevocation: {
    membership: "Active",
    revocation: "RevokedAfterAssertion",
    historicallyValid: true,
    currentlyTrusted: false,
  },
} as const;

const DIGEST_A = "sha256:0d5f3c2b9a71e4d8c6b2f014";
const DIGEST_B = "sha256:99f1e2d3c4b5a60718293a4b";

function scenario() {
  const state: EngineState = emptyState();

  const root = addAgent(state, {
    name: "Root",
    organisation: "Root Authority",
    organisationId: "ROOT",
    isRoot: true,
  });
  const mro = addAgent(state, {
    name: "AeroFix",
    organisation: "AeroFix MRO Ltd",
    organisationId: "UK.145.01234",
    isRoot: false,
  });

  const membership = issueMembership(state, root.pubkey, {
    agentPubkey: mro.pubkey,
    role: "Mro",
    organisation: "AeroFix MRO Ltd",
    organisationId: "UK.145.01234",
    accreditation: {
      accreditationType: "EasaPart145",
      certNumber: "UK.145.01234",
      issuingAuthority: "EASA",
    },
    expiresAt: yearFromNow(),
  });
  assert.ok(membership.ok, `membership: ${membership.ok ? "" : membership.reason}`);

  const base = (documentId: string, digest: string, value: boolean): Attestation => ({
    rafVersion: RAF_VERSION,
    subject: {
      partType: "Engine",
      partNumber: "CFM56-7B27",
      serialNumber: "577737",
      description: "CFM56-7B27 turbofan, stage 1 fan disk",
    },
    binding: {
      bindsField: "serial_and_part",
      documentType: "EasaForm1",
      documentId,
      documentDigest: digest,
    },
    scope: {
      observed: [{ assertionId: "INSPECTED", value: { kind: "Bool", value } }],
      notObserved: value ? ["OVERHAULED", "MODIFIED"] : [],
    },
    evidence: [{ evidenceType: "shop_traveler", digest }],
    attester: {
      agentPubkey: mro.pubkey,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisationId: "UK.145.01234",
    },
    membershipProofHash: membership.value.hash,
  });

  const first = createAttestation(state, base("AFX-2026-0142", DIGEST_A, true));
  assert.ok(first.ok, `first attestation: ${first.ok ? "" : first.reason}`);

  return { state, root, mro, membershipHash: membership.value.hash, first: first.value.hash, base };
}

describe("conformance with the Holochain zome", () => {
  it("matches the zome before revocation", () => {
    const { state, first } = scenario();
    const report = verifyAttestation(state, first);
    assert.ok(!("error" in report), "verification returned an error");

    const expected = ZOME_VERDICTS.beforeRevocation;
    assert.equal(report.membership.kind, expected.membership);
    assert.equal(report.revocation.kind, expected.revocation);
    assert.equal(report.historicallyValid, expected.historicallyValid);
    assert.equal(report.currentlyTrusted, expected.currentlyTrusted);
  });

  it("matches the zome after revocation on conflicting assertions", () => {
    const { state, root, membershipHash, first, base } = scenario();

    // The same station contradicts itself: same part and serial, same assertion
    // id, opposite value, neither superseding the other.
    const conflict = createAttestation(state, base("AFX-2026-0142-B", DIGEST_B, false));
    assert.ok(conflict.ok, `conflicting attestation: ${conflict.ok ? "" : conflict.reason}`);

    const revoked = revokeMembership(state, root.pubkey, {
      membershipHash,
      grounds: { kind: "ConflictingAssertions", assertionId: "INSPECTED" },
      evidenceHashes: [first, conflict.value.hash],
      notes: "INSPECTED asserted both true and false for the same part",
    });
    assert.ok(revoked.ok, `revocation: ${revoked.ok ? "" : revoked.reason}`);

    const report = verifyAttestation(state, first);
    assert.ok(!("error" in report), "verification returned an error");

    const expected = ZOME_VERDICTS.afterRevocation;
    assert.equal(report.membership.kind, expected.membership);
    assert.equal(report.revocation.kind, expected.revocation);
    assert.equal(
      report.historicallyValid,
      expected.historicallyValid,
      "an attestation valid when signed must stay historically valid",
    );
    assert.equal(
      report.currentlyTrusted,
      expected.currentlyTrusted,
      "revocation must withdraw current trust",
    );
  });
});
