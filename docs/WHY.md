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

### ⭐ The strongest evidence this project has: a word that never appears

The coalition's **[Final Report and Recommendations, October 2024](https://www.aviationsuppliers.org/asa/files/cclibraryfiles/filename/000000005402/Aviation%20Supply%20Chain%20Integrity%20Coalition%20-%20Report%20-%20FINAL.pdf)**
is the industry's definitive answer to the largest documentation fraud in its
history — nine months, 38 experts across 24 organisations, thirteen unanimous
recommendations.

Searched in full on 2 September 2026, these terms occur **zero times**:

`revoked` · `revocation` · `suspended` · `expired` · `lapsed` · `withdrawn`

Every one of the 14 uses of "valid" concerns whether a *document* is authentic or
its fields match — never whether an approval was live on a given date.

*Method, because a convenient null result deserves suspicion:* the check was run
against control terms in the same extracted text (`accreditation` 52,
`traceability` 38, `signature` 10, `AOG` 41) and repeated against the raw
pre-cleanup text. Absent both ways.

**The report describes the FAA removing Transonic and never names the general
problem.**

### What the coalition did ask for, and why the shape is wrong

Recommendation #8 names the need exactly:

> "...the system will verify that the part number and serial number match
> authorized data, the issuance date is within valid limits, and **the signatory
> is an authorized individual**."

And in the same paragraph specifies the mechanism: a third-party system
*"creating Application Programming Interfaces (APIs) to facilitate **real-time**
data querying"* of OEM, air carrier and production-approval-holder databases.

**A real-time query answers what is true now. It cannot answer what was true on
the day of signing.** That is the whole distinction this project exists to make,
and the industry's own plan does not contain it.

### The cases this actually covers

Not hypotheticals. Each is a genuine person signing a genuine-looking document,
where the entitlement behind it had ended:

| Case | What happened |
|---|---|
| **Aviatronics LLC** | Surrendered FAA certificate ZVNR690L on 3 Nov 2016; a former employee continued issuing 8130-3s in its name afterwards. **Now fully sourced — see below** |
| **Sauer Flugmotorenbau** | Certificates invalidated by the German LBA, 2023 (EASA SUP register, 16 June 2023) |
| **Aeromotory s.r.o.** | Improper overhaul and **withdrawal of approval**, 2026 |
| **Transonic Aviation Consultants** | The accreditor that certified AOG Technics; **removed by the FAA in April 2024** when AC 00-56B Change 1 dropped the TAC-2000 standard |

Transonic is the one that argues for chain revocation rather than a flat list.
When an accreditor is removed, everything it accredited is resting on an approval
that no longer exists — and nothing propagates that today.

#### Aviatronics, from the primary source — the reference case

✅ *Verified 2 September 2026 against
[FAA SAFO 20010](https://www.faa.gov/sites/faa.gov/files/other_visit/aviation_industry/airline_operators/airline_safety/SAFO20010.pdf),
dated 24 April 2020, read in full. This supersedes the earlier second-hand note.*

Subject line: *"Fraudulent Documentation and Possible Improper Maintenance on
Accessories/Articles by a Previous Employee of Aviatronics, LLC, Miami Lakes,
Florida."* The repair station held FAA Certificate No. **ZVNR690L**.

> "An investigation conducted by the FAA revealed that an individual previously
> employed by Aviatronics, LLC, **continued to approve articles for return to
> service using Aviatronics, LLC, documentation even after the company
> surrendered its FAA repair station certificate on November 3, 2016.** This
> individual signed and issued intentionally false work orders and approvals for
> return to service (FAA Form 8130-3, Airworthiness Approval Tag)…"

**Three facts worth carrying into any pitch:**

1. **The signature and the document were genuine in form.** A real person, real
   company paperwork, a real 8130-3. Every existing check — X.509 identity,
   document integrity, field matching — passes. Only the entitlement had ended.
2. **The detection lag was three and a half years.** Certificate surrendered
   November 2016; alert published April 2020.
3. **The FAA's remedy is a manual, industry-wide records hunt.** Verbatim:
   "Aircraft owners, operators, manufacturers, maintenance organizations, parts
   suppliers, and parts distributors should inspect their aircraft, aircraft
   records, and parts inventories for any articles/parts approved for return to
   service by Aviatronics, LLC, after November 3, 2016."

That last one is the cost of the missing layer, stated by the regulator: when
nobody can ask *was this signer still entitled on the day they signed*, the
fallback is every operator in the world searching their own records by hand,
years late. It is also precisely the query `historically_valid` answers.

### ⚠️ What AOG Technics does and does not prove

Earlier drafts leaned on AOG Technics as the motivating case. **It only partly
supports this project, and the distinction matters.**

The organisations named on the forged certificates — Safran among them — were
**real and validly approved**. CFM identified 72 falsified documents; in each
confirmed case the named organisation said the form had not come from them. So a
register of approved *organisations* returns "approved ✓" for every one of them,
and catches nothing. AOG Technics itself was a distributor and needed no approval
to hold, so it had no entry to be missing from.

What the coalition's own report records is more useful. The forgeries bore

> "fake signatures of actual Safran Aircraft Engines employees, while others were
> supposedly signed off by **individuals who no longer worked at the company**.
> The names of other signatories appeared to be wholly fabricated, complete with
> fake LinkedIn profiles."

The middle category is an entitlement failure at the level of a person. But be
precise about what follows: **cryptographic signing does defeat the AOG attack**,
because AOG could never obtain a certificate in Safran's name. That is exactly
what Boeing and Aeroxchange are deploying, and it is why the honest framing of
this project is *complement*, not *replacement*.

Also worth carrying: **AOG Technics was accredited**, by Transonic. Any check
asking "is this a legitimately accredited distributor?" would have said yes,
in 2022. The rot was one layer up.

### The competition, stated fairly

- **Boeing / Southwest / Aeroxchange eARC** — first electronic 8130-3, October
  2025, X.509, rolling out across nine Boeing repair centres. Authenticates
  signer *identity*. The nearest thing to a competitor, and the one to watch: an
  entitlement check is a modest increment on what they already ship.
- **GE Aerospace** is building an in-house tool to verify "the identity,
  employment, and authority of signatories" using AI. The problem statement is
  ours; the approach is per-company and heuristic.
- **SkyThread** — parts track-and-trace, one lighthouse deployment (AFI KLM E&M /
  Parker, 787). Roughly $1.2M raised, ~13 staff, no 2026 news found. Its material
  never mentions accreditation, entitlement or revocation.
- **ATA Spec 42** — aviation PKI. Verifies a key belongs to a legally-existing
  company (incorporation plus a DUNS number). **No check of any airworthiness
  privilege, and no regulator in its list of who may request revocation.**
- **IATA Aviation Security Trust Framework (Jan 2025)** — architecturally the
  closest thing that exists: authorised-issuer lists, issuer authority checking,
  revocation status. **Scoped to airport security programmes; airworthiness and
  Form 1 appear nowhere in it.** If IATA extends it to parts, they have the
  convening power and this project does not.

### ⚠️ Where this sits in practitioners' actual priorities

Honest ranking from the evidence, worst-hurting first: records volume and format
inconsistency; vendor trustworthiness; missing documents grounding aircraft
(£20k–£140k per hour); improper maintenance by properly approved shops (three
quarters of FAA suspected-parts cases); unapproved production by people outside
the system entirely (~90% of FAA notices).

**Deliberate document forgery is roughly sixth**, and rare — one FAA notice in
sixteen years turns on it. Two regulators wrote new receiving-inspection guidance
after the scandal (FAA AC 20-154A, July 2024; UK CAA CAP 3037, December 2024) and
**neither added a step to verify the issuer's entitlement.**

This does not make the gap unreal. It makes it *narrow, unranked, and not
currently anybody's budget line* — which is the thing to establish before
building further.

### Registers already do more than earlier drafts claimed

- **UK CAA publishes approval dates and revocation dates**, in separate approved,
  suspended and revoked lists. In AOG Technics' own jurisdiction, a stranger can
  already answer much of this. PDF only, no API, single current snapshot.
- **EASA** publishes suspension and valid-until dates for ~1,000 foreign Part-145
  organisations, machine-readable. **No approval start date**, so point-in-time
  questions still cannot be answered.
- **FAA** publishes contact details only — no dates, no bulk download — and
  revoked stations simply disappear.
- **Nobody publishes versioned snapshots.** No register anywhere returns "the
  list as it stood on 3 March 2023", and a suspension followed by reinstatement
  erases the window entirely. **That residue is real and is the archival half of
  what this project addresses.**

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
intact. What it does not carry is the signer's **entitlement**.

> ✅ **SETTLED 2 September 2026 against a licensed copy of the document.**
> Ceri obtained Chapter 16, Revision 2019.1, and it was read directly.
>
> **§1.2 "Scope"** limits the specification to the data and processes needed to
> exchange electronic part certification forms, and states that it does *not*
> include the internal processes companies use to generate the data, to
> **"authorize users or signers of the data"**, or to process, store or repurpose
> it. The rationale given is that such processes are company-specific and
> governed by company policy or regulatory guidance, so standardising them is
> neither necessary nor desirable.
>
> **The exclusion is explicit, and it names our layer.** The project's long-held
> claim was correct in substance.
>
> ⚠️ **But the earlier attribution was not.** Every draft presented a paraphrase
> — British spelling, reordered — as a verbatim quotation, and two public-source
> searches failed to find it, because the document is DRM-protected and not
> indexed anywhere. For several hours this project believed it had invented the
> quote. **Paraphrase presented as quotation is the failure mode, and it survived
> weeks of review.** Quote from the document or mark the paraphrase.
>
> **§2.2 is the other half, and it is stronger than expected.** Chapter 16
> *requires* a digital certificate for the individual signing an electronic form,
> to at least Medium Software assurance under **ATA Spec 42**, with the
> organisation named in the certificate corresponding to Block 4. So the
> specification mandates proof of **identity** in the same document in which it
> declines to cover **entitlement** — and Spec 42, which issues that certificate,
> verifies legal existence (incorporation, DUNS) rather than any airworthiness
> privilege.
>
> **Two standards interlock and leave the entitlement question in the hole
> between them.** That is now demonstrable from primary sources with precise
> citations, and it is the most defensible statement of the gap this project has.
>
> *Also verified:* §2.1 — the chaining rule. An issuer *should* reference the
> immediately previous certification form for the part (tracking number, supplier
> code, format indicator) in the Previous Certificate element of Block 12, and
> where the previous form was electronic it should be carried forward with its
> digital signature intact. Note "should", not "must" — which supports this
> project's decision not to make a predecessor mandatory. §1.3 confirms the
> specification does not replace regulatory requirements, matching the Transport
> Canada restatement previously relied on.
>
> ⚠️ **Do not redistribute the document.** It is licensed per-order, watermarked
> with the purchaser's name and postal address on every page, and marked NOT FOR
> RESALE. Cite sections; never paste extracts into this repository.

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
- **A regulator names a system of record. ⚠️ Re-tested 2 September 2026 and it
  was understated.** The earlier wording said EASA "looked and stepped back".
  That is not supported.

  What is verified: EASA ran **VIRTUA** (*Digital Transformation — Case Studies
  for Aviation Safety Standards — Virtualisation*), Horizon Europe funded, with
  FPT Software, IATA, **SkyThread** and PwC France. It concluded **September
  2024**. Its own deliverable D-1.1 states the project shall assess "the main
  changes to be introduced in regulations, standards and working processes as
  well as the preparation of guidelines and supporting materials for regulatory
  evolutions and the deployment of the related solutions."

  So EASA commissioned exactly the guideline work this kill condition treats as
  the precondition, and did it with a named consortium that includes a working
  vendor. **No public final report or resulting guidance has been found**, two
  years on. Read that as unresolved, not as retreat — "they stepped back" was an
  inference from silence and should not have been written as a finding.
  *Source: [EASA D-1.1](https://www.easa.europa.eu/en/downloads/137888/en),
  read in full.*

- **An incumbent absorbs it. ⚠️ Re-tested 2 September 2026: real, and it was
  being argued from the wrong industry.** The earlier wording reached for a
  marine predecessor because no aviation graveyard research existed. There is
  aviation evidence, and it is closer to home:

  - **Aerotrax was acquired by LGM Aviation on 17 July 2024.** Absorption, in
    this domain, recently.
  - **SkyThread is live, not hypothetical.** AFI KLM E&M and Parker Aerospace
    deployed its blockchain-based parts track-and-trace across a 787 fleet,
    reported at hundreds of thousands of parts. The same company sits inside
    EASA's VIRTUA consortium.

  The marine lesson still holds and is worth keeping: that predecessor filed
  micro-entity accounts every year of its life, including the years it ran
  trials with blue-chip names, and went to creditors' liquidation. **Blue-chip
  trials are not revenue.**

  **The blue-team reading, which matters as much.** SkyThread is an
  operator-run platform deployed in a consortium — one MRO, one supplier, one
  fleet. That is precisely where this document argues platforms *do* work, and
  it is not the neutral industry-wide trust list #4 asks for. But it does
  disprove the absolute form of "nobody can own this": someone is operating,
  customers are buying, and a regulator is sitting at the table with them.
  Anyone pitching this project should expect to be asked "why not SkyThread?"
  and should have an answer better than architecture.

- **The clock. ⚠️ Re-tested 2 September 2026: it contradicts this project's own
  first design constraint.** The dates are about right — SWIFT 1973, the barcode
  1974, PEPPOL around 2008 — and ten to twenty years to critical mass is a fair
  base rate *for a network standard that is only useful once nearly everyone has
  adopted it.*

  Hallmark is explicitly not that. **Design constraint #1 is value at N=2**: two
  parties, no third present, get something on day one. If that constraint holds,
  time-to-ubiquity is the wrong yardstick, because usefulness does not wait for
  it. If it does not hold, the problem is constraint #1, not the calendar.

  Either way this is not a kill condition as written. **The real version of the
  risk is commercial, not adoption-curve:** can two parties be found who will
  use it this year, and will anyone pay for it before ubiquity arrives? That is
  the N=2 test already at the foot of this document, and it is the one to keep.

### ⚠️ Unread prior art: ATA Spec 42

Surfaced by EASA's own literature review and **not previously considered here**.
*Spec 42, Aviation Industry Standards for Digital Information Security*, is
described as providing standardised methods for security and specifically for
"the electronic exchange of digital certificates".

That is adjacent to this project's layer and might overlap it. Nobody here has
read it — like Chapter 16 it is gated behind ATA e-Business membership.

The likely distinction, stated as expectation rather than fact: a public-key
infrastructure establishes that a key really belongs to a named organisation.
It does not establish that the organisation held a Part-145 approval on the day
it signed, nor that the approval was not later withdrawn — revoking a *key* and
withdrawing an *approval* are different acts. A PKI also needs a certificate
authority, which is the operator problem again.

**Treat this as an open question, not a settled difference.** It is the
strongest technical objection available to a sceptic, and reading Spec 42 is the
cheapest way to find out whether it is fatal.

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
