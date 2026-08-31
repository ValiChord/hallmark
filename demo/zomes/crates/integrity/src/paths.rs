use hdi::hash_path::path::Path;
use hdi::prelude::*;

use crate::types::{Attestation, DocumentType};

/// Shared path scheme so link validation can recompute the expected base.
pub fn serial_path(part_number: &str, serial_number: &str) -> Path {
    Path::from(format!("pn:{part_number}/sn:{serial_number}"))
}

pub fn document_path(document_type: &DocumentType, document_id: &str) -> Path {
    Path::from(format!("doc:{document_type:?}/id:{document_id}"))
}

pub fn agent_path(agent: &AgentPubKey) -> Path {
    Path::from(format!("agent:{agent}"))
}

pub fn serial_path_hash(part_number: &str, serial_number: &str) -> ExternResult<EntryHash> {
    serial_path(part_number, serial_number).path_entry_hash()
}

pub fn document_path_hash(
    document_type: &DocumentType,
    document_id: &str,
) -> ExternResult<EntryHash> {
    document_path(document_type, document_id).path_entry_hash()
}

pub fn agent_path_hash(agent: &AgentPubKey) -> ExternResult<EntryHash> {
    agent_path(agent).path_entry_hash()
}

pub fn expected_serial_base(attestation: &Attestation) -> ExternResult<AnyLinkableHash> {
    Ok(serial_path_hash(
        &attestation.subject.part_number,
        &attestation.subject.serial_number,
    )?
    .into())
}

pub fn expected_document_base(attestation: &Attestation) -> ExternResult<AnyLinkableHash> {
    Ok(document_path_hash(
        &attestation.binding.document_type,
        &attestation.binding.document_id,
    )?
    .into())
}

pub fn expected_agent_base(agent: &AgentPubKey) -> ExternResult<AnyLinkableHash> {
    Ok(agent_path_hash(agent)?.into())
}
