import { useMemo } from "react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { cn } from "@/components/ui/cn";
import type { TaskStatus } from "@/lib/agent-system/types";

function statusClass(s: TaskStatus) {
  if (s === "DONE") return "border-ok/50 bg-ok/10 text-ok";
  if (s === "RUNNING") return "border-info/50 bg-info/10 text-info";
  if (s === "DEFERRED" || s === "BLOCKED") return "border-danger/40 bg-danger/10 text-danger";
  if (s === "READY") return "border-warn/40 bg-warn/10 text-warn";
  return "border-border bg-elevated text-muted";
}

export function TaskDependencyGraph() {
  const tasks = useAgentSystem((s) => s.tasks);

  const layout = useMemo(() => {
    // Simple column by priority then dependency depth
    const depth = new Map<string, number>();
    const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
    function d(id: string, seen = new Set<string>()): number {
      if (depth.has(id)) return depth.get(id)!;
      if (seen.has(id)) return 0;
      seen.add(id);
      const t = byId[id];
      if (!t || !t.dependsOn.length) {
        depth.set(id, 0);
        return 0;
      }
      const v = 1 + Math.max(...t.dependsOn.map((x) => d(x, seen)));
      depth.set(id, v);
      return v;
    }
    tasks.forEach((t) => d(t.id));
    const maxD = Math.max(0, ...[...depth.values()]);
    const cols: typeof tasks[] = Array.from({ length: maxD + 1 }, () => []);
    const sorted = [...tasks].sort((a, b) => a.id.localeCompare(b.id));
    for (const t of sorted) {
      cols[depth.get(t.id) || 0].push(t);
    }
    const edges = tasks.flatMap((t) =>
      t.dependsOn.map((from) => ({ from, to: t.id })),
    );
    return { cols, edges, maxD };
  }, [tasks]);

  return (
    <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Task dependency graph</h2>
          <p className="mt-1 text-xs text-muted">
            Columns = dependency depth · edges listed below · color = status
          </p>
        </div>
        <p className="font-mono text-[11px] text-subtle">{layout.edges.length} edges</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {layout.cols.map((col, i) => (
          <div key={i} className="min-w-[140px] flex-1 space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-subtle">Depth {i}</p>
            {col.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "rounded-[var(--radius-md)] border px-2.5 py-2 text-xs",
                  statusClass(t.status),
                )}
              >
                <p className="font-mono text-[10px] opacity-80">{t.id}</p>
                <p className="mt-0.5 font-medium leading-snug text-fg">{t.title}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {t.role} · {t.status}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {layout.edges.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {layout.edges.map((e) => (
            <li
              key={`${e.from}->${e.to}`}
              className="rounded-full border border-border bg-elevated px-2.5 py-1 font-mono text-[10px] text-muted"
            >
              {e.from} → {e.to}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
