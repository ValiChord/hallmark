# When an accreditation ends, who can tell which certificates were signed under it?

**Ceri John · ValiChord · Burry Port, Wales · 3 September 2026**

*Everything below is from free public sources, cited precisely enough to check.
Corrections are welcome and will be published.*

---

## The covering note

*Short version, for an email. The rest of this document is the working.*

> Dear ASA,
>
> I have a question your association is better placed to answer than anyone, and
> I could not find the answer in public sources.
>
> When the FAA removed Transonic Aviation Consultants from the accreditation
> programme in April 2024, can anyone now determine which certificates were
> signed under accreditations Transonic had granted? Not "which distributors were
> affected" — that list can be rebuilt. I mean the documents themselves, already
> in the supply chain, issued while the accreditation stood.
>
> I ask because I have spent some months on this problem and believe there is a
> gap in the industry's plans. I am not selling anything, I am not asking for an
> introduction, and I have nothing to invoice. I would like to know whether what
> I have found matches what your members actually see.
>
> The detail is below. There is a working demonstration if it is of interest,
> which runs in a browser in about thirty seconds.
>
> Ceri John

---

## 1. What prompted this

AOG Technics was accredited. Transonic Aviation Consultants had certified it as
meeting voluntary distributor quality standards, and any check asking "is this an
accredited distributor?" would have returned yes, in 2022.

In April 2024 the FAA removed Transonic, dropping the TAC-2000 standard from
AC 00-56B. Three accreditation organisations remain accepted, ASA among them.

That leaves a question the published record does not answer. Certificates issued
under a Transonic-granted accreditation were valid when signed. The accreditation
behind them is now gone. **Nothing appears to connect those two facts
automatically**, and I could not find any mechanism that does.

## 2. The general problem: approvals end

Approvals are surrendered, suspended and withdrawn. A signature that was genuine
on the day it was made says nothing about whether the approval behind it was
still live — and a signature check cannot tell the difference, because in these
cases the signature is authentic.

**Aviatronics LLC** is the cleanest example. The repair station surrendered FAA
certificate ZVNR690L on **3 November 2016**. A former employee continued
approving articles for return to service on Aviatronics documentation afterwards,
issuing what the FAA calls intentionally false work orders and Form 8130-3 tags.

The FAA published the alert on **24 April 2020 — three and a half years later.**
Its recommended action was that owners, operators, manufacturers, maintenance
organisations, parts suppliers and parts distributors should inspect their
aircraft, records and inventories for anything Aviatronics released after that
date.

An industry-wide manual search, years after the fact, because there is no way to
ask the question any other way.

> *FAA SAFO 20010, 24 April 2020.*

Also: **Sauer Flugmotorenbau**, certificates invalidated by the German LBA in
2023. **Aeromotory s.r.o.**, improper overhaul and withdrawal of approval, 2026.

## 3. The word that never appears

The Aviation Supply Chain Integrity Coalition's Final Report of October 2024 is
the industry's considered answer to all of this — nine months, 38 experts across
24 organisations, thirteen unanimous recommendations. ASA hosts a copy.

Search it for these words:

> **revoked · revocation · suspended · expired · lapsed · withdrawn**

They appear **zero times**. Not once, in any form. Every use of "valid" concerns
whether a document is authentic or whether its fields match — never whether an
approval was live on a given date.

The report describes the FAA removing Transonic. It records the event without
naming the general problem.

*I checked this against control terms in the same document — "accreditation" 52,
"traceability" 38, "signature" 10 — and repeated it on a separate text
extraction. Absent both ways. It takes five minutes to reproduce.*

## 4. The need is named; the shape does not fit

Recommendation #8 asks for a system that verifies

> "…the part number and serial number match authorized data, the issuance date is
> within valid limits, and **the signatory is an authorized individual**."

The same paragraph specifies the mechanism: interfaces "to facilitate
**real-time** data querying" of manufacturer, carrier and production-approval-
holder databases.

A real-time query answers what is true now. It cannot answer what was true on the
day of signing. Those are different questions, and only one is being built.

## 5. The standard is explicit about this

ATA Spec 2000 Chapter 16 governs electronic exchange of the release certificate
and is accepted by both the FAA and EASA. Two sections, read together:

- **§2.2 requires** a digital certificate for the individual signing, to a stated
  assurance level under ATA Spec 42, with the organisation in the certificate
  matching Block 4. Identity: mandatory.
- **§1.2 excludes** from scope the internal processes companies use to
  *"authorize users or signers of the data"*, on the stated reasoning that such
  processes belong to each company.

Reasonable between two firms who already trade with each other. It leaves nothing
for a stranger reading the paperwork years later.

ATA Spec 42, which issues the certificate §2.2 requires, verifies an
organisation's **legal existence** — incorporation and a business registry
identifier. Not any airworthiness privilege.

> *ATA Spec 2000, Chapter 16, Revision 2019.1, §1.2 and §2.2.*

## 6. The external checkpoint is being removed

Today a repair station's electronic signature scheme gets outside review through
OpSpec A025 — a private FAA authorisation. Not public, not machine-readable, but
a review by someone outside the firm.

A draft Change 1 to FAA AC 120-78B, on the FAA's draft documents server, gives
its principal change as removing that requirement for part 145 repair stations
and part 147 schools.

If it proceeds, the last external check on who may sign electronically at a
repair station goes, and nothing published replaces it.

> *Draft AC 120-78B Change 1, coordination copy. Status uncertain — it is on the
> FAA's server but not currently listed as open for comment. FAA Notices
> N 8900.368 and N 8900.458 are worth reading alongside it.*

## 7. What I think the answer looks like

Two answers where the industry currently records one:

| | The question |
|---|---|
| **Historically valid** | Was this properly authorised at the moment it was signed? |
| **Currently trusted** | Should anyone rely on this signer for something new, today? |

A certificate signed while a shop genuinely held approval stays a real document
forever. A later withdrawal removes grounds for *new* reliance, not the history.
Collapse the two and you either erase history or keep trusting a shop that lost
its approval. Both failures are in the record above.

The second piece: a signer records what they did **not** check, so silence is
never read as assent.

## 8. What I have built, and what it is

I am not a developer. This was built with heavy use of AI coding tools, and the
commit history says so on every commit.

It is a demonstration, not a product. It is not a mock-up either: the rules run
in a real conductor, two independent nodes verify each other's records
automatically on every change, and you can watch a withdrawn accreditation flip
one answer while the other holds.

There are **two implementations** — one peer-to-peer, one running entirely in a
browser tab with no network and no server — checked against each other so they
cannot drift apart. The specification is written to be implemented independently
of both.

**https://github.com/ValiChord/hallmark** — Apache 2.0. The browser demonstration
needs no install.

Judge it on what it does. If an engineer finds gaps, I would like to hear about
them.

## 9. What I am not claiming

- **This is not the industry's biggest problem.** Records volume, inconsistent
  formats, missing paperwork and improper maintenance by properly approved shops
  all cost more. Deliberate document forgery is rare — one FAA unapproved-parts
  notification in sixteen years turns on it.
- **Two regulators looked and did not add this.** FAA AC 20-154A (July 2024) and
  UK CAA CAP 3037 (December 2024) are both post-scandal receiving-inspection
  guidance. Neither adds a step to verify the issuer's entitlement. That may be a
  considered judgement rather than an oversight, and if so I would like to know
  the reasoning.
- **Aeroxchange is doing the identity half, and doing it well.** The first
  electronic 8130-3 shipped in October 2025 with Boeing and Southwest. I am not
  competing with that. What I describe is a gap their design does not address,
  and adding it to what they already ship would be a perfectly good outcome.
- **Some of this is already possible.** The UK CAA publishes approval dates *and*
  revocation dates. EASA publishes suspension and valid-until dates. What no
  register publishes is a versioned snapshot — you cannot retrieve the list as it
  stood on a past date, and a suspension followed by reinstatement erases the
  window.
- **I do not work in this industry.** All of the above is desk research. If it
  does not match what you see from inside, that is the single most useful thing
  anyone could tell me.

## 10. The question, again

When an accreditation or an approval ends, can anyone determine which
certificates were signed while it stood?

If the answer is "yes, here is how" — I have missed something and would be glad
to be corrected. If it is "no, and it has not come up" — that is worth knowing
too. If it is "no, and it costs us every time" — then I would like to talk.

---

## Annex: the architecture, briefly

Only if it matters to you. It should not affect anything above.

It is built on Holochain. **This is not a blockchain.** There is no shared
ledger, no mining, no tokens, and no single copy of everything that everyone must
agree on. Each participant keeps their own signed, ordered records — much as
companies keep their own paperwork now — and anyone can check somebody else's
record against the same published rules without either party contacting the
other. Nobody has to hold a database of the whole industry's maintenance history,
and nobody would want to.

Holochain is at version 0.7.0 and still maturing. That is a genuine limitation
and probably why you have not come across it.

The specification does not depend on it. The browser demonstration implements the
same rules in ordinary JavaScript with no network at all, which is the proof: if
the peer-to-peer part is the objection, the format does not require it.

On the projects that came before — TradeLens, we.trade, Contour and the rest —
they did not fail on technology. TradeLens carried more than half the world's
container traffic and closed anyway, because the party in the middle could not
credibly be in the middle. That is a governance problem. This is a format and a
rule for reading it, which is why it does not need anyone to sit in the middle.
