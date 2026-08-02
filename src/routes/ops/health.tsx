import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteHealthPanel } from "@/components/agent/SiteHealthPanel";
import { useAgentSystem } from "@/lib/agent-system/store";
import { useEffect } from "react";

export const Route = createFileRoute("/ops/health")({
  component: HealthRoute,
  head: () => ({
    meta: [{ title: "Site health · LVL Ops" }],
  }),
});

function HealthRoute() {
  const hydrate = useAgentSystem((s) => s.hydrate);
  const hydrated = useAgentSystem((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Site health route</h1>
        <Link to="/ops/scout" className="text-xs text-accent hover:underline">
          Open scout →
        </Link>
      </div>
      <SiteHealthPanel />
    </div>
  );
}
