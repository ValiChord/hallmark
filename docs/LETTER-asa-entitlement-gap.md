# Letter to the Aviation Suppliers Association

*Draft, unsent. Restructured as a formal enquiry rather than an article. Send to
the address on aviationsuppliers.org. Sections 1 and 10 of the previous draft
should be replaced with the author's own wording before sending.*

---

ValiChord
1 Cefn Bryn, Church Road
Burry Port, SA16 0SF
United Kingdom
topeuph@gmail.com

3 September 2026

Aviation Suppliers Association
Washington, DC

**Re: Determining certificate validity following withdrawal of an accreditation
or approval**

Dear Sir or Madam,

I am writing to ask whether the industry has a means of identifying release
certificates signed under an accreditation or approval that was subsequently
withdrawn. I have been unable to find one in public sources, and ASA is better
placed than most to say whether one exists.

I am not offering a product for sale and am not seeking an introduction. I would
like to know whether the position described below matches what your members
encounter.

## 1. Background

On April 23, 2024 the FAA announced the removal of Transonic Aviation
Consultants from the list of accreditation organizations under the Voluntary
Industry Distributor Accreditation Program, AC 00-56B having been amended by
Change 1 to remove the TAC-2000 standard. Transonic had previously accredited
AOG Technics.

The Coalition's report records that the removal followed the FAA's observation of
two audits conducted by Transonic in January 2024, and that in an Information for
Operators notice the FAA stated that "processes and procedures described in
AC 00-56B were not followed in their entirety and determined that Transonic was
not in compliance with the program" (page 25).

The deficiency was therefore in the accrediting body rather than in any
individual distributor. Certificates issued by distributors holding a
Transonic-granted accreditation were, so far as the accreditation was concerned,
properly issued at the time. The accreditation no longer stands, and the basis on
which it was granted has been found wanting.

I am not aware of any mechanism that connects those facts, or that identifies the
affected documents.

## 2. The general case

The same question arises whenever an approval ends rather than an accreditation.

Per SAFO 20010 (April 24, 2020), an individual formerly employed by Aviatronics,
LLC continued to approve articles for return to service on that company's
documentation after the company surrendered FAA repair station certificate
ZVNR690L on November 3, 2016. The FAA's recommended action was that aircraft
owners, operators, manufacturers, maintenance organizations, parts suppliers and
parts distributors inspect their aircraft, aircraft records and parts inventories
for articles released after that date.

The interval between surrender and notification was approximately three years and
six months. I am not aware of any means of identifying affected certificates
other than manual review.

Comparable cases include Sauer Flugmotorenbau (certificates invalidated by the
Luftfahrt-Bundesamt, 2023) and Aeromotory s.r.o. (withdrawal of approval, 2026).

## 3. A signature check does not address this

In each case above the signature is genuine, the document is unaltered, and the
issuing organization is correctly identified. The deficiency is that the
entitlement behind the signature had ended.

I note the industry's progress on document authentication, including the first
shipment carrying a digital FAA Form 8130-3 in October 2025 (Boeing, Southwest
Airlines and Aeroxchange), which authenticates signer identity and document
integrity. That work addresses a different deficiency and I do not suggest
otherwise.

## 4. Absence of revocation terminology in the Coalition's 2024 report

The Aviation Supply Chain Integrity Coalition's *Final Report and
Recommendations* (October 2024) contains no instance of the terms "revoked",
"revocation", "suspended", "expired", "lapsed" or "withdrawn". Each use of
"valid" concerns document authenticity or field consistency rather than the
status of an approval at a given date.

This was verified against control terms occurring in the same document
("accreditation", 52 instances; "traceability", 38; "signature", 10) and repeated
against a separate text extraction of the same file.

The report describes the FAA's removal of Transonic at page 9 without addressing
the general question.

## 5. Recommendation #8 and its stated mechanism

Recommendation #8 provides that the system should verify "the part number and
serial number match authorized data, the issuance date is within valid limits,
and the signatory is an authorized individual."

The mechanism stated in the same paragraph is the creation of Application
Programming Interfaces "to facilitate real-time data querying" of OEM, air
carrier and production approval holder databases.

A real-time query establishes present status. It does not establish status at the
date of signature. I consider these to be distinct requirements.

## 6. Scope of ATA Spec 2000 Chapter 16

Chapter 16, Revision 2019.1, § 2.2 requires a digital certificate for the
individual authorized to sign an electronic part certification form, to a minimum
Medium Software assurance level per ATA Spec 42, with the organization identified
in the certificate corresponding to that in Block 4.

Section 1.2 provides that the specification does not include the internal
processes companies use to generate the data, to "authorize users or signers of
the data", or to process, store or repurpose it, on the stated basis that such
processes are specific to each company.

ATA Spec 42 verifies an organization's legal existence by reference to
incorporation documentation and a third-party registry identifier. It does not
verify that the organization holds an airworthiness privilege.

Identity is therefore mandatory under Chapter 16, and entitlement is expressly
outside its scope.

## 7. Proposed removal of OpSpec A025 for part 145

A draft Change 1 to AC 120-78B, posted to the FAA's draft documents server,
states its principal change as removing the requirement for 14 CFR part 145
repair stations and part 147 Aviation Maintenance Technician Schools to obtain
authorization for electronic and digital systems through OpSpec A025.

OpSpec A025 is presently the point at which a repair station's electronic
signature arrangements receive review external to the certificate holder. I am
unable to confirm the current status of the draft, which does not appear on the
FAA's list of drafts open for comment. FAA Notices N 8900.368 and N 8900.458 are
related.

## 8. My questions

I would be grateful for your view on the following:

- Following the removal of Transonic in April 2024, is there any means by which a
  recipient can determine which certificates were issued under accreditations
  Transonic had granted?

- Do your members encounter the general case — a certificate genuine at issue,
  under an approval subsequently withdrawn — and if so, how is it presently
  resolved?

- Is the distinction between status at the date of signature and status at the
  date of enquiry one your members would regard as material?

- If the position described above is mistaken, I would welcome correction.

## 9. Work undertaken

I have developed a reference implementation, published under Apache 2.0 at
https://github.com/ValiChord/hallmark. It records two determinations separately:
whether a record was properly authorized when signed, and whether a reader should
rely on the signer at present. It also permits a signer to record what was not
examined, so that silence is not read as assent.

I am not a software engineer, and the implementation was produced with
substantial use of AI coding tools; the commit history records this. It is a
demonstration rather than a product. The rules execute in a live conductor, two
independent nodes verify one another's records on every change, and a browser
version implementing the same rules without any network is available without
installation.

I would welcome technical criticism of it.

## 10. Conclusion

My question is whether, when an accreditation or approval ends, the affected
certificates can be identified.

If a means exists, I have not found it and would be glad to be corrected. If
none exists, I would be interested to know whether that is regarded as a
deficiency or as an accepted characteristic of the present arrangements.

Yours faithfully,

Ceri John
ValiChord

---

**Annex — technical note (supplied only if of interest)**

The implementation uses Holochain. This is not a blockchain: there is no shared
ledger, no mining, no tokens, and no single record of which all parties must hold
an identical copy. Each participant retains their own signed and ordered records,
comparable to existing practice with company documentation, and any party may
verify another's record against the same published rules without contacting them.
No party is required to hold a database of the industry's maintenance history.

Holochain is at version 0.7.0 and remains under development. This is a genuine
limitation.

The specification does not depend upon it. The browser implementation applies the
same rules in JavaScript with no network component, and the two are checked
against one another automatically.

Regarding earlier distributed ledger initiatives in this sector — TradeLens,
we.trade, Contour and others — my reading is that these failed for reasons of
governance rather than technology. TradeLens carried a substantial share of
global container traffic and was nonetheless discontinued. I do not propose an
intermediary and do not consider one necessary.
