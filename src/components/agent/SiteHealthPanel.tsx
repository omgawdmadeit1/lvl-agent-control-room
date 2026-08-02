import { useMemo } from "react";
import { Activity, ShieldAlert } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { scoreSiteHealth } from "@/lib/agent-system/site-health";
import { cn } from "@/components/ui/cn";

export function SiteHealthPanel() {
  const findings = useAgentSystem((s) => s.liveScout.findings);
  const summary = useAgentSystem((s) => s.liveScout.summary);
  const status = useAgentSystem((s) => s.liveScout.status);
  const runLiveScout = useAgentSystem((s) => s.runLiveScout);
  const applyScout = useAgentSystem((s) => s.applyScout);
  const audit = useAgentSystem((s) => s.audit);

  const health = useMemo(
    () => (findings.length ? scoreSiteHealth(findings) : null),
    [findings],
  );

  return (
    <section
      id="site-health"
      className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-elevated">
            <Activity className="size-4 text-muted" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">lvlltd.com site health feast</h2>
            <p className="mt-1 max-w-2xl text-xs text-muted leading-relaxed">
              Swarm score from live probes — catalog, proof, x402, listing URLs, robots/sitemap.
              Drive focus-four P0 from evidence, not vibes.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runLiveScout()}
            disabled={status === "running"}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg disabled:opacity-50"
          >
            {status === "running" ? "Scouting…" : "Swarm re-probe"}
          </button>
          <button
            type="button"
            disabled={!findings.length}
            onClick={() => applyScout()}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium disabled:opacity-50"
          >
            Apply to board
          </button>
        </div>
      </div>

      {!health ? (
        <p className="text-sm text-muted">
          Run a live scout to score the site. {summary}
        </p>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
              <p className="text-[10px] uppercase tracking-wide text-subtle">Score</p>
              <p className="mt-1 font-mono text-3xl font-semibold tabular">{health.score}</p>
              <p className="text-xs text-muted">Grade {health.grade}</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
              <p className="text-[10px] uppercase tracking-wide text-subtle">Go / no-go</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold uppercase",
                  health.goNoGo === "go" && "text-ok",
                  health.goNoGo === "caution" && "text-warn",
                  health.goNoGo === "no-go" && "text-danger",
                )}
              >
                {health.goNoGo}
              </p>
              <p className="text-xs text-muted">Auditor: {audit.goNoGo}</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
              <p className="text-[10px] uppercase tracking-wide text-subtle flex items-center gap-1">
                <ShieldAlert className="size-3.5" /> Top actions
              </p>
              <ul className="mt-2 space-y-1">
                {health.topActions.map((a) => (
                  <li key={a} className="text-xs text-muted leading-snug">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {health.checks.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "rounded-[var(--radius-md)] border border-border bg-elevated p-3",
                  !c.pass && "border-danger/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.id}</p>
                  <span className={cn("font-mono text-[10px] uppercase", c.pass ? "text-ok" : "text-danger")}>
                    {c.pass ? "pass" : "fail"} · w{c.weight}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{c.note}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
