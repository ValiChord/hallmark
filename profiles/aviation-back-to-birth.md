# Profile: aviation parts — back-to-birth documentation

**Status: this is the profile being built.** The domain was chosen on 1 September 2026; the
reasoning is in [`../docs/RESEARCH-ARCHIVE.md`](../docs/RESEARCH-ARCHIVE.md).

**Why this domain and not marine fuel:** aviation has *stated demand*. The gap here was written
down by the industry itself — once as an unowned recommendation, once as an explicit scope
exclusion in the standard. Marine fuel has a gap that is arguably easier to describe, but nobody
has asked for it to be closed, and both the register and the customer relationship are already
held by others.

⚠️ **This profile carries less domain research than the marine one**, because the marine sweeps ran
first and deeper. That is a fact about how the research was done, not a mark against the domain.
The assertion vocabulary in particular is illustrative and must be built with airworthiness
practitioners — it is the largest piece of domain work outstanding.

## Why this one is structurally better

The buyers published the gap themselves and assigned it to nobody.

The **Aviation Supply Chain Integrity Coalition** — Airbus, Boeing, GE Aerospace, Safran, Delta,
United, American, plus AAR, MTU, StandardAero, GA Telesis, Aeroxchange, IATA, ARSA, ASA — issued 13
unanimous recommendations. **Recommendation #9: "Establish Voluntary Industry Database of
Back-to-Birth Parts Documentation."** Marked long term. **No owner, verified 2026-08-27.**

None of them can hold it, because each competes with the others whose parts would flow through it.
That is the trust list problem stated by the industry itself, in public.

No regulator is moving in either: EASA's VIRTUA blockchain study concluded in September 2024 that
regulators would need to issue guidelines first, and EASA's unapproved-parts database is a blacklist,
not a system of record.

## Why it is also harder

- **All 13 recommendations are explicitly voluntary.** No mandate — and mandate is what makes these
  succeed.
- **"Long term" is defined as over five years.**
- **The coalition has published nothing at all in 2026.** Its news page ends September 2025. An
  unowned recommendation inside a coalition that has gone quiet may mean nobody wants it, rather than
  that it is available. **These two readings look identical from outside and point opposite ways.**
- **No named buyer to call.** The bunker profile yields named people; this one does not.
- **Adoption here is glacial.** Electronic release certificates were FAA-authorised in 2009 and the
  first electronic 8130-3 was issued in **October 2025** — a sixteen-year gap between legally valid
  and first used.

## Binding

- `binds`: serial, part number, or both (`binds_field`; the demo defaults to serial and part)
- `to_document`: the authorised release certificate (FAA Form 8130-3 / EASA Form 1) and the
  back-to-birth chain behind it
- The hard part is not one certificate. It is that the **chain** must remain checkable across
  custody changes, decades, and companies that no longer exist.

## Assertion vocabulary — provisional, not settled

A nine-term list exists and is enforced by the DNA, so the machinery works end to end. Three of the
terms are the real Block 11 values from FAA Order 8130.21J; INSPECTED and TESTED are documented in
the 8130-3 Q&A; the rest are ordinary maintenance language and LIFE_LIMITED_SCRAP is ours entirely.

It must still be built with repair-station and airworthiness practitioners. Desk research is not
enough, and the list as it stands is illustrative — see docs/TECHNICAL-REFERENCE.md 4.1.1.

## The twenty-year problem

Historical records will never be reconstructed. Anything built helps only parts entering service
from now on.

That is real, it is probably why nobody has funded it, and it should be said out loud in the first
paragraph of any pitch rather than discovered by a sceptic in the second meeting.

## The one action that decides this profile

**Get the coalition's September 2025 progress report** — the PDF is email-gated — and check whether
Recommendation #9 has acquired a named owner, sponsor or working group.

If it has, this profile closes. If it has not, and the coalition is still active, this is the
strongest opening found in the entire survey.

Also worth checking: **SAE AIR7123**, blockchain-for-ARC work in progress, unread.

---

## What Chapter 16 actually says (clean-room notes, 2026-08-28)

Read from a licensed copy. **Nothing here reproduces the specification text** - it is described in
our own words, by reference only. The document itself is licensed per-purchaser, must not be
redistributed, and must never enter this repository.

### 1. The back-to-birth chain already exists in the standard

This was the surprise. Chapter 16 already specifies how one certificate links to the one before it:
a new form carries a reference to the immediately preceding form for that part - by its tracking
number, the issuing supplier's code, and a flag for whether that predecessor was electronic or paper.
Where the predecessor was electronic, it is attached to the new form **with its signature intact**.

**So back-to-birth traceability is already a linked chain of attached signed forms.** It has been
specified since at least the 2019 revision.

That reframes Recommendation #9 completely. The coalition is not asking for a data structure that
does not exist. **They are asking for something the format cannot give them.**

### 2. The gap is written into the specification's own scope exclusion

Chapter 16 states that it does not cover the internal processes companies use to generate the data,
**to authorise the users or signers of that data**, or to store and repurpose it. The stated reason
is that those processes are company-specific and governed by company policy or regulator guidance,
so standardising them is neither necessary nor desirable for exchanging data between companies.

**Read that against Recommendation #9.** The standard defines how a signed certificate travels and
how it chains to its predecessor. It explicitly declines to say **who is entitled to sign one**.

That is the trust list problem, named by the standard itself, as a deliberate exclusion.

**This is the aviation equivalent of the bunker seal-number gap** - and it is a stronger finding,
because it is not an omission or an oversight. It is a boundary the standard drew on purpose, for
reasons that were correct for exchange between two known trading partners and that fail completely
for a stranger checking a chain twenty years later.

### 3. Their trust model, and where it breaks

The security model is conventional PKI: a per-individual digital certificate at a defined assurance
level, a W3C XML Signature bound to it, and validation by the recipient of both the signature and
the certificate's validity **at the time of signing**. The organisation named in the certificate is
expected to match the issuing organisation on the form.

Two consequences follow, and both are ours to address:

- **Validation is at time of signing, historically.** Exactly the hard part flagged in `SPEC.md`
  section 7 step 4. They require it; they do not solve it for the long term.
- **The standard acknowledges the expiry problem directly.** It notes that certificates have limited
  lifetimes, that a signature may need validating long after its certificate expired, and offers two
  approaches. **This is our "key rotation and long-lived records" known-unfinished item, and the
  industry has already met it.** Read their approaches before designing anything.

### 4. What this means for the build

- **Do not design a new certificate format.** One exists, it is in use, and it chains.
- **The demonstrable gap is entitlement over time:** proving a signer was authorised at the moment
  of signing, checkable by a stranger years later, with no operator and no surviving employer.
- The form covers FAA 8130-3, EASA Form 1, CASA Form 1 and TCCA Form One, plus Certificates of
  Conformance and Transfer Documents - so a demonstration built on the FAA form generalises.

### 5. Still to read

The data element definitions and block structure, and the two certificate-expiry approaches in
detail. Also ATA Spec 42, referenced throughout for certificate assurance levels and PKI procedure -
**that is where the trust anchor lives. It is a separate licensed document, priced at ~$400, and we do not have it. DO NOT BUY IT until a working demonstration exists - see the note below.**

**On not buying Spec 42 yet:** the demonstration does not depend on it. Spec 42 describes the INCUMBENT trust anchor - what we would be offering an alternative to - not the mechanism we are building. And Recommendation #9 existing at all is evidence that whatever Spec 42 specifies does not answer the cross-company, decades-long case. Note also the irony worth using: **if the rules of the trust anchor cost $400 to read, then "checkable by a stranger" has already failed at the documentation layer.**
