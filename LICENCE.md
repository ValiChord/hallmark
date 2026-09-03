# Licence

Copyright © 2026 Ceri John.

**Most of this repository is licensed under the Apache License, Version 2.0.**
The full text is in [`LICENSE-APACHE-2.0.txt`](LICENSE-APACHE-2.0.txt).

Apache 2.0 was chosen deliberately. A specification that nobody is permitted to
implement is not a specification, and this project's whole claim is that the
format and the joining rule are things anyone can build against without asking
permission. Licensing does not transfer ownership: the copyright above remains,
and Apache 2.0 requires attribution and grants a patent licence.

---

## What is covered

| Path | Licence |
|---|---|
| `SPEC.md` | Apache 2.0 |
| `README.md`, `docs/`, `profiles/` | Apache 2.0 |
| `demo/` — the browser demonstration, **excluding** `demo/zomes/` | Apache 2.0 |
| `desktop/` — the Electron application | Apache 2.0 |
| **`demo/zomes/` — the Rust integrity and coordinator zomes** | **Not yet licensed. See below.** |

Anything not listed remains all rights reserved until it is added here.

---

## ⚠️ `demo/zomes/` is deliberately unlicensed for now

The Rust zomes depend on Holochain's `hdk` and `hdi` crates, which are published
under the **Cryptographic Autonomy License 1.0 (CAL-1.0)** — a strong copyleft
licence — and, as far as we can tell, without a Combined Work Exception.

Whether CAL-1.0 reaches a zome that links those crates is a genuine question, not
a formality. Getting it wrong in either direction is worse than waiting:
licensing under Apache 2.0 when CAL-1.0 applies would be a licence violation, and
applying CAL-1.0 unnecessarily would impose obligations on adopters that this
project has no reason to impose.

**The question has been put to Holochain and this section will be updated with
their answer.** Until then, the zome source may be read and run, but is not
offered under any onward licence.

If you want to implement this format, you do not need the zomes. `SPEC.md` is
Apache 2.0 and is written to be implemented independently — the TypeScript engine
in `demo/src/lib/raf/` is one such implementation and is itself Apache 2.0.

---

## Third-party material

The browser demonstration was scaffolded in a Grok workspace and retains some
inherited tooling; earlier contributed drafts are kept in
`docs/superseded-drafts/`. Provenance of that material has not been fully
audited. If you believe something here is yours and is wrongly licensed, please
say so and it will be corrected.

External dependencies keep their own licences, which are unaffected by this file.
