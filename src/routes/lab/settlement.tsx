import { Link, createFileRoute } from "@tanstack/react-router";
import { SettlementIntelligence } from "@/components/settlement/SettlementIntelligence";

export const Route = createFileRoute("/lab/settlement")({
  component: SettlementPage,
  head: () => ({
    meta: [
      {
        title: "Tokenized settlement intelligence · LVL",
      },
      {
        name: "description",
        content:
          "BIS Project Agorá + XRPL 3.3.0 distilled into agent settlement patterns and simulators",
      },
    ],
  }),
});

function SettlementPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="font-semibold hover:text-accent">
              Control Room
            </Link>
            <span className="text-subtle">/</span>
            <Link to="/lab/interop" className="text-muted hover:text-fg">
              Lab
            </Link>
            <span className="text-subtle">/</span>
            <span>Settlement intelligence</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/lab/interop"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
            >
              Interop
            </Link>
            <a
              href="https://x.com/i/trending/2083623212202823882"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            >
              X trend ↗
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <SettlementIntelligence />
      </main>
    </div>
  );
}
