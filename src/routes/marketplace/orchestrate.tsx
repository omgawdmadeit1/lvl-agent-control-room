import { createFileRoute } from "@tanstack/react-router";
import { OrchestrateStudio } from "@/components/agent-economy/OrchestrateStudio";

export const Route = createFileRoute("/marketplace/orchestrate")({
  component: () => <OrchestrateStudio />,
  head: () => ({ meta: [{ title: "Orchestrate swarm · LVL" }] }),
});
