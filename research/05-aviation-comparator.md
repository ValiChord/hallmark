# Sweep 05 — Aviation Parts Comparator

Research completed 2026-08-27. Status: COMPLETE (3 gaps listed at the end).

## BOTTOM LINE
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

## 1. Coalition name, membership, recommendation text

[VERIFIED] Name is exactly **the Aviation Supply Chain Integrity Coalition** (ASCIC).
Site: https://aviationsupplychainintegrity.com/
[VERIFIED] Formed Feb 2024 (Reuters, 2024-02-22). Report delivered 2024-10-09.
[VERIFIED] **13 recommended actions** in 3 categories: Vendor Accreditation;
Document Traceability & Verification; Non-Serialized Parts Traceability.
Co-chairs: former NTSB Chairman Robert L. Sumwalt; former US DOT Deputy Secretary
John D. Porcari.

## 2. DECIDING QUESTION — does Recommendation #9 have an owner?

[VERIFIED — as of 2026-08-27] Rec #9 exists and is what the founder thinks it is:
> **Recommendation #9: Establish Voluntary Industry Database of Back-to-Birth
> Parts Documentation** — Long Term.
> Establish a voluntary database of digitized ARCs to achieve "BtB traceability
> for all parts, including non-serialized 'standard' parts".
Source: https://aviationsupplychainintegrity.com/recommended-actions/documents-traceability-verification/
The coalition's own page lists **no named owner/lead** for #9 (nor for #5–#8).

[VERIFIED] Coalition news page shows **NO items dated 2026**. Most recent output is
the progress report of **2025-09-25**. (https://aviationsupplychainintegrity.com/news/)

## 3. Other recommendations (OCR, bilateral API validation)

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

### Verbatim Rec #9 (from the report PDF, p.31)
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

### Membership / stakeholder engagement (Appendix B, VERIFIED)
Airframe mfrs: Airbus SE, The Boeing Company. Airlines: American, Delta, United.
Engine OEMs: GE Aerospace, Safran Group. Engine MROs: AAR Corp, GA Telesis,
MTU Aero Engines, StandardAero, Delta TechOps. Lessors: Shannon Engine Support.
Brokers: AerFin, CFM Materials. Exchange: Aeroxchange. Tech: Aramid Technologies.
Associations: AIA, ARSA, AFRA, ASA, GAMA, IATA.
[VERIFIED] "All 13 recommendations are unanimous." Recommendations are explicitly
**voluntary, industry-driven** — not regulatory.

### Sept 2025 progress report
[VERIFIED] Coalition's 2025-09-25 release reports progress ONLY on the five
**short-term** recommendations (90% using accredited suppliers; ~90% strengthened
training; 70% acting on digital ARCs). It gives **no progress detail on #7, #8 or #9**
and names no owner for any recommendation.
https://aviationsupplychainintegrity.com/news/aviation-coalition-report-shows-progress-implementing-recommendations/
NOTE: the full progress-update PDF is gated behind an email form — not retrieved.
[UNVERIFIED] Whether the gated PDF assigns owners. Recommend the founder download it.

## 4. ATA Spec 2000 Chapter 16 electronic release certificates

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

### THE ADOPTION EVIDENCE — this is the strongest single datapoint in the sweep
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

## 5. AOG Technics — scale and outcome

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

## 6. Regulator moves on a system of record

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

### Competitive landscape flagged by the coalition itself (report §Parts Traceability)
[VERIFIED] The report names as exploratory: Digital Unique Identifier (DUI)
technology; blockchain — citing "an effort by PricewaterhouseCoopers and several
airlines" and EASA's VIRTUA. It says blockchain "remains particularly well suited to
tracking and authenticating aircraft parts registration but remains concerned with the
nascent nature of the technology." Also named in that passage: Northrop Grumman,
Rolls-Royce. Vendors circling the space include SkyThread, Aeroxchange, LocatorX.

## 7. Orphan statistics — DO NOT REPEAT EITHER AS STATED

### "~2% of aviation parts in service are unapproved"
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

### "Counterfeits cost the electronics industry $7.5bn a year"
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

## SEARCH BUDGET / GAPS
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
