//! Does *validation* refuse, or only the coordinator guard?
//!
//! `conductor-smoke.mjs` reports "non-root membership issuance rejected". That
//! rejection comes from the coordinator:
//!
//! ```ignore
//! if !props.is_root(&me) { return Err(guest("only a root authority may issue")); }
//! ```
//!
//! A zome call cannot tell that apart from a rejection by `validate_membership`
//! in the integrity zome, because both surface as an error on the call. The
//! difference is the entire claim this project makes about a modified client:
//! a coordinator guard is advice to a well-behaved client, and integrity
//! validation is the rule everyone on the network enforces.
//!
//! Sweettest can tell them apart, two ways:
//!
//!  * `get_invalid_integrated_ops` shows ops the DHT rejected on validation.
//!  * `update_coordinators` hot-swaps the coordinator zome, so the guard can be
//!    removed and the integrity rule tested on its own.
//!
//! This file starts with the first, which needs no second wasm build.

use holochain::sweettest::*;
use holochain::prelude::*;
use std::path::PathBuf;

fn happ_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("aviation_provenance.happ")
}

/// DNA properties, matching what the Node tests install with. `genesis_self_check`
/// refuses an empty `initial_members`, so these cannot be defaulted.
fn properties(root: &AgentPubKey) -> SerializedBytes {
    let json = serde_json::json!({
        "initial_members": [root.to_string()],
        "max_delegation_depth": 2,
        "max_membership_ttl_micros": 31_536_000_000_000u64,
        "airworthiness_vocabulary": ["NEW", "PROTOTYPE", "USED"],
        "return_to_service_vocabulary": ["OVERHAULED", "REPAIRED", "INSPECTED", "TESTED", "MODIFIED"],
    });
    SerializedBytes::try_from(json).expect("properties serialise")
}

#[tokio::test(flavor = "multi_thread")]
async fn a_non_root_issuance_is_refused_and_nothing_invalid_is_integrated() {
    let mut conductor = SweetConductor::create_with_defaults(
        SweetConductorConfig::standard(),
        None,
        None::<DynSweetRendezvous>,
    )
    .await;

    let root = SweetAgents::one(conductor.keystore()).await;
    let bundle = happ_path();
    assert!(
        bundle.exists(),
        "pack the hApp first: cd demo/zomes && hc dna pack . && hc app pack ."
    );

    let dna = SweetDnaFile::from_bundle_with_overrides(
        &bundle,
        DnaModifiersOpt::default().with_properties(properties(&root)),
    )
    .await
    .expect("DNA loads with overridden properties");

    let app = conductor
        .setup_app_for_agent("hallmark", root.clone(), [&dna])
        .await
        .expect("app installs — if this fails on initial_members, the override did not apply");

    let cell = app.cells()[0].clone();

    // The guard path: a root issuing to itself is refused for self-issuance, so
    // this asserts the call fails without asserting *where* it failed.
    let issue: Result<Record, _> = conductor
        .call_fallible(
            &cell.zome("aviation_attestation_coordinator"),
            "issue_membership",
            self_issued_proof(&root),
        )
        .await;
    assert!(issue.is_err(), "self-issuance must be refused");

    // The claim that matters: nothing invalid reached the DHT. If a refusal had
    // come only from the coordinator, this would also be empty — so on its own
    // it proves the negative, not the positive. It is the regression guard for
    // the case where a future change lets a bad op through while the call still
    // appears to fail.
    let invalid = conductor
        .get_invalid_integrated_ops(&cell.dna_hash())
        .await
        .expect("can read invalid ops");
    assert!(
        invalid.is_empty(),
        "invalid ops were integrated: {invalid:?}"
    );
}

/// A membership an agent tries to issue to itself, which `validate_membership`
/// refuses regardless of what any coordinator does.
fn self_issued_proof(agent: &AgentPubKey) -> ExternIO {
    let payload = serde_json::json!({
        "agent_pubkey": agent,
        "role": "Mro",
        "organisation": "Self Issued Ltd",
        "organisation_id": "XX.000",
        "accreditation": {
            "accreditation_type": "EasaPart145",
            "cert_number": "XX.000",
            "issuing_authority": "Nobody",
        },
        "expires_at": 4_102_444_800_000_000i64,
        "issuer_agent": agent,
        "issuer_membership_hash": null,
        "predecessor_membership_hash": null,
        "rotation_handoff_hash": null,
        "rotation_acceptance_hash": null,
        "depth": 1,
    });
    ExternIO::encode(payload).expect("payload encodes")
}
