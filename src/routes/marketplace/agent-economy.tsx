import { createFileRoute } from "@tanstack/react-router";
import { loadAgentEconomySnapshot } from "@/lib/agent-economy/loaders";
import { AgentEconomyCockpit } from "@/components/agent-economy/AgentEconomyCockpit";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export type EconomySearch = { budget?: number };

function parseSearch(raw: Record<string, unknown>): EconomySearch {
  const b = raw.budget;
  const budget =
    typeof b === "number"
      ? b
      : typeof b === "string"
        ? Number(b)
        : 15;
  return { budget: Number.isFinite(budget) && budget > 0 ? budget : 15 };
}

export const Route = createFileRoute("/marketplace/agent-economy")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  loaderDeps: ({ search }: { search: EconomySearch }) => ({
    budget: search.budget ?? 15,
  }),
  loader: async ({ deps }) => loadAgentEconomySnapshot(deps.budget),
  pendingComponent: () => (
    <LoaderPending label="Loading live LVL agent economy surfaces…" />
  ),
  pendingMs: 80,
  staleTime: 45_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: EconomyPage,
  head: () => ({
    meta: [{ title: "Agent Economy Cockpit · LVL Marketplace" }],
  }),
});

function EconomyPage() {
  const data = Route.useLoaderData();
  return <AgentEconomyCockpit data={data} />;
}
