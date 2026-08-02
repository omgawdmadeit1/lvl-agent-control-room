import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { TOKEN_BUCKET_EXAMPLES } from "@/lib/agent-system/token-bucket-examples";
import { TOKEN_BUCKET_NOTES } from "@/lib/agent-system/token-bucket";
import { cn } from "@/components/ui/cn";

export function TokenBucketExplorer() {
  const buckets = useAgentSystem((s) => s.tokenBuckets);
  const [active, setActive] = useState(TOKEN_BUCKET_EXAMPLES[0].id);
  const [copied, setCopied] = useState(false);
  const example =
    TOKEN_BUCKET_EXAMPLES.find((e) => e.id === active) ?? TOKEN_BUCKET_EXAMPLES[0];

  async function copy() {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Token bucket algorithms</h2>
        <p className="mt-1 max-w-3xl text-xs text-muted leading-relaxed">
          Rate limit with burst: capacity <span className="text-fg font-mono">C</span>, refill{" "}
          <span className="text-fg font-mono">R</span> tokens/tick. Sustained rate ≤ R; short bursts ≤ C.
          Live buckets sit under the admit gate with global + role bulkheads.
        </p>
      </div>

      {/* Live meters */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map((b) => {
          const pct = Math.round((b.tokens / Math.max(1, b.capacity)) * 100);
          return (
            <div key={b.name} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold capitalize">{b.name}</p>
                <p className="font-mono text-[11px] text-subtle">R={b.refillRate}/tick</p>
              </div>
              <p className="mt-2 font-mono text-xl font-semibold tabular">
                {b.tokens}
                <span className="text-sm text-muted">/{b.capacity}</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    pct < 20 ? "bg-danger" : pct < 50 ? "bg-warn" : "bg-accent",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted">
                in {b.admitted} · out {b.rejected} · spent {b.totalConsumed}
              </p>
              <p className="mt-1 truncate font-mono text-[10px] text-subtle">{b.lastDecision}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison notes */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {(
          [
            ["vs fixed window", TOKEN_BUCKET_NOTES.vsFixedWindow],
            ["vs leaky bucket", TOKEN_BUCKET_NOTES.vsLeakyBucket],
            ["vs semaphore", TOKEN_BUCKET_NOTES.vsSemaphore],
            ["agent use", TOKEN_BUCKET_NOTES.agentUse],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
            <p className="text-xs font-medium text-fg">{k}</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{v}</p>
          </div>
        ))}
      </div>

      {/* Code examples */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-fg">Code examples</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
        >
          {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
        {TOKEN_BUCKET_EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(e.id)}
            className={cn(
              "hit-area-chip shrink-0 rounded-full border px-3 text-xs font-medium",
              active === e.id
                ? "border-accent bg-accent text-accent-fg"
                : "border-border text-muted hover:text-fg",
            )}
          >
            {e.title}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{example.summary}</p>
      <div className="mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg">
        <div className="border-b border-border px-3 py-2 font-mono text-[11px] text-subtle">
          token-bucket/{example.id}.ts
        </div>
        <pre className="max-h-[min(24rem,50vh)] overflow-auto p-4 text-[11px] leading-relaxed sm:text-xs">
          <code className="font-mono whitespace-pre">{example.code}</code>
        </pre>
      </div>
    </section>
  );
}
