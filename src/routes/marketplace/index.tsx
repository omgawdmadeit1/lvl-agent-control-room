import { Link, createFileRoute } from "@tanstack/react-router";
import { loadMarketplaceSnapshot } from "@/lib/marketplace/catalog";
import { RailsDiagram } from "@/components/marketplace/RailsDiagram";
import { SkillCard } from "@/components/marketplace/SkillCard";
import { LoaderPending, LoaderMetaBadge } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/")({
  loader: () => loadMarketplaceSnapshot(),
  pendingComponent: () => <LoaderPending label="Loading live LVL catalog…" />,
  pendingMs: 80,
  staleTime: 60_000,
  component: MarketplaceHome,
});

function MarketplaceHome() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">LVL LTD</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          x402 AI agent skill marketplace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Agents discover sealed skill packs, negotiate machine-readable terms, sample free
          outlines, pay USDC on Base via x402, unlock packs, and leave an auditable proof trail —
          the product thesis of{" "}
          <a href="https://lvlltd.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            lvlltd.com
          </a>
          .
        </p>
        <LoaderMetaBadge durationMs={data.durationMs} startedAt={data.loadedAt} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/catalog"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            Browse catalog
          </Link>
          <Link
            to="/marketplace/x402"
            search={{ skill: "agent-orchestration" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
          >
            Inspect x402 challenge
          </Link>
          <Link
            to="/marketplace/rails"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm"
          >
            Six rails
          </Link>
          <Link
            to="/marketplace/product"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            Agent Product OS
          </Link>
          <Link
            to="/marketplace/agent-economy"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-accent/40 bg-accent/10 px-4 text-sm font-semibold text-accent"
          >
            Agent economy cockpit
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Skills", value: String(data.meta.skill_count || data.skills.length) },
          { label: "Premium", value: String(data.premiumCount) },
          { label: "Categories", value: String(data.categories.length) },
          { label: "Catalog", value: `v${data.meta.version || "—"}` },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <p className="text-[10px] uppercase text-subtle">{s.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Price bands</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-5">
          {data.priceBuckets.map((b) => (
            <li key={b.label} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-center">
              <p className="text-xs text-muted">{b.label}</p>
              <p className="font-mono text-lg font-semibold">{b.count}</p>
            </li>
          ))}
        </ul>
      </section>

      <RailsDiagram rails={data.rails} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Featured skills</h2>
          <Link to="/marketplace/catalog" className="text-xs text-accent hover:underline">
            Full catalog →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.featured.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
        <h2 className="text-sm font-semibold">Why this exists</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
          <li>
            <strong className="text-fg">Agent-native commerce</strong> — HTTP 402 is the checkout;
            wallets and agents complete payment without a human cart UI.
          </li>
          <li>
            <strong className="text-fg">Sealed packs</strong> — full skill content stays locked until
            USDC proof; free outline/sample reduce adverse selection.
          </li>
          <li>
            <strong className="text-fg">Composable inventory</strong> — catalog.json + shop + search
            APIs so swarms can budget-filter and compose multi-skill workflows.
          </li>
          <li>
            <strong className="text-fg">Trust rails</strong> — proof ledger, tiers, and governance
            hooks for high-value automation.
          </li>
        </ul>
      </section>
    </div>
  );
}
