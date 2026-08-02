import { useMemo, useState } from "react";
import type { CatalogSkill } from "@/lib/marketplace/types";
import { filterSkills } from "@/lib/marketplace/catalog";
import { SkillCard } from "./SkillCard";

export function CatalogBrowser({
  skills,
  categories,
}: {
  skills: CatalogSkill[];
  categories: { name: string; count: number }[];
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [tier, setTier] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState(0);

  const filtered = useMemo(
    () =>
      filterSkills(skills, {
        q,
        category,
        tier,
        maxPrice: maxPrice > 0 ? maxPrice : undefined,
      }),
    [skills, q, category, tier, maxPrice],
  );

  return (
    <section
      aria-labelledby="catalog-heading"
      className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="catalog-heading" className="text-sm font-semibold">
            Live catalog
          </h2>
          <p className="mt-1 text-xs text-muted">
            Slim catalog from lvlltd.com — filter like an agent would before purchase.
          </p>
        </div>
        <p className="font-mono text-xs text-subtle">
          {filtered.length}/{skills.length} shown
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="flex h-11 min-w-[12rem] flex-1 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3">
          <span className="sr-only">Search skills</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search id, name, tags…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Category"
        >
          <option value="ALL">All categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Tier"
        >
          <option value="ALL">All tiers</option>
          <option value="premium">premium</option>
          <option value="free">free</option>
        </select>
        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
          aria-label="Max price"
        >
          <option value={0}>Any price</option>
          <option value={5}>≤ $5</option>
          <option value={10}>≤ $10</option>
          <option value={25}>≤ $25</option>
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.slice(0, 48).map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
      {filtered.length > 48 && (
        <p className="mt-3 text-center text-xs text-muted">
          Showing first 48 of {filtered.length} — refine filters to narrow.
        </p>
      )}
      {filtered.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">No skills match these filters.</p>
      )}
    </section>
  );
}
