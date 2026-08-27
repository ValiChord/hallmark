# BunkerTrace Ltd — post-mortem (UK company 12101569)

Research date: 2026-08-27. Status: COMPLETE (within a constrained tool budget).
Every claim tagged [VERIFIED] = I read the source at the URL given. [UNVERIFIED] = inference.

---

## 0. VERDICT — transferable vs model-specific

**Short answer: the fatal causes were mostly model-specific, but there is one transferable cause
and it is the serious one — the buyer of evidence was never a single party who could act alone,
and the incumbent testing labs owned the customer relationship.**

### (b) MODEL-SPECIFIC — would NOT hit a pure data format

| Cause | Evidence |
|---|---|
| **Physical tracer had to be dosed into the fuel at a supply point.** Every tonne traced needed someone with a dosing rig at a terminal or barge, and a detection unit at the other end. That is a per-port capital rollout, not a download. | [VERIFIED] launch and pilot descriptions: "adds synthetic DNA to marine fuel at various stages within the supply chain"; 2019 pilot required the tag added while loading a Minerva barge, then tested by the ship's crew. |
| **Hardware in the loop.** Detection units lived in VPS's labs, not in the customer's hands. | [VERIFIED] Smart Maritime Network, 10 Nov 2021: seals "carry unique codes detectable only with BunkerTrace detection units in VPS labs". |
| **Real marginal unit cost — ~$1–3 per tonne.** ~$1/t for origin tracing, up to $3/t for origin plus quantification, at ~50,000 mt volumes. Bunker fuel runs a few hundred dollars a tonne, so this is a fraction of a percent of cargo value levied on a commodity trade — a live, recurring, negotiable line item that someone must approve every lift. A data format has no per-transaction cost. | [VERIFIED via search extraction of the Ship & Bunker interview; the article itself returned HTTP 403 to me — see §6] |
| **Running a platform.** Blockchain ledger, mobile app, detection network — all needed staffing and uptime, funded from a ~$1.65M seed. | [VERIFIED] product = Tag / Flag / Trace (physical tracer, molecular label, software app). Funding figure [UNVERIFIED — Tracxn/Crunchbase aggregators, not a filing]. |
| **Venture clock ran out before network scale.** Three allotments (Jun 2020, Aug 2020, Nov 2021), then **nothing raised for 3 years and 4 months**, then a CVL. | [VERIFIED] SH01 filings 14 Jul 2020, 08 Sep 2020, 07 Dec 2021; no allotment after; wind-up resolution 12 Mar 2025. |
| **Value needed a chain, not a pair.** Tracing fuel from refinery through blender, trader, barge, to vessel needs every hop instrumented. Two willing parties alone got nothing. | [VERIFIED] the whole architecture — "traced to its origin even if it was blended or mixed" — presupposes the upstream hops are dosed. |

### (a) TRANSFERABLE — would hit a format too

| Cause | Evidence | How much it should worry you |
|---|---|---|
| **The incumbent testing labs own the customer.** BunkerTrace could not reach shipowners directly; by Nov 2021 it was reselling *through* VPS (Veritas Petroleum Services), an incumbent bunker-testing firm, as a component inside VPS's own "Sample Assurance" product. The incumbent took the customer relationship, the brand, and the pricing power. | [VERIFIED] Smart Maritime Network 10 Nov 2021. | **HIGH.** This hits a format exactly the same way. Whoever already holds the audit/assurance relationship in your target sector will absorb your format as a feature and you will never see the end customer. |
| **The buyer was not cleanly identified.** Value accrued to the fuel *buyer* (owner/operator/charterer) but the dosing had to happen at the *supplier*. Suppliers only came along "given the demand from buyers" — i.e. they were pushed, not pulled. | [VERIFIED-ish] Ship & Bunker interview extraction: demand "from fuel buyers, including vessel owners, operators and charterers. There is now consensus among fuel suppliers to also have tracing, given the demand from buyers." | **HIGH.** Split incentive is structural to chain-of-custody, tracer or no tracer. A format does not fix who pays. |
| **No mandate ever arrived.** IMO 2020 sulphur (Jan 2020) was the launch thesis; it did not create a legal requirement for *tracing*, only for compliant fuel. The EU/IMO biofuel wave was the pivot, and it also did not mandate any specific traceability method. | [VERIFIED] launch timing (Oct 2019) explicitly pegged to 2020 compliance; the GCMD trials (below) tested four rival methods and named no winner. | **HIGH.** Same risk for a format: "the regulator will require this" is not a plan. |
| **Endorsement is not revenue.** See §3 — FOBAS/BIMCO/IBIA were grant-funded consortium members and quoted names, and the money came from a foundation. | [VERIFIED] | **HIGH.** Named-brand consortium support kept this alive for five years and never converted. This is the single most quotable lesson. |
| **"Evidence" competes with cheaper substitutes.** In the GCMD trials BunkerTrace's physical tracer sat beside carbon dating, chemical fingerprinting, and **lock-and-seal** — a tamper-evident seal, i.e. a near-zero-cost process control. | [VERIFIED] gcformd.org project page. | **MEDIUM-HIGH for you, and note the direction:** the cheap substitute is a *threat to the tracer*, but a format is on the cheap side of that comparison. This one partly cuts in your favour. |

### The honest bottom line for the founder

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

## 1. Corporate facts (Companies House) [VERIFIED]

Source: https://find-and-update.company-information.service.gov.uk/company/12101569

- BUNKERTRACE LIMITED, 12101569. Incorporated **13 July 2019**. **Dissolved 2 March 2026.**
- Registered office at dissolution: Keble House, Church End, South Leigh, Witney OX29 6UR.
- SIC 74909 — other professional/scientific/technical activities n.e.c.

### Insolvency route: Creditors' Voluntary Liquidation (CVL) — NOT administration, NOT strike-off
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

### Accounts: micro-entity every single year
AA filings for YE2020 (plus AAMD amendment, 21 May 2021), YE2021, YE2022, YE2023. **Never anything
but micro-entity.** Last accounts filed 29 Oct 2024, for YE2023. **Nothing filed for YE2024** —
the company went into CVL rather than file another set. Micro-entity thresholds are turnover
≤£632k / balance sheet ≤£316k / ≤10 employees. It qualified for its entire life, including the
years it was announcing work with bp and Chevron. This is the hardest single number in the file:
**BunkerTrace never became a real revenue business.**

### Capital and charges
SH01 allotments only: 14 Jul 2020 (issued capital GBP 94.91), 08 Sep 2020 (GBP 99.73),
07 Dec 2021 (GBP 107.53). Nominal capital ~£100 total, so these are tiny-denomination shares and
nominal value says nothing about cash raised — but the *dates* do: three rounds, all before
Dec 2021, then a 39-month funding drought ending in liquidation.
**No MR01 or other charge filings appear in the filing history** — no debenture, no secured
lender, so [UNVERIFIED but strongly implied] no venture debt and no bank exposure; the creditors
will be trade and possibly HMRC.

External aggregators (Tracxn/Crunchbase, [UNVERIFIED — not primary]) put total funding at
**$1.65M across 3 rounds from 11 investors**, which matches the three SH01 dates exactly.

### Directors [VERIFIED]
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

## 2. What the product actually was, commercially

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

## 3. Who actually adopted it — signed customers vs press releases

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

## 4. BLOC / Maritime Blockchain Labs status [PARTIALLY VERIFIED]

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

## 5. Public post-mortem material

**I found none.** No founder interview, no LinkedIn wind-down post, no trade-press piece explaining
the closure surfaced in searches. The company simply stopped: last accounts Oct 2024, last director
departure Jul 2024, wind-up resolution Mar 2025, dissolved Mar 2026 — **and no trade coverage of
any of it.** The most recent substantive public statement is the Ship & Bunker interview about
chasing the biofuel tracing market.

That silence is itself informative. A company with Lloyd's Register, BIMCO, IBIA and bp in its
orbit went into creditors' voluntary liquidation and the maritime trade press did not write it up.
[VERIFIED as an absence across my searches — an absence of evidence, not proof of absence.]

---

## 6. What I could not access — read this before relying on the above

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
