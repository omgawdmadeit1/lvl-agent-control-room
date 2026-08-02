import { createFileRoute } from "@tanstack/react-router";
import { McpConsole } from "@/components/agent-economy/McpConsole";

export const Route = createFileRoute("/marketplace/mcp")({
  component: () => <McpConsole />,
  head: () => ({ meta: [{ title: "MCP console · LVL" }] }),
});
