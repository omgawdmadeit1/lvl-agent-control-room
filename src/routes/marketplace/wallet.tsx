import { createFileRoute } from "@tanstack/react-router";
import { WalletReady } from "@/components/agent-economy/WalletReady";

export const Route = createFileRoute("/marketplace/wallet")({
  component: () => <WalletReady />,
  head: () => ({ meta: [{ title: "Wallet readiness · LVL" }] }),
});
