/**
 * Shown on every page. The demo circulates on its own — on a phone, as a link —
 * so the notice and the contact have to travel with it rather than living in a
 * repository nobody outside can open.
 */
export function RafFooter() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
        <p>
          <span className="text-fg">Release Attestation Format</span> — a working demonstration.
          Company names, part numbers and certificates shown here are invented.
        </p>
        <p>
          Copyright © 2026 Ceri John. All rights reserved. No permission is granted for
          reproduction, distribution, modification or commercial use, in whole or in part, without
          explicit written consent.
        </p>
        <p>
          <a
            href="mailto:Topeuph@gmail.com?subject=Release%20Attestation%20Format"
            className="text-fg underline underline-offset-4 hover:text-primary"
          >
            Contact the author for more detail
          </a>
        </p>
      </div>
    </footer>
  );
}
