import { createFileRoute } from "@tanstack/react-router";
import { loadProtocolsLive } from "@/lib/agent-economy/protocols-live";
import { ProtocolsLive } from "@/components/agent-economy/ProtocolsLive";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/protocols")({
  loader: () => loadProtocolsLive(),
  pendingComponent: () => <LoaderPending label="Loading protocol surfaces…" />,
  staleTime: 40_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => <ProtocolsLive data={Route.useLoaderData()} />,
  head: () => ({ meta: [{ title: "Protocols · MCP A2A AP2 x402" }] }),
});
