import { useEffect, useState } from "react";
import { fetchStatusHistory } from "@/lib/agent-economy/receipts";

export function StatusHistoryStrip() {
  const [summary, setSummary] = useState<string>("");
  useEffect(() => {
    void fetchStatusHistory().then((r) => {
      const paths = (r.data?.paths || {}) as Record<
        string,
        { samples?: number; ok_rate?: number; hours?: number }
      >;
      const pay = paths["/api/pay"];
      const parts = Object.entries(paths)
        .slice(0, 6)
        .map(([k, v]) => `${k}: n=${(v as { sample_count?: number }).sample_count ?? "?"}`);
      setSummary(
        pay
          ? `status-history ${r.ms}ms · /api/pay tracked · ${parts.join(" · ")}`
          : `status-history ${r.ms}ms · ${parts.join(" · ") || JSON.stringify(r.data).slice(0, 120)}`,
      );
    });
  }, []);
  if (!summary) return null;
  return (
    <p className="rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 font-mono text-[10px] text-muted">
      {summary}
    </p>
  );
}
