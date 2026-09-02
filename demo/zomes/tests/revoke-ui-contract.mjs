/**
 * Does the desktop Revoke tab actually work?
 *
 * network-gossip.mjs already proves revoke_membership with
 * `{ Administrative: null }` across two conductors. What it does NOT prove is
 * the desktop UI's own logic, which was written against assumed entry shapes:
 *
 *   - that get_memberships_for_agent entries expose organisation, expires_at,
 *     issuer_agent and accreditation.cert_number under those names;
 *   - that get_revocations_for_agent entries expose membership_hash, so the
 *     UI can mark a grant "already withdrawn" instead of offering it twice;
 *   - that a base64 ActionHash from the list round-trips back into a revoke.
 *
 * Every one of those was a guess. This replays the exact sequence the tab runs.
 */
import { AdminWebsocket, AppWebsocket, encodeHashToBase64, decodeHashFromBase64 } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const HAPP = join(HERE, "..", "aviation_provenance.happ");
const ADMIN_PORT = Number(process.env.ADMIN_PORT ?? 9000);
const RUN = Date.now().toString(36);
const ORIGIN = "revoke-ui-check";

const log = (...a) => console.error(...a);
const ok = (m) => log(`  PASS  ${m}`);
let failed = false;
const fail = (m, e) => {
  failed = true;
  console.error(`  FAIL  ${m}`);
  if (e) console.error(String(e?.message ?? e).slice(0, 600));
};

const YEAR_MICROS = 31_536_000_000_000;
const nowMicros = () => Date.now() * 1000;

// --- the two helpers the UI uses, copied verbatim from desktop/ui/src/hc.ts ---
const recordHash = (r) => r?.signed_action?.hashed?.hash;
const recordEntry = (r) => {
  const present = r?.entry?.Present?.entry;
  return present ? decode(present) : undefined;
};
const variant = (v) => (typeof v === "string" ? v : v && typeof v === "object" ? Object.keys(v)[0] : String(v));

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
            network_seed: `revoke-ui-${RUN}`,
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
  log("\nDesktop Revoke tab — end to end against a real conductor\n");

  const admin = await AdminWebsocket.connect({
    url: new URL(`ws://127.0.0.1:${ADMIN_PORT}`),
    wsClientOptions: { origin: ORIGIN },
  });

  const rootKey = await admin.generateAgentPubKey();
  const mroKey = await admin.generateAgentPubKey();
  const rootB64 = encodeHashToBase64(rootKey);
  const mroB64 = encodeHashToBase64(mroKey);

  await installFor(admin, `rv-root-${RUN}`, rootKey, [rootB64]);
  await installFor(admin, `rv-mro-${RUN}`, mroKey, [rootB64]);
  const iface = await admin.attachAppInterface({ allowed_origins: ORIGIN });
  ok(`installed root ${rootB64.slice(0, 10)}… and MRO ${mroB64.slice(0, 10)}…`);

  const clientFor = async (appId) => {
    const t = await admin.issueAppAuthenticationToken({ installed_app_id: appId });
    return AppWebsocket.connect({
      url: new URL(`ws://127.0.0.1:${iface.port}`),
      token: t.token,
      wsClientOptions: { origin: ORIGIN },
    });
  };
  const rootApp = await clientFor(`rv-root-${RUN}`);
  const mroApp = await clientFor(`rv-mro-${RUN}`);

  for (const [ws, label] of [[rootApp, "root"], [mroApp, "mro"]]) {
    const info = await ws.appInfo();
    const cells = info.cell_info.aviation ?? [];
    const p = cells.find((c) => c.type === "provisioned" || c.provisioned);
    await admin.authorizeSigningCredentials((p.value ?? p.provisioned).cell_id);
    void label;
  }
  const callAs = (ws) => (fn_name, payload) =>
    ws.callZome({ role_name: "aviation", zome_name: "aviation_attestation_coordinator", fn_name, payload });
  const callRoot = callAs(rootApp);
  const callMro = callAs(mroApp);

  // ---------------------------------------------- 1. accredit, then attest
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
  ok("root accredited the repair station");

  const att = await callMro("create_attestation", {
    raf_version: "0.1",
    subject: { part_type: "Engine", part_number: "CFM56-7B27", serial_number: "577737", description: "fan disk" },
    binding: {
      certification_path: "ReturnToService",
      binds_field: "serial_and_part",
      document_type: "EasaForm1",
      document_id: "AFX-2026-0142",
      document_digest: "sha256:0d5f3c2b9a71e4d8c6b2f014",
      predecessor_document_hash: null,
    },
    scope: { observed: [{ assertion_id: "INSPECTED", value: { Bool: true } }], not_observed: ["OVERHAULED"] },
    evidence: [{ evidence_type: "shop_traveler", digest: "sha256:a1b2c3d4e5f60718293a4b5c", locator: null }],
    attester: {
      agent_pubkey: mroKey,
      role: "Mro",
      organisation: "AeroFix MRO Ltd",
      organisation_id: "UK.145.01234",
    },
    membership_proof_hash: membershipHash,
    anchor: null,
  });
  const attHash = recordHash(att);
  ok("repair station signed an attestation");

  const before = await callRoot("verify_attestation", attHash);
  log(`        historically_valid=${before.historically_valid} currently_trusted=${before.currently_trusted} revocation=${variant(before.revocation)}`);
  if (before.historically_valid && before.currently_trusted) ok("before: historically valid AND currently trusted");
  else fail("expected the record to verify as trusted before revocation");

  // ------------------------------- 2. what the Revoke tab does when you search
  const listRows = async () => {
    const [proofs, revocations] = await Promise.all([
      callRoot("get_memberships_for_agent", mroKey),
      callRoot("get_revocations_for_agent", mroKey),
    ]);
    const revokedHashes = new Set(
      revocations.map((r) => recordEntry(r)?.membership_hash).filter(Boolean).map((h) => encodeHashToBase64(h)),
    );
    const now = nowMicros();
    return proofs.map((r) => {
      const e = recordEntry(r);
      const h = encodeHashToBase64(recordHash(r));
      return {
        hash: h,
        org: e?.organisation ?? "(unnamed)",
        cert: e?.accreditation?.cert_number ?? "—",
        expired: typeof e?.expires_at === "number" && e.expires_at < now,
        revoked: revokedHashes.has(h),
        mine: e?.issuer_agent ? encodeHashToBase64(e.issuer_agent) === rootB64 : false,
      };
    });
  };

  const rows = await listRows();
  if (rows.length !== 1) fail(`expected exactly one accreditation, got ${rows.length}`);
  const row = rows[0];
  log(`        row: org=${JSON.stringify(row.org)} cert=${JSON.stringify(row.cert)} expired=${row.expired} revoked=${row.revoked} mine=${row.mine}`);

  if (row.org === "AeroFix MRO Ltd") ok("UI parses organisation");
  else fail(`organisation parsed as ${JSON.stringify(row.org)} — the tab would show "(unnamed)"`);
  if (row.cert === "UK.145.01234") ok("UI parses accreditation.cert_number");
  else fail(`cert_number parsed as ${JSON.stringify(row.cert)} — the tab would show a dash`);
  if (row.expired === false) ok("UI parses expires_at (not expired)");
  else fail("expires_at misparsed — a live grant would be shown as expired and offer no button");
  if (row.mine === true) ok("UI parses issuer_agent (recognises this node issued it)");
  else fail("issuer_agent misparsed — the tab would show the wrong hint text");
  if (row.revoked === false) ok("UI sees it as not yet withdrawn");
  else fail("a fresh grant was reported as already withdrawn");

  // ------------------------------------- 3. the button: exactly the UI's call
  try {
    await callRoot("revoke_membership", {
      membership_hash: Array.from(decodeHashFromBase64(row.hash)),
      grounds: { Administrative: null },
      evidence_hashes: [],
      notes: "Withdrawn by the issuing authority.",
    });
    ok("Withdraw button's call accepted (base64 hash round-tripped, Administrative grounds)");
  } catch (e) {
    fail("revoke_membership rejected the UI's payload", e);
  }

  const after = await listRows();
  if (after[0]?.revoked === true) ok("UI now marks it 'already withdrawn' rather than offering it twice");
  else fail("the tab would still show a Withdraw button for an already-withdrawn grant");

  // ------------------------------------------------------ 4. does it flip?
  const report = await callRoot("verify_attestation", attHash);
  log(`        historically_valid=${report.historically_valid} currently_trusted=${report.currently_trusted} revocation=${variant(report.revocation)}`);
  if (report.historically_valid === true && report.currently_trusted === false) {
    ok("IT FLIPS — historically valid stays true, currently trusted is now false");
  } else {
    fail(`expected true/false, got ${report.historically_valid}/${report.currently_trusted}`);
  }
  if (variant(report.revocation) === "RevokedAfterAssertion") ok("revocation reported as RevokedAfterAssertion");
  else fail(`revocation reported as ${variant(report.revocation)}`);

  log(failed ? "\nFAILED\n" : "\nAll checks passed.\n");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  fail("unhandled", e);
  process.exit(1);
});
