import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { runOrchestrate } from "@/lib/agent-economy/swarm";
import { cn } from "@/components/ui/cn";

export function OrchestrateStudio() {
  const [goal, setGoal] = useState(
    "Buy first x402 skill under 1 dollar and set up payment retry",
  );
  const [budget, setBudget] = useState(5);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [ms, setMs] = useState(0);
  const [status, setStatus] = useState(0);
  const [history, setHistory] = useState<{ at: string; goal: string; job_id?: string }[]>([]);

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem("lvl-orch-history-v1") || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  async function run() {
    setBusy(true);
    try {
      const r = await runOrchestrate(goal, budget);
      setResult(r.data || null);
      setMs(r.ms);
      setStatus(r.status);
      const job = (r.data?.job || r.data) as { job_id?: string };
      const entry = { at: new Date().toISOString(), goal, job_id: job?.job_id };
      const next = [entry, ...history].slice(0, 20);
      setHistory(next);
      localStorage.setItem("lvl-orch-history-v1", JSON.stringify(next));
    } finally {
      setBusy(false);
    }
  }

  const job = (result?.job || result) as {
    job_id?: string;
    status?: string;
    steps?: {
      step: number;
      role?: string;
      skill_id?: string;
      description?: string;
      challenge?: string;
      status?: string;
    }[];
    payment_split?: Record<string, unknown>;
  };

  const steps = Array.isArray(job?.steps) ? job.steps : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Swarm planner
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Orchestrate</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          POST live <code className="text-fg">/api/orchestrate</code> — LVL decomposes a goal into
          skill steps, roles, challenges, and budget split. Execute steps via Pay & unlock.
        </p>
        <label className="mt-4 block text-xs">
          <span className="text-muted">Goal</span>
          <textarea
            className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-sm outline-none"
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        <label className="mt-2 block text-xs max-w-xs">
          <span className="text-muted">Budget USD</span>
          <input
            type="number"
            className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </label>
        <button
          type="button"
          disabled={busy || !goal.trim()}
          onClick={() => void run()}
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
        >
          {busy ? "Planning…" : "Plan swarm job"}
        </button>
      </section>

      {history.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Recent plans (local)</h2>
          <ul className="mt-2 space-y-1 font-mono text-[10px] text-muted">
            {history.map((h, i) => (
              <li key={i}>
                {h.at.slice(0, 19)} · {h.job_id || "—"} · {h.goal.slice(0, 60)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p className="font-mono text-[11px] text-subtle">
            HTTP {status} · {ms}ms · job {job?.job_id} · {job?.status}
          </p>
          <ol className="mt-4 space-y-3">
            {steps.map((s) => (
              <li
                key={s.step}
                className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3 text-xs"
              >
                <p className="font-semibold">
                  {s.step}. [{s.role}] {s.skill_id}
                </p>
                <p className="mt-1 text-muted">{s.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.skill_id && (
                    <>
                      <Link
                        to="/marketplace/pay"
                        search={{ skill: s.skill_id }}
                        className="text-accent hover:underline"
                      >
                        Pay
                      </Link>
                      <Link
                        to="/marketplace/checkout"
                        search={{ skill: s.skill_id }}
                        className="text-muted hover:underline"
                      >
                        Checkout
                      </Link>
                      <Link
                        to="/marketplace/skill/$skillId"
                        params={{ skillId: s.skill_id }}
                        className="text-muted hover:underline"
                      >
                        Detail
                      </Link>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {job?.payment_split && (
            <pre className={cn("mt-4 max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted")}>
              {JSON.stringify(job.payment_split, null, 2)}
            </pre>
          )}
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
