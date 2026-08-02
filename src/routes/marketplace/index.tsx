import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/marketplace/")({
  component: MarketplaceHub,
  head: () => ({
    meta: [
      { title: "LVL Marketplace Control · agent commerce" },
      {
        name: "description",
        content:
          "Full-service x402 agent marketplace: checkout, ladder, live ops, SDK, sellers",
      },
    ],
  }),
});

const TILES: {
  to: string;
  label: string;
  blurb: string;
  search?: Record<string, string>;
  primary?: boolean;
}[] = [
  {
    to: "/marketplace/product",
    label: "Product OS",
    blurb: "End-to-end commercial product loop",
    primary: true,
  },
  {
    to: "/marketplace/checkout",
    label: "Checkout wizard",
    blurb: "Guided outline → 402 → unlock",
    search: { skill: "agent-x402-first-buy" },
    primary: true,
  },
  {
    to: "/marketplace/live",
    label: "Live ops",
    blurb: "Ready, funnel, confirmed GMV",
  },
  {
    to: "/marketplace/simulate",
    label: "Buyer simulator",
    blurb: "Dry-run integration score",
  },
  {
    to: "/marketplace/ladder",
    label: "Pricing ladder",
    blurb: "$0.05 → tripwire → flagship",
  },
  {
    to: "/marketplace/shelf",
    label: "Premium shelf",
    blurb: "High AOV packs from metrics",
  },
  {
    to: "/marketplace/sdk",
    label: "SDK playground",
    blurb: "LvlAgentShop REST methods",
  },
  {
    to: "/marketplace/kit",
    label: "Integration kit",
    blurb: "JSON for purchasing agents",
  },
  {
    to: "/marketplace/wallet",
    label: "Wallet ready",
    blurb: "USDC balance vs required",
  },
  {
    to: "/marketplace/agents",
    label: "Agent directory",
    blurb: "275 profiles → checkout",
  },
  {
    to: "/marketplace/demand",
    label: "Demand board",
    blurb: "Confirmed unlock signals",
  },
  {
    to: "/marketplace/sell",
    label: "Seller hub",
    blurb: "First-party + open market",
  },
  {
    to: "/marketplace/agent-economy",
    label: "Economy cockpit",
    blurb: "Card, MCP tools, domains",
  },
  {
    to: "/marketplace/catalog",
    label: "Catalog",
    blurb: "Browse live skills",
  },
  {
    to: "/marketplace/x402",
    label: "x402 inspector",
    blurb: "Raw payment challenge",
    search: { skill: "agent-x402-first-buy" },
  },
  {
    to: "/marketplace/rails",
    label: "Six rails",
    blurb: "Marketplace architecture",
  },
];

function MarketplaceHub() {
  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          lvlltd.com · agent-native commerce
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Marketplace Control Room
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
          Full-service product for agents: discover, evaluate free, settle USDC on Base via x402,
          unlock sealed packs, prove on a public ledger — then sell more with ladders, bundles, and
          open-market escrow.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/marketplace/checkout"
            search={{ skill: "agent-x402-first-buy" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            $0.05 canary checkout
          </Link>
          <Link
            to="/marketplace/simulate"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
          >
            Run buyer sim
          </Link>
          <a
            href="https://lvlltd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm"
          >
            lvlltd.com ↗
          </a>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TILES.map((t) => (
          <Link
            key={t.to + t.label}
            to={t.to as "/marketplace/product"}
            search={t.search as never}
            className={
              t.primary
                ? "rounded-[var(--radius-xl)] border border-accent/40 bg-accent/5 p-4 transition hover:border-accent"
                : "rounded-[var(--radius-xl)] border border-border bg-surface p-4 transition hover:border-accent/40"
            }
          >
            <p className="text-sm font-semibold">{t.label}</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{t.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
