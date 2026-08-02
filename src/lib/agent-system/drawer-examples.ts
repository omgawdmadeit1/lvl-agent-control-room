import type { CodeExample } from "./backpressure-examples";

export const DRAWER_EXAMPLES: CodeExample[] = [
  {
    id: "props",
    title: "1. Props & open state",
    summary: "Controlled drawer: null task means closed; parent owns selected id.",
    language: "ts",
    code: `type BoardTask = {
  id: string;
  title: string;
  detail: string;
  status: string;
  priority: string;
  role: string;
  cost: number;
  dependsOn: string[];
  workLog: string[];
  result?: string;
  deferredReason?: string;
  requiresApproval?: boolean;
  approvalId?: string;
};

type TaskDetailDrawerProps = {
  task: BoardTask | null; // null → do not render
  onClose: () => void;
};

// Parent
const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
const selectedTask =
  tasks.find((t) => t.id === selectedTaskId) ?? null;

return (
  <>
    <button type="button" onClick={() => setSelectedTaskId("P0.1")}>
      Open P0.1
    </button>
    <TaskDetailDrawer
      task={selectedTask}
      onClose={() => setSelectedTaskId(null)}
    />
  </>
);`,
  },
  {
    id: "shell",
    title: "2. Shell layout (a11y)",
    summary: "Fullscreen scrim + right rail dialog with name, Esc, 44px close.",
    language: "ts",
    code: `export function TaskDetailDrawer({ task, onClose }: TaskDetailDrawerProps) {
  useEffect(() => {
    if (!task) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Scrim — also a button for pointer + keyboard name */}
      <button
        type="button"
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        aria-label="Close task detail"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={\`Task \${task.id}\`}
        className="relative z-10 flex h-full w-full max-w-md flex-col
                   border-l border-border bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3
                           border-b border-border px-4 py-3">
          <div>
            <p className="font-mono text-[11px] text-subtle">{task.id}</p>
            <h2 className="text-base font-semibold">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task detail"
            className="hit-area-icon rounded-md border border-border"
          >
            {/* 44×44 min target (WCAG 2.5.8 / 2.5.5 comfort) */}
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
          {/* body sections */}
        </div>
      </aside>
    </div>
  );
}`,
  },
  {
    id: "body",
    title: "3. Body sections",
    summary: "Status chips, detail, deps, deferred, result, approval, work log.",
    language: "ts",
    code: `function DrawerBody({ task }: { task: BoardTask }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-[11px]">
        <Chip>{task.status}</Chip>
        <Chip>{task.priority}</Chip>
        <Chip>{task.role}</Chip>
        <Chip mono>cost {task.cost}</Chip>
        {task.requiresApproval && (
          <Chip tone="warn">needs approval</Chip>
        )}
      </div>

      <Section title="Detail">{task.detail}</Section>

      {task.dependsOn.length > 0 && (
        <Section title="Depends on">
          <p className="font-mono text-sm">{task.dependsOn.join(", ")}</p>
        </Section>
      )}

      {task.deferredReason && (
        <Section title="Deferred">
          <p className="text-sm text-danger">{task.deferredReason}</p>
        </Section>
      )}

      {task.result && (
        <Section title="Result">
          <p className="text-sm text-ok">{task.result}</p>
        </Section>
      )}

      {task.approvalId && (
        <Section title="Approval">
          <p className="font-mono text-sm">{task.approvalId}</p>
        </Section>
      )}

      <Section title="Work log">
        <ul className="space-y-1.5">
          {task.workLog.length === 0 ? (
            <li className="text-sm text-muted">No entries yet.</li>
          ) : (
            task.workLog.map((line, i) => (
              <li
                key={i}
                className="rounded-sm border border-border bg-elevated
                           px-2 py-1.5 font-mono text-[11px] text-muted"
              >
                {line}
              </li>
            ))
          )}
        </ul>
      </Section>
    </div>
  );
}`,
  },
  {
    id: "board-open",
    title: "4. Open from board row",
    summary: "Each action-board row is a full-width button that sets selectedTaskId.",
    language: "ts",
    code: `// Action board list
<ul className="space-y-2">
  {filteredTasks.map((taskItem) => (
    <li key={taskItem.id}>
      <button
        type="button"
        onClick={() => setSelectedTaskId(taskItem.id)}
        className="w-full rounded-lg border border-border bg-elevated
                   p-3 text-left transition hover:border-subtle sm:p-4"
      >
        <span className="font-mono text-xs text-subtle">{taskItem.id}</span>
        <p className="mt-1 text-sm font-medium">{taskItem.title}</p>
        <p className="mt-1 text-xs text-muted">{taskItem.detail}</p>
        <span className="mt-2 inline-block text-xs">{taskItem.status}</span>
      </button>
    </li>
  ))}
</ul>

// Global Esc while drawer open (optional; drawer also listens)
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && selectedTaskId) {
      setSelectedTaskId(null);
    }
  }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [selectedTaskId]);`,
  },
  {
    id: "focus-trap",
    title: "5. Focus trap (live)",
    summary: "Implemented: Tab cycles inside dialog; Esc closes; focus returns to opener.",
    language: "ts",
    code: `// src/lib/agent-system/focus-trap.ts
export function activateFocusTrap(root: HTMLElement, options?: {
  initialFocus?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
}) {
  const previouslyFocused =
    options?.returnFocus ??
    (document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null);

  const focusable = () =>
    Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);

  // Initial focus (close button)
  requestAnimationFrame(() => {
    (options?.initialFocus ?? focusable()[0] ?? root).focus({ preventScroll: true });
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const list = focusable();
    if (!list.length) {
      e.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && (active === first || !root.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onFocusIn(e: FocusEvent) {
    if (root.contains(e.target as Node)) return;
    (focusable()[0] ?? root).focus({ preventScroll: true });
  }

  root.addEventListener("keydown", onKeyDown);
  document.addEventListener("focusin", onFocusIn);

  return {
    deactivate() {
      root.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    },
  };
}

// TaskDetailDrawer
useEffect(() => {
  if (!open || !panelRef.current) return;
  const handle = activateFocusTrap(panelRef.current, {
    initialFocus: closeRef.current,
  });
  return () => handle.deactivate();
}, [open, task?.id]);`,
  },
  {
    id: "portable",
    title: "6. Portable drawer primitive",
    summary: "Drop-in generic right-rail drawer for any title/body.",
    language: "ts",
    code: `export function SideDrawer({
  open,
  title,
  label,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative z-10 flex h-full w-full max-w-md flex-col
                   border-l bg-white shadow-xl dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="inline-grid size-11 place-items-center rounded-md border">
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

// Task specialization
<SideDrawer
  open={!!task}
  title={task?.title ?? ""}
  label={task ? \`Task \${task.id}\` : "Task"}
  onClose={onClose}
>
  {task && <DrawerBody task={task} />}
</SideDrawer>`,
  },
];
