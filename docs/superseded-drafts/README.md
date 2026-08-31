# Superseded drafts

**Historical. Do not build on these.** Kept because they are the lineage of the working code and
because the reviews in [`../CODE-REVIEW-ARCHIVE.md`](../CODE-REVIEW-ARCHIVE.md) refer to them.

The working implementation is in [`../../demo/`](../../demo/).

| File | What it was | Why it is here and not in use |
|---|---|---|
| `kimi-zome-v3.rs` | Third iteration of the Holochain zome | Superseded by `demo/zomes/`, which compiles, installs and passes an end-to-end conductor test. v3 never compiled |
| `kimi-architecture-v2.md` | Architecture write-up for that zome | Its validation/verification split was the right idea and survives; the specifics do not match the shipped code |
| `kimi-constraint-mapping.md` | Constraint mapping against SPEC and README | Marked several constraints "solved" that were not |
| `deepseek-html-demo.html` | An early standalone HTML demo | Superseded by the RAF Workbench in `demo/` |

Two ideas from these drafts survive into the current design and are worth crediting: the
**delegation chain** with depth limits and expiry inheritance, and the separation of
**historically valid** from **currently trusted**.
