# Engineer handover

For someone picking this up cold. Read [`../README.md`](../README.md) first for what the project
is and why; this document is about working on it.

---

## Get it running in five minutes

```bash
cd demo
npm install
npm run dev
```

Open the address it prints. Click **Load sample**, then **Inspect, then overhaul**, then
**Conflicting inspection**, and watch the Verify tab. You are looking for a report reading
**Not currently trusted** beside **Historically valid**. That is the whole product in one screen.

The rules are running in the browser. The Rust they mirror is readable in-app under **Zome source**.

---

## Repository map

| Path | What it is |
|---|---|
| `README.md` | What the project is, what works today, and what does not. Start here |
| `docs/WHY.md` | Why aviation, the design constraints that follow, and what would kill the project |
| `SPEC.md` | The attestation format as a specification, independent of this implementation |
| `profiles/aviation-back-to-birth.md` | The domain profile being built. Start here for domain context |
| `profiles/bunker-sample-seal.md` | A second profile, better researched but not being built |
| `docs/TECHNICAL-REFERENCE.md` | What the system enforces and where. **Read before changing validation** |
| `docs/HANDOVER.md` | This file |
| `docs/RESEARCH-ARCHIVE.md` | The market research that chose aviation. Historical, unmaintained |
| `docs/CODE-REVIEW-ARCHIVE.md` | Reviews of earlier drafts. Historical; explains why the design is shaped this way |
| `demo/` | The RAF Workbench. **`demo/README.md` explains what each screen does and how it maps to the zome** |
| `demo/src/lib/raf/` | The TypeScript engine: `types`, `validate`, `verify`, `engine` |
| `demo/zomes/` | The Holochain zome (Rust), `integrity` and `coordinator` crates |
| `demo/zomes/tests/` | The end-to-end conductor smoke test |
| `docs/superseded-drafts/` | Earlier contributed drafts. Historical |
| `.github/workflows/ci.yml` | Everything above, run on every push |

---

## Building the zome

```bash
rustup target add wasm32-unknown-unknown
cd demo/zomes
cargo check --workspace
cargo build --release --target wasm32-unknown-unknown
```

Full detail, including why the build is configured the way it is, in
[`../demo/zomes/BUILD.md`](../demo/zomes/BUILD.md).

### Three things that will waste your afternoon if you don't know them

1. **`.cargo/config.toml` is load-bearing.** It sets `--cfg getrandom_backend="custom"` and
   `-C link-arg=--allow-undefined`. Without the first, the wasm build fails outright; without the
   second, the `__hc__*` host functions come out as link errors instead of wasm imports.
2. **`holochain_serialized_bytes` must be a direct dependency** of any crate using the entry derive
   macros. They expand to absolute paths into it. `hdi` depending on it is not enough. Omitting it
   produced 63 of the 71 errors this codebase originally had.
3. **The DNA manifests use `manifest_version: "0"` and `path:`**, not `"1"` and `bundled:`, and
   wasm paths resolve relative to the manifest's own directory.

---

## Running it in a real conductor

Binaries for every platform, Windows included, are published in the
[holochain 0.7.0 release](https://github.com/holochain/holochain/releases/tag/holochain-0.7.0).
Nix is not required.

```bash
cd demo/zomes
hc dna pack .
hc app pack .
hc sandbox --piped -H /path/to/holochain -f 9000 create --in-process-lair
hc sandbox --piped -H /path/to/holochain -f 9000 run

cd ..
npm install --no-save @holochain/client
node zomes/tests/conductor-smoke.mjs
```

`--in-process-lair` avoids needing the separate `lair-keystore` binary.

The smoke test covers accreditation, refusal of a non-root, attestation, third-party verification,
and revocation. It is the best documentation of how to drive the zome from a client — read it
before writing any UI against the conductor.

---

## Tests, and which ones are yours

| Command | What it runs |
|---|---|
| `npm test` | The RAF engine, the conformance check against the zome, and app-data/gate-identity units |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `node zomes/tests/conductor-smoke.mjs` | End to end against a running conductor |
| `cargo clippy --workspace -- -D warnings` | From `demo/zomes` |
| `npm run test:platform` | **Not yours.** See below |

`scripts/` came with the Grok workspace template this demo was built in. Those tests check that
platform's behaviour — share-card metadata, PWA manifest, `SKILL.md` files — and read template
files under `.grok/` that do not exist here, so several fail regardless of anything in this repo.
They are kept because `vite.config.ts` still uses the plugins they cover. CI does not run them.

**If you are stripping the Grok scaffolding**, the plugins wired into `vite.config.ts` are
`grok-pwa-plugin.mjs`, `app-env-plugin.mjs` and `migration-plan.mjs`. The auth, PGlite and
migration machinery is also inherited and unused by the RAF demo.

---

## Gotchas discovered the hard way

- **This project shipped checks nobody had run.** `npm ci` had never worked (lockfile out of sync),
  `npm run lint` was failing, `npm run typecheck` was failing, and the `scripts/` tests never
  executed on Windows because that glob does not expand there. **Run the checks before trusting
  them.**
- **Node cannot resolve the engine's extensionless imports** the way Vite does.
  `demo/scripts/ts-ext-hooks.mjs` teaches the test runner the same rule. Without it you cannot
  test `src/lib/raf` directly.
- **`with-app-env.mjs` needs `shell: true` on Windows.** `vite` is an extensionless shim Node
  cannot resolve, and since Node 20 it refuses `vite.cmd` directly.
- **Record timestamps in the browser engine are monotonic on purpose.** `Date.now()` has
  millisecond resolution, two records in the same tick shared a stamp, and the predecessor check
  requires strictly earlier. The chain demo failed on fast machines.
- **Git on this repo intermittently fails with "Permission denied" writing loose objects** —
  almost certainly antivirus. Staging in small batches works where a single `git add -A` does not.

---

## Before you change validation

Read [`TECHNICAL-REFERENCE.md`](TECHNICAL-REFERENCE.md) §2 first. The two rules that have already
been broken more than once:

1. **Validation must be deterministic.** No `get`, no `get_links`. Only `must_get_valid_record` by
   explicit hash. Links can be added later, so any rule that enumerates them can never be
   deterministic, and peers will disagree.
2. **Revocation is verification-time, never validation-time.** Validation runs once. Anything
   discovered afterwards belongs to the reader, not to the rules that admitted the record.

Also: if you touch either implementation's behaviour, `conformance.test.ts` or the smoke test will
fail. That is the point. Update both sides deliberately rather than making the test agree.

---

## Where the real work is

Not in the code.

1. **Find out whether Recommendation #9 has an owner.** The coalition's September 2025 progress
   report is email-gated. If someone has picked it up, the opening is closed.
2. **Get a lawyer's view on the anchoring pattern** — peer-validated record plus a qualified
   timestamp. If that is not admissible evidence, the approach needs rethinking.
3. **Name two parties.** One repair shop and one buyer. If you cannot name them, the N=2 test has
   already failed.
4. **Decide who holds root keys.** The code proves roots can be set per deployment. It cannot tell
   you whose keys belong there.

The demonstration exists so those conversations have something to point at. It is not a substitute
for having them.

### Nearest technical next steps

- Get the demo running on a phone.
- Build the assertion vocabulary with airworthiness practitioners; the current list is illustrative.
- Exercise key rotation end to end.
- Two conductors on **separate machines**. Two on one machine already run in CI
  (`zomes/tests/network-gossip.mjs`); what is untested is a real network between hosts, partition
  behaviour, and adversarial peers.
