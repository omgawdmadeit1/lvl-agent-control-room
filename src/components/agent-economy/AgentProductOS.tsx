import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ProductSnapshot } from "@/lib/agent-economy/product-loader";
import {
  AGENT_FUNNEL,
  atomicToUsd,
  buildAgentRecipe,
  profitScenario,
  sellerPlaybook,
} from "@/lib/agent-economy/product-engine";
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

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none focus:border-accent";

export function AgentProductOS({ data }: { data: ProductSnapshot }) {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState(data.cartSkills.join(","));
  const [avgPrice, setAvgPrice] = useState(2.5);
  const [unlocksDay, setUnlocksDay] = useState(40);
  const [takeRate, setTakeRate] = useState(100);
  const [fixedCost, setFixedCost] = useState(15);
  const [openVol, setOpenVol] = useState(50);
  const [openFee, setOpenFee] = useState(data.openMarket?.fee_free_tier_percent ?? 15);
  const [recipeTab, setRecipeTab] = useState<"bash" | "node" | "prompt">("bash");

  const skills = useMemo(
    () =>
      skillInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [skillInput],
  );
  const recipe = useMemo(() => buildAgentRecipe(skills), [skills]);
  const profit = useMemo(
    () =>
      profitScenario({
        avgPriceUsd: avgPrice,
        unlocksPerDay: unlocksDay,
        takeRatePct: takeRate,
        fixedCostUsdDay: fixedCost,
        openMarketVolumeUsdDay: openVol,
        openMarketFeePct: openFee,
      }),
    [avgPrice, unlocksDay, takeRate, fixedCost, openVol, openFee],
  );

  const cart = data.cart as {
    ok?: boolean;
    total_usd?: number;
    total_atomic?: string;
    payTo?: string;
    items?: {
      skill_id: string;
      name: string;
      price_usd: number;
      maxAmountRequired: string;
      challenge: string;
    }[];
    settlement?: { per_skill?: string; combined?: string };
    next?: { skill_id: string; steps: string[] }[];
  } | null;

  const readyChecks = Array.isArray((data.ready as { checks?: unknown })?.checks)
    ? ((data.ready as { checks: { id: string; ok: boolean; [k: string]: unknown }[] }).checks)
    : [];

  const markets = (data.fleet?.markets || {}) as Record<
    string,
    { id?: string; url?: string; role?: string; buyable_here?: boolean; skill_count?: number; note?: string }
  >;

  const standards = Array.isArray(data.protocols?.standards)
    ? (data.protocols!.standards as string[])
    : ["x402", "A2A", "MCP", "ERC-7857"];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Full-service agent product · LVL LTD
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Agent Product OS
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted leading-relaxed">
          End-to-end commercial product for autonomous agents on lvlltd.com: discover → free eval →
          multi-skill cart → Base USDC x402 settle → sealed unlock → public proof → seller
          monetization. Built for machines first; humans can operate the same rails.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/agent-economy"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Economy cockpit
          </Link>
          <Link
            to="/marketplace/x402"
            search={{ skill: data.featured.start_here?.id || "agent-x402-first-buy" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Start $0.05 canary
          </Link>
          <a
            href="https://lvlltd.com/sdk/agent-shop.mjs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            SDK ↗
          </a>
          <a
            href="https://lvlltd.com/how-to/agent-shopping/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Official how-to ↗
          </a>
        </div>
        <p className="mt-3 font-mono text-[11px] text-subtle">
          snapshot {data.durationMs}ms · inventory {data.inventory.skills} skills ·{" "}
          {data.inventory.premium} premium · loop {String((data.proof as { loop_status?: string })?.loop_status || "—")}
        </p>
      </section>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Skills live", value: String(data.inventory.skills) },
          {
            label: "Confirmed volume",
            value: `$${data.activity.volume_usdc ?? 0}`,
          },
          {
            label: "Unlocks (proof)",
            value: String(data.activity.unlock_count ?? 0),
          },
          {
            label: "API health",
            value: data.health?.ok ? "ok" : "degraded",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[10px] uppercase text-subtle">{k.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <Panel title="Revenue funnel (agent path)">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_FUNNEL.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "rounded-[var(--radius-lg)] border p-3",
                s.monetizes ? "border-accent/40 bg-accent/5" : "border-border bg-elevated",
              )}
            >
              <p className="font-mono text-[10px] text-subtle">
                {i + 1}. {s.title}
                {s.monetizes ? " · $ " : ""}
              </p>
              <p className="mt-1 text-xs font-medium">{s.agentAction}</p>
              <p className="mt-1 font-mono text-[10px] text-muted leading-relaxed">{s.endpoint}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {/* Cart + checkout */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Multi-skill cart (live /api/cart)">
          <label className="block text-xs">
            <span className="text-muted">Skill IDs (comma-separated)</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
            onClick={() =>
              void navigate({
                to: "/marketplace/product",
                search: { skills: skills.join(",") },
                replace: true,
              })
            }
          >
            Rebuild cart
          </button>
          {cart?.ok && (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Total USDC</dt>
                  <dd className="font-mono text-xl font-semibold">${cart.total_usd}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Atomic (6 dec)</dt>
                  <dd className="font-mono text-sm">{cart.total_atomic}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase text-subtle">payTo</dt>
                  <dd className="truncate font-mono text-[11px] text-muted">{cart.payTo}</dd>
                </div>
              </dl>
              <ul className="mt-3 space-y-2">
                {(cart.items || []).map((it) => (
                  <li
                    key={it.skill_id}
                    className="rounded-[var(--radius-md)] border border-border bg-elevated p-2.5 text-xs"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{it.name}</span>
                      <span className="font-mono">${it.price_usd}</span>
                    </div>
                    <p className="font-mono text-[10px] text-subtle">
                      atomic {it.maxAmountRequired} ≈ ${atomicToUsd(it.maxAmountRequired)}
                    </p>
                    <Link
                      to="/marketplace/x402"
                      search={{ skill: it.skill_id }}
                      className="mt-1 inline-flex text-accent hover:underline"
                    >
                      Open 402 challenge →
                    </Link>
                  </li>
                ))}
              </ul>
              {cart.settlement && (
                <p className="mt-3 text-[11px] text-muted leading-relaxed">
                  {cart.settlement.per_skill}
                </p>
              )}
            </>
          )}
          {!cart?.ok && (
            <p className="mt-3 text-xs text-danger">
              Cart unavailable — check skill IDs or domain proxy.
            </p>
          )}
        </Panel>

        <Panel title="Install recipes (agents copy this)">
          <div className="flex flex-wrap gap-1">
            {(["bash", "node", "prompt"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecipeTab(t)}
                className={cn(
                  "inline-flex h-11 items-center rounded-[var(--radius-md)] border px-3 text-xs font-medium",
                  recipeTab === t
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-elevated",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <pre className="mt-3 max-h-80 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[10px] text-muted leading-relaxed">
            {recipeTab === "bash"
              ? recipe.bash
              : recipeTab === "node"
                ? recipe.node
                : recipe.agentPrompt}
          </pre>
          <button
            type="button"
            className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            onClick={() => {
              const text =
                recipeTab === "bash"
                  ? recipe.bash
                  : recipeTab === "node"
                    ? recipe.node
                    : recipe.agentPrompt;
              void navigator.clipboard?.writeText(text);
            }}
          >
            Copy recipe
          </button>
        </Panel>
      </div>

      {/* Profit + sellers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Operator profit model (scenario)">
          <p className="mb-3 text-xs text-muted">
            Plan profitability. Live OPS revenue API is auth-gated — this is a transparent model for
            first-party take rate + open-market fees.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["Avg price $", avgPrice, setAvgPrice],
                ["Unlocks/day", unlocksDay, setUnlocksDay],
                ["Take rate %", takeRate, setTakeRate],
                ["Fixed $/day", fixedCost, setFixedCost],
                ["Open mkt vol $/day", openVol, setOpenVol],
                ["Open fee %", openFee, setOpenFee],
              ] as const
            ).map(([label, val, set]) => (
              <label key={label} className="text-xs">
                <span className="text-muted">{label}</span>
                <input
                  type="number"
                  className={cn(inputCls, "mt-1")}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[10px] uppercase text-subtle">Revenue / day</dt>
              <dd className="font-mono text-xl font-semibold text-accent">${profit.revenueDay}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Profit / month</dt>
              <dd className="font-mono text-xl font-semibold">${profit.profitMonth}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Skill GMV / mo</dt>
              <dd className="font-mono">${profit.skillGmvMonth}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Margin</dt>
              <dd className="font-mono">{profit.marginPct}%</dd>
            </div>
            <div className="col-span-2 text-xs text-muted">
              Break-even ≈ {profit.breakEvenUnlocks} unlocks/day at current take rate
            </div>
          </dl>
        </Panel>

        <Panel title="Seller monetization channels">
          <ul className="space-y-2">
            {sellerPlaybook().map((s) => (
              <li
                key={s.channel}
                className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
              >
                <p className="font-semibold">{s.channel}</p>
                <p className="mt-1 text-muted">{s.how}</p>
                <p className="mt-1 text-fg">
                  <strong>Economics:</strong> {s.fee}
                </p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-accent hover:underline"
                >
                  Open ↗
                </a>
              </li>
            ))}
          </ul>
          {data.openMarket && (
            <p className="mt-3 font-mono text-[11px] text-subtle">
              Escrow {data.openMarket.escrow_contract || "—"} · fee{" "}
              {data.openMarket.fee_free_tier_percent}%
            </p>
          )}
        </Panel>
      </div>

      {/* Fleet + readiness */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Multi-market fleet">
          <ul className="space-y-2">
            {Object.entries(markets).map(([key, m]) => (
              <li
                key={key}
                className="flex flex-wrap items-start justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated p-2.5 text-xs"
              >
                <div>
                  <p className="font-medium">{m.id || key}</p>
                  <p className="text-muted">{m.role}</p>
                  {m.skill_count != null && (
                    <p className="font-mono text-[10px] text-subtle">{m.skill_count} skills</p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                      m.buyable_here ? "border-ok/40 text-ok" : "border-border text-muted",
                    )}
                  >
                    {m.buyable_here ? "buyable" : "tooling"}
                  </span>
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-accent hover:underline"
                    >
                      open
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Readiness & trust">
          <p className="text-xs text-muted mb-2">
            /api/ready HTTP {data.readyHttp} · use this before routing agent traffic.
          </p>
          <ul className="space-y-1">
            {readyChecks.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded bg-elevated px-2 py-1.5 text-xs"
              >
                <span className="font-mono">{c.id}</span>
                <span className={c.ok ? "text-ok" : "text-warn"}>{c.ok ? "ok" : "check"}</span>
              </li>
            ))}
            {readyChecks.length === 0 && (
              <li className="text-xs text-muted">No structured checks returned.</li>
            )}
          </ul>
          {data.lastPurchase && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-ok/30 bg-ok/10 p-3 text-xs">
              <p className="font-semibold text-ok">Last confirmed purchase</p>
              <p className="mt-1">
                {data.lastPurchase.skill_id} · ${data.lastPurchase.price_usd}
              </p>
              {data.lastPurchase.explorer && (
                <a
                  href={data.lastPurchase.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-accent hover:underline"
                >
                  Basescan ↗
                </a>
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {standards.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-elevated px-2 py-0.5 font-mono text-[10px]"
              >
                {s}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      {/* X-informed GTM */}
      <Panel title="GTM from X agent-economy signal">
        <ul className="grid gap-2 sm:grid-cols-2">
          {X_AGENT_ECONOMY_INSIGHTS.filter((x) => x.priority === "P0").map((x) => (
            <li
              key={x.id}
              className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
            >
              <p className="font-semibold">{x.theme}</p>
              <p className="mt-1 text-muted">{x.lvlAction}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="font-semibold">90-day growth levers</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted leading-relaxed">
            <li>
              Push <strong className="text-fg">agent-x402-first-buy ($0.05)</strong> as the universal
              canary — every agent integration must clear this path.
            </li>
            <li>
              Index LVL tools into external MCP/x402 routers (copy tools/list from Economy Cockpit).
            </li>
            <li>
              Raise AOV with <strong className="text-fg">bundles</strong> (x402 Buyer Ops, Production
              Gates) — one gas, multiple packs.
            </li>
            <li>
              Activate open marketplace listings (15% fee) for third-party inventory without diluting
              first-party catalog trust.
            </li>
            <li>
              Publish proof weekly — only confirmed unlocks; never invent GMV (canonical /api/proof).
            </li>
          </ol>
        </div>
      </Panel>
    </div>
  );
}
