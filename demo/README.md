# The RAF Workbench

The demonstration. It runs the attestation rules in a browser so anyone can see them work without
a Holochain conductor, a Rust toolchain, or an explanation.

```bash
npm install
npm run dev
```

For the problem this solves, read [`../README.md`](../README.md). For the rules themselves,
[`../docs/TECHNICAL-REFERENCE.md`](../docs/TECHNICAL-REFERENCE.md).

---

## What a viewer sees, and what is actually happening

The page explains itself in plain language. This section is the other half — what each screen is
doing underneath.

### Acting as

You are switching between agent identities, not user accounts. Every record is authored by whoever
you are acting as, and validation checks that the author matches the claimed attester. Switching
here is the equivalent of sitting at a different company's terminal.

The sample network is a two-level delegation chain:

```
FAA / EASA  (DNA roots — in initial_members)
     └── Boeing        OemAuthorized      issued by a root, depth 1
            └── AeroFix   EasaPart145     issued by Boeing,  depth 2
Northline (airline)  — deliberately has no accreditation
```

Northline having none is not an oversight. Airlines receive parts; they do not certify them. They
can file a counter-attestation, which needs no accreditation at all.

### Issue

Creates a `MembershipProof`. An accreditation, with an expiry, granted by a root or along the
delegation matrix. `depth` increments and is capped by `max_delegation_depth`.

Note what you cannot do: issue to yourself, issue as a non-root without your own accreditation, or
grant an accreditation type your own does not permit. Try it — the rejection appears in the Ledger.

### Attest

Creates an `Attestation`. The form's fields map one-to-one onto the entry:

| Field | What it is |
|---|---|
| Part type, part number, serial | The `Subject` — the physical thing |
| Document type, document id, digest | The `Binding` — which certificate this is about |
| Assertion + value | One entry in `scope.observed` |
| **Not observed** | `scope.not_observed` — the load-bearing field |
| Predecessor | The Chapter 16 chain link |

**`not_observed` is the point of the whole format.** The failures this targets are not forgeries;
they are assertions made wider than what the signer actually saw. Recording what was *not* checked
means absence can never be read as assent.

The document digest is editable so the tamper case is reachable: two attestations sharing a
document id but differing in digest is the `DuplicateDocument` revocation ground.

### Revoke

Creates a `MembershipRevocation` — a **new record**, never an edit. Entries are immutable
throughout.

Grounds must be backed by evidence the verifier can fetch and check. Pick `ConflictingAssertions`
and supply two attestations that do not actually conflict, and the revocation is refused. That
refusal is the competition-law property doing its job: the rule fires on published, objective,
independently checkable grounds, or it does not fire.

### Verify

The payoff. Runs the same checks a stranger would run years later, and reports two answers
separately:

- **`historicallyValid`** — was this a real, properly authorised record when it was signed?
- **`currentlyTrusted`** — should you rely on it now?

A revocation dated after the attestation leaves the first true and makes the second false. A
release certificate written while a shop was accredited stays a real document; a later revocation
taints new reliance, not the history. **Collapsing these into one boolean is the mistake two
earlier drafts made.**

Counter-attestations are shown but never change the verdict. A disagreement is evidence for a
reader to weigh, not a ruling.

### Ledger

Every accepted record, and every rejected attempt. Rejections never enter the shared space — that
is what validation is for — but showing them makes the rules visible.

---

## How this relates to the real zome

`src/lib/raf/` is a **TypeScript reimplementation** of the rules in `zomes/`. It exists so the demo
runs anywhere, instantly, with no conductor.

| Browser | Zome |
|---|---|
| `types.ts` | `integrity/src/types.rs` |
| `validate.ts` | `integrity/src/validate.rs` — publish-time, deterministic |
| `verify.ts` | `coordinator/src/verify.rs` — read-time, may query |
| `engine.ts` | The conductor and DHT: an in-memory record store with links |
| `store.ts` | Zustand state, so the "DHT" survives a tab switch |

**Two implementations drift.** `src/lib/raf/conformance.test.ts` pins the verdicts the real zome
produces and asserts this engine matches; the zome side of the same contract is asserted in
`zomes/tests/conductor-smoke.mjs`. Change either implementation's behaviour and one of the two
fails. That is deliberate — update both sides consciously rather than making the test agree.

### What the browser cannot show

- **Gossip, partitions, and eventual consistency.** `engine.ts` is a synchronous in-memory store,
  so every record is instantly visible to everyone. In a real DHT a reader who has not yet received
  a revocation reports a clean result. The model handles this — that is precisely why revocation is
  a read-time judgement — but the demo cannot dramatise it.
- **Real cryptography.** Signatures are asserted, not computed. Holochain does the actual signing.
- **Genesis.** The zome refuses to install with no root authorities. The browser just starts empty.

For the real thing, `zomes/BUILD.md` walks through building the wasm, packing the hApp, running a
conductor and executing the end-to-end test.

---

## Layout notes

`workbench.tsx` is one file on purpose — the demo is meant to be readable in a sitting.

Below the `lg` breakpoint the sidebar becomes `display: contents` so its sections can be ordered
around `<main>` rather than all preceding it. The agent list becomes a horizontal scrolling strip.
Without this the working area started 1058px down the page on a phone.

---

## Inherited scaffolding

This was built inside a Grok workspace template, and some of it came along: `scripts/` (PWA and
brand-check plugins wired into `vite.config.ts`), `server/`, `migrations/`, and the auth and PGlite
machinery in `src/lib/`. None of it is used by the RAF demo.

`npm run test:platform` runs that template's own tests. Several fail here because they read
`.grok/` files that do not exist outside the workspace. CI does not run them. See
[`HOW_TO_RUN.md`](HOW_TO_RUN.md).
