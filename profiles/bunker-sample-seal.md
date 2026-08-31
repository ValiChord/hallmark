# Profile: marine fuel — sample seal binding

**Status: NOT being built.** Kept as a record and as a second profile the format should still fit.

Aviation was chosen on 1 September 2026. This domain lost on two counts:

1. **Nobody is asking.** The seal-number gap below is precisely describable, but it was identified
   by reading dispute guidance — not requested by anyone in the industry. Aviation's equivalent is
   a published, unowned recommendation from the buyers themselves, plus an explicit scope exclusion
   in the standard. **A gap being well documented is an artefact of research effort. A gap being
   asked about is demand.** Those are not the same thing, and this file previously conflated them.
2. **It is occupied at both ends.** A port authority holds the register and the incumbent testing
   lab holds the customer — and absorbed the last company that tried this.

Kept because it demonstrates that the core format generalises beyond aviation, and because the
evidence chain below is genuinely well understood. Evidence in
[`../docs/RESEARCH-ARCHIVE.md`](../docs/RESEARCH-ARCHIVE.md).

## The gap, exactly

The **sample seal number** is the only thing linking the retained physical sample to the paper.

- It is a **"should"** in IMO guidance (MSC-MEPC.2/Circ.18 §8.2).
- It is **absent from MARPOL Appendix V entirely**.
- Gard's guidance records owners discovering the seal numbers were never written on the delivery
  note, *"which allows their validity to be disputed."*

So the physical evidence and the document are joined by a convention that nobody is obliged to
follow. When it is skipped, the sample becomes contestable — and it is contested by disputing
authenticity, never by disproving it.

## Binding

- `binds`: `seal_number`
- `to_document`: the bunker delivery note
- Recorded **at the moment the seal is applied**, in the presence of both parties, not reconstructed
  when a claim is filed.

## Assertion vocabulary (draft — needs practitioners)

| Assertion | Why it exists |
|---|---|
| `sample.drawn_at_manifold` | Sampling point is the most disputed fact in the chain |
| `sample.method_continuous_drip` | The exact assertion an officer once made inadvertently and wrongly |
| `sample.witnessed_by_counterparty` | Distinguishes joint from supplier-only sampling |
| `seal.applied_in_presence` | Binds the physical seal to a witnessed moment |
| `seal.number_recorded_on_bdn` | Records the presence or **absence** of the thing that is currently optional |

`not_observed` matters as much as `observed`. A vessel officer who did not witness barge-side
stowage should be able to say so without weakening what they did witness.

## Time bars — the real forcing function

| Clock | Typical limit |
|---|---|
| Quantity claim | 14 days |
| Quality claim | 30 days (some supplier terms 7) |
| Arbitration | 12 months |

Claims demonstrably die on these, because lab turnaround plus couriering a bottle off a ship that has
already sailed exceeds the bar.

**This suggests the product is speed of evidence, not authenticity.** A binding recorded at delivery,
portable immediately, is worth more here than a provenance story.

## Reuse, do not reinvent

Start from the **IMO Compendium eBDN data set** — free, open, roughly 60 elements, UN/LOCODE and
ISO 3166, and it **already carries a sample seal number field**. Verify that field's semantics before
designing anything parallel.

Do **not** build on **SS 709:2024** (paywalled, ~USD 77, Singapore-specific).

## What this profile must answer

**"Why not MPA's registry?"** MPA Singapore has mandated e-BDN since 1 April 2025, whitelists six
vendors, and runs its own central verification facility.

The honest answer: **MPA's register is port-scoped and does not federate.** It cannot vouch for a
delivery in Rotterdam, Fujairah or Houston. That non-federation is the whole opening — and it is the
trust list problem in miniature, since no port authority can run the register for the others.

Anything built here **feeds** MPA rather than competing with it.

## Warnings specific to this profile

- **The incumbent lab holds the customer.** VPS holds the P&I club contracts *and* absorbed
  BunkerTrace into its own product by November 2021. Any plan must state its relationship to VPS
  explicitly — adopter, complement, or competitor — and "we hadn't thought about it" is not one.
- **The buyer is not the party who does the work.** Owners and charterers want the evidence;
  suppliers must apply the seal and record the number. This split incentive is transferable and it
  helped kill the last attempt.
- **Do not claim ships are offline.** 68,528 commercial vessels were on LEO as of Q1 2026, and
  bunkering happens at berth or anchorage, never mid-ocean. The durable argument is **longevity** —
  three-year MARPOL retention, nine-year litigation — not connectivity.
- **A cheap physical seal already won** on cost against a high-tech tracer. This profile strengthens
  that seal; it must never try to replace it.
