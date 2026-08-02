import { createFileRoute } from "@tanstack/react-router";
import { probeChallengeShape } from "@/lib/agent-economy/ready-probe";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/marketplace/ready")({
  loader: () => probeChallengeShape(),
  pendingComponent: () => <LoaderPending label="Probing ready + challenges…" />,
  staleTime: 15_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: ReadyProbePage,
  head: () => ({ meta: [{ title: "Ready probe · LVL" }] }),
});

function ReadyProbePage() {
  const data = Route.useLoaderData();
  return (
    <div className="space-y-4">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold">Ready / challenge_shape probe</h1>
        <p className="mt-2 text-sm text-muted">
          Aggregate ready HTTP {data.readyHttp} · ready=
          {String((data.ready as { ready?: boolean })?.ready)}
        </p>
        <Link to="/marketplace/live" className="text-xs text-accent hover:underline">
          ← Live ops
        </Link>
      </section>
      <ul className="space-y-2">
        {data.challenges.map((c) => (
          <li
            key={c.skill}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-xs"
          >
            <p className="font-mono font-semibold">
              {c.skill} · HTTP {c.status}
            </p>
            <p className="text-muted">
              maxAmountRequired={String(c.maxAmountRequired)} ({c.maxType}) · amount_usd=
              {String(c.amount_usd)} · accepts={String(c.hasAccepts)}
            </p>
            <pre className="mt-2 max-h-32 overflow-auto font-mono text-[10px] text-muted">
              {JSON.stringify(c.accepts0 || c.keys, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
      <ul className="list-disc pl-5 text-xs text-muted space-y-1">
        {data.hypothesis.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <pre className="max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
        {JSON.stringify(data.ready, null, 2)}
      </pre>
    </div>
  );
}
