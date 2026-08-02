import { useAgentSystem } from "@/lib/agent-system/store";
import { cn } from "@/components/ui/cn";

export function ActivityTimeline() {
  const log = useAgentSystem((s) => s.log);

  return (
    <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold">Activity timeline</h2>
      <p className="mt-1 text-xs text-muted">Newest first · full event stream</p>
      <ol className="mt-4 space-y-0">
        {log.slice(0, 40).map((l, i) => (
          <li key={`${l.t}-${i}`} className="flex gap-3">
            <div className="flex w-4 flex-col items-center">
              <span
                className={cn(
                  "mt-1.5 size-2.5 shrink-0 rounded-full",
                  l.level === "ok" && "bg-ok",
                  l.level === "warn" && "bg-warn",
                  l.level === "err" && "bg-danger",
                  l.level === "info" && "bg-subtle",
                )}
              />
              {i < Math.min(39, log.length - 1) && (
                <span className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className="min-w-0 pb-4">
              <p className="font-mono text-[10px] text-subtle">{l.t.replace("T", " ").slice(0, 19)}</p>
              <p
                className={cn(
                  "text-sm leading-snug",
                  l.level === "ok" && "text-ok",
                  l.level === "warn" && "text-warn",
                  l.level === "err" && "text-danger",
                )}
              >
                {l.msg}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
