# Holochain ↔ SPEC.md / README.md Constraint Mapping

## README.md Design Constraints

| # | Constraint | Holochain Mechanism | Status |
|---|-----------|---------------------|--------|
| 1 | **Value at N=2** | Countersigning: two parties sign same entry, no third needed | ✅ Solved |
| 2 | **Format and rulebook, never a platform** | DNA = open-source rules; no company, no server | ✅ Solved |
| 3 | **Owner cannot be a participant** | No owner. DNA is code, not a company. | ✅ Solved |
| 4 | **Onboarding in an afternoon, without permission** | Download DNA, present membrane proof, join DHT | ✅ Solved |
| 5 | **Sealable by qualified trust service** | Anchor field accepts RFC 3161 timestamp; optional | ✅ Supported |
| 6 | **Ejection rule: objective, published, checkable** | `validate_ejection_creation` in DNA; deterministic | ✅ Solved |
| 7 | **Not W3C VC** | Native Holochain entries; wire format is agent-centric | ✅ Solved |
| 8 | **Extend what exists** | Extends ATA Spec 2000 Ch 16 (already chains); adds trust anchor | ✅ Designed |

## SPEC.md Requirements

| Section | Requirement | Holochain Implementation |
|---------|-------------|-------------------------|
| §1.1 | Five parts (Subject, Binding, Scope, Evidence, Anchor) | `Attestation` struct with all five |
| §2 | Scope is load-bearing; closed vocabulary; `not_observed` | `Scope` struct with `observed`/`not_observed`; `AVIATION_ASSERTION_VOCABULARY` constant |
| §3.1 | Not W3C VC; SD-JWT VC working choice | Holochain native entries; can export to SD-JWT VC if needed |
| §3.2 | Evidence stays where it is (digests only) | `Evidence` struct carries `digest` and optional `locator` |
| §4 | Value at N=2; counter-attestation optional | `countersign_attestation` function; counter-attestation not required for validity |
| §4.1 | Counter-attestation MAY carry agreement or disagreement | `AgreementStatus` enum: Agree, Disagree, Partial |
| §5 | Peer validation + qualified timestamp = correctness + legal weight | `Anchor` struct for qualified timestamp; peer validation via DNA rules |
| §6.1 | Membership rules as code; objective ejection; no discretionary override | DNA `validate` callback; `EjectionGrounds` enum; `validation_threshold_met` field |
| §7 | Verification by stranger: signature, binding, digest, membership, timestamp, scope | `verify_attestation` function implements all 6 steps |
| §7 | Distinguish "not made" from "made and false" | `Scope` design: absence from `observed` = not made; presence = made |

## Known-Unfinished Items (SPEC.md §8)

| Item | Holochain Approach | Status |
|------|-------------------|--------|
| Historical membership check | `check_historical_membership` queries DHT for proofs/ejections | 🟡 Implemented; needs load testing |
| Revocation without operator | Ejection records published to DHT; peer-enforced | 🟡 Implemented |
| Key rotation | `KeyRotation` entry type with continuity proof | 🟡 Implemented |
| Assertion vocabularies | `AVIATION_ASSERTION_VOCABULARY` constant; needs practitioner input | 🔴 Placeholder |
| Seal-number field in IMO Compendium | Not applicable to aviation profile | N/A |

## Aviation-Specific Gaps

| Gap | Holochain Relevance |
|-----|---------------------|
| **Rec #9 owner** | If #9 gets an owner, this architecture becomes a proposal to that owner, not a competing standard |
| **SAE AIR7123** | May overlap; check before building |
| **Admissibility** | Not solved by code; needs lawyer |
| **ATA Spec 42** | Describes incumbent PKI trust anchor; not needed for demo |
