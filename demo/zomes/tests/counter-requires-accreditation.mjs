/**
 * A counter-attestation requires an accreditation.
 *
 * Before this rule, `validate_counter` checked only that the author matched the
 * named attester and that the target was an attestation. Any agent who could
 * join the network could author a `Disagree` against every attestation in the
 * DHT, and every authority would store, validate and gossip each one
 * indefinitely. That counters never flip `currently_trusted` is true and does
 * not bound the cost.
 *
 * Two claims are asserted here, and the second is the one that matters:
 *   1. An accredited party can still counter — the rule did not break the feature.
 *   2. An unaccredited party cannot, and validation is what refuses it.
 *
 * The role is deliberately not constrained. SPEC.md §5.1 expects a counter from
 * the receiving party, who may be a buyer rather than a repair station, so any
 * live accreditation qualifies.
 */
import { AdminWebsocket, AppWebsocket, encodeHashToBase64 } from "@holochain/client";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const HAPP = join(HERE, "..", "aviation_provenance.happ");
const ADMIN_PORT = Number(process.env.ADMIN_PORT ?? 9000);
const RUN = Date.now().toString(36);
const ORIGIN = "counter-accred";

const log = (...a) => console.error(...a);
const ok = (m) => log(`  PASS  ${m}`);
let failed = false;
const fail = (m, e) => {
  failed = true;
  console.error(`  FAIL  ${m}`);
  if (e) console.error(String(e?.message ?? e).slice(0, 400));
};

const YEAR_MICROS = 31_536_000_000_000;
const nowMicros = () => Date.now() * 1000;
const recordHash = (r) => r?.signed_action?.hashed?.hash;

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
            network_seed: `counter-accred-${RUN}`,
            properties: {
              initial_members: roots,
              max_delegation_depth: 2,
              max_membership_ttl_micros: YEAR_MICROS,
              airworthiness_vocabulary: ["NEW", "PROTOTYPE", "USED"],
              return_to_service_vocabulary: ["OVERHAULED", "REPAIRED", "INSPECTED", "TESTED", "MODIFIED"],
            },
          },
        },
      },
    },
  });
  await admin.enableApp({ installed_app_id: appId });
}

async function main() {
  log("\nA counter-attestation requires an accreditation\n");

  const admin = await AdminWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${ADMIN_PORT}`),
    wsClientOptions: { origin: ORIGIN },
  });

  const rootKey = await admin.generateAgentPubKey();
  const mroKey = await admin.generateAgentPubKey();
  const strangerKey = await admin.generateAgentPubKey();
  const rootB64 = encodeHashToBase64(rootKey);

  await installFor(admin, `ca-root-${RUN}`, rootKey, [rootB64]);
  await installFor(admin, `ca-mro-${RUN}`, mroKey, [rootB64]);
  await installFor(admin, `ca-stranger-${RUN}`, strangerKey, [rootB64]);
  const iface = await admin.attachAppInterface({ allowed_origins: ORIGIN });
  ok("installed a root, an accredited station, and an unaccredited stranger");

  const clientFor = async (appId) => {
    const t = await admin.issueAppAuthenticationToken({ installed_app_id: appId });
    return AppWebsocket.connect({
      url: new URL(`ws://127.0.0.1:${iface.port}`),
      token: t.token,
      wsClientOptions: { origin: ORIGIN },
    });
  };
  const rootApp = await clientFor(`ca-root-${RUN}`);
  const mroApp = await clientFor(`ca-mro-${RUN}`);
  const strangerApp = await clientFor(`ca-stranger-${RUN}`);

  for (const ws of [rootApp, mroApp, strangerApp]) {
    const info = await ws.appInfo();
    const cells = info.cell_info.aviation ?? [];
    const p = cells.find((c) => c.type === "provisioned" || c.provisioned);
    await admin.authorizeSigningCredentials((p.value ?? p.provisioned).cell_id);
  }
  const callAs = (ws) => (fn_name, payload) =>
    ws.callZome({ role_name: "aviation", zome_name: "aviation_attestation_coordinator", fn_name, payload });
  const callRoot = callAs(rootApp);
  const callMro = callAs(mroApp);
  const callStranger = callAs(strangerApp);

  // ------------------------------------------------- an accredited attestation
  const proof = await callRoot("issue_membership", {
    agent_pubkey: mroKey,
    role: "Mro",
    organisation: "AeroFix MRO Ltd",
    organisation_id: "UK.145.01234",
    accreditation: { accreditation_type: "EasaPart145", cert_number: "UK.145.01234", issuing_authority: "UK CAA" },
    expires_at: nowMicros() + YEAR_MICROS / 2,
    issuer_agent: rootKey,
    issuer_membership_hash: null,
    predecessor_membership_hash: null,
    rotation_handoff_hash: null,
    rotation_acceptance_hash: null,
    depth: 1,
  });
  const membershipHash = recordHash(proof);

  const att = await callMro("create_attestation", {
    raf_version: "0.1",
    subject: { part_type: "Engine", part_number: "CFM56-7B27", serial_number: "577737", description: "fan disk" },
    binding: {
      certification_path: "ReturnToService",
      binds_field: "serial_and_part",
      document_type: "EasaForm1",
      document_id: `AFX-${RUN}`,
      document_digest: "sha256:0d5f3c2b9a71e4d8c6b2f014",
      predecessor_document_hash: null,
    },
    scope: { observed: [{ assertion_id: "INSPECTED", value: { Bool: true } }], not_observed: ["OVERHAULED"] },
    evidence: [{ evidence_type: "shop_traveler", digest: "sha256:a1b2c3d4e5f60718293a4b5c", locator: null }],
    attester: { agent_pubkey: mroKey, role: "Mro", organisation: "AeroFix MRO Ltd", organisation_id: "UK.145.01234" },
    membership_proof_hash: membershipHash,
    anchor: null,
  });
  const attHash = recordHash(att);
  ok("an accredited station signed an attestation");

  // -------------------------------------- 1. an accredited party may still counter
  try {
    await callMro("create_counter_attestation", {
      attestation_hash: attHash,
      membership_proof_hash: membershipHash,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
      agreement: "Agree",
      notes: null,
    });
    ok("an accredited party can counter — the rule did not break the feature");
  } catch (e) {
    fail("an accredited party was refused", e);
  }

  // ------------------------------------------ 2. an unaccredited party cannot
  try {
    await callStranger("create_counter_attestation", {
      attestation_hash: attHash,
      membership_proof_hash: membershipHash, // not theirs — the only hash they have
      role: "Airline",
      organisation: "Nobody Air",
      organisation_id: "XX.000",
      agreement: "Disagree",
      notes: "spam",
    });
    fail("an unaccredited stranger WAS ALLOWED to counter — the hole is open");
  } catch (e) {
    const msg = String(e?.message ?? e);
    if (/membership belongs to a different agent|counter-attester organisation|InvalidCommit/i.test(msg)) {
      ok("an unaccredited stranger is refused, by validation");
      log(`        ${msg.replace(/\s+/g, " ").slice(0, 160)}`);
    } else {
      fail("refused, but not for the expected reason", e);
    }
  }

  log(failed ? "\nFAILED\n" : "\nAll checks passed.\n");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  fail("unhandled", e);
  process.exit(1);
});
