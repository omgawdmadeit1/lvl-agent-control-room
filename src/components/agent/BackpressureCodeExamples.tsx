import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BACKPRESSURE_EXAMPLES } from "@/lib/agent-system/backpressure-examples";
import { cn } from "@/components/ui/cn";

export function BackpressureCodeExamples() {
  const [active, setActive] = useState(BACKPRESSURE_EXAMPLES[0].id);
  const [copied, setCopied] = useState(false);
  const example =
    BACKPRESSURE_EXAMPLES.find((e) => e.id === active) ?? BACKPRESSURE_EXAMPLES[0];

  async function copy() {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Backpressure code examples</h2>
          <p className="mt-1 max-w-2xl text-xs text-muted">
            Patterns from the live engine — config, admit gate, budgets, circuit breaker, swarm fan-out,
            and a portable worker loop.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
        >
          {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy example"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {BACKPRESSURE_EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(e.id)}
            className={cn(
              "hit-area-chip shrink-0 rounded-full border px-3 text-xs font-medium transition",
              active === e.id
                ? "border-accent bg-accent text-accent-fg"
                : "border-border text-muted hover:text-fg",
            )}
          >
            {e.title}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-muted">{example.summary}</p>

      <div className="mt-3 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[11px] text-subtle">{example.language}</span>
          <span className="font-mono text-[11px] text-subtle">{example.id}.ts</span>
        </div>
        <pre className="max-h-[min(28rem,55vh)] overflow-auto p-4 text-[11px] leading-relaxed text-fg/90 sm:text-xs">
          <code className="font-mono whitespace-pre">{example.code}</code>
        </pre>
      </div>
    </section>
  );
}
