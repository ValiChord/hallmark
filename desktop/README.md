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

`npm run build:win` produces an installer. macOS and Linux targets exist too;
none of them are code-signed, so expect an OS warning on first run.

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
