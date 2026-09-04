use hdi::hash_path::path::{Component, Path};
use hdi::prelude::*;

use crate::types::{Attestation, DocumentType};

/// Shared path scheme so link validation can recompute the expected base.
///
/// **Paths are built from explicit `Component`s, never from a delimited string.**
///
/// `Path::from(&str)` is not a constructor, it is a parser. Verified against
/// hdi 0.8.0 `hash_path/path.rs`: `DELIMITER` is `"."`, `From<&str>` does
/// `s.split(DELIMITER).filter(|s| !s.is_empty())`, and each surviving piece is
/// then tried as a shard strategy and expanded if it parses.
///
/// Two consequences, both of which applied to the `format!("pn:{p}/sn:{s}")`
/// style this used to use:
///
/// 1. **A `.` in a part number, serial number or document id became path
///    structure.** Aviation identifiers contain dots routinely.
/// 2. **Empty pieces are dropped, so runs of dots collapse.** A serial of `.B`
///    and a serial of `..B` produced the identical component list, which is a
///    genuine collision: two different parts sharing one anchor, with link
///    validation unable to notice because it recomputes the same path from the
///    entry and so agrees with the collision.
///
/// Building from `Component` values passes the bytes through untouched. The
/// prefixes stay as their own components, which is also what makes the sharding
/// idea in `lib.rs` possible: a delimited string produced one flat component per
/// key and could never have sharded at all.
fn path_of(parts: [Vec<u8>; 4]) -> Path {
    Path::from(parts.into_iter().map(Component::from).collect::<Vec<_>>())
}

pub fn serial_path(part_number: &str, serial_number: &str) -> Path {
    path_of([
        b"pn".to_vec(),
        part_number.as_bytes().to_vec(),
        b"sn".to_vec(),
        serial_number.as_bytes().to_vec(),
    ])
}

pub fn document_path(document_type: &DocumentType, document_id: &str) -> Path {
    // `{:?}` on the enum is stable for these unit variants and is what the
    // previous scheme used; keeping it means the component text is unchanged.
    let type_name = format!("{document_type:?}");
    path_of([
        b"doc".to_vec(),
        type_name.as_bytes().to_vec(),
        b"id".to_vec(),
        document_id.as_bytes().to_vec(),
    ])
}

pub fn agent_path(agent: &AgentPubKey) -> Path {
    Path::from(vec![
        Component::from(b"agent".to_vec()),
        Component::from(agent.get_raw_39().to_vec()),
    ])
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

#[cfg(test)]
mod tests {
    use super::*;

    /// The collision the old delimited scheme allowed. `.B` and `..B` split to
    /// the same components once empties are filtered, so two different serials
    /// anchored to one path.
    #[test]
    fn dots_in_a_serial_no_longer_collide() {
        assert_ne!(
            serial_path("CFM56-7B27", ".B"),
            serial_path("CFM56-7B27", "..B"),
        );
    }

    /// A dot is data, not structure. Two components either side of the prefix,
    /// whatever the value contains.
    #[test]
    fn a_dot_does_not_become_a_path_component() {
        let with_dot = serial_path("A.B", "C");
        let components: Vec<Component> = with_dot.into();
        assert_eq!(components.len(), 4);
        assert_eq!(components[1], Component::from(b"A.B".to_vec()));
    }

    /// Distinct inputs stay distinct; identical inputs stay identical.
    #[test]
    fn paths_are_stable_and_distinct() {
        assert_eq!(serial_path("A", "B"), serial_path("A", "B"));
        assert_ne!(serial_path("A", "B"), serial_path("B", "A"));
        assert_ne!(serial_path("A/sn:B", ""), serial_path("A", "B"));
    }
}
