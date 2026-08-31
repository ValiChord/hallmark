# Review: RAF Workbench demo (Grok)

Reviewed 2026-09-01. **Actually run**, not just read: dev server started, sample network loaded,
both scripted scenarios executed, verification panel exercised.

**Verdict: this is the right thing, and it mostly works. Three defects, one of which breaks the
headline demo. Fix those three and it is showable.**

---

## It runs, and the core moment lands

The strongest thing in the demo is the verification panel after a revocation:

> **Not currently trusted** · **Historically valid**
> Revocation: *RevokedAfterAssertion — Conflicting INSPECTED*

Two separate facts, shown side by side: the attestation *was* valid when it was made, and the
attester's accreditation has *since* been revoked for issuing contradictory statements. That is
precisely the model the spec argues for, made visible without a word of explanation. A non-technical
viewer can read those two badges and understand the distinction immediately.

**Keep this. It is the demo.**

---

## What is genuinely better than every previous draft

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

## DEFECT 1 — the headline demo fails (blocking)

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

## DEFECT 2 — the load-bearing field is missing from the UI

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

## DEFECT 3 — `npm run dev` cannot start on Windows

`scripts/with-app-env.mjs:112` calls `spawn(command, args, …)` **without `shell: true`**. On Windows,
Node cannot resolve `vite` (the extensionless shim) — and with Node 20+ it also refuses `vite.cmd`
without a shell (`EINVAL`, the CVE-2024-27980 mitigation).

`HOW_TO_RUN.md` tells a Windows user to run `npm run dev`. It will fail with
`[with-app-env] failed to run vite: spawn vite ENOENT`.

I confirmed this and got the app running only by invoking `node node_modules/vite/bin/vite.js` directly.

**Fix:** pass `shell: process.platform === "win32"` to that `spawn`, or resolve the `.cmd` shim
explicitly. Ceri is on Windows — as shipped, he cannot run his own demo.

---

## Smaller things

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

## Recommendation

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
