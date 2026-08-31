# Hallmark

**A portable attestation format for aircraft part release certificates, and a joining rule for
deciding whose signature counts.**

A hallmark is a mark struck into an object that binds it to a claim about what it is, applied by
an independent office, and readable by a stranger centuries later with nobody left alive to ask.
That is the shape of the problem here.

This is a specification and a demonstration. There is no platform, no operator, and no server that
has to stay alive for a record to remain checkable.

```bash
cd demo && npm install && npm run dev
```

Load the sample network, run **Inspect, then overhaul**, then **Conflicting inspection**, and
watch the Verify tab. What you are looking for is a report reading **Not currently trusted** beside
**Historically valid** — the attestation was good when it was signed, and the accreditation behind
it has since been withdrawn. Two separate facts, which is the entire argument.

---

## The gap

Digital signatures are solved. Aviation has had legally valid electronic release certificates
since **2009**, and the first electronic 8130-3 was issued in **October 2025** — a Boeing 737
battery to Southwest, sixteen years after the standard became usable.

What is not solved is the question one layer up:

> **Who decides whose signature counts — when every organisation qualified to decide competes with
> the others, and the answer must be checkable by a stranger, offline, years later?**

### The industry has written the gap down twice

**Once as a request.** The Aviation Supply Chain Integrity Coalition — Airbus, Boeing, GE
Aerospace, Safran, Delta, United, American, and others — issued thirteen unanimous recommendations
after the AOG Technics forged-parts scandal. **Recommendation #9: "Establish Voluntary Industry
Database of Back-to-Birth Parts Documentation."** Marked long term. **Owned by nobody**, verified
1 September 2026. None of them can hold it, because each competes with the others whose parts
would flow through it.

> *Checkable:* the coalition's own recommendation listing names no owner for #9; its 25 September
> 2025 progress report covers only the five short-term recommendations and is silent on #9; and the
> coalition has published nothing at all in 2026. The report is email-gated — **getting it and
> confirming this is the single highest-value check anyone can run on this project.**

**Once as a refusal.** ATA Spec 2000 Chapter 16 already defines the electronic release certificate
and, importantly, already chains: each new certificate references the previous one for that part
and carries it along with its signature intact. But the specification states that it does not
cover the internal processes companies use **to authorise the users or signers of that data** —
reasonably, since those are company-specific.

> *Checkable:* ATA Spec 2000, *Authorized Release Certificate*, Chapter 16, Revision 2019.1,
> §16-2 1.2 "Scope". Listed at $0.00 on the A4A publications site, though obtaining it is not
> frictionless. The chaining rule is in §16-2 2.1.

Read those together. The standard defines how a signed certificate travels and how it chains. It
declines to say **who is entitled to sign one**. That is the trust list problem, named by the
standard as a deliberate scope exclusion, and asked for by the industry as an unowned
recommendation.

### Forgery is not the problem

This determines what to build, so it belongs near the top.

Across the documented disputes in this domain and in the adjacent marine one, the failures are not
forged signatures. They are **omission, entitlement, inconsistency, and contractual fiat** — most
sharply, assertions made wider than what the signer actually observed. A real officer signing a
real document with a real signature, certifying something they did not witness, defeats every
signature check ever built.

So the format's job is not to prove a signature genuine. It is to make the claim **narrow,
explicit, and scoped** — including recording what the signer did *not* observe, so absence is
never read as assent.

---

## What this is, and is not

**Is:** a data format, verification rules, and a membership rule expressed as code that anyone can
run and any stranger can audit.

**Is not:** a platform, a registry, a database, a company you route data through, or a network you
must join before you get value.

### Non-goals

- **We do not perform the inspection.** A format can scope, bind and timestamp a claim. It cannot
  make the claim true. Records are not inspections, and any pitch implying otherwise should be
  treated as suspect — including ours.
- **We do not reconstruct history.** Nothing here helps parts already in service with missing
  paperwork. It helps parts entering service from now on. That is real, it is probably why nobody
  has funded it, and it should be said in the first paragraph of any pitch rather than discovered
  by a sceptic in the second meeting.
- **We do not replace the regulator.** Where a regulator runs the register, work upstream and feed
  it.

---

## Design constraints

Not preferences. Each is a cause of death observed in a real project — see
[`docs/RESEARCH-ARCHIVE.md`](docs/RESEARCH-ARCHIVE.md).

1. **Value at N=2.** Two parties with no third present must get something on day one. Contour died
   processing 60–70 transactions a month.
2. **A format and a rulebook, never a platform.** If one board meeting can shut it down, it will be.
3. **The owner cannot be a participant.** TradeLens ran on a decentralised ledger and it made no
   difference, because the *governance* was owned. Neutrality is a legal form, not a data structure.
4. **Onboarding in an afternoon, without permission.** If it needs a consultant, the ceiling is a
   few dozen participants.
5. **Sealable by a qualified trust service.** Peer validation for correctness; a qualified
   timestamp for legal weight. The record does not need to *be* qualified — it needs to be sealable
   by something that is.
6. **The ejection rule must be objective, published in advance, and checkable by anyone.**
7. **Not W3C Verifiable Credentials.** The EU wallet's recognised formats are IETF SD-JWT VC and
   ISO/IEC 18013-5 mdoc; the W3C data model "remains on the roadmap".
8. **Extend what exists.** Chapter 16 already chains. Do not invent a parallel vocabulary.

### The competition-law constraint

The mechanism that makes this work is that rule-breakers are provably revoked and others stop
relying on them. Read from a competition lawyer's chair: **a group of competitors operating a
shared list of parties they collectively refuse to deal with is a concerted refusal to deal.**

The precedent that makes it survivable is the certificate-authority ecosystem. Browsers do
distrust and effectively kill non-compliant certificate authorities, and that is accepted, because
the grounds are **objective, published in advance, and verifiable by anyone** — *you broke a
stated technical rule*, not *we don't like you commercially*.

Every evidence-bearing revocation ground in the implementation is checkable by any peer from the
records alone, with no discretionary override. Two of them exist specifically to stop the rule
firing on legitimate behaviour. See
[`docs/TECHNICAL-REFERENCE.md`](docs/TECHNICAL-REFERENCE.md) §5.3.

**This is a necessary condition, not a sufficient one.** The legal form and the rule design both
need a competition lawyer.

---

## What would kill this

- **Recommendation #9 acquires an owner.** As of 1 September 2026 it has none, and the coalition
  has published nothing in 2026 at all. If an OEM funds a registry and hands it over, the opening
  closes. *Note the ambiguity honestly: an unowned recommendation in a coalition that has gone
  quiet may mean nobody wants it, rather than that it is available.*
- **A regulator names a system of record.** EASA's blockchain study concluded in September 2024
  that regulators would need to issue guidelines first — they looked and stepped back. That could
  change.
- **An incumbent absorbs it.** The closest predecessor in the adjacent marine domain was selling
  to shipowners in 2020 and was a component inside a testing lab's own product by late 2021. It
  filed micro-entity accounts every year of its life, including the years it ran trials with
  blue-chip names, and went to creditors' liquidation. **Blue-chip trials are not revenue.**
- **The clock.** SWIFT 1973, the barcode 1974, PEPPOL around 2008. Ten to twenty years to critical
  mass is the base rate. If this must work in five, the evidence says it will not.

---

## Repository map

| Path | What it is |
|---|---|
| `SPEC.md` | The attestation format as a specification, independent of any implementation |
| `profiles/aviation-back-to-birth.md` | The domain profile being built |
| `profiles/bunker-sample-seal.md` | A second profile — better researched, not being built |
| `docs/TECHNICAL-REFERENCE.md` | What the system enforces and where |
| `docs/HANDOVER.md` | For an engineer picking this up |
| `docs/RESEARCH-ARCHIVE.md` | The research that chose aviation. Historical, unmaintained |
| `docs/CODE-REVIEW-ARCHIVE.md` | Reviews of earlier drafts. Historical |
| `demo/` | The RAF Workbench — the rules running in a browser. Has its own README |
| `demo/zomes/` | The Holochain zome, with `BUILD.md` |
| `docs/superseded-drafts/` | Earlier contributed drafts. Historical, do not build on them |
| `LICENCE.md` | All rights reserved |

---

## Status

**A working demonstration; an undecided venture.**

### What exists and is checked on every push

- A browser demo anyone can run in two commands.
- A Holochain zome that compiles, packs, installs into a conductor, and passes an end-to-end test:
  accreditation, refusal of a non-root, attestation, third-party verification, and revocation that
  withdraws current trust while preserving historical validity.
- A conformance test holding the TypeScript engine and the Rust zome to the same verdicts.
- CI running all of it, including the conductor test against real Holochain binaries.

### Settled

- **The domain is aviation parts.** Marine bunker fuel was the alternative and is not being built;
  the reasoning is in the archive and the profile is kept.
- **Revocation, not ejection.** An accreditor withdrawing its own accreditation, not competitors
  collectively refusing to deal.
- **The trust anchor is set per deployment**, in the install call, not compiled into the build.

### Open

- **The name.** "Hallmark" and "Release Attestation Format" are both working titles.
- **The licence.** ALL RIGHTS RESERVED. A specification needs a licence that permits independent
  implementation; this needs deciding before anything is published externally.
- **The legal form.** Foundation or co-operative, before it matters. You cannot be both a
  participant and the registrar.
- **Who holds root keys.** The code proves roots can be configured per deployment. It cannot tell
  you whose keys belong there. This is the bootstrap problem, and it is a governance question.

### What still decides whether any of this matters

Code was never the hard part, and having some does not change these.

1. Get the coalition's September 2025 progress report and find out whether #9 has an owner.
2. Get a lawyer's view on the anchoring pattern. If a peer-validated record plus a qualified
   timestamp is not admissible, the approach needs rethinking.
3. **Name two parties.** One repair shop and one buyer. If you cannot name them, the N=2 test has
   already failed.

The demonstration exists so those conversations have something to point at. It is not a substitute
for having them. If the effort on this project is 80% engineering, it matches the profile of every
corpse in the archive.
