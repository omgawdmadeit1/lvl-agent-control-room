import { Link } from "@tanstack/react-router";

export type DemandSkill = {
  id: string;
  name: string;
  price_usd: number;
  confirmed_unlocks?: number;
  demand_score?: number;
  category?: string;
  volume_usd?: number;
};

export function DemandBoard({
  skills,
  note,
}: {
  skills: DemandSkill[];
  note?: string;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Demand board (confirmed only)</h2>
          <p className="mt-1 text-xs text-muted">
            {note || "Live /api/signals — zeros are honest."}
          </p>
        </div>
        <Link
          to="/marketplace/checkout"
          search={{ skill: skills[0]?.id || "agent-x402-first-buy" }}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
        >
          Checkout wizard
        </Link>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase text-subtle">
              <th className="py-2 pr-2">Skill</th>
              <th className="py-2 pr-2">Price</th>
              <th className="py-2 pr-2">Unlocks</th>
              <th className="py-2 pr-2">Demand</th>
              <th className="py-2">Buy</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="py-2 pr-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="font-mono text-[10px] text-subtle">{s.id}</p>
                </td>
                <td className="py-2 pr-2 font-mono">${s.price_usd}</td>
                <td className="py-2 pr-2 font-mono">{s.confirmed_unlocks ?? 0}</td>
                <td className="py-2 pr-2 font-mono">{s.demand_score ?? 0}</td>
                <td className="py-2">
                  <Link
                    to="/marketplace/checkout"
                    search={{ skill: s.id }}
                    className="text-accent hover:underline"
                  >
                    checkout
                  </Link>
                  {" · "}
                  <Link
                    to="/marketplace/x402"
                    search={{ skill: s.id }}
                    className="text-muted hover:underline"
                  >
                    402
                  </Link>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-muted">
                  No signal rows — network or empty ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
