import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import {
  NEXT_100,
  summarizeNext100,
  withBatchShipped,
  type StepArea,
  type StepStatus,
} from "@/lib/agent-system/next-100";
import { cn } from "@/components/ui/cn";

const AREAS: Array<StepArea | "ALL"> = [
  "ALL",
  "core",
  "agents",
  "pressure",
  "scout",
  "a11y",
  "ux",
  "perf",
  "data",
  "ship",
];

export function Next100Panel() {
  // Reflect shipped batch 41–55 as done in UI
  const steps = useMemo(() => withBatchShipped(NEXT_100), []);
  const summary = useMemo(() => summarizeNext100(steps), [steps]);
  const [area, setArea] = useState<(typeof AREAS)[number]>("ALL");
  const [status, setStatus] = useState<StepStatus | "ALL">("ALL");

  const filtered = steps.filter((s) => {
    if (area !== "ALL" && s.area !== area) return false;
    if (status !== "ALL" && s.status !== status) return false;
    return true;
  });

  return (
    <section
      id="next-100"
      className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-elevated">
            <ListChecks className="size-4 text-muted" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Next best 100 steps</h2>
            <p className="mt-1 max-w-2xl text-xs text-muted leading-relaxed">
              Product roadmap for the Control Room. Batch 41–55 shipped this turn (palette, undo,
              search, mobile bar, confirm reset, …).
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-semibold tabular">{summary.pct}%</p>
          <p className="text-[11px] text-muted">
            {summary.done} done · {summary.now} now · {summary.next} next · {summary.later} later
          </p>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${summary.pct}%` }}
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={area}
          onChange={(e) => setArea(e.target.value as typeof area)}
          className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          aria-label="Filter roadmap area"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a === "ALL" ? "All areas" : a}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          aria-label="Filter roadmap status"
        >
          <option value="ALL">All status</option>
          <option value="done">done</option>
          <option value="now">now</option>
          <option value="next">next</option>
          <option value="later">later</option>
        </select>
        <span className="self-center text-xs text-subtle">{filtered.length} shown</span>
      </div>

      <ol className="max-h-[22rem] space-y-1 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-elevated p-2">
        {filtered.map((s) => (
          <li
            key={s.id}
            className="flex min-h-11 items-start gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm"
          >
            <span className="w-8 shrink-0 font-mono text-[11px] text-subtle">{s.id}</span>
            <span className="min-w-0 flex-1">
              <span className="font-medium">{s.title}</span>
              <span className="mt-0.5 block text-[11px] text-subtle">{s.area}</span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase",
                s.status === "done" && "bg-ok/15 text-ok",
                s.status === "now" && "bg-info/15 text-info",
                s.status === "next" && "bg-warn/15 text-warn",
                s.status === "later" && "bg-elevated text-subtle border border-border",
              )}
            >
              {s.status}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
