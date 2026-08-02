import { createFileRoute } from "@tanstack/react-router";
import { loadShelfSnapshot } from "@/lib/agent-economy/growth";
import { PremiumShelf } from "@/components/agent-economy/PremiumShelf";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/shelf")({
  loader: () => loadShelfSnapshot(),
  pendingComponent: () => <LoaderPending label="Loading premium shelf…" />,
  staleTime: 45_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => <PremiumShelf data={Route.useLoaderData()} />,
  head: () => ({ meta: [{ title: "Premium shelf · LVL" }] }),
});
