# Aviation provenance zomes (RAF 0.1)

Holochain **0.7** integrity + coordinator split. Integrity depends on `hdi = 0.8`. Coordinator depends on `hdk = 0.7` and the integrity crate.

## Layout

```
zomes/
  Cargo.toml                          workspace
  dna.yaml
  crates/integrity/                   validate, entries, links, genesis_self_check
  crates/coordinator/                 create_*, getters, verify_attestation
```

Two WASMs. One crate cannot produce both.

## Trust model (read this)

Integrity validation is inductive and closed-world: it can `must_get_valid_record(hash)` but it **cannot** `get_links`. A negative fact (“this agent has not been revoked”) cannot be proven at create time.

This DNA therefore:

1. Treats **membership as a time-bounded capability** (`expires_at` required, capped by `max_membership_ttl_micros`). That is the deterministic gate on *new* attestations.
2. Treats **revocation as a separate Create**, evidence-checked, linked from the membership. The coordinator `verify_attestation` report is fail-closed on those links.
3. Distinguishes **historically_valid** (well-formed at action time) from **currently_trusted** (not since revoked). An 8130-3 written while a shop was a member remains a real document; a later revocation taints new reliance.
4. Does **not** use a “non-ejection proof”. That design cannot work: the proof would have to exist before the attestation (to be hashed into it) and after it (to cover attestation time).

## Revocation grounds

| Grounds | What it actually requires |
|---|---|
| `DuplicateDocument` | Same `document_type` + `document_id`, two attestations, same agent |
| `ConflictingAssertions` | Same part+serial, same assertion id, **different values**, and **neither is the other’s predecessor** |
| `DuplicateCertIssuance` | Same cert granted to two agents with overlapping validity; key-rotation predecessors are excluded |
| `Administrative` | Original issuer or a DNA root |
| `KeyRotated` | Handoff (old key) + acceptance (new key) |

Inspect-then-overhaul of the same serial is **not** a conflict. That is a predecessor chain.

## Identity binding

`organisation` and `organisation_id` live on `MembershipProof`. An attestation’s attester fields must match. They are not the cert number or the issuing authority.

## Key rotation

1. Old key: `create_key_handoff`
2. New key: `accept_key_handoff`
3. Original issuer or a root: `complete_key_rotation` — issues a new membership with `predecessor_membership_hash` set, then revokes the old one as `KeyRotated`.

Both keys sign. The new key is not a synthetic root.

## Build

```sh
rustup target add wasm32-unknown-unknown
cd zomes
cargo build --release --target wasm32-unknown-unknown
```

Install-time DNA properties must set `initial_members` to the root authorities’ `AgentPubKeyB64` strings (`uhCAk...`). An empty list fails `genesis_self_check`.
