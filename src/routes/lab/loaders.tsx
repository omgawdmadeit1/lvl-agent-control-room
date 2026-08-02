import { useState } from "react";
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { loadLoaderDemo } from "@/lib/router/loaders";
import {
  LoaderError,
  LoaderMetaBadge,
  LoaderPending,
} from "@/components/router/LoaderStates";
export type LoadersSearch = {
  delay?: number;
  fail?: boolean;
};

function parseLoadersSearch(raw: Record<string, unknown>): LoadersSearch {
  const delayRaw = raw.delay;
  const delay =
    typeof delayRaw === "number"
      ? delayRaw
      : typeof delayRaw === "string"
        ? Number(delayRaw)
        : 500;
  const failRaw = raw.fail;
  const fail =
    failRaw === true || failRaw === "true" || failRaw === "1" || failRaw === 1;
  return {
    delay: Number.isFinite(delay) ? Math.min(5000, Math.max(0, delay)) : 500,
    fail,
  };
}

export const Route = createFileRoute("/lab/loaders")({
  validateSearch: (raw: Record<string, unknown>): LoadersSearch => parseLoadersSearch(raw),
  loaderDeps: ({ search }: { search: LoadersSearch }) => ({
    delay: search.delay ?? 500,
    fail: !!search.fail,
  }),
  loader: async ({ deps }) => loadLoaderDemo({ delayMs: deps.delay, fail: deps.fail }),
  pendingComponent: () => <LoaderPending label="Demo loader running…" />,
  pendingMs: 50,
  // short stale so demos re-run when deps change
  staleTime: 0,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-dvh bg-bg px-4 py-8 text-fg">
      <div className="mx-auto max-w-[800px] space-y-4">
        <LabHeader />
        <LoaderError
          error={error instanceof Error ? error : new Error(String(error))}
          reset={reset}
        />
      </div>
    </div>
  ),
  component: LoadersLab,
  head: () => ({
    meta: [{ title: "TanStack Router loaders lab · LVL" }],
  }),
});

function LabHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-subtle">TanStack Router</p>
        <h1 className="text-xl font-semibold">Loaders lab</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/lab/router"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
        >
          Router lab
        </Link>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
        >
          Control Room
        </Link>
      </div>
    </header>
  );
}

function LoadersLab() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/lab/loaders" });
  const router = useRouter();
  const [delay, setDelay] = useState(search.delay ?? 500);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-[800px] space-y-6 px-4 py-8">
        <LabHeader />

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">What loaders do</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
            <li>
              <strong className="text-fg">loader</strong> — async function on a route; result is
              typed via <code className="text-fg">Route.useLoaderData()</code>.
            </li>
            <li>
              <strong className="text-fg">loaderDeps</strong> — declare which search/params should
              re-run the loader (used here for delay/fail).
            </li>
            <li>
              <strong className="text-fg">pendingComponent + pendingMs</strong> — show a fallback when
              the loader is slow.
            </li>
            <li>
              <strong className="text-fg">errorComponent</strong> — catch thrown errors;{" "}
              <code className="text-fg">reset()</code> retries.
            </li>
            <li>
              <strong className="text-fg">staleTime</strong> — cache window before refetch (ops routes
              use 30–60s; this lab uses 0 so demos always re-run).
            </li>
            <li>
              <strong className="text-fg">head(&#123; loaderData &#125;)</strong> — dynamic titles
              after load (see <code className="text-fg">/ops/health</code>).
            </li>
          </ul>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">This route's loader result</h2>
          <LoaderMetaBadge durationMs={data.delayMs} startedAt={data.at} />
          <p className="mt-3 text-sm text-ok">{data.message}</p>
          <pre className="mt-3 overflow-x-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Controls (loaderDeps)</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-xs">
              <span className="text-muted">Delay ms</span>
              <input
                type="number"
                min={0}
                max={5000}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value) || 0)}
                className="mt-1 block h-11 w-28 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                void navigate({
                  search: { delay, fail: false },
                  replace: true,
                })
              }
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
            >
              Run success loader
            </button>
            <button
              type="button"
              onClick={() =>
                void navigate({
                  search: { delay, fail: true },
                  replace: true,
                })
              }
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-danger/40 bg-elevated px-4 text-sm font-medium text-danger"
            >
              Run failing loader
            </button>
            <button
              type="button"
              onClick={() => void router.invalidate()}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm"
            >
              router.invalidate()
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-subtle">
            /lab/loaders?delay={search.delay ?? 500}&fail={String(!!search.fail)}
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Production loaders in this app</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/ops/board" className="text-accent hover:underline">
                /ops/board
              </Link>
              <span className="text-muted"> — seed snapshot loader + search filters</span>
            </li>
            <li>
              <Link to="/ops/health" className="text-accent hover:underline">
                /ops/health
              </Link>
              <span className="text-muted"> — live lvlltd.com health score (server proxy probes)</span>
            </li>
            <li>
              <Link to="/ops/scout" className="text-accent hover:underline">
                /ops/scout
              </Link>
              <span className="text-muted"> — full probe table from the same loader pipeline</span>
            </li>
          </ul>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
          <h2 className="text-sm font-semibold">Pattern</h2>
          <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-muted">{`export const Route = createFileRoute('/ops/health')({
  loader: async () => loadHealthData(),
  pendingComponent: () => <LoaderPending />,
  pendingMs: 80,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => <LoaderError error={error} reset={reset} />,
  component: Page,
})

function Page() {
  const data = Route.useLoaderData()
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}`}</pre>
        </section>
      </div>
    </div>
  );
}
