import { createFileRoute } from "@tanstack/react-router";
import { loadLiveOpsSnapshot } from "@/lib/agent-economy/live-ops";
import { LiveOpsCenter } from "@/components/agent-economy/LiveOpsCenter";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/live")({
  loader: () => loadLiveOpsSnapshot(),
  pendingComponent: () => <LoaderPending label="Loading live ops…" />,
  pendingMs: 60,
  staleTime: 20_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => <LiveOpsCenter data={Route.useLoaderData()} />,
  head: () => ({ meta: [{ title: "Live Ops · LVL" }] }),
});
