import { useMemo, useState } from "react";
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { APP_ROUTES } from "@/lib/router/route-meta";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/lab/router")({
  component: RouterLab,
  head: () => ({
    meta: [
      {
        title: "TanStack Router lab · LVL",
      },
      {
        name: "description",
        content: "Explore file routes, validated search, Link active state, and router state",
      },
    ],
  }),
});

function RouterLab() {
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });
  const matches = useRouterState({ select: (s) => s.matches });
  const navigate = useNavigate();
  const [demoQ, setDemoQ] = useState("seal");

  const tree = useMemo(
    () =>
      matches.map((m) => ({
        id: m.routeId,
        pathname: m.pathname,
        status: m.status,
      })),
    [matches],
  );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border bg-surface/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-subtle">TanStack Router</p>
            <h1 className="text-xl font-semibold">Integration lab</h1>
          </div>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm"
          >
            Control Room
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] space-y-6 px-4 py-6">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">How this app uses the router</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
            <li>
              <strong className="text-fg">File routes</strong> under{" "}
              <code className="text-fg">src/routes/</code> generate{" "}
              <code className="text-fg">routeTree.gen.ts</code> via{" "}
              <code className="text-fg">@tanstack/react-start</code> / router plugin.
            </li>
            <li>
              <strong className="text-fg">Root</strong> (
              <code className="text-fg">__root.tsx</code>) owns document shell, head meta,{" "}
              <code className="text-fg">Outlet</code>, toaster, and a{" "}
              <code className="text-fg">notFoundComponent</code>.
            </li>
            <li>
              <strong className="text-fg">Layout route</strong>{" "}
              <code className="text-fg">/ops</code> nests board / health / scout with shared chrome.
            </li>
            <li>
              <strong className="text-fg">Validated search</strong> on{" "}
              <code className="text-fg">/ops/board</code> keeps filters shareable in the URL (Zod).
            </li>
            <li>
              <strong className="text-fg">Type registration</strong> in{" "}
              <code className="text-fg">router.tsx</code> wires{" "}
              <code className="text-fg">Register.router</code> for typed{" "}
              <code className="text-fg">Link</code> / <code className="text-fg">navigate</code>.
            </li>
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Live location</h2>
            <dl className="mt-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">pathname</dt>
                <dd>{location.pathname}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">search</dt>
                <dd className="max-w-[60%] truncate text-right">
                  {location.searchStr || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">href</dt>
                <dd className="max-w-[60%] truncate text-right">{location.href}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-subtle">history</dt>
                <dd>{router.history.location.pathname}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">Active matches</h2>
            <ol className="mt-3 space-y-1 font-mono text-xs">
              {tree.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-elevated px-2 py-1.5"
                >
                  <span>{m.id}</span>
                  <span className="text-subtle">{m.status}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Typed navigation demos</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {APP_ROUTES.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium hover:border-subtle"
              >
                {r.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <label className="block text-xs">
              <span className="text-muted">Board search demo</span>
              <input
                value={demoQ}
                onChange={(e) => setDemoQ(e.target.value)}
                className="mt-1 flex h-11 w-48 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                void navigate({
                  to: "/ops/board",
                  search: {
                    q: demoQ,
                    priority: "P0",
                    status: "ALL",
                    role: "ALL",
                  },
                })
              }
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
            >
              navigate → /ops/board?q=…
            </button>
          </div>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Route catalog</h2>
          <ul className="mt-3 divide-y divide-border">
            {APP_ROUTES.map((r) => (
              <li key={r.to} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted">{r.description}</p>
                </div>
                <code
                  className={cn(
                    "rounded-full border border-border px-2 py-0.5 font-mono text-[11px]",
                    location.pathname === r.to && "border-accent text-accent",
                  )}
                >
                  {r.to}
                </code>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
          <h2 className="text-sm font-semibold">Code map</h2>
          <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-muted">{`src/router.tsx          createRouter({ routeTree, scrollRestoration })
src/routeTree.gen.ts    generated file route tree
src/routes/__root.tsx   document shell + notFound
src/routes/index.tsx    /  → AgentControlRoom
src/routes/ops.tsx      /ops layout (Outlet + Link nav)
src/routes/ops/board.tsx  validateSearch (Zod) + navigate search
src/routes/ops/health.tsx SiteHealthPanel route
src/routes/ops/scout.tsx  LiveScoutPanel route
src/routes/lab/router.tsx this lab
src/lib/router/search.ts  boardSearchSchema
`}</pre>
        </section>
      </main>
    </div>
  );
}
