# Improvements applied (post-review)

Based on independent review of Holochain 0.7 / HDI 0.8 idioms:

## Integrity (`validate.rs`)
- ConflictingAssertions now requires distinct evidence hashes (mirrors DuplicateDocument).
- Clarifying comment on TTL calculation (self-reported timestamps remain an inherent Holochain limit).

## Coordinator (`verify.rs`)
- Revocation checks now walk the full membership delegation chain (leaf + ancestors), not only the direct MembershipProof. This closes the gap where a revoked intermediate capability left downstream attestations reporting Clean.
- All collected revocations are sorted by action timestamp before classification, so `get_links` DHT order no longer affects the report.
- Prefer any revocation dated *before* the attestation (sets historically_valid = false) over later ones; the latest after-assertion revocation is retained for the report when no earlier one exists.
- Scope report now includes `not_observed` entries (integrity already validated them; the report is now complete).

## Intentionally unchanged
- `initial_members: []` in dna.yaml + genesis_self_check rejection remains a deliberate install-time requirement (documented in the YAML).
- Self-reported action timestamps are a Holochain model constraint; no trusted external clock is available inside integrity validation.
- Link immutability (DeleteLink → Invalid) kept.
- Entry-type checks via `require_app_entry` kept; polyglot risk is low given distinct structs.

