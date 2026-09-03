import {
  AppWebsocket,
  encodeHashToBase64,
  decodeHashFromBase64,
  type AppClient,
  type CellId,
  type ActionHash,
  type AgentPubKey,
} from "@holochain/client";
import { decode } from "@msgpack/msgpack";

const ROLE = "aviation";
const ZOME = "aviation_attestation_coordinator";

/**
 * Kangaroo injects `window.__HC_LAUNCHER_ENV__` into the renderer with the app
 * port, installed app id and an auth token. `AppWebsocket.connect()` reads it
 * with no arguments, which is why there is no URL here — and why this UI cannot
 * run in an ordinary browser tab. That is the point: there is no server to talk
 * to, only a conductor on this machine.
 */
let client: AppClient | null = null;
let cellId: CellId | null = null;

export type NodeInfo = {
  agentPubKey: AgentPubKey;
  agentB64: string;
  dnaB64: string;
  installedAppId: string;
};

export async function connect(): Promise<NodeInfo> {
  if (!client) {
    client = await AppWebsocket.connect();
  }
  const info = await client.appInfo();
  if (!info) throw new Error("no app info — is the conductor running?");

  const cells = info.cell_info[ROLE] ?? [];
  const provisioned = cells.find((c) => "provisioned" in c || c.type === "provisioned");
  if (!provisioned) throw new Error(`no provisioned cell for role '${ROLE}'`);
  // The client's cell_info shape changed across versions; accept either.
  const cell =
    (provisioned as { value?: { cell_id: CellId } }).value ??
    (provisioned as { provisioned?: { cell_id: CellId } }).provisioned;
  if (!cell) throw new Error("could not read cell id");
  cellId = cell.cell_id;

  return {
    agentPubKey: cellId[1],
    agentB64: encodeHashToBase64(cellId[1]),
    // The DNA hash is the identity of the rule set. Two nodes are on the same
    // network only if this string matches, which makes it the one value worth
    // showing a sceptic: it is a checksum over the rules everyone is running.
    dnaB64: encodeHashToBase64(cellId[0]),
    installedAppId: info.installed_app_id,
  };
}

export async function call<T = unknown>(fn_name: string, payload?: unknown): Promise<T> {
  if (!client) throw new Error("not connected");
  return (await client.callZome({
    role_name: ROLE,
    zome_name: ZOME,
    fn_name,
    payload: payload ?? null,
  })) as T;
}

export const b64 = encodeHashToBase64;

/** An ActionHash as returned inside a Record. */
export function recordHash(record: {
  signed_action?: { hashed?: { hash?: ActionHash } };
}): ActionHash | undefined {
  return record?.signed_action?.hashed?.hash;
}

/** Entries come back msgpack-encoded; decode rather than guess at the shape. */
export function recordEntry<T>(record: unknown): T | undefined {
  const present = (record as { entry?: { Present?: { entry?: Uint8Array } } })?.entry?.Present
    ?.entry;
  if (!present) return undefined;
  return decode(present) as T;
}

/**
 * Hash inputs typed or pasted by a person.
 *
 * `decodeHashFromBase64` does not validate: given anything at all it returns
 * whatever bytes it can, so a mistyped or wrong-kind hash travels all the way to
 * the conductor and comes back as a Wasm deserialize error naming a zome
 * function. That is unreadable, and it happens in front of an audience.
 *
 * Every Holochain hash is 39 bytes and carries a 3-byte prefix saying what it
 * is. Check both here and say plainly what went wrong.
 */
const AGENT_PREFIX = [132, 32, 36]; // uhCAk…
const ACTION_PREFIX = [132, 41, 36]; // uhCkk…

function parseHash(input: string, want: number[], kind: string, where: string): Uint8Array {
  const text = input.trim();
  if (!text) throw new Error(`Nothing entered. Paste ${kind}. ${where}`);
  let bytes: Uint8Array;
  try {
    bytes = decodeHashFromBase64(text);
  } catch {
    throw new Error(`That is not ${kind}. ${where}`);
  }
  if (bytes.length !== 39) {
    throw new Error(
      `That is not ${kind} — it decodes to ${bytes.length} bytes, and every Holochain hash is 39. ${where}`,
    );
  }
  const prefix = Array.from(bytes.slice(0, 3));
  if (prefix.join() !== want.join()) {
    const got =
      prefix.join() === AGENT_PREFIX.join()
        ? "an agent key"
        : prefix.join() === ACTION_PREFIX.join()
          ? "a record hash"
          : "some other kind of hash";
    throw new Error(`That is ${got}, not ${kind}. ${where}`);
  }
  return bytes;
}

/** An agent's public key, as shown on the This node tab. */
export function parseAgentKey(input: string): Uint8Array {
  return parseHash(input, AGENT_PREFIX, "an agent key", "An agent key begins uhCAk and is on the other device's This node tab. The Network tab's join code is a different, much longer thing.");
}

/** A hash identifying a record, such as an attestation or a membership. */
export function parseActionHash(input: string): Uint8Array {
  return parseHash(input, ACTION_PREFIX, "a record hash", "A record hash begins uhCkk and is given to you when a record is signed.");
}
