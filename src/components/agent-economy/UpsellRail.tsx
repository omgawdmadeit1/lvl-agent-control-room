import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadRecommendations, type RecItem } from "@/lib/agent-economy/growth";

export function UpsellRail({ skillId }: { skillId: string }) {
  const [recs, setRecs] = useState<RecItem[]>([]);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    let alive = true;
    void loadRecommendations(skillId).then((r) => {
      if (!alive) return;
      setRecs(r.recommendations.slice(0, 6));
      setMs(r.ms);
    });
    return () => {
      alive = false;
    };
  }, [skillId]);

  if (!recs.length) return null;

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Recommended next skills</h2>
      <p className="text-[11px] text-subtle">from /api/recommendations · {ms}ms</p>
      <ul className="mt-3 space-y-2">
        {recs.map((r) => (
          <li
            key={r.skill_id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-2 py-2 text-xs"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{r.name}</p>
              <p className="font-mono text-[10px] text-subtle">
                {r.skill_id} · score {r.score ?? "—"}
              </p>
              {r.reasons && (
                <p className="text-muted">{r.reasons.slice(0, 2).join(" · ")}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono">${r.price_usd}</span>
              <Link
                to="/marketplace/checkout"
                search={{ skill: r.skill_id }}
                className="text-accent hover:underline"
              >
                add
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
