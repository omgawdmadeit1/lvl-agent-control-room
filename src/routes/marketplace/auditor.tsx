import { createFileRoute } from "@tanstack/react-router";
import { loadAuditor } from "@/lib/agent-economy/swarm";
import { AuditorDesk } from "@/components/agent-economy/AuditorDesk";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/auditor")({
  loader: async () => {
    const r = await loadAuditor();
    return { data: r.data || {}, ms: r.ms };
  },
  pendingComponent: () => <LoaderPending label="Running public auditor…" />,
  staleTime: 30_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => {
    const { data, ms } = Route.useLoaderData();
    return <AuditorDesk data={data} ms={ms} />;
  },
  head: () => ({ meta: [{ title: "Auditor desk · LVL" }] }),
});
