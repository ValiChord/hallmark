#!/usr/bin/env node
/**
 * Run Hallmark's own bootstrap and relay server on this machine.
 *
 * Kitsune2's `bootstrap_srv` serves both: bootstrap answers "who is out there",
 * relay answers "how do I reach them". Over plain HTTP on a LAN this removes
 * two problems at once —
 *
 *   - no TLS, so antivirus software that intercepts encrypted connections
 *     cannot break it (see README, Troubleshooting);
 *   - no dependency on anyone else's infrastructure, which is the strongest
 *     form of the claim this project makes.
 *
 * Install once:
 *   cargo install kitsune2_bootstrap_srv --version 0.5.1
 *
 * Then:
 *   node scripts/local-network.mjs
 *
 * Paste the printed URL into each device's Network tab (both fields), and
 * relaunch each app. Holochain refuses a plaintext relay by default; the app
 * sets `relayAllowPlainText` automatically when the URL is http://.
 */
import { execFileSync, spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

const PORT = Number(process.env.PORT ?? 8888);

function lanAddress() {
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) return a.address;
    }
  }
  return "127.0.0.1";
}

function binary() {
  for (const candidate of ["kitsune2-bootstrap-srv", "kitsune2-bootstrap-srv.exe"]) {
    try {
      execFileSync(candidate, ["--help"], { stdio: "ignore", shell: process.platform === "win32" });
      return candidate;
    } catch {
      /* try the next one */
    }
  }
  console.error(
    "kitsune2-bootstrap-srv is not on your PATH.\n\n" +
      "  cargo install kitsune2_bootstrap_srv --version 0.5.1\n\n" +
      "Match the version Holochain 0.7.0 depends on (0.5.x); a newer major is a\n" +
      "different protocol and the nodes will not find each other.",
  );
  process.exit(1);
}

const url = `http://${lanAddress()}:${PORT}`;
const bin = binary();

console.log(`
Hallmark local network
──────────────────────
  ${url}

Put that in BOTH fields — bootstrap and relay — on every device's Network tab,
then relaunch each app. Phones must be on the same wifi.

Leave this window open. Ctrl-C stops the network.
`);

const child = spawn(bin, ["--listen", `0.0.0.0:${PORT}`], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

const stop = () => {
  child.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 0));
