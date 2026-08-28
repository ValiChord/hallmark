# Review: Holochain zome draft (external AI contribution)

Reviewed 2026-08-28. Files reviewed: `aviation_holochain_zome.rs`, `holochain_architecture.md`,
`constraint_mapping.md`.

**Verdict: do not build on as-is. Structure is good, six defects, the first two are fatal.**
Written to be handed straight back to whoever produced it.

## 1. FATAL - the trust anchor is a string literal

`ROOT_AUTHORITIES` is a list of `&str` ("FAA", "EASA", ...). `validate_membership_creation` checks
whether `proof.accreditation.issuing_authority` equals one of those strings.

**Anyone can type "FAA" into their own membership proof and pass.** The FAA signs nothing, holds no
key, and is not a party. The entire trust-list problem - the reason this project exists - is answered
by an unauthenticated text field.

**Fix direction:** a root authority must be a public key that has actually signed something, or the
accreditation must be independently checkable against a published regulator source. If neither is
possible, say so explicitly - that is a real finding about the problem, not a coding gap.

## 2. FATAL - validation performs DHT lookups

`check_historical_membership` calls `get()` and `get_links()`, and is invoked from inside `validate`.

Holochain validation **must be deterministic**: every peer, at any time, must reach the same verdict.
`get_links` can never be deterministic - links may be added after the fact. This is precisely what
`must_get_entry` / `must_get_valid_record` / `must_get_action` exist for.

As written, different validators will disagree.

## 3. FATAL (conceptual) - ejection cannot work at validation time

Validation happens **once, at publish**. An ejection recorded later cannot retroactively invalidate
attestations that already validated.

**Ejection is a verification-time judgement made by the reader, not a validation-time rule.** The
draft conflates the two. Same distinction that caused trouble in ValiChord over warrants: network
integrity events are not application-layer tools.

This is a design change, not a patch.

## 4. Backdating defeats the membership check

Membership is checked against `attestation.time`, a field the attester supplies. Eject a bad actor
and they simply assert an earlier timestamp.

Use the action's own timestamp, or require the qualified timestamp anchor, or both.

## 5. Two checks are theatre

- `validation_threshold_met` is a **boolean the ejector sets on their own record**. Validation checks
  it is `true`. Anyone can set it.
- `check_predecessor_exists` returns `Ok(true)` unconditionally - so predecessor-chain verification,
  the one thing ATA Spec 2000 Ch.16 actually hands us, does nothing.

## 6. The countersigning claim is backwards

`holochain_architecture.md` states countersigning works offline and delivers N=2, and
`constraint_mapping.md` marks N=2 "SOLVED".

**Holochain countersigning requires all parties online simultaneously, and is feature-gated as
unstable.** The code does not use it - it writes a separate linked entry and says so in a comment.
So the N=2 property is neither implemented nor currently available.

Either design N=2 without countersigning, or state the constraint honestly.

## 7. One conceptual claim to delete outright

`holochain_architecture.md`: *"No owner = no competition issue."*

**Our own research says the opposite.** TradeLens ran on a decentralised ledger and it made no
difference, because governance is a legal artefact, not a data structure. A group of competitors
collectively refusing to deal remains exactly that, whatever the architecture.

See README.md, competition-law section. Do not let this claim into the repo.

## Also

- Will not compile: a `String` cannot be a link base (needs an `AnyLinkableHash` / anchor);
  `#[hdk_entry_defs]` / `#[unit_enum]` are superseded in current HDK.
- `validate_membership_creation` returns `Err(wasm_error!(...))` for a validation failure. An error
  means "could not validate", not "invalid" - use `ValidateCallbackResult::Invalid`.
- `constraint_mapping.md` marks eight constraints "SOLVED" that are not. Overconfident status marking
  is its own risk - it hides what still needs doing.

## Worth keeping

- The entry shapes, and `Attestation` carrying all five spec parts.
- The closed assertion vocabulary, and `not_observed` as a first-class field.
- Immutability with counter-attestation instead of edits - correct, and correctly reasoned.
- The honest admissibility caveat. It is right, and it still blocks.
