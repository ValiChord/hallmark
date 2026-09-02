import { useCallback, useEffect, useRef, useState } from "react";
import { decodeHashFromBase64 } from "@holochain/client";
import QRCode from "qrcode";
import { Demonstration } from "./Demonstration";
import { call, connect, recordEntry, recordHash, b64, type NodeInfo } from "./hc";

type Tab = "demo" | "node" | "network" | "accredit" | "attest" | "verify";

const TABS: { id: Tab; label: string }[] = [
  { id: "demo", label: "Demonstration" },
  { id: "node", label: "This node" },
  { id: "network", label: "Network" },
  { id: "accredit", label: "Accredit" },
  { id: "attest", label: "Attest" },
  { id: "verify", label: "Verify" },
];

/** Bridged from the main process — see src/preload/happ.ts. */
type HallmarkBridge = {
  getNetworkKey(): Promise<string>;
  setNetworkKey(key: string): Promise<boolean>;
  getPeerInfo(): Promise<string>;
  addPeerInfo(encoded: string): Promise<number>;
  getServers(): Promise<{ bootstrapUrl: string; relayUrl: string; isDefault: boolean }>;
  setServers(bootstrapUrl?: string, relayUrl?: string): Promise<boolean>;
};
const bridge = (): HallmarkBridge | undefined =>
  (window as unknown as { __HALLMARK__?: HallmarkBridge }).__HALLMARK__;

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
  const [tab, setTab] = useState<Tab>("demo");
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

      {tab === "demo" ? <Demonstration node={node} /> : null}
      {tab === "node" ? <NodePanel node={node} /> : null}
      {tab === "network" ? <NetworkPanel setBanner={setBanner} /> : null}
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

/**
 * Joining a network, and finding each other, with nobody's server involved.
 *
 * Two things travel between devices and they are not the same:
 *
 *  - the **network key** says which network this is. It never expires, and
 *    holding it grants no authority — you still have to be accredited.
 *  - **peer info** says where a device is right now. It is signed with a
 *    20-minute expiry, so it cannot go in a durable invite. Swap it live.
 */
function NetworkPanel({ setBanner }: { setBanner: (b: Banner) => void }) {
  const api = bridge();
  const [networkKey, setNetworkKey] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [myPeer, setMyPeer] = useState("");
  const [theirPeer, setTheirPeer] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.getNetworkKey().then(setNetworkKey).catch(() => undefined);
  }, [api]);

  if (!api) {
    return (
      <div className="card">
        <h2>Not available</h2>
        <p className="lede small">
          This panel needs the desktop app's bridge to the conductor's admin interface.
        </p>
      </div>
    );
  }

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text);
    setBanner({ ok: true, text: `${what} copied to the clipboard.` });
  };

  const refreshPeer = async () => {
    setBusy(true);
    try {
      setMyPeer(await api.getPeerInfo());
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>1. The network key</h2>
        <p className="lede small" style={{ marginBottom: 12 }}>
          This says <em>which network</em> — its root authorities, its seed, its vocabularies. It
          does not expire, and it grants nothing on its own: whoever holds it still has to be
          accredited before they can sign anything. Send it however you like.
        </p>
        <textarea readOnly rows={3} value={networkKey} onFocus={(e) => e.currentTarget.select()} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="ghost" onClick={() => void copy(networkKey, "Network key")}>
            Copy my network key
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Join someone else's network</h2>
        <p className="lede small" style={{ marginBottom: 12 }}>
          Paste their key and restart. Your agent key is kept, so anything already issued to you
          still applies — but you will be on <em>their</em> network, and records on your old one
          will no longer be visible.
        </p>
        <textarea
          rows={3}
          value={joinKey}
          onChange={(e) => setJoinKey(e.target.value)}
          placeholder="Paste a network key here"
        />
        <button
          className="action"
          style={{ marginTop: 10 }}
          disabled={busy || !joinKey.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              await api.setNetworkKey(joinKey);
              setBanner({
                ok: true,
                text: "Network key accepted. Close and reopen the app to join.",
              });
              setJoinKey("");
            } catch (e) {
              setBanner({ ok: false, text: reason(e) });
            } finally {
              setBusy(false);
            }
          }}
        >
          Join this network
        </button>
      </div>

      <ServersCard setBanner={setBanner} />

      <JoinCode networkKey={networkKey} setBanner={setBanner} />

      <div className="card">
        <h2>3. Introduce your devices</h2>
        <p className="lede small" style={{ marginBottom: 12 }}>
          Same network is not the same as <em>having found each other</em>. Swap the text below
          between devices — each end pastes the other's — and they connect directly, with no
          bootstrap server and no third party. <strong>It expires after 20 minutes</strong>, so do
          it while both devices are running, and press Refresh if it goes stale.
        </p>
        <textarea readOnly rows={4} value={myPeer} onFocus={(e) => e.currentTarget.select()} />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="ghost" onClick={() => void refreshPeer()} disabled={busy}>
            {myPeer ? "Refresh" : "Show my peer info"}
          </button>
          {myPeer ? (
            <button className="ghost" onClick={() => void copy(myPeer, "Peer info")}>
              Copy
            </button>
          ) : null}
        </div>

        <div style={{ marginTop: 18 }}>
          <textarea
            rows={4}
            value={theirPeer}
            onChange={(e) => setTheirPeer(e.target.value)}
            placeholder="Paste the other device's peer info here"
          />
          <button
            className="action"
            style={{ marginTop: 10 }}
            disabled={busy || !theirPeer.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                const n = await api.addPeerInfo(theirPeer);
                setBanner({
                  ok: true,
                  text: `Introduced to ${n} peer${n === 1 ? "" : "s"}. Records should start arriving.`,
                });
                setTheirPeer("");
              } catch (e) {
                setBanner({ ok: false, text: reason(e) });
              } finally {
                setBusy(false);
              }
            }}
          >
            Add this peer
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * One code that carries everything a phone needs to join.
 *
 * Both halves in a single scan: the network key (which network, permanent) and
 * this device's peer info (where to find it, 20-minute expiry). Measured at
 * ~860 characters against a QR ceiling of 2,953 bytes, so it fits with room for
 * the higher error correction a camera reading a screen wants.
 *
 * Deliberately one-directional. The phone learns this device; once it connects,
 * this device learns the phone. There is nothing to swap back, which is the
 * whole point — pasting base64 between machines is miserable.
 */
function JoinCode({
  networkKey,
  setBanner,
}: {
  networkKey: string;
  setBanner: (b: Banner) => void;
}) {
  const api = bridge()!;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [madeAt, setMadeAt] = useState<Date | null>(null);

  const generate = useCallback(async () => {
    if (!networkKey) return;
    setBusy(true);
    try {
      const peer = await api.getPeerInfo();
      const payload = JSON.stringify({ v: 1, k: networkKey, p: JSON.parse(peer) });
      setSize(payload.length);
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#0c0e11", light: "#e8e6e1" },
        });
      }
      setMadeAt(new Date());
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  }, [api, networkKey, setBanner]);

  useEffect(() => {
    void generate();
  }, [generate]);

  return (
    <div className="card">
      <h2>Join by scanning</h2>
      <p className="lede small" style={{ marginBottom: 14 }}>
        One code, both halves: which network this is, and where to find this device. A phone that
        scans it joins and connects in a single step — no copying, no pasting.
      </p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        <canvas
          ref={canvasRef}
          style={{ background: "#e8e6e1", borderRadius: 10, padding: 8, width: 320, height: 320 }}
        />
        <div style={{ minWidth: 220, flex: 1 }}>
          <div className="kv">
            <span className="k">Payload</span>
            <span className="v">{size ? `${size} characters` : "—"}</span>
          </div>
          <div className="kv">
            <span className="k">Generated</span>
            <span className="v">{madeAt ? madeAt.toLocaleTimeString() : "—"}</span>
          </div>
          <p className="lede small" style={{ marginBottom: 12 }}>
            The peer half <strong>expires after 20 minutes</strong>. If a device fails to connect,
            regenerate and scan again — the network half never goes stale, so nothing is lost by
            doing it twice.
          </p>
          <button className="ghost" onClick={() => void generate()} disabled={busy}>
            {busy ? "Generating…" : "Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Where this device looks for peers, and how it reaches them.
 *
 * Not part of the network's identity — these are conductor settings, so two
 * devices can use different servers and still be on the same network. What they
 * cannot do is find each other without *some* server in common, and a node's
 * address is itself a path on the relay, so a reachable relay is required even
 * when peers are introduced by hand.
 */
function ServersCard({ setBanner }: { setBanner: (b: Banner) => void }) {
  const api = bridge()!;
  const [bootstrap, setBootstrap] = useState("");
  const [relay, setRelay] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getServers()
      .then((s) => {
        setBootstrap(s.bootstrapUrl);
        setRelay(s.relayUrl);
        setIsDefault(s.isDefault);
      })
      .catch(() => undefined);
  }, [api]);

  const save = async (b?: string, r?: string) => {
    setBusy(true);
    try {
      await api.setServers(b, r);
      const s = await api.getServers();
      setBootstrap(s.bootstrapUrl);
      setRelay(s.relayUrl);
      setIsDefault(s.isDefault);
      setBanner({ ok: true, text: "Saved. Close and reopen the app to use it." });
    } catch (e) {
      setBanner({ ok: false, text: reason(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>2. Where to find peers</h2>
      <p className="lede small" style={{ marginBottom: 12 }}>
        <strong>Bootstrap</strong> answers "who is out there". <strong>Relay</strong> answers "how
        do I reach them" — and a device's address is a path on the relay, so it is needed even when
        you introduce devices by hand. Neither can read your records or grant anyone authority.
      </p>
      <p className="lede small" style={{ marginBottom: 14 }}>
        {isDefault
          ? "Currently using the public servers this build shipped with."
          : "Currently using servers you configured."}{" "}
        Point these at a machine on your own network to depend on nobody — and to sidestep antivirus
        software that intercepts encrypted connections.
      </p>
      <label>
        <span>Bootstrap server</span>
        <input value={bootstrap} onChange={(e) => setBootstrap(e.target.value)} />
      </label>
      <label>
        <span>Relay server</span>
        <input value={relay} onChange={(e) => setRelay(e.target.value)} />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="action" disabled={busy} onClick={() => void save(bootstrap, relay)}>
          Save
        </button>
        {!isDefault ? (
          <button className="ghost" disabled={busy} onClick={() => void save(undefined, undefined)}>
            Back to the defaults
          </button>
        ) : null}
      </div>
    </div>
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
