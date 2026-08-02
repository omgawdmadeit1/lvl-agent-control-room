import { useEffect, useId, useRef } from "react";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";
import type { BoardTask } from "@/lib/agent-system/types";
import { activateFocusTrap } from "@/lib/agent-system/focus-trap";
import { cn } from "@/components/ui/cn";

export function TaskDetailDrawer({
  task,
  onClose,
}: {
  task: BoardTask | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const open = task !== null;

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  // Focus trap + restore focus to opener
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const handle = activateFocusTrap(panelRef.current, {
      initialFocus: closeRef.current,
    });
    return () => handle.deactivate();
  }, [open, task?.id]);

  // Body scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        aria-label="Close task detail"
        tabIndex={-1}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={`Task ${task.id}`}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="font-mono text-[11px] text-subtle">{task.id}</p>
            <h2 id={titleId} className="text-base font-semibold leading-snug">
              {task.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(task.id).then(
                  () => toast.success(`Copied ${task.id}`),
                  () => toast.error("Copy failed"),
                );
              }}
              aria-label={`Copy task id ${task.id}`}
              className="hit-area-icon rounded-[var(--radius-md)] border border-border"
            >
              <Copy className="size-4" />
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close task detail"
              className="hit-area-icon rounded-[var(--radius-md)] border border-border"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-border px-2 py-1">{task.status}</span>
            <span className="rounded-full border border-border px-2 py-1">{task.priority}</span>
            <span className="rounded-full border border-border px-2 py-1">{task.role}</span>
            <span className="rounded-full border border-border px-2 py-1 font-mono">
              cost {task.cost}
            </span>
            {task.requiresApproval && (
              <span className="rounded-full border border-warn/40 px-2 py-1 text-warn">
                needs approval
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Detail</h3>
            <p className="mt-1 text-sm text-muted leading-relaxed">{task.detail}</p>
          </div>
          {task.dependsOn.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Depends on</h3>
              <p className="mt-1 font-mono text-sm">{task.dependsOn.join(", ")}</p>
            </div>
          )}
          {task.deferredReason && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Deferred</h3>
              <p className="mt-1 text-sm text-danger">{task.deferredReason}</p>
            </div>
          )}
          {task.result && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Result</h3>
              <p className="mt-1 text-sm text-ok leading-relaxed">{task.result}</p>
            </div>
          )}
          {task.approvalId && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Approval</h3>
              <p className="mt-1 font-mono text-sm">{task.approvalId}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Work log</h3>
            <ul className="mt-2 space-y-1.5">
              {task.workLog.length === 0 ? (
                <li className="text-sm text-muted">No entries yet.</li>
              ) : (
                task.workLog.map((line, i) => (
                  <li
                    key={i}
                    className={cn(
                      "rounded-[var(--radius-sm)] border border-border bg-elevated px-2 py-1.5 font-mono text-[11px] text-muted",
                    )}
                  >
                    {line}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
