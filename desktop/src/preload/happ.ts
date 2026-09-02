// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { CallZomeRequest } from '@holochain/client';

contextBridge.exposeInMainWorld('__HC_ZOME_CALL_SIGNER__', {
  signZomeCall: (zomeCall: CallZomeRequest) =>
    ipcRenderer.invoke('sign-zome-call', zomeCall),
});

/**
 * Joining a network with no bootstrap server.
 *
 * The renderer holds only an app-level token, but `agentInfo` and
 * `addAgentInfo` are admin calls — so they are bridged through the main
 * process rather than exposed to the page.
 */
contextBridge.exposeInMainWorld('__HALLMARK__', {
  /** This network's definition — roots, seed, vocabularies. Never expires. */
  getNetworkKey: (): Promise<string> => ipcRenderer.invoke('network-key-get'),
  /** Join someone else's network. Takes effect on the next launch. */
  setNetworkKey: (key: string): Promise<boolean> =>
    ipcRenderer.invoke('network-key-set', key),
  /** Where this node stands: root or not, how many peers it knows. Read live. */
  nodeStatus: (): Promise<{
    agentB64?: string;
    isRoot: boolean;
    rootCount: number;
    peerCount: number;
    usingOwnServers: boolean;
  }> => ipcRenderer.invoke('node-status'),
  /** Which bootstrap and relay servers this device uses. */
  getServers: (): Promise<{ bootstrapUrl: string; relayUrl: string; isDefault: boolean }> =>
    ipcRenderer.invoke('servers-get'),
  /** Point at different servers - e.g. one you run yourself. Applies on relaunch. */
  setServers: (bootstrapUrl?: string, relayUrl?: string): Promise<boolean> =>
    ipcRenderer.invoke('servers-set', bootstrapUrl, relayUrl),
  /** Where this device is on the wire. Signed with a 20-minute expiry. */
  getPeerInfo: (): Promise<string> => ipcRenderer.invoke('peer-info-get'),
  /** Introduce this device to another one. */
  addPeerInfo: (encoded: string): Promise<number> =>
    ipcRenderer.invoke('peer-info-add', encoded),
});
