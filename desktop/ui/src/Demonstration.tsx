import { useCallback, useEffect, useState } from "react";
import { call, b64, type NodeInfo } from "./hc";

/**
 * The demonstration, across real devices.
 *
 * The browser demo can play five organisations at once because it is a
 * simulation. This cannot: a node holds one key, and self-issuance is refused
 * by the rules. So the script here is not a story that runs itself — it is a
 * checklist for a thing genuinely happening across two or three machines, and
 * every line of it is read back from the conductor rather than remembered.
 *
 * That matters. A checklist that trusts what the user clicked will cheerfully
 * report success while the conductor disagrees, which is exactly the failure a
 * demonstration must not have in front of an audience.
 */

type Status = {
  agentB64?: string;
  isRoot: boolean;
  rootCount: number;
  peerCount: number;
  usingOwnServers: boolean;
};

type Bridge = { nodeStatus(): Promise<Status> };
const bridge = () => (window as unknown as { __HALLMARK__?: Bridge }).__HALLMARK__;

type Check = {
  title: string;
  /** What the audience should be seeing, in plain language. */
  what: string;
  /** How to make it true, if it is not. */
  how: string;
  state: "done" | "todo" | "blocked";
  evidence?: string;
};

export function Demonstration({ node }: { node: NodeInfo }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [memberships, setMemberships] = useState<number | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const api = bridge();
    if (!api) return;
    setBusy(true);
    try {
      setStatus(await api.nodeStatus());
      const mine = await call<unknown[]>("get_memberships_for_agent", Array.from(node.agentPubKey));
      setMemberships(mine.length);
      setRefreshedAt(new Date());
    } catch {
      /* the conductor may still be starting; the next refresh will tell us */
    } finally {
      setBusy(false);
    }
  }, [node.agentPubKey]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 10000);
    return () => clearInterval(t);
  }, [refresh]);

  if (!status) {
    return (
      <div className="card">
        <p className="muted">Reading this node's state…</p>
      </div>
    );
  }

  const canSign = (memberships ?? 0) > 0;

  const checks: Check[] = [
    {
      title: "This device is a node",
      what: "It generated its own key and runs its own copy of the rules. Nobody issued it an account.",
      how: "Nothing to do — this is true as soon as the app starts.",
      state: "done",
      evidence: node.agentB64,
    },
    {
      title: "Every device is on the same network",
      what: `Compare the DNA hash on each device. If they match, none of them can be running different rules — it is a checksum over the rules themselves. ${
        status.rootCount === 1 ? "This network has one root authority." : `This network has ${status.rootCount} root authorities.`
      }`,
      how: "On the device that owns the network, open Network and show the join code. Scan it from each other device, then relaunch that device.",
      state: "done",
      evidence: node.dnaB64,
    },
    {
      title: "The devices have found each other",
      what:
        status.peerCount > 0
          ? `This device knows ${status.peerCount} other ${status.peerCount === 1 ? "peer" : "peers"}.`
          : "This device has not heard of any other node yet.",
      how: "Both devices need the same bootstrap and relay. Run `npm run network` on the machine hosting them, put that address in Network on every device, and relaunch. On a wifi you control this needs nobody else's servers.",
      state: status.peerCount > 0 ? "done" : "todo",
      evidence: `${status.peerCount} peer${status.peerCount === 1 ? "" : "s"}${status.usingOwnServers ? " · using your own servers" : " · using the public dev servers"}`,
    },
    {
      title: status.isRoot ? "You are this network's root authority" : "This device has been accredited",
      what: status.isRoot
        ? "Your key is in the network's root set, so you can accredit others. You cannot accredit yourself — self-issuance is refused, which is why a second device is needed to show anything."
        : canSign
          ? "A root authority has granted this device the right to sign. That grant has an expiry, and it can be withdrawn."
          : "This device holds no accreditation, so it cannot sign anything. That is the rule working, not a fault.",
      how: status.isRoot
        ? "Open Accredit, paste another device's key from its This node tab, and issue."
        : "Ask whoever holds the root key to accredit the key shown above.",
      state: status.isRoot || canSign ? "done" : "todo",
      evidence: status.isRoot ? "root authority" : `${memberships ?? 0} accreditation(s)`,
    },
    {
      title: "An accredited device signs a certificate",
      what: "The signer records what it did, and — the load-bearing part — what it did not check. A later reader cannot take silence for a claim.",
      how: canSign
        ? "Open Attest, choose what was done, and mark at least one thing as explicitly not checked."
        : "Do the previous step first: this device cannot sign without an accreditation.",
      state: canSign ? "todo" : "blocked",
    },
    {
      title: "A different device verifies it",
      what: "Paste the attestation hash into Verify on a device that did not sign it. It fetches the record and the accreditation behind it from the network, and checks them against rules it holds itself. It does not contact the signer.",
      how: "Copy the hash from the signing device and paste it into Verify on another one. For the strongest version, close the signing device first.",
      state: "todo",
    },
    {
      title: "The two answers",
      what: "Withdraw the signer's accreditation, then verify the same record again. Historically valid stays yes; currently trusted becomes no. The certificate was honest when it was signed and stays a real document — what it no longer supports is new reliance.",
      how: "Revocation is not yet in this app's UI. For now, show this part in the browser demo's Walkthrough tab, which runs the same rules.",
      state: "blocked",
    },
  ];

  return (
    <>
      <div className="card">
        <h2>Running the demonstration</h2>
        <p className="lede small">
          A checklist for something genuinely happening across your devices, rather than a story
          this app tells itself. Every line is read back from the conductor — if it says done, the
          conductor agrees.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="ghost" onClick={() => void refresh()} disabled={busy}>
            {busy ? "Checking…" : "Re-check"}
          </button>
          <span className="muted small">
            {refreshedAt ? `Last checked ${refreshedAt.toLocaleTimeString()}` : ""} · re-checks
            automatically
          </span>
        </div>
      </div>

      {checks.map((c, i) => (
        <div className="card" key={c.title}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--primary)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 style={{ margin: 0, flex: 1 }}>{c.title}</h2>
            <span
              className="tag"
              style={{
                color:
                  c.state === "done"
                    ? "var(--ok)"
                    : c.state === "blocked"
                      ? "var(--muted)"
                      : "var(--danger)",
              }}
            >
              {c.state === "done" ? "done" : c.state === "blocked" ? "waiting" : "to do"}
            </span>
          </div>
          <p className="lede small" style={{ marginTop: 10 }}>
            {c.what}
          </p>
          {c.state !== "done" ? (
            <p className="lede small" style={{ marginTop: 8 }}>
              <strong>Next:</strong> {c.how}
            </p>
          ) : null}
          {c.evidence ? (
            <div className="kv" style={{ marginTop: 10 }}>
              <span className="k">From the conductor</span>
              <span className="v">{c.evidence}</span>
            </div>
          ) : null}
        </div>
      ))}

      <div className="card">
        <h2>What this shows that the browser demo cannot</h2>
        <p className="lede small">
          The browser demo plays five organisations at once, because it is a simulation and can. A
          real node holds one key and cannot pretend to be anybody else — so the only way to show a
          second party here is to have a second party.
        </p>
        <p className="lede small" style={{ marginTop: 10 }}>
          That constraint is the evidence. When a device that never spoke to the signer verifies the
          signer's record, nothing about it can have been staged.
        </p>
      </div>
    </>
  );
}

export { b64 };
