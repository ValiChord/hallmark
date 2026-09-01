import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  FileText,
  GitBranch,
  RotateCcw,
  Shield,
  ShieldOff,
  User,
} from "lucide-react";
import { RafFooter } from "@/components/raf/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createAttestation,
  createCounter,
  issueMembership,
  latestMembership,
  revokeMembership,
  shortAgent,
  yearFromNow,
  type EngineResult,
  type EngineState,
} from "@/lib/raf/engine";
import { runHappyPath, sampleConflict, sampleInspect } from "@/lib/raf/demo";
import { useRaf } from "@/lib/raf/store";
import {
  ACCREDITATION_TYPES,
  AGREEMENT_STATUSES,
  ASSERTION_VOCABULARY,
  RETURN_TO_SERVICE_VOCABULARY,
  ATTESTER_ROLES,
  DOCUMENT_TYPES,
  PART_TYPES,
  RAF_VERSION,
  formatAssertionValue,
  groundsLabel,
  type AccreditationType,
  type AgreementStatus,
  type Attestation,
  type AttesterRole,
  type DocumentType,
  type PartType,
  type RevocationGrounds,
} from "@/lib/raf/types";
import { verifyAttestation, type VerificationReport } from "@/lib/raf/verify";

type Tab = "issue" | "attest" | "revoke" | "verify" | "ledger";

const TABS: { id: Tab; label: string }[] = [
  { id: "issue", label: "Issue" },
  { id: "attest", label: "Attest" },
  { id: "revoke", label: "Revoke" },
  { id: "verify", label: "Verify" },
  { id: "ledger", label: "Ledger" },
];

/**
 * Block 11 terms for this path, verbatim from AC 43-9D (22 Sep 2025) Table B-1.
 *
 * This used to be "the whole vocabulary, minus the three airworthiness terms" —
 * a filter, which meant the page depended on the other path's list to define its
 * own. The two lists are now separate in the DNA, as they are in the regulator's
 * own documents, and the zome rejects a term from the wrong one.
 */
const RETURN_TO_SERVICE_STATUS = RETURN_TO_SERVICE_VOCABULARY;

/** One plain sentence per tab. Nobody should have to guess what a screen is for. */
const TAB_BLURBS: Record<Tab, string> = {
  issue:
    "Grant an accreditation, with an expiry date. Nobody can sign anything without one, and only a root authority or an OEM can hand them out.",
  attest:
    "Sign a statement about a part: what you did to it, and — just as importantly — what you did not check.",
  revoke:
    "Withdraw an accreditation, citing evidence any other party can fetch and check for themselves.",
  verify:
    "Check a certificate the way a stranger would, years later, without contacting whoever signed it. This is the point of the whole exercise.",
  ledger:
    "Everything that was accepted, and every attempt that was refused. Rejected records never enter the shared space at all.",
};

function flash(result: EngineResult<{ hash: string }>): string {
  return result.ok ? `Committed ${result.value.hash}` : result.reason;
}

export function Workbench() {
  const dht = useRaf((s) => s.dht);
  const actingAs = useRaf((s) => s.actingAs);
  const setActingAs = useRaf((s) => s.setActingAs);
  const mutate = useRaf((s) => s.mutate);
  const seed = useRaf((s) => s.seed);
  const reset = useRaf((s) => s.reset);
  const [tab, setTab] = useState<Tab>("attest");
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerOk, setBannerOk] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showIntroMore, setShowIntroMore] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Only known client-side, so it cannot be the initial state without
    // causing a hydration mismatch.
    setShowIntro(window.innerWidth >= 1024);
  }, []);

  const actor = dht.agents.find((a) => a.pubkey === actingAs) ?? dht.agents[0];

  function note(result: EngineResult<{ hash: string }>, okMsg?: string) {
    setBannerOk(result.ok);
    setBanner(result.ok ? (okMsg ?? flash(result)) : result.reason);
  }

  function run(fn: (s: EngineState) => EngineResult<{ hash: string }>, okMsg?: string) {
    let captured: EngineResult<{ hash: string }> = { ok: false, reason: "no-op" };
    mutate((s) => {
      captured = fn(s);
    });
    note(captured, okMsg);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Loading ledger…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
              FAA Form 8130-3 · blocks 14a–14e
            </p>
            <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
              Approval for return to service
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              A repair station releasing a part it has worked on. Governed by AC 43-9D, under 14 CFR
              part 43.
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              <span className="text-fg">There are two forms, on two pages.</span> A part is also
              certified when it is manufactured — that is the{" "}
              <span className="text-fg">airworthiness form</span>, blocks 13a–13e, and it is where a
              chain begins. Same document, different rules, different signer.
            </p>
            <p className="mt-2 max-w-xl text-sm">
              <span className="font-medium text-fg">
                These rules are running in your browser, not on a network.
              </span>{" "}
              <span className="text-muted-foreground">
                Every check you see below is the same logic as the Holochain zome — read the Rust it
                mirrors under{" "}
              </span>
              <Link to="/source" className="underline underline-offset-4 hover:text-fg">
                Zome source
              </Link>
              <span className="text-muted-foreground">.</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/airworthiness">Airworthiness form</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/source">Zome source</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => reset()}>
              <RotateCcw />
              Empty
            </Button>
            <Button
              size="sm"
              onClick={() => {
                seed();
                setBannerOk(true);
                setBanner("Sample network loaded: FAA, EASA, Boeing, AeroFix, Northline.");
              }}
            >
              Load sample
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] sm:px-6">
        <aside className="contents lg:flex lg:flex-col lg:gap-4">
          <section className="order-1 min-w-0 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_rgba(232,230,225,0.08)] lg:order-none">
            <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Acting as
            </p>
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {dht.agents.map((agent) => {
                const active = agent.pubkey === actor?.pubkey;
                return (
                  <li key={agent.pubkey} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActingAs(agent.pubkey)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors duration-[var(--motion-quick)] lg:w-full lg:gap-3 lg:py-2.5",
                        active ? "bg-muted" : "hover:bg-muted/60",
                      )}
                    >
                      <User className="size-4 shrink-0 text-aluminum" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{agent.name}</span>
                        <span className="hidden truncate font-mono text-[11px] text-muted-foreground lg:block">
                          {agent.organisationId}
                        </span>
                      </span>
                      {agent.isRoot ? <Badge variant="root">Root</Badge> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {dht.agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agents. Load the sample network.</p>
            ) : null}
          </section>

          <section className="order-3 min-w-0 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_rgba(232,230,225,0.08)] lg:order-none">
            <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Scenarios
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => {
                  let msg = "";
                  mutate((s) => {
                    const r = runHappyPath(s);
                    msg = r.error
                      ? r.error
                      : `Inspect ${r.inspect?.slice(-8)} then overhaul ${r.overhaul?.slice(-8)}. Same serial, predecessor set — not a conflict.`;
                    setBannerOk(!r.error);
                  });
                  setBanner(msg);
                  setTab("verify");
                }}
              >
                <GitBranch />
                Inspect, then overhaul
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={() => {
                  mutate((s) => {
                    const first = sampleInspect(s);
                    if (!first) {
                      setBannerOk(false);
                      setBanner("Seed the network first.");
                      return;
                    }
                    const a = createAttestation(s, first);
                    if (!a.ok) {
                      setBannerOk(false);
                      setBanner(a.reason);
                      return;
                    }
                    const conflict = sampleConflict(s);
                    if (!conflict) return;
                    const b = createAttestation(s, conflict);
                    if (!b.ok) {
                      setBannerOk(false);
                      setBanner(b.reason);
                      return;
                    }
                    const mem = latestMembership(s, first.attester.agentPubkey);
                    if (!mem) return;
                    const rev = revokeMembership(s, actor?.pubkey ?? first.attester.agentPubkey, {
                      membershipHash: mem.hash,
                      grounds: { kind: "ConflictingAssertions", assertionId: "INSPECTED" },
                      evidenceHashes: [a.value.hash, b.value.hash],
                    });
                    setBannerOk(rev.ok);
                    setBanner(
                      rev.ok
                        ? "Conflicting INSPECTED true/false, no predecessor — revocation accepted."
                        : rev.reason,
                    );
                  });
                  setTab("verify");
                }}
              >
                <ShieldOff />
                Conflicting inspection
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Inspect then overhaul is normal MRO work. Two opposite values for the same assertion,
              with no predecessor, is fraud.
            </p>
          </section>

          <div className="order-4 min-w-0 lg:order-none">
            <DnaCard state={dht} />
          </div>
        </aside>

        <main className="order-2 min-w-0 lg:order-none">
          {banner ? (
            <div
              className={cn(
                "mb-4 rounded-lg px-4 py-3 text-sm",
                bannerOk ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger",
              )}
            >
              {banner}
            </div>
          ) : null}

          {!showIntro ? (
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="mb-4 w-full rounded-lg bg-surface px-4 py-3 text-left text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(232,230,225,0.08)] hover:text-fg"
            >
              What am I looking at?
            </button>
          ) : null}

          {showIntro ? (
            <section className="mb-4 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="text-base font-medium">What you are looking at</h2>
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-fg"
                >
                  Hide
                </button>
              </div>
              <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                <p>
                  A repair shop signs a certificate saying what it did to an aircraft part. Years
                  later somebody — a buyer, an auditor, a court — needs to know whether that
                  signature counted. The shop may have changed hands. It may not exist.
                </p>
                <p>
                  Signing is the easy part and the industry solved it long ago.{" "}
                  <span className="text-fg">
                    What nobody has solved is who decides whose signature counts.
                  </span>{" "}
                  This page is that decision, made checkable.
                </p>
                {showIntroMore ? (
                  <>
                    <p>
                      <span className="text-fg">Who runs it?</span> Nobody yet — and that is the
                      honest open question, not a gap in the demo. The root authorities are set when
                      the network is installed, not compiled into the software, so the same build
                      can run under the FAA, under EASA, under a coalition secretariat, or under a
                      foundation. Deciding whose keys those are is a governance question and it has
                      not been answered.
                    </p>
                    <p>
                      The same certificate has{" "}
                      <span className="text-fg">two entirely different uses</span> — one for a part
                      being manufactured, one for a part being maintained — governed by different
                      rules and signed by different people. This page is the maintenance one. The
                      other is under <span className="text-fg">Airworthiness form</span>, and it is
                      where a chain begins.
                    </p>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowIntroMore((v) => !v)}
                  className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-fg"
                >
                  {showIntroMore ? "Less" : "Who runs it? And why are there two forms?"}
                </button>
                <p className="text-fg">
                  Press <span className="font-medium">Load sample</span>, then run{" "}
                  <span className="font-medium">Inspect, then overhaul</span> — that is ordinary
                  work. Then run <span className="font-medium">Conflicting inspection</span>, where
                  the shop says two opposite things about the same part, and watch the verdict on
                  the earlier certificate change.
                </p>
              </div>
            </section>
          ) : null}

          <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-surface p-1 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-10 min-w-[4.5rem] flex-1 rounded-md px-3 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                  tab === t.id ? "bg-muted text-fg" : "text-muted-foreground hover:text-fg",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="mb-4 px-1 text-sm leading-relaxed text-muted-foreground">
            {TAB_BLURBS[tab]}
          </p>

          {tab === "issue" && actor ? (
            <IssueForm
              state={dht}
              actor={actor.pubkey}
              onSubmit={(proof) =>
                run((s) => issueMembership(s, actor.pubkey, proof), "Membership committed.")
              }
            />
          ) : null}
          {tab === "attest" && actor ? (
            <AttestForm
              state={dht}
              actor={actor.pubkey}
              onSubmit={(att) => run((s) => createAttestation(s, att), "Attestation committed.")}
            />
          ) : null}
          {tab === "revoke" && actor ? (
            <RevokeForm
              state={dht}
              actor={actor.pubkey}
              onSubmit={(input) =>
                run((s) => revokeMembership(s, actor.pubkey, input), "Revocation committed.")
              }
            />
          ) : null}
          {tab === "verify" ? <VerifyTab state={dht} actor={actor?.pubkey} /> : null}
          {tab === "ledger" ? <Ledger state={dht} /> : null}
        </main>
      </div>
      <RafFooter />
    </div>
  );
}

function DnaCard({ state }: { state: EngineState }) {
  return (
    <section className="rounded-xl bg-surface p-4 text-xs text-muted-foreground shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
      <p className="mb-2 text-[11px] font-medium tracking-[0.16em] uppercase">DNA</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono">
        <dt>depth</dt>
        <dd className="text-fg">{state.dna.maxDelegationDepth}</dd>
        <dt>ttl</dt>
        <dd className="text-fg">{Math.round(state.dna.maxMembershipTtlMs / 86400000)}d</dd>
        <dt>roots</dt>
        <dd className="text-fg">{state.dna.initialMembers.length}</dd>
        <dt>records</dt>
        <dd className="text-fg tabular-nums">{state.records.length}</dd>
      </dl>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none ring-ring focus:ring-2";
const selectClass = inputClass;

function IssueForm({
  state,
  actor,
  onSubmit,
}: {
  state: EngineState;
  actor: string;
  onSubmit: (proof: Parameters<typeof issueMembership>[2]) => void;
}) {
  // A fresh array literal every render gave the effect below a new dependency
  // identity every render, so it ran every time rather than when the list changed.
  const subjects = useMemo(
    () => state.agents.filter((a) => a.pubkey !== actor),
    [state.agents, actor],
  );
  const [subject, setSubject] = useState(subjects[0]?.pubkey ?? "");
  const [role, setRole] = useState<AttesterRole>("Oem");
  const [accred, setAccred] = useState<AccreditationType>("OemAuthorized");
  const [cert, setCert] = useState("CERT-001");
  const [authority, setAuthority] = useState("FAA");
  const issuerMem = latestMembership(state, actor);
  const actorAgent = state.agents.find((a) => a.pubkey === actor);

  useEffect(() => {
    if (subjects[0] && !subjects.some((s) => s.pubkey === subject)) {
      setSubject(subjects[0].pubkey);
    }
  }, [subject, subjects]);

  const target = state.agents.find((a) => a.pubkey === subject);

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!target) return;
        onSubmit({
          agentPubkey: target.pubkey,
          role,
          organisation: target.organisation,
          organisationId: target.organisationId,
          accreditation: {
            accreditationType: accred,
            certNumber: cert,
            issuingAuthority: authority,
          },
          expiresAt: yearFromNow(),
          issuerMembershipHash: actorAgent?.isRoot ? undefined : issuerMem?.hash,
        });
      }}
    >
      <h2 className="text-lg font-medium">Issue membership</h2>
      <p className="text-sm text-muted-foreground">
        Roots grant any mapped accreditation. Non-roots only grant along the OEM matrix, and only if
        they hold a live membership.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject">
          <select
            className={selectClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((a) => (
              <option key={a.pubkey} value={a.pubkey}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Role">
          <select
            className={selectClass}
            value={role}
            onChange={(e) => setRole(e.target.value as AttesterRole)}
          >
            {ATTESTER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Accreditation">
          <select
            className={selectClass}
            value={accred}
            onChange={(e) => setAccred(e.target.value as AccreditationType)}
          >
            {ACCREDITATION_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cert number">
          <input className={inputClass} value={cert} onChange={(e) => setCert(e.target.value)} />
        </Field>
        <Field label="Issuing authority">
          <input
            className={inputClass}
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
          />
        </Field>
      </div>
      <Button type="submit" className="self-start">
        Issue
        <ChevronRight />
      </Button>
    </form>
  );
}

function AttestForm({
  state,
  actor,
  onSubmit,
}: {
  state: EngineState;
  actor: string;
  onSubmit: (att: Attestation) => void;
}) {
  const mem = latestMembership(state, actor);
  const agent = state.agents.find((a) => a.pubkey === actor);
  const [partType, setPartType] = useState<PartType>("Engine");
  const [partNumber, setPartNumber] = useState("CFM56-7B27");
  const [serial, setSerial] = useState("577737");
  const [docType, setDocType] = useState<DocumentType>("EasaForm1");
  const [docId, setDocId] = useState("AFX-NEW-0001");
  const [assertion, setAssertion] = useState("INSPECTED");
  const [boolVal, setBoolVal] = useState(true);
  const [pred, setPred] = useState("");
  const [notObserved, setNotObserved] = useState<string[]>([]);
  const [digest, setDigest] = useState("");
  // Editable so the tamper case is demonstrable: two attestations sharing a
  // document id but differing in digest is the DuplicateDocument revocation
  // ground. Blank means "derive it from the id", which is the honest default.
  const autoDigest = `sha256:${docId.padEnd(24, "x").slice(0, 24)}`;
  const prior = state.records.filter((r) => r.entry.type === "Attestation");

  if (!mem || mem.entry.type !== "MembershipProof" || !agent) {
    return (
      <div className="rounded-xl bg-surface p-5 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
        {agent?.name ?? "This agent"} has no membership. Airlines, brokers, and lessors
        counter-attest instead — switch to Verify and file a counter, or issue membership from a
        root / OEM.
      </div>
    );
  }

  const proof = mem.entry.value;

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          rafVersion: RAF_VERSION,
          subject: {
            partType,
            partNumber,
            serialNumber: serial,
            description: `${partNumber} ${serial}`,
          },
          binding: {
            certificationPath: "ReturnToService",
            bindsField: "serial_and_part",
            documentType: docType,
            documentId: docId,
            documentDigest: digest.trim() || autoDigest,
            predecessorDocumentHash: pred || undefined,
          },
          scope: {
            observed: [{ assertionId: assertion, value: { kind: "Bool", value: boolVal } }],
            notObserved: notObserved.filter((id) => id !== assertion),
          },
          evidence: [{ evidenceType: "shop_traveler", digest: `sha256:${serial}xxxxxxxxxxxx` }],
          attester: {
            agentPubkey: actor,
            role: proof.role,
            organisation: proof.organisation,
            organisationId: proof.organisationId,
          },
          membershipProofHash: mem.hash,
        });
      }}
    >
      <h2 className="text-lg font-medium">Create attestation</h2>
      <p className="text-sm text-muted-foreground">
        Organisation is copied from membership — you cannot attest as someone else's shop.
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Fields carry their block numbers on FAA Form 8130-3. This is the{" "}
        <span className="text-fg">approval for return to service</span> path — blocks 14a–14e, the
        maintenance case — not the airworthiness approval path in blocks 13a–13e. The organisation
        in Block 4 comes from the accreditation, not from this form.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Part type">
          <select
            className={selectClass}
            value={partType}
            onChange={(e) => setPartType(e.target.value as PartType)}
          >
            {PART_TYPES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Part number · Block 8">
          <input
            className={inputClass}
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
          />
        </Field>
        <Field label="Serial number · Block 10">
          <input
            className={inputClass}
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </Field>
        <Field label="Form">
          <select
            className={selectClass}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Form tracking number · Block 3">
          <input className={inputClass} value={docId} onChange={(e) => setDocId(e.target.value)} />
        </Field>
        <Field label="Document digest">
          <input
            className={inputClass}
            value={digest}
            placeholder={autoDigest}
            onChange={(e) => setDigest(e.target.value)}
          />
        </Field>
        <Field label="Status / work · Block 11">
          <select
            className={selectClass}
            value={assertion}
            onChange={(e) => setAssertion(e.target.value)}
          >
            {RETURN_TO_SERVICE_STATUS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Value">
          <select
            className={selectClass}
            value={boolVal ? "true" : "false"}
            onChange={(e) => setBoolVal(e.target.value === "true")}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </Field>
        <Field label="Previous certificate for this part">
          <select className={selectClass} value={pred} onChange={(e) => setPred(e.target.value)}>
            <option value="">None (genesis document)</option>
            {prior.map((r) => (
              <option key={r.hash} value={r.hash}>
                {r.hash.slice(-10)}
                {r.entry.type === "Attestation" ? ` · ${r.entry.value.binding.documentId}` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Not observed — what the signer did NOT witness">
        <div className="flex flex-wrap gap-2">
          {RETURN_TO_SERVICE_STATUS.filter((a) => a !== assertion).map((a) => {
            const on = notObserved.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() =>
                  setNotObserved((prev) =>
                    prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
                  )
                }
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] transition",
                  on
                    ? "border-primary/60 bg-primary/15 text-fg"
                    : "border-border text-muted-foreground hover:text-fg",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Absence is never assent. Marking an item here records that it was outside what this signer
          personally saw — the difference between “not claimed” and “claimed false”.
        </p>
      </Field>
      <Button type="submit" className="self-start">
        Attest
        <ChevronRight />
      </Button>
    </form>
  );
}

function RevokeForm({
  state,
  actor,
  onSubmit,
}: {
  state: EngineState;
  actor: string;
  onSubmit: (input: {
    membershipHash: string;
    grounds: RevocationGrounds;
    evidenceHashes: string[];
  }) => void;
}) {
  const memberships = state.records.filter((r) => r.entry.type === "MembershipProof");
  const atts = state.records.filter((r) => r.entry.type === "Attestation");
  const [mem, setMem] = useState(memberships[0]?.hash ?? "");
  const [kind, setKind] = useState<RevocationGrounds["kind"]>("Administrative");
  const [a, setA] = useState(atts[0]?.hash ?? "");
  const [b, setB] = useState(atts[1]?.hash ?? atts[0]?.hash ?? "");
  const [assertionId, setAssertionId] = useState("INSPECTED");

  return (
    <form
      className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]"
      onSubmit={(e) => {
        e.preventDefault();
        const grounds: RevocationGrounds =
          kind === "ConflictingAssertions"
            ? { kind, assertionId }
            : { kind: kind as Exclude<RevocationGrounds["kind"], "ConflictingAssertions"> };
        const evidence =
          kind === "Administrative" ? [] : kind === "DuplicateCertIssuance" ? [a, b] : [a, b];
        onSubmit({ membershipHash: mem, grounds, evidenceHashes: evidence });
      }}
    >
      <h2 className="text-lg font-medium">Revoke membership</h2>
      <p className="text-sm text-muted-foreground">
        Administrative: issuer or root. Evidence grounds: anyone who can present the hashes. Time is
        the action timestamp — there is no author-set <span className="font-mono">decided_at</span>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Membership">
          <select className={selectClass} value={mem} onChange={(e) => setMem(e.target.value)}>
            {memberships.map((r) => (
              <option key={r.hash} value={r.hash}>
                {r.entry.type === "MembershipProof"
                  ? `${shortAgent(state, r.entry.value.agentPubkey)} · ${r.hash.slice(-8)}`
                  : r.hash}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Grounds">
          <select
            className={selectClass}
            value={kind}
            onChange={(e) => setKind(e.target.value as RevocationGrounds["kind"])}
          >
            <option value="Administrative">Administrative</option>
            <option value="DuplicateDocument">Duplicate document</option>
            <option value="ConflictingAssertions">Conflicting assertions</option>
            <option value="DuplicateCertIssuance">Duplicate cert issuance</option>
          </select>
        </Field>
        {kind !== "Administrative" ? (
          <>
            <Field label="Evidence A">
              <select className={selectClass} value={a} onChange={(e) => setA(e.target.value)}>
                {(kind === "DuplicateCertIssuance" ? memberships : atts).map((r) => (
                  <option key={r.hash} value={r.hash}>
                    {r.hash.slice(-12)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Evidence B">
              <select className={selectClass} value={b} onChange={(e) => setB(e.target.value)}>
                {(kind === "DuplicateCertIssuance" ? memberships : atts).map((r) => (
                  <option key={r.hash} value={r.hash}>
                    {r.hash.slice(-12)}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
        {kind === "ConflictingAssertions" ? (
          <Field label="Assertion id">
            <select
              className={selectClass}
              value={assertionId}
              onChange={(e) => setAssertionId(e.target.value)}
            >
              {ASSERTION_VOCABULARY.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Acting as {shortAgent(state, actor)}.</p>
      <Button type="submit" variant="destructive" className="self-start">
        Revoke
      </Button>
    </form>
  );
}

function VerifyTab({ state, actor }: { state: EngineState; actor?: string }) {
  const atts = state.records.filter((r) => r.entry.type === "Attestation");
  const [hash, setHash] = useState(atts[atts.length - 1]?.hash ?? "");
  const [agree, setAgree] = useState<AgreementStatus>("Agree");
  const agent = state.agents.find((a) => a.pubkey === actor);

  // Derived, not stored. Computing this in an effect and calling setState meant
  // every DHT change rendered twice.
  const report = useMemo<VerificationReport | null>(() => {
    if (!hash) return null;
    const r = verifyAttestation(state, hash);
    return "error" in r ? null : r;
  }, [hash, state]);

  const mutate = useRaf((s) => s.mutate);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
        <h2 className="mb-3 text-lg font-medium">Verify attestation</h2>
        {atts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attestations yet. Run “Inspect, then overhaul” or file one under Attest.
          </p>
        ) : (
          <Field label="Attestation">
            <select className={selectClass} value={hash} onChange={(e) => setHash(e.target.value)}>
              {atts.map((r) => (
                <option key={r.hash} value={r.hash}>
                  {r.entry.type === "Attestation"
                    ? `${r.entry.value.binding.documentId} · ${r.entry.value.subject.serialNumber}`
                    : r.hash}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {report ? <ReportCard report={report} /> : null}

      {hash && agent ? (
        <form
          className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]"
          onSubmit={(e) => {
            e.preventDefault();
            mutate((s) => {
              const mem = latestMembership(s, agent.pubkey);
              createCounter(s, agent.pubkey, hash, {
                role: mem?.entry.type === "MembershipProof" ? mem.entry.value.role : "Airline",
                organisation: agent.organisation,
                organisationId: agent.organisationId,
                agreement: agree,
              });
            });
          }}
        >
          <h3 className="text-sm font-medium">Counter-attestation</h3>
          <p className="text-xs text-muted-foreground">
            Informational only — never flips currently_trusted. No membership required.
          </p>
          <div className="flex flex-wrap gap-2">
            {AGREEMENT_STATUSES.map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={agree === s ? "default" : "outline"}
                onClick={() => setAgree(s)}
              >
                {s}
              </Button>
            ))}
            <Button type="submit" size="sm" variant="secondary">
              File counter
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

/** The verdict in a sentence. The badges say what; this says so what. */
function verdictSentence(report: VerificationReport): string {
  if (!report.historicallyValid) {
    return "This should never have been accepted. Something about it was already wrong at the moment it was signed.";
  }
  if (report.currentlyTrusted) {
    return "This checks out. The signer held a live accreditation when they signed, and nothing behind it has been withdrawn since.";
  }
  if (report.revocation.kind === "RevokedAfterAssertion") {
    return "Genuine when it was signed, but the accreditation behind it has since been withdrawn. The certificate is still a true record of what happened — treat it with caution before relying on it for a new decision.";
  }
  if (report.revocation.kind === "RevokedBeforeAssertion") {
    return "The signer's accreditation had already been withdrawn before they signed this.";
  }
  return "Properly signed, but something below means you should not rely on it as it stands.";
}

function ReportCard({ report }: { report: VerificationReport }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {report.currentlyTrusted ? (
          <Badge variant="ok">Currently trusted</Badge>
        ) : (
          <Badge variant="danger">Not currently trusted</Badge>
        )}
        {report.historicallyValid ? (
          <Badge variant="default">Historically valid</Badge>
        ) : (
          <Badge variant="warn">Not historically valid</Badge>
        )}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {verdictSentence(report)}
      </p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Row
          label="Binding"
          hint="Does the part identity match the document?"
          ok={report.bindingWellFormed}
        />
        <Row
          label="Membership"
          hint="Was the signer accredited at the moment they signed?"
          ok={report.membership.kind === "Active"}
          detail={
            report.membership.kind === "Active"
              ? `depth ${report.membership.depth}`
              : report.membership.kind === "Expired"
                ? "expired"
                : report.membership.kind === "InvalidProof"
                  ? report.membership.reason
                  : report.membership.kind === "ChainBroken"
                    ? report.membership.reason
                    : "not found"
          }
        />
        <Row
          label="Predecessor"
          hint="Does this link back correctly to the previous certificate for this part?"
          ok={report.predecessor === "None" || report.predecessor === "Ok"}
          detail={report.predecessor}
        />
        <Row
          label="Revocation"
          hint="Has the accreditation behind this been withdrawn?"
          ok={report.revocation.kind === "Clean" || report.revocation.kind === "Rotated"}
          detail={
            report.revocation.kind === "Clean"
              ? "clean"
              : report.revocation.kind === "Rotated"
                ? "key rotated — superseded, not withdrawn"
                : report.revocation.kind === "Unknown"
                  ? "could not be established — treated as untrusted"
                  : `${report.revocation.kind} · ${groundsLabel(report.revocation.grounds)}`
          }
        />
      </dl>
      {report.scope.length > 0 ? (
        <>
          <p className="mt-5 mb-2 text-xs text-muted-foreground">
            What the signer put on the record — both what they checked and what they explicitly did
            not. Each one has to come from the agreed vocabulary; free text is not an assertion.
          </p>
          <ul className="flex flex-wrap gap-2">
            {report.scope.map((s) => (
              <Badge key={s.assertionId} variant={s.inVocabulary ? "ok" : "danger"}>
                {s.assertionId}
              </Badge>
            ))}
          </ul>
        </>
      ) : null}
      {report.counters.length > 0 ? (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Counters (informational)
          </p>
          <ul className="space-y-1 text-sm">
            {report.counters.map((c, i) => (
              <li key={i}>
                {c.agreement} · {c.attester.organisation}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  ok,
  detail,
  hint,
}: {
  label: string;
  ok: boolean;
  detail?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {ok ? (
        <Check className="mt-0.5 size-4 text-ok" />
      ) : (
        <Shield className="mt-0.5 size-4 text-danger" />
      )}
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        {detail ? <p className="font-mono text-[11px] text-aluminum">{detail}</p> : null}
      </div>
    </div>
  );
}

function Ledger({ state }: { state: EngineState }) {
  const rows = useMemo(() => [...state.records].reverse(), [state.records]);
  return (
    <div className="rounded-xl bg-surface shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-medium">Source chain / DHT</h2>
        <p className="text-sm text-muted-foreground">
          In-memory twin of the zome. Rejected creates never land.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {rows.length === 0 ? (
          <li className="px-5 py-8 text-sm text-muted-foreground">Empty.</li>
        ) : (
          rows.map((r) => (
            <li key={r.hash} className="px-5 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{r.entry.type}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{r.hash}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {shortAgent(state, r.author)} · {new Date(r.timestamp).toLocaleString()}
                {r.entry.type === "Attestation"
                  ? ` · ${r.entry.value.binding.documentId} · ${r.entry.value.scope.observed.map((a) => `${a.assertionId}=${formatAssertionValue(a.value)}`).join(", ")}`
                  : r.entry.type === "MembershipProof"
                    ? ` · ${shortAgent(state, r.entry.value.agentPubkey)} depth ${r.entry.value.depth}`
                    : r.entry.type === "MembershipRevocation"
                      ? ` · ${groundsLabel(r.entry.value.grounds)}`
                      : ""}
              </p>
            </li>
          ))
        )}
      </ul>
      {state.log.filter((l) => l.kind === "reject").length > 0 ? (
        <div className="border-t border-border px-5 py-4">
          <p className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            <FileText className="size-3.5" />
            Rejected
          </p>
          <ul className="space-y-1 text-xs text-danger">
            {state.log
              .filter((l) => l.kind === "reject")
              .slice(0, 8)
              .map((l) => (
                <li key={l.id}>
                  {l.title}: {l.detail}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
