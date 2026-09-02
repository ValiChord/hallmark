# Hallmark — the attestation format, draft v0.1

A format for saying **who was entitled to sign a release certificate, and exactly what they
claimed**, in a way a stranger can check years later without contacting anyone.

**Status: draft, but not speculative.** Most of this is implemented and passes an end-to-end test
against a real Holochain conductor. §13 says precisely what is built and what is not. This document
stays implementation-independent on purpose — it is what an outside party would build against, and
the reference implementation is one way to satisfy it, not the definition of it.

Terms: **MUST**, **SHOULD**, **MAY** as in RFC 2119.

---

## 1. What this is, and what it is not

ATA Spec 2000 Chapter 16 already defines the electronic release certificate. It defines the data,
the signature, and the chain: each certificate references the previous one for that part and
carries it forward with its signature intact.

**Its scope section excludes the signer's entitlement, in terms.** §1.2 limits the specification to
the data and processes needed to exchange electronic part certification forms, and states that it
does not include the internal processes companies use to generate the data, to
**"authorize users or signers of the data"**, or to process, store or repurpose it. The stated
rationale is that such processes are company-specific, so there is no need — and it is not
desirable — to standardise them.

That reasoning is sound for two trading partners who already know each other. It fails for a
stranger checking a chain twenty years later, across companies that may no longer exist.

The exclusion is not theoretical. §2.2 **requires** a digital certificate for the individual signing
an electronic form, to at least Medium Software assurance under ATA Spec 42, with the organisation
in the certificate corresponding to Block 4. So Chapter 16 mandates proof of *identity* while
explicitly declining to cover *entitlement* — and Spec 42, which supplies the certificate, verifies
an organisation's legal existence rather than any airworthiness privilege.

**This format specifies what falls between those two standards, and nothing else.**

> *Verified 2 September 2026 against ATA Spec 2000, Chapter 16, Revision 2019.1 §1.2, §1.3, §2.1
> and §2.2 — a licensed copy, read directly. Earlier drafts paraphrased §1.2 while presenting the
> paraphrase as a quotation, and a search of public sources could not find it because the document
> is not indexed. The substance was correct; the attribution was not.*

**This format specifies the excluded layer, and nothing else.**

- It **MUST NOT** replace or restate Chapter 16. A release certificate remains the authoritative
  document.
- An attestation is a **statement about** a release certificate: who signed, under what
  accreditation, what they observed, and what they did not.
- Where Chapter 16 already carries a field, an attestation **SHOULD** reference it rather than
  duplicate it.

---

## 2. What an attestation is

A signed statement by one party that, at a stated time, a stated **binding** held between a
physical part and a document, within an explicitly stated **scope**.

It is deliberately not a claim that the part is airworthy. That claim belongs to the certificate.
This format carries the thing that is currently missing: the checkable link, the entitlement behind
it, and the honest limits of what the signer observed.

| Part | Purpose |
|---|---|
| **Subject** | The physical part — type, part number, serial number |
| **Binding** | What ties part to document — serial number, document id, digest, predecessor |
| **Scope** | What the attester asserts, and explicitly what they do not |
| **Attester** | Who signed, in what role, under which accreditation |
| **Evidence** | Digests of and pointers to supporting records, never the records themselves |
| **Anchor** | Optional qualified timestamp, for legal weight |

---

## 3. Scope is the load-bearing field

Most failures this format targets are not lies, and not forgeries. They are **assertions made
wider than what the signer actually observed**.

The governing case comes from the adjacent marine domain, and it generalises: an officer
"inadvertently certified" that samples were drawn continuous-drip when they were not. Real person,
real signature, wrong assertion. No signature check catches that, and no cryptography ever will.

What a format *can* do is make the assertion **narrow, explicit, and machine-comparable**, so a
later dispute is about a stated fact rather than about what a signature was taken to mean.

- An attestation **MUST** enumerate what was observed, as discrete assertions.
- An attestation **MUST** be able to record `not_observed` for anything within the document's
  normal scope that the signer did not personally witness.
- A verifier **MUST NOT** infer any assertion that is not explicitly present. **Absence is never
  assent.**
- A verifier **MUST** distinguish *"this assertion was not made"* from *"this assertion was made
  and is false"*. Conflating them is how omission failures get laundered into apparent compliance.
- Profiles **MUST** define their assertion vocabulary as a closed list. Free text is not an
  assertion. Both `observed` and `not_observed` ids **MUST** be drawn from it.

This single rule is the difference between a useful record and a signed rubber stamp.

---

## 4. Structure

```json
{
  "raf_version": "0.1",
  "subject": {
    "part_type": "Engine",
    "part_number": "CFM56-7B27",
    "serial_number": "577737",
    "description": "CFM56-7B27 turbofan, stage 1 fan disk"
  },
  "binding": {
    "certification_path": "ReturnToService",
    "binds_field": "serial_and_part",
    "document_type": "EasaForm1",
    "document_id": "AFX-2026-0142",
    "document_digest": "sha256:0d5f3c2b9a71e4d8c6b2f014",
    "predecessor_document_hash": null
  },
  "scope": {
    "observed": [{ "assertion_id": "INSPECTED", "value": { "Bool": true } }],
    "not_observed": ["OVERHAULED", "MODIFIED"]
  },
  "evidence": [
    { "evidence_type": "shop_traveler", "digest": "sha256:a1b2c3d4e5f60718293a4b5c" }
  ],
  "attester": {
    "agent_pubkey": "…",
    "role": "Mro",
    "organisation": "AeroFix MRO Ltd",
    "organisation_id": "UK.145.01234"
  },
  "membership_proof_hash": "…",
  "anchor": null
}
```

`document_type` **MUST** be one of the forms Chapter 16 carries: FAA Form 8130-3, EASA Form 1,
CASA Form 1, TCCA Form One, Certificate of Conformance, or Transfer Document.

**There is no `issued_at` field.** Time **MUST** come from the signed record's own timestamp. A
self-asserted time field is backdatable, and an earlier draft of this design was exploitable
exactly there.

`predecessor_document_hash` is how the Chapter 16 chain is expressed. Where present, the
predecessor **MUST** concern the same part and **MUST** be strictly earlier.

Note what is *not* required: a certificate **MUST NOT** be assumed to reference its predecessor.
Neither regulator requires an ordinary serviceable release to cite the one before it — the chain is
mandated only for corrections, re-certifications, and items with no prior release. A profile that
made the predecessor mandatory would be over-constraining the regulation.

### 4.0 The certification path

`certification_path` **MUST** be present, and **MUST** be one of `AirworthinessApproval` (the
production side of the release certificate) or `ReturnToService` (the maintenance side).

The two are different documents with different rules. A profile **MUST** define, per path:

- the closed assertion vocabulary for that path;
- which accreditations may sign it;
- whether a predecessor certificate is permitted.

A record **MUST NOT** claim both. Both FAA and EASA instruct a signer to shade out the other side's
certification blocks, and both forbid a mixture of production- and maintenance-released items on one
certificate. A single flat vocabulary with a separate signer field admits combinations the
regulators exclude, and **MUST NOT** be used.

### 4.1 Encoding

The wire format **MUST NOT** be W3C Verifiable Credentials. The EU wallet's recognised formats are
IETF SD-JWT VC and ISO/IEC 18013-5 mdoc; the W3C data model "remains on the roadmap".

**SD-JWT VC is the working choice**, because selective disclosure is genuinely needed: a verifier
often has standing to see that a binding held without seeing commercial terms.

The JSON above is illustrative structure, not the wire encoding.

### 4.2 Evidence stays where it is

An attestation carries **digests and types**, not documents. Locators are optional and **MAY** be
absent or opaque.

This is not a privacy flourish. It is what lets a record be checked years later by someone who was
never party to the transaction, without anyone having to run a document store forever.

---

## 5. Value at N=2

The design **MUST** be testable against a pair with no third party present: a repair station and
an airline, alone, with no registry reachable.

What two parties get with nobody else involved:

1. Both hold the same signed statement of what was observed, with a scope neither can later widen.
2. The binding is recorded when the work is released, not reconstructed months later when a claim
   is filed.
3. Either can hand it to a stranger — an auditor, a regulator, a court — who can check it without
   contacting either of them.

If a proposed feature does not survive this test, it does not go in v1.

### 5.1 Counter-attestation

An attestation **MAY** carry a counter-attestation from the receiving party, over the same binding
and scope.

Agreement and disagreement are both useful, and **a disagreement recorded at handover is worth more
than one resolved later**.

A counter-attestation **MUST NOT** be required for the original to verify — requiring both parties
present breaks the N=2 case in exactly the conditions this format exists for — and **MUST NOT**
alter the original's trust status. It is evidence for a reader to weigh, not a verdict.

---

## 6. Membership is a time-bounded capability

This is the layer Chapter 16 excludes, and the reason this format exists.

- An attester **MUST** reference the accreditation it relies on.
- An accreditation **MUST** carry an expiry. There is no permanent membership.
- The referenced accreditation **MUST** have been issued before the attestation and **MUST NOT**
  have expired at the time of signing.
- The attester's declared role and organisation **MUST** match the accreditation.

**Why expiry is mandatory.** A validator can check, deterministically, that an accreditation was
live when a record was signed. It cannot prove the *absence* of a later revocation without
enumerating every record in existence. Expiry is therefore the only closed-world control available
at signing time; everything else is a matter for the reader. See §9.

### 6.1 Delegation

- Root authorities are named in the scheme's configuration and **MUST** be settable per deployment,
  not compiled into an implementation.
- A non-root **MAY** grant accreditation only along a published matrix, and only to a bounded depth.
- A delegated grant **MUST NOT** outlive the accreditation that authorised it.

The reference deployment uses depth 2: **root → OEM → repair station**. This mirrors how aviation
authority already delegates.

**What this does not solve.** Someone must still decide whose keys are roots, and must verify
real-world accreditation out of band. No regulator issues keys for this scheme. That is the
bootstrap problem: it is a governance question, and configuring roots per deployment makes the
choice visible and changeable rather than answering it.

---

## 7. Revocation

Revocation is an accreditor withdrawing an accreditation. It is **not** a group of competitors
agreeing to shun someone, and the distinction is legal as well as linguistic.

- A revocation **MUST** be a new record. It **MUST NOT** modify or delete the accreditation.
- Grounds **MUST** be objective, published in advance, and verifiable by anyone from the records
  alone.
- Grounds **MUST** be technical or procedural — *this attester issued records that contradict each
  other* — never *this attester is commercially unsatisfactory*.
- A revocation **MUST** carry the evidence that triggered it, checkable independently.
- There **MUST** be no discretionary override. A human veto is an operator, and an operator is
  someone's rival.
- Revocation grounds **MUST** be designed so they cannot fire on legitimate behaviour. A station
  certifying the same part again years later, or holding two authorised signers under one
  certificate, is normal.

### 7.1 Why this shape

Browsers distrust non-compliant certificate authorities and it is accepted, because the grounds are
objective, published in advance, and verifiable by anyone. That is the standard to meet.

Fail it and this is **a group of competitors maintaining a shared list of parties they collectively
refuse to deal with** — a concerted refusal to deal. Routing it through a neutral third party does
not cure that.

An administrative ground, exercised by the original issuer or a root over its own grants, is
permitted without evidence. Withdrawing your own accreditation is not collective action.

---

## 8. Anchoring: correctness and legal weight are separate

**Peer validation gives correctness. A qualified trust service gives legal weight.** These are
different jobs and **MUST NOT** be conflated.

Under eIDAS 2.0 a *qualified electronic ledger* must be created and managed by qualified trust
service providers and must ensure unique sequential chronological ordering. An architecture with no
operator and no global order can never itself be a qualified electronic ledger.

That is not fatal, because the ledger does not need to be qualified. **The record it emits needs to
be sealable by something that is.**

- An attestation **SHOULD** carry a qualified timestamp over its digest.
- The timestamp **MUST** be verifiable independently of whoever produced the attestation.
- Absence of a qualified timestamp **MUST NOT** prevent verification of the signature, the binding
  or the scope. It changes evidential weight, not validity.

> **Open, and it blocks reliance rather than building:** whether peer validation plus a qualified
> timestamp yields admissible evidence in the relevant forum. This needs a lawyer's answer.

---

## 9. Validation and verification are different jobs

An implementation **MUST** separate them.

| | **Validation** | **Verification** |
|---|---|---|
| When | Once, when the record is published | Every time a party reads it |
| Determinism | **Required.** Every checker must reach the same verdict | Not required |
| May enumerate? | **No.** Dependencies by explicit reference only | Yes |
| Answers | Is this record well-formed and was the signer entitled? | Should I rely on this now? |

**Revocation MUST be a verification-time judgement.** Validation happens once; a revocation
recorded later cannot retroactively unmake it, and proving the absence of a revocation would
require a record that exists both before and after the attestation it covers. Reaching for a
"certificate of non-revocation" reintroduces the notary this format exists to avoid.

A consequence, and it is not a defect: **a record can be validly published and later turn out to be
untrustworthy.** Trust is applied by the reader.

---

## 10. Verification

A verifier with no relationship to any party **MUST** be able to:

1. Check the signature over the attestation.
2. Check the binding identifier is well-formed under the profile.
3. Check the document digest, if the document is presented.
4. Check the attester's accreditation **at the time of signing**, walking the delegation chain to a
   root, with cycle detection.
5. Check the qualified timestamp, if present.
6. Report scope **as stated**, never widened.
7. Report any revocation of the accreditation, or of anything above it in the chain.

### 10.1 The two answers

A verifier **MUST** report these separately:

| | Meaning |
|---|---|
| `historically_valid` | Was this a real, properly authorised record when it was signed? |
| `currently_trusted` | Should a reader rely on it now? |

A revocation dated **after** the attestation leaves `historically_valid` true and sets
`currently_trusted` false. A release certificate written while a station was accredited remains a
real document; a later revocation taints *new* reliance, not the history.

Collapsing these into one boolean is a specification error. It is the single most important thing
this format gets right, and two earlier drafts got it wrong.

---

## 11. Profiles

The core above is domain-neutral. A **profile** binds it to a document type and a working practice
by specifying: the binding field, the closed assertion vocabulary, the accreditation types and the
delegation matrix.

- `profiles/aviation-back-to-birth.md` — the profile being built.
- `profiles/bunker-sample-seal.md` — a second profile, not being built, retained because it
  demonstrates the core generalises.

A profile **MUST NOT** widen the core rules. It may only constrain them further.

---

## 12. What this format cannot do

Stated here so it is not discovered later by a sceptic.

- **It cannot make a claim true.** A real person can sign a real record with a real key and still
  be wrong. Records are not inspections.
- **It cannot reconstruct history.** It helps parts entering service from now on. Historical
  paperwork gaps stay gaps.
- **It cannot make revocation instant.** Propagation is eventual; a reader who has not yet seen a
  revocation will report a clean result.
- **It cannot decide who the root authorities are.**

---

## 13. Status of each part

Three categories, and the difference between the second and the first is whether an automated test
actually runs it. Being loose about that is how a spec ends up claiming coverage it does not have.

**Implemented and exercised end to end against a real conductor**, single-node and across two
conductors, in CI on every push — see `docs/TECHNICAL-REFERENCE.md`:

§2 attestation structure · §3 scope, including `not_observed` · §6 root accreditation and refusal of
a non-root issuer · §7 revocation on `ConflictingAssertions` and `Administrative` grounds · §9 the
validation/verification split · §10 verification and the two answers · the blocks 13/14 split, with
the vocabulary, signer authority and predecessor rules enforced per path.

**Implemented and enforced, but not covered by an automated test:** counter-attestation ·
delegation past depth 1 · the delegation matrix · depth limits · membership expiry · expiry
inheritance · predecessor chains · key rotation in its entirety, including the handoff and
acceptance a rotation now requires · the `DuplicateDocument`, `DuplicateCertIssuance` and
`KeyRotated` revocation grounds · immutability · `genesis_self_check` refusing an empty root set ·
the link validation rules · vocabulary rejection.

That second list is the honest test gap. The rules exist and are enforced by the zome; nothing
demonstrates them running, so a regression in any of them would be silent.

**Specified, not implemented:**

- **§8 anchoring.** Nothing yet emits or checks a qualified timestamp. This is also why §10 step 5
  (check the qualified timestamp) does not run, and why attestation back-dating is not prevented.
- **§10 step 3 — checking the document digest against a presented document.** `verify_attestation`
  takes only an `ActionHash`; there is no parameter through which a document could be supplied. The
  digest is checked for shape, not against anything.

- **§4.1 SD-JWT VC encoding.** The reference implementation uses its platform's native encoding;
  the SD-JWT VC representation is unwritten.

**Open questions, not code:**

- **The assertion vocabulary.** The current list is illustrative. It must be built with
  airworthiness practitioners, and it is the largest piece of domain work outstanding.
- **The bootstrap** — whose keys are roots (§6.1).
- **Admissibility** (§8).
