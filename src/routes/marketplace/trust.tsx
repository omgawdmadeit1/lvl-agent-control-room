import { createFileRoute } from "@tanstack/react-router";
import {
  loadEvalSummary,
  loadSecuritySummary,
  loadTrustTop,
} from "@/lib/agent-economy/protocols-live";
import { TrustLab } from "@/components/agent-economy/TrustLab";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/trust")({
  loader: async () => {
    const [trust, security, evalS] = await Promise.all([
      loadTrustTop(15),
      loadSecuritySummary(),
      loadEvalSummary(),
    ]);
    return { trust, security: security.data, evalData: evalS.data };
  },
  pendingComponent: () => <LoaderPending label="Loading trust signals…" />,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: () => {
    const d = Route.useLoaderData();
    return (
      <TrustLab trust={d.trust} security={d.security} evalData={d.evalData} />
    );
  },
  head: () => ({ meta: [{ title: "Trust lab · LVL" }] }),
});
