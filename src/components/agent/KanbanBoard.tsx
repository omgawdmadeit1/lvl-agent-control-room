import type { BoardTask, TaskStatus } from "@/lib/agent-system/types";
import { cn } from "@/components/ui/cn";

const COLS: { id: TaskStatus | "OTHER"; label: string; match: (s: TaskStatus) => boolean }[] = [
  { id: "READY", label: "Ready", match: (s) => s === "READY" },
  { id: "RUNNING", label: "Running", match: (s) => s === "RUNNING" },
  { id: "DEFERRED", label: "Deferred", match: (s) => s === "DEFERRED" || s === "BLOCKED" },
  { id: "PENDING", label: "Pending", match: (s) => s === "PENDING" },
  { id: "DONE", label: "Done", match: (s) => s === "DONE" },
];

export function KanbanBoard({
  tasks,
  onOpen,
  compact,
}: {
  tasks: BoardTask[];
  onOpen: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex max-w-full gap-3 overflow-x-auto overscroll-x-contain pb-2 -mx-1 px-1">
      {COLS.map((col) => {
        const items = tasks.filter((t) => col.match(t.status));
        return (
          <div
            key={col.id}
            className="min-w-[140px] w-[70vw] max-w-[200px] shrink-0 flex-1 rounded-[var(--radius-lg)] border border-border bg-elevated p-2 sm:min-w-[160px]"
          >
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">
              {col.label} · {items.length}
            </p>
            <ul className="mt-2 space-y-2">
              {items.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(t.id)}
                    className={cn(
                      "w-full rounded-[var(--radius-md)] border border-border bg-surface text-left transition hover:border-subtle",
                      compact ? "p-2" : "p-3",
                    )}
                  >
                    <p className="font-mono text-[10px] text-subtle">
                      {t.id} · {t.priority}
                    </p>
                    <p className={cn("font-medium leading-snug", compact ? "text-xs" : "text-sm")}>
                      {t.title}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">{t.role}</p>
                  </button>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-1 py-4 text-center text-[11px] text-subtle">Empty</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
