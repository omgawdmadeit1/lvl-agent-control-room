import { Link } from "@tanstack/react-router";

export function TrustLab({
  trust,
  security,
  evalData,
}: {
  trust: {
    count: number;
    ms: number;
    top: {
      id: string;
      name: string;
      composite_score?: number;
      composite_label?: string;
      unproven?: boolean;
    }[];
  };
  security: Record<string, unknown> | null;
  evalData: Record<string, unknown> | null;
}) {
  const ctx = (security?.context || {}) as { clawhavoc?: string; honesty?: string };

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Buyer trust
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Trust · security · eval</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Agents need rank signals before spend. Live scorecards, ClawHavoc-era security heuristics,
          and eval suites — honest about unproven inventory.
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">
          Top trust scores · {trust.count} skills · {trust.ms}ms
        </h2>
        <ul className="mt-3 space-y-2">
          {trust.top.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-xs"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-muted">{s.composite_label}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg">{s.composite_score}</span>
                <Link
                  to="/marketplace/checkout"
                  search={{ skill: s.id }}
                  className="text-accent hover:underline"
                >
                  buy
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Security index</h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">{ctx.clawhavoc}</p>
          <p className="mt-2 text-xs text-muted leading-relaxed">{ctx.honesty}</p>
          <p className="mt-2 font-mono text-[11px] text-subtle">
            engine {String(security?.engine || "—")}
          </p>
        </section>
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Eval suites</h2>
          <p className="mt-2 text-xs text-muted">
            suite_count {String(evalData?.suite_count)} · scored {String(evalData?.scored_count)}
          </p>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
            {JSON.stringify(evalData?.policy || evalData, null, 2).slice(0, 1200)}
          </pre>
        </section>
      </div>
    </div>
  );
}
