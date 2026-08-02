import { Link, createFileRoute } from "@tanstack/react-router";
import { loadScoutData } from "@/lib/router/loaders";
import {
  LoaderError,
  LoaderMetaBadge,
  LoaderPending,
} from "@/components/router/LoaderStates";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/ops/scout")({
  loader: async () => loadScoutData(),
  pendingComponent: () => <LoaderPending label="Running scout loader probes…" />,
  pendingMs: 80,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: ScoutRoute,
  head: () => ({
    meta: [{ title: "Live scout · LVL Ops" }],
  }),
});

function ScoutRoute() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Live scout (route loader)</h1>
          <p className="mt-1 text-sm text-muted">{data.summary}</p>
          <LoaderMetaBadge durationMs={data.durationMs} startedAt={data.startedAt} />
        </div>
        <Link to="/ops/health" className="text-xs text-accent hover:underline">
          ← Health loader
        </Link>
      </div>

      <div className="flex gap-3 text-sm">
        <span className="rounded-full bg-ok/15 px-3 py-1 font-mono text-ok">{data.ok} ok</span>
        <span className="rounded-full bg-danger/15 px-3 py-1 font-mono text-danger">
          {data.fail} fail
        </span>
      </div>

      <ul className="space-y-2">
        {data.findings.map((f) => (
          <li
            key={f.id}
            className={cn(
              "rounded-[var(--radius-lg)] border border-border bg-surface p-3",
              !f.ok && "border-danger/40",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{f.title}</p>
              <span className={cn("font-mono text-[10px] uppercase", f.ok ? "text-ok" : "text-danger")}>
                {f.ok ? "ok" : "fail"} · {f.ms}ms
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{f.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
