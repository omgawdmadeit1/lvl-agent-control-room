import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/ops")({
  component: OpsLayout,
  head: () => ({
    meta: [{ title: "Ops · LVL Agent Control Room" }],
  }),
});

const OPS_LINKS = [
  { to: "/ops/board" as const, label: "Board" },
  { to: "/ops/health" as const, label: "Health" },
  { to: "/ops/scout" as const, label: "Scout" },
];

function OpsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold tracking-tight hover:text-accent">
              LVL Control Room
            </Link>
            <span className="text-subtle">/</span>
            <span className="text-xs uppercase tracking-wide text-muted">ops</span>
          </div>
          <nav aria-label="Ops sections" className="flex flex-wrap gap-1">
            {OPS_LINKS.map((l) => {
              const active = pathname === l.to || pathname.startsWith(l.to + "/");
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
            <Link
              to="/lab/router"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs text-muted"
            >
              Router lab
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
