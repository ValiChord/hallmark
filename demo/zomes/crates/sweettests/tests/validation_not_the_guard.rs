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
//! This file does the first, which needs no second wasm build.

use holochain::prelude::*;
use holochain::sweettest::*;
use std::path::PathBuf;

fn happ_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("aviation_provenance.happ")
}

/// DNA properties, matching what the Node tests install with.
/// `genesis_self_check` refuses an empty `initial_members`, so these cannot be
/// defaulted away.
///
/// `with_properties` takes `YamlProperties`, which wraps a `yaml_serde::Value`.
/// Not `SerializedBytes` — that was the first guess and it does not implement
/// `TryFrom<serde_json::Value>`.
fn properties(root: &AgentPubKey) -> YamlProperties {
    let yaml = format!(
        concat!(
            "initial_members: [\"{}\"]\n",
            "max_delegation_depth: 2\n",
            "max_membership_ttl_micros: 31536000000000\n",
            "airworthiness_vocabulary: [NEW, PROTOTYPE, USED]\n",
            "return_to_service_vocabulary: [OVERHAULED, REPAIRED, INSPECTED, TESTED, MODIFIED]\n",
        ),
        root
    );
    YamlProperties::new(yaml_serde::from_str(&yaml).expect("properties are valid YAML"))
}

#[tokio::test(flavor = "multi_thread")]
async fn nothing_invalid_is_integrated_when_a_bad_membership_is_refused() {
    // The rendezvous argument is not optional with a standard config, despite
    // its type. SweetConductorConfig::standard() names a bootstrap service, and
    // passing None panics with "Must use rendezvous SweetConductor if
    // rendezvous: is specified in config.network.bootstrap_service".
    let mut conductor = SweetConductor::create_with_defaults(
        SweetConductorConfig::standard(),
        None,
        Some(SweetLocalRendezvous::new().await),
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
        .expect("app installs — a failure here means the properties override did not apply");

    let cell = app.cells()[0].clone();

    // Self-issuance. `validate_membership` refuses it regardless of any
    // coordinator, so the call must fail.
    let issued: Result<Record, _> = conductor
        .call_fallible(
            &cell.zome("aviation_attestation_coordinator"),
            "issue_membership",
            self_issued_proof(&root),
        )
        .await;
    assert!(issued.is_err(), "self-issuance must be refused");

    // The claim worth pinning: nothing invalid reached the DHT.
    //
    // Read this honestly. On its own it does not prove validation did the
    // refusing — a coordinator guard would leave this empty too. It is the
    // regression guard for the case where a future change lets a bad op through
    // while the call still appears to fail. Proving the positive needs
    // `update_coordinators` and a guard-stripped coordinator wasm; see README.
    let invalid = conductor
        .get_invalid_integrated_ops(cell.dna_hash())
        .await
        .expect("can read invalid ops");
    assert!(
        invalid.is_empty(),
        "invalid ops were integrated: {invalid:?}"
    );
}

/// A membership an agent tries to issue to itself.
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
