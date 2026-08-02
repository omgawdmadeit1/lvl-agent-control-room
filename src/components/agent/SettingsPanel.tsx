import { useAgentSystem } from "@/lib/agent-system/store";

function NumField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block rounded-[var(--radius-md)] border border-border bg-elevated p-3">
      <span className="text-xs text-muted">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 min-h-11 w-full bg-transparent font-mono text-sm outline-none"
      />
    </label>
  );
}

export function SettingsPanel() {
  const cfg = useAgentSystem((s) => s.backpressure.config);
  const patch = useAgentSystem((s) => s.patchBackpressure);
  const prefs = useAgentSystem((s) => s.prefs);
  const setPrefs = useAgentSystem((s) => s.setPrefs);

  return (
    <section id="settings" className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold">Settings</h2>
      <p className="mt-1 text-xs text-muted">Backpressure knobs and control-room preferences</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumField
          label="Max concurrent"
          value={cfg.maxConcurrent}
          min={1}
          max={8}
          onChange={(n) => patch({ maxConcurrent: n })}
        />
        <NumField
          label="Max fan-out"
          value={cfg.maxFanOut}
          min={1}
          max={12}
          onChange={(n) => patch({ maxFanOut: n })}
        />
        <NumField
          label="High water mark"
          value={cfg.highWaterMark}
          min={1}
          max={30}
          onChange={(n) => patch({ highWaterMark: n })}
        />
        <NumField
          label="Low water mark"
          value={cfg.lowWaterMark}
          min={0}
          max={20}
          onChange={(n) => patch({ lowWaterMark: n })}
        />
        <NumField
          label="Global token budget"
          value={cfg.globalTokenBudget}
          min={5}
          max={200}
          onChange={(n) => patch({ globalTokenBudget: n })}
        />
        <NumField
          label="Circuit failure threshold"
          value={cfg.circuitFailureThreshold}
          min={1}
          max={10}
          onChange={(n) => patch({ circuitFailureThreshold: n })}
        />
        <NumField
          label="Circuit cooldown ticks"
          value={cfg.circuitCooldownTicks}
          min={1}
          max={20}
          onChange={(n) => patch({ circuitCooldownTicks: n })}
        />
        <NumField
          label="Max queue depth"
          value={cfg.maxQueueDepth}
          min={2}
          max={50}
          onChange={(n) => patch({ maxQueueDepth: n })}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.autoApplyScout}
            onChange={(e) => setPrefs({ autoApplyScout: e.target.checked })}
            className="accent-accent"
          />
          Auto-apply live scout to board
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.toasts}
            onChange={(e) => setPrefs({ toasts: e.target.checked })}
            className="accent-accent"
          />
          Toast notifications
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.keyboardShortcuts}
            onChange={(e) => setPrefs({ keyboardShortcuts: e.target.checked })}
            className="accent-accent"
          />
          Keyboard shortcuts (WCAG 2.1.4)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.reduceMotion}
            onChange={(e) => setPrefs({ reduceMotion: e.target.checked })}
            className="accent-accent"
          />
          Reduce motion
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={prefs.highContrast}
            onChange={(e) => setPrefs({ highContrast: e.target.checked })}
            className="accent-accent"
          />
          High contrast
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Density</span>
          <select
            value={prefs.density}
            onChange={(e) => setPrefs({ density: e.target.value as "comfy" | "compact" })}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          >
            <option value="comfy">Comfy</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Board</span>
          <select
            value={prefs.boardView}
            onChange={(e) => setPrefs({ boardView: e.target.value as "list" | "kanban" })}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          >
            <option value="list">List</option>
            <option value="kanban">Kanban</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-muted">
        Turning off keyboard shortcuts disables single-key hotkeys (S/A/L/E/F/Space). Help (?) still works when shortcuts are on.
      </p>
    </section>
  );
}
