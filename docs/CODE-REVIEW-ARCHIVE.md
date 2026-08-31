# Code review archive

**Historical record.** Three reviews of contributed drafts, in order, from 28 August to
1 September 2026. They are preserved because the defects they found shaped the design that
survived — particularly the separation of validation from verification, and the decision that
revocation withdraws current trust without disturbing historical validity.

Everything blocking in these reviews has been fixed. Read them for the reasoning, not for a
list of outstanding work; for that, see [`HANDOVER.md`](HANDOVER.md).

## Contents

1. **Holochain zome draft** (28 Aug) — six defects, two fatal. Established that validation cannot
   do DHT lookups, and that ejection cannot happen at validation time.
2. **DeepSeek / Gemini / Grok build** (1 Sep) — never compiled; a retroactive kill chain from
   attacker-chosen revocation timestamps. Also the first appearance of the delegation model that
   survives in the current zome.
3. **RAF Workbench demo** (1 Sep) — the first review conducted by actually running the thing.
   Three defects, one of which broke the headline demonstration.



---

<!-- archived from reviews/2026-08-28-holochain-draft-review.md -->

## Review: Holochain zome draft (external AI contribution)

Reviewed 2026-08-28. Files reviewed: `aviation_holochain_zome.rs`, `holochain_architecture.md`,
`constraint_mapping.md`.

**Verdict: do not build on as-is. Structure is good, six defects, the first two are fatal.**
Written to be handed straight back to whoever produced it.

### 1. FATAL - the trust anchor is a string literal

`ROOT_AUTHORITIES` is a list of `&str` ("FAA", "EASA", ...). `validate_membership_creation` checks
whether `proof.accreditation.issuing_authority` equals one of those strings.

**Anyone can type "FAA" into their own membership proof and pass.** The FAA signs nothing, holds no
key, and is not a party. The entire trust-list problem - the reason this project exists - is answered
by an unauthenticated text field.

**Fix direction:** a root authority must be a public key that has actually signed something, or the
accreditation must be independently checkable against a published regulator source. If neither is
possible, say so explicitly - that is a real finding about the problem, not a coding gap.

### 2. FATAL - validation performs DHT lookups

`check_historical_membership` calls `get()` and `get_links()`, and is invoked from inside `validate`.

Holochain validation **must be deterministic**: every peer, at any time, must reach the same verdict.
`get_links` can never be deterministic - links may be added after the fact. This is precisely what
`must_get_entry` / `must_get_valid_record` / `must_get_action` exist for.

As written, different validators will disagree.

### 3. FATAL (conceptual) - ejection cannot work at validation time

Validation happens **once, at publish**. An ejection recorded later cannot retroactively invalidate
attestations that already validated.

**Ejection is a verification-time judgement made by the reader, not a validation-time rule.** The
draft conflates the two. Same distinction that caused trouble in ValiChord over warrants: network
integrity events are not application-layer tools.

This is a design change, not a patch.

### 4. Backdating defeats the membership check

Membership is checked against `attestation.time`, a field the attester supplies. Eject a bad actor
and they simply assert an earlier timestamp.

Use the action's own timestamp, or require the qualified timestamp anchor, or both.

### 5. Two checks are theatre

- `validation_threshold_met` is a **boolean the ejector sets on their own record**. Validation checks
  it is `true`. Anyone can set it.
- `check_predecessor_exists` returns `Ok(true)` unconditionally - so predecessor-chain verification,
  the one thing ATA Spec 2000 Ch.16 actually hands us, does nothing.

### 6. The countersigning claim is backwards

`holochain_architecture.md` states countersigning works offline and delivers N=2, and
`constraint_mapping.md` marks N=2 "SOLVED".

**Holochain countersigning requires all parties online simultaneously, and is feature-gated as
unstable.** The code does not use it - it writes a separate linked entry and says so in a comment.
So the N=2 property is neither implemented nor currently available.

Either design N=2 without countersigning, or state the constraint honestly.

### 7. One conceptual claim to delete outright

`holochain_architecture.md`: *"No owner = no competition issue."*

**Our own research says the opposite.** TradeLens ran on a decentralised ledger and it made no
difference, because governance is a legal artefact, not a data structure. A group of competitors
collectively refusing to deal remains exactly that, whatever the architecture.

See README.md, competition-law section. Do not let this claim into the repo.

### Also

- Will not compile: a `String` cannot be a link base (needs an `AnyLinkableHash` / anchor);
  `#[hdk_entry_defs]` / `#[unit_enum]` are superseded in current HDK.
- `validate_membership_creation` returns `Err(wasm_error!(...))` for a validation failure. An error
  means "could not validate", not "invalid" - use `ValidateCallbackResult::Invalid`.
- `constraint_mapping.md` marks eight constraints "SOLVED" that are not. Overconfident status marking
  is its own risk - it hides what still needs doing.

### Worth keeping

- The entry shapes, and `Attestation` carrying all five spec parts.
- The closed assertion vocabulary, and `not_observed` as a first-class field.
- Immutability with counter-attestation instead of edits - correct, and correctly reasoned.
- The honest admissibility caveat. It is right, and it still blocks.


---

<!-- archived from reviews/2026-09-01-deepseek-gemini-grok-review.md -->

## Review: DeepSeek / Gemini / Grok collaboration build

Reviewed 2026-09-01. Files: integrity zome, two coordinator variants, workspace manifests,
`dna.yaml`, `happ.yaml`, build script.

**Verdict: real structural progress, but it has never been compiled, and one defect chain can
retroactively invalidate the whole network. Park it and build the demo.**

Reviewed by reading — no Rust toolchain on this machine, so nothing below was verified by building.
Every compile error cited has a line reference so CI can confirm it.

---

### First, the direction

Friday's conclusion was *"we only need a small demo to show people how it would work."*

What arrived is a production trust network: delegation chains with depth limits, expiry inheritance,
key rotation, two ejection grounds with evidence verification, link-base validation, and a
membership-chain walk. That is substantially more machinery than a demo needs, and **every defect
below lives in machinery the demo does not use.**

This is not a criticism of doing the work — the delegation model is a genuine advance (see below).
It is an observation about where effort is landing. The README's own test: *if the effort is 80%
engineering, it matches the profile of every corpse in `research/`.*

---

### It has not been compiled

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

### FATAL — the retroactive kill chain

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

### FATAL — coordinator and integrity disagree on link bases

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

### BLOCKER — the app cannot install as configured

`genesis_self_check` (integrity 19–23) rejects empty `initial_members`. `dna.yaml` contains **no
`properties:` block at all** — no `initial_members`, no `max_delegation_depth`, no
`assertion_vocabulary`.

So genesis fails, or properties deserialisation fails, on first install. Nothing runs. Add the
properties block before anything else, or the demo cannot start.

---

### Lesser findings

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

### What is genuinely good, and worth keeping

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

### Recommendation

**Do not fix this file.** Park it as a design reference and build the demo separately.

Every fatal defect above lives in delegation, ejection, or chain-walking — none of which a
demonstration needs. The demo needs: issue an attestation, show the scope including what was *not*
observed, verify as a stranger, tamper with one field, watch it fail.

Two things to carry forward from this build:

1. **The delegation model** — genuinely better than v3's flat roots. Keep the design, not the code.
2. **Get a compiler in the loop.** Three models reviewing each other produced code with a type error
   that has survived three revisions. `cargo check` would have caught it in seconds.


---

<!-- archived from reviews/2026-09-01-grok-demo-review.md -->

## Review: RAF Workbench demo (Grok)

Reviewed 2026-09-01. **Actually run**, not just read: dev server started, sample network loaded,
both scripted scenarios executed, verification panel exercised.

**Verdict: this is the right thing, and it mostly works. Three defects, one of which breaks the
headline demo. Fix those three and it is showable.**

---

### It runs, and the core moment lands

The strongest thing in the demo is the verification panel after a revocation:

> **Not currently trusted** · **Historically valid**
> Revocation: *RevokedAfterAssertion — Conflicting INSPECTED*

Two separate facts, shown side by side: the attestation *was* valid when it was made, and the
attester's accreditation has *since* been revoked for issuing contradictory statements. That is
precisely the model the spec argues for, made visible without a word of explanation. A non-technical
viewer can read those two badges and understand the distinction immediately.

**Keep this. It is the demo.**

---

### What is genuinely better than every previous draft

- **`historically_valid` vs `currently_trusted`** — present in *both* the TypeScript and the Rust.
  This is the fix for the retroactive-invalidation problem, and it is now structural rather than
  patched.
- **Revocation targets a membership, not an agent** (`types.rs:163`, with the comment *"an agent may
  have later proofs"*). Revoking one accreditation no longer nukes an agent's whole history.
- **No self-asserted `decided_at` field exists.** Revocation time comes from the record's own action
  timestamp (`verify.rs:77`). The backdating hole from the DeepSeek build is gone **by construction**,
  not by a check.
- **The word is now "revoke", not "eject".** This is not cosmetic. Revocation is an accreditor
  withdrawing its own accreditation; ejection is competitors collectively refusing to deal. The
  competition-law exposure flagged in `README.md` is materially smaller under the revocation framing.
- **Cycle detection** in the membership chain walk (`verify.ts`, `seen` set) — absent from all
  earlier drafts.
- **Counter-attestations are explicitly informational** and never flip `currently_trusted`. The UI
  says so on screen. Correct: a disagreement is evidence, not a verdict.
- **The integrity zome does no DHT lookups**, with crate-level docs stating that `get_links` is
  coordinator-only. The determinism problem is understood, not just avoided by accident.
- **`PartialEq` is derived throughout** — the compile errors that survived three earlier revisions
  are gone.

The Rust and the TypeScript agree with each other on the trust model. That is the thing I expected to
be wrong and it is not.

---

### DEFECT 1 — the headline demo fails (blocking)

Clicking **"Inspect, then overhaul"** produces:

> `predecessor must be earlier than this attestation`

**Cause:** `engine.ts:120,167,236` stamp records with `Date.now()`. The scripted scenario creates both
attestations inside the same millisecond, and validation requires the predecessor be *strictly*
earlier. On a fast machine the second create is always rejected.

**Consequence:** the flow that demonstrates the Chapter 16 chain — the whole back-to-birth story —
does not run. Only the conflict scenario works.

**Fix:** monotonic timestamps. Keep a counter and ensure each new record's timestamp is at least
`previous + 1`, or compare with `>` rather than `>=` on equal stamps and order by sequence instead.
This is a demo-engine issue, not a protocol issue — the Rust uses real action timestamps.

---

### DEFECT 2 — the load-bearing field is missing from the UI

`SPEC.md` §2 says scope is the load-bearing field, and that recording what was **not** observed is the
one thing a format can do about the "inadvertently certified" failure.

**The Attest form hardcodes `notObserved: []`** (`workbench.tsx:523`). A user can pick exactly one
observed assertion and nothing else. The scripted samples set `notObserved`, and the verify panel
displays it — but nobody driving the demo can produce it.

So the spec's central idea is visible only if you happen to click a scripted button, and cannot be
demonstrated by hand.

**Fix:** add a multi-select for "not observed" to the Attest form. This is the single highest-value
change in the whole demo, because it is the part of the argument nothing else can show.

---

### DEFECT 3 — `npm run dev` cannot start on Windows

`scripts/with-app-env.mjs:112` calls `spawn(command, args, …)` **without `shell: true`**. On Windows,
Node cannot resolve `vite` (the extensionless shim) — and with Node 20+ it also refuses `vite.cmd`
without a shell (`EINVAL`, the CVE-2024-27980 mitigation).

`HOW_TO_RUN.md` tells a Windows user to run `npm run dev`. It will fail with
`[with-app-env] failed to run vite: spawn vite ENOENT`.

I confirmed this and got the app running only by invoking `node node_modules/vite/bin/vite.js` directly.

**Fix:** pass `shell: process.platform === "win32"` to that `spawn`, or resolve the `.cmd` shim
explicitly. Ceri is on Windows — as shipped, he cannot run his own demo.

---

### Smaller things

- **Disclosure is too quiet.** The only statement that this is a simulation is *"In-memory twin of the
  zome"* in small text on the Ledger tab, plus `HOW_TO_RUN.md`, which a viewer never sees. For the
  stated purpose — *demonstrably real to a non-technical person* — the honest framing should be
  prominent and confident, near the title: **"The rules are running in your browser. The same rules in
  Rust are one click away."** The `/source` viewer already makes that credible. Burying it converts a
  strength into something that looks like a concealment when a technical viewer finds it.
- **No tamper moment.** `documentDigest` is auto-generated from the document ID
  (`workbench.tsx:518`), so nothing can be edited and broken. The most legible demonstration for a
  non-technical audience is still *change one character, watch it refuse*. Worth adding.
- **Duplicate entries in the Verify dropdown** render with identical labels (`AFX-2026-0142 · 577737`
  twice), so they cannot be told apart. Add a short hash or timestamp suffix.
- **Large irrelevant dependency surface.** `better-auth`, `pglite`, `pg`, `kysely`, SQL migrations,
  PWA plugins, brand-check scripts — none of it serves an attestation demo, and all of it adds install
  risk and reading noise. If this becomes the demo you hand people, strip it to Vite + React + the
  `raf/` library.
- **Still unverified: does the Rust compile?** No toolchain on this machine. The hazards that broke
  earlier drafts are absent, but that is not the same as building. Get `cargo check` into CI.

---

### Recommendation

**Adopt this as the demo.** It is the first artefact in this project that a stranger could look at and
understand, and the revocation panel makes the central argument on its own.

In order:

1. Fix the timestamp collision — the chain demo is the story, and it currently does not run.
2. Add `not_observed` to the Attest form — it is the spec's central claim.
3. Fix the Windows spawn — you cannot demo what you cannot start.
4. Move the "this is a simulation, here is the Rust" statement to the top, and say it confidently.
5. Add a tamper control.

The bootstrap problem is unchanged: `initialMembers` are still DNA roots, and someone still has to
verify FAA certificates out of band. That is honest and it is stated. It remains the real open
question, and no demo will answer it.
