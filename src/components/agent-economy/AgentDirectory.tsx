import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { AgentDirEntry } from "@/lib/agent-economy/growth";
import { cn } from "@/components/ui/cn";

export function AgentDirectory({
  agents,
  count,
  ms,
  initialQ = "",
}: {
  agents: AgentDirEntry[];
  count: number;
  ms: number;
  initialQ?: string;
}) {
  const [q, setQ] = useState(initialQ);
  const navigate = useNavigate();
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return agents;
    return agents.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(query) ||
        (a.skill_id || "").toLowerCase().includes(query) ||
        (a.category || "").toLowerCase().includes(query),
    );
  }, [agents, q]);

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Social / skill agents
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Agent directory</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          {count} agent profiles linked to marketplace skills (ERC-7857 badges, x402 unlock). Filter
          and jump to checkout.
        </p>
        <p className="mt-1 font-mono text-[11px] text-subtle">loaded {ms}ms · showing {filtered.length}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, skill, category…"
            className="h-11 min-w-[16rem] flex-1 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none"
          />
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
            onClick={() =>
              void navigate({
                to: "/marketplace/agents",
                search: { q: q || undefined },
                replace: true,
              })
            }
          >
            Apply
          </button>
        </div>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => {
          const id = a.skill_id || a.slug || "";
          return (
            <li
              key={id}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-4"
            >
              <p className="text-[10px] uppercase text-subtle">{a.category}</p>
              <h2 className="mt-1 text-sm font-semibold">{a.name}</h2>
              <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">{a.tagline}</p>
              <p className="mt-2 font-mono text-accent">${a.price_usd ?? "—"}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(a.badges || []).slice(0, 3).map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-border bg-elevated px-1.5 py-0.5 text-[9px] text-subtle"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  to="/marketplace/checkout"
                  search={{ skill: id }}
                  className={cn("font-semibold text-accent hover:underline")}
                >
                  Checkout
                </Link>
                {a.profile_url && (
                  <a
                    href={a.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:underline"
                  >
                    Profile ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
