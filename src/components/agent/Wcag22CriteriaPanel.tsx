import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import {
  WCAG22_COUNTS,
  WCAG22_CRITERIA,
  WCAG22_NEW_OR_NOTABLE,
  type WcagLevel,
  type WcagPrinciple,
} from "@/lib/agent-system/wcag22-criteria";
import { cn } from "@/components/ui/cn";

const PRINCIPLES: Array<WcagPrinciple | "ALL"> = [
  "ALL",
  "1 Perceivable",
  "2 Operable",
  "3 Understandable",
  "4 Robust",
];

const LEVELS: Array<WcagLevel | "ALL"> = ["ALL", "A", "AA", "AAA"];

export function Wcag22CriteriaPanel() {
  const [principle, setPrinciple] = useState<(typeof PRINCIPLES)[number]>("ALL");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("ALL");
  const [q, setQ] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const [activeId, setActiveId] = useState("1.4.3");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return WCAG22_CRITERIA.filter((c) => {
      if (c.id === "4.1.1" && !needle.includes("4.1.1") && !onlyNew) {
        // still show if searching parsing, else include with note
      }
      if (principle !== "ALL" && c.principle !== principle) return false;
      if (level !== "ALL" && c.level !== level) return false;
      if (onlyNew && !c.wcag22Note) return false;
      if (!needle) return true;
      return (
        c.id.includes(needle) ||
        c.name.toLowerCase().includes(needle) ||
        c.intent.toLowerCase().includes(needle) ||
        c.productNote.toLowerCase().includes(needle) ||
        (c.wcag22Note?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [principle, level, q, onlyNew]);

  const active =
    filtered.find((c) => c.id === activeId) ||
    filtered[0] ||
    WCAG22_CRITERIA.find((c) => c.id === activeId) ||
    WCAG22_CRITERIA[0];

  return (
    <section
      id="wcag22-criteria"
      className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-elevated">
            <BookOpen className="size-4 text-muted" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">WCAG 2.2 success criteria</h2>
            <p className="mt-1 max-w-2xl text-xs text-muted leading-relaxed">
              Full catalog with intent, failure modes, and product notes. Conformance target for
              shipping: <span className="text-fg">Level AA</span> (A + AA). Official spec:{" "}
              <a
                className="inline-flex min-h-6 items-center text-fg underline underline-offset-2"
                href="https://www.w3.org/TR/WCAG22/"
                target="_blank"
                rel="noreferrer"
              >
                w3.org/TR/WCAG22
              </a>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted">
          <span className="rounded-full border border-border px-2 py-1">A {WCAG22_COUNTS.A}</span>
          <span className="rounded-full border border-border px-2 py-1">AA {WCAG22_COUNTS.AA}</span>
          <span className="rounded-full border border-border px-2 py-1">AAA {WCAG22_COUNTS.AAA}</span>
          <span className="rounded-full border border-border px-2 py-1">
            2.2 notes {WCAG22_COUNTS.newIn22}
          </span>
        </div>
      </div>

      {/* POUR legend */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["1 Perceivable", "Users must be able to perceive the information"],
          ["2 Operable", "UI components and navigation must be operable"],
          ["3 Understandable", "Information and operation must be understandable"],
          ["4 Robust", "Content must be robust enough for AT and agents"],
        ].map(([p, d]) => (
          <div key={p} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
            <p className="text-xs font-semibold">{p}</p>
            <p className="mt-1 text-[11px] text-muted leading-snug">{d}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-[12rem] flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3">
          <Search className="size-4 shrink-0 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search id, name, intent…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
            aria-label="Search WCAG criteria"
          />
        </label>
        <select
          value={principle}
          onChange={(e) => setPrinciple(e.target.value as typeof principle)}
          className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          aria-label="Filter by principle"
        >
          {PRINCIPLES.map((p) => (
            <option key={p} value={p}>
              {p === "ALL" ? "All principles" : p}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof level)}
          className="min-target h-11 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          aria-label="Filter by level"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === "ALL" ? "All levels" : `Level ${l}`}
            </option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
            className="accent-accent"
          />
          2.2 notable only ({WCAG22_NEW_OR_NOTABLE.length})
        </label>
        <span className="text-xs text-subtle">
          {filtered.length} shown
        </span>
      </div>

      <div className="grid min-h-[20rem] gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className="max-h-[28rem] space-y-1 overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-elevated p-2">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex min-h-11 w-full items-start gap-2 rounded-[var(--radius-md)] px-2.5 py-2.5 text-left text-xs transition hover:bg-surface",
                  active.id === c.id && "bg-surface ring-1 ring-border",
                )}
              >
                <span className="shrink-0 font-mono text-muted">{c.id}</span>
                <span className="min-w-0 flex-1 font-medium leading-snug">{c.name}</span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]",
                    c.level === "A" && "bg-surface text-muted",
                    c.level === "AA" && "bg-info/15 text-info",
                    c.level === "AAA" && "bg-warn/15 text-warn",
                  )}
                >
                  {c.level}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-4 text-sm text-muted">No criteria match filters.</li>
          )}
        </ul>

        <article className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
          <p className="font-mono text-[11px] text-subtle">
            {active.principle} · Level {active.level}
            {active.wcag22Note ? " · 2.2 note" : ""}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            <span className="font-mono text-muted">{active.id}</span> {active.name}
          </h3>
          {active.wcag22Note && (
            <p className="mt-2 rounded-[var(--radius-sm)] border border-info/30 bg-info/10 px-2.5 py-1.5 text-xs text-fg">
              {active.wcag22Note}
            </p>
          )}
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">Intent</dt>
              <dd className="mt-1 text-muted leading-relaxed">{active.intent}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
                Common failures
              </dt>
              <dd className="mt-1 text-muted leading-relaxed">{active.failsWhen}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
                Product / Control Room
              </dt>
              <dd className="mt-1 text-fg leading-relaxed">{active.productNote}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[11px] text-subtle">
            Normative text lives in the W3C Recommendation. This panel is an operator checklist, not
            a legal conformance claim.
          </p>
        </article>
      </div>
    </section>
  );
}
