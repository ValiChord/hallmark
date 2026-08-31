# Building the zomes

**Status: compiles and links to wasm. Not yet run in a conductor.**

Verified 2026-09-01 with `rustc 1.98.0` / `cargo 1.98.0`, `hdi 0.8.0`, `hdk 0.7.0`.

```bash
rustup target add wasm32-unknown-unknown
cd demo/zomes
cargo check --workspace                              # type-check, fast
cargo build --release --target wasm32-unknown-unknown # produces the wasm
```

Artefacts land in `target/wasm32-unknown-unknown/release/`:

- `aviation_attestation_integrity.wasm`
- `aviation_attestation_coordinator.wasm`

## Why `.cargo/config.toml` exists

Two flags are required and neither is optional:

- **`--cfg getrandom_backend="custom"`** — hdk 0.7 registers a custom getrandom v0.3
  backend that routes randomness through the Holochain host. getrandom 0.3 only uses it
  when this cfg is set. Without it: *"the wasm32-unknown-unknown targets are not supported
  by default"*.
- **`-C link-arg=--allow-undefined`** — the `__hc__*` host functions (`dna_info`,
  `zome_info`, `trace`, …) are supplied by the conductor at instantiation. They are
  undefined at link time and must be emitted as wasm imports rather than treated as
  link errors.

## Why `holochain_serialized_bytes` is a direct dependency

The `hdk_entry_helper` and `hdk_entry_types` derive macros expand to absolute
`holochain_serialized_bytes::` paths. `hdi` depending on it is not enough — the crate
using the macros must depend on it too. Omitting it produced 63 of the original 71 errors.

## Before this can be installed

`dna.yaml` ships `initial_members: []`, and `genesis_self_check` (integrity `lib.rs`)
calls `check_installable()`, which **rejects an empty `initial_members`**.

That refusal is correct — a network with no root authorities has no trust anchor at all —
but it means the DNA cannot be installed until real root-authority `AgentPubKeyB64`
values (`uhCAk…`) are written into `dna.yaml`. Deciding who those keys belong to is the
bootstrap problem described in `profiles/aviation-back-to-birth.md`; it is a governance
question, not a build step.

## What has not been done

- Never run in a conductor. That needs the Holochain binaries (`hc`, `holochain`), which
  are not installed here. Compiling and linking is not the same as executing.
- No integration tests (Tryorama or otherwise).
- The browser demo in `demo/` is an independent TypeScript reimplementation of the same
  rules. The two agree on the trust model but nothing enforces that they stay in step.
