import { createFileRoute } from "@tanstack/react-router";
import { PayUnlock } from "@/components/agent-economy/PayUnlock";

export type PaySearch = { skill?: string };

function parseSearch(raw: Record<string, unknown>): PaySearch {
  return {
    skill: typeof raw.skill === "string" ? raw.skill : "agent-x402-first-buy",
  };
}

export const Route = createFileRoute("/marketplace/pay")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  component: () => {
    const { skill } = Route.useSearch();
    return <PayUnlock initialSkill={skill || "agent-x402-first-buy"} />;
  },
  head: () => ({ meta: [{ title: "Pay & unlock · browser wallet" }] }),
});
