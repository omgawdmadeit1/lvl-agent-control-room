import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAgentSystem } from "@/lib/agent-system/store";

const PRESSURE_SCORE: Record<string, number> = {
  normal: 1,
  elevated: 2,
  high: 3,
  critical: 4,
};

export function ObservabilityPanel() {
  const history = useAgentSystem((s) => s.backpressure.history);
  const metrics = useAgentSystem((s) => s.metrics);
  const bp = useAgentSystem((s) => s.backpressure);

  const data = [...history].reverse().map((h, i) => ({
    i,
    t: h.t.slice(11, 19),
    queue: h.queueDepth,
    inFlight: h.inFlight,
    pressure: PRESSURE_SCORE[h.pressure] ?? 0,
  }));

  return (
    <section id="observability" className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Observability</h2>
          <p className="mt-1 text-xs text-muted">
            Queue depth and pressure over recent ticks · {metrics.tasksDone}/{metrics.tasksTotal}{" "}
            tasks · circuit {bp.circuit}
          </p>
        </div>
      </div>
      {data.length < 2 ? (
        <p className="text-sm text-muted">
          Step the board or flood the queue to populate pressure history.
        </p>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fill: "var(--color-subtle)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 10 }} width={28} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="queue"
                name="Queue"
                stroke="var(--color-info)"
                fill="var(--color-info)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pressure"
                name="Pressure score"
                stroke="var(--color-warn)"
                fill="var(--color-warn)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
