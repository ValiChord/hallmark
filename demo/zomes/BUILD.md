# Building and running the zomes

**Status: compiles to wasm, packs into a hApp, installs into a real Holochain conductor,
and passes an end-to-end smoke test.**

Verified 2026-09-01 on Windows with `rustc`/`cargo` 1.98.0, `hdi` 0.8.0, `hdk` 0.7.0,
`holochain` 0.7.0 and `hc` 0.7.0.

## Build

```bash
rustup target add wasm32-unknown-unknown
cd demo/zomes
cargo check --workspace                               # type-check, fast
cargo build --release --target wasm32-unknown-unknown # produces the wasm
```

Artefacts land in `target/wasm32-unknown-unknown/release/`.

### Why `.cargo/config.toml` exists

Two flags are required and neither is optional:

- **`--cfg getrandom_backend="custom"`** — hdk 0.7 registers a custom getrandom v0.3 backend
  that routes randomness through the Holochain host. getrandom 0.3 only uses it when this cfg
  is set. Without it: *"the wasm32-unknown-unknown targets are not supported by default"*.
- **`-C link-arg=--allow-undefined`** — the `__hc__*` host functions (`dna_info`, `zome_info`,
  `trace`, …) are supplied by the conductor at instantiation. They are undefined at link time
  and must be emitted as wasm imports rather than treated as link errors.

### Why `holochain_serialized_bytes` is a direct dependency

The `hdk_entry_helper` and `hdk_entry_types` derive macros expand to absolute
`holochain_serialized_bytes::` paths. `hdi` depending on it is not enough — the crate using the
macros must depend on it too. Omitting it produced 63 of the original 71 errors.

## Pack

```bash
hc dna pack .
hc app pack .
```

Produces `aviation_provenance.dna` and `aviation_provenance.happ` (both gitignored).

Manifest notes, all of which were wrong as originally written:

- `manifest_version` is **`"0"`**, not `"1"`.
- Zome and DNA references use **`path:`**, not `bundled:`.
- The wasm paths are relative to the manifest's own directory, so `target/…`, not `../target/…`.

## Run a conductor

Get `hc`, `holochain` and (optionally) `lair-keystore` for your platform from the
[holochain 0.7.0 release](https://github.com/holochain/holochain/releases/tag/holochain-0.7.0).
Windows `x86_64-pc-windows-msvc` binaries are published there.

```bash
hc sandbox --piped -H /path/to/holochain -f 9000 create --in-process-lair
hc sandbox --piped -H /path/to/holochain -f 9000 run
```

`--in-process-lair` avoids needing the separate `lair-keystore` binary.

## Smoke test

```bash
npm install --no-save @holochain/client   # from demo/
node zomes/tests/conductor-smoke.mjs
```

Expected output:

```
  PASS  admin connected on 9000
  PASS  generated root uhCAk… and MRO uhCAk…
  PASS  installed + enabled app for the root authority
  PASS  installed + enabled app for the repair station
  PASS  app interface on …
  PASS  both app clients connected
  PASS  signing credentials authorized for root
  PASS  signing credentials authorized for repair station
  PASS  root issued a membership proof to the repair station
  PASS  non-root membership issuance rejected
  PASS  repair station signed an attestation
        membership=Active revocation=Clean historically_valid=true currently_trusted=true
  PASS  a third party verified the attestation
```

### What that actually proves

- The compiled zome loads and executes in a real conductor.
- **The trust anchor is set at install time, not compiled in.** `initial_members` is supplied
  through `roles_settings.modifiers.properties` in the install call, so the same wasm can be
  installed under different root authorities. This is what makes the bootstrap a deployment
  decision rather than a code change.
- Validation enforces it: a root authority can accredit, and **a non-root attempting the same
  call is rejected**.
- An accredited agent's attestation verifies for a third party who was not present when it was
  signed, reporting `historically_valid` and `currently_trusted` separately.

### What it does not prove

- Single conductor, two agents. Nothing here exercises gossip between separate nodes, network
  partitions, or DHT convergence.
- No revocation path is exercised yet. The browser demo covers it; the zome test does not.
- The browser demo in `demo/` is an independent TypeScript reimplementation of the same rules.
  The two agree on the trust model, but nothing enforces that they stay in step.

## Installing outside the smoke test

`dna.yaml` ships `initial_members: []`, and `genesis_self_check` rejects an empty
`initial_members`. That refusal is correct — a network with no root authorities has no trust
anchor at all — so a plain `hc sandbox generate <happ>` will fail at genesis.

Supply real root keys either by editing `dna.yaml` before packing, or by overriding
`properties` at install time as the smoke test does. Deciding whose keys those are is the
bootstrap problem described in `profiles/aviation-back-to-birth.md`. It is a governance
question, not a build step.
