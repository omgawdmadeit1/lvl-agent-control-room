import { createFileRoute } from "@tanstack/react-router";
import { SdkPlayground } from "@/components/agent-economy/SdkPlayground";

export const Route = createFileRoute("/marketplace/sdk")({
  component: () => <SdkPlayground />,
  head: () => ({ meta: [{ title: "SDK playground · LVL" }] }),
});
