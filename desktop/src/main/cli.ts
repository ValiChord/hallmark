
export interface CliOpts {
  profile?: string;
  networkSeed?: string;
  holochainPath?: string;
  lairPath?: string;
  holochainRustLog?: string;
  holochainWasmLog?: string;
  lairRustLog?: string;
  bootstrapUrl?: string;
  relayUrl?: string;
  printHolochainLogs?: boolean;
}

export interface RunOptions {
  profile: string | undefined;
  networkSeed: string;
  bootstrapUrl: URL | undefined;
  relayUrl: URL | undefined;
  holochainPath: string | undefined;
  lairPath: string | undefined;
  holochainRustLog: string | undefined;
  holochainWasmLog: string | undefined;
  lairRustLog: string | undefined;
  printHolochainLogs: boolean;
}

export function validateArgs(args: CliOpts): RunOptions {
  // validate --profile argument
  const allowedProfilePattern = /^[0-9a-zA-Z-]+$/;
  if (args.profile && !allowedProfilePattern.test(args.profile)) {
    throw new Error(
      `The --profile argument may only contain digits (0-9), letters (a-z,A-Z) and dashes (-) but got '${args.profile}'`
    );
  }
  if (args.networkSeed && typeof args.networkSeed !== 'string') {
    throw new Error('The --network-seed argument must be of type string.');
  }
  if (args.bootstrapUrl && typeof args.bootstrapUrl !== 'string') {
    throw new Error('The --bootstrap-url argument must be of type string.');
  }
  if (args.relayUrl && typeof args.relayUrl !== 'string') {
    throw new Error('The --relay-url argument must be of type string.');
  }
  if (args.holochainPath && typeof args.holochainPath !== 'string') {
    throw new Error('The --holochain-path argument must be of type string.');
  }
  if (args.lairPath && typeof args.lairPath !== 'string') {
    throw new Error('The --lair-path argument must be of type string.');
  }
  if (args.holochainRustLog && typeof args.holochainRustLog !== 'string') {
    throw new Error('The --holochain-rust-log argument must be of type string.');
  }
  if (args.holochainWasmLog && typeof args.holochainWasmLog !== 'string') {
    throw new Error('The --holochain-wasm-log argument must be of type string.');
  }
  if (args.lairRustLog && typeof args.lairRustLog !== 'string') {
    throw new Error('The --lair-rust-log argument must be of type string.');
  }

  const profile = args.profile ? args.profile : undefined;
  // If provided take the one provided, otherwise check whether it's applet dev mode
  const networkSeed = args.networkSeed ? args.networkSeed : defaultAppNetworkSeed();

  const bootstrapUrl = args.bootstrapUrl ? new URL(args.bootstrapUrl) : undefined;
  const relayUrl = args.relayUrl ? new URL(args.relayUrl) : undefined;

  return {
    profile,
    networkSeed,
    bootstrapUrl,
    relayUrl,
    holochainPath: args.holochainPath ? args.holochainPath : undefined,
    lairPath: args.lairPath ? args.lairPath : undefined,
    holochainRustLog: args.holochainRustLog ? args.holochainRustLog : undefined,
    holochainWasmLog: args.holochainWasmLog ? args.holochainWasmLog : undefined,
    lairRustLog: args.lairRustLog ? args.lairRustLog : undefined,
    printHolochainLogs: !!args.printHolochainLogs,
  };
}

/**
 * The network seed is part of the DNA hash, so it decides which network you are
 * on just as much as the root authorities do.
 *
 * Stock Kangaroo derives it from the product name and the app version, and
 * appends `-dev` for unpackaged builds. Both are wrong for Hallmark, because a
 * network here is meant to outlive a release and to be shared with clients that
 * are not this app at all:
 *
 *  - at 0.0.z, `breakingVersion` returns the full patch version, so 0.0.1 and
 *    0.0.2 would be *different networks* — a patch release would silently strip
 *    every user of their peers;
 *  - the `-dev` suffix means a developer running `npm run dev` cannot see a
 *    packaged build, which is exactly the pairing you want while testing;
 *  - an Android build using Holochain's android-service-runtime has no notion of
 *    this app's product name or version, and must be told the same seed to land
 *    on the same DHT.
 *
 * So it is stated once, explicitly, as part of the network's identity. Change it
 * only when you intend to start a new network, and change it everywhere at once.
 * `--network-seed` still overrides it for testing.
 */
export const HALLMARK_NETWORK_SEED = 'hallmark-aviation-1';

function defaultAppNetworkSeed() {
  return HALLMARK_NETWORK_SEED;
}
