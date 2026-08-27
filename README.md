# Release Attestation Format

*Working title. The name is an open decision — see [Open decisions](#open-decisions).*

A portable format, plus a joining rule, for attestations about physical things: the release
certificate for an aircraft part, the delivery note and retained sample for a marine fuel bunker.

**This is a specification, not a platform.** There is nothing to sign up to, no operator, and no
server that has to stay alive for a record to remain checkable.

---

## The problem

Digital signatures are solved. Every industry we surveyed already has a signing standard, and most
have had one for over a decade. Aviation has had legally valid electronic release certificates
since **2009**.

What none of them has solved is the question one layer up:

> **Who decides whose signature counts — when every organisation qualified to decide is a competitor
> of the others, and the answer has to be checkable by a stranger, offline, years later?**

That is the trust list problem. It is why a signing standard can sit almost unused for sixteen years
and not be a technology failure.

### It is institutional, not cryptographic

Every attempt to answer it has needed an operator, and the operator is always someone's rival.

- **Aviation.** The Aviation Supply Chain Integrity Coalition — Airbus, Boeing, GE Aerospace, Safran,
  Delta, United, American — named a back-to-birth parts documentation database as its
  **Recommendation #9**, marked it long term, and assigned it to **nobody**. GE cannot run the
  register that Safran's parts flow through.
- **Content provenance.** C2PA built the signatures, then had to run a trust list, then **froze it on
  1 January 2026**.
- **Steel and materials.** The certifying bodies' own impartiality accreditation forbids any of them
  holding the registry. Their published method for spotting a forged certificate is *"changes in
  font, misaligned logos, inconsistent line spacing."*

### The specific thing that is missing

Across both domains we researched in depth, the same gap appears:

> **A checkable binding between a physical artefact and a document, verifiable by a stranger years
> after the fact.**

- **Marine fuel.** The **sample seal number** is the only thing linking the retained physical sample
  to the delivery note. It is a *"should"* in IMO guidance (MSC-MEPC.2/Circ.18 §8.2) and is **absent
  from MARPOL Appendix V entirely**. Gard's own guidance records owners discovering the seal numbers
  were never written on the note, *"which allows their validity to be disputed."*
- **Aviation.** Back-to-birth documentation, bound to the part.

Same shape, two industries. That is the argument for one format with two profiles.

### Forgery is not the problem

This matters more than anything else here, because it determines what to build.

Across every documented bunker dispute we read — IMO instruments, two P&I club casebooks, standard
contract text — **not one turned on a forged signature.** The failures are:

| Failure mode | Example |
|---|---|
| **Omission** | Seal numbers never recorded on the delivery note |
| **Entitlement** | An officer certifies samples as continuous-drip when they were not |
| **Inconsistency** | Every sample off-spec except the supplier's, "the authenticity of which was disputed" |
| **Contractual fiat** | The contract makes the seller's own retained sample the one that gets tested |

**Do not pitch this as anti-forgery.** Verifiable credentials already solve forgery. They do not
solve any of the above.

---

## What this is, and is not

**Is:** a data format, a set of verification rules, and a membership rule expressed as code that
everyone can run and check.

**Is not:** a platform, a registry, a database, a company you route your data through, or a network
you must join before you get value.

### Non-goals

- **We do not perform the inspection.** A format can scope, bind and timestamp a claim. It cannot
  make the claim true. A real signature on a wrong assertion stays wrong. Records are not
  inspections, and any pitch implying otherwise should be treated as suspect — including ours.
- **We do not reconstruct history.** Nothing here helps assets already in service with missing
  paperwork. This only helps things entering service from now on. Say so out loud.
- **We do not replace the port state or the regulator.** Where a regulator runs the register, work
  upstream of it and feed it. Never against it.
- **We do not compete with the physical control.** In marine fuel trials a cheap tamper-evident
  **lock-and-seal** beat a high-tech DNA tracer on cost. Good. This format *strengthens the seal* by
  binding its number to the paper, at zero cost per tonne.

---

## Design constraints

These are not preferences. Each one is a cause of death observed in a real project.

1. **Value at N=2.** Two parties with no third present must get something on day one. Contour died
   processing 60–70 transactions a month. If the design needs network scale first, it is a graveyard
   project.
2. **A format and a rulebook, never a platform.** If one board meeting can shut it down, it will be.
3. **The owner cannot be a participant.** TradeLens ran on a decentralised ledger and it made no
   difference, because the *governance* was owned by Maersk. Neutrality is a legal form, not a data
   structure.
4. **Onboarding in an afternoon, without permission.** If it needs a consultant, the ceiling is a few
   dozen participants.
5. **Sealable by a qualified trust service.** Peer validation for correctness; a qualified timestamp
   or seal for legal weight. The record does not need to *be* qualified — it needs to be sealable by
   something that is. Design for this now, not in year three.
6. **The ejection rule must be objective, published in advance, and checkable by anyone.** See below.
7. **Not W3C Verifiable Credentials.** The EU wallet's recognised formats are IETF SD-JWT VC and
   ISO/IEC 18013-5 mdoc; the W3C data model "remains on the roadmap". In an EU market that is the
   losing side of a format war.
8. **Extend what exists.** The IMO Compendium eBDN data set is free, open, roughly 60 elements, and
   already carries a sample seal number field. Extend it rather than inventing a parallel vocabulary.

### The competition-law constraint

The mechanism that makes this work is that rule-breakers get provably ejected and others stop dealing
with them. Read that from a competition lawyer's chair: **a group of competitors operating a shared
list of parties they collectively refuse to trade with is a concerted refusal to deal.**

The precedent that makes it survivable is the certificate-authority ecosystem. Browsers do distrust
and effectively kill non-compliant certificate authorities, and that is accepted, because the grounds
are **objective, published in advance, and verifiable by anyone** — *you broke a stated technical
rule*, not *we don't like you commercially*.

**Design the ejection rule to that standard, or this is a cartel.** This constraint is load-bearing
and appears again in [SPEC.md](SPEC.md).

---

## What would kill this

Stated plainly so they can be watched for.

- **Recommendation #9 acquires a named owner.** As of 2026-08-27 it has none, and the coalition has
  published nothing at all in 2026. If an OEM funds a registry and hands it over, the aviation
  opening closes. *This is the single fact that decides the aviation profile.*
- **A regulator names a system of record.** MPA Singapore has already done this for bunker delivery
  notes — mandatory since 1 April 2025, six whitelisted vendors, its own central verification
  facility. Any bunker pitch must answer *"why not MPA's registry?"* The honest answer is that MPA's
  register is **port-scoped and does not federate** to Rotterdam, Fujairah or Houston.
- **An incumbent absorbs it.** BunkerTrace was selling to shipowners in 2020 and was a component
  inside a testing lab's own product by November 2021. It filed micro-entity accounts every year of
  its life — including the years it ran trials with bp, Chevron, Hapag-Lloyd and ONE — and went to
  creditors' liquidation without an administration. **Blue-chip trials are not revenue.**
- **The clock.** SWIFT 1973, the barcode 1974, PEPPOL around 2008. Ten to twenty years to critical
  mass is the base rate. If this must work in five, the evidence says it will not.

---

## Repository layout

| Path | What it is |
|---|---|
| `README.md` | The problem, the constraints, the kill conditions |
| `SPEC.md` | Draft v0.1 of the core format and verification rules |
| `profiles/bunker-sample-seal.md` | Marine fuel profile — the worked example |
| `profiles/aviation-back-to-birth.md` | Aviation parts profile — sketch |
| `research/` | The evidence base. `00-head-to-head.md` is the synthesis; `01`–`06` are raw sweeps with sources |

**Read `research/00-head-to-head.md` before making any decision from this repo.** It contains the
figures that turned out to be dead, and the arguments that did not survive verification.

---

## Status

**Pre-decision.** The format is a draft and the beachhead is not chosen. The evidence currently
tilts toward aviation, because its opening is verified open while marine fuel is occupied at two
levels — the port authority holds the register and the incumbent testing lab holds the customer.
Marine fuel retains the sharper documented gap and a real forcing function in its claim time bars
(14 days quantity, 30 days quality).

### Open decisions

- **The name.** "Release Attestation Format" is a placeholder.
- **The beachhead.** Pending the coalition's September 2025 progress report, which is email-gated.
- **The licence.** A specification wants a permissive licence that allows independent
  implementation — Apache-2.0 or CC BY 4.0 are the obvious candidates. Not yet chosen, so no LICENSE
  file is present. Choose before publishing anything externally.
- **The legal form.** Foundation or co-operative, before it matters. You cannot be both a participant
  and the registrar.

### Before writing any code

1. Get the coalition's September 2025 progress report and check whether #9 has an owner.
2. Get a lawyer's view on the anchoring pattern — peer-validated record plus qualified timestamp. If
   that does not produce admissible evidence, the whole approach needs rethinking.
3. Find the two parties. One repair shop and one buyer, or one bunker supplier and one owner. **If
   you cannot name them, the N=2 test has already failed.**

If the effort on this project is 80% engineering, it matches the profile of every corpse in
`research/`.
