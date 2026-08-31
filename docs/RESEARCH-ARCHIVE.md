# Research archive

**Historical record. Not a guide to the current project.**

This is the market research that ran from 27 August to 1 September 2026 and ended in the
decision to build for aviation parts. It is preserved whole, unedited, because the reasoning
matters and because several of its findings are the reason particular doors are closed. It is
**not** maintained, and parts of it are superseded by the repository it produced.

For what the project actually is now, read [`../README.md`](../README.md).

## How to read it, and what to distrust

- **Section 04 of the head-to-head came from a researcher with no web access.** Its reasoning is
  the most valuable thing in the archive and its facts are recollections. Every date and figure
  in it is a lead to check, not a finding.
- **Four circulating figures are dead** and must not be repeated: that ~2% of aviation parts are
  unapproved; that counterfeits cost the electronics industry $7.5bn a year; that a bunker claim
  costs $545,000; and the $5bn fuel-fraud number. The first two trace to nothing, the last two to
  a competitor's sponsored content. The "+50% bunker claims in 2026" figure does hold up — its
  origin is Gard, a P&I club rather than a vendor — but it is one club's unaudited five-month
  internal count.
- **The marine bunker fuel case was researched in more depth than aviation** and is still the
  better-documented half of this archive. That is a fact about the research, not about the
  decision. See `../profiles/bunker-sample-seal.md`.
- **Where a claim here contradicts the technical documentation, the technical documentation wins.**
  This archive predates any working code.

## Contents

1. Head-to-head synthesis — the comparison that produced the decision
2. P&I claims economics — is there a buyer with a budget
3. The bunker dispute evidence chain — what is signed, by whom, and where it fails
4. Fleet connectivity — whether the offline argument survives
5. Incumbents and occupancy — who is already there
6. The aviation comparator — Recommendation #9 and its status
7. BunkerTrace post-mortem — why the closest predecessor died





---

<!-- archived from research/00-head-to-head.md -->

## Head-to-head: marine bunker fuel vs aviation parts

**Written 2026-08-27, from five parallel sweeps. Sources and caveats in files 01–05.**

### The headline

**The two candidates swapped places on the reason that mattered.**

The original report preferred bunker fuel mainly because *"P&I clubs are mutuals — the one institutional form that can legitimately hold shared infrastructure, which is the answer to the failure mode that killed TradeLens."* **That argument did not survive verification.** Meanwhile aviation's argument — a gap published by the buyers themselves and assigned to nobody — verified clean.

### Scorecard, revised against evidence

| Criterion | Bunker fuel: was → now | Aviation parts: was → now |
|---|---|---|
| N=2 value | yes → **yes** | yes → **yes** |
| Forcing function | medium → **medium/strong** (time bars) | weak → **weak, confirmed** |
| No possible operator | yes → **contested** | proven → **confirmed open** |
| Low sensitivity | yes → **yes** | yes → **yes** |
| Buyer with budget | mutuals, strong → **downgraded** | yes → **medium, uncommitted** |
| Ceri's edge | strong → **strong** | partial → **partial, but reachable gap** |

### What changed, and why

#### Bunker fuel: three downgrades and one upgrade

**DOWNGRADE 1 — the P&I mutual lever does not transfer.** The International Group's electronic bill-of-lading approval works *only* because Club Rules **exclude cover** for unapproved systems. There is no analogous cover exclusion for bunker evidence. Worse: bunker claims sit far below the **US$10m pool attachment**, so they are single-club retained losses with **no Group-level pressure to fund anything**. The June 2026 eBL interoperability template — the report's closest thing to a blueprint — **does not apply here**.

**DOWNGRADE 2 — the budget exists but is committed, to a different product.** Two of twelve IG clubs pay **VPS (Veritas Petroleum Services)** for fuel quality data given free to members: NorthStandard "NS Fuel Insights" (10 Sep 2024) and West P&I "Bunker Fuel Advisory" (live Dec 2020, renewed 26 Sep 2024). It is recurring Loss Prevention spend. But what they buy is **predictive port-risk analytics**, not per-delivery attestation. VPS wins on lab network and dataset — a format does not displace that.

**DOWNGRADE 3 — a regulator runs the register.** MPA Singapore: e-BDN mandatory since **1 April 2025**, national standard **SS 709:2024**, only **six whitelisted vendors** may issue, and MPA operates a **central verification facility** on digitalPORT@SG. EMSA hosts the EU FuelEU database. Any pitch must answer *"why not MPA's registry?"*

**UPGRADE — the forcing function is better than scored.** Time bars: **14 days quantity, 30 days quality** (some supplier terms 7), arbitration 12 months. Claims demonstrably die because lab turnaround plus couriering a bottle off a sailed ship exceeds the bar. **Speed of evidence, not authenticity, may be the real product.**

#### Aviation: one confirmation and one honest weakness

**CONFIRMED — Recommendation #9 still has no owner** (checked 2026-08-27). The coalition page lists none; the 25 Sep 2025 progress report covers only the five short-term items and is silent on #9; **nothing published in 2026 at all**. EASA's VIRTUA blockchain study concluded Sep 2024 that regulators must issue guidelines first — they looked and stepped back. No regulator system of record.

**WEAKNESS CONFIRMED — all 13 recommendations are explicitly VOLUNTARY**, and "long term" is defined as **over 5 years**. No mandate. The survivor pattern says mandate is what makes these succeed. Aviation's forcing-function score of "weak" was correct.

**Sharper version of the 2009 card:** the first electronic 8130-3 was issued **October 2025** (Boeing 737 battery to Southwest). **A 16-year gap between legally valid and first used.** But it is moving now, and the eARC working group is a named owner — for Recommendation **#5**, not #9.

### The convergence worth noticing

**Both domains are missing the same thing:** a checkable binding between a *physical artefact* and a *document*, verifiable by a stranger years later.

- **Bunker:** the **sample seal number** is the only link between the retained physical sample and the paper. Gard: owners find seal numbers were never written on the BDN, *"which allows their validity to be disputed."* It is a **"should"** in IMO guidance (MSC-MEPC.2/Circ.18 §8.2) and **absent from MARPOL Appendix V entirely**.
- **Aviation:** back-to-birth documentation, bound to the part.

This supports **one format, two beachheads** — and it is the strongest argument found for the project existing at all.

**Reuse hook:** the **IMO Compendium eBDN data set** is free, open, roughly 60 elements, and **already carries the sample seal number**. Extend that, not the paywalled SS 709.

### Hard truths to carry forward

1. **Forgery is not the problem — in either domain.** Across every documented bunker dispute read: not one turned on a forged signature. Failures are **omission, entitlement, inconsistency, and contractual fiat**. Good news (verifiable credentials don't solve it) and a warning (don't pitch anti-forgery).

2. **Cryptography cannot fix the core case.** UK Defence Club: a Chief Officer *"inadvertently certified"* samples as continuous-drip when they were not. Real person, real signature, wrong assertion. A format can scope and timestamp a claim; it cannot make it true. This is the artifact's *"records are not inspections"* caveat, landing hard.

3. **A close predecessor died.** **BunkerTrace Ltd** (UK company 12101569) — DNA tracers plus blockchain for marine fuel chain of custody, backed by **Lloyd's Register FOBAS, BIMCO and IBIA** — is in liquidation. Standards-body endorsement was not enough. **Read its Companies House insolvency filings — cheapest possible way to learn why this shape fails.**

4. **"Ships are offline" is false.** 68,528 commercial vessels on LEO as of Q1 2026. Bunkering happens at **berth or anchorage**, never mid-ocean. **Drop the "mid-ocean at 3am" line entirely.**
   - *Surviving narrow version:* Starlink is illegal in Chinese territorial waters and **Zhoushan (world #3 bunker port) requires it switched off while bunkering**; IACS UR E26/E27 require OT networks segregated from crew internet, so "the ship has Starlink" does not mean the document system may use it.
   - *Caveat, mine and not the sweep's:* this shows connectivity cannot be **assumed** at the moment of signing — not that the ship is offline. She may have Chinese providers or shore GSM. Pin this down before relying on it.
   - *Durable version:* **longevity, not connectivity.** MARPOL Reg 18 requires the BDN aboard and inspectable for **3 years**; OW Bunker litigation ran **9 years**.

5. **No arbitration record exists.** LMAA and SCMA bunker awards are confidential. The evidence base is structurally hidden.

### Figures that are dead — do not repeat

| Figure | Reality |
|---|---|
| ~2% of aviation parts unapproved | Orphan. Absent from DOT OIG audit AV2017049, which says the FAA lacks the information to know the magnitude. Likely 1990s vintage. |
| $7.5bn counterfeit cost | SIA circa 2011-12, **lost revenue to US semiconductor firms** — not aviation, and not a cost. |
| $545,000 per bunker claim / $5bn fuel fraud | Traces to **FuelTrust**, a Houston blockchain fuel-provenance startup — i.e. **a competitor** — via sponsored content, citing no named club or study. |
| $650k / $1.2m bunker claim averages | **Swedish Club all-cause machinery** figures (734 claims 2015-17), where fuel ranks only **third** as a cause. Laundered into bunker-specific claims. |
| "+50% bunker claims 2026" | **HOLDS, with caveat.** Origin is **Gard — a club, not a vendor**: >70 claims Jan–May 2026, VLSFO >85%, Singapore/Houston/ARA. But it is one club's unaudited five-month internal count (~47 to 70), not normalised for book growth. Secondary outlets are echo, not corroboration. |

### The honest tension

- **Aviation wins on structure.** The opening is verified open, unowned, and no regulator is moving in.
- **Bunker wins on reachability.** It gives **named people to call** — Colin Gillespie (Global Head of Loss Prevention, NorthStandard) and Dmitry Kisil (Senior LP Officer, West P&I) — plus Ceri's own domain standing. Aviation gives none.

The original report's 90-day list says: *"Find the two parties. If you cannot name them, the N=2 test has already failed."* **Bunker passes that test today; aviation does not.**

Given that conversion, not construction, is the standing bottleneck, that asymmetry may matter more than the structural one. **This is not a decision — it is Ceri's call.**

### Cheapest next actions, in order

1. **Download the coalition's Sept 2025 progress report PDF** (email-gated). Most likely place an owner for #9 would appear. Decides the aviation option.
2. **Read BunkerTrace's Companies House insolvency filings** (UK 12101569). Free, and decides a lot.
3. **Call one P&I loss-prevention contact.** Ask what a binding-sample dispute costs them to defend — because **no credible public figure exists**, and that absence is itself the finding.
4. **Get the IMO Compendium eBDN data set** and check the seal-number field.
5. **Lawyer on the anchoring pattern** — peer validation plus qualified timestamp — before any code.

### Unread, access-blocked, worth manual retry

West P&I *Bunker Quality Disputes Part 2* PDF (highest-value unread); igpandi.org (403 throughout); UKDC guide PDF; ISO 8217 and ISO 13739 (paywalled); SS 709:2024 (paywalled, ~USD 77); SAE **AIR7123** blockchain-ARC work in progress; two quotes (Britannia P&I, ZeroNorth/SIBCON) came from search snippets after 403s — **verify before external use**.

---

## UPDATE: BunkerTrace post-mortem (file 06)

**Verdict: mostly model-specific, but one transferable cause is serious.**

### Would NOT hit a format (model-specific)
Physical DNA tracer dosed into fuel at supply points; detection hardware in labs; ~$1-3 per tonne
recurring on a commodity (search-extracted, verify); ran a ledger and app on ~$1.65M seed; and value
required EVERY upstream hop instrumented, so two willing parties alone got nothing. A format has
none of these properties.

### WOULD hit a format (transferable) - take these seriously
1. **The incumbent testing lab took the customer.** By Nov 2021 BunkerTrace was no longer selling to
   shipowners - it had become a component inside **VPS's own "Sample Assurance" product**. Note the
   convergence with file 01: VPS also holds the P&I club contracts. **VPS is the choke point in this
   market, and it absorbed the innovator.**
2. **Split incentive.** Buyers (owners/charterers) want the evidence; suppliers must do the work.
3. **No mandate ever arrived.**
4. **Endorsement never converted.**

### The number that should govern the decision
**Micro-entity accounts every single year of its life** - including the years it was in trials with
**bp, Chevron, Hapag-Lloyd and ONE**. It never became a revenue business. CVL resolution 12 Mar 2025,
dissolved 2 Mar 2026, **no administration** - so no rescue or trade sale was even attempted.

**This directly deflates the "reachability" advantage awarded to bunker fuel above.** BunkerTrace had
maximum reachability in this exact market - blue-chip trials, LR/BIMCO/IBIA association - and
converted none of it. **Access to named people is not the same as a buyer.** Adjust the head-to-head
accordingly: bunker's one clear win over aviation is weaker than it looked this morning.

### On the standards-body endorsements
FOBAS, BIMCO and IBIA were members of a **grant-funded consortium to evaluate** blockchain
chain-of-custody. **Not customers.** Two are trade associations with no fuel to buy. Treat any future
"backed by X standards body" as a signal of nothing until money moves.

### The corporate shape
A JV between BLOC (a Lloyd's Register Foundation-funded demonstrator) and Forecast Technology (the
tracer). **Three directors resigned on the same day, 12 Nov 2020, thirteen months after launch** -
the JV came apart before the company did. Three funding rounds, all before Dec 2021, then a
39-month drought.

### The genuinely encouraging find
In the GCMD 2022-24 trials BunkerTrace was one of four competing methods - and one rival was
**"lock-and-seal"**, a cheap tamper-evident physical substitute. A low-tech seal beat the
high-tech tracer on cost.

**That is an argument FOR the narrow format, not against it.** The seal is the cheap winner, and the
documented gap (file 02) is that **the seal number is not reliably bound to the paper** - a "should"
in IMO guidance, absent from MARPOL Appendix V. A format that binds a seal number to a certificate
**strengthens the method that won** rather than competing with it, and costs nothing per tonne.

### Not obtained
The **Statement of Affairs PDF** (Companies House redirects to signed S3; the fetcher would not
follow) - so no creditor totals or deficiency figure. **Free to retrieve in a browser; highest-value
remaining document.** Ship & Bunker 403'd, so the $1-3/tonne pricing is search-extraction, not read.
No public post-mortem exists at all.


---

<!-- archived from research/01-pi-claims-economics.md -->

## P&I Club Claims Economics — Bunker Fuel Quality Evidence

**Sweep:** 01 — Is there a buyer with a budget and a real pain?
**Date:** 2026-08-27
**Status:** COMPLETE (see "Gaps, dead ends and limits" for what could not be read)

Conventions: every finding marked [VERIFIED] (I read the source) or [UNVERIFIED]
(inference or recollection). Vendor/consultancy/press-release sources are labelled
explicitly as such.

---

### 1. Size of the bunker/fuel-quality claims problem

#### The "~50% rise in bunker claims in 2026" claim — PROVENANCE RESOLVED

**[VERIFIED]** The claim originates from **Gard** — which is itself a P&I club
(Assuranceforeningen Gard / Gard P&I Bermuda, an International Group member), not a
vendor or consultancy. This is therefore a **first-party insurer statement**, the
strongest available class of source short of audited accounts.

Source: Gard, "Beyond Specification: Bunker Claims Insights, Early 2026",
published **19 June 2026**. Authors: Siddharth Mahajan (Team Leader, Loss Prevention
Asia), Bruce Liu (Loss Prevention Executive), Kaili Ang (Senior Lawyer).
https://www.gard.no/en/insights/beyond-specification-bunker-claims-insights-early-2026/

Figures as stated by Gard:
- **>70 bunker-related claims** handled Jan–May 2026 [VERIFIED]
- **+50% vs. same period 2025** [VERIFIED]
- **Almost all involved fuel quality** [VERIFIED]
- **VLSFO = vast majority / >85%** of bunker-quality claims [VERIFIED via Gard +
  Ship & Bunker restatement]
- Hubs: **Singapore, Houston, ARA** [VERIFIED]
- "A significant proportion of cases involved fuels that **met ISO 8217 Table 2
  parameters but still caused operational issues and damage to machinery**"
  [VERIFIED — direct quote from Gard]
- Several vessels **disabled or required towage**; no major casualties in dataset
  [VERIFIED]
- Pattern sharpened after **Middle East conflict escalation, late Feb 2026**
  [VERIFIED]

**Important caveat on the 50% figure:** it is **one club's own claim count over a
5-month window**, base of ~47 → ~70. It is NOT an industry-wide statistic, NOT
audited, and NOT normalised for Gard's book growth or entered tonnage. Every
secondary outlet repeating "bunker claims up 50%" as an *industry* figure is
over-generalising a single club's internal count.

Secondary restatements (all trace to the same Gard release — treat as ECHO, not
corroboration):
- Ship & Bunker: https://shipandbunker.com/news/world/300464-maritime-insurer-gard-saw-50-increase-in-bunker-claims-in-early-2026
- Manifold Times: https://www.manifoldtimes.com/news/fuel-quality-issues-drive-50-rise-in-bunker-claims-says-gard/
- SAFETY4SEA: https://safety4sea.com/gard-club-bunker-claims-surge-50-as-fuel-quality-risks-grow/
- IIMS: https://www.iims.org.uk/bunker-claims-surge-50-as-concerns-over-fuel-quality-risks-grow/
- Hellenic Shipping News: https://www.hellenicshippingnews.com/beyond-specification-bunker-claims-insights-early-2026/

#### Off-spec rate

**[UNVERIFIED — needs primary check]** Off-spec rate against ISO 8217 reportedly rose
to **8.5% in 2026 from 6.8% in 2025**. Surfaced in search summary of the Gard piece;
figure of this type normally originates with **fuel-testing vendors (VPS, Veritas
Petroleum Services / Bureau Veritas / FOBAS)** — i.e. VENDOR-SOURCED. Needs direct
confirmation of who measured it.

**[UNVERIFIED]** "Bunker alerts surge to 29 in first seven months of 2026" —
marineinsight.com. Bunker alerts are issued by **fuel testing vendors (VPS)**, so
VENDOR-SOURCED. https://www.marineinsight.com/marine-fuel-quality-worsens-as-bunker-alerts-surge-to-29-in-first-seven-months-of-2026/

### 2. Cost and duration of a single bunker quality dispute

#### The circulating dollar figures — traced, and mostly NOT what they appear to be

**[VERIFIED — provenance trace] The "$545,000 average repair" and "$5 billion of annual
fuel fraud" figures are VENDOR-SOURCED and unattributed.** Both trace to **FuelTrust**,
a Houston-based AI/blockchain startup in the fuel-provenance space (co-founder Darren
Shelton), via a sponsored/vendor content piece carried by the Greater Houston Port
Bureau. The article says only "Studies from the Protection and Indemnity (P&I) clubs
indicate that 42% of claims are categorized as 'machinery', of which 16% are due to main
engine damage caused by off-spec bunkers, which cost $545,000 on average" — **no club
named, no study named, no date.** Treat as marketing.
https://www.txgulf.org/news/maritime-fuel-market-fraud-could-be-costing-5-billion-each-year-

⚠️ **Note for the founder: FuelTrust is an existing competitor** selling blockchain fuel
provenance/"digital chemistry" into exactly this gap, and is the origin of the
market-sizing numbers now circulating as if they were club data.

**[VERIFIED — the real, citable club numbers] The Swedish Club** (IG member; H&M and P&I)
machinery claims study, **734 machinery claims over 2015–2017 totalling USD 384 million**:
- **Main engine damage USD 131m** = **16% of the cost of all H&M claims** and **34% of
  all machinery claims**
- **Average main engine claim ≈ USD 650,000**, up 21%
- **Crankshaft/bearing** = most expensive damaged part, **≈ USD 1.2m average**
- Causes ranked: **(1) lubrication failure, (2) incorrect maintenance/repairs,
  (3) poor fuel management**
https://www.swedishclub.com/loss-prevention/ship/machinery/
https://www.marinelog.com/news/average-main-engine-damage-claim-tops-500000/
(Figures VERIFIED via search index of Swedish Club/Marine Log reporting; the underlying
Swedish Club PDF NOT read directly — treat exact wording as UNVERIFIED.)

**Critical correction:** the widely-quoted "$650,000" and "$1.2m" are the Swedish Club's
**all-cause main engine** and **crankshaft/bearing** averages. They are **NOT
bunker-quality claim averages.** Fuel is only the *third* ranked cause. Anyone quoting
$650k as "the cost of a bunker claim" has laundered a general machinery statistic.

#### Hard bunker-specific cost/duration numbers: NOT FOUND. Biggest gap in the sweep.

**[VERIFIED — negative finding]** After reading club loss-prevention guides (West P&I
Parts 1 & 2), law-firm commentary (Clyde & Co) and a club case note (Steamship Mutual),
**none publishes an average defence cost or an average dispute duration for bunker
quality claims.** Clyde & Co's piece "offers no cost estimates for litigation or
arbitration" and gives no time-bar or duration data. Clubs publish claim *counts* and
*causes*, not *unit economics*. Assume any per-claim dollar figure circulating in the
market is vendor marketing until traced.

#### What IS established about the cost structure

**[VERIFIED]** The English-law claim is a **two-hurdle** structure, and hurdle two is
where money burns (Clyde & Co, Jan 2020):
1. "Owners will need to prove that Charterers supplied bunkers to the vessel which were
   in breach of their obligations"
2. "Owners will need to prove that the fuel supplied by Charterers **caused** the engine
   damage alleged" — and owners "often experience difficulties discharging the burden of
   proof in relation to this second hurdle."
https://www.clydeco.com/en/insights/2020/01/bunker-quality-claims-in-2020-issues-to-consider

**[VERIFIED]** The failure mode is explicitly evidential, not legal:
"If, following tests on samples, Owners are unable to identify a contaminant in the fuel
supplied by Charterers, it will likely be difficult for Owners to discharge the burden
of (i) showing that the fuel supplied was off-specification and (ii) that the fuel was
the cause of the alleged engine damage." (Clyde & Co) [VERIFIED]

**[VERIFIED]** Standard charterer defences that force cost onto the owner: previous
charterparty's fuel caused it; owner's engine-maintenance negligence; incompatible fuels
mixed and destabilised; owner's fuel-management procedures. Each defence expands
disclosure and expert scope — this is the cost driver. (Clyde & Co)

**[VERIFIED]** Steamship Mutual (P&I club), "Bunker Wars – The Burden of Proof Strikes
Back!", 1 Sept 2007: describes two LMAA arbitrations from the author's own practice.
In the second, owners claimed "huge damages for physical damage to the main engine and
consequential loss of time" and **lost outright**, the tribunal finding an "extremely
scant and dubious evidential basis". The article also notes settlements may reflect
**cost-avoidance rather than claim merit** — i.e. defence cost, not liability, drives
outcomes. No figures given.
https://www.steamshipmutual.com/publications/articles/bunkers0807

**[VERIFIED]** Fraud is an acknowledged live risk in the sample chain: "unscrupulous
bunker suppliers knowingly supply off-specification fuel to vessels, and attempt to mask
this through **providing false samples**." (Clyde & Co) — this is the strongest
statement found that the *provenance* of the sample, not the test, is the weak link.

**[VERIFIED]** Forum: English law + London (LMAA) arbitration is the most common
charterparty law/jurisdiction choice, so this is where the evidence standard is set.

#### Cost consequences named by clubs (qualitative)

**[VERIFIED]** West P&I lists: "Loss of time and expenses incurred if it is necessary to
de-bunker or deviate to stem fresh bunkers"; machinery breakdown remediation; cargo
delay claims and cargo deterioration liability. Claims land across **H&M**, **P&I**, and
**FD&D** simultaneously — which means **no single insurer internalises the whole cost**,
a structural obstacle to any one club funding a fix.

#### Record-retention periods (the de-facto evidence window)

**[VERIFIED — West P&I]**
- **MARPOL samples: minimum 12 months** retention
- **Bunker Delivery Notes: 3 years** retention
- Vessel's own samples: should follow similar protocols
These are the outer bounds any attestation format has to survive.

### 3. What evidence clubs and members say they WISH they had

Clubs are unusually explicit here. The consistent answer is **not more testing — it is
provable custody and identity of the sample**.

**[VERIFIED — West P&I, Bunker Quality Disputes Part 1]** Samples are "of crucial
importance". Requirements stated:
- representative sample drawn **at the receiving vessel's manifold** (the point of
  custody transfer) — explicitly *not* on the bunker barge
- **continuous drip sampling** throughout delivery
- **sealed containers with unique identity numbers**, seals **witnessed by both supplier
  and vessel representatives**
- seals **checked periodically during bunkering** and integrity **verified by all parties
  before breaking**
- label must carry **vessel IMO number, delivery date, sampling location, and signatures**
- primary sample shaken for homogeneity before splitting into sub-samples
- clean/preferably new sampling equipment and containers
- "Sending samples drawn during bunkering to be tested prior to use by a reputable third
  party laboratory is always advisable."
https://www.westpandi.com/news-and-resources/loss-prevention-bulletins/bunker-quality-disputes-part-1-practical-and-tech/

**[VERIFIED — industry/club guidance, aggregated]** The **sample seal number is written
onto the BDN** specifically so the chain of custody is unbroken from manifold to
laboratory; retained samples, chain-of-custody forms and seal numbers must be preserved
and securely stored. An **unsealed or unlabelled sample is effectively worthless** in a
dispute.

**[VERIFIED — Clyde & Co]** Beyond samples, the wished-for record set is: surveyor
inspection of engines, preserved damaged components, and **"log books, alarm records,
oil record books and maintenance records"** — i.e. a *time-correlated* record linking a
specific stem to a specific machinery event. This correlation, not the lab result, is
what tribunals actually want.

**[VERIFIED — UK Defence Club]** "preservation of evidence, including log books,
documents and samples is crucial ... as is the **early appointment of an expert**."
https://www.ukdefence.com/insights/september-2023-bunkers-a-guide-to-quality-and-quantity-claims-158727/

**[VERIFIED — Gard, June 2026]** Gard names the live contractual/evidential frictions as:
**binding-sample disputes**, **disagreements over which parameters get tested**,
**time bars**, and **evidentiary requirements**. "Binding sample disputes" is the
sharpest signal in this whole sweep: parties fight over *which physical sample counts*,
which is precisely an identity-and-custody problem, not a chemistry problem.

**[VERIFIED — Gard, June 2026]** "A significant proportion of cases involved fuels that
met ISO 8217 Table 2 parameters but still caused operational issues and damage to
machinery." Implication: a pass/fail certificate against the standard is **not the
evidence clubs need**. They need the full parameter record plus provenance.

### 4. Do P&I clubs / the International Group fund or endorse shared infrastructure?

#### YES — and the mechanism is stronger than funding: **cover is conditional on approval**

**[VERIFIED]** IG Club Rules provide that liabilities arising in respect of carriage of
cargo under **paperless trading systems are covered only if the system has first been
approved by the Group**. This is the single most important structural fact in this
sweep: the IG does not usually pay for infrastructure — it *gates insurance cover* on
use of approved infrastructure. That makes club approval a distribution mechanism, not
a revenue source.

Source (IG, blocked to automated fetch — HTTP 403 — but reproduced in member-club
circulars): https://www.igpandi.org/article/electronic-bills-of-lading-notification-of-new-process/
Member-club reproduction read in full:
**UK P&I Club Circular 04/25**, "Electronic Bills of Lading – Notification of new process"
https://www.ukpandi.com/news-and-resources/circulars/article/circular-04/25-electronic-bills-of-lading-notification-of-new-process/

#### How the approval mechanism actually works (as of 20 Feb 2025)

**[VERIFIED]** From **20 February 2025** the IG moved from case-by-case approval to a
**"deemed approved"** regime. A system is deemed approved if:

1. The system **permits compliant E-bills only** — i.e. they are "subject to a
   governing law which gives legal recognition to them as equivalent to paper bills of
   lading" (in practice: MLETR-aligned law, e.g. UK Electronic Trade Documents Act 2023,
   Singapore ETA); **and**
2. The system **is reliable and is evidenced as such**, demonstrated by one of three
   routes:
   - **independent audit**, or
   - **declaration by a supervisory, regulatory or accreditation body**, or
   - **applicable industry standards**.

**Who decides:** the International Group of P&I Clubs collectively (through the Group
Clubs / Group secretariat), not any single club. [VERIFIED]

**How long it takes:** under the new regime, effectively **self-certification** against
the two criteria — no formal Group review for systems meeting them. Providers who
approach the Group and meet the requirements are **listed on the Group's website**.
Clubs **no longer issue approval circulars**. [VERIFIED]

**Prior regime scale:** **13 systems approved since 2010**; those approvals remain
valid. [VERIFIED via UK P&I circular]
Known approved names include Bolero, essDOCS/ICE Digital Trade, edoxOnline, TradeLens
(now defunct), WAVE BL, CargoX, Secro, IQAX. [PARTIALLY VERIFIED — essDOCS/ICE and
edoxOnline confirmed by their own pages, which are VENDOR sources:
https://www.essdocs.com/company/industry-approvals ,
https://web.edoxonline.com/index.php/2020/07/15/international-group-of-pi-clubs-approves-edoxonline-electronic-bill-of-lading-system-supported-by-blockchain-technology/ ]

#### IG structure (context for "who has a budget")

**[VERIFIED]** The International Group is **12 clubs**, covering **~90% of the world's
ocean-going tonnage** and **~95% of tankers**. The **Pooling Agreement** shares claims
**above US$10 million** up to **approximately US$8.9 billion**.
https://www.igpandi.org/article/about/ (403 to automated fetch; figures corroborated
across multiple secondary sources — treat exact pool ceiling as [UNVERIFIED])
https://www.igpandi.org/article/group-agreements/

**Consequence for this thesis:** a typical bunker quality claim (six figures) sits far
**below the US$10m pool attachment point**. It is therefore a **single club's retained
loss**, never a Group-shared loss. That means:
- there is **no Group-level P&L pressure** to build shared bunker infrastructure, and
- the buyer is an **individual club** (or its FD&D arm), not the IG.
This is the key structural reason the e-bill of lading precedent does not transfer
cleanly. [ANALYSIS, grounded in the verified facts above]

#### Other shared-infrastructure precedents found

**[VERIFIED]** IG + IOPC Funds + ITOPF joint publication on liability and compensation
for ship-source oil pollution, produced with support from IMO, the Canadian Ship-source
Oil Pollution Fund and the US National Pollution Funds Center — the IG **co-produces
shared reference material**, not systems.
https://www.igpandi.org/article/joint-publication-liability-and-compensation/

**[VERIFIED]** IG issues **collective sanctions guidance** to all clubs' members
(e.g. Group response to US Government maritime sanctions guidance; "Sanctions – Recent
Deceptive Practices"). Again: guidance, not funded infrastructure.
https://www.igpandi.org/article/international-group-clubs-respond-us-government-sanctions-guidance-maritime-and-related-industries/

**[UNVERIFIED — search-index only]** Reference to "an interim solution to fund the
shortfall ... approved by all Clubs within the IG" in relation to a Britannia settlement
suggests the IG *can* collectively approve funding, but this is a claims-settlement
mechanism, not infrastructure investment. Not traced to a primary source.

#### Direct read-across to a bunker attestation format

The "criterion 2" route — **"applicable industry standards"** as an accepted evidence
of reliability — is the door an open attestation format would walk through. Note the IG
accepts a *standard* as a substitute for an audit. But note also the sharp limit:
**this mechanism exists because Club Rules exclude cover unless approved.** There is no
equivalent cover exclusion for bunker evidence, so there is no equivalent lever today.

### 5. Any club funding or endorsement in bunker quality evidence specifically?

#### YES — TWO clubs already pay for bunker fuel quality data. Both bought from the SAME vendor: VPS.

#### Precedent 1: **NorthStandard ← VPS**, "NS Fuel Insights", launched 10 Sept 2024

**[VERIFIED]** NorthStandard (the largest IG club by entered tonnage after the 2023
North of England / Standard Club merger) **licenses VPS PortStats** to power a member
platform called **NS Fuel Insights**, delivered inside its "Get SET!" digital portfolio
and **offered free of charge to members** (i.e. the club absorbs the cost).
Launched **10 September 2024**.
- NorthStandard press release (HTTP 403 to automated fetch):
  https://north-standard.com/insights-and-resources/resources/press-releases/northstandard-reduces-bunker-quality-risk-with-launch-of-fuel-insights
- VPS announcement (READ): https://www.vpsveritas.com/knowledgecentre/news/northstandard-partners-vps-launch-ns-fuel-insights-platform-powered-portstats
- Full PR text (READ, via JLA): https://www.j-l-a.com/press_releases/northstandard-reduces-bunker-quality-risk-with-launch-of-fuel-insights-platform-in-partnership-with-vps/
- Product page: https://north-standard.com/fuel-insights-vps

Data scope [VERIFIED]: off-specs, calorific value, **cat fines**, cold-flow, stability,
biofuels, methanol; ISO 8217 parameters plus **proprietary VPS quality indicators**;
"key bunkering hubs across the globe". NorthStandard also republishes **VPS Bunker
Alerts** to members (VPS normally restricts these to its own clients):
https://north-standard.com/insights-and-resources/resources/news/vps-bunker-alerts-2026

Named [VERIFIED]:
- **Colin Gillespie, Global Head of Loss Prevention, NorthStandard** — "This is a
  unique collaboration in marine insurance". **This is the named buyer-side contact
  for this whole thesis.**
- John Oosthoek, VP Operations Digital & Decarbonisation, VPS
- Steve Bee, Group Commercial & New Business Development Director, VPS — "Testing
  remains essential for verifying quality, but accumulated data also helps vessel owners
  make informed fuel procurement decisions"

#### Precedent 2: **West P&I ← Veritas Petroleum Services (VPS)**

**[VERIFIED]** West P&I Club buys a **"Bunker Fuel Advisory"** service from **VPS
(Veritas Petroleum Services)** and delivers it to members through West's **"Neptune"**
member platform. **Launched December 2020**; **renewal announced 26 September 2024**
(so 4+ years continuous). Contract value and duration NOT disclosed.
Named contact: Dmitry Kisil, Senior Loss Prevention Officer, West.
Source (club's own news page): https://www.westpandi.com/news-and-resources/news/september-2024/west-renews-its-bunker-fuel-quality-statistics-con/

What the club pays for [VERIFIED]:
- statistical probability of loading off-spec bunkers **at a particular port**
- bunker pricing across 20 main bunkering ports + energy-per-dollar metrics
- theoretical short-lift amounts from **density variance between BDN declaration and
  tested sample**
- quality data across HFO / VLSFO / ULSFO / MGO
- **VPS Bunker Alerts**

**This is the single most decision-relevant commercial fact in the sweep**, and it cuts
both ways:
- PRO: a P&I club demonstrably has a **line-item budget** for third-party bunker fuel
  quality information, renewed over multiple years.
- CON: what it bought is **aggregate risk analytics and port scoring**, i.e. a
  *predictive* product sold by an incumbent testing lab with a proprietary global
  database — **not a portable per-delivery attestation**. The incumbent (VPS) already
  occupies the club relationship, and its moat is the dataset, not the format.

#### Other clubs — guidance only, no funded infrastructure found

**[VERIFIED]** **American Club** — dedicated "Bunker Fuels" resource page: publishes
"Bunkering — A Compendium" (EN + two Mandarin editions) and **five animated modules**
(introduction, preparation, sampling, operations, malpractice awareness). FD&D and Loss
Prevention support. **No endorsed vendor, no testing programme, no member discount.**
https://www.american-club.com/page/bunker-fuels

**[VERIFIED]** **West P&I** — two-part loss prevention guide, "Bunker Quality Disputes
Part 1: Practical and Technical Measures" and "Part 2: Legal and Claims Handling
Considerations". Guidance, not infrastructure.
https://www.westpandi.com/news-and-resources/loss-prevention-bulletins/bunker-quality-disputes-part-1-practical-and-tech/

**[VERIFIED]** **UK Defence Club (UKDC)** — "Bunkers: A Guide to Quality and Quantity
Claims", 28pp, re-issued Sept 2023. FD&D insurer, i.e. the party that actually pays
defence costs. https://www.ukdefence.com/insights/september-2023-bunkers-a-guide-to-quality-and-quantity-claims-158727/

**[VERIFIED]** **Britannia P&I** — has published specifically on **electronic bunker
delivery notes (eBDNs) in Singapore** (Dec 2024), and on bunker sampling and the
sulphur cap. Club engagement with digital bunker documentation exists.
https://britanniapandi.com/2024/12/electronic-bunker-delivery-notes-ebdns-in-singapore/
(page returned HTTP 403 to automated fetch — title and date verified via search index,
CONTENTS UNVERIFIED)

**[VERIFIED] No evidence found** of any International Group *collective* endorsement,
funding, approval scheme or Club Rule touching bunker quality evidence. The IG's
approval machinery is confined to paperless *trading* systems (bills of lading), where
it exists only because Club Rules exclude cover otherwise.

#### The adjacent mover is a regulator, not a club

**[VERIFIED]** **MPA Singapore** mandated **digital bunkering and e-BDNs as default for
all bunker suppliers in the Port of Singapore from 1 April 2025**, after pilots from
1 Nov 2023. Claimed saving ~40,000 man-days/year industry-wide.
https://www.mpa.gov.sg/port-marine-ops/marine-services/bunkering/digital-bunkering
https://www.mpa.gov.sg/media-centre/details/mpa-to-launch-digital-bunkering-for-enhanced-efficiency

**[VERIFIED]** **Enterprise Singapore / Singapore Standards Council published
SS 709:2024, "Specification for Digital Bunkering Supply Chain Documentation"
(November 2024)** — explicitly to ensure "consistency and interoperability between
digital systems" and to enable "trusted and verifiable digital bunkering documents".
**This is a standards body already occupying the exact conceptual slot** a portable
bunker attestation format would claim. Any such format must position relative to
SS 709:2024, not ignore it.
(Existence and scope VERIFIED via MPA/Manifold Times reporting; FULL TEXT OF SS 709
NOT READ — paywalled standard.)
https://www.manifoldtimes.com/news/sibcon-2024-singapore-bunker-suppliers-must-provide-e-bdn-from-1-april-2025/

### Bottom line: is there a buyer with a budget?

**A buyer with a budget: YES, demonstrably — but it is already spending that budget with
an incumbent, on a different product.**

- **Two of the twelve IG clubs** (NorthStandard, West P&I) have **multi-year paid
  contracts with VPS** for bunker fuel quality data, and give it to members free.
  Budget exists, is recurring, and sits in **Loss Prevention**, not underwriting.
- The buying unit is an **individual club's Loss Prevention head** (named: Colin
  Gillespie at NorthStandard; Dmitry Kisil at West). Not the International Group.
- **The pain is real and worsening on a first-party insurer's own count**: Gard,
  >70 claims Jan–May 2026, +50% YoY, almost all fuel quality.
- **But what clubs buy today is predictive port-risk analytics, not per-delivery
  attestation.** VPS wins because it owns the testing lab network and the historical
  dataset. A format does not displace a dataset.
- **The IG-approval lever does not exist for bunkers.** The e-bill of lading approval
  scheme works only because Club Rules exclude cover for unapproved systems. There is
  no analogous exclusion for bunker evidence and no sign one is contemplated.
- **The real unmet need clubs describe is narrower and more tractable than "fuel quality
  data": it is provable sample identity and custody** — seal numbers tied to the BDN,
  witnessed by both sides, surviving to a tribunal 1–3 years later, and resolving
  "binding sample" disputes. Gard names binding-sample disputes and evidentiary
  requirements as live frictions in 2026. Clyde & Co names supplier-supplied **false
  samples** as an active fraud vector. That is a provenance problem, not a chemistry one.
- **The nearest thing to a standard already exists and is not ours: SS 709:2024**
  (Singapore, Nov 2024), backed by an MPA **mandate** in force since 1 April 2025.
  A regulator has already moved. Any format must interoperate with, or extend, SS 709 —
  competing with it is not viable.
- **A competitor already occupies the pitch:** FuelTrust (Houston) sells AI/blockchain
  fuel provenance and is the untraced origin of the "$5bn fraud / $545k per claim"
  numbers circulating as if they were club statistics.

**Honest verdict:** the budget is real but small, fragmented across 12 independent
mutuals, already contracted to an incumbent, and pointed at analytics rather than
attestation. The buyer is reachable (a named loss-prevention head at one club) but is
not shopping for a format. The strongest wedge found is **binding-sample / chain-of-
custody disputes**, where the regulator (MPA) and standards body (Enterprise Singapore)
have opened the door and the clubs have an unmet evidential need they state in their own
words.

### Gaps, dead ends and limits

**What I could NOT verify — be explicit about these:**

1. **No average defence cost and no average duration for a bunker quality dispute exists
   in any public club, court or standards-body source I could find.** Clubs publish claim
   counts and causes, not unit economics. Every dollar figure I traced turned out to be
   either (a) a vendor estimate with no named study, or (b) an all-cause machinery
   statistic being misquoted as bunker-specific. **Do not build a business case on a
   per-claim dollar figure without commissioning it directly from a club.**
2. **igpandi.org blocks automated fetching (HTTP 403)** — the IG's own approval
   requirements page, process page and About page could not be read directly. Everything
   about the approval mechanism here comes from **member-club circulars reproducing the
   IG circular** (UK P&I Circular 04/25 was read in full). Worth a manual read of
   igpandi.org before relying on the detail.
3. **Also 403 / unreadable:** NorthStandard press-release page, Britannia P&I eBDN
   article, Shipowners' Club circular page, West P&I Bunker Quality Disputes **Part 2**
   PDF (downloaded but this machine has no PDF text extractor — poppler/pdftoppm not
   installed). **Part 2 is the single highest-value unread document in this sweep** —
   it is the claims-handling/legal half and is the most likely place to find time bars,
   burden-of-proof detail and any cost commentary.
   URLs to retry by hand:
   https://www.westpandi.com/globalassets/about-us/claims/claims-guides/west-of-england---claims-guide---bunker-quality-disputes-part-2.pdf
   https://www.ukdefence.com/fileadmin/uploads/uk-defence/Documents/Soundings/2020/1399-UKDC-Bunkers-Quality-and-Quantity-Claims-v10.pdf
4. **No named English court or LMAA decision was retrieved.** LMAA awards are private,
   which is itself a finding: the case law that would quantify this is structurally
   unavailable. Steamship Mutual's 2007 note describes two unnamed arbitrations.
5. **SS 709:2024 full text not read** (paid standard). Its actual data model is unknown
   and is a material dependency for any format work.
6. **The 8.5% / 6.8% off-spec rate and the "29 bunker alerts" figure were not traced to
   a primary source** and are most likely vendor (VPS / LR FOBAS) numbers.
7. **Not investigated for lack of budget:** Gard's, Skuld's and Britannia's own paid
   vendor relationships (only NorthStandard and West were confirmed); whether the IG has
   any working group on fuel quality; IMO/ISO 8217:2024 revision politics; and whether
   any club has commented publicly on SS 709:2024.

No search or tool limits were hit; the constraints above are access constraints
(403s, paywalls, missing local PDF tooling), not budget exhaustion.



---

<!-- archived from research/02-bunker-evidence-chain.md -->

## Sweep 02 — The Bunker Dispute Evidence Chain

Research sweep, 2026-08-27. Every finding is labelled [VERIFIED] (I fetched and read the
primary source myself in this session) or [UNVERIFIED]. Vendor, testing-lab and consultancy
sources are labelled as such. STATUS: in progress.

---

### 0. HEADLINE — forgery vs entitlement / omission / inconsistency

**Not one documented bunker dispute I found in this sweep turns on a forged signature or a
falsified document.** Across P&I and defence club casework, IMO guidance and standard contract
terms, the evidence chain fails in four other ways:

1. **OMISSION** — the seal number was never written on the BDN, or the manifold sample was never
   drawn. This is the single most-cited reason a quality claim collapses (Gard, verbatim: "no
   such samples were taken or ... the seal numbers were not mentioned on the Bunker Delivery
   Note, which allows their validity to be disputed"). The field that binds physical evidence to
   the document is a "should" in IMO guidance and is **not in MARPOL Appendix V at all**.
2. **ENTITLEMENT** — a real officer genuinely signed a document asserting something he was not
   in a position to assert. UKDC's case: the Chief Officer "inadvertently certified" that
   samples were drawn by continuous drip when they were not; the wrong samples became binding
   and the claim was crippled. No signature check catches this.
3. **INCONSISTENCY** — several genuine documents that disagree. UKDC's $2m case: every sample
   off-spec except the supplier's, "the authenticity of which was disputed" — disputed, never
   disproved; settled at mediation after ~$200k of club costs and two parallel arbitrations.
4. **CONTRACTUAL FIAT over evidence** — standard supply terms make the *seller's own figures*
   conclusive on quantity and the *seller's own retained sample* the one sent to the lab. A
   40 mt short delivery was unrecoverable because the contract said the barge figures were final
   and the barge had sailed.

Where deliberate deception genuinely occurs — cappuccino bunkers (air injected to inflate
volume) and slugging contaminated fuel past the drip sampler — it is **fraud on the physical
apparatus, not on the paper**. A perfect cryptographic signature is orthogonal to it. Notably,
West of England's advice for defeating cappuccino fraud is "Do not sign the bunker receipt as
presented" and amend the figures — i.e. the countermeasure is a *correct, scoped,
contemporaneous attestation*, not a provably-genuine one.

**Consequence for the project:** an attestation format sold on anti-forgery solves a problem the
bunker industry does not have. A format sold on (a) machine-detectable omission of required
links, (b) explicit entitlement scoping of what each signer is asserting, and (c) cross-document
consistency of the seal-number chain (BDN ↔ sample label ↔ lab report) addresses the failures
that actually cost money. See section 6 for the competitive fact that most constrains this: MPA
Singapore already runs a centralised e-BDN verification registry, mandatory since 1 April 2025.

---

### 1. The evidence chain: who produces what, who signs it

#### 1.1 What the IMO instrument actually names as roles
[VERIFIED] MSC-MEPC.2/Circ.18, 11 July 2024, "Guidelines for the sampling of fuel oil for
determination of compliance with MARPOL Annex VI and SOLAS chapter II-2" (this circular
REVOKED and replaced resolution MEPC.182(59) — MEPC 81 agreed to revoke it when this
circular issued).
Source: https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/annex/MSC-MEPC.2-Circ.18%20-%20Guidelines%20For%20The%20Sampling%20Of%20Fuel%20Oil%20For%20Determination%20Of%20Compliance%20With%20Marpol%20Annex...%20(Secretariat).pdf

Only TWO signing roles exist in the whole IMO scheme:
- 3.1 "**Supplier's representative** is the individual from the bunker tanker who is
  responsible for the delivery and documentation or, in the case of deliveries direct from
  the shore to the ship, the person who is responsible for the delivery and documentation."
- 3.2 "**Ship's representative** is the ship's master or officer in charge who is responsible
  for receiving bunkers and documentation."

Note what is absent: no named barge operator, no independent surveyor, no laboratory, no
charterer, no trader, no physical-supplier-vs-contractual-seller distinction. The IMO chain
is a two-party chain. Everyone else in a real dispute is outside the instrument.

#### 1.2 Sample definitions (the four different things people call "the sample")
[VERIFIED] MSC-MEPC.2/Circ.18 paras 3.3–3.5:
- **Representative sample** — "a product specimen having its physical and chemical
  characteristics identical to the average characteristics of the total volume being sampled."
- **Primary sample** — "the representative sample of the fuel delivered to the ship collected
  throughout the bunkering period obtained by the sampling equipment positioned at the bunker
  manifold of the receiving ship."
- **Retained sample** — the one required by reg 18.8.1, "derived from the primary sample",
  "intended to be used **solely** as the MARPOL-delivered sample ... for determination of
  compliance." (emphasis in the sense of the text: para 2.3 — "This sample is to be used
  solely for determination of compliance with MARPOL Annex VI and/or SOLAS chapter II-2.")

This is a load-bearing point for disputes: **the MARPOL retained sample is not, by its own
terms, a commercial quality sample.** Commercial/dispute samples are a separate set drawn
under contract (ISO 13739 / BIMCO terms), and their custody is governed by contract, not by
MARPOL.

#### 1.3 The IMO sampling chain, step by step
[VERIFIED] MSC-MEPC.2/Circ.18:
- para 4.1 — primary sample by (a) manual valve-setting continuous-drip sampler, (b)
  time-proportional automatic sampler, or (c) flow-proportional automatic sampler.
- para 4.4 — "The primary sample should be drawn at the bunker manifold of the receiving ship
  **witnessed by a ship's representative and supplier's representative**."
- para 6.1 — "a sample ... should be obtained at the receiving ship's inlet bunker manifold and
  should be drawn continuously throughout the bunker delivery period." Footnote: continuous
  collection per BDN; if two or more BDNs, sampling may be stopped to change the primary
  container and resumed.
- para 5.1/5.3 — sampling equipment and the primary container should be sealed throughout the
  supply period "so as to prevent tampering or contamination".
- para 7.2 — primary sample thoroughly agitated to homogeneity immediately before filling the
  retained container. 7.3 — retained sample not less than **600 ml**, container filled to
  90% ± 5%, sealed.
- para 8.1 — "**a tamper-proof security seal, with a unique means of identification, should be
  installed by the supplier's representative in the presence of the ship's representative**."
  Label must carry: (.1) location and method of drawing; (.2) date of commencement of
  delivery; (.3) name of bunker tanker/installation; (.4) name and IMO number of receiving
  ship; (.5) **signatures and names of the supplier's representative and the ship's
  representative**; (.6) details of seal identification; (.7) product name per Appendix V.
- para 8.2 — "**To facilitate cross reference details of the seal, identification should also
  be recorded on the bunker delivery note.**"  ← this is the ONLY link binding sample to
  document in the entire scheme, and it is a "should", not a "shall".
- para 9.3 — retained under the ship's control until substantially consumed, not less than
  12 months from delivery. 9.4 — "The company should develop and maintain a process to keep
  track of the retained samples."
- paras 10.2–10.3 (SOLAS flashpoint context only) — the laboratory takes a subsample, reseals
  with a NEW tamper-proof seal with unique identification in the presence of the ordering
  authority's representative, and the new label must carry names and signatures of the person
  resealing and the witnessing authority representative, "a declaration that no other material
  has been added to the sample", and relevant information from the previous label INCLUDING
  the original seal identification. The lab test record "should include the test result(s) and
  the test method(s), and the **seal number of the ship's retained sample** which the testing
  was carried out on."

That last item is the closest thing in the regime to an end-to-end chain-of-custody link:
seal number on BDN → seal number on label → seal number quoted on lab report. It is entirely
a *consistency* mechanism between independently-authored documents. Nothing is
cryptographically bound; nothing prevents a mismatch; nothing detects one automatically.

#### 1.4 Documents produced in a real delivery (chain map)
[VERIFIED for the MARPOL items above; the commercial items below are [UNVERIFIED] pending
ISO 13739 / BIMCO / P&I reading in sections 3 and 5]
1. Bunker confirmation / contract — buyer (owner or charterer) and seller (trader or physical
   supplier). Signed by nobody at the delivery.
2. Bunker Requisition / Nomination — buyer to supplier.
3. Barge tank soundings / ullage report before and after — barge; countersigned by ship's
   officer and/or independent surveyor if one is appointed.
4. Ship's tank soundings before and after (ROB) — ship's officer.
5. Bunker Delivery Receipt / Bunker Delivery Note (BDN) — issued by the **supplier**, signed by
   the supplier's representative (the declaration in Appendix V is expressly "signed and
   certified by the fuel oil supplier's representative"). Master/chief engineer signs for
   receipt, commonly "for quantity only" or with a Letter of Protest attached.
6. MARPOL retained sample — sealed by supplier's rep, label signed by BOTH reps, held by ship.
7. Commercial samples — typically 4+ additional sealed bottles from the same primary sample:
   one ship's own, one supplier's, one for the buyer's testing programme, one spare. Custody
   after the manifold is contractual.
8. Letter of Protest (LOP) — issued by whichever side objects, signed and acknowledged (often
   "received but not accepted") by the other.
9. Laboratory test report — issued by the testing lab against a sample bottle identified by its
   seal number. The lab has no witness to how that bottle came to it.
10. Surveyor's report — where an independent surveyor is appointed (usually only when the buyer
    pays for one).

---

### 2. MARPOL Annex VI: what is REQUIRED, what is left unspecified

[VERIFIED] Text read: Resolution MEPC.176(58), Annex 13, the revised MARPOL Annex VI adopted
10 Oct 2008 — Regulation 18 and Appendices V and VI.
Source: https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/176(58).pdf
(Caveat: this is the 2008 adopted text. Annex VI has been amended since — notably the
in-use/onboard sampling-point requirements added by MEPC.324(75) in force 1 Apr 2022, and the
Unified Interpretation permitting electronic BDNs. I have read the 2008 base text directly;
the amendments below are flagged separately.)

#### 2.1 What is REQUIRED
- **Reg 18.5** — "details of fuel oil for combustion purposes delivered to and used on board
  shall be recorded by means of a bunker delivery note which shall contain **at least** the
  information specified in appendix V."
- **Reg 18.6** — BDN kept on board readily available for inspection; "**retained for a period
  of three years** after the fuel oil has been delivered on board."
- **Reg 18.7.1** — competent authority may inspect BDNs, take copies, and "may require the
  master or person in charge of the ship to **certify that each copy is a true copy**"; and
  "may also verify the contents of each note through consultations with the port where the
  note was issued."
- **Reg 18.8.1** — "The bunker delivery note **shall be accompanied by a representative sample
  of the fuel oil delivered** taking into account guidelines developed by the Organization.
  The sample is to be **sealed and signed by the supplier's representative and the master or
  officer in charge of the bunker operation on completion of bunkering operations** and
  retained under the ship's control until the fuel oil is substantially consumed, but in any
  case for a period of **not less than 12 months** from the time of delivery."
- **Reg 18.8.2** — if an Administration requires analysis, it is done per the Appendix VI fuel
  verification procedure.
- **Reg 18.9** — Parties undertake that designated authorities: .1 maintain a **register of
  local suppliers of fuel oil**; .2 require local suppliers to provide the BDN and sample
  "certified by the fuel oil supplier that the fuel oil meets the requirements"; .3 require
  suppliers to **retain a copy of the BDN for at least three years**; .4 take action against
  suppliers found to deliver fuel not complying with what the BDN states; .5/.6 inform flag
  Administration and IMO of non-compliance cases.
- **Reg 18.10** — Parties inform the Party under whose jurisdiction a BDN was issued of cases
  of non-compliant delivery.
- **Appendix V — INFORMATION TO BE INCLUDED IN THE BUNKER DELIVERY NOTE** (verbatim list):
  Name and IMO Number of receiving ship / Port / Date of commencement of delivery / Name,
  address, and telephone number of marine fuel oil supplier / Product name(s) / Quantity in
  metric tons / Density at 15°C, kg/m³ / Sulphur content (% m/m) / "A declaration signed and
  certified by the fuel oil supplier's representative that the fuel oil supplied is in
  conformity with the applicable subparagraph of regulation 14.1 or 14.4 and regulation 18.3
  of this Annex." Footnotes: density tested per ISO 3675:1998 or ISO 12185:1996; sulphur per
  ISO 8754:2003.
- **Appendix VI** — fuel verification procedure; para 1.3: "The laboratories responsible for
  the verification procedure ... shall be **fully accredited** for the purpose of conducting
  the tests."

#### 2.2 What Annex VI LEAVES UNSPECIFIED — the gap list
[VERIFIED by absence from the text read]
- **No format.** Appendix V is a content list, not a schema. There is no field ordering, no
  data types, no identifiers beyond the ship's IMO number, no controlled vocabulary for
  "product name". Two BDNs from two ports are not machine-comparable.
- **No supplier identifier.** The supplier is identified by free-text name, address and
  telephone number. There is no supplier ID, no licence number field, no link to the reg 18.9.1
  register of local suppliers that Parties are required to maintain. **The registers exist per
  Party and are not federated, not standardised, and not referenced from the document they
  would authenticate.** This is precisely a trust-list gap.
- **No definition of "supplier's representative" credential.** Reg 18.8.1 requires the sample
  to be "sealed and signed by the supplier's representative". Nothing says how the ship
  verifies that the person signing is authorised by the named supplier, or how anyone later
  verifies it. The signature is ink on paper against a printed company name.
- **No barge identity requirement in Appendix V.** The bunker tanker name appears on the SAMPLE
  LABEL (Circ.18 para 8.1.3) but is NOT in the Appendix V BDN content list.
- **No seal number requirement in the BDN.** Circ.18 para 8.2 says seal ID "should also be
  recorded" on the BDN. It is guidance, and it is a "should".
- **No sampling-point requirement in the regulation itself** for the delivered sample — "at the
  receiving ship's inlet bunker manifold" is in the Guidelines (Circ.18 para 6.1), not in
  reg 18. Reg 18.8.1 says only "taking into account guidelines developed by the Organization."
- **No chain of custody after the manifold** for anything except the ship's own retained
  sample. How a bottle reaches a laboratory is entirely unregulated.
- **No requirement that the laboratory report be linked to the BDN.** Only the SOLAS-context
  para 10.3 requires the seal number on a test record, and only for an authority-ordered test.
- **No timestamp granularity.** "Date of commencement of delivery" only — no time, no
  completion time, no time zone.
- **No quantity methodology.** "Quantity in metric tons" with no statement of how measured
  (barge tanks vs mass flow meter vs ship's tanks), no temperature/density correction rules, no
  air-content statement. Quantity is where the biggest money disputes are, and Annex VI says
  nothing about how it is determined.
- **No revocation / correction mechanism.** Nothing addresses what a corrected or reissued BDN
  is, or how a superseded one is marked.

---

### 3. ISO 8217 and ISO 13739

Both are paywalled ISO standards. I have NOT read the standards themselves. What follows is
from official scope statements and from a P&I club guide that describes them.

- **ISO 8217** — "Petroleum products — Fuels (class F) — Specifications of marine fuels." It is
  a *product specification*: table of limiting values (viscosity, density, sulphur, flash point,
  ash, water, aluminium+silicon, CCAI, etc.) plus the general clause 5 requirement that fuels be
  free from any material at a concentration that renders them unacceptable for use. It says
  nothing about who signs what. [UNVERIFIED — from secondary description]
- **ISO 4259** — the precision/dispute-resolution statistics standard. BIMCO's terms make the
  analysis "in accordance with ISO 8217 and ISO 4259". ISO 4259 is what converts a single test
  number into a pass/fail with reproducibility allowance, which is itself a frequent dispute
  axis. [VERIFIED that BIMCO invokes it — see section 5 quote]
- **ISO 13739** — "Petroleum products — Procedures for the transfer of bunkers to vessels."
  Covers pre-delivery, delivery and post-delivery checks and documentation for transfers by
  bunker tanker, road tanker and shore pipeline. [UNVERIFIED — official scope wording via
  standards resellers, e.g. https://standards.globalspec.com/std/14214880/ISO%2013739 and
  https://www.intertekinform.com/en-us/standards/bs-iso-13739-2010-266670_saig_bsi_bsi_616187/]

**The 2020 revision changed the sampling point.** [VERIFIED as a claim made in a P&I club
publication — UK Defence Club, "Bunkers: quality and quantity claims", 2020, p.8–9]
Source: https://www.ukdefence.com/fileadmin/uploads/uk-defence/Documents/Soundings/2020/1399-UKDC-Bunkers-Quality-and-Quantity-Claims-v10.pdf
Verbatim: "Whilst previous versions of ISO 13739 allowed representative samples to be taken from
either end of the bunker hose, the latest version limits representative samples to those taken
at the receiving ship's manifold. This may minimise the scope for dispute arising due to
multiple sampling points, although commercial practices of sampling at the barge manifold may
continue to cause issues."

**What ISO leaves to the parties:** which sample is *binding*. The UKDC guide is explicit that
this is contractual, not standardised: "Clear procedures should be agreed in charterparties and
supply contracts for sampling and testing the fuel, including the exchange, witnessing,
sampling location, sealing and storage of samples as well as procedures for resolving any
quality disputes, **including identifying which samples are to be binding**." [VERIFIED, UKDC
p.27]

---

### 4. WHERE THE CHAIN BREAKS — the forgery / entitlement / omission / inconsistency split

All primary evidence in this section is from documented practitioner casework (P&I clubs and
defence clubs are mutual insurers who fund and run these disputes; they are practitioner
sources with an interest in selling loss-prevention advice, but their case narratives are the
closest public record of real bunker arbitrations, most of which are confidential).

#### 4.1 The five documented failure modes, classified

**(A) ENTITLEMENT — the person who signed was not entitled to attest what they attested**
[VERIFIED, UKDC p.30 "The Club's Experience", verbatim]
> "The supply contract provided for continuous drip samples to be taken at the bunkering barge
> manifold. The samples were not, in fact, taken by continuous drip method, but the Chief
> Officer inadvertently certified that they were. As a result, the unrepresentative barge
> samples, which were found to be on-specification, were considered to be binding,
> significantly hindering the Member's claim against the supplier."

This is the single most instructive case in the whole sweep. Nobody forged anything. A real
officer signed a real document with a real signature. The document was *wrong about the method*,
and because he certified it, the wrong sample became binding. No signature check, no PKI, no
tamper-evident log would have caught this. What would have caught it is a structured claim that
the signer was not in a position to assert ("was the drip sampler observed running for the
whole delivery? by whom?") — i.e. an entitlement/scope constraint on the attestation.

[VERIFIED, UKDC p.9] Related entitlement practice already exists informally: "if the bunker
supplier offers another sample, which the ship has not witnessed, then this should only be
accepted by the Chief Engineer with the written qualification **'for receipt only, source
unknown'**." That phrase is a hand-written entitlement limitation on a signature. It is exactly
the thing a structured attestation format would encode as a field.

**(B) INCONSISTENCY — two authentic documents that disagree**
[VERIFIED, UKDC p.28, verbatim]
> "Several bunker samples were taken and analysed, all of which were found to be
> off-specification except one sample taken from the ship's manifold and retained by the bunker
> supplier. In view of the analysis result of that one sample (**the authenticity of which was
> disputed**) the sub-charterer denied liability..."

Cost to the club of that one case: "in the region of $200,000", settled at mediation after
parallel London and New York proceedings. Note the wording: authenticity was *disputed*, not
disproved. Nobody could establish forgery; they could only establish that the documents did not
agree. The dispute cost $200k and settled without resolution of the factual question.

**(C) OMISSION — the required evidence was never created, or the link was never recorded**
[VERIFIED, UKDC p.14, verbatim]
> "If sampling and recording is not done properly then it is always open to an opponent to
> challenge the authenticity of any test results."
And p.10: the ship must record "the seal number of this [MARPOL sample] ... on the bunker
delivery receipt along with the seal numbers of any other samples issued by the supplier."
The seal-number-on-BDN cross reference is a "should" in MSC-MEPC.2/Circ.18 para 8.2. When it is
omitted, the lab report floats free of the delivery and the claim degrades.

**(D) QUANTITY — measurement disputes, decided by contractual fiat, not evidence**
[VERIFIED, UKDC p.29, verbatim]
> "the crew of the bunker barge persuaded the ship's crew that they only needed to measure the
> oil content of those tanks on board the bunker barge from which the bunkers were to be
> supplied. On completion there was a 40 mt discrepancy between the barge tank measurements and
> the quantity measured in the ship's tank. The Master requested the assistance of the Club but
> **the barge had sailed away before a surveyor could reach the ship**. The bunker supplier
> relied on a term in the supply contract that provided that the **barge figures were final and
> binding** and pursued the owner for payment for the 40 mt which the ship had never received."

Quantity disputes are not resolved by evidence at all under standard terms — they are resolved
by a contractual clause that makes one party's own measurement conclusive. See section 5.

**(E) ACTUAL FRAUD — but physical, not documentary**
[VERIFIED, UKDC p.9, verbatim]
> "It is not unknown for a barge to deliver a slug of contaminated fuel in the hope that this
> will not be picked up by the drip sample."

This is the real deliberate-deception failure mode in bunkering, and it is a **physical**
fraud on the sampling process (mis-timing a contaminated slug so the composite sample misses
it), not a fraud on a document. A perfect cryptographic signature on the BDN and the sample
label would be entirely unaffected by it.

**Cappuccino bunkers** are the same category. [VERIFIED — West of England P&I Club loss
prevention bulletin, "Bunker Disputes – The 'Cappuccino Effect'", read this session]
Source: https://www.westpandi.com/news-and-resources/loss-prevention-bulletins/bunker-disputes-the-cappuccino-effect/
Verbatim: "Air had been introduced into the fuel oil resulting in the development of froth and
foam on the surface – the so called 'cappuccino effect.'" The club calls it "a well-known ploy"
and "this malpractice". Air is introduced by injecting compressed air into tanks before
soundings, by injecting air during transfer, or by excessive stripping drawing air in. Detection
is entirely physical and contemporaneous — foam on the surface, bubbles on the sounding tape,
hose movement, "rattling of the float valves situated inside the fuel tank vent head bonnets",
line-pressure variation, a warm compressor with a cold delivery line, empty air bottles. The
club's advice: "Do not sign the bunker receipt as presented" and "Amend the quantity shown on
the bunker receipt to reflect the vessel's own figures."

This is the clearest demonstration of the point. The most notorious deliberate fraud in
bunkering is defeated by a crew member *not signing* and by an amendment written on the paper at
the manifold — i.e. by a correct, contemporaneous, scoped attestation. It is not defeated by
proving a signature genuine.

#### 4.1a "The sample tested is not the fuel delivered"
[VERIFIED — Gard P&I Club (mutual insurer), "Take your own bunker samples – they are a vital
piece of evidence", read this session]
Source: https://gard.no/articles/take-your-own-bunker-samples-they-are-vital-piece-evidence/
- The structural conflict of interest, verbatim: "A bunker supplier will probably want to take
  samples from the barge whereas a shipowner would generally prefer for the bunkers to be
  sampled from the receiving ship's manifold."
- **The omission failure, verbatim, and this is the sharpest single sentence in the sweep:**
  "An owner wishing to use a manifold sample may discover that either **no such samples were
  taken** or that if they were taken **the seal numbers were not mentioned on the Bunker
  Delivery Note, which allows their validity to be disputed**."
- The "not the fuel delivered" failure, verbatim: "Gard has handled cases where the barge samples
  have **failed the test for finger printing**, i.e. they were not representative of the fuel
  actually bunkered."
- Gard's recommended custody split: at least five samples — three for the vessel, one for the
  supplier, and one held "by a responsible independent party, such as a bunker surveyor, for
  safe keeping". And: "Attempts should be made to enter the seal numbers on the BDN. Also,
  photographic/video evidence should be maintained as evidence."

Note "attempts should be made" — even the club advising its own members cannot state the
seal-number-on-BDN link as a requirement, because MSC-MEPC.2/Circ.18 para 8.2 makes it a
"should" and Appendix V does not list it as a BDN field at all. **The one field that would bind
the physical evidence to the document is optional, and its absence is the documented reason
claims fail.**

#### 4.2 THE ANSWER TO THE QUESTION
Across every documented case I read, **not one turned on a forged signature or a falsified
document.** The disputes turn on:
- who was entitled to certify what (A),
- documents that are all genuine and mutually inconsistent (B),
- links that were never recorded at all (C),
- a contractual rule that makes one party's own figure conclusive regardless of evidence (D),
- and physical deception of the sampling/measuring apparatus, which no document format can
  detect (E).

The industry's stated concern about "fraud" (MPA Singapore cites "early detection of fraudulent
activities" as an eBDN benefit) is mostly (D) and (E) — quantity and physical manipulation —
not signature forgery.

**Implication for a portable attestation format:** authenticity/anti-forgery is the wrong
value proposition here; it solves a problem the industry does not actually have. The addressable
problems are *entitlement* (what was this signer in a position to assert, and did they assert
it), *completeness* (was the required link recorded), and *cross-document consistency* (does the
seal number on the BDN equal the one on the label equal the one on the lab report). A format
that carries scoped claims and makes omissions and mismatches machine-detectable is defensible.
A format whose pitch is "you can prove it wasn't forged" is not.

---

### 5. Time limits and notice deadlines

[VERIFIED — full clause text read, as reproduced in the West of England P&I Club claims guide
"Bunker Quality Disputes Part 2: Legal and Claims Handling Considerations". The reproduced
contract is headed **BIMCO Standard Bunker Contract 2015**. NOTE: BIMCO also publishes *BIMCO
Bunker Terms 2018*; I read the 2015 text, not the 2018 text — flag this before relying on it.]
Source: https://www.westpandi.com/getattachment/cf85bdab-1b86-46a2-ad62-c67277c59f40/p-i_guide_bunker_quality_disputes-part2_12pp_v3_lr.pdf

- **Clause 9(a)(i) Quantity** — "Any dispute as to the quantity delivered must be noted at the
  time of delivery... If no claim for such quantity dispute is presented to the Sellers by the
  Buyers in writing within **fourteen (14) days** from the date of delivery, any such claim
  shall be deemed to be **waived and barred**."
- **Clause 9(b)(i) Quality** — "Any claim as to the quality or specification of the Marine Fuels
  must be notified in writing promptly after the circumstances giving rise to such claim have
  been discovered. If the Buyers do not notify the Sellers of any such claim within **thirty
  (30) days** of the date of delivery, such claim shall be deemed to be **waived and barred**."
- **Clause 9(e) Time Bar** — all claims except 9(a)(i)/9(b)(i) time barred unless arbitration
  commenced within **twelve (12) months** of the date of delivery.
- **Clause 9(b)(ii)** — critical: "The **Sellers shall provide the laboratory with one of the
  samples retained by them** as per sub-clause 4(c)." The contractual dispute-determination
  sample is the SELLER'S. Sub-clause 4(c): sellers retain two samples for minimum **45 days**.
- **Clause 4(a) Sampling** — primary sample drawn "at a point, to be **mutually agreed**...
  closest to the Vessel's bunker manifold", per MEPC.182(59) [now superseded by
  MSC-MEPC.2/Circ.18]; divided into a minimum of **five (5) identical samples**; "**The absence
  of the Buyers or their representatives shall not prejudice the validity of the samples
  taken.**" ← an express contractual waiver of the witnessing requirement.
- **Clause 4(b)** — labels show vessel name, delivery facility identity, product name, delivery
  date/place, point of sampling, seal number, "authenticated with the Vessel's stamp and signed
  by the Sellers' representative and the Master... or the Master's authorized representative."
- **Clause 10(a) Risk** — passes at the Sellers' flange connected to the vessel's manifold.

**Do disputes fail on timing? Yes, and it is a named failure mode.** [VERIFIED, UKDC p.22]
"The supplier's terms may also seek to impose strict terms as regards the notification of claims
and may have very short time bars (**sometimes only 7 days from delivery**)..." And UKDC p.29
records an actual case where "The charterer denied liability on the grounds that the Member did
not notify it or the bunker supplier in writing of any bunker quality issues within 30 days of
the supply of the bunkers."

**The timing squeeze is structural.** Lab turnaround on a full ISO 8217 analysis is typically
several days after the sample physically reaches the lab, and the sample must be couriered from
a ship that has sailed. A 14-day quantity bar and a 7–30 day quality bar mean the claim is often
barred before the evidence exists. This is an argument for evidence that is *created and
transmitted at the manifold*, not assembled afterwards.

---

### 6. Who are the parties — is there a natural neutral?

[VERIFIED from the sources above]

The party structure in a live dispute:
- **Shipowner** — suffers the engine damage; holds the samples and logs; usually not the buyer.
- **Time charterer** — under NYPE/Shelltime 4 "shall provide and pay for all fuel"; is the buyer;
  is the owner's counterparty and the supplier's customer. [VERIFIED, UKDC p.16]
- **Sub-charterer(s)** — the claim is passed down the chain. In the $2m case there were four
  tiers and two arbitrations in two jurisdictions. [VERIFIED, UKDC p.28]
- **Bunker trader / contractual seller** (e.g. OW Bunker) — often not the physical supplier.
- **Physical supplier / barge operator** — issues the BDN, signs the declaration, draws and seals
  the sample. Has the strongest incentive of anyone in the chain and holds the sample that the
  standard contract makes determinative.
- **Testing laboratory** — the nearest thing to a neutral, but it is *retained and paid by one
  side* (each side sends its own bottle to its own lab), it receives a bottle with no witness to
  its custody, and it is contractually "a mutually agreed, qualified and independent laboratory"
  only once a dispute is already declared. Fuel testing companies also sell subscription "fuel
  analysis schemes" to owners — that is a commercial relationship with one side.
- **Independent surveyor** — genuinely neutral in principle, but appointed and paid by whoever
  wants one, and in the 40mt case the barge sailed before one could attend.
- **P&I / defence club** — funds and manages the claim; explicitly partisan (mutual insurer of
  one party).
- **Port State / MPA-type authority** — the only structurally neutral party, but its interest is
  *regulatory compliance only* (sulphur, flashpoint), not commercial quality or quantity, and
  MSC-MEPC.2/Circ.18 para 2.3 expressly restricts the MARPOL sample to compliance use.

**Conclusion: there is no natural commercial neutral.** Buyer and seller are direct
counterparties; the labs and surveyors are each retained by a side; the only neutral is the port
authority, whose mandate excludes the commercial dispute. The one genuine exception now emerging
is a *port authority acting as a registry*:

[VERIFIED] MPA Singapore, SIBCON 2024 announcement: "from 1 April 2025, all bunker suppliers
will be required to provide digital bunkering services and issue electronic bunker delivery
notes (e-BDNs) as a default", and MPA will introduce "a **centralised e-BDN record verification
facility. This enables key stakeholders to verify the e-BDN received against the information
transmitted to MPA.**"
Source: https://www.mpa.gov.sg/media-centre/details/advancing-maritime-digitalisation--decarbonisation-and-manpower-development-efforts-at-sibcon-2024

This matters strategically. Singapore — the world's largest bunkering port — has answered the
trust question with a **centralised registry operated by the port state**, verifying a document
against a copy the regulator already holds. That is the incumbent design, it is live, and it is
port-scoped (it does not federate across Rotterdam, Fujairah, Houston). A portable format's
opening is precisely the cross-port gap Singapore's model does not close.

---

### 7. Search budget, source labelling and gaps

#### Sources I actually read this session [VERIFIED]
- MSC-MEPC.2/Circ.18 (11 July 2024), IMO — full annex text extracted from the IMO PDF.
  https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/annex/MSC-MEPC.2-Circ.18%20-%20Guidelines%20For%20The%20Sampling%20Of%20Fuel%20Oil%20For%20Determination%20Of%20Compliance%20With%20Marpol%20Annex...%20(Secretariat).pdf
- Resolution MEPC.176(58), revised MARPOL Annex VI — Regulation 18, Appendix V, Appendix VI.
  https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/176(58).pdf
- UK Defence Club, "Bunkers: quality and quantity claims" (2020), full 36pp.
  https://www.ukdefence.com/fileadmin/uploads/uk-defence/Documents/Soundings/2020/1399-UKDC-Bunkers-Quality-and-Quantity-Claims-v10.pdf
- West of England P&I, "Bunker Quality Disputes Part 2" incl. full BIMCO Standard Bunker
  Contract 2015 clause text.
  https://www.westpandi.com/getattachment/cf85bdab-1b86-46a2-ad62-c67277c59f40/p-i_guide_bunker_quality_disputes-part2_12pp_v3_lr.pdf
- West of England P&I, "Bunker Disputes – The 'Cappuccino Effect'".
  https://www.westpandi.com/news-and-resources/loss-prevention-bulletins/bunker-disputes-the-cappuccino-effect/
- Gard P&I, "Take your own bunker samples". https://gard.no/articles/take-your-own-bunker-samples-they-are-vital-piece-evidence/
- MPA Singapore, SIBCON 2024 announcement. https://www.mpa.gov.sg/media-centre/details/advancing-maritime-digitalisation--decarbonisation-and-manpower-development-efforts-at-sibcon-2024

#### Source-type labels
- **P&I / defence clubs (Gard, West of England, UK Defence Club)** are *mutual insurers* of
  shipowners and charterers. They fund these disputes, so their casework is first-hand, but they
  publish loss-prevention material partly to reduce their own claims exposure and they see the
  owner's side of the chain far more often than the supplier's. Treated as practitioner
  evidence, not neutral scholarship.
- **MPA Singapore** is a port-state regulator announcing its own programme; the benefit claims
  ("40,000 man-days saved", "early detection of fraudulent activities") are its own.
- **ISO standards content** is UNVERIFIED — paywalled, described only via resellers and the
  UKDC guide.

#### Gaps — honest list
- I did NOT read ISO 8217 or ISO 13739 themselves. The claim that ISO 13739:2020 narrowed the
  sampling point to the receiving ship's manifold rests on the UKDC guide and Gard, not on the
  standard.
- I read **BIMCO Standard Bunker Contract 2015** clause text, not **BIMCO Bunker Terms 2018**.
  UKDC p.25 states the 2018 terms give "a more generous time limit of 30 days from the date of
  delivery" and require sampling "in the presence of both parties and at a mutually agreed
  point" [VERIFIED as UKDC's characterisation, not read in the 2018 original].
- **No named, citable arbitration award.** LMAA and SCMA bunker awards are overwhelmingly
  confidential; the case narratives above are anonymised club reports. The reported English
  cases I saw (The Saetta [1993] 2 Lloyd's Rep 268; The Fesco Angara [2010] EWHC 619 (QB);
  PST Energy 7 Shipping v OW Bunker Malta ("Res Cogitans") [2016] UKSC 23) are about **title and
  payment**, not evidence quality — I cited them only from the UKDC summary, and did not read
  the judgments. This is itself a finding: the evidence-chain failures are settled or arbitrated
  privately and therefore leave almost no public precedent.
- I did not investigate mass flow meter (MFM) custody transfer in Singapore in depth, nor the
  reported IBIA/Rotterdam move to enforce ISO 13739 by 2026 — both are live and relevant.
- I did not examine the technical format of Singapore's e-BDN, which is the most important
  competitive question for a portable format.


---

<!-- archived from research/03-fleet-connectivity.md -->

## 03 — Is the merchant fleet actually disconnected?

Sweep date: 2026-08-27. Status: COMPLETE (within budget; gaps flagged).

Tests the load-bearing assumption that ships are "genuinely disconnected", making
offline-capable signing necessary rather than merely elegant.

---

### VERDICT

**The "genuinely disconnected ship" premise is dead. The offline argument survives —
but on completely different ground, and in a weaker, narrower form than assumed.**

1. **Bunkering does not happen mid-ocean.** It happens at berth or at anchorage, inside
   or immediately adjacent to port limits, under harbour-master approval. The "vessel
   signing a delivery note mid-ocean at 3am" scenario is factually wrong. Drop it.
2. **Broadband is now the norm.** 68,528 commercial vessels on LEO as of Q1 2026, 97.6%
   of them Starlink — and that dataset is a sample, not a census. Mid-ocean connectivity
   is no longer the binding constraint.
3. **BUT the strongest offline fact is the opposite of the expected one.** The
   connectivity gap is at the *point of delivery*, not at sea: Starlink is illegal inside
   Chinese territorial waters and enforcement started Dec 2025 — and Zhoushan is the
   world's #3 bunkering port. Territorial-waters Starlink tiers are also the most
   commercially restricted. Ports and anchorages are where the link is worst, not best.
4. **The durable argument is not offline *signing*, it is offline *verification*.**
   MARPOL requires the BDN on board for 3 years, readily available for inspection; fuel
   disputes and supplier insolvencies run for a decade (OW Bunker litigation was still in
   court nine years on). That is a real need, not a rationalisation.
5. **Uncomfortable finding the founder should see: Singapore already did this.** MPA
   mandated eBDN from 1 April 2025, published SS 709:2024, whitelisted five providers,
   and runs a **centralised e-BDN verification facility** on digitalPORT@SG. A
   port-authority-run central registry is now the incumbent, in the largest bunker port
   in the world. This is a competitor, and a well-funded one.

---

### 1. Broadband penetration of the merchant fleet

**[VERIFIED] 68,528 commercial vessels connected via LEO broadband, Q1 2026.**
66,866 Starlink (97.6% of LEO), 1,662 OneWeb. Starlink direct ~27,000 vessels;
Speedcast and Marlink ~6,500–7,000 each; Navarino claims ~6,000 (Valour tracks ~3,500).
Offshore energy = 6,826 vessels, $334.2m/yr, highest revenue segment. Dataset explicitly
**excludes fishing and leisure**. Valour states it captures 74% of retail LEO broadband
revenue — i.e. a sample, so the true connected count is **higher**, not lower.
Source: Valour Consultancy, Q1 2026 Maritime Connectivity Market Tracker, pub. 2026-05-26.
https://valourconsultancy.com/q1-2026-maritime-connectivity-market-tracker-update/

**[VERIFIED] 38,300+ vessels on GEO VSAT/LEO as of May 2025**; Valour predicts LEO
subscriptions overtake GEO VSAT by end-2026.
https://valourconsultancy.com/maritime-connectivity-tracker-may-2025/

**[VERIFIED] Cost collapsed in 2026.** Starlink launched an unlimited, no-data-cap
maritime plan for IMO-registered cargo and tanker vessels, with free Flat High
Performance terminal on activation/upgrade and a second terminal + SD-WAN router free
for existing customers; ~220 Mbps typical. Published 2026-07-13.
https://thedigitalship.com/news/electronics-navigation/unlimited-starlink-comes-to-merchant-shipping-no-data-caps-free-gear/
This reverses the May 2025 move to caps (50GB/$250, 1TB/$1,000, 5TB/$5,000, throttled to
1 Mbps over-cap). Note this is a promotion routed via a reseller (Elcome) — the *offer*
is verified, its durability is not.

**[UNVERIFIED — denominator not nailed down.] Web-search summary of UNCTAD Review of
Maritime Transport 2025 gives ~112,500 vessels ≥100 GT at start of 2025.**
https://unctad.org/system/files/official-document/rmt2025_en.pdf
I did not open the PDF to confirm the figure — treat as indicative. Caveat that matters:
the ≥100 GT universe is padded with tugs, small coasters and service craft that never
take a barge bunker delivery. The relevant denominator is the deep-sea trading fleet
(order ~60,000 ships ≥1,000 GT). Against that, ~68.5k LEO-connected commercial vessels
means **broadband is the norm**. Direction is unambiguous even though the ratio is not.

**Breakdown by vessel type/size: NOT FOUND at fleet level.** Valour breaks out offshore
energy and cruise but the public posts do not give a merchant-fleet-by-segment
penetration table. Getting that requires buying the tracker. Flagging as a real gap.

**Method note:** vendor and reseller pages ("Starlink for Ships: 2026 Guide", Global
Satellite USA, Clarus, Marineconnect) are **MARKETING, not penetration evidence** and
were excluded. Valour Consultancy is a paid analyst house, not a registry — it is the
most credible fleet-wide publisher found, but it is not a primary count.

---

### 2. How reliable is that connectivity in practice?

**[VERIFIED — STRONGEST PRO-OFFLINE FINDING] Starlink is illegal in Chinese territorial
waters, and enforcement began December 2025.** Ningbo Maritime Safety Administration
issued China's first penalty for shipboard Starlink use inside the 12nm limit, found on
routine inspection at Ningbo; a "micro rectangular antenna" had continued transmitting
after the ship entered Chinese waters. Legal basis: Chinese telecoms regulation requiring
approval for all radio devices and requiring traffic to pass through state-managed
gateways. Ma Yanchao, Ningbo MSA: "We will take this landmark first case as an
opportunity to continue to intensify enforcement against illegal radio communication
activities in our jurisdiction." Exposure: fines, equipment confiscation, vessel detention.
https://gcaptain.com/china-issues-first-penalty-for-starlink-use-in-territorial-waters/ (2025-12-22)
https://safety4sea.com/china-imposes-penalty-to-vessel-using-starlink-in-its-waters/
https://maritimecyprus.com/2026/01/13/china-regulations-on-satellite-communications-starlink/ (2026-01-13)

**WHY THIS MATTERS: Zhoushan is the world's THIRD-LARGEST bunkering port** — 8.03m tonnes
in 2025, +10.6% YoY, having overtaken both Fujairah and Antwerp-Bruges. Zhoushan bunkers
substantially **at anchorages**, and has added priority berths and night-time anchorage
bunkering to raise throughput.
https://shipandbunker.com/news/apac/270797-zhoushan-bunker-sales-rose-by-106-on-the-year-in-2025
https://bunkerindex.com/articles/article.php?a=22418&h=zhoushan-becomes-worlds-third-largest-bunker-port
=> **At the world's #3 bunker port, the receiving vessel is legally required to have its
LEO broadband switched off at the exact moment it is bunkering.** This is the single best
dated, non-hypothetical offline window found in this sweep — and it is at a berth, not
at sea.

**[VERIFIED] Territorial waters are the most restricted part of the Starlink product
line.** Roam tiers cap territorial-waters use (5 consecutive days / 60 days per year);
unlimited territorial-waters use requires the pricier Ocean Mode. India, Pakistan, Saudi
Arabia, UAE, Lebanon, Syria and Libya sit in a regulatory grey zone (pending approval or
not live). So the in-port / at-anchorage case — exactly where bunkering happens — is
where the service is weakest and most legally constrained.
Product terms: https://www.starlink.com/
Secondary (INDICATIVE, blog): https://blog.navily.com/en/blog/starlink-on-boats-plans-rules/
Country status (INDICATIVE, aggregator): https://www.mappr.co/starlink-availability-by-country/

**[VERIFIED] Operational systems are often NOT permitted on the crew link, by design.**
IACS UR E26 ("Cyber Resilience of Ships") and UR E27 apply to ships contracted for
construction on/after 1 July 2024. OT networks must be segregated from IT networks **and
from crew internet access**, with documented network architecture and evidence of
separation.
https://iacs.org.uk/news/iacs-ur-e26-and-e27-press-release
https://www.classnk.or.jp/hp/en/activities/cybersecurity/ur-e26e27.html
https://ww2.eagle.org/en/rules-and-resources/regulatory-updates/regulatory-news-articles/IACS-Unified-Requirements-on-Cyber-Resilience.html
IMPLICATION: "the ship has Starlink" ≠ "the bunkering document system may use it". This
is a **governance** gap rather than a coverage gap, and it is real and hardening. A
document workflow that assumes a live link may simply not be allowed onto it.

**[VERIFIED via search snippet; direct fetch 403] Practitioners say offline mode is
mandatory for eBDN.** At SIBCON 2024, ZeroNorth: an offline mode is "a critical component
to execute the full workflow without being connected to the internet and submit
everything to all the parties when the system is back online."
https://www.manifoldtimes.com/news/sibcon-2024-zeronorth-discusses-challenges-and-opportunities-of-singapore-digital-bunkering-landscape/
Note: ZeroNorth is a vendor of an eBDN product — self-interested, but it is a
practitioner statement about the operating environment, and it is corroborated by
FuelBoss marketing "even offline". Treat as INDUSTRY CONSENSUS, not independent proof.

---

### 3. Where does bunkering physically happen? [CRITICAL] — IN PORT OR AT ANCHORAGE

**Conclusion: overwhelmingly at berth or at anchorage, inside or immediately outside port
limits, under harbour-master control. Not mid-ocean.**

**[VERIFIED] Bunkering requires harbour-master notification and approval.** UK port
authority regulations define bunkering as transfer from a bunker vessel, truck or berth
manifold to a vessel, and require that bunkering "only takes place after notification to
and approval from the harbour master". A harbour master's jurisdiction is, by definition,
port waters.
https://www.peelports.com/media/c4pngmch/lrg3-bunkering-guidelines-and-regulations-v2.pdf
https://www.peelports.com/media/en2dzewt/mrg6-bunkering-guidelines-and-regulations-v2.pdf
https://www.portofgothenburg.com/maritime/bunkering/riktlinjer-vid-bunkring/

**[VERIFIED] Singapore — world's largest bunker port — bunkers inside port limits at
designated anchorages or alongside.** MPA licenses **"port limit bunker tankers"** (the
category name is itself the evidence) and operates a Special Bunkering Anchorage (SBA)
scheme, extended into the western sector specifically for vessels calling at the port
*solely to bunker*. Anchoring outside designated anchorages is prohibited; fines to
S$20,000 plus S$2,000/day continuing.
https://www.mpa.gov.sg/docs/mpalibraries/mpa-documents-files/oms/bunkering/standards-for-port-limit-bunker-tankers.pdf
https://www.mpa.gov.sg/media-centre/details/prohibited-anchoring-outside-designated-anchorages
Scale: Singapore sold **56.2m tonnes** of marine fuel in 2025, a record, +3.2% YoY.
https://shipandbunker.com/news/apac/456201-analysis-singapore-annual-bunker-sales-reach-new-record-high-in-2025

**[VERIFIED] Fujairah bunkers at its designated offshore ANCHORAGE areas (D, VN, VS)** —
an anchorage a few miles off the coast, not open ocean. ~408 vessel calls/month average
at the offshore anchorage.
https://fujairahport.ae/marine-centre/fujairah-offshore-anchorage-area/
https://fujairahport.ae/wp-content/uploads/2024/01/NTM346.pdf

**[VERIFIED] Even "OPL" (Outside Port Limits) bunkering is a coastal anchorage practice,
and it is being shut down.** Vessels historically anchored at Singapore's Outer Port
Limits to take bunkers; mariners are now prohibited from anchoring at the eastern and
western OPLs and may be detained or fined. Malaysia and Indonesia detain and fine ships
for unauthorised anchoring/bunkering in claimed waters. P&I clubs warn owners that OPL
bunkering forfeits MPA's supplier standards.
https://north-standard.com/insights-and-resources/resources/archive/articles/beware-bunkering-at-singapore-opl
https://www.chinapandi.com/index.php/en/loss-prevention-menu-en/loss-prevention-content-en/5679-article-5679
So even the "least in-port" variant is a few miles offshore in a busy strait — inside
terrestrial mobile coverage — not mid-ocean.

**TERMINOLOGY TRAP that could mislead a reader:** "ship-to-ship (STS) bunkering" does
**not** mean mid-ocean. In the bunker trade STS means barge-to-ship, and "most bunkering
fuel is supplied by bunker barges on a ship-to-ship (STS) basis **in the port area**".
LNG-bunkering market reports showing "STS = 52% share" are describing barge deliveries in
port, not high-seas transfers. Do not cite those as evidence of at-sea bunkering.
https://gulf-bunkering.com/what-is-ship-to-ship-sts-bunkering/
https://www.alg-global.com/blog/maritime/bunkering-brief-what-you-need-know-about-essential-maritime-practice

**[UNVERIFIED — GAP] I did not find a published quantitative split of berth vs anchorage
vs offshore deliveries.** AIS-based academic work exists that could produce it
(ScienceDirect S136655452100257X; MDPI 2071-1050/15/24/16711 — the latter returned 403)
but I could not open it inside budget. The qualitative evidence above is strong and
consistent across four jurisdictions; the precise percentage is not established.

**Genuine at-sea bunkering exists but is not a market:** naval replenishment-at-sea,
offshore support of fishing fleets, and illicit high-seas STS transfers used for sanctions
evasion (the "dark fleet"). The last is where BDN fraud is most rampant — and is
categorically not a customer.

---

### 4. Regulatory / insurance pressure to push vessel data to shore in real time?

**[VERIFIED] No. The reporting regimes are retrospective, not real-time.**
- **IMO DCS**: annual aggregated fuel oil consumption / distance / hours underway,
  submitted to flag state or verifier after year end.
- **EU MRV / UK MRV**: per-voyage data collected, but the verified Emission Report is
  submitted by **31 March of the following year**.
- **FuelEU Maritime**: first reporting period 2025; first report to a verifier due
  **31 January 2026**. Companies must "obtain, analyse, and store all monitoring data and
  documentation... emission factors, bunker delivery notes as evidence for verification
  purposes." Suppliers must supplement BDNs with GHG intensity and lower calorific value
  for biofuels; Proof of Sustainability now often required alongside the BDN.
https://transport.ec.europa.eu/transport-modes/maritime/decarbonising-maritime-transport-fueleu-maritime_en
https://www.dnv.com/maritime/insights/topics/mrv/
https://www.dnv.com/news/2025/new-reporting-requirements-for-ghg-compliance-services/
=> The regulatory pull is toward **retained, verifiable evidence**, not toward live
telemetry. That is favourable to the project's actual thesis, and it is the FuelEU/BDN
evidence chain — not connectivity — that is the live regulatory driver.

**[PARTLY VERIFIED, VENDOR-HEAVY] Insurance is moving to continuous monitoring, but
shore-side, not ship-transmitted.** Underwriters are pricing on behavioural intelligence
and per-vessel risk scores derived largely from AIS and satellite observation, plus
machinery-monitoring products (Ceto Watchkeeper; Chaucer/Ceto Lloyd's MGA launched
2026-03-25).
https://www.insurancejournal.com/news/international/2026/03/25/863407.htm
https://www.igpandi.org/article/the-international-group-clubs-discuss-the-importance-of-ships-complying-with-the-requirement-to-use-a-ships-automated-information-system-ais/
CAUTION: much of this material is Windward/Ceto content marketing — LABEL AS VENDOR.
Nothing found imposes a *requirement* that the ship push operational data ashore in real
time as a condition of cover.

---

### 5. Counter-consideration: offline-verifiable records on a connected ship

**Honest assessment: this is a REAL need, not a rationalisation — but it is a different
product argument than "ships are offline", and it must be stated as such.**

Evidence for:

**[VERIFIED] MARPOL Annex VI Reg. 18 requires the BDN to be retained ON BOARD for three
years, "kept on board the ship in such a place as to be readily available for inspection
at all reasonable times."** Fuel sample retained 12 months. Applies to ships ≥400 GT.
Electronic BDNs are accepted per IMO unified interpretation **MEPC.1/Circ.795/Rev.8**,
provided they are "protected from edits, modifications or revisions and authentication be
possible by a verification method such as a tracking number, watermark, date and time
stamp, QR code, GPS coordinates or other verification methods."
https://www.lr.org/en/knowledge/class-news/02-24/
https://safety4sea.com/lr-updates-marpol-annex-vi-interpretations-for-electronic-bunker-delivery-notes/
TWO EDGES: (a) a regulator has explicitly blessed self-contained, tamper-evident,
independently authenticatable records held on board — that is the project's shape. But
(b) the UI names **watermarks and tracking numbers** as acceptable, does not prescribe
digital signatures, offline access, or any technical tamper-evidence standard. The bar is
low. Clearing it is easy; differentiating above it earns no regulatory credit.

**[VERIFIED] Disputes genuinely run for years, and suppliers genuinely disappear.**
OW Bunker — ~7% of the global bunker trade, traders and physical suppliers in 29 countries
— collapsed 7 November 2014; almost all national entities entered their own bankruptcies.
Litigation over who owned the bunkers and who must be paid (ROT clauses, ING as assignee,
Res Cogitans in the UK Supreme Court, US 5th Circuit) was **still in court nine years
later**.
https://shipandbunker.com/news/apac/578042-nine-years-on-ow-bunker-lawsuits-continue
https://www.cliffordchance.com/content/dam/cliffordchance/briefings/2016/05/industry-insight-falling-dominos-the-ow-bunkers-corporate-collapse.pdf
https://comitemaritime.org/wp-content/uploads/2018/05/Session2-Davies-AcomparativeanalysisofnationalresponsestotheOWBunkercollapse.pdf
https://www.ca5.uscourts.gov/Opinions/pub/19/19-30418-CV0.pdf
=> A record whose verifiability depends on a live query to the supplier's server is worth
nothing in exactly the scenario that matters most.

**[VERIFIED] Quality disputes are frequent and rising.** VPS issued 37 bunker alerts in
2025, +37% on 2024; VLSFO global off-spec rate 5.4% in Q1 2025 (up from 4.4%); Europe
worst at 11.9% (2024). Singapore was the most frequent source of problem fuels.
https://shipandbunker.com/news/world/714937-vps-2025-marine-fuel-review
https://www.manifoldtimes.com/news/vps-reviews-2025-marine-fuel-quality-including-off-spec-and-contamination-issues/
https://www.vpsveritas.com/sites/default/files/2025-05/fuel_insights_52_-_executive_summary.pdf

Evidence against / the honest deflation:

**[VERIFIED] The central-registry answer already exists and is government-run.** MPA
mandated digital bunkering and eBDN as default in the Port of Singapore **from 1 April
2025**, after pilots from 1 November 2023; five MPA-whitelisted solution providers;
**SS 709:2024 Specification for Digital Bunkering Supply Chain Documentation** published
November 2024; and MPA runs a **centralised e-BDN record enquiry/verification facility**
on digitalPORT@SG so "key stakeholders (i.e. banks, vessel owners etc.) can verify the
authenticity of e-BDN data received from bunker suppliers against the information
transmitted to MPA."
https://www.mpa.gov.sg/port-marine-ops/marine-services/bunkering/digital-bunkering
https://www.mpa.gov.sg/media-centre/details/mpa-to-launch-digital-bunkering-for-enhanced-efficiency
In the world's largest bunker port, a public authority has already taken the trust-anchor
position with a centralised verification service. Any portable-attestation pitch must
answer "why not just use MPA's registry?" — and the answers (MPA covers only Singapore;
providers are not interoperable with each other; MPA cannot vouch for Zhoushan, Fujairah
or Houston; and a shipowner in a 2032 arbitration needs proof that does not depend on a
2026 portal still existing) are decent, but they are *interoperability and longevity*
arguments, not connectivity arguments.

**[VERIFIED] Provider fragmentation is the actual pain, and it is documented.** The five
whitelisted providers use "varying user-interface formats and/or verification methods" —
one requires a selfie of the chief engineer, bunker clerk and surveyor as anti-forgery
measure — which "may also raise concerns or invite scrutiny if ships recall a different
process used during another bunkering operation powered by a different solutions
provider" (Britannia P&I, Dec 2024; direct fetch 403, quote via search snippet — VERIFY
BEFORE CITING EXTERNALLY).
https://britanniapandi.com/2024/12/electronic-bunker-delivery-notes-ebdns-in-singapore/

---

### What would change my mind / open gaps

- **Fleet penetration by vessel type and size.** Not public. Requires the Valour tracker.
- **Quantitative berth/anchorage/offshore delivery split.** Not found; AIS papers exist
  but were paywalled/403 within budget.
- **UNCTAD fleet-size figure not read from the primary PDF** — only from search summary.
- **Britannia P&I and the SIBCON/ZeroNorth quotes came from search snippets** after
  403s on direct fetch. Confirm before external use.
- **Whether any port other than Singapore has mandated eBDN.** Rotterdam ran ZeroNorth/
  Vitol trials; not established whether a mandate followed.
  https://www.marinelink.com/news/zeronorth-vitol-trial-digital-bunker-519144

### Implication for positioning (one line)

Stop arguing "ships are offline". Argue: **the record must survive the port, the
provider, the supplier and the decade** — and note that at Zhoushan, the world's #3
bunker port, the ship is legally required to be offline while it bunkers anyway.


---

<!-- archived from research/04-incumbents-and-occupancy.md -->

## Sweep 04 — Incumbents and Occupancy: Marine Bunker Fuel Quality Evidence

**Date of sweep:** 2026-08-27
**Question:** Who already occupies this space, and has a regulator already named a system of record?
**Kill criterion:** If a regulator already runs the register of record for bunker delivery evidence, the founder's filter rules the project out.

STATUS: COMPLETE (with named gaps at the end).

---

### VERDICT

**BAD NEWS, and it is the answer to the kill question. In the world's largest bunkering
port, a regulator already runs the register. In the EU, a second regulator already runs a
second one. Judged on the BDN itself, the founder's filter rules this project out.**

Three separate closures, in order of severity:

1. **Singapore MPA — closed, live, mandatory.** e-BDN mandated 1 Apr 2025; national data
   standard SS 709:2024; six whitelisted vendors; MPA-operated centralised e-BDN record
   verification facility on digitalPORT@SG. Regulator = format-setter + gatekeeper +
   register operator.
2. **EU / EMSA — closed, live.** The FuelEU Database inside THETIS-MRV is "developed,
   hosted and managed by EMSA", with accredited verifiers as gatekeepers, running since
   1 Jan 2025.
3. **IMO — closing, but not yet closed and genuinely uncertain.** The Net-Zero Framework
   would give IMO a recognised-certification-scheme list (by 1 Mar 2027) and a GFI
   Registry. Its adoption was **adjourned on 16 Oct 2025 by 57–49–21** and resumes
   **October 2026**. This is the one fork still open, and it closes or doesn't within
   weeks of this sweep.

**Plus a dead precedent with almost exactly this thesis.** BunkerTrace Ltd — DNA tracers
plus blockchain for marine fuel chain of custody, backed by BLOC/Maritime Blockchain Labs
with Lloyd's Register FOBAS, BIMCO and IBIA — is in **liquidation** at Companies House.
Standards-body endorsement did not save it.

**The one narrow thing this sweep did NOT close.** The BDN carries *delivery quantity* and
the supplier's *self-declaration*. Singapore's stack (MFM 2017 → e-BDN 2025 → MPA register)
industrialised the **quantity** chain and left the **quality** chain alone. Independent
ISO 8217 lab certificates and, critically, the **custody of the retained sample**, are
still PDFs on lab letterheads behind lab portals — trusted by brand, not verifiable by a
stranger, and not inside any regulator's register found here. That is a real but much
smaller opportunity than "bunker fuel evidence", it is adjacent to rather than inside the
occupied ground, and it is exactly the ground on which BunkerTrace died. Do not treat it as
a rescue of the original idea without first reading BunkerTrace's insolvency filings.

---

### 1-line summary of the occupancy picture

Singapore's MPA (a) mandated e-BDN from 1 April 2025, (b) published a national data
standard (SS 709:2024) for digital bunkering documentation, (c) whitelists the vendors
permitted to issue e-BDNs, and (d) operates a centralised e-BDN record verification /
enquiry facility on its own digitalPORT@SG portal, against which stakeholders verify an
e-BDN they receive. That is a regulator-operated system of record plus a
regulator-operated verification service plus a regulator-controlled vendor whitelist.

Remaining possible gap (to be tested below): the BDN carries *delivery* facts and a
supplier's *self-declaration* of sulphur/quality. Independent **quality test evidence**
(lab certificates, ISO 8217 conformity, off-spec disputes) is NOT the BDN and appears NOT
to be inside MPA's register. See section 6 on whether MFM+e-BDN solved quantity but not
quality.

---

### 1. Electronic Bunker Delivery Notes (e-BDN) — regulators

#### Singapore — MPA [VERIFIED]

- **Mandate, not pilot.** From **1 April 2025**, all bunker suppliers licensed in
  Singapore must provide digital bunkering services and issue e-BDNs **as default**.
  Announced **9 October 2024** at SIBCON 2024.
  Source: https://www.mpa.gov.sg/media-centre/details/advancing-maritime-digitalisation--decarbonisation-and-manpower-development-efforts-at-sibcon-2024 (9 Oct 2024)
- **Trials** began November 2023; so the sequence was pilot (Nov 2023) → mandate (Apr 2025).
- **Technical standard: SS 709:2024**, "Specification for Digital Bunkering Supply Chain
  Documentation", published **November 2024**. Purpose stated as "consistency and
  interoperability between digital systems." Also SS 648 (Code of Practice for Bunker Mass
  Flow Metering, revised).
- **REGULATOR RUNS THE REGISTER [VERIFIED]:** MPA operates an **e-BDN record enquiry
  system** accessible via **digitalPORT@SG**, letting stakeholders "verify the authenticity
  of e-BDN data" against what was transmitted to MPA. MPA's own release calls it a
  "centralised e-BDN record verification facility."
  Source: https://www.mpa.gov.sg/port-marine-ops/marine-services/bunkering/digital-bunkering
- **Vendor whitelist [VERIFIED]** — MPA-approved digital bunkering solution providers:
  - Angsana Technology — BunkerFlow
  - BTS Pte Ltd (ZeroNorth) — digitalBunkering@Sea
  - Bunkerchain Pte Ltd — Touch and Sail
  - TradeGo Pte Ltd — BunkerGo
  - Ofiniti Pte Ltd — Fuelboss (DNV-associated brand — verify)
  - Brightree Pte Ltd — BrightNote
  Source: same MPA digital bunkering page.
  Implication: in Singapore you cannot issue an e-BDN through an unapproved format. This
  is a permissioned, regulator-gated market, the opposite of "verifiable by a stranger
  without asking anyone's permission."

#### Rotterdam — pilot only, so far [VERIFIED as pilot]

- **Nov 2024:** ZeroNorth + Vitol + Port of Rotterdam ran a ~4-week trial (3–4 deliveries)
  using ZeroNorth's eBDN. Billed as first in Europe. Stated intent to integrate into port
  and supplier systems afterwards.
  Sources: https://zeronorth.com/zeronorth-and-vitol-launch-digital-bunker-trial-in-port-of-rotterdam ; https://www.marinelink.com/news/zeronorth-vitol-trial-digital-bunker-519144
- This is a **PILOT with a commercial vendor**, not a mandate, and not (yet) a
  port-authority-operated register. NEEDS RECHECK for 2025–26 status.

#### China / Shanghai [UNVERIFIED detail]

- Reported China's first fully digitalised bonded bunkering operation using eBDN, ~1 April
  2025. Source: https://www.offshore-energy.biz/chinas-first-fully-digitalized-bunkering-op-completed-using-ebdn/
- Status (pilot vs mandate) and who holds the record NOT established.

#### Other authorities — NOT YET CHECKED

Fujairah/UAE (FOIZ), Panama, India (DG Shipping), Hong Kong, ARA ports beyond Rotterdam,
US Coast Guard. Treat as open.

---

### 2. IMO: MEPC outputs, GISIS, DCS

- **MEPC 80 (July 2023)** agreed a unified interpretation permitting BDNs in electronic
  form. Consolidated in **MEPC.1/Circ.795/Rev.8**, issued **12 January 2024**. [VERIFIED]
  Source: https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/Circulars/MEPC.1-Circ.795-Rev.8%20-%20Unified%20Interpretations%20To%20Marpol%20Annex%20Vi%20(Secretariat).pdf
  Also LR Class News 02/2024: https://www.lr.org/en/knowledge/class-news/02-24/
- **Substance of the UI:** an e-BDN must carry the same minimum content as MARPOL Annex VI
  Appendix V, "should be protected from edits, modifications or revisions", and
  authentication should be possible "by a verification method such as a tracking number,
  watermark, date and time stamp, QR code, GPS coordinates or other verification methods."
  **IMPORTANT READ:** the IMO names NO format, NO register, NO trust anchor. It is
  outcome-worded and technology-neutral. The IMO has NOT closed this space. The closure
  risk is national (Singapore), not global.
- **Resolution MEPC.385(81)**, in force **1 August 2025**: amendments covering fuel
  sampling, BDNs, and fuel consumption data; low-flashpoint/gas fuels require a BDN with a
  signed supplier declaration of MARPOL Annex VI Reg. 18 quality conformity. [VERIFIED via
  LR Class News 04/2025: https://www.lr.org/en/knowledge/class-news/04-25/ ] — primary IMO
  text NOT yet read.
#### THE SECOND CLOSURE RISK: IMO Net-Zero Framework, FLL, SFCS list, GFI Registry

- **2024 LCA Guidelines, Resolution MEPC.391(81)** (MEPC 81, March 2024) introduce a
  **Fuel Lifecycle Label (FLL)**, described by IMO as "a technical tool to collect and
  convey the information relevant for the lifecycle assessment." [VERIFIED]
  Source: https://www.imo.org/en/ourwork/environment/pages/lifecycle-ghg---carbon-intensity-guidelines.aspx
- **MEPC 82 (Oct 2024)** invited member states to develop a **sustainable fuels
  certification framework**. [VERIFIED, same source]
- **MEPC 83 (April 2025)** approved the Net-Zero Framework package. Reported that the FLL
  is to **accompany the Bunker Delivery Note**, that **Sustainable Fuel Certification
  Schemes (SFCS) are to be approved by MEPC**, that **IMO would publish a list of
  recognised SFCSs by 1 March 2027**, and that Statements of Compliance would be entered
  into an **IMO GFI Registry**.
  [UNVERIFIED against IMO primary text — sourced from secondary summaries incl.
  https://www.dnv.com/news/2025/imo-mepc-83-ghg-requirements-approved-taking-effect-from-2028/
  and https://normecverifavia.com/news/imo-mepc83-net-zero-framework/ . IMO's own LCA page
  does NOT mention the SFCS list, the registry, or the BDN linkage. TREAT AS UNCONFIRMED.]
- **BUT: adoption was ADJOURNED [VERIFIED].** At the extraordinary MEPC session
  **14–17 October 2025**, a motion (proposed by Saudi Arabia, under US pressure) to adjourn
  adoption for one year passed **57 for / 49 against / 21 abstentions**. Talks resume
  **October 2026**; ISWG-GHG 21 and MEPC 84 met April 2026.
  Sources: https://www.imo.org/en/mediacentre/pressbriefings/pages/imo-net-zero-shipping-talks-to-resume-in-2026.aspx ; https://www.dnv.com/news/2025/decision-on-the-imo-net-zero-framework-delayed-for-one-year/ ; https://www.velaw.com/insights/imo-postpones-adoption-of-net-zero-framework/
- **READ:** the IMO is on a path to becoming the trust anchor that decides *whose fuel
  certification counts* (the SFCS recognition list). That is precisely the "who decides
  whose signature counts" problem. It is **not settled**, and the October 2026 vote is
  ~6 weeks away from this sweep. This is a dated, checkable fork.
- **Scope caveat:** FLL/SFCS is about **lifecycle GHG intensity and sustainability**, not
  ISO 8217 **fitness-for-use quality**. They are different evidence objects that travel
  with the same delivery.

#### EU — EMSA runs a fuel database [VERIFIED]

- **FuelEU Maritime** monitoring began **1 January 2025**. Reporting/verification runs
  through the **FuelEU Database, "developed, hosted and managed by EMSA"**, attached to
  **THETIS-MRV**. Verifiers must record verification in THETIS-MRV by 31 March following.
  Sources: https://emsa.europa.eu/thetis-mrv/items.html?cid=2&id=5306 ; EMSA FuelEU tutorials (Nov 2025) https://emsa.europa.eu/we-do/digitalisation/2-news/5576-new-video-tutorials-for-fueleu-maritime-shipping-companies-and-verifiers.html
- So in the EU too, **a regulator (EMSA) operates the database of record** for ship fuel
  energy/emissions data, with accredited verifiers as the gatekeepers. Again: closed,
  permissioned, regulator-operated.
- NOT CHECKED: whether BDNs themselves are lodged in THETIS-MRV or merely held as
  supporting evidence by the company and its verifier.

- **NOT YET CHECKED:** IMO DCS / GISIS fuel oil consumption database.

### 3. Commercial incumbents

#### e-BDN vendors (the MPA whitelist is the de facto incumbent list)
- **ZeroNorth** (via BTS Pte Ltd) — "digitalBunkering@Sea" in Singapore; eBDN product
  marketed as "digital, signature-ready, audit-trailed" (https://zeronorth.com/ebdn). Also
  ran the Rotterdam trial. Closed commercial platform.
- **Bunkerchain Pte Ltd** — "Touch and Sail". Blockchain-branded, Singapore.
- **Angsana Technology** — BunkerFlow.
- **TradeGo** — BunkerGo.
- **Ofiniti** — Fuelboss (FuelBoss is a DNV-originated platform — confirm relationship).
- **Brightree** — BrightNote.
All six are **closed platforms whitelisted by a regulator**. Verification is by asking
MPA's portal, not by a stranger checking a signature. [VERIFIED from MPA page]

#### Bunker procurement / management platforms (closed platforms, all of them)
- **ZeroNorth** — acquired **ClearLynx** (rebranded ZeroNorth Bunker). Now spans
  procurement, eBDN, and (with **Veracity by DNV**) emissions reporting and verification.
  The most consolidated incumbent found.
  Sources: https://shipandbunker.com/news/world/746909-zeronorth-buys-clearlynx ; https://zeronorth.com/press/zeronorth-and-veracity-by-dnv-launch-emissions-reporting-and-verification-service
- **Integr8 Fuels** — ENGINE platform, bunker procurement + market intelligence.
  https://integr8fuels.com/engine/
- **KPI OceanConnect** (Bunker Holding group) — AuctionConnect online bunker purchasing,
  running since 2000. https://kpioceanconnect.com/
- **Veracity by DNV** — industry data platform; sells "Bunker Vision" bunker quality
  analytics. https://store.veracity.com/bunker-vision . Note DNV sits on BOTH sides: it
  runs a data platform AND (via FuelBoss/Ofiniti) an MPA-whitelisted e-BDN solution.
- **Assessment:** every one is a **closed platform**. Evidence is verifiable by
  counterparties *inside* the platform, or by trusting the platform operator. None found
  offers evidence a stranger with no account can verify.

#### Fuel quality testing labs (the quality-evidence incumbents)
- **VPS (Veritas Petroleum Services)**, **Intertek Lintec**, **Maritec (Bureau Veritas)**,
  **Lloyd's Register FOBAS**, **SGS**, **FOI Labs**.
- What they do: ISO 8217 conformity testing, adulterant screening, pre-burn advisories,
  off-spec claims support. Intertek reports 4–6h turnaround so results can precede pumping.
  Source: https://www.intertek.com/marine/bunker-analysis/
- **KEY STRUCTURAL POINT [VERIFIED by absence, to be firmed up]:** these labs issue
  certificates as **PDFs on their own letterhead, retrieved from their own customer
  portals**. The evidence is trusted because the lab's brand is trusted, not because a
  stranger can verify it. There is no cross-lab portable format found so far. **This is
  where the gap, if any, lives.**

### 4. Standards bodies (BIMCO, IBIA, ISO, DNV, LR, ABS, IAPH)

- **BIMCO + IBIA Bunkering Guide (June 2018)** — covers sampling and BDNs. Paper-era.
  https://www.bimco.org/media/idmahrk3/bimco-ibia-bunkering-guide-jun2018.pdf
- **BIMCO + IBIA Shipmaster's Bunkering Manual 2022** — describes BDN and "certificates of
  quality" paperwork. https://ibia.net/the-bimco-ibia-shipmasters-bunkering-manual-2022/
- **BIMCO Bunker Terms 2018**, Bunker Quality Control Clause for Time Chartering — these
  are the *contractual* layer that gives quality evidence its legal bite.
- **ISO 8217** — the fuel specification itself (2024 edition is current; verify). It
  specifies fuel properties, NOT a document format.
- **SS 709:2024 (Singapore Standard)** — "Specification for digital bunkering supply chain
  documentation". Published Nov 2024 by Enterprise Singapore / Singapore Standards Council.
  **82 pages, PAID: USD 77.05 + GST.** References SS 648-1, SS 648-2, SS 600, SS 660.
  [VERIFIED] https://www.singaporestandardseshop.sg/Product/SSPdtDetail/caabaea9-9699-4109-a663-7caa98615f9d
  A paywalled national standard is a poor base for an open, stranger-verifiable format.

#### THE FORMAT WORTH EXTENDING: IMO Compendium eBDN data set [VERIFIED — best find]

- The **IMO Compendium on Facilitation and Electronic Business** contains a published
  **Electronic Bunker Delivery Note (eBDN) data set**, openly readable at
  https://imocompendium.imo.org/public/IMO-Compendium/Current/DS/Electronic%20Bunker%20Delivery%20Note/d11.htm
- ~**60 data elements** across: voyage/port, delivery documentation (issue date, metering
  ticket, supply method), fuel specification (type, density, sulphur, temperature, pour
  point, flash point), supplier identity and licence, ship acknowledgement (**sample seal
  numbers**, SDS receipt), delivery events (alongside, pumping start/end, cast-off), and
  vessel identity (IMO number, name, GT).
- References **UN/LOCODE**, **UN/EDIFACT code 3207**, **ISO 3166-1 alpha-2**, and
  IMO-maintained code lists. Includes UML structure. Free and implementable by third
  parties.
- **Recommendation: extend this, do not invent a new schema.** It is the only free,
  international, implementation-ready bunker document data model found. Note it contains
  the **sample seal number** field — the hook for attaching quality evidence.
- CAVEAT: the Compendium is a *data harmonisation reference*, not a mandated format, and
  no version/date was extractable from the page. Confirm the edition.

- **NOT CHECKED:** ABS and IAPH digital bunkering publications; DNV's own published
  standards (as opposed to its FuelBoss/Veracity commercial products).

### 5. Graveyard: failed consortia and abandoned pilots

- **BunkerTrace** (JV of **BLOC** / Maritime Blockchain Labs and **Forecast Technology**,
  founded 2019, Banbury UK). Combined synthetic DNA fuel tracers with blockchain to give a
  tamper-evident chain of custody for marine fuel — i.e. **almost exactly the thesis**.
  First pilot completed 2 Oct 2019; commercial launch 2020.
  Sources: https://www.forecasttechnology.com/2019/10/04/bunkertrace-dna-tracing-pilot-successfully-completed/ ; https://www.ledgerinsights.com/bunkertrace-dna-blockchain-maritime-fuel-tracking/
  **DEAD [VERIFIED].** BUNKERTRACE LIMITED, UK company number **12101569**, incorporated
  13 July 2019, **company status: Liquidation**. Last accounts to 31 December 2023.
  Primary source (Companies House):
  https://find-and-update.company-information.service.gov.uk/company/12101569
  (Parent Forecast Technology Limited, 08653012, remains Active.)
  **This is the single most important precedent in this file: the closest prior attempt at
  tamper-evident, portable bunker fuel quality/provenance evidence went into liquidation,
  despite BIMCO/IBIA/Lloyd's Register FOBAS backing and heavy press coverage 2019–2021.**
  Cause of death NOT established — find out before building. Likely candidates to test:
  no party would pay for evidence they were not compelled to produce; the DNA-tracer cost
  per delivery; and MPA's mandate arriving to route the demand to whitelisted vendors.
- **Maritime Blockchain Labs (MBL) bunker quality assurance pilot** — BLOC subsidiary,
  with **Lloyd's Register FOBAS, BIMCO and IBIA** as partners. So the standards bodies
  *already backed* a bunker-quality-provenance pilot, and it did not become infrastructure.
  [UNVERIFIED as to outcome/date of wind-down.]
- **BLOC + GoodFuels Marine** — "world's first bunker delivery using blockchain" (2018).
  No evidence found of it becoming a running system.
  Source: https://www.cleanerseas.com/bloc-and-goodfuels-marine-announce-worlds-first-bunker-delivery-using-blockchain-tech/
- **Reading:** this space has a graveyard of well-connected, standards-body-endorsed
  provenance pilots. Endorsement by BIMCO/IBIA/LR was NOT sufficient to survive. Any plan
  that assumes "get the standards bodies on board and it will stick" is contradicted by
  the record.

### 6. Mass flow metering — what it solved and did not

- **Mandate [VERIFIED]:** MFM compulsory for marine **fuel oil** delivery in the Port of
  Singapore from **1 January 2017**; the quantity on the BDN is derived **exclusively**
  from the MFM totaliser. Later extended to distillates (date to confirm).
  Sources: https://www.skuld.com/topics/ship/bunkers/singapore-mass-flow-metering-for-bunkering/ ; https://shipandbunker.com/news/apac/556814-mpa-issues-reminder-circular-as-singapore-enters-era-of-mandatory-mass-flow-meter-use-for-mfo-bunkering
- **Driver:** repeated short-delivery allegations; sounding/ullage tables were manipulable
  and air-entrainment ("cappuccino bunkers") inflated volumetric readings.
- **What it solved: QUANTITY.** Mass measurement, ~0.5% accuracy, no moving parts in the
  flow, immune to entrained air.
- **What it did NOT solve: QUALITY.** MFM measures mass, not composition. It says nothing
  about sulphur, cat fines, flash point, stability, or adulterants. Those remain evidenced
  by (a) the supplier's self-declaration on the BDN and (b) an independent lab test of a
  sample whose own custody chain is the actual weak point.
- **Therefore [ANALYTIC, not a source claim]:** Singapore has now industrialised the
  *quantity* evidence chain (MFM → e-BDN → MPA register) and has NOT industrialised the
  *quality* evidence chain. The residual problem is sample custody + lab certificate
  portability. That is a narrower opportunity than "bunker evidence", and it sits
  *adjacent to* rather than *inside* the regulator's register.

### Open questions / not verified

Highest value first:

1. **Why did BunkerTrace die?** Companies House filing history + insolvency documents for
   12101569 are public. Read them. This is the cheapest possible way to avoid repeating a
   failure with the same shape as the plan.
2. **Is MPA's e-BDN record enquiry open to a stranger, or account-gated?** It sits on
   digitalPORT@SG, which normally needs Singpass/Corppass. If it is account-gated to the
   transacting parties, a *third-party* verification gap technically survives — but MPA
   still owns the register, so this is a thin reed.
3. **October 2026 IMO vote** on the Net-Zero Framework. If adopted, IMO publishes a
   recognised Sustainable Fuel Certification Scheme list by 1 March 2027 and operates a
   GFI Registry — a regulator-run trust list for fuel evidence. Verify the SFCS/registry
   claims against the actual MEPC 83 report (MEPC 83/WP.x / resolution text), not
   secondary summaries.
4. **Where do lab quality certificates actually live?** Confirm that VPS / Intertek Lintec
   / Maritec / FOBAS issue PDFs from their own portals with no cross-lab verifiable
   format. If confirmed, that is the only unoccupied ground found in this sweep.
5. **Sample custody.** MARPOL requires a retained sample; the seal number is on the BDN and
   in the IMO Compendium data set. Disputes turn on whether the sample tested is the sample
   delivered. Nobody found so far provides cryptographic evidence of that link.
6. Fujairah/UAE, Panama, India, Hong Kong, Shanghai MSA e-BDN status — unchecked.
7. Rotterdam status 2025–26 — did the ZeroNorth/Vitol trial become a mandate or a
   port-operated register?
8. ISO 8217 current edition and whether ISO has any digital-certificate work — unchecked.
9. Two US patents surfaced on "monitoring and verifying bunker fuel exchange between marine
   vessels" (USPTO 12241768, 12242997). Freedom-to-operate NOT assessed. Someone should.

### Search budget note

Sweep completed within budget. Sections 2 (GISIS/DCS), 4 (ABS/IAPH) and the non-Singapore
authorities in section 1 are the acknowledged thin spots.


---

<!-- archived from research/05-aviation-comparator.md -->

## Sweep 05 — Aviation Parts Comparator

Research completed 2026-08-27. Status: COMPLETE (3 gaps listed at the end).

### BOTTOM LINE
**Recommendation #9 still has no named owner.** Verified as of 2026-08-27: the
coalition's own recommendation page lists no owner; the Oct 2024 report names no
implementing entity; the Sept 2025 progress report covers only the five SHORT-TERM
recommendations and is silent on #9; and the coalition has published **nothing at all
in 2026**. #9 is a "long term" item, which the report defines as **over 5 years**.
No regulator (FAA, EASA) has designated a system of record; EASA's own blockchain
study, VIRTUA, concluded in Sept 2024 and stepped back.
**The founder's opening is still open.** Two caveats: the adjacent recommendation #5
(digital ARCs) HAS acquired an owner — the Aeroxchange-sponsored eARC working group,
which delivered the first electronic 8130-3 in Oct 2025 — so momentum is building from
the short-term end toward #9; and one gap remains (the gated progress-report PDF).


Conventions: [VERIFIED] = confirmed against a primary/named source with URL.
[UNVERIFIED] = not yet confirmed, or only trade-press assertion.

### 1. Coalition name, membership, recommendation text

[VERIFIED] Name is exactly **the Aviation Supply Chain Integrity Coalition** (ASCIC).
Site: https://aviationsupplychainintegrity.com/
[VERIFIED] Formed Feb 2024 (Reuters, 2024-02-22). Report delivered 2024-10-09.
[VERIFIED] **13 recommended actions** in 3 categories: Vendor Accreditation;
Document Traceability & Verification; Non-Serialized Parts Traceability.
Co-chairs: former NTSB Chairman Robert L. Sumwalt; former US DOT Deputy Secretary
John D. Porcari.

### 2. DECIDING QUESTION — does Recommendation #9 have an owner?

[VERIFIED — as of 2026-08-27] Rec #9 exists and is what the founder thinks it is:
> **Recommendation #9: Establish Voluntary Industry Database of Back-to-Birth
> Parts Documentation** — Long Term.
> Establish a voluntary database of digitized ARCs to achieve "BtB traceability
> for all parts, including non-serialized 'standard' parts".
Source: https://aviationsupplychainintegrity.com/recommended-actions/documents-traceability-verification/
The coalition's own page lists **no named owner/lead** for #9 (nor for #5–#8).

[VERIFIED] Coalition news page shows **NO items dated 2026**. Most recent output is
the progress report of **2025-09-25**. (https://aviationsupplychainintegrity.com/news/)

### 3. Other recommendations (OCR, bilateral API validation)

From the Document Traceability & Verification page (primary, coalition-published):
- **#5 Expand Use of Digital Key Documents / Digital Authentication Tools** — SHORT term.
  Notes digital ARCs incl. FAA Form 8130-3 and EASA Form 1 "have been authorized by
  the FAA since 2009" but adoption remains limited. [VERIFIED as coalition's own claim]
- **#6 Establish Standard for Required Information in Documentation** — MEDIUM term.
- **#7 Digitize Existing and Past-Parts Documents** — MEDIUM term. Explicitly names
  **Optical Character Recognition (OCR)**. [VERIFIED]
- **#8 Develop and Adopt Industry-Wide Use of Software Database to Verify Key Document
  Fields** — MEDIUM term. Explicitly names **APIs for real-time querying of ARC fields**
  (part number, form tracking number, serial number) against OEM / air carrier / PAH
  databases. [VERIFIED]
- **#9** — LONG term (see above).
No named owner stated for any of #5–#9 on the coalition's page.

#### Verbatim Rec #9 (from the report PDF, p.31)
> **RECOMMENDATION #9: Establish Voluntary Industry Database of Back-to-Birth Parts
> Documentation** … "While a long-term effort will require significant coordination
> across the industry, the Coalition believes in the value of establishing BtB
> traceability for as many parts as reasonably possible, and has established several
> suggested principles to inform a voluntary base that could be created…"
> "Long term, the Coalition recommends the establishment of a voluntary industry
> database of digitized ARCs with the goal of achieving BtB traceability for all parts,
> including non-serialized 'standard' parts."

[VERIFIED] Report defines **long-term = "over 5 years"** (short 12–24 months, medium
within 5 years). So #9 is a >5-year horizon item set in Oct 2024.
[VERIFIED] Rec #9's four stated principles: protection of proprietary information
(centralized third-party custodian OR OEM-standardized database); voluntary
participation; international accessibility; low barriers to entry.
[VERIFIED] **No implementing entity, sponsor, custodian or working group is named
anywhere in the recommendation.** The report says only that it "will require
significant coordination across the industry."
Source PDF: https://www.aviationsuppliers.org/asa/files/cclibraryfiles/filename/000000005402/Aviation%20Supply%20Chain%20Integrity%20Coalition%20-%20Report%20-%20FINAL.pdf

#### Membership / stakeholder engagement (Appendix B, VERIFIED)
Airframe mfrs: Airbus SE, The Boeing Company. Airlines: American, Delta, United.
Engine OEMs: GE Aerospace, Safran Group. Engine MROs: AAR Corp, GA Telesis,
MTU Aero Engines, StandardAero, Delta TechOps. Lessors: Shannon Engine Support.
Brokers: AerFin, CFM Materials. Exchange: Aeroxchange. Tech: Aramid Technologies.
Associations: AIA, ARSA, AFRA, ASA, GAMA, IATA.
[VERIFIED] "All 13 recommendations are unanimous." Recommendations are explicitly
**voluntary, industry-driven** — not regulatory.

#### Sept 2025 progress report
[VERIFIED] Coalition's 2025-09-25 release reports progress ONLY on the five
**short-term** recommendations (90% using accredited suppliers; ~90% strengthened
training; 70% acting on digital ARCs). It gives **no progress detail on #7, #8 or #9**
and names no owner for any recommendation.
https://aviationsupplychainintegrity.com/news/aviation-coalition-report-shows-progress-implementing-recommendations/
NOTE: the full progress-update PDF is gated behind an email form — not retrieved.
[UNVERIFIED] Whether the gated PDF assigns owners. Recommend the founder download it.

### 4. ATA Spec 2000 Chapter 16 electronic release certificates

[VERIFIED] The standard exists: **A4A Spec 2000 Chapter 16 — Authorized Release
Certificate**, an XML standard for electronic exchange of FAA Form 8130-3 / EASA Form 1.
Maintained by the ATA e-Business Program (Airlines for America).
https://ataebiz.org/spec-2000/ | https://publications.airlines.org/products/spec-2000-authorized-release-certificate-ch-16-revision-2019-1
Latest revision found in the A4A catalogue: **2019.1**.
[VERIFIED] Referred to by FAA, EASA and Transport Canada as an accepted method for
exchanging Form 8130-3 / Form 1 electronically (per ATA e-Business).
[VERIFIED — coalition's own words] "digital ARCs, including FAA Form 8130-3 and
EASA Form 1, have been authorized by the FAA since **2009**" but adoption "remains
limited". FAA enabling AC: **AC 120-78** (Acceptance and Use of Electronic Signatures,
Electronic Recordkeeping Systems, and Electronic Manuals), later AC 120-78A.
https://www.faa.gov/documentlibrary/media/advisory_circular/ac_120-78a.pdf

#### THE ADOPTION EVIDENCE — this is the strongest single datapoint in the sweep
[VERIFIED] **The first electronic 8130-3 was issued in October 2025.** Boeing shipped a
newly serviced 737 main battery to Southwest Airlines from its Davie, Florida service
centre; the digital ARC travelled via Aeroxchange's data-interchange platform.
Source: Aviation Week, 2025-10-13 —
https://aviationweek.com/mro/supply-chain/first-electronic-8130-3-issued-marking-digital-records-milestone
=> A standard legally usable since 2009 saw its FIRST production use in late 2025.
**That is a ~16-year gap. The founder's claim is not just true, it is understated.**
[VERIFIED] Still a pilot: expansion to wheels/brakes at Davie "soon", then Boeing's
eight other service centres **pending FAA approval**. No industry-wide adoption metric
was published.
[VERIFIED] Acceleration is attributed to the 2023 AOG Technics scandal; the article
names the **Aeroxchange-sponsored eARC working group** and credits ASCIC's recommendation.
[VERIFIED] Coalition Sept 2025 survey: **70% of respondents "taking action" on digital
ARCs** — note this is self-reported intent, not deployment, and sits alongside the fact
that only one had actually been issued by Oct 2025.

NOTE FOR THE FOUNDER: the Aeroxchange eARC working group IS a named owner — but for
Recommendation **#5** (digital ARCs), not #9 (back-to-birth database).

### 5. AOG Technics — scale and outcome

[VERIFIED] **Sentenced 23 February 2026**, Southwark Crown Court. Defendant
**Jose Alejandro Zamora Yrala** (38), director of AOG Technics Ltd. Pleaded guilty
(plea reported 2 Dec 2025) to operating a company for a fraudulent purpose.
Sentence: **4 years 8 months**. Prosecutor: UK Serious Fraud Office.
Primary: https://www.gov.uk/government/news/sfo-secures-conviction-in-international-aircraft-fraud
(Note: the GOV.UK release itself carries the narrative and date but NOT the numeric
figures — those come from SFO's court submissions as reported by press.)

[VERIFIED — reported from SFO court submissions] **60,000+ aircraft engine parts**
sold Jan 2019 – Jul 2023 with forged Authorised Release Certificates; parts worth
~£6.9m; AOG revenue >£7.7m (90% from fraud); fraud characterised as £39.3m/£40m in
scale (this larger figure is the fraud's overall value, not parts value — press
reports differ, treat with care).
[VERIFIED — attributed to CFM International, 2023] **126 CFM56 engines** identified
as fitted with AOG parts. This is CFM's own count, dating from the 2023 investigation,
NOT an SFO or coalition figure.
[VERIFIED] Affected carriers include United, Southwest, Delta, American; TAP Air
Portugal was the discovering operator (via Safran, June 2023).
[VERIFIED] Coalition report states **"less than one percent of CFM engines in service
were affected"** — useful counterweight; the scandal was severe in kind, small in fleet share.
[VERIFIED] FAA Unapproved Parts Notification 2023-AAE-EHL-20230801-7133, 21 Sep 2023.
UK SFO raided Zamora's London home 6 Dec 2023. FAA removed accreditor **Transonic**
from its Voluntary Industry Distributor Accreditation Program list, April 2024.

CAUTION: the "60,000+ parts and 126 engines" pairing is real but the two numbers come
from **different sources and different dates**. Cite them separately.

### 6. Regulator moves on a system of record

**Answer: NO. No regulator has designated a system of record for parts traceability.**

[VERIFIED] **EASA** — its SUP page is a *notification registry* (confirmed unapproved /
under investigation / stolen), governed by SIB 2017-13R1 (24/10/2018), ~7,998 cases,
most recent entries May 2026. It is a blacklist of known-bad parts, NOT a provenance
or system-of-record database. No mandatory traceability requirement, no designated
system of record, no 2025/26 rulemaking on this found.
https://www.easa.europa.eu/en/domains/aircraft-products/suspected-unapproved-parts
[VERIFIED] EASA maintains a dedicated AOG Technics parts page.
https://www.easa.europa.eu/en/domains/aircraft-products/suspected-unapproved-parts/aircraft-parts-distributed-aog-technics
[VERIFIED] **EASA VIRTUA project** (Digital Transformation – Case Studies for Aviation
Safety Standards – Virtualization) — blockchain for approved parts/airworthiness data,
run with FPT Software, IATA, SkyThread and PwC France. **Concluded September 2024 as a
study, not a system.** Its own conclusion: uncertainty about real benefits, and
regulators need to issue guidelines first. https://www.easa.europa.eu/sites/default/files/dfu/virtua_-_d-2.2_-_analysis_report_of_investigations_performed.pdf
=> EASA looked at exactly this problem and stepped back. Opportunity NOT closed.
[VERIFIED] **FAA** — SUP Program continues (AC 21-29D; Order 8120.16A); Unapproved
Parts Notifications still being issued into 2026. Accreditation is voluntary via
AC 00-56B. Nothing designating a system of record.
[VERIFIED] The coalition itself explicitly framed all 13 recommendations as
"**voluntary, industry-driven actions**", and asked Civil Aviation Authorities only to
"study alternatives for additional supplier accreditation standards" — i.e. the
coalition deliberately did NOT ask for a regulated system of record.

#### Competitive landscape flagged by the coalition itself (report §Parts Traceability)
[VERIFIED] The report names as exploratory: Digital Unique Identifier (DUI)
technology; blockchain — citing "an effort by PricewaterhouseCoopers and several
airlines" and EASA's VIRTUA. It says blockchain "remains particularly well suited to
tracking and authenticating aircraft parts registration but remains concerned with the
nascent nature of the technology." Also named in that passage: Northrop Grumman,
Rolls-Royce. Vendors circling the space include SkyThread, Aeroxchange, LocatorX.

### 7. Orphan statistics — DO NOT REPEAT EITHER AS STATED

#### "~2% of aviation parts in service are unapproved"
[UNVERIFIED — traces to nothing citable]
- The circulating form is "the FAA estimates 2% of the 26 million parts installed each
  year are counterfeit (≈520,000 parts)". It appears in trade blogs and vendor
  marketing (connectorsupplier.com, avtracint.com, aviationbusinessnews.com) with
  **no primary citation**.
- It does **not** appear in the Wikipedia article on unapproved aircraft parts.
- **Decisive negative check:** it does **not** appear in the DOT Office of Inspector
  General audit *Enhancements Are Needed to FAA's Oversight of the Suspected Unapproved
  Parts Program*, Report AV2017049, issued **30 May 2017** — the most authoritative
  modern government audit of the programme. Zero hits for "2 percent" or "26 million".
  https://www.oig.dot.gov/sites/default/files/FAA%20Oversight%20of%20SUPs%20Final%20Report%5E5-30-17.pdf
- That report says the opposite of a confident prevalence estimate: FAA "does not
  accurately track data, conduct trend analyses, or perform data analysis", cannot
  "accurately account for the number of SUPs", and **"does not have all the information
  it needs to understand the magnitude"** of the problem. Its whole SUP dataset was
  265 entries, 16 of them duplicates.
- Best guess at origin: the Mary Schiavo DOT-IG era (early-to-mid 1990s). ~30 years old,
  never re-substantiated.
**VERDICT: an orphan. The FAA cannot quantify this and its own auditor says so.
Repeating "the FAA estimates 2%" in a pitch is a credibility risk — and a well-briefed
GE/Safran person will know it.**
**Use instead, all verified:** the coalition's own "less than one percent of CFM engines
in service were affected"; the SFO's 60,000+ parts; CFM's 126 engines; and the fact that
the first electronic 8130-3 was issued in Oct 2025, 16 years after authorisation.

#### "Counterfeits cost the electronics industry $7.5bn a year"
[PARTIALLY VERIFIED — real attribution, but misstated and stale]
- Traces to the **Semiconductor Industry Association (SIA)**, surfaced around the US
  Senate Armed Services Committee investigation into counterfeit electronic parts in the
  DoD supply chain (hearing Nov 2011; report May 2012).
  https://www.armed-services.senate.gov/press-releases/senate-armed-services-committee-releases-report-on-counterfeit-electronic-parts
- The actual claim is narrower: counterfeits cost **US semiconductor companies** more
  than $7.5bn annually **in lost revenue** (SIA also claims ~11,000 lost US jobs).
- Three problems: (1) it is lost revenue to US chipmakers, not a cost to "the electronics
  industry"; (2) it is a **~14-year-old** trade-association estimate; (3) SIA has never
  published a public methodology.
**VERDICT: attributable but weak. It is also about semiconductors, not aviation parts —
using it in an aviation pitch invites the question "why are you quoting chip numbers?"
If used at all, cite it as "SIA's 2011-12 estimate of lost revenue to US semiconductor
firms", never as a present-tense aviation fact.**

---

### SEARCH BUDGET / GAPS
Not retrieved (flagged honestly):
- The **Sept 2025 Implementation Progress Update PDF** — gated behind an email form at
  aviationsupplychainintegrity.com. This is the single most likely place an owner for
  #9 would be named. The founder should download it directly. [GAP]
- Two Aviation Week articles ("Supply Chain Integrity Effort Paying Dividends";
  "Opinion: Aviation Must Align On Parts Traceability Vision") — hard paywall, not
  authenticated. [GAP]
- SAE **AIR7123** "Overview of Blockchain-Based Digital Authorized Release Certificate"
  (work-in-progress) — SAE page returned no content. Worth a look; it is the nearest
  standards-body activity to Rec #9. https://www.sae.org/standards/content/air7123/ [GAP]


---

<!-- archived from research/06-bunkertrace-postmortem.md -->

## BunkerTrace Ltd — post-mortem (UK company 12101569)

Research date: 2026-08-27. Status: COMPLETE (within a constrained tool budget).
Every claim tagged [VERIFIED] = I read the source at the URL given. [UNVERIFIED] = inference.

---

### 0. VERDICT — transferable vs model-specific

**Short answer: the fatal causes were mostly model-specific, but there is one transferable cause
and it is the serious one — the buyer of evidence was never a single party who could act alone,
and the incumbent testing labs owned the customer relationship.**

#### (b) MODEL-SPECIFIC — would NOT hit a pure data format

| Cause | Evidence |
|---|---|
| **Physical tracer had to be dosed into the fuel at a supply point.** Every tonne traced needed someone with a dosing rig at a terminal or barge, and a detection unit at the other end. That is a per-port capital rollout, not a download. | [VERIFIED] launch and pilot descriptions: "adds synthetic DNA to marine fuel at various stages within the supply chain"; 2019 pilot required the tag added while loading a Minerva barge, then tested by the ship's crew. |
| **Hardware in the loop.** Detection units lived in VPS's labs, not in the customer's hands. | [VERIFIED] Smart Maritime Network, 10 Nov 2021: seals "carry unique codes detectable only with BunkerTrace detection units in VPS labs". |
| **Real marginal unit cost — ~$1–3 per tonne.** ~$1/t for origin tracing, up to $3/t for origin plus quantification, at ~50,000 mt volumes. Bunker fuel runs a few hundred dollars a tonne, so this is a fraction of a percent of cargo value levied on a commodity trade — a live, recurring, negotiable line item that someone must approve every lift. A data format has no per-transaction cost. | [VERIFIED via search extraction of the Ship & Bunker interview; the article itself returned HTTP 403 to me — see §6] |
| **Running a platform.** Blockchain ledger, mobile app, detection network — all needed staffing and uptime, funded from a ~$1.65M seed. | [VERIFIED] product = Tag / Flag / Trace (physical tracer, molecular label, software app). Funding figure [UNVERIFIED — Tracxn/Crunchbase aggregators, not a filing]. |
| **Venture clock ran out before network scale.** Three allotments (Jun 2020, Aug 2020, Nov 2021), then **nothing raised for 3 years and 4 months**, then a CVL. | [VERIFIED] SH01 filings 14 Jul 2020, 08 Sep 2020, 07 Dec 2021; no allotment after; wind-up resolution 12 Mar 2025. |
| **Value needed a chain, not a pair.** Tracing fuel from refinery through blender, trader, barge, to vessel needs every hop instrumented. Two willing parties alone got nothing. | [VERIFIED] the whole architecture — "traced to its origin even if it was blended or mixed" — presupposes the upstream hops are dosed. |

#### (a) TRANSFERABLE — would hit a format too

| Cause | Evidence | How much it should worry you |
|---|---|---|
| **The incumbent testing labs own the customer.** BunkerTrace could not reach shipowners directly; by Nov 2021 it was reselling *through* VPS (Veritas Petroleum Services), an incumbent bunker-testing firm, as a component inside VPS's own "Sample Assurance" product. The incumbent took the customer relationship, the brand, and the pricing power. | [VERIFIED] Smart Maritime Network 10 Nov 2021. | **HIGH.** This hits a format exactly the same way. Whoever already holds the audit/assurance relationship in your target sector will absorb your format as a feature and you will never see the end customer. |
| **The buyer was not cleanly identified.** Value accrued to the fuel *buyer* (owner/operator/charterer) but the dosing had to happen at the *supplier*. Suppliers only came along "given the demand from buyers" — i.e. they were pushed, not pulled. | [VERIFIED-ish] Ship & Bunker interview extraction: demand "from fuel buyers, including vessel owners, operators and charterers. There is now consensus among fuel suppliers to also have tracing, given the demand from buyers." | **HIGH.** Split incentive is structural to chain-of-custody, tracer or no tracer. A format does not fix who pays. |
| **No mandate ever arrived.** IMO 2020 sulphur (Jan 2020) was the launch thesis; it did not create a legal requirement for *tracing*, only for compliant fuel. The EU/IMO biofuel wave was the pivot, and it also did not mandate any specific traceability method. | [VERIFIED] launch timing (Oct 2019) explicitly pegged to 2020 compliance; the GCMD trials (below) tested four rival methods and named no winner. | **HIGH.** Same risk for a format: "the regulator will require this" is not a plan. |
| **Endorsement is not revenue.** See §3 — FOBAS/BIMCO/IBIA were grant-funded consortium members and quoted names, and the money came from a foundation. | [VERIFIED] | **HIGH.** Named-brand consortium support kept this alive for five years and never converted. This is the single most quotable lesson. |
| **"Evidence" competes with cheaper substitutes.** In the GCMD trials BunkerTrace's physical tracer sat beside carbon dating, chemical fingerprinting, and **lock-and-seal** — a tamper-evident seal, i.e. a near-zero-cost process control. | [VERIFIED] gcformd.org project page. | **MEDIUM-HIGH for you, and note the direction:** the cheap substitute is a *threat to the tracer*, but a format is on the cheap side of that comparison. This one partly cuts in your favour. |

#### The honest bottom line for the founder

BunkerTrace is **weak evidence against building a format** and **strong evidence against building a
tracer or a platform**. Its most expensive failure modes — dosing rigs, detection hardware,
per-tonne pricing, a five-year venture clock — you simply do not have.

But strip those out and a residue remains that a format shares completely: *nobody with budget
authority was ever obliged to buy chain-of-custody evidence, and the party who could have made it
happen (the supplier / the incumbent lab) was not the party who wanted it.* BunkerTrace had
Lloyd's Register, BIMCO, IBIA, bp, Chevron, Hapag-Lloyd and ONE all touching the product, and still
filed micro-entity accounts every year of its life. **If world-class logos plus a foundation grant
plus a regulatory tailwind could not produce a paying market for fuel-provenance evidence, a better
data format would not have produced one either.** That is the finding that should move the decision.

The counter-argument worth holding (blue-team): a format's failure is *cheap*. BunkerTrace needed
~$1.65M and 5.5 years to learn this. A format can be published, adopted or ignored, at near-zero
burn, and it survives its sponsor's death — which is the one thing BunkerTrace's ledger did not.
If the question is "will this make money", the evidence is discouraging. If it is "will this cost
me a company", the analogy does not carry.

---

### 1. Corporate facts (Companies House) [VERIFIED]

Source: https://find-and-update.company-information.service.gov.uk/company/12101569

- BUNKERTRACE LIMITED, 12101569. Incorporated **13 July 2019**. **Dissolved 2 March 2026.**
- Registered office at dissolution: Keble House, Church End, South Leigh, Witney OX29 6UR.
- SIC 74909 — other professional/scientific/technical activities n.e.c.

#### Insolvency route: Creditors' Voluntary Liquidation (CVL) — NOT administration, NOT strike-off
- 12 Mar 2025 — extraordinary resolution to wind up (filed 21 Mar 2025).
- 21 Mar 2025 — form 600, appointment of a voluntary liquidator; **LIQ02 Statement of Affairs filed same day**.
- 13 Mar 2025 — Gazette: "Resolutions for Winding-up" and "Appointment of Liquidators"
  (https://www.thegazette.co.uk/all-notices/notice?text=BunkerTrace).
- 02 Dec 2025 — LIQ14 return of final meeting.
- 02 Mar 2026 — GAZ2 Final Gazette, "dissolved following liquidation".

A CVL means the directors resolved to wind up because the company could not pay its debts. There is
**no administration on the record — so no attempted rescue, trade sale, or pre-pack**. Nobody
bought the technology out of the wreck, at least not through an insolvency process. The whole
liquidation ran to a final meeting in under nine months, which is consistent with a small, simple
estate. [VERIFIED from filing types; the Statement of Affairs itself I could not open — see §6]

#### Accounts: micro-entity every single year
AA filings for YE2020 (plus AAMD amendment, 21 May 2021), YE2021, YE2022, YE2023. **Never anything
but micro-entity.** Last accounts filed 29 Oct 2024, for YE2023. **Nothing filed for YE2024** —
the company went into CVL rather than file another set. Micro-entity thresholds are turnover
≤£632k / balance sheet ≤£316k / ≤10 employees. It qualified for its entire life, including the
years it was announcing work with bp and Chevron. This is the hardest single number in the file:
**BunkerTrace never became a real revenue business.**

#### Capital and charges
SH01 allotments only: 14 Jul 2020 (issued capital GBP 94.91), 08 Sep 2020 (GBP 99.73),
07 Dec 2021 (GBP 107.53). Nominal capital ~£100 total, so these are tiny-denomination shares and
nominal value says nothing about cash raised — but the *dates* do: three rounds, all before
Dec 2021, then a 39-month funding drought ending in liquidation.
**No MR01 or other charge filings appear in the filing history** — no debenture, no secured
lender, so [UNVERIFIED but strongly implied] no venture debt and no bank exposure; the creditors
will be trade and possibly HMRC.

External aggregators (Tracxn/Crunchbase, [UNVERIFIED — not primary]) put total funding at
**$1.65M across 3 rounds from 11 investors**, which matches the three SH01 dates exactly.

#### Directors [VERIFIED]
https://find-and-update.company-information.service.gov.uk/company/12101569/officers

At dissolution (3): **Deanna Adell MacDonald** (Canadian, res. Denmark, apptd 17 Jan 2020) — CEO
of BLOC / Maritime Blockchain Labs; **Hanni Ahmed Said Ali** (British, res. Bermuda, apptd 17 Jan
2020); **Peter Olsson** (Danish, res. Denmark, apptd 5 Sep 2019).

Resigned (7): Christopher Jonathan Livingston-Campbell (13 Jul – 5 Sep 2019); Marc Francis Johnson
(US, 5 Sep 2019 – 26 Feb 2020); **Vicky Chapman, Stuart Michael Hall and Stephen John Driver — all
three resigned on the same day, 12 Nov 2020**; Dudley Chapman (17 Jan 2020 – 8 Jun 2023);
Stephen Howard Collier (17 Jan 2020 – 1 Jul 2024).

**Read the timeline.** BunkerTrace was a **joint venture between BLOC (blockchain) and Forecast
Technology (the DNA tracer)** — Forecast's own site announces the JV, July 2019
(https://www.forecasttechnology.com/2019/07/29/innovative-joint-venture-announced-bunkertrace/).
The Chapman/Hall/Driver triple resignation on 12 Nov 2020, thirteen months after commercial launch,
looks like the tracer partner's board representation withdrawing en bloc [UNVERIFIED inference —
I did not confirm which company each of those three came from]. Dudley Chapman, named in
aggregators as co-founder, held on until Jun 2023. The last director outside the BLOC side left
1 Jul 2024, eight months before the wind-up. **The JV came apart before the company did.**

Note also: two directors resident in Bermuda and Denmark and one Canadian national — the operating
centre of gravity was never actually in the UK bunker market it was selling into.

---

### 2. What the product actually was, commercially

**Yes — it required a physical DNA tracer dosed into the fuel, plus detection.** [VERIFIED]

Three components, per aggregator product descriptions and press coverage:
- **Tag** — a physical tracer, unique synthetic DNA, dosed into the fuel.
- **Flag** — a molecular label / field-detectable marker.
- **Trace** — the software app and blockchain ledger recording each transfer plus quality tests.

Mechanics, from the launch and the Netherlands pilot [VERIFIED]:
synthetic DNA is added at loading (in the 2019 pilot, onto a Minerva barge); the ship's crew takes
a sample and tests it; each trade is written to a ledger linked to the fuel's ID, so a blend can
still be resolved to origin.
- https://www.ledgerinsights.com/bunkertrace-dna-blockchain-maritime-fuel-tracking/ (22 Oct 2019)
- https://www.forecasttechnology.com/2019/10/04/bunkertrace-dna-tracing-pilot-successfully-completed/

**Pricing.** ~**US$1 per tonne** for origin tracing at ~50,000 mt volumes, rising to about
**US$3 per tonne** for origin plus quantification; biofuel blends (VLSFO + biodiesel) priced at the
low end. [VERIFIED via search-engine extraction of the Ship & Bunker interview; I could not open
the article directly — 403. Treat the exact figures as one-source.]

**Who paid.** Demand came from **fuel buyers — owners, operators and charterers**; suppliers
adopted because buyers asked. So the party who must physically dose the fuel (the supplier) is not
the party who wants the evidence (the buyer). By 2021 the actual commercial route was neither:
it was **selling through VPS**, the testing lab, as an ingredient in VPS's product.

**Did it work for two parties alone?** No. Origin tracing across a blended supply chain requires
every upstream hop to be dosed and every downstream hop to be able to detect. The pairwise case —
one supplier, one ship — is exactly the case a tamper-evident seal already covers at a fraction of
the price, which is why "lock-and-seal" appeared as a rival method in the GCMD trials.

---

### 3. Who actually adopted it — signed customers vs press releases

**Named, evidenced deployments (all pilots or trials, none evidenced as recurring paid contracts):**
- **Oct 2019, Netherlands** — Cooperative Bebeka (bunker buying pool), Minerva (supplier), Boskalis
  dredger *Prins der Nederlanden*, 900 m³ DMA 0.1%S. A **trial**. [VERIFIED via multiple trade outlets]
- **Jan 2020** — **Marfin Management** (Monaco ship manager) announced to track fuel across its
  fleet. Vessel count and commercial terms **not disclosed**; Ledger Insights put the detail behind
  a paywall. This is the closest thing to a named customer I found, and it is an announcement.
  https://www.ledgerinsights.com/blockchain-dna-tagging-marine-fuel-bunkertrace/ [VERIFIED that it
  is an announcement; UNVERIFIED that it ever became revenue]
- **Nov 2021** — **VPS (Veritas Petroleum Services)** partnership, "Sample Assurance". A channel
  deal, not an end customer. [VERIFIED]
- **Q3 2022 – Q2 2024** — **GCMD biofuels end-to-end supply chain trials**: four trials across
  Singapore, Vlissingen and Rotterdam, seven vessels bunkered, HVO and UCOME up to B30. BunkerTrace
  is one of **~25+ partners** alongside bp, Chevron, TotalEnergies, Hapag-Lloyd, ONE, NYK, and
  **rival tracer firms Authentix and Saybolt**. The trials deployed "physical tracers, carbon
  dating, chemical fingerprinting and a lock-and-seal methodology" — i.e. **BunkerTrace was one
  candidate among four competing methods, and the project page states no winner.**
  https://gcformd.org/projects/biofuels-end-to-end-supply-chain-pilots/ [VERIFIED]
- **Singapore, Houston, Rotterdam** biofuel tracing activity claimed in the Ship & Bunker interview
  [one-source, extraction only].

**The FOBAS / BIMCO / IBIA endorsements — what they actually were:** [VERIFIED]

They were **members of a grant-funded demonstrator consortium**, convened by BLOC's Maritime
Blockchain Labs, not customers. The consortium was Lloyd's Register, BIMCO, IBIA, Precious
Shipping, Bostomar and GoodFuels, assembled "to evaluate how blockchain technologies could help
provide an efficient, tamper-resistant and auditable chain of custody". Announced by BLOC/LR/IBIA
themselves:
- https://ibia.net/bloc-announces-industry-led-demonstrator-consortium-for-blockchain-use-in-bunkering-with-lloyds-register-bimco-precious-shipping-bostomar-ibia-and-goodfuels/
- https://www.lr.org/en/latest-news/bloc-announces-demonstrator-consortium-for-blockchain-use-in-bunkering/

**"Evaluate" is the operative word.** No purchase commitment, no volume commitment, no mandate.
BIMCO and IBIA are trade associations — they have no fuel to buy. Lloyd's Register's involvement
came through **its Foundation funding the programme**, which is a grant, not a sale.

---

### 4. BLOC / Maritime Blockchain Labs status [PARTIALLY VERIFIED]

- **MBL was a partnership between Lloyd's Register Foundation and BLOC** (Blockchain Labs for Open
  Collaboration), set up to explore blockchain for maritime safety and assurance. The Foundation
  **funded** it over an **18-month programme** of three demonstrator projects. One demonstrator
  produced the prototype behind the first end-to-end fuel transaction recorded on a blockchain in
  the Port of Rotterdam, and won an MIT Solve award (coastal communities).
  https://www.lrfoundation.org.uk/en/news/bloc-maritime-blockchain-lab/ and
  https://lr.org/en/latest-news/lr-foundation-bloc-establish-maritime-blockchain-lab [VERIFIED]
- **So yes: BunkerTrace was grant-funded in origin.** It is the commercialisation of a Lloyd's
  Register Foundation demonstrator, spun into a JV with Forecast Technology (the tracer chemistry),
  then seeded with ~$1.65M of equity. A grant-to-startup transition.
- **Same directors:** Deanna MacDonald is CEO of BLOC and was a BunkerTrace director to the end.
  [VERIFIED]
- **BLOC / MBL corporate status: NOT ESTABLISHED.** Companies House free-text search is fuzzy and
  returned 10,000 junk matches for both "Maritime Blockchain Labs" and "Blockchain Labs for Open
  Collaboration"; neither entity surfaced. BLOC operated out of Copenhagen, so the parent may not
  be a UK-registered company at all. The two Companies House officer records for Deanna Adell
  MacDonald (b. Jul 1987) each show **only 1 appointment** — consistent with BLOC not being a UK
  company. **Unresolved; see §6.**

---

### 5. Public post-mortem material

**I found none.** No founder interview, no LinkedIn wind-down post, no trade-press piece explaining
the closure surfaced in searches. The company simply stopped: last accounts Oct 2024, last director
departure Jul 2024, wind-up resolution Mar 2025, dissolved Mar 2026 — **and no trade coverage of
any of it.** The most recent substantive public statement is the Ship & Bunker interview about
chasing the biofuel tracing market.

That silence is itself informative. A company with Lloyd's Register, BIMCO, IBIA and bp in its
orbit went into creditors' voluntary liquidation and the maritime trade press did not write it up.
[VERIFIED as an absence across my searches — an absence of evidence, not proof of absence.]

---

### 6. What I could not access — read this before relying on the above

1. **The Statement of Affairs (LIQ02, 21 Mar 2025).** I located the document
   (`/company/12101569/filing-history/MzQ1OTM1Mzc2NWFkaXF6a2N4/document`) but the Companies House
   document endpoint 302-redirects to a signed AWS S3 URL that my fetch tool would not follow.
   **So I have NO creditor totals, no estimated deficiency, no liquidator name or firm, and no
   asset figures.** Anyone can retrieve this free from the Companies House website in a browser —
   it is the single highest-value remaining document and it would tell you how much money was owed
   and to whom.
2. **The LIQ14 return of final meeting (2 Dec 2025)** — same problem, same document ID pattern
   (`MzQ5MTcyOTI0N2FkaXF6a2N4`). Would show the final distribution (or lack of one).
3. **The micro-entity accounts (YE2020–YE2023)** — I read only the filing *descriptions*, not the
   PDFs. Even micro-entity accounts show a balance sheet and would confirm the cash burn.
4. **The Ship & Bunker interview** — HTTP 403 to my fetcher. The $1–3/tonne pricing and the
   "buyers pull, suppliers follow" characterisation come from search-engine extraction of that
   article, not from my reading it. **Verify the pricing before quoting it.**
5. **web.archive.org is blocked** for me, so I could not read bunkertrace.co's own product and
   pricing pages as they stood.
6. **Ledger Insights' Marfin article is paywalled** past the first paragraph, so the size and terms
   of the one named fleet deal are unknown.
7. **BLOC / MBL's corporate registration** — not found; likely Danish, not UK.
8. **Forecast Technology's own status** — not checked. Worth 5 minutes: if the tracer partner
   survived and BunkerTrace didn't, that locates the failure in the platform/format layer rather
   than the chemistry, which is directly relevant to your decision.
