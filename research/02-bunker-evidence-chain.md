# Sweep 02 — The Bunker Dispute Evidence Chain

Research sweep, 2026-08-27. Every finding is labelled [VERIFIED] (I fetched and read the
primary source myself in this session) or [UNVERIFIED]. Vendor, testing-lab and consultancy
sources are labelled as such. STATUS: in progress.

---

## 0. HEADLINE — forgery vs entitlement / omission / inconsistency

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

## 1. The evidence chain: who produces what, who signs it

### 1.1 What the IMO instrument actually names as roles
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

### 1.2 Sample definitions (the four different things people call "the sample")
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

### 1.3 The IMO sampling chain, step by step
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

### 1.4 Documents produced in a real delivery (chain map)
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

## 2. MARPOL Annex VI: what is REQUIRED, what is left unspecified

[VERIFIED] Text read: Resolution MEPC.176(58), Annex 13, the revised MARPOL Annex VI adopted
10 Oct 2008 — Regulation 18 and Appendices V and VI.
Source: https://wwwcdn.imo.org/localresources/en/OurWork/Environment/Documents/176(58).pdf
(Caveat: this is the 2008 adopted text. Annex VI has been amended since — notably the
in-use/onboard sampling-point requirements added by MEPC.324(75) in force 1 Apr 2022, and the
Unified Interpretation permitting electronic BDNs. I have read the 2008 base text directly;
the amendments below are flagged separately.)

### 2.1 What is REQUIRED
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

### 2.2 What Annex VI LEAVES UNSPECIFIED — the gap list
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

## 3. ISO 8217 and ISO 13739

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

## 4. WHERE THE CHAIN BREAKS — the forgery / entitlement / omission / inconsistency split

All primary evidence in this section is from documented practitioner casework (P&I clubs and
defence clubs are mutual insurers who fund and run these disputes; they are practitioner
sources with an interest in selling loss-prevention advice, but their case narratives are the
closest public record of real bunker arbitrations, most of which are confidential).

### 4.1 The five documented failure modes, classified

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

### 4.1a "The sample tested is not the fuel delivered"
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

### 4.2 THE ANSWER TO THE QUESTION
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

## 5. Time limits and notice deadlines

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

## 6. Who are the parties — is there a natural neutral?

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

## 7. Search budget, source labelling and gaps

### Sources I actually read this session [VERIFIED]
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

### Source-type labels
- **P&I / defence clubs (Gard, West of England, UK Defence Club)** are *mutual insurers* of
  shipowners and charterers. They fund these disputes, so their casework is first-hand, but they
  publish loss-prevention material partly to reduce their own claims exposure and they see the
  owner's side of the chain far more often than the supplier's. Treated as practitioner
  evidence, not neutral scholarship.
- **MPA Singapore** is a port-state regulator announcing its own programme; the benefit claims
  ("40,000 man-days saved", "early detection of fraudulent activities") are its own.
- **ISO standards content** is UNVERIFIED — paywalled, described only via resellers and the
  UKDC guide.

### Gaps — honest list
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
