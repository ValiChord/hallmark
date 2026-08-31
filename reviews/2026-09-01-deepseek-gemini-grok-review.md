# Review: DeepSeek / Gemini / Grok collaboration build

Reviewed 2026-09-01. Files: integrity zome, two coordinator variants, workspace manifests,
`dna.yaml`, `happ.yaml`, build script.

**Verdict: real structural progress, but it has never been compiled, and one defect chain can
retroactively invalidate the whole network. Park it and build the demo.**

Reviewed by reading — no Rust toolchain on this machine, so nothing below was verified by building.
Every compile error cited has a line reference so CI can confirm it.

---

## First, the direction

Friday's conclusion was *"we only need a small demo to show people how it would work."*

What arrived is a production trust network: delegation chains with depth limits, expiry inheritance,
key rotation, two ejection grounds with evidence verification, link-base validation, and a
membership-chain walk. That is substantially more machinery than a demo needs, and **every defect
below lives in machinery the demo does not use.**

This is not a criticism of doing the work — the delegation model is a genuine advance (see below).
It is an observation about where effort is landing. The README's own test: *if the effort is 80%
engineering, it matches the profile of every corpse in `research/`.*

---

## It has not been compiled

Four independent proofs. This matters more than any single bug, because it tells you what to trust
about the whole artefact.

1. **Integrity zome, lines 429–441.** The `match` arms return `Ok(())` while the fallback arm returns
   `Ok(ValidateCallbackResult::Invalid(...))`. Different types in the same `match`. This exact error
   has survived from v2 through v3 to here — three revisions, never built.
2. **Integrity zome, line 500** — `as1.value != as2.value`. `AssertionValue` (line 98) derives only
   `Serialize, Deserialize, Debug, Clone`. **No `PartialEq`.**
3. **Coordinator `d508b2`, line 502** — `counter.agreement == AgreementStatus::Disagree`.
   `AgreementStatus` (integrity line 181) also has no `PartialEq`.
4. **Integrity line 232** uses `op.flattened::<EntryTypes, LinkTypes>()`; v3 used the three-parameter
   form. The versions disagree with each other, which only happens when nothing is checking.

**Recommendation: get `cargo check` running before another round of review.** Three AIs reviewing
each other's Rust cannot substitute for a compiler, and the loop will keep producing plausible code
with type errors in it.

---

## FATAL — the retroactive kill chain

Four separate weaknesses combine into one serious failure. Each is defensible alone.

**Step 1 — `decided_at` is attacker-chosen, into the past.** `validate_ejection_creation`
(integrity 452) rejects `decided_at` in the *future* only. Any past timestamp validates — 1970 included.

**Step 2 — verification takes the EARLIEST ejection.** `get_agent_ejection_time` keeps the minimum
`decided_at` across all ejection records. So the most-backdated ejection wins.

**Step 3 — this silently defeats the fix in `d508b2`.** That file correctly decided post-attestation
ejections should only warn, not invalidate (lines 457–472). But since the ejector picks `decided_at`
freely, they simply choose a date before every attestation they want destroyed. **The ejector decides
whether to nuke history.**

**Step 4 — the chain walk propagates it.** `membership_chain_has_ejection` walks issuer to issuer up
to the root. Eject an *issuer* and every attestation by every member beneath them becomes
`InvalidProof`. Eject a genesis member and that is potentially the entire network.

**And the trigger can be legitimate behaviour.** `DuplicateCertIssuance` ejects the **issuer** when two
membership proofs share issuer, cert number and authority but differ in agent, with overlapping
validity. That is what happens when a repair station has two authorised signers under one certificate,
or renews before expiry. The escape hatch — `check_key_rotation_exists` — **is a stub that always
returns `false`** (integrity 664–671). So the escape never fires.

Full chain: *a repair station legitimately accredits a second engineer → any peer publishes a valid
ejection against the issuing OEM → backdated to 1970 → every attestation in that OEM's subtree reads
as untrusted, permanently, with no reinstatement path.*

This is the v3 finding — "the ejection rule fires on legitimate behaviour" — narrowed but not fixed,
and now amplified by the chain walk.

---

## FATAL — coordinator and integrity disagree on link bases

The coordinator creates serial links from a **Path entry hash**:

- `d508b2` lines 40–48: `path::Path::from(serial).typed(...)`, `.ensure()`, then
  `create_link(serial_path.path_entry_hash()?, ...)`

The integrity zome validates the base as a **hash of the raw string**:

- integrity line 766: `hash_entry(&attestation.subject.serial_number)`

**These are different hashes.** Every `SerialToAttestation` and `DocumentToAttestation` link will fail
validation. Attestations can be written but never found by serial number — which is the primary lookup
path a verifier needs.

Pick one scheme and use it in both crates. The `hash_entry` form is simpler and makes the integrity
check trivial; the Path form gives you scalable anchors later.

---

## BLOCKER — the app cannot install as configured

`genesis_self_check` (integrity 19–23) rejects empty `initial_members`. `dna.yaml` contains **no
`properties:` block at all** — no `initial_members`, no `max_delegation_depth`, no
`assertion_vocabulary`.

So genesis fails, or properties deserialisation fails, on first install. Nothing runs. Add the
properties block before anything else, or the demo cannot start.

---

## Lesser findings

- **`eject_member` (coordinator `d508b2` 161) has no authorisation check whatsoever.** Validation is
  evidence-gated, which limits the damage — you cannot fabricate the evidence — but there is still no
  requirement that the ejector be a member in good standing, and no cost to publishing.
- **Fail-open on `Pending`.** `verify_attestation` (410–412) treats "membership chain not yet gossiped"
  as fine and leaves `overall_trusted = true`. Absence of evidence is being read as evidence of
  absence. It should surface as `Unknown`, not silently pass.
- **Ejection is still permanent** — no expiry, no reinstatement, no counter-evidence path.
- **Two divergent coordinator files** (`2a90db`, `d508b2`). `d508b2` is the better one. Delete the other
  before they get merged by accident.
- **Integrity 639–663** contains the generating model's unresolved reasoning left in as comments,
  ending *"Let's fix this properly:"* followed by the stub. Unfinished work presented as finished —
  worth grepping for that pattern across everything these tools produce.
- **`Timestamp::from_micros(sys_time()?.as_micros() as i64)`** (coordinator 87, 136) — `sys_time()`
  already returns a `Timestamp`.
- **`PathComponent` links accept everything** (integrity 794) — anyone can write arbitrary path links.

---

## What is genuinely good, and worth keeping

**The delegation chain is a real conceptual advance.** v3 had one flat root authority certifying
everyone — which reintroduced the operator the whole project exists to avoid. This version has roots
certifying, and accredited parties delegating downward with depth limits, expiry inheritance (a child
proof cannot outlive its parent, integrity 393–407), and a whitelist of which accreditation types may
grant which others (`allowed_new_accreditation`, 807).

**That mirrors how aviation authority actually delegates** — an OEM authorises its distributors. It
does not remove the bootstrap operator, but it makes the operator's role *smaller and one-off* rather
than ongoing. That is a meaningful narrowing of the hardest problem in this project, and it came out
of this weekend's work.

Also keep: link-base validation in the integrity zome (right idea, wrong hash); the decision that
post-attestation ejection warns rather than invalidates; and `not_observed` now being vocabulary-checked
(integrity 289–296), which closes a real hole.

---

## Recommendation

**Do not fix this file.** Park it as a design reference and build the demo separately.

Every fatal defect above lives in delegation, ejection, or chain-walking — none of which a
demonstration needs. The demo needs: issue an attestation, show the scope including what was *not*
observed, verify as a stranger, tamper with one field, watch it fail.

Two things to carry forward from this build:

1. **The delegation model** — genuinely better than v3's flat roots. Keep the design, not the code.
2. **Get a compiler in the loop.** Three models reviewing each other produced code with a type error
   that has survived three revisions. `cargo check` would have caught it in seconds.
