//! Aviation provenance integrity zome (RAF 0.1) for Holochain 0.7 / HDI 0.8.
//!
//! # Trust model
//!
//! Integrity validation is **deterministic and inductive**. It can fetch a
//! dependency by hash (`must_get_valid_record`) but it cannot enumerate
//! collections (`get_links` is coordinator-only). Therefore:
//!
//! - A membership is a **time-bounded capability**. Issuance time is the
//!   Create action timestamp; `expires_at` is required and capped by DNA
//!   properties. This is the closed-world control on *future* attestations.
//! - A [`MembershipRevocation`] is a separate Create. It is checked in the
//!   coordinator `verify_attestation` report. It is **not** a proof of
//!   absence at create-time. Do not add a "non-ejection certificate" — that
//!   reintroduces a notary and cannot be satisfied without a timestamp
//!   paradox (the proof would have to exist both before and after the
//!   attestation).
//! - `historically_valid` vs `currently_trusted` is a relying-party
//!   distinction: an 8130-3 written while a shop was a member stays a real
//!   document; a later revocation taints *new* reliance.
//!
//! Entries are immutable. Revocation is a new entry, not an Update.

mod dna;
mod paths;
mod types;
mod validate;

pub use dna::*;
pub use paths::*;
pub use types::*;

use hdi::prelude::*;
use validate::{validate_create, validate_link};

#[hdk_entry_types]
// `Attestation` is much larger than the other variants, but boxing it would
// change the entry's serialized shape and therefore its hash. The wire format
// is the contract here, so the size difference is deliberate.
#[allow(clippy::large_enum_variant)]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Attestation(Attestation),
    MembershipProof(MembershipProof),
    MembershipRevocation(MembershipRevocation),
    KeyHandoff(KeyHandoff),
    KeyAcceptance(KeyAcceptance),
    CounterAttestation(CounterAttestation),
}

#[hdk_link_types]
// There was an `AgentToAttestation` link here, written on every attestation and
// based at a single `agent:{key}` anchor that grew for the agent's whole life —
// a DHT hotspot by construction. Nothing ever read it: there was no
// agent-to-attestation getter, so every node validated and gossiped it forever
// for no query. Removed 2026-09-01. If agent-scoped lookup is ever wanted, shard
// the anchor (`agent:{key}/{yyyy-mm}`) rather than reinstating one unbounded base.
pub enum LinkTypes {
    SerialToAttestation,
    DocumentToAttestation,
    AgentMembership,
    AgentRevocation,
    MembershipToRevocation,
    AttestationToCounter,
    HandoffToAcceptance,
}

#[hdk_extern]
pub fn genesis_self_check(_data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    match DnaProperties::try_from_dna_properties() {
        Ok(props) => Ok(props.check_installable()),
        Err(e) => Ok(ValidateCallbackResult::Invalid(format!(
            "DNA properties malformed: {e:?}"
        ))),
    }
}

fn immutable() -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(
        "RAF entries are immutable".into(),
    ))
}

/// Capability tokens and private entries are conductor and client machinery,
/// not app data. This DNA never asks for one — but the conductor commits a
/// **capability grant to the agent's own chain** when a client authorises
/// signing credentials, and every other node validates that action as part of
/// that agent's chain. Rejecting them here marks an honest peer's whole chain
/// invalid, which is worse than the forgery it was meant to prevent: it stops
/// gossip dead. (Learned the hard way — CI, 1 Sep 2026.)
///
/// So they are permitted, and the rules that matter are the app-data ones
/// below: entry content, link structure, and immutability.
fn conductor_machinery() -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}

/// Holochain runs this callback once per **op**, and the same data produces
/// several ops validated by *different* authorities. `Op::StoreEntry` reaches
/// the entry authority as [`FlatOp::CreateEntry`]; `Op::StoreRecord` reaches the
/// record authority as [`FlatOp::CreateRecord`]; `Op::RegisterAgentActivity`
/// reaches the chain authority as [`FlatOp::AgentActivity`].
///
/// Rules written for only one of those are enforced by only that authority. So
/// the record authority runs the *same* entry and link rules as the entry
/// authority — anything less and a modified client can publish a record whose
/// content no authority ever checked.
///
/// The match below is deliberately **exhaustive, with no `_` arm**. A catch-all
/// here defaults to accepting whatever a future HDI adds; without one, the
/// compiler makes the next variant a build failure and forces a decision.
#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, LinkTypes>()? {
        // ---- entry authority -------------------------------------------------
        FlatOp::CreateEntry(OpEntry::CreateEntry { app_entry, action }) => {
            validate_create(app_entry, action)
        }
        FlatOp::CreateEntry(OpEntry::UpdateEntry { .. })
        | FlatOp::CreateEntry(OpEntry::UpdateAgent { .. })
        | FlatOp::Update(OpUpdate::Entry { .. })
        | FlatOp::Update(OpUpdate::PrivateEntry { .. })
        | FlatOp::Update(OpUpdate::Agent { .. }) => immutable(),
        FlatOp::CreateEntry(OpEntry::CreateCapGrant { .. })
        | FlatOp::CreateEntry(OpEntry::CreateCapClaim { .. })
        | FlatOp::CreateEntry(OpEntry::UpdateCapGrant { .. })
        | FlatOp::CreateEntry(OpEntry::UpdateCapClaim { .. })
        | FlatOp::Update(OpUpdate::CapGrant { .. })
        | FlatOp::Update(OpUpdate::CapClaim { .. }) => conductor_machinery(),
        // The agent's own key entry, written at genesis by the conductor.
        FlatOp::CreateEntry(OpEntry::CreateAgent { .. }) => Ok(ValidateCallbackResult::Valid),

        FlatOp::Delete(_) => immutable(),
        FlatOp::Link(link) => validate_link(link),

        // ---- record authority: the same rules, or the record is unchecked ----
        FlatOp::CreateRecord(OpRecord::CreateEntry { app_entry, action }) => {
            validate_create(app_entry, action)
        }
        FlatOp::CreateRecord(OpRecord::CreateLink { link_type, action }) => {
            validate_link(OpLink::CreateLink { link_type, action })
        }
        FlatOp::CreateRecord(OpRecord::UpdateEntry { .. })
        | FlatOp::CreateRecord(OpRecord::UpdatePrivateEntry { .. })
        | FlatOp::CreateRecord(OpRecord::UpdateAgent { .. })
        | FlatOp::CreateRecord(OpRecord::DeleteEntry { .. })
        | FlatOp::CreateRecord(OpRecord::DeleteLink { .. }) => immutable(),
        FlatOp::CreateRecord(OpRecord::CreatePrivateEntry { .. }) => {
            conductor_machinery()
        }
        FlatOp::CreateRecord(OpRecord::CreateCapGrant { .. })
        | FlatOp::CreateRecord(OpRecord::CreateCapClaim { .. })
        | FlatOp::CreateRecord(OpRecord::UpdateCapGrant { .. })
        | FlatOp::CreateRecord(OpRecord::UpdateCapClaim { .. }) => {
            conductor_machinery()
        }
        // System actions the conductor writes: genesis, migration, init.
        FlatOp::CreateRecord(OpRecord::CreateAgent { .. })
        | FlatOp::CreateRecord(OpRecord::Dna { .. })
        | FlatOp::CreateRecord(OpRecord::OpenChain { .. })
        | FlatOp::CreateRecord(OpRecord::CloseChain { .. })
        | FlatOp::CreateRecord(OpRecord::AgentValidationPkg { .. })
        | FlatOp::CreateRecord(OpRecord::InitZomesComplete { .. }) => {
            Ok(ValidateCallbackResult::Valid)
        }

        // ---- chain authority -------------------------------------------------
        // Entry *content* is not available here (only the unit type), so this
        // authority checks chain shape: the same immutability rule, and the same
        // refusal of entry kinds this DNA never defines.
        FlatOp::AgentActivity(OpActivity::UpdateEntry { .. })
        | FlatOp::AgentActivity(OpActivity::UpdatePrivateEntry { .. })
        | FlatOp::AgentActivity(OpActivity::UpdateAgent { .. })
        | FlatOp::AgentActivity(OpActivity::DeleteEntry { .. })
        | FlatOp::AgentActivity(OpActivity::DeleteLink { .. }) => immutable(),
        FlatOp::AgentActivity(OpActivity::CreatePrivateEntry { .. }) => {
            conductor_machinery()
        }
        FlatOp::AgentActivity(OpActivity::CreateCapGrant { .. })
        | FlatOp::AgentActivity(OpActivity::CreateCapClaim { .. })
        | FlatOp::AgentActivity(OpActivity::UpdateCapGrant { .. })
        | FlatOp::AgentActivity(OpActivity::UpdateCapClaim { .. }) => {
            conductor_machinery()
        }
        FlatOp::AgentActivity(OpActivity::CreateEntry { .. })
        | FlatOp::AgentActivity(OpActivity::CreateLink { .. })
        | FlatOp::AgentActivity(OpActivity::CreateAgent { .. })
        | FlatOp::AgentActivity(OpActivity::Dna { .. })
        | FlatOp::AgentActivity(OpActivity::OpenChain { .. })
        | FlatOp::AgentActivity(OpActivity::CloseChain { .. })
        | FlatOp::AgentActivity(OpActivity::AgentValidationPkg { .. })
        | FlatOp::AgentActivity(OpActivity::InitZomesComplete { .. }) => {
            Ok(ValidateCallbackResult::Valid)
        }
    }
}
