import { Link, createFileRoute } from "@tanstack/react-router";
import { LiveScoutPanel } from "@/components/agent/LiveScoutPanel";
import { useAgentSystem } from "@/lib/agent-system/store";
import { useEffect } from "react";

export const Route = createFileRoute("/ops/scout")({
  component: ScoutRoute,
  head: () => ({
    meta: [{ title: "Live scout · LVL Ops" }],
  }),
});

function ScoutRoute() {
  const hydrate = useAgentSystem((s) => s.hydrate);
  const hydrated = useAgentSystem((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Live scout route</h1>
        <Link to="/ops/health" className="text-xs text-accent hover:underline">
          ← Health
        </Link>
      </div>
      <LiveScoutPanel />
    </div>
  );
}
