import { createFileRoute } from "@tanstack/react-router";
import { loadLadderSnapshot } from "@/lib/agent-economy/commerce-api";
import { SellerHub } from "@/components/agent-economy/SellerHub";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/sell")({
  loader: () => loadLadderSnapshot(),
  pendingComponent: () => <LoaderPending label="Loading seller surfaces…" />,
  pendingMs: 80,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => <SellerHub data={Route.useLoaderData()} />,
  head: () => ({ meta: [{ title: "Seller hub · LVL" }] }),
});
