# Sweep 04 — Incumbents and Occupancy: Marine Bunker Fuel Quality Evidence

**Date of sweep:** 2026-08-27
**Question:** Who already occupies this space, and has a regulator already named a system of record?
**Kill criterion:** If a regulator already runs the register of record for bunker delivery evidence, the founder's filter rules the project out.

STATUS: COMPLETE (with named gaps at the end).

---

## VERDICT

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

## 1-line summary of the occupancy picture

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

## 1. Electronic Bunker Delivery Notes (e-BDN) — regulators

### Singapore — MPA [VERIFIED]

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

### Rotterdam — pilot only, so far [VERIFIED as pilot]

- **Nov 2024:** ZeroNorth + Vitol + Port of Rotterdam ran a ~4-week trial (3–4 deliveries)
  using ZeroNorth's eBDN. Billed as first in Europe. Stated intent to integrate into port
  and supplier systems afterwards.
  Sources: https://zeronorth.com/zeronorth-and-vitol-launch-digital-bunker-trial-in-port-of-rotterdam ; https://www.marinelink.com/news/zeronorth-vitol-trial-digital-bunker-519144
- This is a **PILOT with a commercial vendor**, not a mandate, and not (yet) a
  port-authority-operated register. NEEDS RECHECK for 2025–26 status.

### China / Shanghai [UNVERIFIED detail]

- Reported China's first fully digitalised bonded bunkering operation using eBDN, ~1 April
  2025. Source: https://www.offshore-energy.biz/chinas-first-fully-digitalized-bunkering-op-completed-using-ebdn/
- Status (pilot vs mandate) and who holds the record NOT established.

### Other authorities — NOT YET CHECKED

Fujairah/UAE (FOIZ), Panama, India (DG Shipping), Hong Kong, ARA ports beyond Rotterdam,
US Coast Guard. Treat as open.

---

## 2. IMO: MEPC outputs, GISIS, DCS

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
### THE SECOND CLOSURE RISK: IMO Net-Zero Framework, FLL, SFCS list, GFI Registry

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

### EU — EMSA runs a fuel database [VERIFIED]

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

## 3. Commercial incumbents

### e-BDN vendors (the MPA whitelist is the de facto incumbent list)
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

### Bunker procurement / management platforms (closed platforms, all of them)
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

### Fuel quality testing labs (the quality-evidence incumbents)
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

## 4. Standards bodies (BIMCO, IBIA, ISO, DNV, LR, ABS, IAPH)

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

### THE FORMAT WORTH EXTENDING: IMO Compendium eBDN data set [VERIFIED — best find]

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

## 5. Graveyard: failed consortia and abandoned pilots

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

## 6. Mass flow metering — what it solved and did not

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

## Open questions / not verified

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

## Search budget note

Sweep completed within budget. Sections 2 (GISIS/DCS), 4 (ABS/IAPH) and the non-Singapore
authorities in section 1 are the acknowledged thin spots.
