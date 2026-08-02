import { createFileRoute } from "@tanstack/react-router";
import { ReceiptVault } from "@/components/agent-economy/ReceiptVault";

export const Route = createFileRoute("/marketplace/receipts")({
  component: () => <ReceiptVault />,
  head: () => ({ meta: [{ title: "Receipt vault · LVL" }] }),
});
