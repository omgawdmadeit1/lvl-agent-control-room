import { useEffect, useState } from "react";
import { fetchPriceHistory } from "@/lib/agent-economy/receipts";

export function PriceHistoryPanel({ skillId }: { skillId: string }) {
  const [events, setEvents] = useState<
    { at: string; price_usd?: number; [k: string]: unknown }[]
  >([]);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    let alive = true;
    void fetchPriceHistory(skillId).then((r) => {
      if (!alive) return;
      setEvents(r.events);
      setMs(r.ms);
    });
    return () => {
      alive = false;
    };
  }, [skillId]);

  if (!events.length) {
    return (
      <p className="text-[11px] text-subtle">No price history events for {skillId}</p>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3">
      <p className="text-xs font-semibold">
        Price history · {events.length} · {ms}ms
      </p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-[10px] text-muted">
        {events.map((e, i) => (
          <li key={i} className="flex justify-between gap-2 border-b border-border/50 py-0.5">
            <span>{e.at?.slice(0, 19)}</span>
            <span>${String(e.price_usd ?? e.price ?? "—")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
