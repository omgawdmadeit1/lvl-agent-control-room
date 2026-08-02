import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadAuditor } from "@/lib/agent-economy/swarm";

export function AuditorBadge() {
  const [grade, setGrade] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => {
    void loadAuditor().then((r) => {
      setGrade(String(r.data?.grade ?? "?"));
      setScore(Number(r.data?.score ?? 0));
    });
  }, []);
  if (!grade) return null;
  return (
    <Link
      to="/marketplace/auditor"
      className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-ok/40 bg-ok/10 px-3 text-xs font-semibold text-ok"
    >
      Auditor {grade} · {score}
    </Link>
  );
}
