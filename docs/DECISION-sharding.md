# Decision: do not shard yet, and do not fork Holochain to do it

**Date:** 1 September 2026
**Status:** decided, with revisit triggers below
**Question:** Holochain's dynamic sharding is off by default and not expected
until ~0.9. Should Hallmark ship sharding sooner — in particular by using the
[polite-shrink](https://github.com/ValiChord/polite-shrink) controller developed
in this org?

---

## Decision

**No. Run full arc, and revisit when a trigger below fires.**

Two supporting conclusions:

- The polite-shrink mechanism **cannot** be lifted into Hallmark's application
  code. It is not a matter of effort.
- Application-level sharding by DNA **is** available today if it is ever needed,
  and does not require a fork.

---

## Why polite-shrink cannot come up into the app

Polite-shrink is a control loop **inside kitsune2**: announce an intent to
vacate a sector, wait out gossip staleness, re-check with a deterministic
tie-break, then drop. Every input it needs — this node's storage arc, what peers
declare they are holding, the ability to change an arc — lives in the conductor.

A zome cannot set its own arc, cannot read peers' coverage, and cannot announce
an intent to vacate. There is no application-layer surface for any of it. That
is precisely what [kitsune2 issue #160](https://github.com/holochain/kitsune2/issues/160)
is about: the safe-sizing controller has not been built, and arcs stay clamped.

So "use polite-shrink in Hallmark" means exactly one thing: **ship a modified
conductor.** Nothing less will do it.

### Why we are not doing that

Shipping a forked conductor is technically within reach — Kangaroo already takes
`--holochain-path`, so pointing the desktop app at a custom binary is a config
change rather than a code change, and the polite-shrink repo already has
kitsune2-fork runs.

It is still the wrong call:

1. **It is a Holochain fork to maintain, indefinitely, by one person.** Every
   upstream release becomes a merge.
2. **Wire compatibility with stock full-arc peers is unverified.** Arc size is
   in principle a local policy decision, but sharding sits behind a kitsune2
   feature flag and we have not tested a shrunk-arc node against a stock one.
   Until that is established the whole approach is speculative.
3. **Every node would need our binary.** That reintroduces exactly the "somebody
   operates this" dependency the project exists to remove — while claiming not
   to have one.
4. **It undercuts the more valuable play.** Polite-shrink is already in front of
   the Holochain dev team. If it lands upstream, Hallmark gets sharding for free
   with no divergent stack. Running a private fork while arguing for the upstream
   version is arguing for something we have already routed around.

---

## Why it is not needed yet

Measured in the 1 September audit: **~1,320 bytes per attestation record**.

| Scenario | Records/year | DHT growth/year |
|---|---|---|
| One busy repair station (200 forms/day) | 73,000 | ~95 MB |
| Ten organisations | 730,000 | ~1 GB |
| One hundred organisations | 7.3 M | ~9.5 GB |

Full arc means every node stores all of it. At the beachhead — a handful of
organisations proving the format — that is unremarkable for a desktop and
survivable for a phone for a long time. It becomes untenable somewhere past a
hundred active organisations, which is also roughly the point at which adoption
would justify waiting for, or contributing to, the upstream fix.

Note this is a *storage* concern only. The audit established that **validation
cost is O(1) in history length** — the system does not get slower as the network
ages, which is the failure mode that actually kills Holochain projects.

---

## The option that stays open

If storage bites before upstream sharding lands, **split across multiple DNAs**.
Each DNA is a separate DHT with its own hash; a node installs only the ones it
needs. Static partitioning rather than dynamic arc sizing, but the same outcome:
nobody stores everything. No fork.

A plausible shape for Hallmark:

- **Accreditations stay in one shared DNA.** Small, and every verifier needs the
  whole membership graph to walk a chain to a root.
- **Attestations shard.** They are looked up by part, so the key could be a
  serial-number prefix, a year, or the issuing organisation.

The costs are real and should not be discovered late: cross-shard queries get
hard, and the shard key has to be chosen before the access patterns are known
from real use. Do not pick one speculatively.

---

## Revisit when any of these is true

- Holochain ships dynamic sharding (watch kitsune2 #160). **Then take it
  upstream — no fork, no decision needed.**
- A single deployment passes **~5 GB** of DHT, or any phone participant cannot
  hold a full arc.
- Mobile becomes a primary participant rather than a demonstration. Phones
  default to zero arc for battery and app-store reasons, which changes who
  stores what — see `desktop/README.md`.
- A pilot needs data segregation for commercial or regulatory reasons, in which
  case separate DNAs are the answer for confidentiality rather than for scale,
  and the sharding question is moot.

---

## Related, and nearer term

Sharding at the **link** layer is a live concern regardless of what the DHT
does. The audit found `AgentToAttestation` writing to a single anchor per agent
that grew for that agent's lifetime — a hotspot by construction — and it has
been removed. The same note applies to any future part or document enumeration:
shard the anchor (`agent:{key}/{yyyy-mm}`) from the start rather than adding one
unbounded base. See `docs/AUDIT-2026-09-01.md`, findings E1 and M5.
