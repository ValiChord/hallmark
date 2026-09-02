#!/usr/bin/env node
/**
 * Two desktop app instances, one DHT.
 *
 * Drives two already-running Hallmark app instances through their admin
 * interfaces and proves the thing the whole project claims: a record authored
 * on one node is fetched and verified by another node that never spoke to the
 * author.
 *
 * This is not the packaged app's own UI — it is the same conductors the app is
 * running, addressed directly, so the result says something about the app
 * rather than about a test harness.
 *
 * Run two instances with fixed admin ports first:
 *   ADMIN_PORT=9600 npm run dev
 *   ADMIN_PORT=9601 npx electron out/main/index.js --profile bob
 *
 * Then:  node scripts/two-node-check.mjs
 */
import { AdminWebsocket, AppWebsocket, encodeHashToBase64 } from "@holochain/client";

const PORT_A = Number(process.env.PORT_A ?? 9600);
const PORT_B = Number(process.env.PORT_B ?? 9601);
const APP_ID = "kangaroo.happ";
const ROLE = "aviation";
const ZOME = "aviation_attestation_coordinator";
const TIMEOUT_MS = Number(process.env.GOSSIP_TIMEOUT_MS ?? 120000);
const YEAR_MICROS = 31_536_000_000_000;

const log = (...a) => console.error(...a);
const ok = (m) => log(`  PASS  ${m}`);
const fail = (m, e) => {
  console.error(`  FAIL  ${m}`);
  if (e) console.error(String(e?.message ?? e).slice(0, 500));
  process.exitCode = 1;
};

async function nodeAt(port, label) {
  const admin = await AdminWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${port}`),
    wsClientOptions: { origin: "kangaroo" },
  });
  const apps = await admin.listApps({});
  const app = apps.find((a) => a.installed_app_id === APP_ID);
  if (!app) throw new Error(`${label}: ${APP_ID} is not installed on port ${port}`);

  const cells = app.cell_info[ROLE] ?? [];
  const provisioned = cells.find((c) => c.type === "provisioned" || c.provisioned);
  const cellId = (provisioned.value ?? provisioned.provisioned).cell_id;
  await admin.authorizeSigningCredentials(cellId);

  const interfaces = await admin.listAppInterfaces();
  const appPort =
    interfaces.length > 0
      ? interfaces[0].port
      : (await admin.attachAppInterface({ allowed_origins: "kangaroo" })).port;

  const token = await admin.issueAppAuthenticationToken({ installed_app_id: APP_ID });
  const client = await AppWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${appPort}`),
    token: token.token,
    wsClientOptions: { origin: "kangaroo" },
  });

  const call = (fn_name, payload) =>
    client.callZome({ role_name: ROLE, zome_name: ZOME, fn_name, payload: payload ?? null });

  return { label, admin, cellId, dna: cellId[0], agent: cellId[1], call };
}

const until = async (label, fn) => {
  const deadline = Date.now() + TIMEOUT_MS;
  let last;
  while (Date.now() < deadline) {
    try {
      const v = await fn();
      if (v) return v;
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`timed out waiting for ${label}: ${String(last?.message ?? last ?? "")}`);
};

async function main() {
  log("\nHallmark: two desktop instances, one DHT\n");

  const a = await nodeAt(PORT_A, "A");
  const b = await nodeAt(PORT_B, "B");
  ok(`connected to both conductors (${PORT_A}, ${PORT_B})`);

  const dnaA = encodeHashToBase64(a.dna);
  const dnaB = encodeHashToBase64(b.dna);
  if (dnaA !== dnaB) {
    fail(`different networks:\n        A ${dnaA}\n        B ${dnaB}`);
    return;
  }
  ok(`same DNA hash — identical rules: ${dnaA.slice(0, 24)}…`);
  log(`        A agent ${encodeHashToBase64(a.agent).slice(0, 20)}…`);
  log(`        B agent ${encodeHashToBase64(b.agent).slice(0, 20)}…`);

  // Introduce them directly — no bootstrap server, no relay, no third party.
  // This is what the app's Network tab does when you paste peer info across.
  const [infoA, infoB] = await Promise.all([
    a.admin.agentInfo({ dna_hashes: null }),
    b.admin.agentInfo({ dna_hashes: null }),
  ]);
  await Promise.all([
    a.admin.addAgentInfo({ agent_infos: infoB }),
    b.admin.addAgentInfo({ agent_infos: infoA }),
  ]);
  ok("introduced directly — peer info swapped both ways, no bootstrap server");

  // A is the root of this network (its key is in initial_members), so A
  // accredits B. This is the only thing a root can do that nobody else can.
  let membership;
  try {
    membership = await a.call("issue_membership", {
      agent_pubkey: b.agent,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
      accreditation: {
        accreditation_type: "EasaPart145",
        cert_number: "UK.145.01234",
        issuing_authority: "EASA",
      },
      expires_at: Date.now() * 1000 + YEAR_MICROS / 2,
      issuer_agent: a.agent,
      issuer_membership_hash: null,
      predecessor_membership_hash: null,
      rotation_handoff_hash: null,
      rotation_acceptance_hash: null,
      depth: 1,
    });
    ok("A accredited B");
  } catch (e) {
    fail("issue_membership on A", e);
    return;
  }
  const membershipHash = membership.signed_action?.hashed?.hash ?? membership;

  // B cannot sign until A's accreditation has reached it. This is the gossip.
  await until("the accreditation to reach B", async () => {
    const found = await b.call("get_memberships_for_agent", b.agent);
    return found.length > 0;
  });
  ok("the accreditation reached B by gossip");

  let attestation;
  try {
    attestation = await b.call("create_attestation", {
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
        document_id: `AFX-2NODE-${Date.now().toString(36)}`,
        document_digest: "sha256:0d5f3c2b9a71e4d8c6b2f014",
        predecessor_document_hash: null,
      },
      scope: {
        observed: [{ assertion_id: "INSPECTED", value: { Bool: true } }],
        not_observed: ["OVERHAULED"],
      },
      evidence: [
        { evidence_type: "shop_traveler", digest: "sha256:a1b2c3d4e5f60718293a4b5c", locator: null },
      ],
      attester: {
        agent_pubkey: b.agent,
        role: "Mro",
        organisation: "AeroFix MRO Ltd",
        organisation_id: "UK.145.01234",
      },
      membership_proof_hash: membershipHash,
      anchor: null,
    });
    ok("B signed an attestation under A's accreditation");
  } catch (e) {
    fail("create_attestation on B", e);
    return;
  }
  const attHash = attestation.signed_action?.hashed?.hash ?? attestation;

  // THE POINT. A verifies a record it did not author, using an accreditation
  // chain it walks itself, without asking B for anything.
  const report = await until("A to verify B's attestation", async () => {
    try {
      return await a.call("verify_attestation", attHash);
    } catch {
      return null;
    }
  });

  const variant = (v) => (typeof v === "string" ? v : Object.keys(v ?? {})[0]);
  log(
    `        membership=${variant(report.membership)} revocation=${variant(report.revocation)} ` +
      `historically_valid=${report.historically_valid} currently_trusted=${report.currently_trusted}`,
  );
  if (report.historically_valid && report.currently_trusted && report.author_matches_attester) {
    ok("A verified B's attestation without contacting B");
  } else {
    fail("A did not report B's attestation as trusted");
  }

  log("\nDone.\n");
}

main().catch((e) => {
  fail("two-node check", e);
  process.exit(1);
});
