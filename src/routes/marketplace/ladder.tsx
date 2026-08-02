import { createFileRoute } from "@tanstack/react-router";
import { loadLadderSnapshot } from "@/lib/agent-economy/commerce-api";
import { ProductLadder } from "@/components/agent-economy/ProductLadder";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/ladder")({
  loader: () => loadLadderSnapshot(),
  pendingComponent: () => <LoaderPending label="Loading conversion ladder…" />,
  pendingMs: 80,
  staleTime: 45_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => <ProductLadder data={Route.useLoaderData()} />,
  head: () => ({ meta: [{ title: "Product ladder · LVL" }] }),
});
