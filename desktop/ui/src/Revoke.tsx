import { useCallback, useState } from "react";
import { call, recordEntry, recordHash, b64, parseAgentKey, parseActionHash, type NodeInfo } from "./hc";

/**
 * Withdrawing an accreditation.
 *
 * Only `Administrative` grounds are offered here, and that is deliberate. The
 * evidence-bearing grounds — DuplicateDocument, ConflictingAssertions,
 * DuplicateCertIssuance — require the validator to fetch records that actually
 * demonstrate the fault, so they cannot be driven from a form: you would be
 * asking a person to hunt for two contradictory attestation hashes. Those are
 * exercised by the conductor tests.
 *
 * Administrative is the one a demonstration needs. The zome restricts it to the
 * original issuer or a DNA root (validate.rs, RevocationGrounds::Administrative),
 * which is exactly the case here: the node that accredited a device withdraws
 * that accreditation. No evidence is required, because withdrawing your own
 * grant is not collective action against anybody.
 */

type Banner = { ok: boolean; text: string } | null;

type Row = {
  hash: string;
  org: string;
  cert: string;
  expired: boolean;
  revoked: boolean;
  mine: boolean;
};

const RECALL_KEY = "hallmark.accredited";

/** Keys this node has accredited, remembered so the field is not a blank box. */
export function rememberAccredited(agentB64: string) {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECALL_KEY) ?? "[]");
    if (!prev.includes(agentB64)) {
      localStorage.setItem(RECALL_KEY, JSON.stringify([agentB64, ...prev].slice(0, 10)));
    }
  } catch {
    /* a demonstration should not die because storage is unavailable */
  }
}

function recallAccredited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECALL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function Revoke({
  node,
  setBanner,
}: {
  node: NodeInfo;
  setBanner: (b: Banner) => void;
}) {
  // Seeded once from what this node has accredited, so the field is not a blank
  // box in front of an audience. Typing over it must stick, hence a lazy initial
  // value rather than an effect that could run again.
  const recalled = recallAccredited().filter((k) => k !== node.agentB64);
  const [agent, setAgent] = useState(() => recalled[0] ?? "");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastRevoked, setLastRevoked] = useState<string | null>(null);

  const load = useCallback(async () => {
    const key = agent.trim();
    if (!key) return;
    setBusy(true);
    setBanner(null);
    setRows(null);
    try {
      const target = parseAgentKey(key);
      const [proofs, revocations] = await Promise.all([
        call<unknown[]>("get_memberships_for_agent", Array.from(target)),
        call<unknown[]>("get_revocations_for_agent", Array.from(target)),
      ]);

      const revokedHashes = new Set(
        revocations
          .map((r) => recordEntry<{ membership_hash?: Uint8Array }>(r)?.membership_hash)
          .filter(Boolean)
          .map((h) => b64(h as never)),
      );

      const now = Date.now() * 1000;
      setRows(
        proofs.map((r) => {
          const e = recordEntry<{
            organisation?: string;
            expires_at?: number;
            issuer_agent?: Uint8Array;
            accreditation?: { cert_number?: string };
          }>(r);
          const hash = recordHash(r as never);
          const h = hash ? b64(hash) : "";
          return {
            hash: h,
            org: e?.organisation ?? "(unnamed)",
            cert: e?.accreditation?.cert_number ?? "—",
            expired: typeof e?.expires_at === "number" && e.expires_at < now,
            revoked: revokedHashes.has(h),
            // The zome also accepts a DNA root; this only drives the hint text.
            mine: e?.issuer_agent ? b64(e.issuer_agent as never) === node.agentB64 : false,
          };
        }),
      );
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  }, [agent, node.agentB64, setBanner]);

  const revoke = async (row: Row) => {
    setBusy(true);
    setBanner(null);
    try {
      const record = await call("revoke_membership", {
        membership_hash: Array.from(parseActionHash(row.hash)),
        // Both `{ Administrative: null }` and the bare string "Administrative"
        // are accepted — tested against a real conductor 2026-09-04. This form is
        // used because zomes/tests/network-gossip.mjs uses it in CI, so the two
        // stay in step, not because the other one fails.
        grounds: { Administrative: null },
        evidence_hashes: [],
        notes: "Withdrawn by the issuing authority.",
      });
      const hash = recordHash(record as never);
      setLastRevoked(row.hash);
      setBanner({
        ok: true,
        text: `Accreditation withdrawn${hash ? ` — ${b64(hash)}` : ""}. Now verify that device's record again.`,
      });
      await load();
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <h2>Withdraw an accreditation</h2>
        <p className="lede small" style={{ marginBottom: 14 }}>
          This is the step that makes the point. Withdrawing an accreditation does not delete
          anything and does not reach into anybody's records — it writes a new entry saying the
          grant is over. Records already signed under it stay real; what stops is <em>new</em>{" "}
          reliance.
        </p>
        <label>
          <span>Whose accreditation</span>
          <input
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            placeholder="uhCAk… (the device you accredited)"
            list="hallmark-accredited"
            required
          />
        </label>
        {recalled.length > 0 ? (
          <datalist id="hallmark-accredited">
            {recalled.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        ) : null}
        <button className="action" disabled={busy || !agent.trim()}>
          {busy ? "Reading…" : "Find their accreditations"}
        </button>
      </form>

      {rows && rows.length === 0 ? (
        <div className="card">
          <h2>Nothing to withdraw</h2>
          <p className="lede small">
            This node has no accreditations on record. Either it was never accredited, or the grant
            has not reached your node yet — accreditations travel by gossip like everything else.
          </p>
        </div>
      ) : null}

      {rows && rows.length > 0 ? (
        <div className="card">
          <h2>Their accreditations</h2>
          <ul className="records">
            {rows.map((r) => (
              <li key={r.hash}>
                <span className="tag">{r.cert}</span>
                <span style={{ flex: 1, minWidth: 180 }}>{r.org}</span>
                {r.revoked ? (
                  <span className="val no">already withdrawn</span>
                ) : r.expired ? (
                  <span className="muted small">expired on its own</span>
                ) : (
                  <button className="ghost" disabled={busy} onClick={() => void revoke(r)}>
                    {busy ? "…" : "Withdraw"}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="lede small" style={{ marginTop: 14 }}>
            {rows.some((r) => r.mine)
              ? "You issued at least one of these, so you may withdraw it. A root authority of this network may withdraw any of them."
              : "You did not issue these. The zome will refuse unless your key is a root authority of this network — and the refusal is worth seeing."}
          </p>
        </div>
      ) : null}

      {lastRevoked ? (
        <div className="card">
          <h2>Now look at what did not change</h2>
          <p className="lede small">
            Go to <strong>Verify</strong>, on this device or any other, and check a record that
            device signed <em>before</em> the withdrawal.
          </p>
          <div className="verdict" style={{ marginTop: 12 }}>
            <span className="name">Historically valid</span>
            <span className="val yes">still yes</span>
          </div>
          <div className="verdict">
            <span className="name">Currently trusted</span>
            <span className="val no">now no</span>
          </div>
          <p className="lede small" style={{ marginTop: 14 }}>
            That pair is the whole argument. The certificate was honest when it was signed and stays
            a real document. Almost every system collapses these two into one word, and then either
            erases history or keeps trusting a shop that lost its approval.
          </p>
        </div>
      ) : null}
    </>
  );
}

/** Zome errors arrive wrapped; surface the guest message, not the wrapper. */
function reason(e: unknown): string {
  const s = String((e as { message?: string })?.message ?? e);
  const guest = s.match(/Guest\("([^"]+)"\)/);
  if (guest) return guest[1]!;
  const invalid = s.match(/InvalidCommit[^:]*:\s*(.+?)(?:"|$)/);
  if (invalid) return invalid[1]!;
  return s.slice(0, 300);
}
