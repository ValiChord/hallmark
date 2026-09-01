#!/usr/bin/env node
/**
 * Build pouch/hallmark.webhapp from the zome sources and the desktop UI.
 *
 * A webhapp is the UI (a zip of static files) plus the .happ (the compiled
 * rules). Kangaroo installs the happ into a conductor on first launch and
 * serves the UI to the renderer, so this one file is the whole application.
 *
 * Requires `hc` on PATH — the same 0.7.0 binary CI uses. Get it from
 * https://github.com/holochain/holochain/releases/tag/holochain-0.7.0
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zipDirectory } from "./zip.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DESKTOP = resolve(HERE, "..");
const REPO = resolve(DESKTOP, "..");
const ZOMES = join(REPO, "demo", "zomes");
const HAPP = join(ZOMES, "aviation_provenance.happ");
const WEBHAPP_DIR = join(DESKTOP, "webhapp");
const UI_DIST = join(DESKTOP, "ui", "dist");

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });

if (!existsSync(join(UI_DIST, "index.html"))) {
  console.error("No UI build found. Run `npm --prefix ui run build` first.");
  process.exit(1);
}
if (!existsSync(HAPP)) {
  console.error(
    `No happ at ${HAPP}.\n` +
      "Build it with:\n" +
      "  cd demo/zomes\n" +
      "  cargo build --release --target wasm32-unknown-unknown\n" +
      "  hc dna pack . && hc app pack .",
  );
  process.exit(1);
}

// The UI zip must contain index.html at its ROOT, not inside a directory.
const uiZip = join(WEBHAPP_DIR, "ui.zip");
rmSync(uiZip, { force: true });
// index.html must sit at the ROOT of the zip, or the conductor serves a
// directory rather than the app.
const entries = zipDirectory(UI_DIST, uiZip);
console.log(`ui.zip: ${entries} files`);

copyFileSync(HAPP, join(WEBHAPP_DIR, "aviation_provenance.happ"));

run("hc", ["web-app", "pack", "."], WEBHAPP_DIR);

mkdirSync(join(DESKTOP, "pouch"), { recursive: true });
copyFileSync(join(WEBHAPP_DIR, "hallmark.webhapp"), join(DESKTOP, "pouch", "hallmark.webhapp"));
console.log("\nWrote pouch/hallmark.webhapp");
