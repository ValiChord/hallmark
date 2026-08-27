# Head-to-head: marine bunker fuel vs aviation parts

**Written 2026-08-27, from five parallel sweeps. Sources and caveats in files 01–05.**

## The headline

**The two candidates swapped places on the reason that mattered.**

The original report preferred bunker fuel mainly because *"P&I clubs are mutuals — the one institutional form that can legitimately hold shared infrastructure, which is the answer to the failure mode that killed TradeLens."* **That argument did not survive verification.** Meanwhile aviation's argument — a gap published by the buyers themselves and assigned to nobody — verified clean.

## Scorecard, revised against evidence

| Criterion | Bunker fuel: was → now | Aviation parts: was → now |
|---|---|---|
| N=2 value | yes → **yes** | yes → **yes** |
| Forcing function | medium → **medium/strong** (time bars) | weak → **weak, confirmed** |
| No possible operator | yes → **contested** | proven → **confirmed open** |
| Low sensitivity | yes → **yes** | yes → **yes** |
| Buyer with budget | mutuals, strong → **downgraded** | yes → **medium, uncommitted** |
| Ceri's edge | strong → **strong** | partial → **partial, but reachable gap** |

## What changed, and why

### Bunker fuel: three downgrades and one upgrade

**DOWNGRADE 1 — the P&I mutual lever does not transfer.** The International Group's electronic bill-of-lading approval works *only* because Club Rules **exclude cover** for unapproved systems. There is no analogous cover exclusion for bunker evidence. Worse: bunker claims sit far below the **US$10m pool attachment**, so they are single-club retained losses with **no Group-level pressure to fund anything**. The June 2026 eBL interoperability template — the report's closest thing to a blueprint — **does not apply here**.

**DOWNGRADE 2 — the budget exists but is committed, to a different product.** Two of twelve IG clubs pay **VPS (Veritas Petroleum Services)** for fuel quality data given free to members: NorthStandard "NS Fuel Insights" (10 Sep 2024) and West P&I "Bunker Fuel Advisory" (live Dec 2020, renewed 26 Sep 2024). It is recurring Loss Prevention spend. But what they buy is **predictive port-risk analytics**, not per-delivery attestation. VPS wins on lab network and dataset — a format does not displace that.

**DOWNGRADE 3 — a regulator runs the register.** MPA Singapore: e-BDN mandatory since **1 April 2025**, national standard **SS 709:2024**, only **six whitelisted vendors** may issue, and MPA operates a **central verification facility** on digitalPORT@SG. EMSA hosts the EU FuelEU database. Any pitch must answer *"why not MPA's registry?"*

**UPGRADE — the forcing function is better than scored.** Time bars: **14 days quantity, 30 days quality** (some supplier terms 7), arbitration 12 months. Claims demonstrably die because lab turnaround plus couriering a bottle off a sailed ship exceeds the bar. **Speed of evidence, not authenticity, may be the real product.**

### Aviation: one confirmation and one honest weakness

**CONFIRMED — Recommendation #9 still has no owner** (checked 2026-08-27). The coalition page lists none; the 25 Sep 2025 progress report covers only the five short-term items and is silent on #9; **nothing published in 2026 at all**. EASA's VIRTUA blockchain study concluded Sep 2024 that regulators must issue guidelines first — they looked and stepped back. No regulator system of record.

**WEAKNESS CONFIRMED — all 13 recommendations are explicitly VOLUNTARY**, and "long term" is defined as **over 5 years**. No mandate. The survivor pattern says mandate is what makes these succeed. Aviation's forcing-function score of "weak" was correct.

**Sharper version of the 2009 card:** the first electronic 8130-3 was issued **October 2025** (Boeing 737 battery to Southwest). **A 16-year gap between legally valid and first used.** But it is moving now, and the eARC working group is a named owner — for Recommendation **#5**, not #9.

## The convergence worth noticing

**Both domains are missing the same thing:** a checkable binding between a *physical artefact* and a *document*, verifiable by a stranger years later.

- **Bunker:** the **sample seal number** is the only link between the retained physical sample and the paper. Gard: owners find seal numbers were never written on the BDN, *"which allows their validity to be disputed."* It is a **"should"** in IMO guidance (MSC-MEPC.2/Circ.18 §8.2) and **absent from MARPOL Appendix V entirely**.
- **Aviation:** back-to-birth documentation, bound to the part.

This supports **one format, two beachheads** — and it is the strongest argument found for the project existing at all.

**Reuse hook:** the **IMO Compendium eBDN data set** is free, open, roughly 60 elements, and **already carries the sample seal number**. Extend that, not the paywalled SS 709.

## Hard truths to carry forward

1. **Forgery is not the problem — in either domain.** Across every documented bunker dispute read: not one turned on a forged signature. Failures are **omission, entitlement, inconsistency, and contractual fiat**. Good news (verifiable credentials don't solve it) and a warning (don't pitch anti-forgery).

2. **Cryptography cannot fix the core case.** UK Defence Club: a Chief Officer *"inadvertently certified"* samples as continuous-drip when they were not. Real person, real signature, wrong assertion. A format can scope and timestamp a claim; it cannot make it true. This is the artifact's *"records are not inspections"* caveat, landing hard.

3. **A close predecessor died.** **BunkerTrace Ltd** (UK company 12101569) — DNA tracers plus blockchain for marine fuel chain of custody, backed by **Lloyd's Register FOBAS, BIMCO and IBIA** — is in liquidation. Standards-body endorsement was not enough. **Read its Companies House insolvency filings — cheapest possible way to learn why this shape fails.**

4. **"Ships are offline" is false.** 68,528 commercial vessels on LEO as of Q1 2026. Bunkering happens at **berth or anchorage**, never mid-ocean. **Drop the "mid-ocean at 3am" line entirely.**
   - *Surviving narrow version:* Starlink is illegal in Chinese territorial waters and **Zhoushan (world #3 bunker port) requires it switched off while bunkering**; IACS UR E26/E27 require OT networks segregated from crew internet, so "the ship has Starlink" does not mean the document system may use it.
   - *Caveat, mine and not the sweep's:* this shows connectivity cannot be **assumed** at the moment of signing — not that the ship is offline. She may have Chinese providers or shore GSM. Pin this down before relying on it.
   - *Durable version:* **longevity, not connectivity.** MARPOL Reg 18 requires the BDN aboard and inspectable for **3 years**; OW Bunker litigation ran **9 years**.

5. **No arbitration record exists.** LMAA and SCMA bunker awards are confidential. The evidence base is structurally hidden.

## Figures that are dead — do not repeat

| Figure | Reality |
|---|---|
| ~2% of aviation parts unapproved | Orphan. Absent from DOT OIG audit AV2017049, which says the FAA lacks the information to know the magnitude. Likely 1990s vintage. |
| $7.5bn counterfeit cost | SIA circa 2011-12, **lost revenue to US semiconductor firms** — not aviation, and not a cost. |
| $545,000 per bunker claim / $5bn fuel fraud | Traces to **FuelTrust**, a Houston blockchain fuel-provenance startup — i.e. **a competitor** — via sponsored content, citing no named club or study. |
| $650k / $1.2m bunker claim averages | **Swedish Club all-cause machinery** figures (734 claims 2015-17), where fuel ranks only **third** as a cause. Laundered into bunker-specific claims. |
| "+50% bunker claims 2026" | **HOLDS, with caveat.** Origin is **Gard — a club, not a vendor**: >70 claims Jan–May 2026, VLSFO >85%, Singapore/Houston/ARA. But it is one club's unaudited five-month internal count (~47 to 70), not normalised for book growth. Secondary outlets are echo, not corroboration. |

## The honest tension

- **Aviation wins on structure.** The opening is verified open, unowned, and no regulator is moving in.
- **Bunker wins on reachability.** It gives **named people to call** — Colin Gillespie (Global Head of Loss Prevention, NorthStandard) and Dmitry Kisil (Senior LP Officer, West P&I) — plus Ceri's own domain standing. Aviation gives none.

The original report's 90-day list says: *"Find the two parties. If you cannot name them, the N=2 test has already failed."* **Bunker passes that test today; aviation does not.**

Given that conversion, not construction, is the standing bottleneck, that asymmetry may matter more than the structural one. **This is not a decision — it is Ceri's call.**

## Cheapest next actions, in order

1. **Download the coalition's Sept 2025 progress report PDF** (email-gated). Most likely place an owner for #9 would appear. Decides the aviation option.
2. **Read BunkerTrace's Companies House insolvency filings** (UK 12101569). Free, and decides a lot.
3. **Call one P&I loss-prevention contact.** Ask what a binding-sample dispute costs them to defend — because **no credible public figure exists**, and that absence is itself the finding.
4. **Get the IMO Compendium eBDN data set** and check the seal-number field.
5. **Lawyer on the anchoring pattern** — peer validation plus qualified timestamp — before any code.

## Unread, access-blocked, worth manual retry

West P&I *Bunker Quality Disputes Part 2* PDF (highest-value unread); igpandi.org (403 throughout); UKDC guide PDF; ISO 8217 and ISO 13739 (paywalled); SS 709:2024 (paywalled, ~USD 77); SAE **AIR7123** blockchain-ARC work in progress; two quotes (Britannia P&I, ZeroNorth/SIBCON) came from search snippets after 403s — **verify before external use**.

---

# UPDATE: BunkerTrace post-mortem (file 06)

**Verdict: mostly model-specific, but one transferable cause is serious.**

## Would NOT hit a format (model-specific)
Physical DNA tracer dosed into fuel at supply points; detection hardware in labs; ~$1-3 per tonne
recurring on a commodity (search-extracted, verify); ran a ledger and app on ~$1.65M seed; and value
required EVERY upstream hop instrumented, so two willing parties alone got nothing. A format has
none of these properties.

## WOULD hit a format (transferable) - take these seriously
1. **The incumbent testing lab took the customer.** By Nov 2021 BunkerTrace was no longer selling to
   shipowners - it had become a component inside **VPS's own "Sample Assurance" product**. Note the
   convergence with file 01: VPS also holds the P&I club contracts. **VPS is the choke point in this
   market, and it absorbed the innovator.**
2. **Split incentive.** Buyers (owners/charterers) want the evidence; suppliers must do the work.
3. **No mandate ever arrived.**
4. **Endorsement never converted.**

## The number that should govern the decision
**Micro-entity accounts every single year of its life** - including the years it was in trials with
**bp, Chevron, Hapag-Lloyd and ONE**. It never became a revenue business. CVL resolution 12 Mar 2025,
dissolved 2 Mar 2026, **no administration** - so no rescue or trade sale was even attempted.

**This directly deflates the "reachability" advantage awarded to bunker fuel above.** BunkerTrace had
maximum reachability in this exact market - blue-chip trials, LR/BIMCO/IBIA association - and
converted none of it. **Access to named people is not the same as a buyer.** Adjust the head-to-head
accordingly: bunker's one clear win over aviation is weaker than it looked this morning.

## On the standards-body endorsements
FOBAS, BIMCO and IBIA were members of a **grant-funded consortium to evaluate** blockchain
chain-of-custody. **Not customers.** Two are trade associations with no fuel to buy. Treat any future
"backed by X standards body" as a signal of nothing until money moves.

## The corporate shape
A JV between BLOC (a Lloyd's Register Foundation-funded demonstrator) and Forecast Technology (the
tracer). **Three directors resigned on the same day, 12 Nov 2020, thirteen months after launch** -
the JV came apart before the company did. Three funding rounds, all before Dec 2021, then a
39-month drought.

## The genuinely encouraging find
In the GCMD 2022-24 trials BunkerTrace was one of four competing methods - and one rival was
**"lock-and-seal"**, a cheap tamper-evident physical substitute. A low-tech seal beat the
high-tech tracer on cost.

**That is an argument FOR the narrow format, not against it.** The seal is the cheap winner, and the
documented gap (file 02) is that **the seal number is not reliably bound to the paper** - a "should"
in IMO guidance, absent from MARPOL Appendix V. A format that binds a seal number to a certificate
**strengthens the method that won** rather than competing with it, and costs nothing per tonne.

## Not obtained
The **Statement of Affairs PDF** (Companies House redirects to signed S3; the fetcher would not
follow) - so no creditor totals or deficiency figure. **Free to retrieve in a browser; highest-value
remaining document.** Ship & Bunker 403'd, so the $1-3/tonne pricing is search-extraction, not read.
No public post-mortem exists at all.
