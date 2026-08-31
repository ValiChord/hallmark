# Technical reference

What the system is, what it enforces, and where each rule lives. Current as of 1 September 2026,
against Holochain 0.7.0 / HDI 0.8.0 / HDK 0.7.0.

For building and running, see [`HANDOVER.md`](HANDOVER.md). For the format as a specification
independent of this implementation, see [`../SPEC.md`](../SPEC.md).

---

## 1. The one idea

An **attestation** binds a physical part to a document, records exactly what the signer observed
and what they did not, and is checkable by a stranger years later without contacting anyone.

Everything else in this document exists to answer one question about such a record: **was the
signer entitled to sign it at the moment they signed it?**

---

## 2. Validation versus verification

This distinction is the spine of the design. Getting it wrong was the fatal defect in two earlier
drafts.

| | **Validation** | **Verification** |
|---|---|---|
| When | Once, at publish | Every time someone reads the record |
| Where | Integrity zome, `validate()` | Coordinator zome, `verify_attestation()` |
| Constraint | **Must be deterministic** — every peer, at any time, reaches the same verdict | May query the DHT; different readers may see different states |
| Can it enumerate? | **No.** `must_get_valid_record` by hash only; `get_links` is unavailable | Yes — `get_links`, `get` |
| What it prevents | Malformed or unauthorised entries entering the DHT | Nothing. It informs a reader's judgement |

**Consequence, and it is not a bug:** an attestation can be validly published and later turn out
to be untrustworthy. The DHT is a shared space where anyone may publish, not a curated database.
Trust is applied by the reader.

**Why revocation cannot be a validation rule.** Validation runs once. A revocation recorded
afterwards cannot retroactively make an earlier entry invalid, and validation cannot prove the
*absence* of a revocation without enumerating — which it cannot do. Any "certificate of
non-revocation" would have to exist both before and after the attestation it covers. That is a
timestamp paradox, and reaching for it reintroduces the notary this project exists to avoid.

---

## 3. Trust anchors

`initial_members` in the DNA properties is a list of `AgentPubKeyB64` root authorities.

**It is supplied at install time, not compiled into the wasm.** The smoke test sets it through
`roles_settings.modifiers.properties` in the `installApp` call, so the same build installs under
different roots. This makes the bootstrap a deployment decision, visible in the install call,
rather than a code change.

`genesis_self_check` **refuses to install with an empty `initial_members`**. That refusal is
correct: a network with no root authority has no trust anchor at all.

**What this does not solve.** Someone must still decide whose keys those are, and must verify
real-world accreditation out of band — the FAA does not issue Holochain keys. That is the
bootstrap problem, and it is a governance question, not a technical one.

---

## 4. Entries

All entries are immutable. Updates and deletes are rejected. Correction is a new entry.

| Entry | Purpose |
|---|---|
| `Attestation` | Binds a part to a document, with scope |
| `MembershipProof` | A time-bounded accreditation, issued by a root or by a delegate |
| `MembershipRevocation` | Withdraws a membership. A separate Create, never an Update |
| `CounterAttestation` | Another party's agreement or disagreement. Informational only |
| `KeyHandoff` / `KeyAcceptance` | Two-step key rotation |

### 4.1 Attestation

```
raf_version            "0.1"
subject                part_type, part_number, serial_number, description
binding                binds_field, document_type, document_id,
                       document_digest, predecessor_document_hash?
scope                  observed: [{assertion_id, value}], not_observed: [assertion_id]
evidence               [{evidence_type, digest, locator?}]
attester               agent_pubkey, role, organisation, organisation_id
membership_proof_hash  the accreditation being relied on
anchor?                qualified_timestamp, timestamp_service_id
```

`document_type` covers `Faa81303`, `EasaForm1`, `CasaForm1`, `TccaFormOne`,
`CertificateOfConformance` and `TransferDocument` — the same set ATA Spec 2000 Chapter 16 carries.

**`scope` is the load-bearing field.** The failures this format targets are not forgeries. They
are assertions made wider than what the signer actually observed. `not_observed` lets a signer
say what they did not witness, so absence is never read as assent. Assertion ids come from a
closed vocabulary in the DNA properties; free text is not an assertion.

**There is no `issued_at`.** Time comes from the action's own timestamp. This is deliberate: a
self-asserted timestamp field is backdatable, and an earlier draft was exploitable exactly there.

### 4.2 MembershipProof

```
agent_pubkey, role, organisation, organisation_id
accreditation              accreditation_type, cert_number, issuing_authority
expires_at                 required
issuer_agent
issuer_membership_hash?    None iff the issuer is a DNA root
predecessor_membership_hash?  set when this replaces a rotated key's membership
depth                      1 for root-issued
```

A membership is **a time-bounded capability**, not a permanent status. `expires_at` is required
and capped by `max_membership_ttl_micros`. Expiry is the closed-world control on *future*
attestations — the thing validation can enforce deterministically, without enumerating.

---

## 5. What validation enforces

### 5.1 Membership

- The publisher must be the declared `issuer_agent`; self-issuance is rejected.
- `organisation`, `organisation_id`, `cert_number` and `issuing_authority` must be non-empty.
- `expires_at` must be after the action timestamp, and the TTL must not exceed
  `max_membership_ttl_micros`.
- The role must match the accreditation type.
- **Root-issued:** the issuer must be in `initial_members`, and `depth` must be 1.
- **Delegated:** the issuer's own membership is fetched by hash and must belong to them, must
  predate this proof, and must not have expired before it. `depth` increments and must not exceed
  `max_delegation_depth`.
- A delegated issuer may only grant along a fixed matrix: `OemAuthorized` may grant
  `DistributorAccredited`, `FaaRepairStation` or `EasaPart145`. Roots may grant any mapped
  accreditation. With `max_delegation_depth: 2` the live path is **root → OEM → shop**.
- A rotated membership must keep the same certificate, and its predecessor must be a different agent.

### 5.2 Attestation

- The action author must be the attester.
- `part_number`, `serial_number`, `document_id` must be present; `document_digest` must be
  non-trivial; each evidence item needs a type and a digest.
- Every assertion id, in `observed` **and** `not_observed`, must be in the DNA vocabulary.
- The referenced membership must belong to the attester, and its role and organisation must match
  the attester's claims.
- The membership must have been issued **before** this attestation and must not have expired at
  the action timestamp.
- If a predecessor is named, it must be the same part and must be **strictly earlier**.

Note what is absent: **no revocation check**. That belongs to verification.

### 5.3 Revocation

Grounds are checked against evidence the validator fetches by hash, so a revocation is only
accepted if the evidence actually demonstrates it.

| Grounds | What the evidence must show |
|---|---|
| `DuplicateDocument` | Two attestations by this agent sharing `document_type` + `document_id` |
| `ConflictingAssertions { assertion_id }` | Same part and serial, same assertion id, different values, and neither attestation names the other as predecessor — so it is not a supersede |
| `DuplicateCertIssuance` | The same `cert_number` + `issuing_authority` granted to two different agents with overlapping validity, neither a key-rotation predecessor of the other |
| `Administrative` | No evidence. Restricted to the original issuer or a DNA root |
| `KeyRotated` | Retirement of an old membership as part of a completed rotation |

The evidence-bearing grounds are the important ones: they are **objective, published in advance,
and checkable by any peer from the record alone**. That is the certificate-authority precedent,
and it is what keeps a shared exclusion list from being a concerted refusal to deal. See the
competition-law section of [`../README.md`](../README.md).

The `predecessor_of` and overlapping-validity tests exist to stop the rule firing on legitimate
behaviour — a shop re-certifying the same part years later, or a station with two authorised
signers. An earlier draft ejected honest issuers for exactly that.

---

## 6. What verification reports

`verify_attestation(attestation_hash)` returns:

| Field | Meaning |
|---|---|
| `membership` | `Active`, `Expired(at)`, `InvalidProof`, `NotFound`, `ChainBroken` |
| `predecessor` | `None`, `Ok`, `Missing`, `DifferentPart`, `NotEarlier` |
| `revocation` | `Clean`, `RevokedBeforeAssertion`, `RevokedAfterAssertion` |
| `scope` | Each assertion id, and whether it is in the vocabulary |
| `counters` | Counter-attestations, explicitly informational |
| `historically_valid` | Was this a real, properly authorised record when it was signed? |
| `currently_trusted` | Should a reader rely on it now? |

**The two booleans are the product.** A revocation dated after the attestation leaves
`historically_valid` true and sets `currently_trusted` false. An 8130-3 written while a shop was
accredited remains a real document; a later revocation taints *new* reliance on it, not the
history.

Verification walks the whole membership chain to a root, checking revocations at every level, with
cycle detection.

**Counter-attestations never flip `currently_trusted`.** A disagreement is evidence for a reader
to weigh, not a verdict.

---

## 7. Two implementations, one contract

The browser demo reimplements these rules in TypeScript (`demo/src/lib/raf/`) so it can run
without a conductor. That is a second implementation, and second implementations drift.

`demo/src/lib/raf/conformance.test.ts` pins the verdicts the real zome produces and asserts the
TypeScript engine matches. The zome side of the same contract is asserted inside
`demo/zomes/tests/conductor-smoke.mjs`. If either moves, one of the two fails.

Currently pinned, for the smoke-test scenario:

```
before revocation   membership=Active  revocation=Clean
                    historically_valid=true   currently_trusted=true
after revocation    membership=Active  revocation=RevokedAfterAssertion
                    historically_valid=true   currently_trusted=false
```

---

## 8. Known limits

- **One conductor, two agents.** Nothing exercises gossip between separate nodes, network
  partitions, or DHT convergence.
- **Key rotation is implemented but untested end to end.**
- **Revocation propagation is eventual.** A reader who has not yet received a revocation reports
  `Clean`. This is inherent to the model, not a defect, but a relying party should know it.
- **The bootstrap is unsolved** in the sense that matters: the code proves roots can be configured
  per deployment; it cannot tell you whose keys belong there.
- **Admissibility is unanswered.** Whether a peer-validated record plus a qualified timestamp
  constitutes admissible evidence is a legal question and it blocks reliance, not building.
- **The assertion vocabulary is a placeholder.** It must be built with airworthiness practitioners.
  Desk research is not enough, and the current list is illustrative.
