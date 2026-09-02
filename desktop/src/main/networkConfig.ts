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

export type NetworkConfig = { properties: NetworkProperties };

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
  fs.writeFileSync(
    networkConfigPath(kangarooFs),
    JSON.stringify({ properties: { ...DEFAULTS, ...properties } }, null, 2)
  );
}

export function readNetworkConfig(kangarooFs: KangarooFileSystem): NetworkConfig {
  const file = networkConfigPath(kangarooFs);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ properties: DEFAULTS }, null, 2));
  }
  const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as Partial<NetworkConfig>;
  return { properties: { ...DEFAULTS, ...(parsed.properties ?? {}) } };
}
