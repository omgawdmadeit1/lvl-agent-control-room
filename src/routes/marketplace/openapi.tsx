import { createFileRoute } from "@tanstack/react-router";
import { OpenApiExplorer } from "@/components/agent-economy/OpenApiExplorer";

export const Route = createFileRoute("/marketplace/openapi")({
  component: () => <OpenApiExplorer />,
  head: () => ({ meta: [{ title: "OpenAPI · LVL" }] }),
});
