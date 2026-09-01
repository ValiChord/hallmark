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

The document digest is editable so the tamper case is reachable. Note what the rule actually keys
on, though: `DuplicateDocument` fires on two attestations by the same signer sharing a
`document_type` and `document_id`. **The digest is not examined** — two attestations with identical
digests trigger it just as well, and a corrected form correctly linked to the one it supersedes is
excluded.

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

---

## Putting it somewhere people can reach it

A demo that only runs on your laptop stops existing the moment the meeting ends. Two options,
both of which are **publishing decisions rather than technical ones** — the repository is
currently private and all rights reserved.

### A hosted URL

This app renders on the server — there is no `index.html` in the build output — so it needs a
Node process, not a static host. The deploy target is set by `SERVER_PRESET`, defaulting to
Vercel:

```bash
npm run build                              # Vercel preset -> .vercel/output
SERVER_PRESET=node-server npm run build    # plain Node   -> .output
```

The Node build has been verified to run and serve:

```bash
SERVER_PRESET=node-server npm run build
PORT=8099 node .output/server/index.mjs
```

Nothing in the demo is sensitive — invented companies, invented part numbers, no keys, no personal
data. Publishing it is still a decision, but a small one.

#### Render

The path of least resistance if you already have an account. Create a **Web Service** from the
repository with:

| Setting | Value |
|---|---|
| Root directory | `demo` |
| Build command | `npm ci && SERVER_PRESET=node-server npm run build` |
| Start command | `node .output/server/index.mjs` |

Render sets `PORT` and the server honours it. HTTPS and a URL come free.

⚠️ **The free tier sleeps after inactivity**, so the first visit after a quiet spell takes the best
part of a minute. That is fine while you are testing and bad the day you send the link to someone
who matters — they will assume it is broken. Either keep it warm or pay for the always-on tier
before that email goes out.

#### Oracle Cloud (an always-free VM)

Free forever and never sleeps, which is exactly the weakness of Render's free tier. The cost is
that you are running a server rather than pushing a build.

Roughly: provision an Ampere A1 instance, install Node, build, run
`node .output/server/index.mjs` under systemd, and put Caddy or nginx in front for TLS.

Two traps specific to Oracle, both of which have cost people entire evenings:

1. **Opening the port takes two steps, not one.** The VCN security list *and* the instance's own
   iptables rules. Oracle's images ship with local firewall rules that block everything, so the
   security list alone leaves you staring at a timeout.
2. **Ampere capacity is frequently unavailable** in a given region — "out of host capacity" is a
   common experience on the free tier.

#### Which to use

**Render first.** It is minutes rather than an afternoon, and you already know it. If the cold
start turns out to matter, that is the moment to either pay for always-on or move to Oracle — and
by then you will know whether anyone actually clicks the link.

Standing up infrastructure before you know that is the same 80%-engineering mistake this project is
supposed to be avoiding.

### A public CI badge

The README carries a CI badge. It renders as a live pass/fail link **only if the repository is
public**, and a green badge covering a conductor test against real Holochain binaries is unusually
good evidence that something is not a mockup.

Making the repository public is a larger decision than deploying the demo: it also publishes the
research archive, which names individuals at specific companies, and the licence question is still
open. Consider publishing the demo alone before considering the repository.
