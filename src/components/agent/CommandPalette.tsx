import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { activateFocusTrap } from "@/lib/agent-system/focus-trap";
import { cn } from "@/components/ui/cn";

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const step = useAgentSystem((s) => s.step);
  const undo = useAgentSystem((s) => s.undo);
  const redo = useAgentSystem((s) => s.redo);
  const chaosProbe = useAgentSystem((s) => s.chaosProbe);
  const approve = useAgentSystem((s) => s.approve);
  const autoRun = useAgentSystem((s) => s.autoRun);
  const setAutoRun = useAgentSystem((s) => s.setAutoRun);
  const runLiveScout = useAgentSystem((s) => s.runLiveScout);
  const exportRun = useAgentSystem((s) => s.exportRun);
  const flood = useAgentSystem((s) => s.flood);
  const openCircuit = useAgentSystem((s) => s.openCircuit);
  const setTopology = useAgentSystem((s) => s.setTopology);

  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: Action[] = useMemo(
    () => [
      { id: "step", label: "Step board", hint: "S", group: "Run", run: () => step() },
      {
        id: "auto",
        label: autoRun ? "Pause auto-run" : "Start auto-run",
        hint: "Space",
        group: "Run",
        run: () => setAutoRun(!autoRun),
      },
      { id: "undo", label: "Undo last change", hint: "U", group: "Run", run: () => undo() },
      { id: "redo", label: "Redo", hint: "⇧U", group: "Run", run: () => redo() },
      { id: "chaos", label: "Chaos probe (trip + flood)", group: "Pressure", run: () => chaosProbe() },
      {
        id: "nav-health",
        label: "Go to site health",
        group: "Navigate",
        run: () => document.querySelector("#site-health")?.scrollIntoView({ behavior: "smooth" }),
      },
      { id: "approve", label: "Approve ship", hint: "A", group: "Run", run: () => approve() },
      {
        id: "scout",
        label: "Run live scout",
        hint: "L",
        group: "Scout",
        run: () => void runLiveScout(),
      },
      { id: "export", label: "Export run JSON", hint: "E", group: "Data", run: () => exportRun() },
      { id: "flood", label: "Flood queue ×12", group: "Pressure", run: () => flood(12) },
      { id: "circuit", label: "Trip circuit", group: "Pressure", run: () => openCircuit() },
      {
        id: "topo-hub",
        label: "Topology: hub-spoke",
        group: "Agents",
        run: () => setTopology("hub-spoke"),
      },
      {
        id: "topo-swarm",
        label: "Topology: swarm",
        group: "Agents",
        run: () => setTopology("swarm"),
      },
      {
        id: "topo-pipe",
        label: "Topology: pipeline",
        group: "Agents",
        run: () => setTopology("pipeline"),
      },
      ...(
        [
          ["#main-board", "Go to board"],
          ["#live-scout", "Go to live scout"],
          ["#observability", "Go to observability"],
          ["#backpressure", "Go to backpressure"],
          ["#next-100", "Go to next 100 roadmap"],
          ["#drawer-code", "Go to drawer code"],
          ["#settings", "Go to settings"],
          ["#keyboard-shortcuts", "Go to shortcuts"],
          ["#a11y-standards", "Go to a11y standards"],
          ["#wcag22-criteria", "Go to WCAG 2.2"],
        ] as const
      ).map(([href, label]) => ({
        id: `nav-${href}`,
        label,
        group: "Navigate",
        run: () => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      })),
    ],
    [
      step,
      undo,
      redo,
      chaosProbe,
      approve,
      autoRun,
      setAutoRun,
      runLiveScout,
      exportRun,
      flood,
      openCircuit,
      setTopology,
    ],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(needle) ||
        a.group.toLowerCase().includes(needle) ||
        a.id.includes(needle),
    );
  }, [actions, q]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const handle = activateFocusTrap(rootRef.current, {
      initialFocus: inputRef.current,
    });
    return () => handle.deactivate();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(Math.max(filtered.length - 1, 0), i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const a = filtered[active];
        if (a) {
          a.run();
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        aria-label="Close command palette"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-2xl"
      >
        <label className="flex h-12 items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-subtle" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Type a command…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
            aria-label="Filter commands"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:inline">
            esc
          </kbd>
        </label>
        <ul className="max-h-[min(50vh,22rem)] overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">No matches</li>
          ) : (
            filtered.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    a.run();
                    onClose();
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm",
                    i === active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/60",
                  )}
                >
                  <span>
                    <span className="text-[10px] uppercase tracking-wide text-subtle">{a.group}</span>
                    <span className="mt-0.5 block font-medium text-fg">{a.label}</span>
                  </span>
                  {a.hint && (
                    <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-subtle">
                      {a.hint}
                    </kbd>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
