# Hallmark improvements (zomes + TypeScript simulator)

Applied after independent review of Holochain 0.7 / HDI 0.8 idioms and the parallel browser engine.

## Integrity zome (`zomes/crates/integrity`)
- ConflictingAssertions requires distinct evidence hashes (mirrors DuplicateDocument).
- Clarifying comment on TTL calculation.

## Coordinator zome (`zomes/crates/coordinator`)
- Revocation checks walk the full membership delegation chain (leaf + ancestors).
- Collected revocations sorted by action timestamp before classification.
- Prefer any revocation dated before the attestation; retain latest after-assertion for the report.
- Scope report includes not_observed entries.

## TypeScript simulator (`src/lib/raf`)
- Same ancestor revocation walk + timestamp sort in `verify.ts`.
- Distinct evidence-hash guard for ConflictingAssertions in `validate.ts`.
- Scope report includes `notObserved`.

## Intentionally unchanged
- `initial_members: []` + genesis_self_check remains an install-time requirement.
- Self-reported action timestamps are an inherent Holochain constraint.
- Auth scaffolding left as platform default (unused by the local workbench).

The zomes remain the on-chain source of truth. The TS engine is a faithful in-browser mirror for the workbench demo.
