use hdk::prelude::*;
use aviation_attestation_integrity::*;

fn guest(msg: impl Into<String>) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(msg.into()))
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VerificationReport {
    pub attestation_hash: ActionHash,
    /// Holochain already checked the author's signature to store the record.
    pub signature_checked_by_sys: bool,
    pub binding_well_formed: bool,
    pub membership: MembershipCheck,
    pub predecessor: PredecessorCheck,
    pub revocation: RevocationCheck,
    pub scope: Vec<ScopeCheck>,
    pub counters: Vec<CounterAttestation>,
    /// Counters never flip this report. They are a social overlay.
    pub counters_are_informational: bool,
    /// Structural + membership live at action time + no revocation dated
    /// *before* the attestation.
    pub historically_valid: bool,
    /// historically_valid, and the attester's membership has not since been
    /// revoked. Use this for *new* operational reliance.
    pub currently_trusted: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum MembershipCheck {
    Active { depth: u8, expires_at: Timestamp },
    Expired { expires_at: Timestamp },
    InvalidProof { reason: String },
    NotFound,
    ChainBroken { reason: String },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum PredecessorCheck {
    None,
    Ok,
    Missing,
    DifferentPart,
    NotEarlier,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum RevocationCheck {
    Clean,
    RevokedBeforeAssertion { at: Timestamp, grounds: RevocationGrounds },
    RevokedAfterAssertion { at: Timestamp, grounds: RevocationGrounds },
    Unknown,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScopeCheck {
    pub assertion_id: String,
    pub in_vocabulary: bool,
}

fn links_to(
    base: impl Into<AnyLinkableHash>,
    link_type: LinkTypes,
) -> ExternResult<Vec<ActionHash>> {
    let links = get_links(LinkQuery::try_new(base, link_type)?, GetStrategy::default())?;
    Ok(links
        .into_iter()
        .filter_map(|l| l.target.into_action_hash())
        .collect())
}

fn revocations_of(membership_hash: &ActionHash) -> ExternResult<Vec<(Timestamp, MembershipRevocation)>> {
    let mut out = Vec::new();
    for hash in links_to(membership_hash.clone(), LinkTypes::MembershipToRevocation)? {
        if let Some(record) = get(hash, GetOptions::default())? {
            if let Ok(Some(rev)) = record.entry().to_app_option::<MembershipRevocation>() {
                out.push((record.action().timestamp(), rev));
            }
        }
    }
    Ok(out)
}

/// Collect the membership ActionHashes from `start` up to (and including) the
/// terminal root-issued proof. Fail-closed on missing records, cycles, or
/// non-root terminals. Order is leaf-first.
fn membership_chain_hashes(
    start: ActionHash,
    max_depth: u8,
    roots: &[AgentPubKey],
) -> ExternResult<Result<Vec<ActionHash>, String>> {
    let mut chain = Vec::new();
    let mut current = start;
    let mut seen = std::collections::HashSet::new();
    for _ in 0..=max_depth {
        if !seen.insert(current.clone()) {
            return Ok(Err("cycle in membership chain".into()));
        }
        let Some(record) = get(current.clone(), GetOptions::default())? else {
            return Ok(Err("membership record missing".into()));
        };
        let Ok(Some(proof)) = record.entry().to_app_option::<MembershipProof>() else {
            return Ok(Err("not a membership proof".into()));
        };
        chain.push(current.clone());
        match proof.issuer_membership_hash {
            None => {
                if !roots.iter().any(|r| r == &proof.issuer_agent) {
                    return Ok(Err("terminal issuer is not a DNA root".into()));
                }
                return Ok(Ok(chain));
            }
            Some(next) => current = next,
        }
    }
    Ok(Err("chain exceeded max depth without a root".into()))
}

/// Walk issuer hashes. Missing record → Broken (fail-closed). Cycle or
/// non-root terminal → Broken. Does not use get_links.
fn chain_status(
    start: ActionHash,
    max_depth: u8,
    roots: &[AgentPubKey],
) -> ExternResult<Result<(), String>> {
    match membership_chain_hashes(start, max_depth, roots)? {
        Ok(_) => Ok(Ok(())),
        Err(reason) => Ok(Err(reason)),
    }
}

#[hdk_extern]
pub fn verify_attestation(attestation_hash: ActionHash) -> ExternResult<VerificationReport> {
    let props = DnaProperties::load()?;
    let roots = props.root_keys();
    let record = get(attestation_hash.clone(), GetOptions::default())?
        .ok_or_else(|| guest("attestation not found"))?;
    let attestation: Attestation = record
        .entry()
        .to_app_option()
        .map_err(|e| guest(e.to_string()))?
        .ok_or_else(|| guest("record is not an attestation"))?;
    let action_time = record.action().timestamp();

    let binding_well_formed = {
        let binds_ok = matches!(
            attestation.binding.binds_field.as_str(),
            BINDS_SERIAL | BINDS_PART | BINDS_BOTH
        );
        let digest_ok = attestation.binding.document_digest.trim().len() >= 16;
        let id_ok = !attestation.binding.document_id.trim().is_empty();
        binds_ok && digest_ok && id_ok
    };

    let mut historically_valid = binding_well_formed;
    let mut currently_trusted = binding_well_formed;

    // Membership
    let membership = match get(
        attestation.membership_proof_hash.clone(),
        GetOptions::default(),
    )? {
        None => {
            historically_valid = false;
            currently_trusted = false;
            MembershipCheck::NotFound
        }
        Some(m_rec) => match m_rec.entry().to_app_option::<MembershipProof>() {
            Ok(Some(proof)) => {
                let issued = m_rec.action().timestamp();
                if action_time < issued {
                    historically_valid = false;
                    currently_trusted = false;
                    MembershipCheck::InvalidProof {
                        reason: "membership issued after attestation".into(),
                    }
                } else if action_time > proof.expires_at {
                    historically_valid = false;
                    currently_trusted = false;
                    MembershipCheck::Expired {
                        expires_at: proof.expires_at,
                    }
                } else if proof.agent_pubkey != attestation.attester.agent_pubkey
                    || proof.role != attestation.attester.role
                    || proof.organisation != attestation.attester.organisation
                    || proof.organisation_id != attestation.attester.organisation_id
                {
                    historically_valid = false;
                    currently_trusted = false;
                    MembershipCheck::InvalidProof {
                        reason: "attester does not match membership".into(),
                    }
                } else {
                    match chain_status(
                        attestation.membership_proof_hash.clone(),
                        props.max_delegation_depth,
                        &roots,
                    )? {
                        Err(reason) => {
                            historically_valid = false;
                            currently_trusted = false;
                            MembershipCheck::ChainBroken { reason }
                        }
                        Ok(()) => MembershipCheck::Active {
                            depth: proof.depth,
                            expires_at: proof.expires_at,
                        },
                    }
                }
            }
            _ => {
                historically_valid = false;
                currently_trusted = false;
                MembershipCheck::InvalidProof {
                    reason: "could not deserialize membership".into(),
                }
            }
        },
    };

    // Predecessor
    let predecessor = if let Some(pred_hash) = &attestation.binding.predecessor_document_hash {
        match get(pred_hash.clone(), GetOptions::default())? {
            None => {
                historically_valid = false;
                currently_trusted = false;
                PredecessorCheck::Missing
            }
            Some(pred_record) => match pred_record.entry().to_app_option::<Attestation>() {
                Ok(Some(pred)) => {
                    if pred.subject.serial_number != attestation.subject.serial_number
                        || pred.subject.part_number != attestation.subject.part_number
                    {
                        historically_valid = false;
                        currently_trusted = false;
                        PredecessorCheck::DifferentPart
                    } else if pred_record.action().timestamp() >= action_time {
                        historically_valid = false;
                        currently_trusted = false;
                        PredecessorCheck::NotEarlier
                    } else {
                        PredecessorCheck::Ok
                    }
                }
                _ => {
                    historically_valid = false;
                    currently_trusted = false;
                    PredecessorCheck::Missing
                }
            },
        }
    } else {
        PredecessorCheck::None
    };

    // Revocations of this membership *and* every ancestor in the delegation
    // chain. get_links order is not chronological, so we sort by action
    // timestamp before classifying. Prefer any revocation dated before the
    // attestation (historically invalid) over later ones.
    let mut revocation = RevocationCheck::Clean;
    match membership_chain_hashes(
        attestation.membership_proof_hash.clone(),
        props.max_delegation_depth,
        &roots,
    ) {
        Err(_) | Ok(Err(_)) => {
            // Chain already examined above; treat revocation lookup failure
            // the same as unknown.
            currently_trusted = false;
            if matches!(revocation, RevocationCheck::Clean) {
                revocation = RevocationCheck::Unknown;
            }
        }
        Ok(Ok(chain)) => {
            let mut all_revs: Vec<(Timestamp, MembershipRevocation)> = Vec::new();
            let mut lookup_failed = false;
            for m_hash in &chain {
                match revocations_of(m_hash) {
                    Err(_) => lookup_failed = true,
                    Ok(revs) => all_revs.extend(revs),
                }
            }
            if lookup_failed && all_revs.is_empty() {
                currently_trusted = false;
                revocation = RevocationCheck::Unknown;
            } else {
                // Deterministic order: earliest first.
                all_revs.sort_by_key(|(at, _)| *at);
                for (at, rev) in all_revs {
                    if at < action_time {
                        historically_valid = false;
                        currently_trusted = false;
                        revocation = RevocationCheck::RevokedBeforeAssertion {
                            at,
                            grounds: rev.grounds,
                        };
                        // Earliest before is the strongest signal; stop.
                        break;
                    } else {
                        currently_trusted = false;
                        // Keep the latest after-assertion revocation for the report.
                        revocation = RevocationCheck::RevokedAfterAssertion {
                            at,
                            grounds: rev.grounds,
                        };
                    }
                }
            }
        }
    }

    // Scope (observed + not_observed). Integrity already rejects unknown IDs;
    // we still surface them here so the report is complete.
    let mut scope = Vec::new();
    for assertion in &attestation.scope.observed {
        let in_vocabulary = props.assertion_vocabulary.contains(&assertion.assertion_id);
        if !in_vocabulary {
            historically_valid = false;
            currently_trusted = false;
        }
        scope.push(ScopeCheck {
            assertion_id: assertion.assertion_id.clone(),
            in_vocabulary,
        });
    }
    for id in &attestation.scope.not_observed {
        let in_vocabulary = props.assertion_vocabulary.contains(id);
        if !in_vocabulary {
            historically_valid = false;
            currently_trusted = false;
        }
        scope.push(ScopeCheck {
            assertion_id: id.clone(),
            in_vocabulary,
        });
    }

    // Counters — informational only
    let mut counters = Vec::new();
    if let Ok(hashes) = links_to(attestation_hash.clone(), LinkTypes::AttestationToCounter) {
        for hash in hashes {
            if let Some(rec) = get(hash, GetOptions::default())? {
                if let Ok(Some(c)) = rec.entry().to_app_option::<CounterAttestation>() {
                    counters.push(c);
                }
            }
        }
    }

    Ok(VerificationReport {
        attestation_hash,
        signature_checked_by_sys: true,
        binding_well_formed,
        membership,
        predecessor,
        revocation,
        scope,
        counters,
        counters_are_informational: true,
        historically_valid,
        currently_trusted,
    })
}
