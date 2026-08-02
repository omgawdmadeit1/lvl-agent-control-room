import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { AgentEconomySnapshot } from "@/lib/agent-economy/loaders";
import { X_AGENT_ECONOMY_INSIGHTS } from "@/lib/agent-economy/x-signals";
import { cn } from "@/components/ui/cn";

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AgentEconomyCockpit({ data }: { data: AgentEconomySnapshot }) {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(15);
  const [cart, setCart] = useState<string[]>([]);
  const [tab, setTab] = useState<"card" | "mcp" | "cart" | "seq" | "domains">("card");

  const card = data.agentCard;
  const skills = Array.isArray(card?.skills)
    ? (card!.skills as { id: string; name: string; description?: string; tags?: string[] }[])
    : [];
  const security = (card?.securitySchemes || {}) as Record<string, { description?: string; name?: string }>;

  const cartItems = useMemo(() => {
    return data.budgetSkills.filter((s) => cart.includes(s.id));
  }, [cart, data.budgetSkills]);
  const cartTotal = Math.round(cartItems.reduce((a, s) => a + s.price_usd, 0) * 100) / 100;

  function toggleCart(id: string) {
    setCart((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const mcpExport = {
    protocol: "mcp",
    server: "lvl-ltd-skill-market",
    tools: data.mcpTools,
    generatedAt: data.loadedAt,
    source: "https://lvlltd.com/.well-known/agent-card.json",
  };

  const okSurfaces = data.surfaces.filter((s) => s.ok).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          X discourse → LVL domains
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Agent Economy Cockpit</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted leading-relaxed">
          Live read of lvlltd.com agent surfaces: Agent Card, shop budget ladder, demand signals,
          x402 discovery, proof ledger — plus MCP tool export so external agents can plug in without
          a human UI. Informed by current X signal: micropay hops, A2A discover / x402 settle split,
          and machine-first contracts.
        </p>
        <p className="mt-2 font-mono text-[11px] text-subtle">
          loader {data.durationMs}ms · domains {okSurfaces}/{data.surfaces.length} ok · card HTTP{" "}
          {data.agentCardStatus}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["card", "Agent Card"],
              ["mcp", "MCP tools"],
              ["cart", "Budget cart"],
              ["seq", "Buy sequence"],
              ["domains", "Domain map"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-11 items-center rounded-[var(--radius-md)] border px-3 text-xs font-medium",
                tab === id
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-elevated text-muted",
              )}
            >
              {label}
            </button>
          ))}
          <Link
            to="/marketplace/x402"
            search={{ skill: data.featuredStart?.id || "agent-x402-first-buy" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            x402 live
          </Link>
        </div>
      </section>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Catalog skills",
            value: String((card as { catalogSkillCount?: number })?.catalogSkillCount ?? "236"),
          },
          {
            label: "A2A card skills",
            value: String(skills.length),
          },
          {
            label: "Budget matches",
            value: String(data.budgetSkills.length),
          },
          {
            label: "Domain surfaces OK",
            value: `${okSurfaces}/${data.surfaces.length}`,
          },
        ].map((k) => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[10px] uppercase text-subtle">{k.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* X insights */}
      <Panel title="X.com signals → product requirements">
        <ul className="grid gap-2 lg:grid-cols-2">
          {X_AGENT_ECONOMY_INSIGHTS.map((x) => (
            <li
              key={x.id}
              className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{x.theme}</p>
                <span className="font-mono text-[10px] text-accent">{x.priority}</span>
              </div>
              <p className="mt-1 text-muted leading-relaxed">{x.signal}</p>
              <p className="mt-2 text-fg">
                <strong>LVL:</strong> {x.lvlAction}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      {tab === "card" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Live Agent Card (/.well-known/agent-card.json)">
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Name</dt>
                <dd className="font-medium">{String(card?.name || "—")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Protocol</dt>
                <dd className="font-mono">{String(card?.protocolVersion || "—")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">URL</dt>
                <dd className="max-w-[60%] truncate font-mono text-[11px]">
                  {String(card?.url || "—")}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Transport</dt>
                <dd className="font-mono">{String(card?.preferredTransport || "—")}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              {String(card?.description || "").slice(0, 320)}
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] uppercase text-subtle">Security schemes</p>
              {Object.entries(security).map(([k, v]) => (
                <div key={k} className="rounded bg-elevated px-2 py-1.5 font-mono text-[11px]">
                  <span className="text-accent">{k}</span>
                  {v.name ? ` · header ${v.name}` : ""}
                  <p className="mt-0.5 text-muted normal-case">{v.description}</p>
                </div>
              ))}
            </div>
            <a
              href="https://lvlltd.com/.well-known/agent-card.json"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-11 items-center text-xs text-accent hover:underline"
            >
              Open raw card ↗
            </a>
          </Panel>
          <Panel title="A2A skill surfaces on the card">
            <ul className="max-h-96 space-y-2 overflow-auto">
              {skills.map((s) => (
                <li key={s.id} className="rounded-[var(--radius-md)] border border-border bg-elevated p-2.5 text-xs">
                  <p className="font-mono text-[10px] text-subtle">{s.id}</p>
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 text-muted leading-relaxed">{s.description}</p>
                  {s.tags && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-subtle">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "mcp" && (
        <Panel title="MCP tools/list export (for external agents)">
          <p className="text-xs text-muted mb-3">
            X signal: operators index x402 endpoints into MCP-aware routers. Copy this manifest into
            an MCP server or agent harness.
          </p>
          <pre className="max-h-[28rem] overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
            {JSON.stringify(mcpExport, null, 2)}
          </pre>
          <button
            type="button"
            className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
            onClick={() => void navigator.clipboard?.writeText(JSON.stringify(mcpExport, null, 2))}
          >
            Copy MCP tools JSON
          </button>
        </Panel>
      )}

      {tab === "cart" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <Panel title={`Budget ladder (shop?budget_usd=${budget})`}>
            <div className="mb-3 flex flex-wrap items-end gap-2">
              <label className="text-xs">
                <span className="text-muted">Budget USDC</span>
                <input
                  type="number"
                  min={0.05}
                  max={500}
                  step={1}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="mt-1 block h-11 w-28 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
                />
              </label>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
                onClick={() =>
                  void navigate({
                    to: "/marketplace/agent-economy",
                    search: { budget },
                    replace: true,
                  })
                }
              >
                Reload shop
              </button>
              {data.featuredStart && (
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-accent/40 bg-accent/10 px-3 text-xs text-accent"
                  onClick={() => toggleCart(data.featuredStart!.id)}
                >
                  + first buy {data.featuredStart.id} (${data.featuredStart.price_usd})
                </button>
              )}
            </div>
            {data.bundles.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase text-subtle">Bundles under budget</p>
                <ul className="mt-1 space-y-1">
                  {data.bundles.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-[var(--radius-md)] border border-border bg-elevated p-2 text-xs"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{b.name}</span>
                        <span className="font-mono">${b.price_usd}</span>
                      </div>
                      <p className="text-muted">{b.blurb}</p>
                      {b.savings_usd != null && (
                        <p className="text-ok">Save ${b.savings_usd}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="max-h-96 space-y-1 overflow-auto">
              {data.budgetSkills.slice(0, 40).map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-2 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="font-mono text-[10px] text-subtle">
                      {s.id} · {s.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">${s.price_usd}</span>
                    <button
                      type="button"
                      onClick={() => toggleCart(s.id)}
                      className={cn(
                        "inline-flex h-11 min-w-[4.5rem] items-center justify-center rounded-[var(--radius-md)] border px-2 text-[11px] font-semibold",
                        cart.includes(s.id)
                          ? "border-accent bg-accent text-accent-fg"
                          : "border-border",
                      )}
                    >
                      {cart.includes(s.id) ? "In cart" : "Add"}
                    </button>
                    <Link
                      to="/marketplace/x402"
                      search={{ skill: s.id }}
                      className="text-accent hover:underline"
                    >
                      402
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Agent cart">
            <p className="font-mono text-2xl font-semibold">${cartTotal}</p>
            <p className="text-xs text-muted">
              {cartItems.length} skills · budget ${budget}
              {cartTotal > budget ? " · OVER budget" : " · within budget"}
            </p>
            <ul className="mt-3 space-y-1 text-xs">
              {cartItems.map((s) => (
                <li key={s.id} className="flex justify-between gap-2 border-b border-border py-1">
                  <span className="truncate">{s.name}</span>
                  <span className="font-mono">${s.price_usd}</span>
                </li>
              ))}
              {cartItems.length === 0 && (
                <li className="text-muted">Add skills agents would buy under budget.</li>
              )}
            </ul>
            {data.topDemand[0] && (
              <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-elevated p-2 text-xs">
                <p className="text-[10px] uppercase text-subtle">Top demand</p>
                <p className="font-medium">{data.topDemand[0].name}</p>
                <p className="font-mono text-muted">
                  ${data.topDemand[0].price_usd} · unlocks{" "}
                  {data.topDemand[0].confirmed_unlocks ?? 0}
                </p>
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === "seq" && (
        <Panel title="Agent purchase sequence (machine intent path)">
          <p className="mb-3 text-xs text-muted">
            X signal: agents don't fill forms — they follow HTTP contracts. This is LVL's
            production recipe from /api/shop.
          </p>
          <ol className="space-y-2">
            {(data.purchaseSequence.length
              ? data.purchaseSequence
              : [
                  "GET /api/shop",
                  "GET /api/signals",
                  "GET /api/catalog",
                  "GET outline.json",
                  "GET /api/pay → 402",
                  "USDC transfer on Base",
                  "POST X-PAYMENT",
                  "GET /api/proof",
                ]
            ).map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px]">
                  {i + 1}
                </span>
                <code className="break-all leading-relaxed text-muted">{step}</code>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {tab === "domains" && (
        <Panel title="lvlltd.com domain surface map">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase text-subtle">
                  <th className="py-2 pr-2">Role</th>
                  <th className="py-2 pr-2">Path</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">ms</th>
                </tr>
              </thead>
              <tbody>
                {data.surfaces.map((s) => (
                  <tr key={s.path} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-medium">{s.role}</td>
                    <td className="py-2 pr-2 font-mono text-[11px]">
                      <a
                        href={`https://lvlltd.com${s.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {s.path}
                      </a>
                    </td>
                    <td className="py-2 pr-2">
                      <span className={cn(s.ok ? "text-ok" : "text-danger")}>{s.status}</span>
                    </td>
                    <td className="py-2 font-mono text-muted">{s.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
