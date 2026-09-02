# Hallmark desktop app

A Holochain node you can install. It runs a conductor on your machine, holds
your own signing key, and applies the same validation rules as everyone else on
your network — because "the same rules" is a checkable fact here, not a promise.

Built on [kangaroo-electron](https://github.com/holochain/kangaroo-electron),
with two deliberate changes to the template (see *Departures from stock
Kangaroo*).

---

## What it is for

The browser demo at `demo/` runs the rules in JavaScript, in one tab, with no
network. It is honest about that, but it can only ever *describe* the
architecture. This can demonstrate it:

- your agent key is generated here and never leaves;
- the DNA hash is displayed, and two people can read theirs out to each other to
  confirm they are running identical rules;
- records reach other nodes by gossip, and a third party verifies them without
  contacting whoever signed them.

---

## Building it

You need `hc` 0.7.0 on your PATH — the same binary CI uses, from the
[0.7.0 release](https://github.com/holochain/holochain/releases/tag/holochain-0.7.0).
On Windows that is `hc-x86_64-pc-windows-msvc.exe`, renamed to `hc.exe`.

```bash
# 1. Compile the zomes and pack the happ (from the repo root)
cd demo/zomes
cargo build --release --target wasm32-unknown-unknown
hc dna pack . && hc app pack .

# 2. Fetch Kangaroo's Holochain and lair binaries, once
cd ../../desktop
npm install
node scripts/fetch-binaries.js

# 3. Build the UI and pack it with the happ into a .webhapp
node scripts/make-icon.mjs
npm run build:ui
npm run build:webhapp

# 4. Run it
npm run dev
```

`npm run build:win` produces an installer. macOS and Linux targets exist too.

## Installing it: the warning you will get

None of the builds are code-signed, so **Windows blocks the installer on first
run**. You will see *"Windows protected your PC"* with only a **Don't run**
button visible.

1. Click **More info** — a small link, easy to miss.
2. A **Run anyway** button appears. Click it.

This is not SmartScreen detecting anything. It is saying that nobody has paid a
certificate authority to vouch for the publisher, which is true. **Every person
you hand this to will see it**, so factor it into any demonstration rather than
being surprised by it.

Because there is no signature to check, verify the file by its hash instead. The
value is published with each release:

```powershell
Get-FileHash .\uk.valichord.hallmark-0.1.0-setup.exe -Algorithm SHA256
```

Antivirus software may object separately, with its own dialog and its own
*Allow* button.

**Making the warning go away** costs roughly £250–400 a year for an EV
code-signing certificate, and even then Windows takes time to build reputation
for a new publisher. Fine to defer while demonstrating to people in a room; not
fine if a company's IT department is ever expected to deploy it.

---

## Networks, and who the roots are

**This is the part worth understanding, because it is the whole design.**

The trust anchor — the set of agent keys entitled to accredit anyone else — is a
DNA property, and DNA properties are part of the DNA hash. So:

- the root set is **not compiled into the binary**; it lives in a plain JSON
  file you can read and edit;
- changing it puts you on a **different network**, not a more permissive version
  of this one. There is no configuration that grants you authority on someone
  else's network.

The file is written on first launch:

```
Windows  %APPDATA%\uk.valichord.hallmark\<version>\default\data\network.json
macOS    ~/Library/Application Support/uk.valichord.hallmark/…/data/network.json
Linux    ~/.config/uk.valichord.hallmark/…/data/network.json
```

### First launch

If no root is configured, the app makes **you** the root of your own network and
writes your key into `network.json`. That is the honest default: a network with
no trust anchor cannot accredit anyone, and `genesis_self_check` refuses to
install one.

### Getting two people onto one network

1. Both install the app and launch it once.
2. One of you is the root. They read their key from **This node**.
3. The other opens `network.json`, replaces `initial_members` with the root's
   key, and relaunches. The app notices the change and reinstalls — keeping the
   same agent key, so an accreditation issued to them still applies.
4. The root accredits the other's key on the **Accredit** tab.
5. Now compare DNA hashes. If they match, you are on one network and neither of
   you can be running different rules.

### Running more than one device, including Android

Two instances share a DHT only if **all four** of these match. There is no
partial credit: any difference produces a different DNA hash, and two different
DNA hashes are two networks that cannot see each other.

| Must match | Where it is set | Notes |
|---|---|---|
| The happ bytes | `demo/zomes/aviation_provenance.happ` | Same wasm, same `dna.yaml` |
| DNA properties | `network.json` | Roots **and** both vocabularies, exactly |
| Network seed | `HALLMARK_NETWORK_SEED` in `src/main/cli.ts` | Currently `hallmark-aviation-1` |
| Holochain version | `kangaroo.config.ts` | 0.7.0 |

Two traps that come from Kangaroo's defaults and are fixed here, but which will
catch you if you use a stock template elsewhere:

- Kangaroo derives the seed from the product name and version, and at `0.0.z`
  **every patch bump is a new network**. The version is `0.1.0` for that reason:
  at `0.1.z` the data directory and seed are stable across patches.
- Kangaroo appends `-dev` to the seed for unpackaged builds, so `npm run dev`
  could not see a packaged build. Hallmark states the seed explicitly instead,
  so a dev build and an installer are on the same network.

**Android is viable, on the same Holochain version.** Use Holochain's own
[android-service-runtime](https://github.com/holochain/android-service-runtime),
which pins `holochain 0.7.0` on `main` and was last updated 2026-08-27. Do *not*
use darksoil's [tauri-plugin-holochain](https://github.com/darksoil-studio/tauri-plugin-holochain)
for this: its `main` pins `holochain_types = "0.6"` and its newest branch is
`main-0.6.1`, so it cannot join a 0.7.0 network. Holochain versions are not
wire-compatible across a major DHT revision.

An Android build must be given the same seed and the same properties by hand —
it has no idea what this app's product name or version is.

### Who has to be online for records to survive

**Confirmed 2026-09-01.** `templates/conductor-config.yaml` sets
`target_arc_factor: 1` — full arc. Full arc is replication, not sharding: every
node stores a complete copy of the DHT. So **one running node is enough** to
serve everything, not all of them.

Separate the two things that get conflated here:

- **Availability.** A node that is off cannot serve records. Nothing is deleted;
  it is simply unreachable until something holding a copy comes back.
- **Durability.** Each conductor persists its store to disk. Records are lost
  only when every device holding a copy is wiped, uninstalled, or has its data
  directory deleted. All nodes being off at once loses nothing.

Full arc is a *target*, not an instant guarantee — a node only holds what it has
actually received. Let devices sync before taking one offline.

**Mobile defaults to zero arc, and that changes the answer.** From Holochain's
own blog: mobile nodes "are full DHT peers but don't contribute to the storage of
other peers' data", with the suggestion to "establish a cultural practice of
asking people to leave their computer running so their peers can still get data".
Two zero-arc phones with the desktop off means neither can read the other's
records, even though both are running.

That is a configuration choice rather than a limitation — `target_arc_factor` is
a number, and phones can be set to full arc. The reasons not to (battery,
storage, app-store rules) do not apply to a demonstration on spare handsets.

**For a three-device demonstration, run all three at full arc.** Then the
demonstration worth doing is available: sign on phone A, shut phone A *and* the
desktop down, and verify on phone B. Nobody the verifier could contact is
running, and the record still checks out.

### What this does not solve

Nothing here decides *whose* keys belong in `initial_members`. In the real
world that is the FAA, EASA, or an OEM, and none of them issue Holochain keys.
That is the bootstrap problem, it is a governance question rather than a
technical one, and no amount of software makes it go away.

---

## Departures from stock Kangaroo

Both are in `src/main/holochainManager.ts` and `src/main/networkConfig.ts`.

1. **Properties are supplied at install time** from `network.json`, rather than
   only coming from the happ bundle. This is what makes the root set a
   deployment decision instead of a build artefact.
2. **The agent key is persisted and reused.** Stock Kangaroo generates a fresh
   key on every install and skips installation entirely if an app with the same
   id exists. Both are wrong here: changing your network config would either be
   silently ignored, or would give you a new identity and throw away any
   accreditation you had been issued.

`passwordMode` is `no-password`, so a first-time viewer is not met with a
password prompt. The trade-off is that the keystore is not protected by a
passphrase — appropriate for a demonstration, not for production keys.

---

## Honest limits

- **Not code-signed.** Windows SmartScreen and macOS Gatekeeper will complain.
- **The bootstrap and relay servers are Holochain's public dev infrastructure**
  (`dev-test-bootstrap2.holochain.org`, set in `kangaroo.config.ts`). Peers use
  them to find each other. They cannot read or alter records — validation
  happens on each node — but they are infrastructure somebody else operates, and
  "no operator" is a claim about the *rules*, not about peer discovery. Point
  those URLs elsewhere if that matters to you.
- **The UI covers the core loop only** — identity, accredit, attest, verify. The
  browser demo has more surface, including revocation and counter-attestation.
- **Auto-updates are configured but not set up**; there is no release feed.
- The app has been run end to end on Windows. macOS and Linux builds are
  configured but untested.

---

## Troubleshooting: peers never find each other

**Symptom.** Two instances install fine and show the same DNA hash, but records
never reach the other node. The conductor log (Help → Open Logs) shows:

```
Failed to connect to relay server: unable to connect: tls connection failed:
invalid peer certificate: UnknownIssuer
```

**Cause, confirmed on this machine 2026-09-02.** TLS interception by local
antivirus. Reading the certificate presented for the bootstrap server gave:

```
Subject: CN=dev-test-bootstrap2.holochain.org
Issuer : CN=Norton Web/Mail Shield Root,
         OU=generated by Norton Antivirus for SSL/TLS scanning
```

Norton is decrypting HTTPS and re-signing it with its own root. Holochain's
transport (iroh/rustls) validates against a **bundled root store**, not the
Windows certificate store — so a locally-installed AV root is not trusted, and
every bootstrap and relay connection is refused. Nothing is wrong with the app,
and nothing in the config will fix it.

**Fixes, best first.**

1. Exclude the Holochain binary from the antivirus's encrypted-connection
   scanning. In Norton this is under Settings → Firewall / Web Protection →
   encrypted-connection or SSL scanning exclusions.
2. Turn off HTTPS scanning in the AV entirely.
3. Run your own bootstrap and relay over plain HTTP on a LAN, and point
   `bootstrapUrl` / `relayUrl` in `kangaroo.config.ts` at them.
4. Test on a machine without interception. Phones are unaffected by a
   PC-resident AV, so phone-to-phone works while PC-to-phone does not — which
   makes this look like a mobile bug when it is not.

**Check it in one command** (PowerShell), replacing the host if you have changed
the bootstrap URL:

```powershell
$t=New-Object Net.Sockets.TcpClient('dev-test-bootstrap2.holochain.org',443)
$s=New-Object Net.Security.SslStream($t.GetStream(),$false,{$true})
$s.AuthenticateAsClient('dev-test-bootstrap2.holochain.org')
(New-Object Security.Cryptography.X509Certificates.X509Certificate2($s.RemoteCertificate)).Issuer
```

If the issuer is a real CA, networking is fine. If it names your antivirus, it
is not.

## Running your own network (recommended for demonstrations)

**Verified working 2026-09-02**, on a machine whose TLS is intercepted by
antivirus — which is what made it necessary.

Kitsune2's `bootstrap_srv` provides bootstrap *and* relay in one process. Run it
over plain HTTP on your LAN and you depend on nobody, and there is no TLS for
antivirus software to break.

```bash
# once — match Holochain 0.7.0's dependency, which is 0.5.x
cargo install kitsune2_bootstrap_srv --version 0.5.1

npm run network
```

It prints a URL such as `http://192.168.1.89:8888`. Put that in **both** fields —
bootstrap and relay — on every device's Network tab, then relaunch each app.
Phones must be on the same wifi.

Holochain refuses a plaintext relay by default: the conductor fails to start with
`Disallowed plaintext relay URL`. The app sets `relayAllowPlainText` for you when
the relay URL begins `http://`, on the grounds that asking for a plaintext relay
is already the decision. The flag lives at
`network.advanced.irohTransport.relayAllowPlainText`.

Two desktop instances against a local server — the whole path, with the public
internet still intercepted by antivirus:

```
PASS  same DNA hash — identical rules
PASS  introduced directly — peer info swapped both ways, no bootstrap server
PASS  A accredited B
PASS  the accreditation reached B by gossip
PASS  B signed an attestation under A's accreditation
PASS  A verified B's attestation without contacting B
```

Reproduce it with `scripts/two-node-check.mjs` — see *Verifying two nodes
locally* below.

## Bootstrap and relay are two dependencies, not one

Easy to conflate, and getting it wrong sends you down the wrong fix. Measured on
2026-09-02 by reading what a node actually advertises.

- **The bootstrap server answers "who is out there?"** It hands out the addresses
  of nodes currently online. You can do without it by introducing devices
  directly — swapping peer info, which is what the Network tab does and what
  `zomes/tests/network-gossip.mjs` does in CI.
- **The relay answers "how do I reach them?"** And this one you cannot simply
  skip, because a node's advertised address *is a path on the relay*:

```json
"url": "https://dev-test-bootstrap2.holochain.org:443/af480d92…"
```

So two devices introduced directly still route through the relay. Manual
introduction removes the bootstrap dependency and **not** the relay dependency.

The practical consequence: on a machine whose TLS is intercepted (see
Troubleshooting above), manual introduction does not help. Both nodes accept the
introduction, the accreditation is authored, and nothing gossips — because
neither can open a connection through the relay.

To have no external dependency at all, run **both** services yourself. Kitsune2's
`bootstrap_srv` provides bootstrap and relay together
([holochain/kitsune2](https://github.com/holochain/kitsune2), `crates/bootstrap_srv`),
so one process on the LAN, addressed over plain HTTP, removes the interception
problem and the third-party dependency in the same move. Not yet built here.

## Verifying two nodes locally

`scripts/two-node-check.mjs` drives two running instances through their admin
interfaces: it asserts they share a DNA hash, has the root accredit the other
node, waits for that to gossip, signs an attestation on the second node, and
verifies it from the first. Same conductors the app is running, addressed
directly.

```bash
ADMIN_PORT=9600 npm run dev
ADMIN_PORT=9601 npx electron out/main/index.js --profile bob
node scripts/two-node-check.mjs
```

The gossip steps need working networking, so on an intercepted machine it stops
after the accreditation. CI's `network` job covers the same ground on clean
networking.
