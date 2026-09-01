/**
 * Two conductors, one DHT.
 *
 * The single-conductor smoke test proves the rules execute. It cannot prove the
 * claim the project actually rests on: that a party who was never present can
 * check a record without contacting whoever made it.
 *
 * This test runs two independent conductors and proves three things that only a
 * real network can show:
 *
 *   1. An accreditation issued on conductor A reaches conductor B by gossip.
 *      B cannot even author a valid attestation until it has, because validation
 *      resolves the membership by hash.
 *   2. A record authored on B verifies on A, which never spoke to B.
 *   3. A revocation issued on A reaches B and changes B's verdict on a record B
 *      itself created — while leaving it historically valid.
 *
 * Run:
 *   hc sandbox --piped -H <holochain> -f 9000,9001 create -n 2 --in-process-lair
 *   hc sandbox --piped -H <holochain> -f 9000,9001 run --all
 *   node zomes/tests/network-gossip.mjs
 */
import { AdminWebsocket, AppWebsocket, encodeHashToBase64 } from "@holochain/client";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const HAPP = join(HERE, "..", "aviation_provenance.happ");
const PORT_A = Number(process.env.ADMIN_A ?? 9000);
const PORT_B = Number(process.env.ADMIN_B ?? 9001);
const ORIGIN = "raf-net";
const RUN = Date.now().toString(36);

// A seed unique to this run, so the two conductors share a DHT with nobody else.
const NETWORK_SEED = `raf-net-${RUN}`;
const YEAR = 31_536_000_000_000;
const GOSSIP_TIMEOUT_MS = Number(process.env.GOSSIP_TIMEOUT_MS ?? 120_000);

const log = (...a) => console.error(...a);
const ok = (m) => log(`  PASS  ${m}`);
let failed = false;
const fail = (m, e) => {
  failed = true;
  console.error(`  FAIL  ${m}`);
  if (e) console.error(String(e?.message ?? e).slice(0, 500));
};

const AIRWORTHINESS_VOCAB = ["NEW", "PROTOTYPE", "USED"];
const RTS_VOCAB = ["OVERHAULED", "REPAIRED", "INSPECTED", "TESTED", "MODIFIED"];

/** Poll until `fn` returns something truthy, or give up. Gossip is not instant. */
async function until(label, fn, timeoutMs = GOSSIP_TIMEOUT_MS) {
  const started = Date.now();
  let attempts = 0;
  for (;;) {
    attempts += 1;
    try {
      const value = await fn();
      if (value) {
        const secs = ((Date.now() - started) / 1000).toFixed(1);
        log(`        ${label} after ${secs}s (${attempts} attempts)`);
        return value;
      }
    } catch {
      // Not there yet. Gossip failures look like "record not found".
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(`timed out waiting for ${label} after ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function connect(port, label) {
  const admin = await AdminWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${port}`),
    wsClientOptions: { origin: ORIGIN },
  });
  ok(`admin connected to ${label} on ${port}`);
  return admin;
}

/** Install with identical properties on both sides — same DNA hash, same DHT. */
async function install(admin, appId, agent, roots) {
  await admin.installApp({
    source: { type: "path", value: HAPP },
    installed_app_id: appId,
    agent_key: agent,
    roles_settings: {
      aviation: {
        type: "provisioned",
        value: {
          modifiers: {
            network_seed: NETWORK_SEED,
            properties: {
              initial_members: roots,
              max_delegation_depth: 2,
              max_membership_ttl_micros: YEAR,
              airworthiness_vocabulary: AIRWORTHINESS_VOCAB,
              return_to_service_vocabulary: RTS_VOCAB,
            },
          },
        },
      },
    },
  });
  await admin.enableApp({ installed_app_id: appId });
}

async function appClient(admin, appId, appPort) {
  const token = await admin.issueAppAuthenticationToken({ installed_app_id: appId });
  const client = await AppWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${appPort}`),
    token: token.token,
    wsClientOptions: { origin: ORIGIN },
  });
  const info = await client.appInfo();
  const cells = info.cell_info.aviation ?? [];
  const provisioned = cells.find((c) => c.type === "provisioned" || c.provisioned);
  const cellId = (provisioned.value ?? provisioned.provisioned).cell_id;
  await admin.authorizeSigningCredentials(cellId);
  return { client, cellId };
}

const call = ({ client }, fn_name, payload) =>
  client.callZome({
    role_name: "aviation",
    zome_name: "aviation_attestation_coordinator",
    fn_name,
    payload,
  });

/** Hand each conductor the other's agent info, so they can connect. */
async function exchangePeers(adminA, adminB) {
  const [infoA, infoB] = await Promise.all([
    adminA.agentInfo({ dna_hashes: null }),
    adminB.agentInfo({ dna_hashes: null }),
  ]);
  await Promise.all([
    adminA.addAgentInfo({ agent_infos: infoB }),
    adminB.addAgentInfo({ agent_infos: infoA }),
  ]);
}

const hashOf = (record) => record.signed_action?.hashed?.hash ?? record;
const variant = (v) => (typeof v === "string" ? v : (Object.keys(v ?? {})[0] ?? String(v)));

async function main() {
  log("\nRAF two-conductor network test");
  log(`network seed: ${NETWORK_SEED}\n`);

  const adminA = await connect(PORT_A, "conductor A");
  const adminB = await connect(PORT_B, "conductor B");

  // Keys are generated on the conductor that will hold them.
  const rootKey = await adminA.generateAgentPubKey();
  const stationKey = await adminB.generateAgentPubKey();
  const rootB64 = encodeHashToBase64(rootKey);
  ok(`root on A (${rootB64.slice(0, 12)}…), repair station on B`);

  // Identical roots on both sides. Neither conductor is special.
  await install(adminA, `raf-a-${RUN}`, rootKey, [rootB64]);
  await install(adminB, `raf-b-${RUN}`, stationKey, [rootB64]);
  ok("app installed on both conductors, same seed and properties");

  // Introduce the two conductors to each other.
  //
  // Holochain discovers peers through a bootstrap service. The public dev
  // bootstrap does not reliably pair two conductors on the same host, and
  // depending on it would make this test flaky and require internet access.
  // The admin API exposes the same exchange directly, which is what local test
  // harnesses do: hand each conductor the other's signed agent info.
  await exchangePeers(adminA, adminB);
  ok("conductors introduced — peer info exchanged both ways");

  const portA = (await adminA.attachAppInterface({ allowed_origins: ORIGIN })).port;
  const portB = (await adminB.attachAppInterface({ allowed_origins: ORIGIN })).port;
  const a = await appClient(adminA, `raf-a-${RUN}`, portA);
  const b = await appClient(adminB, `raf-b-${RUN}`, portB);
  ok("both app clients connected and authorised");

  // ---------------------------------------------------------------- 1. gossip
  const expires = Date.now() * 1000 + YEAR / 2;
  const membership = await call(a, "issue_membership", {
    agent_pubkey: stationKey,
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
  const membershipHash = hashOf(membership);
  ok("root on A accredited the repair station on B");

  // B has never spoken to A. It can only see this if gossip delivered it.
  await until("membership reached conductor B", async () => {
    const found = await call(b, "get_memberships_for_agent", stationKey);
    return Array.isArray(found) && found.length > 0;
  });
  ok("the accreditation reached B by gossip");

  // ------------------------------------------------- 2. cross-node verification
  const attestation = {
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
      document_id: `AFX-${RUN}-0142`,
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
      agent_pubkey: stationKey,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
    },
    membership_proof_hash: membershipHash,
    anchor: null,
  };

  // Authoring this on B is itself a proof: validation resolves the membership by
  // hash, so it cannot succeed unless the record from A actually arrived.
  const signed = await call(b, "create_attestation", attestation);
  const attHash = hashOf(signed);
  ok("the station on B signed an attestation against A's accreditation");

  const reportOnA = await until("attestation reached conductor A", async () => {
    const r = await call(a, "verify_attestation", attHash);
    return variant(r.membership) === "Active" ? r : null;
  });
  log(
    `        membership=${variant(reportOnA.membership)} revocation=${variant(reportOnA.revocation)} ` +
      `historically_valid=${reportOnA.historically_valid} currently_trusted=${reportOnA.currently_trusted}`,
  );
  if (reportOnA.historically_valid && reportOnA.currently_trusted) {
    ok("A verified a record it never received from its author — no contact with B");
  } else {
    fail("A did not report B's attestation as trusted");
  }

  // ------------------------------------------------- 3. revocation propagation
  await call(a, "revoke_membership", {
    membership_hash: membershipHash,
    grounds: { Administrative: null },
    evidence_hashes: [],
    notes: "accreditation withdrawn by the issuing authority",
  });
  ok("A revoked the accreditation");

  const afterOnB = await until("revocation reached conductor B", async () => {
    const r = await call(b, "verify_attestation", attHash);
    return variant(r.revocation) !== "Clean" ? r : null;
  });
  log(
    `        membership=${variant(afterOnB.membership)} revocation=${variant(afterOnB.revocation)} ` +
      `historically_valid=${afterOnB.historically_valid} currently_trusted=${afterOnB.currently_trusted}`,
  );
  if (afterOnB.historically_valid && !afterOnB.currently_trusted) {
    ok("B now distrusts its own record, while it stays historically valid");
  } else {
    fail(
      `expected historically_valid=true and currently_trusted=false on B; got ` +
        `${afterOnB.historically_valid}/${afterOnB.currently_trusted}`,
    );
  }

  log(failed ? "\nFAILED\n" : "\nDone.\n");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  fail("unhandled", e);
  process.exit(1);
});
