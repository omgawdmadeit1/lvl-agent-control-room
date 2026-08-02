import { createFileRoute } from "@tanstack/react-router";
import { AccessChecker } from "@/components/agent-economy/AccessChecker";

export const Route = createFileRoute("/marketplace/access")({
  component: () => <AccessChecker />,
  head: () => ({ meta: [{ title: "Access checker · LVL" }] }),
});
