import { createFileRoute } from "@tanstack/react-router";
import { MandateStudio } from "@/components/agent-economy/MandateStudio";

export const Route = createFileRoute("/marketplace/mandates")({
  component: () => <MandateStudio />,
  head: () => ({ meta: [{ title: "AP2 mandate studio · LVL" }] }),
});
