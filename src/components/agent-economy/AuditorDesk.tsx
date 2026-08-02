import { Link } from "@tanstack/react-router";
import { cn } from "@/components/ui/cn";

export function AuditorDesk({
  data,
  ms,
}: {
  data: Record<string, unknown>;
  ms: number;
}) {
  const summary = (data.summary || {}) as {
    checks?: number;
    passed?: number;
    failed?: number;
    warns?: number;
  };
  const checks = Array.isArray(data.checks)
    ? (data.checks as {
        id: string;
        ok: boolean;
        detail?: string;
        severity?: string;
      }[])
    : [];
  const failures = Array.isArray(data.failures) ? data.failures : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Public market auditor
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Auditor desk</h1>
        <p className="mt-2 text-sm text-muted">{String(data.headline_detail || data.headline)}</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-[10px] uppercase text-subtle">Grade</p>
            <p
              className={cn(
                "font-mono text-5xl font-semibold",
                data.grade === "A" ? "text-ok" : "text-warn",
              )}
            >
              {String(data.grade)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-subtle">Score</p>
            <p className="font-mono text-3xl">{String(data.score)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-subtle">Status</p>
            <p className="font-mono text-xl">{String(data.status)}</p>
          </div>
          <p className="font-mono text-[11px] text-subtle">{ms}ms · {summary.passed}/{summary.checks} passed</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/live"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Live ops
          </Link>
          <Link
            to="/marketplace/ready"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Ready probe
          </Link>
        </div>
      </section>

      {failures.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-danger/40 bg-danger/10 p-4 text-xs">
          <p className="font-semibold text-danger">Failures</p>
          <pre className="mt-2 overflow-auto font-mono text-[10px]">
            {JSON.stringify(failures, null, 2)}
          </pre>
        </section>
      )}

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Checks ({checks.length})</h2>
        <ul className="mt-3 space-y-1">
          {checks.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded bg-elevated px-2 py-1.5 text-xs"
            >
              <span className="font-mono">{c.id}</span>
              <span className={c.ok ? "text-ok" : "text-danger"}>
                {c.ok ? "pass" : "fail"}
              </span>
              <span className="w-full text-muted">{c.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
