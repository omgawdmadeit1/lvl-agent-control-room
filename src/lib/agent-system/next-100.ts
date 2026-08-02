/**
 * Next-best 100 build steps for LVL Agent Control Room.
 */
export type StepStatus = "done" | "now" | "next" | "later";
export type StepArea =
  | "core"
  | "agents"
  | "pressure"
  | "scout"
  | "a11y"
  | "ux"
  | "perf"
  | "data"
  | "ship";

export type BuildStep = {
  id: number;
  title: string;
  area: StepArea;
  status: StepStatus;
  note?: string;
};

export const NEXT_100: BuildStep[] = [
  { id: 1, title: "Scaffold TanStack Start Control Room", area: "core", status: "done" },
  { id: 2, title: "Hub-spoke multi-agent roles", area: "agents", status: "done" },
  { id: 3, title: "Focus-four action board (P0–P3)", area: "agents", status: "done" },
  { id: 4, title: "Tick engine + task lifecycle", area: "core", status: "done" },
  { id: 5, title: "Ship approval gate", area: "agents", status: "done" },
  { id: 6, title: "Topology switcher hub/pipeline/swarm", area: "agents", status: "done" },
  { id: 7, title: "Swarm fan-out + collapse", area: "agents", status: "done" },
  { id: 8, title: "Backpressure admit gate", area: "pressure", status: "done" },
  { id: 9, title: "Queue high/low water marks", area: "pressure", status: "done" },
  { id: 10, title: "Circuit breaker", area: "pressure", status: "done" },
  { id: 11, title: "Token bucket rate limit", area: "pressure", status: "done" },
  { id: 12, title: "Hierarchical role bulkheads", area: "pressure", status: "done" },
  { id: 13, title: "Flood / tighten demos", area: "pressure", status: "done" },
  { id: 14, title: "Backpressure code examples", area: "ux", status: "done" },
  { id: 15, title: "Token bucket explorer + examples", area: "ux", status: "done" },
  { id: 16, title: "Live scout suite (lvlltd.com)", area: "scout", status: "done" },
  { id: 17, title: "Apply scout → board/rails", area: "scout", status: "done" },
  { id: 18, title: "Auto-apply scout pref", area: "scout", status: "done" },
  { id: 19, title: "Observability pressure chart", area: "data", status: "done" },
  { id: 20, title: "localStorage run persistence", area: "data", status: "done" },
  { id: 21, title: "Export run JSON", area: "data", status: "done" },
  { id: 22, title: "Run report MD/JSON", area: "data", status: "done" },
  { id: 23, title: "Task dependency graph", area: "ux", status: "done" },
  { id: 24, title: "Artifact browser + search", area: "ux", status: "done" },
  { id: 25, title: "Activity timeline", area: "ux", status: "done" },
  { id: 26, title: "Settings knobs for BP", area: "ux", status: "done" },
  { id: 27, title: "Keyboard shortcuts catalog", area: "a11y", status: "done" },
  { id: 28, title: "Shortcut help overlay (?)", area: "a11y", status: "done" },
  { id: 29, title: "A11y standards explorer", area: "a11y", status: "done" },
  { id: 30, title: "WCAG 2.2 criteria catalog", area: "a11y", status: "done" },
  { id: 31, title: "Live heuristic a11y audit", area: "a11y", status: "done" },
  { id: 32, title: "SC 2.5.8 target size minimum", area: "a11y", status: "done" },
  { id: 33, title: "Skip link + landmarks", area: "a11y", status: "done" },
  { id: 34, title: "Quick nav (multiple ways)", area: "a11y", status: "done" },
  { id: 35, title: "Hotkey disable (2.1.4)", area: "a11y", status: "done" },
  { id: 36, title: "Reduce motion pref", area: "a11y", status: "done" },
  { id: 37, title: "Task detail drawer", area: "ux", status: "done" },
  { id: 38, title: "Drawer code snippets", area: "ux", status: "done" },
  { id: 39, title: "Focus trap + focus return", area: "a11y", status: "done" },
  { id: 40, title: "Board filters (priority/status)", area: "ux", status: "done" },
  { id: 41, title: "Command palette (⌘/Ctrl+K)", area: "ux", status: "done" },
  { id: 42, title: "Undo last step", area: "core", status: "done" },
  { id: 43, title: "Confirm reset dialog", area: "ux", status: "done" },
  { id: 44, title: "Task text search", area: "ux", status: "done" },
  { id: 45, title: "Role filter on board", area: "ux", status: "done" },
  { id: 46, title: "Mobile sticky action bar", area: "ux", status: "done" },
  { id: 47, title: "Next-100 roadmap panel", area: "core", status: "done" },
  { id: 48, title: "Copy task ID from drawer", area: "ux", status: "done" },
  { id: 49, title: "Palette jump to sections", area: "ux", status: "done" },
  { id: 50, title: "Auto-pause auto-run on circuit open", area: "pressure", status: "done" },
  { id: 51, title: "Shortcut: U undo, K palette", area: "a11y", status: "done" },
  { id: 52, title: "Empty-state when filters match nothing", area: "ux", status: "done" },
  { id: 53, title: "Run progress ring in header", area: "ux", status: "done" },
  { id: 54, title: "Toast on undo / reset cancel", area: "ux", status: "done" },
  { id: 55, title: "Mark batch 41–55 complete in roadmap", area: "core", status: "done" },
  { id: 56, title: "Redo stack", area: "core", status: "done" },
  { id: 57, title: "Multi-run history browser", area: "data", status: "next" },
  { id: 58, title: "Compare two scout runs", area: "scout", status: "next" },
  { id: 59, title: "Pin artifacts", area: "data", status: "next" },
  { id: 60, title: "Role detail drawer", area: "agents", status: "next" },
  { id: 61, title: "Rail health sparkline", area: "data", status: "next" },
  { id: 62, title: "Keyboard topology cycle (T)", area: "agents", status: "done" },
  { id: 63, title: "Density mode compact/comfy", area: "ux", status: "done" },
  { id: 64, title: "Export PDF-friendly print CSS", area: "data", status: "next" },
  { id: 65, title: "Import run JSON", area: "data", status: "done" },
  { id: 66, title: "Offline catalog cache indicator", area: "scout", status: "next" },
  { id: 67, title: "Simulated tool latency slider", area: "pressure", status: "next" },
  { id: 68, title: "Per-role concurrent caps UI", area: "pressure", status: "next" },
  { id: 69, title: "Budget burn chart", area: "pressure", status: "next" },
  { id: 70, title: "GCRA mode alongside token bucket", area: "pressure", status: "next" },
  { id: 71, title: "Agent transcript export", area: "agents", status: "next" },
  { id: 72, title: "Board kanban columns by status", area: "ux", status: "done" },
  { id: 73, title: "Drag-reorder with keyboard alt (2.5.7)", area: "a11y", status: "next" },
  { id: 74, title: "High-contrast theme tokens", area: "a11y", status: "done" },
  { id: 75, title: "Screen-reader tour script", area: "a11y", status: "next" },
  { id: 76, title: "E2E Playwright suite in CI", area: "ship", status: "later" },
  { id: 77, title: "Visual regression snapshots", area: "ship", status: "later" },
  { id: 78, title: "axe-core in browser smoke", area: "a11y", status: "later" },
  { id: 79, title: "Lighthouse CI budget", area: "perf", status: "later" },
  { id: 80, title: "Code-split heavy panels", area: "perf", status: "later" },
  { id: 81, title: "Virtualize long logs", area: "perf", status: "later" },
  { id: 82, title: "Service worker for shell", area: "perf", status: "later" },
  { id: 83, title: "Real x402 pay flow sandbox", area: "scout", status: "later" },
  { id: 84, title: "Webhook oracle simulator", area: "agents", status: "later" },
  { id: 85, title: "Marketplace listing writer agent", area: "agents", status: "later" },
  { id: 86, title: "Seal.listing rewrite PR generator", area: "ship", status: "done" },
  { id: 87, title: "Catalog slim byte budget alarm", area: "perf", status: "later" },
  { id: 88, title: "VPAT draft exporter", area: "a11y", status: "later" },
  { id: 89, title: "i18n shell (en first)", area: "ux", status: "later" },
  { id: 90, title: "Timezone-aware log formatting", area: "ux", status: "later" },
  { id: 91, title: "Collaborative read-only share link", area: "data", status: "later" },
  { id: 92, title: "SSO-gated ship approvals", area: "ship", status: "later" },
  { id: 93, title: "Audit hash-chain export", area: "data", status: "later" },
  { id: 94, title: "OpenTelemetry span export", area: "data", status: "later" },
  { id: 95, title: "Cost model $ per unlock", area: "data", status: "later" },
  { id: 96, title: "Agent skill pack installer", area: "agents", status: "later" },
  { id: 97, title: "Chaos: random probe failures", area: "pressure", status: "done" },
  { id: 98, title: "SLA dashboard for rails", area: "data", status: "later" },
  { id: 99, title: "Production build SSR smoke gate", area: "ship", status: "later" },
  { id: 100, title: "Ship Control Room v1 release notes", area: "ship", status: "later" },

  { id: 201, title: "Marketplace overview route (live catalog thesis)", area: "product", status: "done" },
  { id: 202, title: "Catalog browser with agent-style filters", area: "product", status: "done" },
  { id: 203, title: "Live x402 challenge inspector", area: "product", status: "done" },
  { id: 204, title: "Six-rail agent commerce diagram", area: "product", status: "done" },
  { id: 205, title: "Skill detail + sealed-pack unlock path", area: "product", status: "done" },
];

export function summarizeNext100(steps: BuildStep[] = NEXT_100) {
  const done = steps.filter((s) => s.status === "done").length;
  const now = steps.filter((s) => s.status === "now").length;
  const next = steps.filter((s) => s.status === "next").length;
  const later = steps.filter((s) => s.status === "later").length;
  return {
    done,
    now,
    next,
    later,
    total: steps.length,
    pct: Math.round((done / steps.length) * 100),
  };
}

export function withBatchShipped(steps: BuildStep[] = NEXT_100): BuildStep[] {
  return steps;
}
