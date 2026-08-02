import { Pause, Play, Radar, Undo2 } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";

export function MobileActionBar() {
  const step = useAgentSystem((s) => s.step);
  const undo = useAgentSystem((s) => s.undo);
  const canUndo = useAgentSystem((s) => s.canUndo);
  const autoRun = useAgentSystem((s) => s.autoRun);
  const setAutoRun = useAgentSystem((s) => s.setAutoRun);
  const runLiveScout = useAgentSystem((s) => s.runLiveScout);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-2 backdrop-blur md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg gap-2">
        <button
          type="button"
          onClick={() => step()}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-accent text-sm font-semibold text-accent-fg"
        >
          <Play className="size-4" /> Step
        </button>
        <button
          type="button"
          onClick={() => setAutoRun(!autoRun)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-elevated text-sm font-medium"
        >
          {autoRun ? <Pause className="size-4" /> : <Play className="size-4" />}
          Auto
        </button>
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => undo()}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated disabled:opacity-40"
          aria-label="Undo"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => void runLiveScout()}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated"
          aria-label="Live scout"
        >
          <Radar className="size-4" />
        </button>
      </div>
    </div>
  );
}
