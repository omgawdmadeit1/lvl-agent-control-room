import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { loadHealthData } from "@/lib/router/loaders";
import {
  LoaderError,
  LoaderMetaBadge,
  LoaderPending,
} from "@/components/router/LoaderStates";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/ops/health")({
  loader: async ({ location }) => {
    const force = location.searchStr.includes("refresh=1");
    return loadHealthData({ force });
  },
  pendingComponent: () => <LoaderPending label="Probing lvlltd.com for health score…" />,
  pendingMs: 80,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: HealthRoute,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `Health ${loaderData.score} ${loaderData.grade} · LVL Ops`
          : "Site health · LVL Ops",
      },
    ],
  }),
});

function HealthRoute() {
  const data = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Site health (route loader)</h1>
          <LoaderMetaBadge durationMs={data.durationMs} startedAt={data.startedAt} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              // bust probe cache + re-run loader
              void import("@/lib/router/loaders").then(({ clearProbeCache }) => {
                clearProbeCache();
                void router.invalidate();
              });
            }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Re-run loader
          </button>
          <Link to="/ops/scout" className="inline-flex h-11 items-center text-xs text-accent hover:underline">
            Scout loader →
          </Link>
          <Link to="/lab/loaders" className="inline-flex h-11 items-center text-xs text-muted hover:underline">
            Lab
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <p className="text-[10px] uppercase text-subtle">Score</p>
          <p className="font-mono text-3xl font-semibold">{data.score}</p>
          <p className="text-xs text-muted">Grade {data.grade}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <p className="text-[10px] uppercase text-subtle">Go / no-go</p>
          <p
            className={cn(
              "text-2xl font-semibold uppercase",
              data.goNoGo === "go" && "text-ok",
              data.goNoGo === "caution" && "text-warn",
              data.goNoGo === "no-go" && "text-danger",
            )}
          >
            {data.goNoGo}
          </p>
          <p className="text-xs text-muted">{data.probeCount} probes</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <p className="text-[10px] uppercase text-subtle">Sample</p>
          <p className="mt-1 font-mono text-xs text-muted">
            skills {data.sample.skillCount ?? "—"} · slash {data.sample.listingSlash} · html{" "}
            {data.sample.listingHtml} · x402 {data.sample.x402}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {data.topActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.checks.map((c) => (
          <li
            key={c.id}
            className={cn(
              "rounded-[var(--radius-md)] border border-border bg-elevated p-3",
              !c.pass && "border-danger/40",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{c.id}</p>
              <span className={cn("font-mono text-[10px] uppercase", c.pass ? "text-ok" : "text-danger")}>
                {c.pass ? "pass" : "fail"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{c.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
