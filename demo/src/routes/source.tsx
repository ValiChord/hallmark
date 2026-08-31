import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import integrityLib from "../../zomes/crates/integrity/src/lib.rs?raw";
import integrityTypes from "../../zomes/crates/integrity/src/types.rs?raw";
import integrityValidate from "../../zomes/crates/integrity/src/validate.rs?raw";
import integrityDna from "../../zomes/crates/integrity/src/dna.rs?raw";
import coordinatorLib from "../../zomes/crates/coordinator/src/lib.rs?raw";
import coordinatorVerify from "../../zomes/crates/coordinator/src/verify.rs?raw";
import zomeReadme from "../../zomes/README.md?raw";

const FILES = [
  { id: "readme", label: "README", src: zomeReadme, lang: "md" },
  { id: "dna", label: "integrity/dna.rs", src: integrityDna, lang: "rust" },
  { id: "types", label: "integrity/types.rs", src: integrityTypes, lang: "rust" },
  { id: "validate", label: "integrity/validate.rs", src: integrityValidate, lang: "rust" },
  { id: "ilib", label: "integrity/lib.rs", src: integrityLib, lang: "rust" },
  { id: "clib", label: "coordinator/lib.rs", src: coordinatorLib, lang: "rust" },
  { id: "verify", label: "coordinator/verify.rs", src: coordinatorVerify, lang: "rust" },
] as const;

export const Route = createFileRoute("/source")({ component: SourcePage });

function SourcePage() {
  const [id, setId] = useState<(typeof FILES)[number]["id"]>("readme");
  const file = FILES.find((f) => f.id === id) ?? FILES[0];

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
              HDK 0.7 / HDI 0.8
            </p>
            <h1 className="text-xl font-medium">Zome source</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Workbench</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] sm:px-6">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {FILES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setId(f.id)}
              className={cn(
                "h-10 shrink-0 rounded-md px-3 text-left text-sm",
                f.id === id ? "bg-surface text-fg" : "text-muted-foreground hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <pre className="overflow-auto rounded-xl bg-surface p-4 font-mono text-[12px] leading-relaxed text-aluminum shadow-[0_0_0_1px_rgba(232,230,225,0.08)]">
          {file.src}
        </pre>
      </div>
    </div>
  );
}
