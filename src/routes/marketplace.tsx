import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/marketplace")({
  component: MarketplaceLayout,
  head: () => ({
    meta: [
      { title: "Marketplace · LVL Agent Product" },
      {
        name: "description",
        content: "Full-service agent commerce control room for lvlltd.com",
      },
    ],
  }),
});

/** Primary chrome — full map lives on Overview + /marketplace/manifest */
const LINKS = [
  { to: "/marketplace" as const, label: "Overview", exact: true },
  { to: "/marketplace/product" as const, label: "Product" },
  { to: "/marketplace/pay" as const, label: "Pay" },
  { to: "/marketplace/checkout" as const, label: "Checkout" },
  { to: "/marketplace/live" as const, label: "Live" },
  { to: "/marketplace/orchestrate" as const, label: "Orchestrate" },
  { to: "/marketplace/mcp" as const, label: "MCP" },
  { to: "/marketplace/auditor" as const, label: "Auditor" },
  { to: "/marketplace/ladder" as const, label: "Ladder" },
  { to: "/marketplace/receipts" as const, label: "Receipts" },
  { to: "/marketplace/manifest" as const, label: "Map" },
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
