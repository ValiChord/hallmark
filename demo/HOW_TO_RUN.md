# How to run the RAF Workbench demo

This is a complete copy of the app with the review improvements already applied.

## What you need once

1. Install **Node.js** (version 20 or newer is fine).
   - Windows / Mac: download from https://nodejs.org and run the installer.
   - You only need to do this once on your computer.

2. Unzip this folder somewhere easy to find (for example your Desktop).

## Every time you want to run the demo

1. Open a terminal / command prompt.
2. Go into the unzipped folder. Examples:
   - Mac / Linux: `cd Desktop/raf_runnable` (adjust the path to match where you put it)
   - Windows: `cd Desktop\raf_runnable`
3. Install the dependencies (only needed the first time, or after updates):
   ```
   npm install
   ```
4. Start the demo:
   ```
   npm run dev
   ```
5. When it says something like “Local: http://localhost:8080”, open that address in your browser.

You should see the RAF Workbench with tabs: Issue, Attest, Revoke, Verify, and Ledger.

## What the demo does

- Act as different organisations (FAA, Boeing, a repair shop, …)
- Issue memberships
- Create repair / attestation records
- Revoke someone
- Click Verify to see whether a document is still trusted

No Holochain conductor is required — the browser simulation runs everything locally.

## Troubleshooting

- “npm is not recognized” → Node.js is not installed or not on your PATH. Re-install from nodejs.org and open a *new* terminal.
- Port already in use → close other apps using port 8080, or stop a previous demo that is still running.
- Blank page → wait a few seconds for the first build; check the terminal for red error messages.
