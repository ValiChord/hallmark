# The word that never appears

*A short, checkable observation about aircraft parts documentation. Every claim
below can be verified from free public sources in about ten minutes, and the
citations are precise so that you can.*

**Ceri John · ValiChord · 3 September 2026**

---

## The claim

Everything needed to prove **who signed** an aircraft part release certificate
now exists, works, and is being deployed. Nothing establishes **whether they were
entitled to sign at that moment** — or notices when that entitlement later ends.

## What is already solved

In October 2025 Boeing, Southwest Airlines and Aeroxchange completed the
industry's first parts shipment carrying a digital FAA Form 8130-3. It uses X.509
certificates and public-key cryptography, and in Boeing's own description it
"authenticates the authorized signer's identity and ensures document integrity."
Boeing is rolling it out across all nine of its product repair services centres.

That is real progress and it closes a real hole. A forged certificate purporting
to come from an engine manufacturer no longer survives contact with a signature
check, because a forger cannot obtain a certificate in someone else's name.

## What is not solved

**Approvals end.** They are surrendered, suspended, and withdrawn. A signature
that was genuine on the day it was made says nothing about whether the approval
behind it was still live — and a cryptographic check cannot tell the difference,
because in these cases the signature is authentic.

Three documented examples, all a real person signing a real form:

**Aviatronics LLC.** The repair station surrendered FAA certificate ZVNR690L on
**3 November 2016**. A former employee continued to approve articles for return
to service using Aviatronics documentation *after* that date, issuing what the
FAA describes as intentionally false work orders and Form 8130-3 airworthiness
approval tags.

The FAA published the alert on **24 April 2020 — three and a half years later.**
Its recommended action was that aircraft owners, operators, manufacturers,
maintenance organisations, parts suppliers and parts distributors should inspect
their aircraft, aircraft records and parts inventories for anything Aviatronics
released after that date.

An industry-wide manual records search, years after the fact, because there is no
way to ask the question automatically.

> *FAA SAFO 20010, 24 April 2020.*

**Sauer Flugmotorenbau.** Certificates invalidated by the German LBA, 2023.

**Transonic Aviation Consultants.** The accreditor that had certified AOG
Technics as meeting distributor quality standards. The FAA **removed** it in
April 2024, when AC 00-56B Change 1 dropped the TAC-2000 standard. Everything
Transonic had accredited was left resting on an accreditation that no longer
existed, and nothing propagated that fact automatically.

> *Aviation Supply Chain Integrity Coalition, Final Report, October 2024, and
> FAA AC 00-56B Change 1.*

## The standard says the quiet part out loud

ATA Spec 2000 Chapter 16 is the industry standard for exchanging these
certificates electronically, and is accepted by both the FAA and EASA. Two of its
sections, read together, state this gap more clearly than any outside critic
could:

- **§2.2 requires** a digital certificate for the individual signing an
  electronic form, to a stated assurance level under ATA Spec 42, with the
  organisation named in the certificate corresponding to Block 4 of the form.
  Identity: mandatory.
- **§1.2 excludes** from the specification's scope the internal processes
  companies use to *"authorize users or signers of the data"*. Entitlement:
  deliberately out of scope, on the stated reasoning that such processes are
  specific to each company.

That reasoning is sound for two trading partners who already know each other. It
leaves nothing at all for a stranger checking a chain twenty years later, across
companies that may no longer exist.

And ATA Spec 42, which issues the certificate that §2.2 requires, verifies an
organisation's **legal existence** — incorporation documents and a business
registry identifier. It does not verify that the organisation holds any
airworthiness privilege.

> *ATA Spec 2000, Authorized Release Certificate, Chapter 16, Revision 2019.1,
> §1.2 and §2.2.*

## The word that never appears

After the AOG Technics scandal, Airbus, Boeing, GE Aerospace, Safran, Delta,
United, American and others formed the Aviation Supply Chain Integrity Coalition.
Nine months, 38 subject-matter experts across 24 organisations, thirteen
unanimous recommendations. It is the industry's definitive answer to the largest
parts documentation fraud in its history.

Search that report for these words:

> **revoked · revocation · suspended · expired · lapsed · withdrawn**

They appear **zero times**. Not one, in any form.

Every use of "valid" in the report concerns whether a *document* is authentic or
whether its fields match — never whether an approval was live on a given date.

The report itself describes the FAA removing Transonic. It records the event and
never names the general problem.

*Method, because a convenient result deserves scrutiny: the search was run
against control terms in the same document — "accreditation" 52, "traceability"
38, "signature" 10, "AOG" 41 — and repeated against a separate text extraction.
Absent both ways.*

> *Aviation Supply Chain Integrity Coalition, Final Report and Recommendations,
> October 2024. Free at aviationsuppliers.org.*

## The need is named, and the shape is wrong

The coalition's Recommendation #8 does name it:

> "…the system will verify that the part number and serial number match
> authorized data, the issuance date is within valid limits, and **the signatory
> is an authorized individual**."

The same paragraph specifies the mechanism: a third-party system *"creating
Application Programming Interfaces (APIs) to facilitate **real-time** data
querying"* of manufacturer, air carrier and production-approval-holder databases.

**A real-time query answers what is true now. It cannot answer what was true on
the day of signing.** Those are different questions, and only one of them is
being built.

## And the external checkpoint is being removed

Today, the way a repair station's electronic signature scheme gets any outside
review at all is Operations Specification A025 — a private authorisation issued
by the FAA to that company. It is not public and not machine-readable, but it is
at least a review by someone outside the firm.

A draft Change 1 to FAA Advisory Circular 120-78B, posted on the FAA's draft
documents server, states its principal change as removing the requirement for
part 145 repair stations and part 147 schools to obtain that authorisation
through OpSpec A025.

If that proceeds, the last external checkpoint on who may sign electronically at
a repair station goes away, and nothing in the industry's published plans
replaces it.

> *Draft AC 120-78B Change 1, coordination copy, faa.gov/aircraft/draft_docs.
> Status uncertain: it is on the FAA's server but is not currently listed as open
> for comment. Related FAA Notices N 8900.368 and N 8900.458 address OpSpec A025
> and part 145 and are worth reading alongside it.*

## What follows from this

Two answers are needed where the industry currently records one:

| | The question |
|---|---|
| **Historically valid** | Was this record properly authorised at the moment it was signed? |
| **Currently trusted** | Should anyone rely on this signer for something new, today? |

A certificate signed while a shop genuinely held its approval stays a real
document forever. What a later withdrawal removes is grounds for *new* reliance,
not the history. Collapsing those into a single status either erases history or
keeps trusting a shop that lost its approval — and both failures are visible in
the record above.

## What I am not claiming

- **This is not the industry's biggest problem.** Records volume, inconsistent
  formats, missing paperwork and improper maintenance by properly approved shops
  all cost more money and more safety margin. Deliberate forgery is rare — one
  FAA unapproved-parts notification in sixteen years turns on it.
- **Two regulators looked and did not add this.** The FAA's AC 20-154A (July
  2024) and the UK CAA's CAP 3037 (December 2024) are both post-scandal
  receiving-inspection guidance, and neither adds a step to verify the issuer's
  entitlement. That may be a judgement rather than an oversight.
- **Some of it is already possible.** The UK CAA publishes approval dates *and*
  revocation dates. EASA publishes suspension and valid-until dates. What no
  register anywhere publishes is a versioned snapshot — you cannot retrieve the
  list as it stood on a past date, and a suspension followed by reinstatement
  erases the window entirely.
- **I do not work in this industry.** Everything above is desk research from
  primary sources. If it does not match what you see from inside, I would
  genuinely like to know, and that is the main reason this is published.

## A working demonstration

There is a reference implementation, and it is open source under Apache 2.0 so
that anyone may build against the format independently:

**https://github.com/ValiChord/hallmark**

It runs the rules in a browser with nothing to install, and as a peer-to-peer
desktop application where two machines verify each other's records without either
contacting the other. Withdraw an accreditation and the same record comes back
still historically valid and no longer currently trusted.

It is a demonstration of a mechanism, not a product, and it makes no claim to
solve the problems listed under *What I am not claiming*.

---

*Corrections welcome, and will be published. ValiChord, Burry Port, Wales.*
