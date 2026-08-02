import { createFileRoute } from "@tanstack/react-router";
import { MARKETPLACE_RAILS } from "@/lib/marketplace/rails";
import { RailsDiagram } from "@/components/marketplace/RailsDiagram";

export const Route = createFileRoute("/marketplace/rails")({
  component: RailsPage,
  head: () => ({ meta: [{ title: "Commerce rails · LVL Marketplace" }] }),
});

function RailsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Six-rail product model</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Discovery → Negotiation → Sandbox → x402 → Oracles → Governance. Each rail is a product
          surface on lvlltd.com and a backlog item for the Control Room swarm.
        </p>
      </div>
      <RailsDiagram rails={MARKETPLACE_RAILS} />
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Build opportunities</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>Formal ranking weights on discovery (freshness × trust × completion).</li>
          <li>done_when schemas on negotiation for multi-agent handoffs.</li>
          <li>Spend caps + allowance checks in sandbox before high-ticket unlocks.</li>
          <li>Multi-oracle proof for packs above a USDC threshold.</li>
          <li>Hash-chained proof export for governance audits.</li>
        </ul>
      </section>
    </div>
  );
}
