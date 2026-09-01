import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAttestation, latestMembership } from "@/lib/raf/engine";
import { useRaf } from "@/lib/raf/store";
import { RafFooter } from "@/components/raf/footer";
import { PART_TYPES, RAF_VERSION, type Attestation, type PartType } from "@/lib/raf/types";

export const Route = createFileRoute("/airworthiness")({ component: AirworthinessPage });

/**
 * Block 11 for this path, verbatim from FAA Order 8130.21J (25 Sep 2025)
 * paragraph 11.k: "Enter one of the terms below" — a closed list of three.
 * (The old §4-1(k) citation was 8130.21H numbering; J renumbered.)
 */
const BLOCK_11 = [
  { id: "NEW", note: "a new item in conformity with approved design data" },
  { id: "PROTOTYPE", note: "a new item in conformity with non-approved design data" },
  { id: "USED", note: "a used item for export, with time in service" },
] as const;

/** Production-side accreditations. These are the ones that can sign block 13b. */
const PRODUCTION_ACCREDITATIONS = ["FaaPma", "EasaPart21g", "OemAuthorized"];

const inputClass =
  "h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none ring-ring focus:ring-2";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function AirworthinessPage() {
  const dht = useRaf((s) => s.dht);
  const mutate = useRaf((s) => s.mutate);

  // O(agents x records), and this component holds four text inputs — without
  // the memo it re-ran on every keystroke.
  const eligible = useMemo(
    () =>
      dht.agents.filter((a) => {
        const mem = latestMembership(dht, a.pubkey);
        return (
          mem?.entry.type === "MembershipProof" &&
          PRODUCTION_ACCREDITATIONS.includes(mem.entry.value.accreditation.accreditationType)
        );
      }),
    [dht],
  );

  const [actor, setActor] = useState<string>(eligible[0]?.pubkey ?? "");
  const [partType, setPartType] = useState<PartType>("Engine");
  const [partNumber, setPartNumber] = useState("CFM56-7B27-1024");
  const [serial, setSerial] = useState("PN-994120");
  const [docId, setDocId] = useState("BCA-2026-77301");
  const [status, setStatus] = useState<string>("NEW");
  const [banner, setBanner] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [bannerOk, setBannerOk] = useState(true);

  const mem = actor ? latestMembership(dht, actor) : undefined;
  const proof = mem?.entry.type === "MembershipProof" ? mem.entry.value : undefined;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
              FAA Form 8130-3 · blocks 13a–13e
            </p>
            <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
              Airworthiness approval
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Return to service form</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="text-fg">A manufacturer releasing a part it made.</span> Governed by
            FAA Order 8130.21J. This is where a chain begins: there is no earlier certificate to
            point at, because nothing came before it. Issue one here and it becomes selectable as
            the predecessor back on the return to service form, which is the maintenance side of the
            same document.
          </p>
        </section>

        {banner ? (
          <div
            className={
              bannerOk
                ? "rounded-lg bg-ok/10 px-4 py-3 text-sm text-ok"
                : "rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger"
            }
          >
            {banner}
          </div>
        ) : null}

        {eligible.length === 0 ? (
          <section className="rounded-xl bg-surface p-5 text-sm text-muted-foreground shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
            No agent holds a production accreditation. Only a production approval holder — FAA PMA,
            EASA Part 21G, or an authorised OEM — can sign block 13b.{" "}
            <Link to="/" className="underline underline-offset-4 hover:text-fg">
              Load the sample network
            </Link>{" "}
            and Boeing will qualify.
          </section>
        ) : (
          <form
            className="flex flex-col gap-4 rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!mem || !proof) return;
              const attestation: Attestation = {
                rafVersion: RAF_VERSION,
                subject: {
                  partType,
                  partNumber,
                  serialNumber: serial,
                  description: `${partNumber} ${serial}`,
                },
                binding: {
                  certificationPath: "AirworthinessApproval",
                  bindsField: "serial_and_part",
                  documentType: "Faa81303",
                  documentId: docId,
                  documentDigest: `sha256:${docId.padEnd(24, "x").slice(0, 24)}`,
                  // No predecessor. That is the whole point of this path.
                },
                scope: {
                  observed: [{ assertionId: status, value: { kind: "Bool", value: true } }],
                  notObserved: [],
                },
                evidence: [
                  { evidenceType: "conformity_record", digest: `sha256:${serial}xxxxxxxxxxxx` },
                ],
                attester: {
                  agentPubkey: actor,
                  role: proof.role,
                  organisation: proof.organisation,
                  organisationId: proof.organisationId,
                },
                membershipProofHash: mem.hash,
              };
              mutate((s) => {
                const res = createAttestation(s, attestation);
                setBannerOk(res.ok);
                setBanner(
                  res.ok
                    ? `Birth record committed as ${res.value.hash}. Open the Workbench, attest against the same part, and pick this as the predecessor.`
                    : res.reason,
                );
              });
            }}
          >
            <div>
              <h2 className="text-lg font-medium">Issue an airworthiness approval</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The organisation in Block 4 comes from the accreditation, not from this form.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Signing organisation · Block 4">
                <select
                  className={inputClass}
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                >
                  {eligible.map((a) => (
                    <option key={a.pubkey} value={a.pubkey}>
                      {a.name} · {a.organisationId}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Form tracking number · Block 3">
                <input
                  className={inputClass}
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                />
              </Field>
              <Field label="Part type">
                <select
                  className={inputClass}
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
              <Field label="Status / work · Block 11">
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {BLOCK_11.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {BLOCK_11.find((b) => b.id === status)?.note}. Order 8130.21J ¶11.k permits exactly
              these three terms on this path — unlike the return-to-service vocabulary, this list is
              not a guess.
            </p>

            <Button type="submit" className="self-start">
              Issue approval
              <ChevronRight />
            </Button>
          </form>
        )}

        <section className="rounded-xl bg-surface p-5 shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
          <button
            type="button"
            onClick={() => setShowCompare((v) => !v)}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-fg"
          >
            {showCompare
              ? "Hide the comparison"
              : "How does this differ from the maintenance path?"}
          </button>
          {showCompare ? (
            <div className="mt-4">
              <h2 className="mb-3 text-base font-medium">The same form has two paths</h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                One certificate, two entirely different uses, governed by different rules and signed
                by different people. Confusing them is the sort of mistake that ends a conversation
                with an airworthiness engineer, so the demo keeps them on separate pages.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-4 font-medium"> </th>
                      <th className="py-2 pr-4 font-medium">Blocks 13a–13e</th>
                      <th className="py-2 font-medium">Blocks 14a–14e</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 text-fg">Purpose</td>
                      <td className="py-2 pr-4">Airworthiness approval</td>
                      <td className="py-2">Approval for return to service</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 text-fg">When</td>
                      <td className="py-2 pr-4">A part is produced, or exported</td>
                      <td className="py-2">A part is maintained, repaired or inspected</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 text-fg">Governed by</td>
                      <td className="py-2 pr-4">FAA Order 8130.21J</td>
                      <td className="py-2">AC 43-9D, under 14 CFR part 43</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 text-fg">Block 11 terms</td>
                      <td className="py-2 pr-4">
                        <span className="text-fg">NEW, PROTOTYPE, USED</span> — a closed list of
                        three
                      </td>
                      <td className="py-2">
                        <span className="text-fg">
                          OVERHAULED, REPAIRED, INSPECTED, TESTED, MODIFIED
                        </span>{" "}
                        — AC 43-9D Table B-1
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-fg">Predecessor</td>
                      <td className="py-2 pr-4">
                        <span className="text-fg">None. This is the birth.</span>
                      </td>
                      <td className="py-2">Links back to the previous certificate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                <span className="text-fg">Why this page exists.</span> The coalition asked for
                back-to-birth traceability. This path is the birth — the record with no predecessor,
                where a chain starts. The Workbench shows the middle of a chain; without this page
                you never see where one begins.
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted-foreground shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="warn">Honest limits</Badge>
          </div>
          <p>
            The block 13 path has its own rules this demo does not model: who may hold a production
            approval, what conformity inspection requires, and the export statements bilateral
            agreements demand in block 12. The point here is the shape of the chain, not a complete
            implementation of Part 21.
          </p>
        </section>
      </div>
      <RafFooter />
    </div>
  );
}
