import { createFileRoute } from "@tanstack/react-router";
import { AgentControlRoom } from "@/components/agent/AgentControlRoom";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <AgentControlRoom />;
}
