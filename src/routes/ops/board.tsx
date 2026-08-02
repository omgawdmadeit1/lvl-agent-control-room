import { useEffect, useMemo } from "react";
import {
  Link,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useAgentSystem } from "@/lib/agent-system/store";
import { parseBoardSearch } from "@/lib/router/search";
import { cn } from "@/components/ui/cn";

export const Route = createFileRoute("/ops/board")({
  validateSearch: (search) => parseBoardSearch(search),
  component: BoardRoute,
  head: () => ({
    meta: [{ title: "Board · LVL Ops" }],
  }),
});

function BoardRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/ops/board" });
  const tasks = useAgentSystem((s) => s.tasks);
  const hydrate = useAgentSystem((s) => s.hydrate);
  const hydrated = useAgentSystem((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const filtered = useMemo(() => {
    const needle = (search.q || "").trim().toLowerCase();
    return tasks.filter((task) => {
      if (search.priority && search.priority !== "ALL" && task.priority !== search.priority)
        return false;
      if (search.status && search.status !== "ALL" && task.status !== search.status) return false;
      if (search.role && search.role !== "ALL" && task.role !== search.role) return false;
      if (!needle) return true;
      return (
        task.id.toLowerCase().includes(needle) ||
        task.title.toLowerCase().includes(needle) ||
        task.detail.toLowerCase().includes(needle)
      );
    });
  }, [tasks, search]);

  function patchSearch(patch: Partial<typeof search>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Action board</h1>
          <p className="mt-1 text-xs text-muted">
            Filters live in the URL via{" "}
            <code className="text-fg">validateSearch</code> +{" "}
            <code className="text-fg">navigate(&#123; search &#125;)</code>.
          </p>
        </div>
        <Link to="/" className="text-xs text-accent hover:underline">
          ← Full Control Room
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-3">
        <label className="flex h-11 min-w-[12rem] flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-2">
          <span className="sr-only">Search</span>
          <input
            value={search.q || ""}
            onChange={(e) => patchSearch({ q: e.target.value })}
            placeholder="Search tasks…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </label>
        <select
          value={search.priority || "ALL"}
          onChange={(e) =>
            patchSearch({ priority: e.target.value as NonNullable<typeof search.priority> })
          }
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Priority"
        >
          {["ALL", "P0", "P1", "P2", "P3"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={search.status || "ALL"}
          onChange={(e) =>
            patchSearch({ status: e.target.value as NonNullable<typeof search.status> })
          }
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Status"
        >
          {["ALL", "READY", "PENDING", "RUNNING", "DEFERRED", "DONE", "BLOCKED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={search.role || "ALL"}
          onChange={(e) =>
            patchSearch({ role: e.target.value as NonNullable<typeof search.role> })
          }
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Role"
        >
          {[
            "ALL",
            "conductor",
            "scout",
            "builder",
            "reviewer",
            "shipper",
            "auditor",
            "operator",
          ].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <p className="font-mono text-[11px] text-subtle">
        /ops/board?q={encodeURIComponent(search.q || "")}&priority={search.priority || "ALL"}
        &status={search.status || "ALL"}&role={search.role || "ALL"}
      </p>

      <ul className="space-y-2">
        {filtered.map((task) => {
          const selected = search.task === task.id;
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() =>
                  patchSearch({ task: selected ? undefined : task.id })
                }
                className={cn(
                  "w-full rounded-[var(--radius-lg)] border p-3 text-left transition",
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface hover:border-subtle",
                )}
              >
                <p className="font-mono text-[10px] text-subtle">
                  {task.id} · {task.priority} · {task.status} · {task.role}
                </p>
                <p className="text-sm font-medium">{task.title}</p>
                {selected && (
                  <p className="mt-2 text-xs text-muted leading-relaxed">{task.detail}</p>
                )}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-[var(--radius-lg)] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No tasks match URL search.{" "}
            <button
              type="button"
              className="text-accent underline"
              onClick={() =>
                patchSearch({ q: "", priority: "ALL", status: "ALL", role: "ALL", task: undefined })
              }
            >
              Clear filters
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
