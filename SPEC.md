# Release Attestation Format — draft v0.1

**Status: draft. Nothing here is stable.** This exists to be argued with, and to force the design
decisions into the open before any code is written.

Terms: **MUST**, **SHOULD**, **MAY** as in RFC 2119.

---

## 1. What an attestation is

An **attestation** is a signed statement by one party that, at a stated time, a stated **binding**
held between a physical artefact and a document, within an explicitly stated **scope**.

It is deliberately *not* a claim that the artefact is good, compliant, or fit for purpose. Those
claims belong to the certificate itself. This format carries the thing that is currently missing:
the checkable link, and the honest limits of what the signer actually observed.

### 1.1 The five parts

| Part | Purpose |
|---|---|
| **Subject** | The physical artefact — a fuel parcel, a retained sample, a part |
| **Binding** | The identifier tying artefact to document — seal number, serial number |
| **Scope** | What the attester asserts, and explicitly what they do not |
| **Evidence** | Digests of and pointers to the documents, never the documents themselves |
| **Anchor** | What gives the record time and legal weight |

---

## 2. Scope is the load-bearing field

Most of the failures this format targets are not lies. They are **assertions made wider than what
the signer actually observed.**

The governing case: an officer *"inadvertently certified"* that samples were drawn continuous-drip
when they were not. Real person, real signature, wrong assertion. No signature check catches this,
and no cryptography ever will.

What a format *can* do is make the assertion **narrow, explicit and machine-comparable**, so that a
later dispute is about a stated fact rather than about what a signature was taken to mean.

Therefore:

- An attestation **MUST** enumerate what was observed, as discrete assertions.
- An attestation **MUST** be able to record `not_observed` for anything within the document's normal
  scope that the signer did not personally witness.
- A verifier **MUST NOT** infer any assertion that is not explicitly present. Absence is never
  assent.
- Profiles **MUST** define their assertion vocabulary as a closed list. Free text is not an
  assertion.

This one rule is the difference between a useful record and a signed rubber stamp.

---

## 3. Structure

```json
{
  "raf": "0.1",
  "subject": {
    "type": "marine.fuel.sample",
    "identifiers": { "seal_number": "SG-4471902", "imo": "9376681" }
  },
  "binding": {
    "binds": "seal_number",
    "to_document": { "type": "bdn", "id": "BDN-2026-08-27-1142", "digest": "sha256:..." }
  },
  "scope": {
    "observed": [
      { "assertion": "sample.drawn_at_manifold", "value": true },
      { "assertion": "sample.method_continuous_drip", "value": true },
      { "assertion": "seal.applied_in_presence", "value": true }
    ],
    "not_observed": [ "sample.stowage_after_handover" ]
  },
  "evidence": [
    { "type": "lab_certificate", "digest": "sha256:...", "locator": "opaque-or-absent" }
  ],
  "attester": { "id": "did-or-key-identifier", "role": "vessel.chief_engineer" },
  "time": { "asserted_at": "2026-08-27T03:14:00Z" },
  "anchor": { "qualified_timestamp": "rfc3161:..." },
  "signature": "..."
}
```

### 3.1 Encoding

The wire format **MUST NOT** be W3C Verifiable Credentials. The EU wallet's recognised formats are
**IETF SD-JWT VC** and **ISO/IEC 18013-5 mdoc**; the W3C data model "remains on the roadmap".

**SD-JWT VC is the working choice**, because selective disclosure is genuinely needed here — a
verifier often has standing to see the binding held without seeing commercial terms.

The JSON above is illustrative structure, not the wire encoding.

### 3.2 Evidence stays where it is

An attestation carries **digests and types**, not documents. Locators are optional and **MAY** be
absent or opaque.

This is not a privacy flourish. It is what lets the record be checked years later by someone who was
never party to the transaction, without anyone having to run a document store forever.

---

## 4. Value at N=2

The design **MUST** be tested against a pair with no third party present. A bunker supplier and a
vessel, alone, at 3am, with no registry reachable.

**What two parties get with nobody else involved:**

1. Both hold the same signed statement of what was observed, with a scope neither can later widen.
2. The binding is recorded at the moment the seal is applied, not reconstructed from memory weeks
   later when a claim is filed.
3. Either can hand it to a stranger — a surveyor, a club, a court — who can check it without
   contacting either of them.

If a proposed feature does not survive this test, it does not go in v1.

### 4.1 Counterparty acknowledgement

An attestation **MAY** carry a counter-attestation from the other party, over the same binding and
scope.

Agreement and disagreement are both useful, and **a recorded disagreement at the time of delivery is
worth more than a resolved one**. Profiles with claim time bars should note that an early recorded
dispute starts the evidential clock.

A counter-attestation **MUST NOT** be required for the original to verify. Requiring both parties
online simultaneously breaks the N=2 case in exactly the conditions the format exists for.

---

## 5. Anchoring: correctness and legal weight are separate

**Peer validation gives correctness. A qualified trust service gives legal weight.** These are
different jobs and must not be conflated.

Under eIDAS 2.0 a *qualified electronic ledger* must be created and managed by one or more qualified
trust service providers and must ensure unique sequential chronological ordering. An architecture
with no operator and no global order **can never itself be a qualified electronic ledger.**

That is not fatal, because the ledger does not need to be qualified. **The record it emits needs to
be sealable by something that is.**

- An attestation **SHOULD** carry a qualified timestamp over its digest.
- The timestamp **MUST** be verifiable independently of whoever produced the attestation.
- Absence of a qualified timestamp **MUST NOT** prevent verification of the signature and binding —
  it changes evidential weight, not validity.

> **Open, and it blocks the build:** whether peer validation plus a qualified timestamp yields
> admissible evidence in the relevant forum. Get a lawyer's answer before writing code. If it does
> not, the approach needs rethinking.

---

## 6. Membership and ejection

The joining rule is where the trust list problem is actually answered, and where this becomes a
cartel if done badly.

### 6.1 Requirements

- Membership rules **MUST** be expressed as code that any participant can run and any stranger can
  audit.
- Grounds for ejection **MUST** be objective, published in advance, and verifiable by anyone from the
  record alone.
- Grounds **MUST** be technical or procedural — *this attester issued attestations whose bindings
  contradict each other*, never *this attester is commercially unsatisfactory*.
- An ejection **MUST** be accompanied by the evidence that triggered it, checkable independently.
- There **MUST** be no discretionary override. A human veto is an operator, and an operator is
  someone's rival.

### 6.2 Why this shape

Browsers do distrust and effectively kill non-compliant certificate authorities, and it is accepted,
because the grounds are objective, published in advance and verifiable by anyone. That is the
standard to meet.

**Fail it and this is a group of competitors maintaining a shared list of parties they collectively
refuse to trade with** — a concerted refusal to deal. Routing it through a neutral third party does
not cure that.

---

## 7. Verification

A verifier, with no relationship to any party and no network access beyond the record:

1. Check the signature over the attestation.
2. Check the binding identifier is well-formed under the profile.
3. Check the document digest matches, **if** the document is presented.
4. Check the attester's membership at `asserted_at` — not at verification time. *Membership is
   historical; this is the hard part and §6 is not finished.*
5. Check the qualified timestamp, if present.
6. Report scope **as stated**, never widened.

A verifier **MUST** distinguish *"this assertion was not made"* from *"this assertion was made and is
false"*. Conflating them is how omission failures get laundered into apparent compliance.

---

## 8. Known-unfinished

Listed so nobody mistakes a gap for a decision.

- **Historical membership check (§7 step 4)** — the actual trust list problem, and the least
  finished part of this document.
- **Revocation** without an operator or a global order.
- **Key rotation and long-lived records.** MARPOL requires the delivery note aboard and inspectable
  for three years; OW Bunker litigation ran nine. Key material outlives no design here.
- **Assertion vocabularies** — must be built with domain practitioners, not desk research.
- **Whether the seal-number field in the IMO Compendium eBDN data set is usable as the binding.**
  Check it before designing a parallel one.
