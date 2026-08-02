import { Loader2, Radar } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { cn } from "@/components/ui/cn";

export function LiveScoutPanel() {
  const liveScout = useAgentSystem((s) => s.liveScout);
  const runLiveScout = useAgentSystem((s) => s.runLiveScout);
  const applyScout = useAgentSystem((s) => s.applyScout);

  return (
    <section id="live-scout" className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Live scout — lvlltd.com</h2>
          <p className="mt-1 text-xs text-muted">
            Read-only probes: catalog meta/slim, proof ledger, x402 challenge, listing URL shape,
            status page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={liveScout.status === "running"}
            onClick={() => void runLiveScout()}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg disabled:opacity-50"
          >
            {liveScout.status === "running" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Radar className="size-4" />
            )}
            {liveScout.status === "running" ? "Scouting…" : "Run live scout"}
          </button>
          <button
            type="button"
            disabled={!liveScout.findings.length}
            onClick={() => applyScout()}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium disabled:opacity-50"
          >
            Apply to board
          </button>
        </div>
      </div>

      <p
        className={cn(
          "mb-3 text-sm",
          liveScout.status === "error" ? "text-danger" : "text-muted",
        )}
      >
        {liveScout.summary}
        {liveScout.ranAt && (
          <span className="ml-2 font-mono text-[11px] text-subtle">
            {liveScout.ranAt.slice(0, 19)}
          </span>
        )}
      </p>

      {liveScout.findings.length === 0 ? (
        <p className="text-xs text-subtle">No findings yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {liveScout.findings.map((f) => (
            <li
              key={f.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{f.title}</p>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase",
                    f.ok ? "text-ok" : "text-danger",
                  )}
                >
                  {f.ok ? "ok" : "fail"} · {f.ms}ms
                </span>
              </div>
              <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-muted">
                {f.data !== undefined
                  ? JSON.stringify(f.data, null, 2)
                  : f.detail}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
