import { createFileRoute } from "@tanstack/react-router";
import { IntegrationKitPage } from "@/components/agent-economy/IntegrationKit";

export const Route = createFileRoute("/marketplace/kit")({
  component: () => <IntegrationKitPage />,
  head: () => ({ meta: [{ title: "Integration kit · LVL" }] }),
});
