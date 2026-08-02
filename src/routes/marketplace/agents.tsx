import { createFileRoute } from "@tanstack/react-router";
import { loadAgentDirectory } from "@/lib/agent-economy/growth";
import { AgentDirectory } from "@/components/agent-economy/AgentDirectory";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export type AgentsSearch = { q?: string };

function parseSearch(raw: Record<string, unknown>): AgentsSearch {
  return { q: typeof raw.q === "string" ? raw.q : undefined };
}

export const Route = createFileRoute("/marketplace/agents")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  loaderDeps: ({ search }: { search: AgentsSearch }) => ({ q: search.q || "" }),
  loader: async ({ deps }) => loadAgentDirectory(48, deps.q),
  pendingComponent: () => <LoaderPending label="Loading agent directory…" />,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: AgentsPage,
  head: () => ({ meta: [{ title: "Agent directory · LVL" }] }),
});

function AgentsPage() {
  const data = Route.useLoaderData();
  const { q } = Route.useSearch();
  return (
    <AgentDirectory
      agents={data.agents}
      count={data.count}
      ms={data.ms}
      initialQ={q || ""}
    />
  );
}
