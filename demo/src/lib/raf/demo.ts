import {
  addAgent,
  createAttestation,
  emptyState,
  issueMembership,
  yearFromNow,
  type EngineState,
} from "./engine";
import { RAF_VERSION, type Attestation } from "./types";

export function digest(label: string): string {
  return `sha256:${label.padEnd(24, "0").slice(0, 24)}`;
}

/** Seed a small network: FAA + EASA roots, Boeing OEM, AeroFix MRO, Northline airline. */
export function seedNetwork(): EngineState {
  const state = emptyState();
  const faa = addAgent(state, {
    name: "FAA",
    organisation: "Federal Aviation Administration",
    organisationId: "FAA",
    isRoot: true,
    pubkey: "uhCAkFAARootAuthority0001",
  });
  const easa = addAgent(state, {
    name: "EASA",
    organisation: "European Union Aviation Safety Agency",
    organisationId: "EASA",
    isRoot: true,
    pubkey: "uhCAkEASARootAuthority001",
  });
  const boeing = addAgent(state, {
    name: "Boeing",
    organisation: "The Boeing Company",
    organisationId: "BOEING",
    isRoot: false,
    pubkey: "uhCAkBoeingOEMKey0000001",
  });
  const aero = addAgent(state, {
    name: "AeroFix",
    organisation: "AeroFix MRO Ltd",
    organisationId: "AEROFIX",
    isRoot: false,
    pubkey: "uhCAkAeroFixMROKey000001",
  });
  addAgent(state, {
    name: "Northline",
    organisation: "Northline Air",
    organisationId: "NORTHLINE",
    isRoot: false,
    pubkey: "uhCAkNorthlineAirKey0001",
  });

  const oem = issueMembership(state, faa.pubkey, {
    agentPubkey: boeing.pubkey,
    role: "Oem",
    organisation: boeing.organisation,
    organisationId: boeing.organisationId,
    accreditation: {
      accreditationType: "OemAuthorized",
      certNumber: "OEM-BCA-441",
      issuingAuthority: "FAA",
    },
    expiresAt: yearFromNow(),
  });
  if (!oem.ok) return state;

  issueMembership(state, boeing.pubkey, {
    agentPubkey: aero.pubkey,
    role: "Mro",
    organisation: aero.organisation,
    organisationId: aero.organisationId,
    accreditation: {
      accreditationType: "EasaPart145",
      certNumber: "UK.145.01234",
      issuingAuthority: "EASA",
    },
    expiresAt: yearFromNow(),
    issuerMembershipHash: oem.value.hash,
  });

  void easa;
  return state;
}

export function sampleInspect(state: EngineState): Attestation | null {
  const aero = state.agents.find((a) => a.name === "AeroFix");
  const mem = state.records.find(
    (r) => r.entry.type === "MembershipProof" && r.entry.value.agentPubkey === aero?.pubkey,
  );
  if (!aero || !mem || mem.entry.type !== "MembershipProof") return null;
  return {
    rafVersion: RAF_VERSION,
    subject: {
      partType: "Engine",
      partNumber: "CFM56-7B27",
      serialNumber: "577737",
      description: "CFM56-7B27 turbofan, stage 1 fan disk",
    },
    binding: {
      certificationPath: "ReturnToService",
      bindsField: "serial_and_part",
      documentType: "EasaForm1",
      documentId: "AFX-2026-0142",
      documentDigest: digest("form1-0142"),
    },
    scope: {
      observed: [{ assertionId: "INSPECTED", value: { kind: "Bool", value: true } }],
      notObserved: ["OVERHAULED", "MODIFIED"],
    },
    evidence: [{ evidenceType: "shop_traveler", digest: digest("traveler-0142") }],
    attester: {
      agentPubkey: aero.pubkey,
      role: mem.entry.value.role,
      organisation: mem.entry.value.organisation,
      organisationId: mem.entry.value.organisationId,
    },
    membershipProofHash: mem.hash,
  };
}

export function sampleOverhaul(state: EngineState, predecessorHash: string): Attestation | null {
  const inspect = sampleInspect(state);
  if (!inspect) return null;
  return {
    ...inspect,
    binding: {
      ...inspect.binding,
      documentType: "EasaForm1",
      documentId: "AFX-2026-0208",
      documentDigest: digest("form1-0208"),
      predecessorDocumentHash: predecessorHash,
    },
    scope: {
      observed: [{ assertionId: "OVERHAULED", value: { kind: "Bool", value: true } }],
      // A return-to-service record may only use AC 43-9D Table B-1 terms. This
      // said PROTOTYPE, which is an airworthiness term, and the path split now
      // rejects it — correctly, and it broke this scenario until 2026-09-02.
      notObserved: ["MODIFIED"],
    },
    evidence: [{ evidenceType: "shop_traveler", digest: digest("traveler-0208") }],
  };
}

export function sampleConflict(state: EngineState): Attestation | null {
  const inspect = sampleInspect(state);
  if (!inspect) return null;
  return {
    ...inspect,
    binding: {
      ...inspect.binding,
      documentId: "AFX-2026-0142-B",
      documentDigest: digest("form1-0142b"),
    },
    scope: {
      observed: [{ assertionId: "INSPECTED", value: { kind: "Bool", value: false } }],
      notObserved: [],
    },
  };
}

export function runHappyPath(state: EngineState): {
  inspect?: string;
  overhaul?: string;
  error?: string;
} {
  const inspect = sampleInspect(state);
  if (!inspect) return { error: "seed the network first" };
  const a = createAttestation(state, inspect);
  if (!a.ok) return { error: a.reason };
  const overhaul = sampleOverhaul(state, a.value.hash);
  if (!overhaul) return { error: "could not build overhaul" };
  const b = createAttestation(state, overhaul);
  if (!b.ok) return { error: b.reason };
  return { inspect: a.value.hash, overhaul: b.value.hash };
}
