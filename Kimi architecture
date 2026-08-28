# Holochain Architecture for Aviation Back-to-Birth — Revised (Post-Review)

## What Changed

The review identified six defects, three fatal. This revision addresses all of them:

1. **Trust anchor:** `ROOT_AUTHORITIES` is now `AgentPubKey` list in DNA properties, not string literals. The bootstrap problem is stated explicitly, not hidden.
2. **Validation determinism:** No `get()` or `get_links()` in `validate()`. Only `must_get_valid_record()` — deterministic fetches by hash.
3. **Ejection is verification-time:** Removed from validation. A stranger checking a record queries the DHT for ejection records and applies their own judgement.
4. **Backdating fixed:** Uses action timestamp, not user-supplied field.
5. **Theatre removed:** `validation_threshold_met` boolean deleted; predecessor check actually implemented.
6. **N=2 corrected:** Not countersigning. Local source chains + peer-to-peer exchange.
7. **Competition law claim deleted:** Architecture does not claim to solve competition law.

---

## The Honest Separation: Validation vs Verification

This is the core conceptual fix.

| | Validation (Publish Time) | Verification (Read Time) |
|---|---|---|
| **When** | Once, when publishing to DHT | Every time a stranger checks the record |
| **Constraint** | Must be deterministic — all peers agree | Can use DHT lookups — may see different states |
| **What it checks** | Structural correctness, signature validity, referenced entries exist, vocabulary closed, timestamps consistent | Membership authority, ejection status, predecessor chain semantic correctness, counter-attestations |
| **What it prevents** | Malformed entries entering DHT | Nothing — verifiers apply trust |
| **Holochain mechanism** | `validate()` callback | `verify_attestation()` zome function |

**This means: bad attestations can enter the DHT.** A repair station with an invalid membership proof can publish an attestation that passes validation. Peers will store it. The DHT is not a curated database. It is a shared space where anyone can publish, and verifiers apply their own judgement.

This is not a bug. It is the correct model. A PDF on a lab letterhead is also "stored by everyone who receives it" and "trusted by brand, not by cryptographic enforcement." The DHT replaces the email attachment; verification replaces the brand-trust heuristic.

---

## N=2: How It Actually Works

**The claim in v1 was wrong.** Holochain countersigning requires all parties online simultaneously and is unstable.

**The correct mechanism:**

1. Repair station writes attestation to their **local source chain** (no network needed).
2. Repair station shares the attestation with airline via **peer-to-peer exchange** — QR code, Bluetooth, local network, email attachment of the signed entry.
3. Airline verifies locally: checks signature, checks structural correctness, checks membership proof (if they have it cached).
4. Airline writes counter-attestation to their own local source chain.
5. Later, when either party has connectivity, they publish to the DHT.

**Both parties hold tamper-evident, signed records without a third party present.** The DHT provides redundancy and discoverability for strangers later. It is not required for the pairwise transaction.

This satisfies README.md constraint #1: **"Value at N=2. Two parties with no third present must get something on day one."**

---

## The Trust Anchor: What Is Actually Hard

The review's first fatal finding is correct and deeper than code.

**The problem:** The FAA issues repair station certificates via X.509 PKI. The FAA does not have a Holochain public key. There is no cryptographic bridge between the existing accreditation infrastructure and the DHT.

**The pragmatic solution in v2:**

1. A **trusted verifier** (or small set of verifiers) checks FAA/EASA certificates out-of-band.
2. These verifiers are hard-coded as `root_authorities` in the DNA properties (AgentPubKeys).
3. They issue `MembershipProof` entries on the DHT, signed with their Holochain keys.
4. Attestations reference these membership proofs by hash.
5. Validation checks the membership proof exists and was signed by a root authority.
6. Verification checks the root authority is still trusted.

**The bootstrap problem is real.** Someone must install the DNA with root authority pubkeys. That someone is a centralization point. The DNA is open-source and auditable, but the install-time configuration is not trustless.

**Alternative paths:**
- Each jurisdiction runs its own DNA with its own root authorities (FAA DNA, EASA DNA).
- A coalition secretariat acts as the initial root authority, with a published multi-sig handoff plan.
- Web-of-trust: members vouch for each other, but this has sybil risks and does not solve the bootstrap.

The architecture does not claim to solve the bootstrap. It claims to make the bootstrap **transparent and auditable** — which is more than a closed platform offers.

---

## Competition Law: What the Architecture Does Not Claim

**Deleted claim:** "No owner = no competition issue."

**The truth:** A group of competitors using shared ejection rules may still be a concerted refusal to deal, regardless of architecture. The README is explicit: "Routing it through a neutral third party does not cure that."

**What the architecture provides:**
- Ejection grounds are objective, published in advance, and checkable by anyone (the DNA is open-source).
- There is no discretionary override.
- The ejection record carries evidence that any peer can independently verify.

**What the architecture does NOT provide:**
- Legal immunity from competition law.
- A guarantee that courts will view this differently from a traditional trust list.

The legal form (foundation, cooperative, or other) and the ejection rule design must both be reviewed by a competition lawyer. The code is a necessary condition, not a sufficient one.

---

## What Holochain Actually Buys

| Property | Before (Email/PDF) | After (Holochain) |
|---|---|---|
| **Local-first issuance** | Requires connectivity to sign | Source chain works offline |
| **Tamper-evidence** | PDF can be edited | Source chain is cryptographically integrity-protected |
| **Discoverability** | Must contact issuer | DHT makes records findable by strangers |
| **Redundancy** | Single point of failure (issuer's server) | DHT stores redundantly across peers |
| **Rules auditability** | Proprietary platform | DNA is open-source code |
| **Trust anchor** | Brand trust (VPS, Intertek) | Root authority membrane proofs (with bootstrap caveat) |
| **Ejection enforcement** | None | Verification-time checks (not retroactive) |

**What it does NOT buy:**
- Automatic trust (verifiers still judge).
- Retroactive invalidation (ejection is read-time only).
- Competition law compliance (needs lawyer review).
- FAA integration (needs bootstrap).

---

## Architecture Diagram (Revised)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION (Publish Time) — DETERMINISTIC             │
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│   │  Signature  │────▶│  Structure  │────▶│  References │               │
│   │   valid?    │     │   valid?    │     │  exist via  │               │
│   └─────────────┘     └─────────────┘     │must_get_*?  │               │
│                                           └─────────────┘               │
│   → All peers agree. Entry enters DHT.                                  │
│   → Does NOT check: ejection, membership authority, semantic chain.     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DHT (Shared Data Space)                          │
│                                                                          │
│   Attestations │ MembershipProofs │ EjectionRecords │ CounterAttestations│
│   (anyone can  │ (root authority  │ (root authority │ (any member can    │
│    publish)    │  signed only)    │  signed only)   │  publish)          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  VERIFICATION (Read Time) — NON-DETERMINISTIC            │
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│   │  Membership │────▶│  Ejection   │────▶│ Predecessor │               │
│   │  authority  │     │   status    │     │    chain    │               │
│   │  check      │     │  (DHT query)│     │  (DHT query)│               │
│   └─────────────┘     └─────────────┘     └─────────────┘               │
│   → Stranger applies own trust judgement.                               │
│   → Different verifiers may see different DHT states.                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps (Revised)

1. **Legal review** of the anchoring pattern AND the ejection rule design for competition law.
2. **Bootstrap design:** Who are the initial root authorities? How do they verify FAA/EASA certs? What is the handoff plan?
3. **Download coalition Sept 2025 progress report** to check if #9 has an owner.
4. **Find two parties:** One repair station and one airline willing to test peer-to-peer attestation exchange.
5. **Build minimal UI:** Issue attestation locally, export as file/QR, import and verify locally.
6. **Do not buy ATA Spec 42.** The demonstration does not depend on it.
