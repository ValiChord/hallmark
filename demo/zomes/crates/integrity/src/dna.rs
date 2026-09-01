use hdi::prelude::*;

/// Consensus parameters. Fixed at DNA install; changing them forks the network.
///
/// `initial_members` uses `AgentPubKeyB64` so DNA YAML can list `uhCAk...` strings.
#[dna_properties]
// `#[dna_properties]` already derives Serialize, Deserialize, Debug and the
// SerializedBytes conversions; re-deriving them collides.
#[derive(Clone)]
pub struct DnaProperties {
    pub initial_members: Vec<AgentPubKeyB64>,
    /// Block 11 terms for the **blocks 13a-13e** path. FAA Order 8130.21J
    /// para 11.k: "Enter one of the terms below" - a closed, mandatory list.
    pub airworthiness_vocabulary: Vec<String>,
    /// Block 11 terms for the **blocks 14a-14e** path. AC 43-9D Table B-1.
    /// Phrased with "should", so enumerated but advisory in the source; this
    /// DNA enforces it as a list because a shared vocabulary is the point of
    /// having a format at all.
    pub return_to_service_vocabulary: Vec<String>,
    pub max_delegation_depth: u8,
    /// Inclusive upper bound on `expires_at - issued_at` for a membership.
    /// Short TTLs are how this DNA approximates revocation for *future* creates:
    /// integrity validation cannot prove the absence of a revocation entry
    /// (no `get_links` in HDI). See crate-level docs.
    pub max_membership_ttl_micros: i64,
}

impl DnaProperties {
    pub fn load() -> ExternResult<Self> {
        Self::try_from_dna_properties().map_err(|e| {
            wasm_error!(WasmErrorInner::Guest(format!(
                "DNA properties malformed: {e:?}"
            )))
        })
    }

    pub fn root_keys(&self) -> Vec<AgentPubKey> {
        self.initial_members.iter().cloned().map(Into::into).collect()
    }

    /// Compares without materialising the whole root list. `root_keys()` clones
    /// and converts every entry, and this runs several times per validation.
    pub fn is_root(&self, agent: &AgentPubKey) -> bool {
        let target = AgentPubKeyB64::from(agent.clone());
        self.initial_members.iter().any(|k| k == &target)
    }

    pub fn check_installable(&self) -> ValidateCallbackResult {
        if self.initial_members.is_empty() {
            return ValidateCallbackResult::Invalid(
                "initial_members cannot be empty".into(),
            );
        }
        if self.max_delegation_depth < 1 {
            return ValidateCallbackResult::Invalid(
                "max_delegation_depth must be >= 1".into(),
            );
        }
        if self.max_membership_ttl_micros <= 0 {
            return ValidateCallbackResult::Invalid(
                "max_membership_ttl_micros must be > 0".into(),
            );
        }
        if self.airworthiness_vocabulary.is_empty() {
            return ValidateCallbackResult::Invalid(
                "airworthiness_vocabulary cannot be empty".into(),
            );
        }
        if self.return_to_service_vocabulary.is_empty() {
            return ValidateCallbackResult::Invalid(
                "return_to_service_vocabulary cannot be empty".into(),
            );
        }
        ValidateCallbackResult::Valid
    }
}
