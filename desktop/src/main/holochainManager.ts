/* eslint-disable import-x/no-named-as-default-member */
import getPort from 'get-port';
import fs from 'fs';
import yaml from 'js-yaml';
import * as childProcess from 'child_process';
import { HolochainVersion, KangarooEmitter } from './eventEmitter';
import split from 'split';
import {
  AdminWebsocket,
  AppAuthenticationToken,
  AppInfo,
  encodeHashToBase64,
} from '@holochain/client';
import { KangarooFileSystem } from './filesystem';
import { CONDUCTOR_CONFIG_TEMPLATE, HAPP_APP_ID, HAPP_PATH, KANGAROO_CONFIG } from './const';
import { app } from 'electron';
import path from 'path';
import { createHash } from 'crypto';
import { networkConfigPath, readNetworkConfig } from './networkConfig';

export type AdminPort = number;
export type AppPort = number;

export class HolochainManager {
  processHandle: childProcess.ChildProcessWithoutNullStreams;
  adminPort: AdminPort;
  appPort: AppPort;
  adminWebsocket: AdminWebsocket;
  fs: KangarooFileSystem;
  installedApps: AppInfo[];
  kangarooEmitter: KangarooEmitter;
  version: HolochainVersion;
  appToken: AppAuthenticationToken | undefined;

  constructor(
    processHandle: childProcess.ChildProcessWithoutNullStreams,
    kangarooEmitter: KangarooEmitter,
    kangarooFileSystem: KangarooFileSystem,
    adminPort: AdminPort,
    appPort: AppPort,
    adminWebsocket: AdminWebsocket,
    installedApps: AppInfo[],
    version: HolochainVersion
  ) {
    this.processHandle = processHandle;
    this.kangarooEmitter = kangarooEmitter;
    this.adminPort = adminPort;
    this.appPort = appPort;
    this.adminWebsocket = adminWebsocket;
    this.fs = kangarooFileSystem;
    this.installedApps = installedApps;
    this.version = version;
  }

  static async launch(
    kangarooEmitter: KangarooEmitter,
    kangarooFs: KangarooFileSystem,
    binary: string,
    password: string,
    version: HolochainVersion,
    rootDir: string,
    configPath: string,
    lairUrl: string,
    bootstrapUrl: string,
    relayUrl: string,
    rustLog?: string,
    wasmLog?: string
  ): Promise<HolochainManager> {
    const adminPort = process.env.ADMIN_PORT
      ? parseInt(process.env.ADMIN_PORT, 10)
      : await getPort();

    let conductorConfig;

    try {
      conductorConfig = yaml.load(fs.readFileSync(configPath));
    } catch (e) {
      console.warn(
        'Failed to read existing conductor-config.yaml file. Overwriting it with a default one.'
      );
      conductorConfig = CONDUCTOR_CONFIG_TEMPLATE;
    }

    conductorConfig.data_root_path = rootDir;
    conductorConfig.keystore.connection_url = lairUrl;
    conductorConfig.admin_interfaces = [
      {
        driver: { type: 'websocket', port: adminPort, allowed_origins: 'kangaroo' },
      },
    ];

    // network parameters
    conductorConfig.network.bootstrap_url = bootstrapUrl
      ? bootstrapUrl
      : KANGAROO_CONFIG.bootstrapUrl;
    conductorConfig.network.relay_url = relayUrl ? relayUrl : KANGAROO_CONFIG.relayUrl;

    // A relay reached over plain HTTP is refused by default — kitsune2's iroh
    // transport returns "Disallowed plaintext relay URL" and the conductor
    // fails to start. That default is right for the public internet and wrong
    // for a LAN, where running your own server over http:// is the point: there
    // is no TLS to be intercepted, and no third party in the path.
    //
    // So the flag follows the URL rather than being a setting of its own. Ask
    // for an http:// relay and you have already made the decision.
    const relayInUse = String(conductorConfig.network.relay_url ?? '');
    if (relayInUse.startsWith('http://')) {
      conductorConfig.network.advanced = {
        ...(conductorConfig.network.advanced ?? {}),
        irohTransport: {
          ...(conductorConfig.network.advanced?.irohTransport ?? {}),
          relayAllowPlainText: true,
        },
      };
      console.log('Relay is plaintext http:// — enabling relayAllowPlainText.');
    }

    console.log('Writing conductor-config.yaml...');

    fs.writeFileSync(configPath, yaml.dump(conductorConfig));

    const conductorHandle = childProcess.spawn(binary, ['-c', configPath, '-p'], {
      env: {
        RUST_LOG: rustLog
          ? rustLog
          : 'warn,' +
            // this thrashes on startup
            'wasmer_compiler_cranelift=error,' +
            // this gives a bunch of warnings about how long db accesses are taking, tmi
            'holochain_sqlite::db::access=error,' +
            // this gives a lot of "search_and_discover_peer_connect: no peers found, retrying after delay" messages on INFO
            'kitsune_p2p::spawn::actor::discover=error',
        WASM_LOG: wasmLog ? wasmLog : 'warn',
        NO_COLOR: '1',
      },
    });
    conductorHandle.stdin.write(password);
    conductorHandle.stdin.end();
    conductorHandle.stdout.pipe(split()).on('data', async (line: string) => {
      kangarooEmitter.emitHolochainLog({
        version,
        data: line,
      });
    });
    conductorHandle.stderr.pipe(split()).on('data', (line: string) => {
      kangarooEmitter.emitHolochainError({
        version,
        data: line,
      });
    });

    return new Promise((resolve, reject) => {
      conductorHandle.stderr.pipe(split()).on('data', async (line: string) => {
        if (line.includes('holochain had a problem and crashed')) {
          reject(
            `Holochain failed to start up and crashed. Check the logs for details (Help > Open Logs).`
          );
        }
      });
      conductorHandle.stdout.pipe(split()).on('data', async (line: string) => {
        if (line.includes('could not be parsed, because it is not valid YAML')) {
          reject(
            `Holochain failed to start up and crashed. Check the logs for details (Help > Open Logs).`
          );
        }
        if (line.includes('Conductor ready.')) {
          const adminWebsocket = await AdminWebsocket.connect({
            url: new URL(`ws://127.0.0.1:${adminPort}`),
            wsClientOptions: {
              origin: 'kangaroo',
            },
          });
          console.log('Connected to admin websocket.');
          const installedApps = await adminWebsocket.listApps({});
          const appInterfaces = await adminWebsocket.listAppInterfaces();
          console.log('Got appInterfaces: ', appInterfaces);
          let appPort;
          if (appInterfaces.length > 0) {
            appPort = appInterfaces[0].port;
          } else {
            const attachAppInterfaceResponse = await adminWebsocket.attachAppInterface({
              allowed_origins: app.isPackaged ? 'webhapp://webhappwindow' : '*',
            });
            console.log('Attached app interface port: ', attachAppInterfaceResponse);
            appPort = attachAppInterfaceResponse.port;
          }
          resolve(
            new HolochainManager(
              conductorHandle,
              kangarooEmitter,
              kangarooFs,
              adminPort,
              appPort,
              adminWebsocket,
              installedApps,
              version
            )
          );
        }
      });
    });
  }

  /**
   * Install the happ, with the network's root authorities supplied HERE rather
   * than compiled into the wasm.
   *
   * Hallmark's trust anchor is a DNA property, and DNA properties are part of
   * the DNA hash. So the root set is a deployment decision, it is visible in a
   * file the user can read, and changing it puts you on a *different* network
   * rather than giving you more authority on this one.
   *
   * Two departures from stock Kangaroo, both needed for that to be usable:
   *  - the agent key is persisted and reused, so changing the network config
   *    does not silently discard the identity you were accredited under;
   *  - a changed config reinstalls, instead of being ignored because an app
   *    with the same id already exists.
   */
  async installHappIfNecessary(networkSeed: string) {
    const network = readNetworkConfig(this.fs);
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(network.properties))
      .digest('hex');
    const stampPath = path.join(this.fs.profileDataDir, 'network.installed');
    const installedStamp = fs.existsSync(stampPath)
      ? fs.readFileSync(stampPath, 'utf-8').trim()
      : undefined;

    const installedApps = await this.adminWebsocket.listApps({});
    const alreadyInstalled = installedApps
      .map((appInfo) => appInfo.installed_app_id)
      .includes(HAPP_APP_ID);

    if (alreadyInstalled && installedStamp === fingerprint) return;

    // Reuse this conductor's agent key across reinstalls. Lair already holds
    // it; generating a new one would look to the network like a different
    // person, and would throw away any accreditation already issued to you.
    const keyPath = path.join(this.fs.profileDataDir, 'agent.key');
    let pubKey: Uint8Array;
    if (fs.existsSync(keyPath)) {
      pubKey = new Uint8Array(JSON.parse(fs.readFileSync(keyPath, 'utf-8')));
    } else {
      pubKey = await this.adminWebsocket.generateAgentPubKey();
      fs.writeFileSync(keyPath, JSON.stringify(Array.from(pubKey)));
    }

    // No root authority configured? Then this install starts its own network,
    // with you as its only root. That is not a fallback so much as the honest
    // default: a network with no trust anchor cannot accredit anyone, and
    // `genesis_self_check` refuses to install one.
    //
    // The consequence is worth understanding rather than hiding. Because the
    // root set is part of the DNA hash, your network is a *different* network
    // from everyone else's until you agree on the same roots. To join someone
    // else's, put their key in network.json and relaunch.
    if (network.properties.initial_members.length === 0) {
      network.properties.initial_members = [encodeHashToBase64(pubKey)];
      fs.writeFileSync(
        networkConfigPath(this.fs),
        JSON.stringify({ properties: network.properties }, null, 2)
      );
      console.log('No root authority configured - starting a network with this agent as root.');
    }

    if (alreadyInstalled) {
      console.log('Network configuration changed - reinstalling under the same agent key.');
      await this.adminWebsocket.uninstallApp({ installed_app_id: HAPP_APP_ID });
    }

    console.log(`Installing happ...`);
    const appInfo = await this.adminWebsocket.installApp({
      agent_key: pubKey,
      installed_app_id: HAPP_APP_ID,
      network_seed: networkSeed,
      source: {
        type: 'path',
        value: HAPP_PATH,
      },
      roles_settings: {
        aviation: {
          type: 'provisioned',
          value: { modifiers: { properties: network.properties } },
        },
      },
    });
    fs.writeFileSync(
      stampPath,
      createHash('sha256').update(JSON.stringify(network.properties)).digest('hex')
    );
    if (appInfo.status.type !== 'awaiting_memproofs') {
      try {
        await this.adminWebsocket.enableApp({
          installed_app_id: appInfo.installed_app_id,
        });
      } catch (e) {
        throw new Error(`Failed to enable happ: ${e}.`);
      }
    }
    const installedAppsNew = await this.adminWebsocket.listApps({});
    this.installedApps = installedAppsNew;
    this.kangarooEmitter.emitHappInstalled();
  }

  async getAppToken(): Promise<AppAuthenticationToken> {
    const token = this.appToken;
    if (token) return token;
    const response = await this.adminWebsocket.issueAppAuthenticationToken({
      installed_app_id: HAPP_APP_ID,
      single_use: false,
      expiry_seconds: 0,
    });
    this.appToken = response.token;
    return response.token;
  }
}
