import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Circle,
  GitBranch,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Shield,
  Ship,
  Square,
  Workflow,
  Download,
  Radar,
  FolderOpen,
  Filter,
  Undo2,
  Search,
} from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { SWARM_PATTERNS } from "@/lib/agent-system/engine";
import { BackpressureCodeExamples } from "@/components/agent/BackpressureCodeExamples";
import { TokenBucketExplorer } from "@/components/agent/TokenBucketExplorer";
import { LiveScoutPanel } from "@/components/agent/LiveScoutPanel";
import { ObservabilityPanel } from "@/components/agent/ObservabilityPanel";
import { TaskDependencyGraph } from "@/components/agent/TaskDependencyGraph";
import { RunReportPanel } from "@/components/agent/RunReportPanel";
import { SettingsPanel } from "@/components/agent/SettingsPanel";
import { ActivityTimeline } from "@/components/agent/ActivityTimeline";
import { ArtifactBrowser } from "@/components/agent/ArtifactBrowser";
import {
  KeyboardShortcutDocs,
  KeyboardShortcutHelp,
} from "@/components/agent/KeyboardShortcutDocs";
import { A11yStandardsPanel } from "@/components/agent/A11yStandardsPanel";
import { Wcag22CriteriaPanel } from "@/components/agent/Wcag22CriteriaPanel";
import { SkipLink, QuickNav } from "@/components/agent/AppChrome";
import { TaskDetailDrawer } from "@/components/agent/TaskDetailDrawer";
import { DrawerCodeExamples } from "@/components/agent/DrawerCodeExamples";
import { CommandPalette } from "@/components/agent/CommandPalette";
import { Next100Panel } from "@/components/agent/Next100Panel";
import { SiteHealthPanel } from "@/components/agent/SiteHealthPanel";
import { KanbanBoard } from "@/components/agent/KanbanBoard";
import { ConfirmDialog } from "@/components/agent/ConfirmDialog";
import { MobileActionBar } from "@/components/agent/MobileActionBar";
import { ProgressRing } from "@/components/agent/ProgressRing";
import type { BoardTask } from "@/lib/agent-system/types";
import { isTypingTarget, SHORTCUT_FOOTER } from "@/lib/agent-system/shortcuts";
import type { RoleId, TaskStatus } from "@/lib/agent-system/types";
import { cn } from "@/components/ui/cn";

const ROLE_ICON: Record<RoleId, typeof Bot> = {
  conductor: Workflow,
  scout: Activity,
  builder: Bot,
  reviewer: Shield,
  shipper: Ship,
  auditor: Shield,
  operator: GitBranch,
};

function statusColor(s: TaskStatus | string) {
  if (s === "DONE" || s === "done" || s === "live") return "text-ok";
  if (s === "RUNNING" || s === "working" || s === "partial") return "text-info";
  if (s === "BLOCKED" || s === "blocked" || s === "gap") return "text-danger";
  if (s === "READY" || s === "QUEUED") return "text-warn";
  if (s === "DEFERRED") return "text-danger";
  return "text-muted";
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "DONE" || status === "done" || status === "live"
          ? "bg-ok"
          : status === "RUNNING" || status === "working" || status === "partial"
            ? "bg-info animate-pulse"
            : status === "BLOCKED" || status === "blocked" || status === "gap"
              ? "bg-danger"
              : status === "READY"
                ? "bg-warn"
                : "bg-subtle",
      )}
    />
  );
}

export function AgentControlRoom() {
  const s = useAgentSystem();
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "P0" | "P1" | "P2" | "P3">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [taskQuery, setTaskQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | RoleId>("ALL");
  const selectedTask = s.tasks.find((task) => task.id === selectedTaskId) ?? null;

  useEffect(() => {
    s.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      const prefs = useAgentSystem.getState().prefs;
      // WCAG 2.1.4: single-key shortcuts can be disabled in Settings
      if (!prefs.keyboardShortcuts) return;
      // Help: ? or /
      if (e.key === "?" || e.key === "/") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (helpOpen || artifactOpen || paletteOpen || confirmReset) return;
      if (e.key === "Escape" && selectedTaskId) {
        e.preventDefault();
        setSelectedTaskId(null);
        return;
      }
      // Cmd/Ctrl+K always opens palette when shortcuts on
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        useAgentSystem.getState().undo();
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        useAgentSystem.getState().step();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        useAgentSystem.getState().approve();
      } else if (e.key === " ") {
        e.preventDefault();
        const st = useAgentSystem.getState();
        st.setAutoRun(!st.autoRun);
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        void useAgentSystem.getState().runLiveScout();
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        useAgentSystem.getState().exportRun();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setArtifactOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen, artifactOpen, selectedTaskId, paletteOpen, confirmReset]);

  useEffect(() => {
    if (!s.autoRun || s.status === "COMPLETE" || s.status === "PAUSED") return;
    const preferReduce =
      s.prefs.reduceMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const delay = preferReduce ? 1600 : 900;
    const id = setInterval(() => {
      const st = useAgentSystem.getState();
      if (st.status === "COMPLETE") {
        st.setAutoRun(false);
        return;
      }
      const blocked = st.tasks.some(
        (task) => task.requiresApproval && task.status === "READY" && !task.approvalId,
      );
      if (blocked) {
        st.setAutoRun(false);
        return;
      }
      st.step();
    }, delay);
    return () => clearInterval(id);
  }, [s.autoRun, s.status, s.prefs.reduceMotion]);

  const progress = useMemo(() => {
    const total = s.metrics.tasksTotal || 1;
    return Math.round((s.metrics.tasksDone / total) * 100);
  }, [s.metrics]);

  const filteredTasks = useMemo(() => {
    const needle = taskQuery.trim().toLowerCase();
    return s.tasks.filter((task) => {
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (roleFilter !== "ALL" && task.role !== roleFilter) return false;
      if (!needle) return true;
      return (
        task.id.toLowerCase().includes(needle) ||
        task.title.toLowerCase().includes(needle) ||
        task.detail.toLowerCase().includes(needle) ||
        task.role.toLowerCase().includes(needle)
      );
    });
  }, [s.tasks, priorityFilter, statusFilter, roleFilter, taskQuery]);

  return (
    <div className={`min-h-dvh bg-bg text-fg${s.prefs.reduceMotion ? " motion-reduce" : ""}${s.prefs.highContrast ? " high-contrast" : ""}${s.prefs.density === "compact" ? " density-compact" : ""}`}>
      <SkipLink />
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="a11y-status-live">
        {s.status} · {s.metrics.tasksDone}/{s.metrics.tasksTotal} tasks · pressure {s.backpressure.pressure}
        {s.liveScout.status === "running" ? " · live scout running" : ""}
        {s.backpressure.circuit === "open" ? " · circuit open" : ""}
      </div>
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ProgressRing value={progress} size={48} />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">LVL Agent System</p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Control Room</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Hub-spoke multi-agent ops for lvlltd.com — focus-four board live.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm font-medium"
              title="Command palette (K)"
              aria-label="Command palette"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Palette</span>
            </button>
            <button
              type="button"
              onClick={() => s.undo()}
              disabled={!s.canUndo}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm font-medium disabled:opacity-40"
              title="Undo (U)"
              aria-label="Undo"
            >
              <Undo2 className="size-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => s.redo()}
              disabled={!s.canRedo}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm font-medium disabled:opacity-40"
              title="Redo (Shift+U)"
              aria-label="Redo"
            >
              <span className="text-xs font-semibold">Redo</span>
            </button>
            <button
              type="button"
              onClick={() => s.step()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg transition hover:opacity-90"
            >
              <Play className="size-4" /> Step
            </button>
            <button
              type="button"
              onClick={() => s.setAutoRun(!s.autoRun)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium transition hover:bg-surface"
            >
              {s.autoRun ? <Pause className="size-4" /> : <Play className="size-4" />}
              {s.autoRun ? "Pause auto" : "Auto-run"}
            </button>
            <button
              type="button"
              onClick={() => s.approve()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
            >
              <CheckCircle2 className="size-4" /> Approve ship
            </button>
            <button
              type="button"
              onClick={() => void s.runLiveScout()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
            >
              <Radar className="size-4" /> Live scout
            </button>
            <button
              type="button"
              onClick={() => setArtifactOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
            >
              <FolderOpen className="size-4" /> Artifacts
            </button>
            <button
              type="button"
              onClick={() => s.exportRun()}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
            >
              <Download className="size-4" /> Export
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts help"
            >
              ?
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border px-4 text-sm text-muted"
            >
              <RefreshCw className="size-4" /> Reset
            </button>
          </div>
        </div>
      </header>
      <QuickNav />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 overflow-x-clip px-4 py-4 outline-none lg:grid-cols-12"
      >
        {/* Stats */}
        <section className="col-span-full grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Run status", value: s.status, mono: true },
            { label: "Progress", value: `${progress}%`, mono: true },
            { label: "Artifacts", value: String(s.metrics.artifacts), mono: true },
            { label: "P0 open", value: String(s.metrics.p0Open), mono: true },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-4"
            >
              <p className="text-xs text-subtle">{m.label}</p>
              <p className={cn("mt-1 text-2xl font-semibold tabular", m.mono && "font-mono")}>{m.value}</p>
            </div>
          ))}
        </section>

        <SiteHealthPanel />

        <LiveScoutPanel />

        <TaskDependencyGraph />

        <ObservabilityPanel />

        <RunReportPanel />

        <SettingsPanel />

        <ActivityTimeline />

        <Next100Panel />

        <DrawerCodeExamples />

        <KeyboardShortcutDocs />

        <A11yStandardsPanel />

        <Wcag22CriteriaPanel />

        {/* Backpressure */}
        <section id="backpressure" className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Backpressure</h2>
              <p className="mt-1 text-xs text-muted">
                Queue depth, admit gate, token budgets, fan-out caps, circuit breaker.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => s.flood(12)}
                className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
              >
                Flood queue ×12
              </button>
              <button
                type="button"
                onClick={() => s.openCircuit()}
                className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
              >
                Trip circuit
              </button>
            <button
              type="button"
              onClick={() => s.chaosProbe()}
              className="min-target h-11 rounded-[var(--radius-md)] border border-danger/40 bg-elevated px-3 text-xs font-medium text-danger"
            >
              Chaos probe
            </button>
            <label className="inline-flex h-11 min-target cursor-pointer items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium">
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      s.importRun(JSON.parse(String(reader.result)));
                    } catch {
                      /* toast in store */
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
            </label>
              <button
                type="button"
                onClick={() => s.patchBackpressure({ maxConcurrent: 1, maxFanOut: 1 })}
                className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
              >
                Tighten (1)
              </button>
              <button
                type="button"
                onClick={() => s.patchBackpressure({ maxConcurrent: 3, maxFanOut: 4, globalTokenBudget: 60 })}
                className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
              >
                Relax
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {[
              { label: "Pressure", value: s.backpressure.pressure },
              { label: "Queue depth", value: String(s.backpressure.queueDepth) },
              { label: "In flight", value: String(s.backpressure.inFlight) },
              {
                label: "Tokens",
                value: `${s.backpressure.globalTokensUsed}/${s.backpressure.config.globalTokenBudget}`,
              },
              { label: "Admit", value: s.backpressure.admitting ? "open" : "closed" },
              { label: "Circuit", value: s.backpressure.circuit },
            ].map((m) => (
              <div key={m.label} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3">
                <p className="text-xs text-subtle">{m.label}</p>
                <p
                  className={cn(
                    "mt-1 font-mono text-lg font-semibold capitalize",
                    m.label === "Pressure" && s.backpressure.pressure === "critical" && "text-danger",
                    m.label === "Pressure" && s.backpressure.pressure === "high" && "text-warn",
                    m.label === "Pressure" && s.backpressure.pressure === "normal" && "text-ok",
                    m.label === "Circuit" && s.backpressure.circuit === "open" && "text-danger",
                    m.label === "Admit" && !s.backpressure.admitting && "text-warn",
                  )}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs text-muted">
              <p className="font-medium text-fg">Last decision</p>
              <p className="mt-1 font-mono">{s.backpressure.lastDecision}</p>
              <p className="mt-2">
                deferred={s.backpressure.deferredTotal} · rejected={s.backpressure.rejectedTotal} ·
                maxConcurrent={s.backpressure.config.maxConcurrent} · maxFanOut=
                {s.backpressure.config.maxFanOut} · Hi/Lo water=
                {s.backpressure.config.highWaterMark}/{s.backpressure.config.lowWaterMark}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-xs font-medium text-fg mb-2">Role budgets (used / max)</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {s.roles.map((r) => {
                  const pct = Math.min(100, Math.round((r.tokenUsed / Math.max(1, r.tokenBudget)) * 100));
                  return (
                    <div key={r.id}>
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>{r.title}</span>
                        <span className="font-mono tabular">
                          {r.tokenUsed}/{r.tokenBudget}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct >= 90 ? "bg-danger" : pct >= 60 ? "bg-warn" : "bg-accent",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <TokenBucketExplorer />

        <BackpressureCodeExamples />

        {/* Goal + audit + topology */}
        <section className="lg:col-span-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Mission</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">{s.goal}</p>
          <div className="mt-4 grid gap-2">
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-xs text-subtle">Run ID</p>
              <p className="font-mono text-xs break-all">{s.runId}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-xs text-subtle">Auditor</p>
              <p className="text-sm">
                <span className={s.audit.goNoGo === "go" ? "text-ok" : "text-danger"}>
                  {s.audit.goNoGo.toUpperCase()}
                </span>
                <span className="text-muted"> · risk {s.audit.riskScore}</span>
              </p>
              <p className="mt-1 text-xs text-muted">{s.audit.notes}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
              <p className="text-xs text-subtle mb-2">Topology</p>
              <div className="flex flex-wrap gap-2">
                {(["hub-spoke", "pipeline", "swarm"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => s.setTopology(t)}
                    className={cn(
                      "hit-area-chip rounded-full border px-3 text-xs font-medium",
                      s.topology === t
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border text-muted hover:text-fg",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-subtle">
              <span>Board progress</span>
              <span className="tabular">
                {s.metrics.tasksDone}/{s.metrics.tasksTotal}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Swarm patterns explorer */}
        <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Swarm agent patterns</h2>
              <p className="mt-1 text-xs text-muted">
                Select <span className="text-fg">swarm</span> topology + Auto-run to live fan-out read-only probes, then collapse for writes.
              </p>
            </div>
            <p className="text-xs font-mono text-subtle">topology: {s.topology}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SWARM_PATTERNS.map((p) => (
              <article
                key={p.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border border-border bg-elevated p-4",
                  p.id === "never-swarm" && "border-danger/40",
                  s.topology === "swarm" && p.id !== "never-swarm" && "border-info/40",
                )}
              >
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="mt-2 text-xs text-muted"><span className="text-subtle">When · </span>{p.when}</p>
                <p className="mt-1 text-xs text-muted"><span className="text-subtle">How · </span>{p.how}</p>
                <p className="mt-1 text-xs text-muted"><span className="text-subtle">Risk · </span>{p.risk}</p>
                <p className="mt-2 text-xs text-fg/90"><span className="text-subtle">LVL · </span>{p.lvlltd}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="lg:col-span-8 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Agent roster</h2>
            <p className="text-xs text-subtle">Hub-spoke · least privilege</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {s.roles.map((r) => {
              const Icon = ROLE_ICON[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => s.focusRole(r.id)}
                  className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4 text-left transition hover:border-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-[var(--radius-sm)] border border-border bg-surface">
                        <Icon className="size-4 text-muted" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="text-xs text-subtle font-mono">{r.toolProfile}</p>
                      </div>
                    </div>
                    <StatusDot status={r.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted leading-relaxed">{r.mission}</p>
                  {r.lastAction && (
                    <p className="mt-2 line-clamp-2 text-xs text-fg/80">{r.lastAction}</p>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-subtle">
                    budget {r.tokenUsed}/{r.tokenBudget}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Task board */}
        <section id="main-board" className="col-span-full min-w-0 lg:col-span-7 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Action board</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Filter className="size-3.5 text-subtle" />
              <label className="flex h-11 min-w-[10rem] flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-2 sm:max-w-[14rem]">
                <Search className="size-3.5 text-subtle" />
                <input
                  value={taskQuery}
                  onChange={(e) => setTaskQuery(e.target.value)}
                  placeholder="Search tasks…"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-subtle"
                  aria-label="Search tasks"
                />
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="min-target h-11 min-w-[6.5rem] rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
                aria-label="Filter by role"
              >
                <option value="ALL">All roles</option>
                <option value="conductor">conductor</option>
                <option value="scout">scout</option>
                <option value="builder">builder</option>
                <option value="reviewer">reviewer</option>
                <option value="shipper">shipper</option>
                <option value="auditor">auditor</option>
                <option value="operator">operator</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="min-target h-11 min-w-[6.5rem] rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
              >
                <option value="ALL">All priority</option>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="min-target h-11 min-w-[6.5rem] rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
              >
                <option value="ALL">All status</option>
                <option value="READY">READY</option>
                <option value="PENDING">PENDING</option>
                <option value="DEFERRED">DEFERRED</option>
                <option value="DONE">DONE</option>
                <option value="RUNNING">RUNNING</option>
              </select>
              <span className="text-subtle">{filteredTasks.length}/{s.tasks.length}</span>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No tasks match filters. Clear search or change priority/status/role.
            </p>
          ) : s.prefs.boardView === "kanban" ? (
            <KanbanBoard
              tasks={filteredTasks}
              onOpen={setSelectedTaskId}
              compact={s.prefs.density === "compact"}
            />
          ) : null}
          {s.prefs.boardView === "list" && (
          <ul className="space-y-2">
            {filteredTasks.map((taskItem) => (
              <li key={taskItem.id}>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(taskItem.id)}
                  className="w-full rounded-[var(--radius-lg)] border border-border bg-elevated p-3 text-left transition hover:border-subtle sm:p-4"
                >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-subtle">{taskItem.id}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        {taskItem.priority}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                        {taskItem.role}
                      </span>
                      {taskItem.requiresApproval && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-warn">
                          needs approval
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium">{taskItem.title}</p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{taskItem.detail}</p>
                    {taskItem.result && <p className="mt-2 text-xs text-ok">{taskItem.result}</p>}
                    {taskItem.deferredReason && (
                      <p className="mt-1 text-xs text-danger">Deferred: {taskItem.deferredReason}</p>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-subtle">cost {taskItem.cost} tok</p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusColor(taskItem.status))}>
                    {taskItem.status === "DONE" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : taskItem.status === "RUNNING" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : taskItem.status === "READY" ? (
                      <Circle className="size-3.5" />
                    ) : (
                      <Square className="size-3.5" />
                    )}
                    {taskItem.status}
                  </div>
                </div>
                </button>
              </li>
            ))}
          </ul>
          )}
        </section>

        {/* Rails + artifacts + log */}
        <section className="col-span-full min-w-0 lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold">Six rails</h2>
            <ul className="space-y-2">
              {s.rails.map((r) => (
                <li key={r.id} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-elevated p-3">
                  <StatusDot status={r.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {r.name}{" "}
                      <span className={cn("text-xs font-normal uppercase", statusColor(r.status))}>
                        {r.status}
                      </span>
                    </p>
                    <p className="text-xs text-muted">{r.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold">Artifacts ({s.artifacts.length})</h2>
            {s.artifacts.length === 0 ? (
              <p className="text-sm text-muted">Step the board to produce audit policies, fixes, and ship packets.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {s.artifacts.map((a) => (
                  <li key={a.id} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
                    <p className="text-xs text-subtle">
                      {a.type} · {a.role}
                    </p>
                    <p className="text-sm font-medium">{a.title}</p>
                    <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-muted">
                      {a.body}
                    </pre>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold">Event log</h2>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto font-mono text-[11px]">
              {s.log.map((l, i) => (
                <li key={i} className="flex gap-2 text-muted">
                  <span className="shrink-0 text-subtle">{l.t.slice(11, 19)}</span>
                  <span
                    className={cn(
                      l.level === "ok" && "text-ok",
                      l.level === "warn" && "text-warn",
                      l.level === "err" && "text-danger",
                    )}
                  >
                    {l.msg}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 pb-24 text-center text-xs text-subtle md:pb-6">
        {SHORTCUT_FOOTER}
      </footer>
      <MobileActionBar />
      <ArtifactBrowser open={artifactOpen} onClose={() => setArtifactOpen(false)} />
      <KeyboardShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTaskId(null)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ConfirmDialog
        open={confirmReset}
        title="Reset agent system?"
        body="This clears the board, undo stack, and saved browser state. This cannot be undone."
        confirmLabel="Reset everything"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          s.reset();
        }}
      />
    </div>
  );
}
