import { createFileRoute } from "@tanstack/react-router";
import { CredentialsPanel } from "@/components/agent-economy/CredentialsPanel";

export const Route = createFileRoute("/marketplace/credentials")({
  component: () => <CredentialsPanel />,
  head: () => ({ meta: [{ title: "Buyer credentials · LVL" }] }),
});
