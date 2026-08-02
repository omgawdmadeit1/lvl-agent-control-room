import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/marketplace")({
  component: MarketplaceLayout,
  head: () => ({
    meta: [
      { title: "Marketplace · LVL LTD ideas" },
      {
        name: "description",
        content: "Explore lvlltd.com agent skill marketplace rails, catalog, and x402 challenges",
      },
    ],
  }),
});

const LINKS = [
  { to: "/marketplace" as const, label: "Overview", exact: true },
  { to: "/marketplace/catalog" as const, label: "Catalog" },
  { to: "/marketplace/x402" as const, label: "x402" },
  { to: "/marketplace/rails" as const, label: "Rails" },
  { to: "/marketplace/agent-economy" as const, label: "Agent economy" },
  { to: "/marketplace/product" as const, label: "Product OS" },
  { to: "/marketplace/checkout" as const, label: "Checkout" },
  { to: "/marketplace/demand" as const, label: "Demand" },
  { to: "/marketplace/ladder" as const, label: "Ladder" },
  { to: "/marketplace/sdk" as const, label: "SDK" },
  { to: "/marketplace/sell" as const, label: "Sell" },
  { to: "/marketplace/live" as const, label: "Live ops" },
  { to: "/marketplace/simulate" as const, label: "Simulate" },
  { to: "/marketplace/kit" as const, label: "Kit" },
  { to: "/marketplace/shelf" as const, label: "Shelf" },
  { to: "/marketplace/wallet" as const, label: "Wallet" },
  { to: "/marketplace/agents" as const, label: "Agents" },
];

function MarketplaceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-sm font-semibold tracking-tight hover:text-accent">
              LVL Control Room
            </Link>
            <span className="text-subtle">/</span>
            <Link to="/marketplace" className="text-sm font-medium">
              Marketplace
            </Link>
            <span className="hidden text-xs text-muted sm:inline">
              ideas behind lvlltd.com
            </span>
          </div>
          <nav aria-label="Marketplace sections" className="flex flex-wrap gap-1">
            {LINKS.map((l) => {
              const active = l.exact
                ? pathname === l.to
                : pathname === l.to || pathname.startsWith(l.to + "/");
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "inline-flex h-11 min-target items-center rounded-[var(--radius-md)] px-3 text-xs font-medium transition",
                    active
                      ? "bg-accent text-accent-fg"
                      : "border border-border bg-elevated text-muted hover:text-fg",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <a
              href="https://lvlltd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs text-muted"
            >
              lvlltd.com ↗
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
