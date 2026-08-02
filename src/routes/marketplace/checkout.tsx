import { createFileRoute } from "@tanstack/react-router";
import { CheckoutWizard } from "@/components/agent-economy/CheckoutWizard";

export type CheckoutSearch = { skill?: string };

function parseSearch(raw: Record<string, unknown>): CheckoutSearch {
  const s = raw.skill;
  return {
    skill: typeof s === "string" && s.length > 0 ? s : "agent-x402-first-buy",
  };
}

export const Route = createFileRoute("/marketplace/checkout")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Agent checkout wizard · LVL x402" },
      {
        name: "description",
        content: "Guided multi-step agent purchase: outline, cart, 402, unlock, proof",
      },
    ],
  }),
});

function CheckoutPage() {
  const { skill } = Route.useSearch();
  return <CheckoutWizard initialSkill={skill || "agent-x402-first-buy"} />;
}
