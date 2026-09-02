# Hallmark

[![CI](https://github.com/ValiChord/hallmark/actions/workflows/ci.yml/badge.svg)](https://github.com/ValiChord/hallmark/actions/workflows/ci.yml)

**When a repair shop signs off an aircraft part, how does a stranger check —
years later — that the shop was allowed to sign?**

Hallmark is a small signed record that answers that. It sits alongside the
release certificate and says who signed, what they were approved to do, and
exactly what they checked.

It is a format and a set of rules. There is no platform, no company in the
middle, and no server that has to stay running for a record to stay checkable.

---

## Try it now

**[Open the demo →](https://raf-workbench.onrender.com)** Nothing to install.
Press **Load sample**, then open the **Walkthrough** tab.

Five steps, about three minutes: a part is made, a repair shop works on it, a
buyer relies on that, the shop loses its approval, and a stranger checks the
paperwork years later.

---

## The problem

A repair shop overhauls a part in 2026 and signs an FAA Form 8130-3 for it.

In 2028 the shop loses its approval.

Now you are holding that part. One question, and most systems get it wrong:

> Is the 2026 paperwork worthless?

**No.** The shop was genuinely approved in 2026. That document is real and
always will be. What you should *not* do is accept a **new** certificate from
that shop today.

Most systems collapse this into a single word — valid, or not valid. Then
either history gets erased, or a shop that lost its approval keeps trading on
old credentials.

## This gap is not hypothetical

In 2023 a UK distributor, AOG Technics, was found to have sold thousands of jet
engine parts with falsified airworthiness paperwork.

Airbus, Boeing, GE Aerospace, Safran, Delta, United, American and others formed
a coalition in response. After a nine-month review they published thirteen
recommendations.

**Three of them ask for shared infrastructure. All three are assigned to
nobody.**

| | What they asked for | When | Who owns it |
|---|---|---|---|
| **#4** | **"Establish Database of Accredited Vendors to Verify Identities and Quality Standards"** | Long term | **nobody named** |
| #8 | Software to check certificate fields against manufacturer and airline databases | Medium term | "potentially a third party" |
| #9 | "Establish Voluntary Industry Database of Back-to-Birth Parts Documentation" | Long term | **nobody named** |

*Source: the coalition's own [vendor accreditation](https://aviationsupplychainintegrity.com/recommended-actions/vendor-accreditation/)
and [document traceability](https://aviationsupplychainintegrity.com/recommended-actions/documents-traceability-verification/)
pages, read 2 September 2026.*

**Recommendation #4 is the one this project answers.** A shared list of who is
accredited, so anyone can check an identity — that is a trust list, in their own
words, asked for by the industry and held by no one.

### Two things they did not ask for

Across all thirteen, in both categories:

- **Nothing says who is entitled to sign a release certificate.**
- **Nothing says how an accredited vendor is removed** — no grounds, no
  authority, no process.

The second is the harder one, and its absence is telling. A list you can never
be taken off is not a trust list; it is a directory.

### Why a list on its own would not fix this

A database of accredited vendors tells you who is approved **today**. Ask it the
question that actually matters — *was this shop approved on the day they signed
this certificate, three years ago?* — and it has no answer.

That is the same collapse this whole project is about. A current-status lookup
has one answer where the situation has two.

And a database of stored certificates has the mirror problem: if you cannot
establish that each signer held approval when they signed, you have built a very
tidy filing cabinet full of unchecked claims.

### So Hallmark is not a database, and does not need one

It is the layer underneath: the rule for deciding whose signature counted, and
when. It is built to sit under a database rather than compete with one — records
carry fingerprints and pointers, not documents, so a shared archive can hold the
paperwork while Hallmark answers whether it was properly signed.

The difference is which way the dependency runs. **Hallmark works when no
database exists. A database does not work without something like Hallmark.**

Governments agree the problem is real, without solving it. The US *Aviation
Supply Chain Safety and Security Digitization Act* passed the House in March
2026 — but it builds nothing. It orders a study into why the industry has not
digitised.

The full evidence, with citations you can check, is in
**[docs/WHY.md](docs/WHY.md)**.

## What Hallmark does

**Idea one: two answers, never one.**

Every check returns both:

| | Question it answers |
|---|---|
| `historically_valid` | Was this real and properly authorised when it was signed? |
| `currently_trusted` | Should I rely on this shop for something new, today? |

In the story above: **historically valid, yes. Currently trusted, no.**

**Idea two: say what you did *not* check.**

Real failures in this industry are rarely forged signatures. They are honest
people signing something broader than what they actually looked at.

So a Hallmark record has a second list. The signer writes down what they did
not observe.

```
observed:      INSPECTED
not_observed:  OVERHAULED, MODIFIED
```

A later reader cannot treat silence as a claim. If it does not say
"overhauled", nobody overhauled it, and the record says so out loud.

## What a record looks like

```json
{
  "subject":  { "part_number": "CFM56-7B27", "serial_number": "577737" },
  "binding":  { "document_type": "EasaForm1", "document_id": "AFX-2026-0142",
                "certification_path": "ReturnToService" },
  "scope":    { "observed": ["INSPECTED"], "not_observed": ["OVERHAULED"] },
  "attester": { "organisation": "AeroFix MRO Ltd", "role": "Mro" },
  "membership_proof_hash": "…the approval being relied on"
}
```

It does not carry the certificate or the shop's paperwork. It carries
fingerprints of them. That is what lets someone check it in 2046 without anyone
still running a document store.

The full format is in **[SPEC.md](SPEC.md)**.

---

## Run it yourself

**In a browser**, no conductor, no network:

```bash
cd demo && npm install && npm run dev
```

**As a real peer-to-peer node**, with your own key and real gossip between
machines:

[Download the desktop installer →](https://github.com/ValiChord/hallmark/releases/tag/desktop-v0.1.0)

It is not code-signed, so Windows will warn you. Click **More info**, then **Run
anyway**. Setup and the two-device walkthrough are in
**[desktop/README.md](desktop/README.md)**.

---

## What is in here

| Path | What it is |
|---|---|
| `SPEC.md` | The format, written so someone else could implement it |
| `demo/` | The browser demo. The rules in TypeScript, no network |
| `demo/zomes/` | The real implementation. Rust, on Holochain 0.7.0 |
| `desktop/` | Electron app. Real conductor, real gossip, installable |
| `profiles/` | How the format binds to a specific document type |
| `docs/WHY.md` | Why this problem, why now, and what would kill it |
| `docs/TECHNICAL-REFERENCE.md` | What the code enforces, and where |
| `docs/HANDOVER.md` | For an engineer picking this up |
| `LICENCE.md` | All rights reserved (see *Open questions*) |

Three folders are historical and will mislead you about the current state.
Do not start there: `docs/RESEARCH-ARCHIVE.md`, `docs/CODE-REVIEW-ARCHIVE.md`,
`docs/superseded-drafts/`.

---

## What actually works

Checked automatically on every push, against real Holochain binaries:

- The browser demo runs the rules end to end.
- The Rust implementation compiles, installs into a conductor, and passes a full
  test: approval granted, a non-approved issuer refused, a record signed, a
  third party verifying it, and a revocation.
- **Two independent nodes on one DHT.** An approval gossips from one node to the
  other. A record is signed on the second node and verified on the first,
  without the two signers ever contacting each other. A revocation on one node
  flips the other node's answer to `currently_trusted: false` while
  `historically_valid` stays true.
- The TypeScript demo is pinned to the same verdicts the Rust zome produces, so
  the two cannot drift apart silently.

### What does not work yet

- **Never run across two separate machines.** The two-node test runs two
  conductors on one computer. Separate physical hosts, network splits and
  hostile peers are all untested.
- **No Android app.** Blocked on an unreleased Holochain library.
- **Counter-attestation is browser-demo only.** The desktop app covers identity,
  accredit, attest, verify and revoke.
- **No legal timestamp yet.** The format specifies one; nothing issues or checks
  it. Until it does, a signer can back-date a record.
- **Nothing checks a document against its fingerprint.** The fingerprint is
  checked for shape only.

`docs/TECHNICAL-REFERENCE.md` §8 lists every known limit, including several that
are deliberately unfixed.

## What this deliberately does not do

- **It cannot make a claim true.** A real person can sign a real record with a
  real key and still be wrong. A record is not an inspection.
- **It cannot fix old paperwork.** It helps parts entering service from now on.
  Existing gaps stay gaps.
- **It cannot decide who the root authorities are.** Someone has to say whose
  keys count. That is a governance question, and no software answers it.

## Open questions

- **The licence.** All rights reserved today. A specification needs a licence
  that lets other people implement it. This has to be settled before anything is
  published outside the org.
- **Who holds the root keys.** The code proves roots can be set per deployment.
  It cannot tell you whose keys belong there.

---

**Why aviation, why now, and the three things that would kill this project:**
**[docs/WHY.md](docs/WHY.md)**.
