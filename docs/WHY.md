# Why this, and why now

The [README](../README.md) says what Hallmark is. This says why it might matter,
and what would make it not matter.

Everything here is argument, not demonstration. Keep the two apart.

---

## Two kinds of claim in this repository

They carry different weight, and one of them you can check yourself in five
minutes.

**What the demonstration proves.** The rules run, and you can watch them refuse
things. An approval chain is walked back to a root. A term from the wrong side
of the form is rejected. A revocation withdraws current trust without touching
history. A third party verifies a record without contacting whoever signed it —
across two independent nodes, in CI, on every push. None of that depends on
agreeing with anything below.

**What the project proposes.** That the industry has a gap here, that it is the
gap described next, and that a portable format with an explicit joining rule is
a reasonable answer to it. That is a proposition supported by published sources,
not a demonstrated fact. The right response to it is for someone who works in
the industry to say whether it matches what they see.

If the second turns out to be wrong, the first is still true. It just would not
matter.

---

## The gap

Digital signatures are solved. Aviation has had legally valid electronic release
certificates since **2009**, and the first electronic 8130-3 was issued in
**October 2025** — a Boeing 737 battery to Southwest, sixteen years after the
standard became usable.

What is not solved is the question one layer up:

> **Who decides whose signature counts — when every organisation qualified to
> decide competes with the others, and the answer must be checkable by a
> stranger, offline, years later?**

### The industry has written the gap down twice

**Once as a request.** The Aviation Supply Chain Integrity Coalition — Airbus,
Boeing, GE Aerospace, Safran, Delta, United, American, and others — issued
thirteen unanimous recommendations after the AOG Technics forged-parts scandal.
**Recommendation #9: "Establish Voluntary Industry Database of Back-to-Birth
Parts Documentation."** Marked long term. **Owned by nobody**, verified
1 September 2026. None of them can hold it, because each competes with the others
whose parts would flow through it.

> *Checkable, and re-confirmed 2 September 2026 against the coalition's own
> [recommended-actions page](https://aviationsupplychainintegrity.com/recommended-actions/documents-traceability-verification/):*
> #9 is listed under *Long Term* with **no owner and no responsible organisation
> named**. The page describes it as requiring significant coordination across the
> industry, and assigns that coordination to nobody. Its scope is a voluntary
> database of digitised authorised release certificates, aiming at back-to-birth
> traceability for all parts — including non-serialised standard parts.
>
> The 25 September 2025 progress report covers only the five short-term
> recommendations and is silent on #9, and the coalition has published nothing at
> all in 2026. That report is email-gated — **getting it is still the single
> highest-value check anyone can run on this project**, but the "no owner" claim
> no longer depends on it.

### The coalition asked for infrastructure three times and assigned it nobody

Read 2 September 2026 across both recommendation categories. This is the
strongest single piece of evidence the project has, and it is checkable in a
browser in five minutes.

| | Recommendation | Term | Owner named |
|---|---|---|---|
| #4 | Establish Database of Accredited Vendors to Verify Identities and Quality Standards | Long | none |
| #8 | Software, "potentially hosted through a third party", to query OEM, carrier and production-approval-holder databases and validate each ARC field | Medium | none |
| #9 | Establish Voluntary Industry Database of Back-to-Birth Parts Documentation | Long | none |

**#4 is the recommendation this project answers**, and an earlier draft of these
documents pointed at #9 instead. #9 is an archive of certificates; #4 is a
register of who is entitled — which is the trust list, named by the industry.

**Two absences, confirmed across all thirteen:**

1. **No recommendation says who is entitled to sign a release certificate.** The
   coalition's own account of the fraud, under #5, notes the counterfeits carried
   "fairly accurate depictions of an authorized signature" — so they identified
   the problem, and answered it with better document-verification tooling. That
   checks whether a signature is well-formed, never whether the signer held
   approval.
2. **No recommendation says how a vendor is de-accredited** — no grounds, no
   deciding authority, no process. This is the harder half and it is missing
   entirely.

The second absence is worth sitting with. Removal is where the competition-law
exposure lives (see below), so a coalition of competitors specifying it would be
writing down the mechanics of a collective boycott. **That they left it blank is
consistent with the constraint being real — but note this is inference. The
coalition does not say why.**

**Why a register alone would not close the gap.** #4 as described is a
current-status lookup: accreditation certificates, recent audits, contact
details. It cannot answer *was this vendor accredited on the date they signed
this certificate?* — a question about the past. A current-status list has one
answer where the situation has two, which is the same collapse §10.1 of the spec
calls the most important thing to get right.

### Legislators have looked at it and not filled the gap

The US **Aviation Supply Chain Safety and Security Digitization Act** passed the
House of Representatives in **March 2026**. Its stated motivation is the rise in
counterfeit and improperly documented aerospace parts, and the fact that
non-digitised FAA documentation is easy to forge.

What it actually does is narrower: it directs the Government Accountability
Office to **study the barriers** to adopting digital documentation across the
aerospace supply chain, including barriers to voluntary digitalisation. It
mandates no database, names no system of record, and funds no infrastructure. As
of 2 September 2026 it has not passed the Senate.

Read this two ways, and both matter:

- **It corroborates the gap.** An independent body, with subpoena-grade research
  powers, agrees the documentation layer is the weak point.
- **It is an early warning.** A GAO study is how a mandate begins. If its findings
  lead to a named federal system of record, that is the second kill condition
  below, arriving on a legislative timetable rather than a regulatory one. Worth
  watching for the GAO report.

> *Checkable:* Rep. Hillary Scholten's office,
> [House passage announcement](https://scholten.house.gov/media/press-releases/house-passes-rep-scholtens-bipartisan-bill-modernize-aviation-supply-chain).
> The related House bill text is H.R. 6267 on govinfo.gov — **the bill number and
> the press release have not been cross-checked against each other, so confirm
> the number before citing it to anyone.**

**Once as a refusal.** ATA Spec 2000 Chapter 16 already defines the electronic
release certificate and, importantly, already chains: each new certificate
references the previous one for that part and carries it along with its signature
intact. But the specification states that it does not cover the internal
processes companies use **to authorise the users or signers of that data** —
reasonably, since those are company-specific.

> *Checkable:* ATA Spec 2000, *Authorized Release Certificate*, Chapter 16,
> Revision 2019.1, §16-2 1.2 "Scope". Listed at $0.00 on the A4A publications
> site, though obtaining it is not frictionless. The chaining rule is in
> §16-2 2.1.

Read those together. The standard defines how a signed certificate travels and
how it chains. It declines to say **who is entitled to sign one**. That is the
trust list problem: named by the standard as a deliberate scope exclusion, and
asked for by the industry as an unowned recommendation.

### Forgery is not the problem

This determines what to build, so it belongs near the top.

Across the documented disputes in this domain and in the adjacent marine one, the
failures are not forged signatures. They are **omission, entitlement,
inconsistency, and contractual fiat** — most sharply, assertions made wider than
what the signer actually observed. A real officer signing a real document with a
real signature, certifying something they did not witness, defeats every
signature check ever built.

So the format's job is not to prove a signature genuine. It is to make the claim
**narrow, explicit, and scoped** — including recording what the signer did *not*
observe, so absence is never read as assent.

---

## Design constraints

Not preferences. Each is a cause of death observed in a real project — see
[`RESEARCH-ARCHIVE.md`](RESEARCH-ARCHIVE.md).

1. **Value at N=2.** Two parties with no third present must get something on day
   one. Contour died processing 60–70 transactions a month.
2. **A format and a rulebook, never a platform.** If one board meeting can shut
   it down, it will be.
3. **The owner cannot be a participant.** TradeLens ran on a decentralised ledger
   and it made no difference, because the *governance* was owned. Neutrality is a
   legal form, not a data structure.
4. **Onboarding in an afternoon, without permission.** If it needs a consultant,
   the ceiling is a few dozen participants.
5. **Sealable by a qualified trust service.** Peer validation for correctness; a
   qualified timestamp for legal weight. The record does not need to *be*
   qualified — it needs to be sealable by something that is.
6. **The ejection rule must be objective, published in advance, and checkable by
   anyone.**
7. **Not W3C Verifiable Credentials.** The EU wallet's recognised formats are
   IETF SD-JWT VC and ISO/IEC 18013-5 mdoc; the W3C data model "remains on the
   roadmap".
8. **Extend what exists.** Chapter 16 already chains. Do not invent a parallel
   vocabulary.

### The competition-law constraint

The mechanism that makes this work is that rule-breakers are provably revoked and
others stop relying on them. Read from a competition lawyer's chair: **a group of
competitors operating a shared list of parties they collectively refuse to deal
with is a concerted refusal to deal.**

The precedent that makes it survivable is the certificate-authority ecosystem.
Browsers do distrust and effectively kill non-compliant certificate authorities,
and that is accepted, because the grounds are **objective, published in advance,
and verifiable by anyone** — *you broke a stated technical rule*, not *we don't
like you commercially*.

Every evidence-bearing revocation ground in the implementation is checkable by
any peer from the records alone, with no discretionary override. Two of them
exist specifically to stop the rule firing on legitimate behaviour. See
[`TECHNICAL-REFERENCE.md`](TECHNICAL-REFERENCE.md) §5.3.

**This is a necessary condition, not a sufficient one.** The legal form and the
rule design both need a competition lawyer.

---

## What would kill this

- **Recommendations #4 and #9 acquire an owner.** As of 2 September 2026 neither
  has one, and the coalition has published nothing in 2026 at all. If an OEM
  funds a registry and hands it over, the opening narrows.

  **Narrows, not closes — this was overstated in an earlier draft.** A funded
  registry still has to decide whose signatures it accepts, and still has to
  decide how a vendor gets removed and on what grounds. The coalition asked for
  neither, so an owner would inherit both problems unsolved. What changes is the
  position: supplier to that registry rather than the standard everyone adopts.
  A worse business, not a dead one.

  *Note the ambiguity honestly: an unowned recommendation in a coalition that
  has gone quiet may mean nobody wants it, rather than that it is available.*
- **A regulator names a system of record.** EASA's blockchain study concluded in
  September 2024 that regulators would need to issue guidelines first — they
  looked and stepped back. That could change.
- **An incumbent absorbs it.** The closest predecessor in the adjacent marine
  domain was selling to shipowners in 2020 and was a component inside a testing
  lab's own product by late 2021. It filed micro-entity accounts every year of
  its life, including the years it ran trials with blue-chip names, and went to
  creditors' liquidation. **Blue-chip trials are not revenue.**
- **The clock.** SWIFT 1973, the barcode 1974, PEPPOL around 2008. Ten to twenty
  years to critical mass is the base rate. If this must work in five, the
  evidence says it will not.

---

## Settled

- **The domain is aviation parts.** Marine bunker fuel was the alternative and is
  not being built; the reasoning is in the archive and the profile is kept.
- **Revocation, not ejection.** An accreditor withdrawing its own accreditation,
  not competitors collectively refusing to deal.
- **The trust anchor is set per deployment**, in the install call, not compiled
  into the build.

## Still open, and not a code question

- **The legal form.** Foundation or co-operative, before it matters. You cannot
  be both a participant and the registrar.
- **Admissibility.** Whether a peer-validated record plus a qualified timestamp
  is admissible evidence. This blocks reliance, not building.
- **The assertion vocabulary in practice.** The terms are now verbatim from the
  regulator. How a shop chooses between overlapping ones is domain work that
  needs airworthiness practitioners.

---

## What still decides whether any of this matters

Code was never the hard part, and having some does not change these.

1. Get the coalition's September 2025 progress report and find out whether #9 has
   an owner.
2. Get a lawyer's view on the anchoring pattern. If a peer-validated record plus
   a qualified timestamp is not admissible, the approach needs rethinking.
3. **Name two parties.** One repair shop and one buyer. If you cannot name them,
   the N=2 test has already failed.

The demonstration exists so those conversations have something to point at. It is
not a substitute for having them. If the effort on this project is 80%
engineering, it matches the profile of every corpse in the archive.
