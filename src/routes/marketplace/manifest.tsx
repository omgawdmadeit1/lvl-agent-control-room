import { createFileRoute } from "@tanstack/react-router";
import { ManifestPage } from "@/components/agent-economy/ManifestPage";

export const Route = createFileRoute("/marketplace/manifest")({
  component: () => <ManifestPage />,
  head: () => ({ meta: [{ title: "Control Room manifest" }] }),
});
