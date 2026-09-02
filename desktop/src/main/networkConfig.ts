import fs from 'fs';
import path from 'path';
import { KangarooFileSystem } from './filesystem';

/**
 * The network's rule configuration, as DNA properties.
 *
 * These values are part of the DNA hash. Two installs can only see each other's
 * records if every value here matches exactly — which is why this file is
 * plain, readable JSON sitting in the app's data directory rather than
 * something buried in the binary. Anyone can check what network they are on,
 * and anyone can start a different one.
 *
 * `initial_members` is the trust anchor: the agent keys entitled to accredit
 * others. Nothing in the software decides who belongs there; that is a
 * governance question, and it is deliberately left where a human can see it.
 */
export type NetworkProperties = {
  initial_members: string[];
  airworthiness_vocabulary: string[];
  return_to_service_vocabulary: string[];
  max_delegation_depth: number;
  max_membership_ttl_micros: number;
};

export type NetworkConfig = {
  properties: NetworkProperties;
  /**
   * Where to find peers, and how to reach them. Both optional; unset means the
   * build's defaults.
   *
   * These are **conductor configuration, not DNA modifiers**, so unlike
   * `properties` they are not part of the DNA hash. Changing them does not put
   * you on a different network — it changes how you find and reach the one you
   * are already on. That is why they live outside `properties`: a change here
   * must not trigger a reinstall.
   *
   * Bootstrap answers "who is out there"; relay answers "how do I reach them".
   * A node's advertised address is a path on the relay, so a working relay is
   * required even when peers are introduced by hand. Kitsune2's `bootstrap_srv`
   * serves both, so on a LAN one process at one plain-HTTP address does it:
   *
   *   "bootstrapUrl": "http://192.168.1.50:8080",
   *   "relayUrl": "http://192.168.1.50:8080"
   */
  bootstrapUrl?: string;
  relayUrl?: string;
};

/**
 * FAA defaults, matching `demo/zomes/dna.yaml`. Both Block 11 lists are
 * verbatim from the regulator: 8130.21J ¶11.k for the airworthiness path and
 * AC 43-9D Table B-1 for return to service. A deployment for EASA would use
 * different lists — which is a different network, correctly.
 *
 * `initial_members` is empty here on purpose. `genesis_self_check` refuses to
 * install with no root authority, so the app will tell you to choose one rather
 * than quietly starting a network nobody can be accredited on.
 */
const DEFAULTS: NetworkProperties = {
  initial_members: [],
  airworthiness_vocabulary: ['NEW', 'PROTOTYPE', 'USED'],
  return_to_service_vocabulary: ['OVERHAULED', 'REPAIRED', 'INSPECTED', 'TESTED', 'MODIFIED'],
  max_delegation_depth: 2,
  max_membership_ttl_micros: 31536000000000,
};

export function networkConfigPath(kangarooFs: KangarooFileSystem): string {
  return path.join(kangarooFs.profileDataDir, 'network.json');
}

/**
 * Replace the network configuration. The DNA hash is derived from these values,
 * so the app reinstalls onto the new network on next launch — keeping the same
 * agent key, so any accreditation already issued to this device still applies.
 */
export function writeNetworkConfig(
  kangarooFs: KangarooFileSystem,
  properties: NetworkProperties
): void {
  // Preserve the server URLs: they are not part of the network's identity, so
  // joining a different network must not silently reset where you look for it.
  const existing = readNetworkConfig(kangarooFs);
  fs.writeFileSync(
    networkConfigPath(kangarooFs),
    JSON.stringify(
      {
        properties: { ...DEFAULTS, ...properties },
        bootstrapUrl: existing.bootstrapUrl,
        relayUrl: existing.relayUrl,
      },
      null,
      2
    )
  );
}

/** Point this device at different bootstrap/relay servers. Takes effect on relaunch. */
export function writeServerUrls(
  kangarooFs: KangarooFileSystem,
  bootstrapUrl: string | undefined,
  relayUrl: string | undefined
): void {
  const existing = readNetworkConfig(kangarooFs);
  fs.writeFileSync(
    networkConfigPath(kangarooFs),
    JSON.stringify(
      { properties: existing.properties, bootstrapUrl, relayUrl },
      null,
      2
    )
  );
}

export function readNetworkConfig(kangarooFs: KangarooFileSystem): NetworkConfig {
  const file = networkConfigPath(kangarooFs);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ properties: DEFAULTS }, null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as Partial<NetworkConfig>;
  return {
    properties: { ...DEFAULTS, ...(parsed.properties ?? {}) },
    bootstrapUrl: parsed.bootstrapUrl,
    relayUrl: parsed.relayUrl,
  };
}
