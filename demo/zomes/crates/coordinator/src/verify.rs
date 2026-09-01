use hdk::prelude::*;
use aviation_attestation_integrity::*;

fn guest(msg: impl Into<String>) -> WasmError {
    wasm_error!(WasmErrorInner::Guest(msg.into()))
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VerificationReport {
    pub attestation_hash: ActionHash,
    /// Holochain already checked the author's signature to store the record.
    /// This is a statement about the conductor, not a check this zome performed
    /// — hence the name. It is a constant.
    pub signature_checked_by_sys: bool,
    /// The key that signed this record is the attester the record names. This
    /// one *is* checked here.
    pub author_matches_attester: bool,
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
    /// The membership was superseded by a key rotation, not withdrawn. Reported
    /// so a reader can see it happened; it does not affect either answer.
    Rotated { at: Timestamp },
    /// Revocation state could not be established — a link resolved but its
    /// record did not, or the chain could not be walked. `currently_trusted` is
    /// false whenever this is set.
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

/// Revocations linked to one membership, and whether anything could not be
/// resolved.
///
/// The `incomplete` flag is the point. A node that has gossiped the *link* but
/// not yet the revocation *record* previously got an empty vector back, which
/// the caller read as "no revocations" and reported `Clean` /
/// `currently_trusted: true`. That is fail-open, in the one lookup the whole
/// trust decision rests on, in a module whose own header promises fail-closed.
/// A missing record and an undeserializable one now both raise the flag.
struct RevocationLookup {
    revocations: Vec<(Timestamp, MembershipRevocation)>,
    incomplete: bool,
}

fn revocations_of(membership_hash: &ActionHash) -> RevocationLookup {
    let mut revocations = Vec::new();
    let mut incomplete = false;

    match links_to(membership_hash.clone(), LinkTypes::MembershipToRevocation) {
        Err(_) => incomplete = true,
        Ok(hashes) => {
            for hash in hashes {
                match get(hash, GetOptions::default()) {
                    Err(_) | Ok(None) => incomplete = true,
                    Ok(Some(record)) => {
                        match record.entry().to_app_option::<MembershipRevocation>() {
                            Ok(Some(rev)) => revocations.push((record.action().timestamp(), rev)),
                            _ => incomplete = true,
                        }
                    }
                }
            }
        }
    }

    RevocationLookup {
        revocations,
        incomplete,
    }
}

/// Collect the membership ActionHashes from `start` up to (and including) the
/// terminal root-issued proof. Fail-closed on missing records, cycles, or
/// non-root terminals. Order is leaf-first.
///
/// This re-checks the per-hop invariants that integrity validation enforces
/// rather than assuming they ran. Reading a record over `get` carries no
/// guarantee that entry-level validation was applied by the node that served
/// it, so a walk that only follows `issuer_membership_hash` upward — which is
/// all this used to do — inherits nothing. Every check below is cheap: the
/// records are already in hand, so it costs no extra round trip.
fn membership_chain_hashes(
    start: ActionHash,
    max_depth: u8,
    roots: &[AgentPubKey],
) -> ExternResult<Result<Vec<ActionHash>, String>> {
    let mut chain = Vec::new();
    let mut current = start;
    let mut seen = std::collections::HashSet::new();
    // The proof one level down, whose `issuer_agent` this hop must match.
    let mut child: Option<MembershipProof> = None;

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

        // The publisher must be the issuer it claims to be. Holochain
        // sys-validates the signature against the action author, so this
        // comparison is what binds the claim to a key.
        if record.action().author() != &proof.issuer_agent {
            return Ok(Err("membership was not published by its declared issuer".into()));
        }
        if proof.issuer_agent == proof.agent_pubkey {
            return Ok(Err("self-issued membership in chain".into()));
        }
        // This hop must actually be the issuer of the hop below it.
        if let Some(ref c) = child {
            if proof.agent_pubkey != c.issuer_agent {
                return Ok(Err("chain link does not match the issuer it claims".into()));
            }
        }

        chain.push(current.clone());
        match proof.issuer_membership_hash.clone() {
            None => {
                if !roots.iter().any(|r| r == &proof.issuer_agent) {
                    return Ok(Err("terminal issuer is not a DNA root".into()));
                }
                if proof.depth != 1 {
                    return Ok(Err("root-issued membership does not have depth 1".into()));
                }
                return Ok(Ok(chain));
            }
            Some(next) => {
                child = Some(proof);
                current = next;
            }
        }
    }
    Ok(Err("chain exceeded max depth without a root".into()))
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

    // The single most important check in the format, and it was missing here:
    // does the key that signed this record match the attester the record names?
    // Integrity enforces it, but a report built from `get`-fetched records
    // inherits no guarantee that integrity ran on the serving node.
    let author_matches_attester = record.action().author() == &attestation.attester.agent_pubkey;

    let mut historically_valid = binding_well_formed && author_matches_attester;
    let mut currently_trusted = binding_well_formed && author_matches_attester;

    // Walked once, used twice: the membership check needs the verdict and the
    // revocation sweep needs the hashes. This used to be two identical walks,
    // the first of which threw its result away — D+1 wasted round trips, about
    // a third of a clean verify.
    let chain_result = membership_chain_hashes(
        attestation.membership_proof_hash.clone(),
        props.max_delegation_depth,
        &roots,
    )?;

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
                    match &chain_result {
                        Err(reason) => {
                            historically_valid = false;
                            currently_trusted = false;
                            MembershipCheck::ChainBroken {
                                reason: reason.clone(),
                            }
                        }
                        Ok(_) => MembershipCheck::Active {
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
    match &chain_result {
        Err(_) => {
            // Chain already examined above; a revocation verdict cannot be
            // established over a chain we could not walk.
            currently_trusted = false;
            revocation = RevocationCheck::Unknown;
        }
        Ok(chain) => {
            let mut all_revs: Vec<(Timestamp, MembershipRevocation)> = Vec::new();
            let mut incomplete = false;
            for m_hash in chain {
                let found = revocations_of(m_hash);
                incomplete |= found.incomplete;
                all_revs.extend(found.revocations);
            }

            // Deterministic order: earliest first.
            all_revs.sort_by_key(|(at, _)| *at);
            for (at, rev) in all_revs {
                // A key rotation is hygiene, not misconduct. `complete_key_rotation`
                // files one against the old proof every time, so treating it as
                // trust-ending meant an OEM rotating its key permanently untrusted
                // every shop beneath it and every 8130-3 they had ever signed.
                if matches!(rev.grounds, RevocationGrounds::KeyRotated) {
                    if matches!(revocation, RevocationCheck::Clean) {
                        revocation = RevocationCheck::Rotated { at };
                    }
                    continue;
                }
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

            // Fail closed whenever anything went unresolved — even if other
            // revocations were found. The one we could not read is exactly the
            // one that might have mattered.
            if incomplete {
                currently_trusted = false;
                if matches!(revocation, RevocationCheck::Clean | RevocationCheck::Rotated { .. }) {
                    revocation = RevocationCheck::Unknown;
                }
            }
        }
    }

    // Scope (observed + not_observed). Integrity already rejects unknown IDs;
    // we still surface them here so the report is complete. The vocabulary is
    // the one for this record's certification path — a term that is valid on the
    // other path is not valid here.
    let path_vocabulary = match attestation.binding.certification_path {
        CertificationPath::AirworthinessApproval => &props.airworthiness_vocabulary,
        CertificationPath::ReturnToService => &props.return_to_service_vocabulary,
    };
    let mut scope = Vec::new();
    for assertion in &attestation.scope.observed {
        let in_vocabulary = path_vocabulary.contains(&assertion.assertion_id);
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
        let in_vocabulary = path_vocabulary.contains(id);
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
        author_matches_attester,
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
