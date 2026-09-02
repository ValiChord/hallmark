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

## This is not the problem the industry is already fixing

Signing a certificate digitally is being solved, properly, by people with more
resources than this project will ever have. In **October 2025** Boeing, Southwest
and Aeroxchange shipped the first electronic 8130-3 using ordinary X.509
certificates. It proves the document has not been altered and that the signer is
who they say they are.

**That is a different question from this one.** It proves *who signed*. It does
not prove *they were still allowed to*.

### Approvals end. Nothing accounts for that.

Three real cases, all a genuine person signing a genuine-looking form:

- **Aviatronics LLC** surrendered FAA repair station certificate ZVNR690L on
  **3 November 2016**. A former employee **kept issuing 8130-3s in its name
  afterwards** — the FAA's words are "intentionally false work orders and
  approvals for return to service".
- **Sauer Flugmotorenbau** had its certificates invalidated by the German LBA
  in 2023.
- **Transonic Aviation Consultants** — the body that had accredited AOG
  Technics — was **removed by the FAA in April 2024**, leaving everything it had
  accredited resting on an approval that no longer existed.

A cryptographic signature catches none of these, because in each case the
signature is real. Only a check against *what was true on the day of signing*
catches them.

### What it costs to not have this

The FAA published the Aviatronics alert on **24 April 2020 — three and a half
years after the certificate was surrendered.** Its recommended action was:

> "Aircraft owners, operators, manufacturers, maintenance organizations, parts
> suppliers, and parts distributors **should inspect their aircraft, aircraft
> records, and parts inventories** for any articles/parts approved for return to
> service by Aviatronics, LLC, after November 3, 2016."

An industry-wide manual records hunt, because there is no way to ask the question
automatically. That is the current answer to "was the signer still entitled?" —
and it arrives years late.

*Source: [FAA SAFO 20010](https://www.faa.gov/sites/faa.gov/files/other_visit/aviation_industry/airline_operators/airline_safety/SAFO20010.pdf),
24 April 2020, read in full.*

### The industry asked for this, and asked for the wrong shape

After the AOG Technics scandal, Airbus, Boeing, GE Aerospace, Safran and the
major US carriers spent nine months and published thirteen unanimous
recommendations. Recommendation #8 says the system should verify

> "...the part number and serial number match authorized data, the issuance date
> is within valid limits, and **the signatory is an authorized individual**."

So the need is named. But the same paragraph specifies the mechanism: *"creating
Application Programming Interfaces (APIs) to facilitate **real-time** data
querying"*.

**A real-time query answers what is true now. It cannot answer what was true
then.**

### The word that never appears

The report is the industry's definitive answer to the biggest documentation
fraud in its history. Searching the whole document, these appear **zero times**:

> `revoked` · `revocation` · `suspended` · `expired` · `lapsed` · `withdrawn`

Not once. Every use of "valid" refers to whether a *document* is authentic or
its fields match — never to whether an approval was live on a given date.

The report even describes the FAA removing Transonic. It records the event and
never names the general problem.

*Source: [Aviation Supply Chain Integrity Coalition, Final Report and
Recommendations, October 2024](https://www.aviationsuppliers.org/asa/files/cclibraryfiles/filename/000000005402/Aviation%20Supply%20Chain%20Integrity%20Coalition%20-%20Report%20-%20FINAL.pdf).
Read in full, 2 September 2026; the null result was checked against control
terms in the same document.*

### The standard says so itself

ATA Spec 2000 Chapter 16 is the industry standard for exchanging these
certificates electronically, accepted by both the FAA and EASA. Two sections of
it, read together, are the clearest statement of this gap anywhere:

- **§2.2 requires** a digital certificate for the individual signing the form, to
  a stated assurance level, naming their organisation. Identity: mandatory.
- **§1.2 excludes** from the specification's scope the internal processes
  companies use to **"authorize users or signers of the data"**. Entitlement:
  out of scope, deliberately — the reasoning being that such processes belong to
  each company.

That reasoning is sound between two firms who already know each other. It leaves
nothing for a stranger checking a chain twenty years later.

*ATA Spec 2000, Chapter 16, Revision 2019.1, §1.2 and §2.2. Read directly from a
licensed copy, 2 September 2026.*

### Said plainly

Everything needed to prove **who signed** exists, works, and is being deployed.
Nothing establishes **whether they were entitled to, at that moment** — or
notices when that entitlement later ends.

That is the whole of what Hallmark does. It is a complement to what Boeing and
Aeroxchange are building, not a competitor to it.

**The honest caveat**, because it should not be discovered later: a gap nobody
names may be a gap nobody will pay to fill. The coalition may have omitted this
deliberately — their goal is stopping bad parts entering the fleet, not
supporting an audit twenty years on. The reason to think otherwise is that
lessors re-verify records at every aircraft transfer and airframes fly for 25 to
40 years, so somebody is asking about the past. That is reasoning, not evidence,
and it is the first thing to test with a practitioner.

The full evidence, with the competitors and the arguments against, is in
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

Forgery is rare — one FAA unapproved-parts notice in sixteen years turns on a
forged document. Far more common is a real, approved person signing a real form
that claims more than they actually looked at. Nothing anywhere records the
difference.

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
