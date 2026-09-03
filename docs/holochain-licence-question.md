# Draft: licence question to Holochain

**Status:** unsent draft. Send from topeuph@gmail.com. Good routes are the
Holochain Discord `#dev` channel, a GitHub Discussion on `holochain/holochain`,
or `devrel@holochain.org`. A public channel is better than email — the answer is
useful to everyone building zomes, and a public answer is one you can cite.

**Why it matters here:** `LICENCE.md` holds `demo/zomes/` back from Apache 2.0
until this is answered. Everything else in the repo is already Apache 2.0.

---

**Subject:** CAL-1.0 on `hdk`/`hdi` — does it reach a zome that links them?

Hello,

I'm building a small open-source project on Holochain 0.7.0 and I want to get
its licensing right rather than guess. I'd be grateful for a steer, and I think
the answer would help other people too.

`hdk` and `hdi` are published under the Cryptographic Autonomy License 1.0. As
far as I can tell there is no Combined Work Exception attached, which is what
`holochain` itself carries.

My question is simply: **does CAL-1.0 extend to a zome that links `hdk`/`hdi`,
or is a zome's own source free to be licensed separately?**

Concretely, I'd like to release my integrity and coordinator zomes under
Apache 2.0. The rest of my project — the specification, a TypeScript
reimplementation of the rules, and an Electron app — is already Apache 2.0 and
does not link either crate.

Three things I could not settle from the repository myself:

1. Whether the absence of a Combined Work Exception on `hdk`/`hdi` is deliberate,
   or an oversight relative to `holochain`.
2. Whether Holochain's own view is that a zome is a "Larger Work" under CAL-1.0
   §1.11, or a separate work that merely links the SDK.
3. Whether CAL-1.0's User Data obligations (§2.3) are intended to bind zome
   authors, given that a Holochain application's data already sits in each
   agent's own source chain — which reads to me as the outcome the licence is
   trying to produce in the first place.

I'd rather ask than self-diagnose and get it wrong in either direction:
licensing under Apache 2.0 when CAL-1.0 applies would be a violation, and
applying CAL-1.0 where it isn't needed would put obligations on adopters for no
reason.

If there's a settled position I've missed in the docs, a pointer is plenty.

Thank you,

Ceri John
ValiChord
