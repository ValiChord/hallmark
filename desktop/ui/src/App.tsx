import { useCallback, useEffect, useState } from "react";
import { decodeHashFromBase64 } from "@holochain/client";
import { call, connect, recordEntry, recordHash, b64, type NodeInfo } from "./hc";

type Tab = "node" | "accredit" | "attest" | "verify";

const TABS: { id: Tab; label: string }[] = [
  { id: "node", label: "This node" },
  { id: "accredit", label: "Accredit" },
  { id: "attest", label: "Attest" },
  { id: "verify", label: "Verify" },
];

const RETURN_TO_SERVICE = ["OVERHAULED", "REPAIRED", "INSPECTED", "TESTED", "MODIFIED"];
const YEAR_MICROS = 31_536_000_000_000;

type Banner = { ok: boolean; text: string } | null;

/** Zome errors arrive wrapped; surface the guest message, not the wrapper. */
function reason(e: unknown): string {
  const s = String((e as { message?: string })?.message ?? e);
  const guest = s.match(/Guest\("([^"]+)"\)/);
  if (guest) return guest[1]!;
  const invalid = s.match(/InvalidCommit[^:]*:\s*(.+?)(?:"|$)/);
  if (invalid) return invalid[1]!;
  return s.slice(0, 300);
}

export function App() {
  const [node, setNode] = useState<NodeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("node");
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    connect()
      .then(setNode)
      .catch((e) => setError(reason(e)));
  }, []);

  if (error) {
    return (
      <div className="app">
        <h1>Not connected</h1>
        <p className="lede">{error}</p>
        <p className="lede small" style={{ marginTop: 12 }}>
          This window expects a Holochain conductor supplied by the desktop app. It cannot run in
          an ordinary browser tab, because there is no server for it to talk to.
        </p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="app">
        <p className="muted">Connecting to the conductor…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top">
        <p className="kicker">Hallmark · aviation provenance</p>
        <h1>Your node</h1>
        <p className="lede">
          Everything below runs on this machine. There is no server, and no account. The rules are
          in the conductor, and the records live with whoever holds them.
        </p>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {banner ? (
        <div className={`banner ${banner.ok ? "ok" : "err"}`}>{banner.text}</div>
      ) : null}

      {tab === "node" ? <NodePanel node={node} /> : null}
      {tab === "accredit" ? <Accredit node={node} setBanner={setBanner} /> : null}
      {tab === "attest" ? <Attest node={node} setBanner={setBanner} /> : null}
      {tab === "verify" ? <Verify setBanner={setBanner} /> : null}
    </div>
  );
}

function NodePanel({ node }: { node: NodeInfo }) {
  return (
    <>
      <div className="card">
        <h2>Identity</h2>
        <div className="kv">
          <span className="k">Your agent key</span>
          <span className="v">{node.agentB64}</span>
        </div>
        <div className="kv">
          <span className="k">Installed app</span>
          <span className="v">{node.installedAppId}</span>
        </div>
        <p className="lede small">
          This key was generated on this machine and never left it. Nobody issued it to you, and
          nobody can take it away.
        </p>
      </div>

      <div className="card">
        <h2>The rules everyone is running</h2>
        <div className="kv">
          <span className="k">DNA hash</span>
          <span className="v">{node.dnaB64}</span>
        </div>
        <p className="lede small">
          This is a checksum over the validation rules, the entry types, and the network's
          configuration — including who its root authorities are. Two nodes can only see each
          other's records if this string matches exactly. Change one rule and you are on a
          different network, not a permissive version of this one.
        </p>
        <p className="lede small" style={{ marginTop: 10 }}>
          <strong>That is the thing worth checking.</strong> Ask anyone else running this app to
          read theirs out. If it matches, the software cannot be quietly applying different rules
          for them than for you.
        </p>
      </div>
    </>
  );
}

function Accredit({ node, setBanner }: { node: NodeInfo; setBanner: (b: Banner) => void }) {
  const [agent, setAgent] = useState("");
  const [org, setOrg] = useState("AeroFix MRO Ltd");
  const [orgId, setOrgId] = useState("UK.145.01234");
  const [cert, setCert] = useState("UK.145.01234");
  const [authority, setAuthority] = useState("EASA");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setBanner(null);
    try {
      const record = await call("issue_membership", {
        agent_pubkey: Array.from(decodeHashFromBase64(agent.trim())),
        role: "Mro",
        organisation: org,
        organisation_id: orgId,
        accreditation: {
          accreditation_type: "EasaPart145",
          cert_number: cert,
          issuing_authority: authority,
        },
        expires_at: Date.now() * 1000 + YEAR_MICROS / 2,
        issuer_agent: Array.from(node.agentPubKey),
        issuer_membership_hash: null,
        predecessor_membership_hash: null,
        rotation_handoff_hash: null,
        rotation_acceptance_hash: null,
        depth: 1,
      });
      const hash = recordHash(record as never);
      setBanner({ ok: true, text: `Accreditation issued: ${hash ? b64(hash) : "committed"}` });
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Issue an accreditation</h2>
      <p className="lede small" style={{ marginBottom: 14 }}>
        Only a root authority of this network can do this, and only for someone else — the zome
        rejects self-issuance. If you are not a root, the attempt below will be refused, and the
        refusal is the interesting part: nothing stops you <em>trying</em>.
      </p>
      <label>
        <span>Agent key to accredit</span>
        <input
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          placeholder="uhCAk… (ask them to read it from their This node tab)"
          required
        />
      </label>
      <div className="grid">
        <label>
          <span>Organisation</span>
          <input value={org} onChange={(e) => setOrg(e.target.value)} required />
        </label>
        <label>
          <span>Organisation id</span>
          <input value={orgId} onChange={(e) => setOrgId(e.target.value)} required />
        </label>
        <label>
          <span>Certificate number</span>
          <input value={cert} onChange={(e) => setCert(e.target.value)} required />
        </label>
        <label>
          <span>Issuing authority</span>
          <input value={authority} onChange={(e) => setAuthority(e.target.value)} required />
        </label>
      </div>
      <button className="action" disabled={busy || !agent.trim()}>
        {busy ? "Issuing…" : "Issue accreditation"}
      </button>
    </form>
  );
}

function Attest({ node, setBanner }: { node: NodeInfo; setBanner: (b: Banner) => void }) {
  const [memberships, setMemberships] = useState<{ hash: string; org: string }[]>([]);
  const [membershipHash, setMembershipHash] = useState("");
  const [partNumber, setPartNumber] = useState("CFM56-7B27");
  const [serial, setSerial] = useState("577737");
  const [docId, setDocId] = useState("AFX-2026-0142");
  const [status, setStatus] = useState("INSPECTED");
  const [notObserved, setNotObserved] = useState<string[]>(["OVERHAULED"]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const records = await call<unknown[]>("get_memberships_for_agent", Array.from(node.agentPubKey));
      const rows = records.map((r) => {
        const entry = recordEntry<{ organisation?: string }>(r);
        const hash = recordHash(r as never);
        return { hash: hash ? b64(hash) : "", org: entry?.organisation ?? "(unnamed)" };
      });
      setMemberships(rows);
      if (rows[0]) setMembershipHash(rows[0].hash);
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    }
  }, [node.agentPubKey, setBanner]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setBanner(null);
    try {
      const record = await call("create_attestation", {
        raf_version: "0.1",
        subject: {
          part_type: "Engine",
          part_number: partNumber,
          serial_number: serial,
          description: `${partNumber} ${serial}`,
        },
        binding: {
          certification_path: "ReturnToService",
          binds_field: "serial_and_part",
          document_type: "EasaForm1",
          document_id: docId,
          document_digest: `sha256:${docId.padEnd(24, "x").slice(0, 24)}`,
          predecessor_document_hash: null,
        },
        scope: {
          observed: [{ assertion_id: status, value: { Bool: true } }],
          not_observed: notObserved.filter((n) => n !== status),
        },
        evidence: [
          { evidence_type: "shop_traveler", digest: `sha256:${serial}0000000000000000`, locator: null },
        ],
        attester: {
          agent_pubkey: Array.from(node.agentPubKey),
          role: "Mro",
          organisation: memberships.find((m) => m.hash === membershipHash)?.org ?? "",
          organisation_id: "UK.145.01234",
        },
        membership_proof_hash: Array.from(decodeHashFromBase64(membershipHash)),
        anchor: null,
      });
      const hash = recordHash(record as never);
      setBanner({
        ok: true,
        text: `Attestation signed: ${hash ? b64(hash) : "committed"} — hand that hash to anyone to verify.`,
      });
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  if (memberships.length === 0) {
    return (
      <div className="card">
        <h2>No accreditation</h2>
        <p className="lede small">
          You hold no membership on this network, so you cannot sign anything — which is the rule
          doing its job, not a bug. Ask a root authority to accredit your key:
        </p>
        <div className="kv" style={{ marginTop: 12 }}>
          <span className="k">Your agent key</span>
          <span className="v">{node.agentB64}</span>
        </div>
        <button className="ghost" onClick={() => void load()}>
          Check again
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Sign a return to service</h2>
      <p className="lede small" style={{ marginBottom: 14 }}>
        FAA Form 8130-3, blocks 14a–14e. The Status/work list is the one AC 43-9D Table B-1
        permits for this path — the airworthiness terms are not offered here, and the zome would
        refuse them anyway.
      </p>
      <label>
        <span>Signing under</span>
        <select value={membershipHash} onChange={(e) => setMembershipHash(e.target.value)}>
          {memberships.map((m) => (
            <option key={m.hash} value={m.hash}>
              {m.org} · {m.hash.slice(0, 14)}…
            </option>
          ))}
        </select>
      </label>
      <div className="grid">
        <label>
          <span>Part number · block 8</span>
          <input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} required />
        </label>
        <label>
          <span>Serial number · block 10</span>
          <input value={serial} onChange={(e) => setSerial(e.target.value)} required />
        </label>
        <label>
          <span>Form tracking number · block 3</span>
          <input value={docId} onChange={(e) => setDocId(e.target.value)} required />
        </label>
        <label>
          <span>Status / work · block 11</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {RETURN_TO_SERVICE.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>Explicitly not checked</span>
        <select
          multiple
          size={5}
          value={notObserved}
          onChange={(e) =>
            setNotObserved([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {RETURN_TO_SERVICE.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <p className="lede small" style={{ marginBottom: 14 }}>
        This is the load-bearing field. Recording what you did <em>not</em> check is what stops
        silence being read later as agreement.
      </p>
      <button className="action" disabled={busy}>
        {busy ? "Signing…" : "Sign attestation"}
      </button>
    </form>
  );
}

type Report = {
  author_matches_attester: boolean;
  binding_well_formed: boolean;
  membership: unknown;
  predecessor: unknown;
  revocation: unknown;
  historically_valid: boolean;
  currently_trusted: boolean;
};

/** Serde renders unit variants as strings and data-carrying ones as one-key objects. */
function variant(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return Object.keys(v)[0] ?? String(v);
  return String(v);
}

function Verify({ setBanner }: { setBanner: (b: Banner) => void }) {
  const [hash, setHash] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setBanner(null);
    setReport(null);
    try {
      const r = await call<Report>("verify_attestation", Array.from(decodeHashFromBase64(hash.trim())));
      setReport(r);
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="card" onSubmit={run}>
        <h2>Verify a record</h2>
        <p className="lede small" style={{ marginBottom: 14 }}>
          Paste an attestation hash from anyone on this network. You do not need to contact whoever
          signed it, and they do not need to be online — the record and the accreditation behind it
          are fetched from the network and checked here, by your node, against rules your node also
          holds.
        </p>
        <label>
          <span>Attestation hash</span>
          <input value={hash} onChange={(e) => setHash(e.target.value)} placeholder="uhCkk…" required />
        </label>
        <button className="action" disabled={busy || !hash.trim()}>
          {busy ? "Verifying…" : "Verify"}
        </button>
      </form>

      {report ? (
        <div className="card">
          <h2>Verification report</h2>
          <Row name="Signed by the named attester" yes={report.author_matches_attester} />
          <Row name="Binding well formed" yes={report.binding_well_formed} />
          <Row name="Membership" text={variant(report.membership)} />
          <Row name="Predecessor" text={variant(report.predecessor)} />
          <Row name="Revocation" text={variant(report.revocation)} />
          <Row name="Historically valid" yes={report.historically_valid} />
          <Row name="Currently trusted" yes={report.currently_trusted} />
          <p className="lede small" style={{ marginTop: 14 }}>
            The last two are deliberately separate. A certificate signed while a shop held a valid
            approval stays a real document even after that approval is withdrawn — what a later
            revocation removes is grounds for <em>new</em> reliance, not the history.
          </p>
        </div>
      ) : null}
    </>
  );
}

function Row({ name, yes, text }: { name: string; yes?: boolean; text?: string }) {
  return (
    <div className="verdict">
      <span className="name">{name}</span>
      {text !== undefined ? (
        <span className="val">{text}</span>
      ) : (
        <span className={`val ${yes ? "yes" : "no"}`}>{yes ? "yes" : "no"}</span>
      )}
    </div>
  );
}
