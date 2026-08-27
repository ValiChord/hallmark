# 03 — Is the merchant fleet actually disconnected?

Sweep date: 2026-08-27. Status: COMPLETE (within budget; gaps flagged).

Tests the load-bearing assumption that ships are "genuinely disconnected", making
offline-capable signing necessary rather than merely elegant.

---

## VERDICT

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

## 1. Broadband penetration of the merchant fleet

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

## 2. How reliable is that connectivity in practice?

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

## 3. Where does bunkering physically happen? [CRITICAL] — IN PORT OR AT ANCHORAGE

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

## 4. Regulatory / insurance pressure to push vessel data to shore in real time?

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

## 5. Counter-consideration: offline-verifiable records on a connected ship

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

## What would change my mind / open gaps

- **Fleet penetration by vessel type and size.** Not public. Requires the Valour tracker.
- **Quantitative berth/anchorage/offshore delivery split.** Not found; AIS papers exist
  but were paywalled/403 within budget.
- **UNCTAD fleet-size figure not read from the primary PDF** — only from search summary.
- **Britannia P&I and the SIBCON/ZeroNorth quotes came from search snippets** after
  403s on direct fetch. Confirm before external use.
- **Whether any port other than Singapore has mandated eBDN.** Rotterdam ran ZeroNorth/
  Vitol trials; not established whether a mandate followed.
  https://www.marinelink.com/news/zeronorth-vitol-trial-digital-bunker-519144

## Implication for positioning (one line)

Stop arguing "ships are offline". Argue: **the record must survive the port, the
provider, the supplier and the decade** — and note that at Zhoushan, the world's #3
bunker port, the ship is legally required to be offline while it bunkers anyway.
