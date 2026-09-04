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
| `CounterAttestation` | Another party's agreement or disagreement. Informational only, but requires a live accreditation |
| `KeyHandoff` / `KeyAcceptance` | Two-step key rotation |

### 4.1 Attestation

```
raf_version            "0.1"
subject                part_type, part_number, serial_number, description
binding                certification_path, binds_field, document_type, document_id,
                       document_digest, predecessor_document_hash?
scope                  observed: [{assertion_id, value}], not_observed: [assertion_id]
evidence               [{evidence_type, digest, locator?}]
attester               agent_pubkey, role, organisation, organisation_id
membership_proof_hash  the accreditation being relied on
anchor?                qualified_timestamp, timestamp_service_id
```

`document_type` covers `Faa81303`, `EasaForm1`, `CasaForm1`, `TccaFormOne`,
`CertificateOfConformance` and `TransferDocument` — the same set ATA Spec 2000 Chapter 16 carries.

### 4.1.1 Mapping to FAA Form 8130-3

The attestation does not replace the release certificate; it makes a checkable statement about
one. These are the fields that correspond, with their block numbers on the form.

| Attestation field | 8130-3 | Block name |
|---|---|---|
| `binding.document_id` | Block 3 | FAA Form Tracking Number |
| `attester.organisation` | Block 4 | Organization Name and Address |
| `subject.description` | Block 7 | Description |
| `subject.part_number` | Block 8 | Part Number |
| `subject.serial_number` | Block 10 | Serial Number |
| `scope.observed` | Block 11 | Status/Work |
| `binding.predecessor_document_hash` | Block 12 | Remarks — where Chapter 16 records the previous certificate |

**The form has two paths and they are not interchangeable.** Blocks 13a–13e are *Airworthiness
Approval*; blocks 14a–14e are *Approval for Return to Service*. The maintenance case this project
models — a repair station releasing a part it has worked on — is the **block 14 path**.

> **The split is part of the record.** `binding.certification_path` names which block set a record
> represents, and the zome enforces the consequences: the Block 11 vocabulary is partitioned by
> path, the signer's accreditation must be able to sign that path, and an airworthiness approval may
> not carry a predecessor certificate. Enforced in the Rust, mirrored in the TypeScript engine, with
> the negative cases run against a real conductor in CI.
>
> It was a UI distinction until 2026-09-01 — the finding the audit that day flagged as the one an
> aviation reviewer checks first.

### Block 11 vocabulary, per path

Both documents were reissued in September 2025, and the pair **splits the guidance in two**. This
is not a modelling choice; it is how the regulator organises the form.

| | Blocks 13a–13e | Blocks 14a–14e |
|---|---|---|
| Certifies | Airworthiness approval | Approval for return to service |
| Governed by | **FAA Order 8130.21J**, 25 Sep 2025 | **AC 43-9D**, 22 Sep 2025 |
| Under | 14 CFR part 21 | 14 CFR part 43 |
| Block 11 terms | NEW, PROTOTYPE, USED | OVERHAULED, REPAIRED, INSPECTED, TESTED, MODIFIED |
| Force of the list | Closed: "Enter one of the terms below" (¶11.k) | Enumerated but advisory: the term "should reflect the kind of work" (Table B-1) |
| Who signs | A production approval holder (§21.137(o)) | "Only those persons authorized by 14 CFR §43.7(b)–(e)" (¶23.4.1) |
| Predecessor | None. This path is where a chain begins | Permitted |

8130.21J hands the maintenance case away explicitly (¶5.c): *"Approvals for Return to Service (RTS)
… refer to AC 43-9, Maintenance Records."* And each document tells the signer to shade out the other
side's blocks (¶11.r and ¶B.13), while ¶8.k(3) forbids "release of a mixture of production- and
maintenance-released" articles on one form. **The two halves are mutually exclusive per record**, so
the model is two variants discriminated by path, not one flat vocabulary with a signer field.

Two term definitions worth carrying, both verbatim:

- **OVERHAULED** — "at least disassembled, cleaned, inspected, repaired as necessary, reassembled,
  and tested in accordance with the approved standards and technical data" (AC 43-9D Table B-1).
- Table B-1's note — **"The applicable standard must be described in block 12."** This is why a
  return to service in this implementation must cite at least one `evidence` entry.

**EASA differs, and that is the point of keeping the vocabulary in DNA properties.** Appendix I to
Part-21 gives the production side as PROTOTYPE and NEW only — no USED. Appendix II to Part-M gives
the maintenance side as Overhauled, Repaired, **Inspected/Tested** (one combined term), Modified,
and says "Enter only one of these terms". A different regulator is a different *install*, not a
different build.

**One term was removed.** `LIFE_LIMITED_SCRAP` appeared in neither regulator's list, and a release
certificate is the wrong instrument for it: EASA AMC1 145.A.50(d) says a certificate "should not be
issued for any item when it is known that the item is unserviceable". Scrapping a life-limited part
needs its own record type.

**What is still open.** The lists are settled; how an organisation *chooses* between overlapping
terms in a real shop is not, and AC 43-9D's advisory phrasing leaves whether a term outside Table
B-1 is non-compliant genuinely unsettled. That is a narrower question than "the vocabulary is
provisional", which is what this section used to say.

*Sources, all free from faa.gov and eur-lex.europa.eu: FAA Order 8130.21J (25 Sep 2025) ¶11.k,
¶11.r, ¶5.c, ¶8.k; AC 43-9D (22 Sep 2025) ¶B.11 Table B-1, ¶B.13, ¶B.14, ¶23.4.1; 14 CFR §43.7,
§43.9; Reg (EU) 748/2012 Annex I Appendix I; Reg (EU) 1321/2014 Annex I Appendix II. Note the
previously cited "§4-1(k)" was 8130.21H numbering — J renumbered, and AC 43-9C is cancelled.*

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
competition-law section of [`WHY.md`](WHY.md).

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
| `chain` | What this node knows of the attester's own chain: `Valid`, `Closed`, `Forked`, `Invalid`, `Warranted`, `Unknown`, `NotChecked` |
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

### The chain check, and why `Unknown` does not fail closed

`chain` reports what this node knows of the attester's own source chain, from
`get_agent_activity`. `Forked` is why it exists: two conflicting actions at one
sequence number is a station signing two contradictory 8130-3s, which is the
fraud this format targets. Holochain detects it already; the report never asked.

`Forked`, `Invalid` and `Warranted` set `currently_trusted: false` and leave
`historically_valid` alone — a fork found today says nothing about whether the
record was properly authorised when signed.

`Warranted` exists because `ChainStatus::Valid` is only the answering
authority's opinion. Its own documentation says to read `warrants` for
"a full picture of their validity", so checking status alone gives a false clean
bill of health.

**`Unknown` is reported and deliberately does not change the verdict**, which is
the opposite of `RevocationCheck::Unknown`. The two look alike and are not. A
revocation link that resolves while its record does not is evidence of something
this node cannot read. `ChainStatus::Empty` is the ordinary state of any node
that is not an authority for that agent. Measured on 4 September 2026: a wholly
legitimate attestation reports `Empty` on a single conductor, and failing closed
marked every record untrusted — including in the demonstration.

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

- **Two conductors on one machine.** `network-gossip.mjs` exercises gossip, cross-node authoring and
  revocation propagation between independent conductors, in CI, on every push. Network partitions,
  adversarial peers and separate physical hosts are still untested.
- **Key rotation is implemented but untested end to end.**
- **Revocation propagation is eventual.** A reader who has not yet received a revocation reports
  `Unknown` if the link arrived without the record, and `Clean` if neither arrived. The second case
  is inherent to the model, not a defect, but a relying party should know it.
- **`historically_valid` can be false because data has not arrived yet.** A missing membership or
  predecessor sets it false, and those are ordinary propagation states, not historical facts. So a
  stranger fetching an attestation before its membership gossips is told the document *was not
  properly authorised when signed* — a claim about the past, not about their sync state. This is
  deliberate fail-closed design, but the field's name overstates what it knows. Read
  `membership`/`predecessor` alongside it.
- **The vocabulary cannot be changed for the life of a network, and that is worse than the problem
  this entry used to describe.**

  ⚠️ *Corrected 4 September 2026. This previously said a vocabulary revision would retroactively
  invalidate records that were correct when written. **That cannot happen**, and the reason is
  stated elsewhere in our own documents: `modifiers.properties` is part of the DNA hash — see
  `desktop/README.md`, "Networks, and who the roots are". A changed vocabulary is a changed DNA
  hash, which is a different network, which contains no existing records. There is no state in
  which old records are re-judged. `verify_attestation` reads properties from `dna_info()`, which
  is fixed within a network.*

  The real constraint: **revising the vocabulary means starting a new DHT and abandoning every
  record in the old one.** There is no migration path — `unstable-migration` gates the manifest's
  `lineage` field, and Holochain does not verify a claimed lineage is truthful even when it is
  enabled.

  Two consequences worth stating before any production install:

  1. The vocabulary must be settled *first*. It is not a field that can be revised in service.
  2. "A different regulator is a different install" — the phrase in `dna.yaml` — also means a
     permanently separate, non-interoperable DHT per regulator. An FAA network and an EASA network
     could not verify each other's records at all. That may be correct, but it is a design
     decision, not an implementation detail.
- **Neither implementation checks a signature.** In the zome this is a correct delegation —
  Holochain sys-validates the author's signature before the record ever reaches validation, and
  `signature_checked_by_sys` is a constant asserting that, not a check. In the browser engine there
  are no signatures at all. What *is* checked in both is `author_matches_attester`.
- **Attestation timestamps are author-controlled.** Expiry is enforced against the action timestamp,
  which the signer writes. An agent whose chain has been idle since their approval lapsed can
  back-date within that whole interval, and a modified client is all it takes. There is no fully
  deterministic fix inside HDI: closing it needs a qualified external timestamp
  (`Attestation.anchor`, which exists in the type and is not yet validated anywhere). Do not claim
  back-dating is prevented.
- **The bootstrap is unsolved** in the sense that matters: the code proves roots can be configured
  per deployment; it cannot tell you whose keys belong there.
- **Admissibility is unanswered.** Whether a peer-validated record plus a qualified timestamp
  constitutes admissible evidence is a legal question and it blocks reliance, not building.
- **The assertion vocabulary is settled as to its terms, not as to its use.** Both lists are now
  verbatim from the regulator (see 4.1.1). What desk research cannot settle is how a shop chooses
  between overlapping terms in practice, and whether AC 43-9D Table B-1 is exhaustive or merely
  illustrative - its own phrasing does not say.
