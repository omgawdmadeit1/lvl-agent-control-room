import { createFileRoute } from "@tanstack/react-router";
import { fetchDemand } from "@/lib/agent-economy/checkout";
import { DemandBoard } from "@/components/agent-economy/DemandBoard";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/marketplace/demand")({
  loader: async () => fetchDemand(16),
  pendingComponent: () => <LoaderPending label="Loading demand signals…" />,
  pendingMs: 60,
  staleTime: 30_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: DemandPage,
  head: () => ({
    meta: [{ title: "Demand board · LVL marketplace" }],
  }),
});

function DemandPage() {
  const data = Route.useLoaderData();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link to="/marketplace/product" className="text-xs text-accent hover:underline">
          ← Product OS
        </Link>
        <Link to="/marketplace/checkout" className="text-xs text-muted hover:underline">
          Checkout
        </Link>
      </div>
      <DemandBoard skills={data.skills} note={data.note} />
    </div>
  );
}
