import { createFileRoute } from "@tanstack/react-router";
import { loadProductSnapshot } from "@/lib/agent-economy/product-loader";
import { AgentProductOS } from "@/components/agent-economy/AgentProductOS";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export type ProductSearch = { skills?: string };

function parseSearch(raw: Record<string, unknown>): ProductSearch {
  const s = raw.skills;
  return { skills: typeof s === "string" && s.length ? s : undefined };
}

export const Route = createFileRoute("/marketplace/product")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  loaderDeps: ({ search }: { search: ProductSearch }) => ({
    skills: search.skills,
  }),
  loader: async ({ deps }) => {
    const skills = deps.skills
      ? deps.skills.split(",").map((x) => x.trim()).filter(Boolean)
      : undefined;
    return loadProductSnapshot(skills);
  },
  pendingComponent: () => (
    <LoaderPending label="Loading LVL full-service product surfaces…" />
  ),
  pendingMs: 80,
  staleTime: 40_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "Agent Product OS · LVL full-service marketplace" },
      {
        name: "description",
        content:
          "Full commercial product for agents: cart, x402, recipes, profit model, fleet, sellers",
      },
    ],
  }),
});

function ProductPage() {
  const data = Route.useLoaderData();
  return <AgentProductOS data={data} />;
}
