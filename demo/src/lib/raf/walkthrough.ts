/**
 * The whole argument, as one sequence.
 *
 * The tabs are a toolbox: they let someone poke at the rules, which is
 * genuinely useful once you know what you are looking at. But the single most
 * important thing this format does — a certificate that stays a real document
 * after its signer loses authority — could only be seen by assembling it
 * yourself across four tabs. Almost nobody did.
 *
 * So this runs the arc end to end and narrates each step: a part is made,
 * someone works on it and records what they did *not* check, someone else
 * relies on that, the shop loses its approval, and a stranger checks the
 * paperwork years later.
 *
 * Every step calls the same engine as the tabs. Nothing here is staged.
 */
import {
  createAttestation,
  issueMembership,
  latestMembership,
  revokeMembership,
  yearFromNow,
  type EngineState,
} from "./engine";
import { digest, sampleInspect, sampleOverhaul } from "./demo";
import { RAF_VERSION, type Attestation } from "./types";
import { verifyAttestation } from "./verify";

export type StepId = "made" | "inspected" | "relied" | "revoked" | "checked";

export type StepResult = {
  ok: boolean;
  /** What just happened, in the language of the industry rather than the code. */
  detail: string;
  /** The record it produced, if any. */
  hash?: string;
};

export type Step = {
  id: StepId;
  title: string;
  /** Why this step matters. Shown before it runs. */
  premise: string;
  run: (state: EngineState, ctx: Ctx) => StepResult;
};

/** Carried between steps: what earlier steps produced. */
export type Ctx = {
  birth?: string;
  inspection?: string;
  overhaul?: string;
  membershipHash?: string;
};

const boeing = (s: EngineState) => s.agents.find((a) => a.name === "Boeing");
const aerofix = (s: EngineState) => s.agents.find((a) => a.name === "AeroFix");
const faa = (s: EngineState) => s.agents.find((a) => a.name === "FAA");

export const STEPS: Step[] = [
  {
    id: "made",
    title: "A part is manufactured",
    premise:
      "Boeing holds a production approval, so it can sign the airworthiness side of the form — blocks 13a–13e. This is where a chain begins: there is no earlier certificate, because nothing came before it.",
    run: (state, ctx) => {
      const maker = boeing(state);
      const mem = maker ? latestMembership(state, maker.pubkey) : undefined;
      if (!maker || !mem || mem.entry.type !== "MembershipProof") {
        return { ok: false, detail: "Load the sample network first." };
      }
      const proof = mem.entry.value;
      const birth: Attestation = {
        rafVersion: RAF_VERSION,
        subject: {
          partType: "Engine",
          partNumber: "CFM56-7B27",
          serialNumber: "577737",
          description: "CFM56-7B27 turbofan, stage 1 fan disk",
        },
        binding: {
          certificationPath: "AirworthinessApproval",
          bindsField: "serial_and_part",
          documentType: "Faa81303",
          documentId: "BCA-2021-55010",
          documentDigest: digest("bca-55010"),
        },
        scope: {
          observed: [{ assertionId: "NEW", value: { kind: "Bool", value: true } }],
          notObserved: [],
        },
        evidence: [{ evidenceType: "conformity_record", digest: digest("conformity-55010") }],
        attester: {
          agentPubkey: maker.pubkey,
          role: proof.role,
          organisation: proof.organisation,
          organisationId: proof.organisationId,
        },
        membershipProofHash: mem.hash,
      };
      const r = createAttestation(state, birth);
      if (!r.ok) return { ok: false, detail: r.reason };
      ctx.birth = r.value.hash;
      return {
        ok: true,
        hash: r.value.hash,
        detail:
          "Boeing signed an airworthiness approval for serial 577737, status NEW. Note the vocabulary: NEW is one of exactly three terms permitted on this side of the form.",
      };
    },
  },
  {
    id: "inspected",
    title: "A repair station works on it",
    premise:
      "Years later AeroFix inspects the part and signs the maintenance side — blocks 14a–14e, a different list of terms and a different signer. Watch what it records that it did NOT check.",
    run: (state, ctx) => {
      const att = sampleInspect(state);
      if (!att) return { ok: false, detail: "Load the sample network first." };
      const withPredecessor: Attestation = ctx.birth
        ? { ...att, binding: { ...att.binding, predecessorDocumentHash: ctx.birth } }
        : att;
      const r = createAttestation(state, withPredecessor);
      if (!r.ok) return { ok: false, detail: r.reason };
      ctx.inspection = r.value.hash;
      const shop = aerofix(state);
      ctx.membershipHash = shop ? latestMembership(state, shop.pubkey)?.hash : undefined;
      return {
        ok: true,
        hash: r.value.hash,
        detail:
          "AeroFix signed INSPECTED, and explicitly recorded OVERHAULED and MODIFIED as not observed. That is the load-bearing part: a later reader cannot take silence as a claim. Nobody checked whether this part had been overhauled, and the record says so.",
      };
    },
  },
  {
    id: "relied",
    title: "Someone relies on it",
    premise:
      "A second record points back at the first. This is the chain a stranger has to be able to follow years later, across companies that may no longer exist.",
    run: (state, ctx) => {
      if (!ctx.inspection) return { ok: false, detail: "Run the previous step first." };
      const att = sampleOverhaul(state, ctx.inspection);
      if (!att) return { ok: false, detail: "Could not build the follow-on record." };
      const r = createAttestation(state, att);
      if (!r.ok) return { ok: false, detail: r.reason };
      ctx.overhaul = r.value.hash;
      const report = verifyAttestation(state, r.value.hash);
      const trusted = !("error" in report) && report.currentlyTrusted;
      return {
        ok: true,
        hash: r.value.hash,
        detail: `An overhaul record now names the inspection as its predecessor. Verified right now it reads currently trusted: ${trusted ? "yes" : "no"}. Everything is in order — which is the point, because we are about to break it.`,
      };
    },
  },
  {
    id: "revoked",
    title: "The repair station loses its approval",
    premise:
      "This is the event that breaks conventional systems. In most of them the paperwork either stays valid, which is wrong, or is voided wholesale, which is also wrong.",
    run: (state, ctx) => {
      const authority = faa(state);
      if (!authority || !ctx.membershipHash) {
        return { ok: false, detail: "Run the earlier steps first." };
      }
      const r = revokeMembership(state, authority.pubkey, {
        membershipHash: ctx.membershipHash,
        grounds: { kind: "Administrative" },
        evidenceHashes: [],
        notes: "Approval withdrawn following audit",
      });
      if (!r.ok) return { ok: false, detail: r.reason };
      return {
        ok: true,
        hash: r.value.hash,
        detail:
          "The accreditation is withdrawn. Note what did NOT happen: nothing was edited or deleted. The revocation is a new record, and the old ones are untouched — because rewriting history is exactly what a provenance system must never do.",
      };
    },
  },
  {
    id: "checked",
    title: "A stranger checks the paperwork",
    premise:
      "Five years on, someone who was never party to any of this wants to know whether the certificate means anything. They contact nobody.",
    run: (state, ctx) => {
      if (!ctx.inspection) return { ok: false, detail: "Run the earlier steps first." };
      const report = verifyAttestation(state, ctx.inspection);
      if ("error" in report) return { ok: false, detail: report.error };
      return {
        ok: true,
        hash: ctx.inspection,
        detail: `Historically valid: ${report.historicallyValid ? "yes" : "no"}. Currently trusted: ${report.currentlyTrusted ? "yes" : "no"}. The inspection was signed while AeroFix held a valid approval, so it stays a real document — the revocation came afterwards and does not reach back. What it no longer supports is new reliance. Those are two different questions, and almost every system collapses them into one.`,
      };
    },
  },
];

/** Yields the verification report for the inspection, once it exists. */
export function walkthroughReport(state: EngineState, ctx: Ctx) {
  if (!ctx.inspection) return null;
  const report = verifyAttestation(state, ctx.inspection);
  return "error" in report ? null : report;
}

export function issueBoeingIfNeeded(state: EngineState): void {
  const maker = boeing(state);
  const authority = faa(state);
  if (!maker || !authority) return;
  if (latestMembership(state, maker.pubkey)) return;
  issueMembership(state, authority.pubkey, {
    agentPubkey: maker.pubkey,
    role: "Oem",
    organisation: "Boeing Commercial Airplanes",
    organisationId: "US.PMA.0042",
    accreditation: {
      accreditationType: "FaaPma",
      certNumber: "US.PMA.0042",
      issuingAuthority: "FAA",
    },
    expiresAt: yearFromNow(),
  });
}
