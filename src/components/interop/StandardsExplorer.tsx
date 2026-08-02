import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
// settlement lab cross-link
import {
  INTEROP_STACK,
  INTEROP_STANDARDS,
  LVL_COMPLIANCE,
  type InteropStandard,
} from "@/lib/interop/standards";
import { cn } from "@/components/ui/cn";

const LAYERS = [
  { id: "all", label: "All" },
  { id: "tools", label: "Tools" },
  { id: "agents", label: "Agents" },
  { id: "payments", label: "Payments" },
  { id: "identity", label: "Identity" },
  { id: "transport", label: "Transport" },
  { id: "commerce", label: "Commerce" },
] as const;

const SUPPORT: Record<string, string> = {
  live: "bg-ok/15 text-ok border-ok/30",
  partial: "bg-warn/15 text-warn border-warn/30",
  planned: "bg-muted/20 text-muted border-border",
  "n/a": "bg-elevated text-subtle border-border",
  gap: "bg-danger/10 text-danger border-danger/30",
};

export function StandardsExplorer() {
  const [layer, setLayer] = useState<string>("all");
  const [activeId, setActiveId] = useState("a2a");

  const list = useMemo(
    () =>
      layer === "all"
        ? INTEROP_STANDARDS
        : INTEROP_STANDARDS.filter((s) => s.layer === layer),
    [layer],
  );

  const active: InteropStandard =
    list.find((s) => s.id === activeId) || list[0] || INTEROP_STANDARDS[0];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Interoperability investigation
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Agent interoperability standards</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted leading-relaxed">
          The 2025–2026 agent stack is not one protocol — it is a layered system.{" "}
          <strong className="text-fg">MCP</strong> connects agents to tools;{" "}
          <strong className="text-fg">A2A</strong> connects agents to agents;{" "}
          <strong className="text-fg">x402 / AP2</strong> move money; REST remains the substrate.
          LVL LTD implements the commerce + catalog spine live and is partially aligned on A2A/AP2.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/skills/$packId"
            params={{ packId: "agent-to-agent-a2a-protocols" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            A2A Workbench
          </Link>
          <Link
            to="/marketplace/x402"
            search={{ skill: "agent-orchestration" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Live x402
          </Link>
          <a
            href="https://lvlltd.com/api/x402"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            /api/x402 ↗
          </a>
          <Link
            to="/lab/settlement"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Settlement intel (Agorá/XRPL)
          </Link>
        </div>
      </section>

      {/* Stack */}
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Composition stack (one agent purchase)</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTEROP_STACK.map((step) => (
            <li
              key={step.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
            >
              <p className="text-xs font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-muted">{step.question}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {step.standards.map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => {
                      setLayer("all");
                      setActiveId(sid);
                    }}
                    className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] uppercase hover:border-accent"
                  >
                    {sid}
                  </button>
                ))}
              </div>
              <p className="mt-2 font-mono text-[10px] text-subtle">{step.lvlExample}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Browser */}
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[var(--radius-xl)] border border-border bg-surface p-3">
          <div className="flex flex-wrap gap-1">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayer(l.id)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-2.5 text-[10px] font-medium",
                  layer === l.id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-elevated text-muted",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-1">
            {list.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius-md)] px-2 py-2 text-left text-xs",
                    active.id === s.id ? "bg-accent/15 text-fg" : "hover:bg-elevated text-muted",
                  )}
                >
                  <span className="font-medium">{s.short}</span>
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[9px] uppercase",
                      SUPPORT[s.lvl.support],
                    )}
                  >
                    {s.lvl.support}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase text-subtle">
                {active.layer} · {active.status} · {active.steward}
              </p>
              <h2 className="text-xl font-semibold">
                {active.name}{" "}
                <span className="text-muted">({active.short})</span>
              </h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">{active.oneLiner}</p>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                SUPPORT[active.lvl.support],
              )}
            >
              LVL: {active.lvl.support}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-[10px] uppercase text-subtle">Solves</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">{active.solves}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-[10px] uppercase text-subtle">Does not solve</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">{active.doesNot}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase text-subtle">Key artifacts</p>
            <ul className="mt-1 flex flex-wrap gap-1">
              {active.keyArtifacts.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-border bg-elevated px-2 py-0.5 font-mono text-[10px]"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase text-subtle">Transports</p>
            <p className="mt-1 text-xs text-muted">{active.transports.join(" · ")}</p>
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] border border-accent/30 bg-accent/5 p-3">
            <p className="text-[10px] uppercase text-accent">LVL implementation</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{active.lvl.notes}</p>
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-fg">
              {active.lvl.surfaces.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>

          {active.refs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {active.refs.map((r) => (
                <a
                  key={r.href}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
                >
                  {r.label} ↗
                </a>
              ))}
            </div>
          )}

          {active.complements.length > 0 && (
            <p className="mt-4 text-xs text-muted">
              Complements:{" "}
              {active.complements.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="mr-1 font-mono text-accent hover:underline"
                  onClick={() => setActiveId(c)}
                >
                  {c}
                </button>
              ))}
            </p>
          )}
        </article>
      </div>

      {/* LVL matrix */}
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">LVL LTD compliance matrix</h2>
        <p className="mt-1 text-xs text-muted">
          Where the marketplace + Control Room sit relative to the standard stack.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase text-subtle">
                <th className="py-2 pr-3 font-medium">Capability</th>
                <th className="py-2 pr-3 font-medium">Standard</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {LVL_COMPLIANCE.map((row) => (
                <tr key={row.capability} className="border-b border-border/60">
                  <td className="py-2.5 pr-3 font-medium">{row.capability}</td>
                  <td className="py-2.5 pr-3 font-mono text-muted">{row.standard}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                        SUPPORT[row.lvlStatus],
                      )}
                    >
                      {row.lvlStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted">{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
        <h2 className="text-sm font-semibold">Key takeaways</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
          <li>
            <strong className="text-fg">MCP ≠ A2A</strong> — MCP is agent→tool; A2A is agent→agent.
            Production systems need both.
          </li>
          <li>
            <strong className="text-fg">x402 is LVL's economic core</strong> — live HTTP 402 on
            Base USDC with discovery at{" "}
            <code className="text-fg">/api/x402</code>.
          </li>
          <li>
            <strong className="text-fg">AP2 complements x402</strong> — mandates/allowances for
            delegated spend; LVL challenge extras already point at these hooks.
          </li>
          <li>
            <strong className="text-fg">Biggest gap: MCP server export</strong> — expose catalog,
            pay, proof as MCP tools so external agents plug in without custom clients.
          </li>
          <li>
            <strong className="text-fg">A2A next step</strong> — host Signed Agent Cards at a stable
            URL and stream task updates (SSE) from the Control Room.
          </li>
        </ul>
      </section>
    </div>
  );
}
