import { createFileRoute } from "@tanstack/react-router";
import { IntentSearch } from "@/components/agent-economy/IntentSearch";

export const Route = createFileRoute("/marketplace/intent")({
  component: () => <IntentSearch />,
  head: () => ({ meta: [{ title: "Intent search · LVL" }] }),
});
