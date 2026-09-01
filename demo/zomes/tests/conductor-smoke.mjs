/**
 * End-to-end smoke test against a real Holochain conductor.
 *
 * Proves the zome does the thing the browser demo claims: a root authority
 * accredits a repair station, the repair station signs an attestation, and a
 * third party verifies it — with the trust anchor set at install time rather
 * than baked into the wasm.
 *
 * Run:
 *   hc sandbox --piped -H <holochain> -f 9000 create --in-process-lair
 *   hc sandbox --piped -H <holochain> -f 9000 run
 *   node tests/conductor-smoke.mjs
 */
import { AdminWebsocket, AppWebsocket, encodeHashToBase64 } from "@holochain/client";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const HAPP = join(HERE, "..", "aviation_provenance.happ");
const ADMIN_PORT = Number(process.env.ADMIN_PORT ?? 9000);
// Unique per run so the sandbox can be reused without uninstalling.
const RUN = Date.now().toString(36);

// stderr: Node buffers stdout when it is a pipe, which hides progress on a hang.
const log = (...a) => console.error(...a);
const ok = (m) => log(`  PASS  ${m}`);
const fail = (m, e) => {
  console.error(`  FAIL  ${m}`);
  if (e) console.error(String(e?.message ?? e).slice(0, 600));
  process.exitCode = 1;
};

const YEAR_MICROS = 31_536_000_000_000;
const nowMicros = () => Date.now() * 1000;

/** Install one agent's copy of the hApp, with `roots` as the DNA's initial_members. */
async function installFor(admin, appId, agent, roots) {
  await admin.installApp({
    source: { type: "path", value: HAPP },
    installed_app_id: appId,
    agent_key: agent,
    roles_settings: {
      aviation: {
        type: "provisioned",
        value: {
          modifiers: {
            network_seed: "raf-smoke",
            properties: {
              initial_members: roots,
              max_delegation_depth: 2,
              max_membership_ttl_micros: YEAR_MICROS,
              airworthiness_vocabulary: ["NEW", "PROTOTYPE", "USED"],
              return_to_service_vocabulary: [
                "OVERHAULED",
                "REPAIRED",
                "INSPECTED",
                "TESTED",
                "MODIFIED",
              ],
            },
          },
        },
      },
    },
  });
  await admin.enableApp({ installed_app_id: appId });
}

const withTimeout = (p, ms, what) =>
  Promise.race([
    p,
    new Promise((_, r) => setTimeout(() => r(new Error(`timed out after ${ms}ms: ${what}`)), ms)),
  ]);

async function appClientFor(admin, appId) {
  const token = await admin.issueAppAuthenticationToken({ installed_app_id: appId });
  return withTimeout(
    AppWebsocket.connect({
      url: new URL(`ws://127.0.0.1:${appPort}`),
      token: token.token,
      wsClientOptions: { origin: "raf-smoke" },
    }),
    20000,
    `app websocket for ${appId}`,
  );
}

let appPort;

async function main() {
  log("\nRAF conductor smoke test\n");

  const admin = await AdminWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${ADMIN_PORT}`),
    wsClientOptions: { origin: "raf-smoke" },
  });
  ok(`admin connected on ${ADMIN_PORT}`);

  // Two agents: the root authority, and the repair station it accredits.
  const rootKey = await admin.generateAgentPubKey();
  const mroKey = await admin.generateAgentPubKey();
  const rootB64 = encodeHashToBase64(rootKey);
  const mroB64 = encodeHashToBase64(mroKey);
  ok(`generated root ${rootB64.slice(0, 12)}… and MRO ${mroB64.slice(0, 12)}…`);

  // The trust anchor is chosen HERE, at install, not compiled into the wasm.
  await installFor(admin, `raf-root-${RUN}`, rootKey, [rootB64]);
  ok("installed + enabled app for the root authority");
  await installFor(admin, `raf-mro-${RUN}`, mroKey, [rootB64]);
  ok("installed + enabled app for the repair station");

  const iface = await admin.attachAppInterface({ allowed_origins: "raf-smoke" });
  appPort = iface.port;
  ok(`app interface on ${appPort}`);

  const rootApp = await appClientFor(admin, `raf-root-${RUN}`);
  const mroApp = await appClientFor(admin, `raf-mro-${RUN}`);
  ok("both app clients connected");

  // Zome calls must be signed by a capability the conductor has granted.
  const authorize = async (appWs, label) => {
    const info = await appWs.appInfo();
    const cells = info.cell_info.aviation ?? [];
    const provisioned = cells.find((c) => c.type === "provisioned" || c.provisioned);
    const cellId = (provisioned.value ?? provisioned.provisioned).cell_id;
    await admin.authorizeSigningCredentials(cellId);
    ok(`signing credentials authorized for ${label}`);
    return cellId;
  };
  await authorize(rootApp, "root");
  await authorize(mroApp, "repair station");

  const callRoot = (fn_name, payload) =>
    rootApp.callZome({ role_name: "aviation", zome_name: "aviation_attestation_coordinator", fn_name, payload });
  const callMro = (fn_name, payload) =>
    mroApp.callZome({ role_name: "aviation", zome_name: "aviation_attestation_coordinator", fn_name, payload });

  // 1. The root accredits the repair station.
  //    Note there is no `issued_at` field: issuance time is the action's own
  //    timestamp, which is why a membership cannot be backdated.
  const expires = nowMicros() + YEAR_MICROS / 2;
  let membership;
  try {
    membership = await callRoot("issue_membership", {
      agent_pubkey: mroKey,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
      accreditation: {
        accreditation_type: "EasaPart145",
        cert_number: "UK.145.01234",
        issuing_authority: "EASA",
      },
      expires_at: expires,
      issuer_agent: rootKey,
      issuer_membership_hash: null,
      predecessor_membership_hash: null,
      depth: 1,
    });
    ok("root issued a membership proof to the repair station");
  } catch (e) {
    fail("issue_membership", e);
    return;
  }

  const membershipHash = membership.signed_action?.hashed?.hash ?? membership;

  // 2. A non-root cannot accredit anyone. This is the trust anchor doing its job.
  try {
    await callMro("issue_membership", {
      agent_pubkey: rootKey,
      role: "Oem",
      organisation: "Self Promotion Ltd",
      organisation_id: "NOPE-1",
      accreditation: {
        accreditation_type: "OemAuthorized",
        cert_number: "NOPE-1",
        issuing_authority: "FAA",
      },
      expires_at: expires,
      issuer_agent: mroKey,
      issuer_membership_hash: null,
      predecessor_membership_hash: null,
      depth: 1,
    });
    fail("a non-root was allowed to issue a membership");
  } catch {
    ok("non-root membership issuance rejected");
  }

  // 3. The accredited repair station signs an attestation.
  //    `not_observed` is the load-bearing field: it records what the signer did
  //    NOT witness, so absence can never be read as assent.
  let attestation;
  try {
    attestation = await callMro("create_attestation", {
      raf_version: "0.1",
      subject: {
        part_type: "Engine",
        part_number: "CFM56-7B27",
        serial_number: "577737",
        description: "CFM56-7B27 turbofan, stage 1 fan disk",
      },
      binding: {
        certification_path: "ReturnToService",
        binds_field: "serial_and_part",
        document_type: "EasaForm1",
        document_id: "AFX-2026-0142",
        document_digest: "sha256:0d5f3c2b9a71e4d8c6b2f014",
        predecessor_document_hash: null,
      },
      scope: {
        observed: [{ assertion_id: "INSPECTED", value: { Bool: true } }],
        not_observed: ["OVERHAULED", "MODIFIED"],
      },
      evidence: [
        { evidence_type: "shop_traveler", digest: "sha256:a1b2c3d4e5f60718293a4b5c", locator: null },
      ],
      attester: {
        agent_pubkey: mroKey,
        role: "Mro",
        organisation: "AeroFix MRO Ltd",
        organisation_id: "UK.145.01234",
      },
      membership_proof_hash: membershipHash,
      anchor: null,
    });
    ok("repair station signed an attestation");
  } catch (e) {
    fail("create_attestation", e);
    return;
  }

  const attHash = attestation.signed_action?.hashed?.hash ?? attestation;

  // 3b. The certification path is enforced, not decorative.
  //
  // Blocks 13a-13e and 14a-14e are different documents with different rules.
  // AC 43-9D ¶B.13 tells a maintenance signer to shade out blocks 13; 8130.21J
  // ¶11.r says the same of blocks 14; ¶8.k(3) forbids mixing the two on one
  // form. These three attempts each break one of the resulting rules.
  const rtsAttestation = (overrides) => ({
    raf_version: "0.1",
    subject: {
      part_type: "Engine",
      part_number: "CFM56-7B27",
      serial_number: "577737",
      description: "CFM56-7B27 turbofan, stage 1 fan disk",
    },
    binding: {
      certification_path: "ReturnToService",
      binds_field: "serial_and_part",
      document_type: "EasaForm1",
      document_id: `AFX-NEG-${Math.random().toString(36).slice(2, 8)}`,
      document_digest: "sha256:0d5f3c2b9a71e4d8c6b2f014",
      predecessor_document_hash: null,
      ...overrides.binding,
    },
    scope: { observed: [{ assertion_id: "INSPECTED", value: { Bool: true } }], not_observed: [] },
    evidence: [
      { evidence_type: "shop_traveler", digest: "sha256:a1b2c3d4e5f60718293a4b5c", locator: null },
    ],
    attester: {
      agent_pubkey: mroKey,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
    },
    membership_proof_hash: membershipHash,
    anchor: null,
    ...overrides.top,
  });

  const refuses = async (label, payload) => {
    try {
      await callMro("create_attestation", payload);
      fail(label);
    } catch {
      ok(label);
    }
  };

  // NEW belongs to blocks 13. A repair station may not say it on blocks 14.
  await refuses("airworthiness term rejected on the return to service path", {
    ...rtsAttestation({ binding: {}, top: {} }),
    scope: { observed: [{ assertion_id: "NEW", value: { Bool: true } }], not_observed: [] },
  });

  // A Part-145 maintenance approval cannot sign an airworthiness approval:
  // that needs a production approval (§21.137(o) / 21.A.163).
  await refuses("maintenance accreditation refused on the airworthiness path", {
    ...rtsAttestation({ binding: { certification_path: "AirworthinessApproval" }, top: {} }),
    scope: { observed: [{ assertion_id: "NEW", value: { Bool: true } }], not_observed: [] },
  });

  // AC 43-9D Table B-1: "The applicable standard must be described in block 12."
  await refuses("return to service without a cited standard rejected", {
    ...rtsAttestation({ binding: {}, top: {} }),
    evidence: [],
  });

  // Serde renders unit enum variants as plain strings and data-carrying ones as
  // single-key objects. Normalise so the report reads the same either way.
  const variant = (v) => (typeof v === "string" ? v : Object.keys(v ?? {})[0] ?? String(v));

  const describe = (r) =>
    `        membership=${variant(r.membership)} revocation=${variant(r.revocation)} ` +
    `historically_valid=${r.historically_valid} currently_trusted=${r.currently_trusted}`;

  // 4. A third party verifies it without contacting either signer.
  try {
    const report = await callRoot("verify_attestation", attHash);
    log(describe(report));
    // Assert every field the TypeScript conformance test pins. It compares
    // against verdicts transcribed from a run of this script, so anything it
    // pins that this does not assert is not actually cross-checked — a change
    // in the zome would simply go unnoticed.
    const checks = [
      [report.historically_valid === true, "historically_valid=true"],
      [report.currently_trusted === true, "currently_trusted=true"],
      [variant(report.membership) === "Active", "membership=Active"],
      [variant(report.revocation) === "Clean", "revocation=Clean"],
      [report.author_matches_attester === true, "author_matches_attester=true"],
      [report.binding_well_formed === true, "binding_well_formed=true"],
    ];
    const failed = checks.filter(([passed]) => !passed).map(([, name]) => name);
    if (failed.length === 0) {
      ok("a third party verified the attestation");
    } else {
      fail(`verification report differs from the pinned verdict: ${failed.join(", ")}`);
    }
  } catch (e) {
    fail("verify_attestation", e);
    return;
  }

  // 5. The same station signs a CONTRADICTORY attestation: same part and serial,
  //    same assertion id, opposite value, and neither supersedes the other.
  let conflict;
  try {
    conflict = await callMro("create_attestation", {
      raf_version: "0.1",
      subject: {
        part_type: "Engine",
        part_number: "CFM56-7B27",
        serial_number: "577737",
        description: "CFM56-7B27 turbofan, stage 1 fan disk",
      },
      binding: {
        certification_path: "ReturnToService",
        binds_field: "serial_and_part",
        document_type: "EasaForm1",
        document_id: "AFX-2026-0142-B",
        document_digest: "sha256:99f1e2d3c4b5a60718293a4b",
        predecessor_document_hash: null,
      },
      scope: {
        observed: [{ assertion_id: "INSPECTED", value: { Bool: false } }],
        not_observed: [],
      },
      evidence: [
        { evidence_type: "shop_traveler", digest: "sha256:ffeeddccbbaa00998877665544", locator: null },
      ],
      attester: {
        agent_pubkey: mroKey,
        role: "Mro",
        organisation: "AeroFix MRO Ltd",
        organisation_id: "UK.145.01234",
      },
      membership_proof_hash: membershipHash,
      anchor: null,
    });
    ok("station signed a contradictory second attestation");
  } catch (e) {
    fail("create_attestation (conflict)", e);
    return;
  }
  const conflictHash = conflict.signed_action?.hashed?.hash ?? conflict;

  // 6. Revocation on objective, evidence-backed grounds. Note the evidence is
  //    two records any peer can fetch and check for themselves.
  try {
    await callRoot("revoke_membership", {
      membership_hash: membershipHash,
      grounds: { ConflictingAssertions: { assertion_id: "INSPECTED" } },
      evidence_hashes: [attHash, conflictHash],
      notes: "INSPECTED asserted both true and false for the same part",
    });
    ok("membership revoked on conflicting-assertion evidence");
  } catch (e) {
    fail("revoke_membership", e);
    return;
  }

  // 7. THE POINT. The first attestation was valid when it was signed and stays
  //    valid historically; it is only current trust that the revocation removes.
  try {
    const after = await callRoot("verify_attestation", attHash);
    log(describe(after));
    const rev = variant(after.revocation);
    const mem = variant(after.membership);
    if (
      after.historically_valid &&
      !after.currently_trusted &&
      rev === "RevokedAfterAssertion" &&
      mem === "Active"
    ) {
      ok("after revocation: still historically valid, no longer currently trusted");
    } else {
      fail(
        `expected historically_valid=true, currently_trusted=false, revocation=RevokedAfterAssertion, membership=Active; ` +
          `got ${after.historically_valid}/${after.currently_trusted}/${rev}/${mem}`,
      );
    }
  } catch (e) {
    fail("verify_attestation after revocation", e);
  }

  log("\nDone.\n");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  fail("unhandled", e);
  process.exit(1);
});
