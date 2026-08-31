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
pub enum LinkTypes {
    SerialToAttestation,
    DocumentToAttestation,
    AgentToAttestation,
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

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, LinkTypes>()? {
        FlatOp::CreateEntry(OpEntry::CreateEntry { app_entry, action }) => {
            validate_create(app_entry, action)
        }
        FlatOp::CreateEntry(OpEntry::UpdateEntry { .. })
        | FlatOp::Update(OpUpdate::Entry { .. }) => Ok(ValidateCallbackResult::Invalid(
            "RAF entries are immutable".into(),
        )),
        FlatOp::Delete(_) => Ok(ValidateCallbackResult::Invalid(
            "RAF entries are immutable".into(),
        )),
        FlatOp::Link(link) => validate_link(link),
        _ => Ok(ValidateCallbackResult::Valid),
    }
}
