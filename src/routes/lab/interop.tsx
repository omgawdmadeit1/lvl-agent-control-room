import { Link, createFileRoute } from "@tanstack/react-router";
import { StandardsExplorer } from "@/components/interop/StandardsExplorer";

export const Route = createFileRoute("/lab/interop")({
  component: InteropPage,
  head: () => ({
    meta: [
      { title: "Agent interoperability standards · LVL" },
      {
        name: "description",
        content:
          "MCP, A2A, x402, AP2 and how LVL LTD implements the agent interop stack",
      },
    ],
  }),
});

function InteropPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="font-semibold hover:text-accent">
              Control Room
            </Link>
            <span className="text-subtle">/</span>
            <span className="text-muted">Lab</span>
            <span className="text-subtle">/</span>
            <span>Interop standards</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/lab/router"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
            >
              Router lab
            </Link>
            <Link
              to="/skills/$packId"
              params={{ packId: "agent-to-agent-a2a-protocols" }}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            >
              A2A product
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <StandardsExplorer />
      </main>
    </div>
  );
}
