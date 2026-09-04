# Sweettest harness — written, not yet runnable here

**Status: excluded from the workspace.** It does not compile on the development
machine, for reasons that have nothing to do with this code. Attempted
4 September 2026.

## Why it exists

The Node tests in `../../tests/` drive a conductor over its admin interface, which
is the right tool for the client wire contract. There are three things they
structurally cannot do.

**1. Tell validation apart from a coordinator guard.** `conductor-smoke.mjs`
reports `PASS non-root membership issuance rejected`. That refusal comes from
`coordinator/src/lib.rs`:

```rust
if !props.is_root(&me) { return Err(guest("only a root authority may issue")); }
```

not from `validate_membership`. A zome call cannot distinguish them — both are an
error on the call. **The difference is the whole claim this project makes about a
modified client:** a coordinator guard is advice to a well-behaved client;
integrity validation is the rule every node on the network enforces.
`conductor.get_invalid_integrated_ops()` shows which one actually refused.

**2. Simulate that modified client.** `conductor.update_coordinators()` hot-swaps
a coordinator zome without reinstalling. Swap in one with the guards stripped,
call it, and assert the op lands in `get_invalid_integrated_ops`. That is the
only way to actually test the record-authority duplication argument in
`integrity/src/lib.rs`, which is the sharpest claim in the codebase and currently
has no test at all.

**3. Test key rotation.** It is implemented and has never had an automated test.
`conductor.get_agent_source_chain()` inspects a chain directly, which is what the
handoff → acceptance → `complete_key_rotation` → old proof revoked sequence
needs. The regression to pin is that attestations under the old key report
`RevocationCheck::Rotated`, **not** `RevokedAfterAssertion` — `verify.rs` carries
a comment saying that bug once made an OEM rotating its key permanently untrust
every shop beneath it.

## What stops it building here

Verified, not guessed:

| Dependency | Needs | Present? |
|---|---|---|
| `aws-lc-sys 0.45.0` | NASM | **No** |
| `openssl-sys 0.9.117` | A Windows perl (Strawberry) to build OpenSSL from source | **No** — only Git Bash's MSYS perl, which lacks `Locale::Maketext::Simple` |
| both | MSVC C compiler | Yes — VS 18 Community, MSVC 14.50 |

So the C toolchain is fine. Two small pieces of tooling are missing, and the
`perl` on PATH is the wrong one rather than absent.

This is the "Windows without Nix" gap. The reference corpus this test was written
from assumes Nix/holonix on Linux throughout, where both dependencies build
without ceremony.

## Three ways forward

1. **Install NASM and Strawberry Perl** on the development machine. Smallest
   change; both are ordinary installers. Strawberry Perl must come *before* Git
   Bash's perl on PATH or `openssl-sys` will pick the wrong one again.
2. **Run it in CI only**, on `ubuntu-latest`, where both build without help. Add
   `crates/sweettests` back to the workspace and give it its own job. Costs a
   long compile on every push unless cached, and cannot be verified locally
   first.
3. **Run it under WSL.**

Until one of those happens, this directory is excluded from the workspace so it
cannot break `cargo check --workspace`, and `validation_not_the_guard.rs` is a
draft that has never been executed. **Do not treat it as passing.**

## What was verified before the build failed

The API surface was checked against the `holochain 0.7.0` source rather than
assumed. Present: `SweetAgents::one`, `SweetDnaFile::from_bundle_with_overrides`,
`setup_app_for_agent`, `call_fallible`, `get_invalid_integrated_ops`,
`update_coordinators`, `get_agent_source_chain`. The constructor is
`SweetConductor::create_with_defaults(SweetConductorConfig::standard(), None, None)`
— copied from Holochain's own `conductor/tests.rs`, not invented.
