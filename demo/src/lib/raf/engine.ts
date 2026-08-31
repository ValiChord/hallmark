import {
  DEFAULT_DNA,
  type Agent,
  type Attestation,
  type AttesterRole,
  type CounterAttestation,
  type DhtLink,
  type DhtRecord,
  type DnaProperties,
  type Entry,
  type KeyAcceptance,
  type KeyHandoff,
  type MembershipProof,
  type MembershipRevocation,
  type RevocationGrounds,
} from "./types";
import {
  agentBase,
  documentBase,
  serialBase,
  validateCreate,
  type Lookup,
} from "./validate";

export type EngineState = {
  dna: DnaProperties;
  agents: Agent[];
  records: DhtRecord[];
  links: DhtLink[];
  seq: number;
  log: LogEvent[];
};

export type LogEvent = {
  id: number;
  at: number;
  kind: "ok" | "reject" | "info";
  title: string;
  detail?: string;
  hash?: string;
};

export type EngineResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function emptyState(): EngineState {
  return {
    dna: { ...DEFAULT_DNA, initialMembers: [] },
    agents: [],
    records: [],
    links: [],
    seq: 0,
    log: [],
  };
}
/**
 * Strictly monotonic record timestamps.
 *
 * `Date.now()` has millisecond resolution, so two records created in the same
 * tick share a stamp. Validation requires a predecessor to be strictly earlier,
 * so the scripted "inspect, then overhaul" scenario failed on a fast machine.
 * The real zome uses action timestamps, which are chain-ordered; this keeps the
 * in-memory twin faithful to that ordering.
 */
function nextTimestamp(state: EngineState): number {
  let last = 0;
  for (const r of state.records) if (r.timestamp > last) last = r.timestamp;
  return Math.max(Date.now(), last + 1);
}


function lookup(state: EngineState): Lookup {
  const map = new Map(state.records.map((r) => [r.hash, r]));
  return {
    get: (hash) => map.get(hash),
    dna: state.dna,
  };
}

function nextHash(state: EngineState, kind: string): string {
  const n = (state.seq + 1).toString(16).padStart(6, "0");
  return `uhCkk${kind}${n}`;
}

export function addAgent(
  state: EngineState,
  agent: Omit<Agent, "pubkey"> & { pubkey?: string },
): Agent {
  const pubkey =
    agent.pubkey ??
    `uhCAk${agent.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 8)}${state.seq + 1}`;
  const created: Agent = {
    pubkey,
    name: agent.name,
    organisation: agent.organisation,
    organisationId: agent.organisationId,
    isRoot: agent.isRoot,
  };
  state.agents.push(created);
  if (created.isRoot && !state.dna.initialMembers.includes(created.pubkey)) {
    state.dna.initialMembers = [...state.dna.initialMembers, created.pubkey];
  }
  state.seq += 1;
  state.log.unshift({
    id: state.seq,
    at: Date.now(),
    kind: "info",
    title: `Agent ${created.name} ${created.isRoot ? "(root)" : ""}`.trim(),
  });
  return created;
}

export function issueMembership(
  state: EngineState,
  issuer: string,
  proof: Omit<MembershipProof, "issuerAgent" | "depth"> & { depth?: number },
): EngineResult<DhtRecord> {
  let depth = 1;
  if (proof.issuerMembershipHash) {
    const rec = lookup(state).get(proof.issuerMembershipHash);
    if (rec?.entry.type === "MembershipProof") {
      depth = rec.entry.value.depth + 1;
    } else {
      return { ok: false, reason: "issuer membership not found" };
    }
  }
  const value: MembershipProof = {
    ...proof,
    issuerAgent: issuer,
    depth,
  };
  const timestamp = nextTimestamp(state);
  const verdict = validateCreate(
    { type: "MembershipProof", value },
    { author: issuer, timestamp },
    lookup(state),
  );
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: "Membership rejected",
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, "Mem");
  const record: DhtRecord = {
    hash,
    author: issuer,
    timestamp,
    entry: { type: "MembershipProof", value },
  };
  state.seq += 1;
  state.records.push(record);
  state.links.push({
    base: agentBase(value.agentPubkey),
    target: hash,
    type: "AgentMembership",
    author: issuer,
  });
  state.log.unshift({
    id: state.seq,
    at: timestamp,
    kind: "ok",
    title: `Membership → ${shortAgent(state, value.agentPubkey)} (depth ${depth})`,
    hash,
  });
  return { ok: true, value: record };
}

export function createAttestation(
  state: EngineState,
  attestation: Attestation,
): EngineResult<DhtRecord> {
  const author = attestation.attester.agentPubkey;
  const timestamp = nextTimestamp(state);
  const entry: Entry = { type: "Attestation", value: attestation };
  const verdict = validateCreate(entry, { author, timestamp }, lookup(state));
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: "Attestation rejected",
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, "Att");
  const record: DhtRecord = { hash, author, timestamp, entry };
  state.seq += 1;
  state.records.push(record);
  state.links.push(
    {
      base: serialBase(attestation.subject.partNumber, attestation.subject.serialNumber),
      target: hash,
      type: "SerialToAttestation",
      author,
    },
    {
      base: documentBase(attestation.binding.documentType, attestation.binding.documentId),
      target: hash,
      type: "DocumentToAttestation",
      author,
    },
    {
      base: agentBase(author),
      target: hash,
      type: "AgentToAttestation",
      author,
    },
  );
  state.log.unshift({
    id: state.seq,
    at: timestamp,
    kind: "ok",
    title: `${attestation.binding.documentType} ${attestation.binding.documentId} · ${attestation.subject.serialNumber}`,
    hash,
  });
  return { ok: true, value: record };
}

export function revokeMembership(
  state: EngineState,
  author: string,
  input: {
    membershipHash: string;
    grounds: RevocationGrounds;
    evidenceHashes: string[];
    notes?: string;
  },
): EngineResult<DhtRecord> {
  const mRec = lookup(state).get(input.membershipHash);
  if (!mRec || mRec.entry.type !== "MembershipProof") {
    return { ok: false, reason: "target is not a membership proof" };
  }
  const value: MembershipRevocation = {
    membershipHash: input.membershipHash,
    agentPubkey: mRec.entry.value.agentPubkey,
    grounds: input.grounds,
    evidenceHashes: input.evidenceHashes,
    notes: input.notes,
  };
  const timestamp = nextTimestamp(state);
  const entry: Entry = { type: "MembershipRevocation", value };
  const verdict = validateCreate(entry, { author, timestamp }, lookup(state));
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: "Revocation rejected",
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, "Rev");
  const record: DhtRecord = { hash, author, timestamp, entry };
  state.seq += 1;
  state.records.push(record);
  state.links.push(
    {
      base: input.membershipHash,
      target: hash,
      type: "MembershipToRevocation",
      author,
    },
    {
      base: agentBase(value.agentPubkey),
      target: hash,
      type: "AgentRevocation",
      author,
    },
  );
  state.log.unshift({
    id: state.seq,
    at: timestamp,
    kind: "ok",
    title: `Revoked ${shortAgent(state, value.agentPubkey)}`,
    detail: value.grounds.kind,
    hash,
  });
  return { ok: true, value: record };
}

export function createCounter(
  state: EngineState,
  author: string,
  attestationHash: string,
  counter: Omit<CounterAttestation, "attester"> & {
    role: AttesterRole;
    organisation: string;
    organisationId: string;
  },
): EngineResult<DhtRecord> {
  const original = lookup(state).get(attestationHash);
  if (!original || original.entry.type !== "Attestation") {
    return { ok: false, reason: "target is not an attestation" };
  }
  const value: CounterAttestation = {
    attester: {
      agentPubkey: author,
      role: counter.role,
      organisation: counter.organisation,
      organisationId: counter.organisationId,
    },
    agreement: counter.agreement,
    discrepancyNotes: counter.discrepancyNotes,
  };
  const timestamp = nextTimestamp(state);
  const entry: Entry = { type: "CounterAttestation", value };
  const verdict = validateCreate(entry, { author, timestamp }, lookup(state));
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: "Counter-attestation rejected",
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, "Ctr");
  const record: DhtRecord = { hash, author, timestamp, entry };
  state.seq += 1;
  state.records.push(record);
  state.links.push({
    base: attestationHash,
    target: hash,
    type: "AttestationToCounter",
    author,
  });
  state.log.unshift({
    id: state.seq,
    at: timestamp,
    kind: "ok",
    title: `Counter ${counter.agreement} on ${attestationHash.slice(-8)}`,
    hash,
  });
  return { ok: true, value: record };
}

export function createHandoff(
  state: EngineState,
  author: string,
  handoff: KeyHandoff,
): EngineResult<DhtRecord> {
  return commitEntry(state, author, { type: "KeyHandoff", value: handoff }, [], "Key handoff");
}

export function acceptHandoff(
  state: EngineState,
  author: string,
  handoffHash: string,
): EngineResult<DhtRecord> {
  const value: KeyAcceptance = { handoffHash };
  const timestamp = nextTimestamp(state);
  const entry: Entry = { type: "KeyAcceptance", value };
  const verdict = validateCreate(entry, { author, timestamp }, lookup(state));
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: "Key acceptance rejected",
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, "Acc");
  const record: DhtRecord = { hash, author, timestamp, entry };
  state.seq += 1;
  state.records.push(record);
  state.links.push({
    base: handoffHash,
    target: hash,
    type: "HandoffToAcceptance",
    author,
  });
  state.log.unshift({
    id: state.seq,
    at: timestamp,
    kind: "ok",
    title: "Key acceptance",
    hash,
  });
  return { ok: true, value: record };
}

function commitEntry(
  state: EngineState,
  author: string,
  entry: Entry,
  extraLinks: DhtLink[],
  title: string,
): EngineResult<DhtRecord> {
  const timestamp = nextTimestamp(state);
  const verdict = validateCreate(entry, { author, timestamp }, lookup(state));
  if (!verdict.ok) {
    state.seq += 1;
    state.log.unshift({
      id: state.seq,
      at: timestamp,
      kind: "reject",
      title: `${title} rejected`,
      detail: verdict.reason,
    });
    return { ok: false, reason: verdict.reason };
  }
  const hash = nextHash(state, entry.type.slice(0, 3));
  const record: DhtRecord = { hash, author, timestamp, entry };
  state.seq += 1;
  state.records.push(record);
  state.links.push(...extraLinks.map((l) => ({ ...l, target: l.target || hash })));
  state.log.unshift({ id: state.seq, at: timestamp, kind: "ok", title, hash });
  return { ok: true, value: record };
}

export function yearFromNow(ms = Date.now()): number {
  return ms + YEAR_MS;
}

export function shortAgent(state: EngineState, pubkey: string): string {
  return state.agents.find((a) => a.pubkey === pubkey)?.name ?? pubkey.slice(0, 10);
}

export function membershipsFor(state: EngineState, agent: string): DhtRecord[] {
  return state.records.filter(
    (r) => r.entry.type === "MembershipProof" && r.entry.value.agentPubkey === agent,
  );
}

export function latestMembership(state: EngineState, agent: string): DhtRecord | undefined {
  const list = membershipsFor(state, agent);
  return list[list.length - 1];
}

export function attestations(state: EngineState): DhtRecord[] {
  return state.records.filter((r) => r.entry.type === "Attestation");
}

export function recordByHash(state: EngineState, hash: string): DhtRecord | undefined {
  return state.records.find((r) => r.hash === hash);
}

export { lookup };
