import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainInvokeEvent,
  Menu,
  nativeImage,
  protocol,
  Tray,
  Notification,
  Event,
} from 'electron';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { ZomeCallSigner } from '@holochain/hc-spin-rust-utils';
import contextMenu from 'electron-context-menu';
import { encode } from '@msgpack/msgpack';
import { sha512 } from 'js-sha512';
import {
  CallZomeRequest,
  CallZomeRequestSigned,
  getNonceExpiration,
  randomNonce,
  encodeHashToBase64,
} from '@holochain/client';
import { Command } from 'commander';
import semver from 'semver';

import { breakingVersion, KangarooFileSystem } from './filesystem';
import { KangarooEmitter } from './eventEmitter';
import { setupLogs } from './logs';
import { HolochainManager } from './holochainManager';
import {
  readNetworkConfig,
  writeNetworkConfig,
  writeServerUrls,
  type NetworkProperties,
} from './networkConfig';
import { createSplashWindow } from './windows';
import { KANGAROO_CONFIG, NOTIFICATIONS_ICON_PATH, SYSTRAY_ICON_PATH } from './const';
import { kangarooMenu } from './menu';
import { validateArgs } from './cli';
import { autoUpdater, UpdateCheckResult } from '@matthme/electron-updater';
import { launch } from './launch';
import { PasswordType, SplashScreenType } from './types';

// Read CLI options

const kangarooCli = new Command();

kangarooCli
  .name(KANGAROO_CONFIG.productName)
  .description(`Run ${KANGAROO_CONFIG.productName} via the command line`)
  .version(KANGAROO_CONFIG.version)
  .option(
    '-p, --profile <string>',
    `Runs ${KANGAROO_CONFIG.productName} with a custom profile with its own dedicated data store.`,
  )
  .option(
    '-n, --network-seed <string>',
    'If this is the first time running kangaroo with the given profile, this installs the happ with the provided network seed.',
  )
  .option(
    '--holochain-path <path>',
    `Runs ${KANGAROO_CONFIG.productName} with the holochain binary at the provided path. Use with caution since this may potentially corrupt your databases if the binary you use is not compatible with existing databases.`,
  )
  .option(
    '--lair-path <path>',
    `Runs the ${KANGAROO_CONFIG.productName} with the lair binary at the provided path. Use with caution since this may potentially corrupt your databases if the binary you use is not compatible with existing databases.`,
  )
  .option('--holochain-rust-log <string>', 'RUST_LOG value to pass to the holochain binary')
  .option('--holochain-wasm-log <string>', 'WASM_LOG value to pass to the holochain binary')
  .option('--lair-rust-log <string>', 'RUST_LOG value to pass to the lair keystore binary')
  .option(
    '-b, --bootstrap-url <url>',
    'URL of the bootstrap server to use (not persisted across restarts).',
  )
  .option(
    '--relay-url <url>',
    'URL of the relay server to use (not persisted across restarts).',
  )
  .option(
    '-s, --signal-url <url>',
    'URL of the signaling server to use (not persisted across restarts).',
  )
  .option(
    '--ice-urls <string>',
    'Comma separated string of ICE server URLs to use. Is ignored if an external holochain binary is being used (not persisted across restarts).',
  )
  .option(
    '--print-holochain-logs',
    'Print holochain logs directly to the terminal (they will be still written to the logfile as well)',
  );

// electron-builder's AppImage launcher injects --no-sandbox as a fallback when it can't
// verify unprivileged user namespaces are available; Chromium already consumes it natively,
// so strip it here before Commander sees an option it doesn't own.
//
// Commander only auto-detects the Electron argv convention (packaged apps have no separate
// script path arg, so only 1 leading element instead of node's 2) when parse() is called with
// no arguments at all. Passing our filtered array opts us out of that detection, so we have to
// tell it explicitly via `from: 'electron'` - otherwise it slices off 2 leading elements instead
// of 1 and eats the first real CLI argument along with the executable path.
kangarooCli.parse(
  process.argv.filter((arg) => arg !== '--no-sandbox'),
  { from: 'electron' },
);

const RUN_OPTIONS = validateArgs(kangarooCli.opts());

// Read and validate the config file to check that the content does not contain
// default values

// Check whether lair is initialized or not and if not, decide based on the config
// file whether or not to show the splashscreen or use a default password

if (!app.isPackaged) {
  app.setName(KANGAROO_CONFIG.appId + '-dev');
}

contextMenu({
  showSaveImageAs: true,
  showSearchWithGoogle: false,
  showInspectElement: true,
  append: (_defaultActions, _parameters, browserWindow) => [
    {
      label: 'Reload',
      click: () => (browserWindow as BrowserWindow).reload(),
    },
  ],
});

const KANGAROO_FILESYSTEM = KangarooFileSystem.connect(app, RUN_OPTIONS.profile);

const KANGAROO_EMITTER = new KangarooEmitter();

setupLogs(KANGAROO_EMITTER, KANGAROO_FILESYSTEM, RUN_OPTIONS.printHolochainLogs);

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'webhapp',
    privileges: { standard: true, secure: true, stream: true },
  },
]);

const handleSignZomeCall = async (
  _e: IpcMainInvokeEvent,
  request: CallZomeRequest,
): Promise<CallZomeRequestSigned> => {
  if (!ZOME_CALL_SIGNER) throw new Error('Zome call signer undefined.');
  if (!request.provenance)
    return Promise.reject(
      'Call zome request has provenance field not set. This should be set by the js-client.',
    );

  const zomeCallToSign: CallZomeRequest = {
    cell_id: request.cell_id,
    zome_name: request.zome_name,
    fn_name: request.fn_name,
    payload: encode(request.payload),
    provenance: request.provenance,
    nonce: await randomNonce(),
    expires_at: getNonceExpiration(),
  };

  const zomeCallBytes = encode(zomeCallToSign);
  const bytesHash = sha512.array(zomeCallBytes);

  const signature: number[] = await ZOME_CALL_SIGNER.signZomeCall(
    bytesHash,
    Array.from(request.provenance),
  );

  const signedZomeCall: CallZomeRequestSigned = {
    bytes: zomeCallBytes,
    signature: Uint8Array.from(signature),
  };

  return signedZomeCall;
};

let ZOME_CALL_SIGNER: ZomeCallSigner | undefined;
let HOLOCHAIN_MANAGER: HolochainManager | undefined;
let LAIR_HANDLE: childProcess.ChildProcessWithoutNullStreams | undefined;
let MAIN_WINDOW: BrowserWindow | undefined | null;
let SPLASH_SCREEN_WINDOW: BrowserWindow | undefined;
let IS_APP_QUITTING = false;

Menu.setApplicationMenu(kangarooMenu(KANGAROO_FILESYSTEM));

app.whenReady().then(async () => {
  /**
   * Figure out which splashscreen to show and whether to start holochain immediately.
   */
  let splashScreenType: SplashScreenType;
  let startImmediately = false;

  if (KANGAROO_CONFIG.passwordMode === 'no-password') {
    splashScreenType = SplashScreenType.LoadingOnly;
    startImmediately = true;
  } else if (KANGAROO_CONFIG.passwordMode === 'password-required') {
    if (KANGAROO_FILESYSTEM.keystoreInitialized()) {
      splashScreenType = SplashScreenType.EnterPassword;
    } else {
      splashScreenType = SplashScreenType.PasswordSetup;
    }
  } else if (KANGAROO_CONFIG.passwordMode === 'password-optional') {
    const keystoreInitialized = KANGAROO_FILESYSTEM.keystoreInitialized();
    const randomPwExists = KANGAROO_FILESYSTEM.randomPasswordExists();
    if (keystoreInitialized && randomPwExists) {
      splashScreenType = SplashScreenType.LoadingOnly;
      startImmediately = true;
    } else if (keystoreInitialized && !randomPwExists) {
      splashScreenType = SplashScreenType.EnterPassword;
    } else {
      splashScreenType = SplashScreenType.PasswordSetupOtional;
    }
  } else {
    throw new Error(
      `Unexpected setup state.\nKeystore initialized: ${KANGAROO_FILESYSTEM.keystoreInitialized()}.\nPassword mode: ${
        KANGAROO_CONFIG.passwordMode
      }\nRandom pw exists: ${KANGAROO_FILESYSTEM.randomPasswordExists()}`,
    );
  }

  /**
   * IPC handlers
   *
   * Note that any IPC handlers that the splashscreen might be using should be registered
   * before the splashscreen window is created in order to ensure that they are getting
   * registered in time.
   */
  // ------------------------------------------------------------------------------------
  ipcMain.handle('sign-zome-call', handleSignZomeCall);
  ipcMain.handle('exit', () => {
    app.exit(0);
  });
  ipcMain.handle('get-name-and-version', () => ({
    productName: KANGAROO_CONFIG.productName,
    version: KANGAROO_CONFIG.version,
  }));

  // ------------------------------------------------------------------------------------
  // Joining a network without anybody's server.
  //
  // Two separate things travel between devices, and they behave differently:
  //
  //  - The **network key** says which network this is: the root authorities, the
  //    seed, the vocabularies. It never expires. Paste it in and your DNA hash
  //    matches theirs, which is what "same network" means.
  //  - **Peer info** says where a device is on the wire *right now*. Kitsune2
  //    signs it with a 20-minute expiry, so it cannot be put in a durable
  //    invite — it is swapped live, or fetched from a bootstrap server.
  //
  // `agentInfo` and `addAgentInfo` are admin-level calls, and the renderer only
  // holds an app-level token, so they are bridged here rather than exposed.
  // ------------------------------------------------------------------------------------
  ipcMain.handle('network-key-get', () => {
    const { properties } = readNetworkConfig(KANGAROO_FILESYSTEM);
    return Buffer.from(JSON.stringify(properties)).toString('base64');
  });

  ipcMain.handle('network-key-set', (_e, key: string) => {
    let properties: unknown;
    try {
      properties = JSON.parse(Buffer.from(key.trim(), 'base64').toString('utf-8'));
    } catch {
      throw new Error('That does not look like a network key.');
    }
    if (!properties || typeof properties !== 'object') {
      throw new Error('That does not look like a network key.');
    }
    const roots = (properties as { initial_members?: unknown }).initial_members;
    if (!Array.isArray(roots) || roots.length === 0) {
      throw new Error('That network key names no root authority.');
    }
    writeNetworkConfig(KANGAROO_FILESYSTEM, properties as NetworkProperties);
    // The DNA hash is derived from these, so the app has to reinstall onto the
    // new network. It does that on next launch, keeping this agent key.
    return true;
  });

  /**
   * Where this node actually stands, for the guided demonstration.
   *
   * Every value is read from the conductor or from disk. Nothing is remembered
   * about what the user "has done" — a checklist that trusts its own memory
   * will happily tell you a step succeeded when the conductor disagrees.
   */
  ipcMain.handle('node-status', async () => {
    const cfg = readNetworkConfig(KANGAROO_FILESYSTEM);
    const keyPath = path.join(KANGAROO_FILESYSTEM.profileDataDir, 'agent.key');
    let agentB64: string | undefined;
    if (fs.existsSync(keyPath)) {
      const bytes = new Uint8Array(JSON.parse(fs.readFileSync(keyPath, 'utf-8')));
      agentB64 = encodeHashToBase64(bytes);
    }

    // agentInfo includes this node's own entry, so anything above one means we
    // have actually heard of somebody else.
    let peerCount = 0;
    if (HOLOCHAIN_MANAGER) {
      try {
        const infos = await HOLOCHAIN_MANAGER.adminWebsocket.agentInfo({ dna_hashes: null });
        peerCount = Math.max(0, infos.length - 1);
      } catch {
        peerCount = 0;
      }
    }

    return {
      agentB64,
      isRoot: agentB64 ? cfg.properties.initial_members.includes(agentB64) : false,
      rootCount: cfg.properties.initial_members.length,
      peerCount,
      usingOwnServers: !!cfg.bootstrapUrl || !!cfg.relayUrl,
    };
  });

  ipcMain.handle('servers-get', () => {
    const cfg = readNetworkConfig(KANGAROO_FILESYSTEM);
    return {
      bootstrapUrl: cfg.bootstrapUrl ?? KANGAROO_CONFIG.bootstrapUrl,
      relayUrl: cfg.relayUrl ?? KANGAROO_CONFIG.relayUrl,
      isDefault: !cfg.bootstrapUrl && !cfg.relayUrl,
    };
  });

  ipcMain.handle('servers-set', (_e, bootstrapUrl?: string, relayUrl?: string) => {
    const clean = (u?: string) => {
      const t = u?.trim();
      if (!t) return undefined;
      try {
        new URL(t);
      } catch {
        throw new Error(`Not a valid URL: ${t}`);
      }
      return t;
    };
    writeServerUrls(KANGAROO_FILESYSTEM, clean(bootstrapUrl), clean(relayUrl));
    return true;
  });

  ipcMain.handle('peer-info-get', async () => {
    if (!HOLOCHAIN_MANAGER) throw new Error('The conductor is not running yet.');
    const infos = await HOLOCHAIN_MANAGER.adminWebsocket.agentInfo({ dna_hashes: null });
    return JSON.stringify(infos);
  });

  ipcMain.handle('peer-info-add', async (_e, encoded: string) => {
    if (!HOLOCHAIN_MANAGER) throw new Error('The conductor is not running yet.');
    let agent_infos: string[];
    try {
      agent_infos = JSON.parse(encoded.trim());
    } catch {
      throw new Error('That does not look like peer info.');
    }
    if (!Array.isArray(agent_infos) || agent_infos.length === 0) {
      throw new Error('That peer info is empty.');
    }
    await HOLOCHAIN_MANAGER.adminWebsocket.addAgentInfo({ agent_infos });
    return agent_infos.length;
  });
  // Will be called by the splashscreen UI in the "password-optional"
  // or "user-provided" password modes
  ipcMain.handle('launch', async (_e, passwordInput: PasswordType): Promise<void> => {
    const { lairHandle, holochainManager, mainWindow, zomeCallSigner } = await launch(
      KANGAROO_FILESYSTEM,
      KANGAROO_EMITTER,
      SPLASH_SCREEN_WINDOW,
      passwordInput,
      RUN_OPTIONS,
    );

    LAIR_HANDLE = lairHandle;
    HOLOCHAIN_MANAGER = holochainManager;
    MAIN_WINDOW = mainWindow;
    ZOME_CALL_SIGNER = zomeCallSigner;

    if (KANGAROO_CONFIG.systray) {
      MAIN_WINDOW.on('close', mainWindowCloseHandler);
    }
  });
  ipcMain.handle('open-logs', async () => KANGAROO_FILESYSTEM.openLogs());
  ipcMain.handle('export-logs', async () => KANGAROO_FILESYSTEM.exportLogs());
  (ipcMain.handle('factory-reset', async () => {
    const userDecision = await dialog.showMessageBox({
      title: 'Factory Reset',
      type: 'warning',
      buttons: ['Cancel', 'Confirm'],
      defaultId: 0,
      cancelId: 0,
      message: `Are you sure you want to factory reset ${KANGAROO_CONFIG.productName}? This will delete all ${KANGAROO_CONFIG.productName} data related to the current profile (${KANGAROO_FILESYSTEM.profile}). This cannot be undone.`,
    });
    if (userDecision.response === 1) {
      // Close all windows
      if (MAIN_WINDOW) MAIN_WINDOW.close();
      if (SPLASH_SCREEN_WINDOW) SPLASH_SCREEN_WINDOW.close();
      // Kill holochain and lair
      if (LAIR_HANDLE) LAIR_HANDLE.kill();
      if (HOLOCHAIN_MANAGER) HOLOCHAIN_MANAGER.processHandle.kill();
      // Remove all data
      await KANGAROO_FILESYSTEM.factoryReset();
      // restart App
      const options: Electron.RelaunchOptions = {
        args: process.argv,
      };
      // https://github.com/electron-userland/electron-builder/issues/1727#issuecomment-769896927
      if (process.env.APPIMAGE) {
        console.log('process.execPath: ', process.execPath);
        options.args!.unshift('--appimage-extract-and-run');
        options.execPath = process.env.APPIMAGE;
      }
      app.relaunch(options);
      app.quit();
    }
  }),
    // ------------------------------------------------------------------------------------

    (SPLASH_SCREEN_WINDOW = createSplashWindow(splashScreenType)));
  SPLASH_SCREEN_WINDOW.on('closed', () => {
    // We need to drop the variable here to be able to distinguish
    // in other places whether the splah screen window is still open
    // or not.
    SPLASH_SCREEN_WINDOW = undefined;
  });

  if (KANGAROO_CONFIG.systray) {
    const systray = new Tray(SYSTRAY_ICON_PATH);
    systray.setToolTip(KANGAROO_CONFIG.productName);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open',
        type: 'normal',
        click() {
          if (SPLASH_SCREEN_WINDOW) {
            SPLASH_SCREEN_WINDOW.show();
          } else if (MAIN_WINDOW) {
            MAIN_WINDOW.show();
          }
        },
      },
      {
        label: 'Restart',
        type: 'normal',
        click() {
          const options: Electron.RelaunchOptions = {
            args: process.argv,
          };
          // https://github.com/electron-userland/electron-builder/issues/1727#issuecomment-769896927
          if (process.env.APPIMAGE) {
            console.log('process.execPath: ', process.execPath);
            options.args?.unshift('--appimage-extract-and-run');
            options.execPath = process.env.APPIMAGE;
          }
          app.relaunch(options);
          app.quit();
        },
      },
      {
        label: 'Quit',
        type: 'normal',
        click() {
          app.quit();
        },
      },
    ]);

    systray.setContextMenu(contextMenu);
  }

  /**
   * Checking for app updates
   */
  if (app.isPackaged && KANGAROO_CONFIG.autoUpdates) {
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload = false;

    let updateCheckResult: UpdateCheckResult | null | undefined;

    try {
      // Note that the official electron-updater in the checkForUpdates() step by default only
      // fetches the latest release on github, regardless of whether it is semver compatible.
      // As a consequence, app versions belonging to an older semver line would stop receiving updates
      // here since we deliberately reject semver incompatible updates below (see the "Versioning" section
      // in the README). Therefore, we're using a fork of electron-builder (at the time of writing
      // https://github.com/holochain/electron-builder/) such that checkForUpdates() still gives
      // us latest semver compatible release, even if that release is not the highest version overall.
      updateCheckResult = await autoUpdater.checkForUpdates();
    } catch (e) {
      console.warn('Failed to check for updates: ', e);
    }

    console.log('updateCheckResult: ', updateCheckResult);

    // Double-check that the release we got (if any) is semver compatible, as we only install semver compatible updates.
    const appVersion = app.getVersion();
    if (
      updateCheckResult &&
      breakingVersion(updateCheckResult.updateInfo.version) === breakingVersion(appVersion) &&
      semver.gt(updateCheckResult.updateInfo.version, appVersion)
    ) {
      const userDecision = await dialog.showMessageBox({
        title: 'Update Available',
        type: 'question',
        buttons: ['Deny', 'Install and Restart'],
        defaultId: 0,
        cancelId: 0,
        message: `A new compatible version of ${KANGAROO_CONFIG.productName} is available (${updateCheckResult.updateInfo.version}). Do you want to install it?`,
      });
      if (userDecision.response === 1) {
        // downloading means that with the next start of the application it's automatically going to be installed
        autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall());
        await autoUpdater.downloadUpdate();
      }
    }
  }

  /**
   * If the conditions are fulfilled we can immediately start holochain here,
   * otherwise we start holochain when the corresponding splashscreen UI invokes
   * the 'launch' IPC command
   */
  if (startImmediately) {
    const { lairHandle, holochainManager, mainWindow, zomeCallSigner } = await launch(
      KANGAROO_FILESYSTEM,
      KANGAROO_EMITTER,
      SPLASH_SCREEN_WINDOW,
      { type: 'random' },
      RUN_OPTIONS,
    );

    LAIR_HANDLE = lairHandle;
    HOLOCHAIN_MANAGER = holochainManager;
    MAIN_WINDOW = mainWindow;
    ZOME_CALL_SIGNER = zomeCallSigner;

    if (KANGAROO_CONFIG.systray) {
      MAIN_WINDOW.on('close', mainWindowCloseHandler);
    }
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.quit();
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
});

// This is here to distinguish in the 'close' listener of the main window,
// for the case that a systray icon is used, whether the main window should
// indeed be closed (if the app is attempted to be quit via the systray menu)
// or only hidden
app.on('before-quit', () => {
  IS_APP_QUITTING = true;
});

app.on('quit', () => {
  if (LAIR_HANDLE) {
    LAIR_HANDLE.kill();
  }
  if (HOLOCHAIN_MANAGER) {
    HOLOCHAIN_MANAGER.processHandle.kill();
  }
});

/**
 * This handler will make sure that the main window only gets hidden instead of
 * closed (to maintain the javascript state) if the systray icon option is
 * used.
 *
 * @param e Window close event
 */
const mainWindowCloseHandler = (e: Event) => {
  if (!IS_APP_QUITTING && MAIN_WINDOW) {
    e.preventDefault();
    MAIN_WINDOW.hide();

    const notificationIcon = nativeImage.createFromPath(NOTIFICATIONS_ICON_PATH);
    new Notification({
      title: `${KANGAROO_CONFIG.productName} keeps running in the background`,
      body: `To close ${KANGAROO_CONFIG.productName} and stop synching with peers, quit from the icon in the system tray.`,
      icon: notificationIcon,
    })
      .on('click', async () => {
        if (MAIN_WINDOW) {
          MAIN_WINDOW.show();
          const response = await dialog.showMessageBox(MAIN_WINDOW, {
            type: 'info',
            message: `${KANGAROO_CONFIG.productName} keeps running in the background if you close the Window.\n\nThis is to keep synchronizing data with peers.\n\nDo you want to quit ${KANGAROO_CONFIG.productName} fully?`,
            buttons: ['Keep Running', 'Quit'],
            defaultId: 0,
            cancelId: 1,
          });
          if (response.response === 1) {
            app.quit();
          }
        }
      })
      .show();
  }
  console.log('Is main window still defined?', MAIN_WINDOW);
};
