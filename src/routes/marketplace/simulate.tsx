import { createFileRoute } from "@tanstack/react-router";
import { BuyerSimulator } from "@/components/agent-economy/BuyerSimulator";

export const Route = createFileRoute("/marketplace/simulate")({
  component: () => <BuyerSimulator />,
  head: () => ({ meta: [{ title: "Buyer agent simulator · LVL" }] }),
});
