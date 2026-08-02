import { useCallback, useEffect, useState } from "react";
import { Accessibility, ExternalLink, Play, ShieldCheck } from "lucide-react";
import {
  A11Y_STANDARDS,
  COMPLIANCE_STACK,
  WCAG_FOCUS_CRITERIA,
  type StandardId,
} from "@/lib/agent-system/a11y-standards";
import {
  runControlRoomA11yAudit,
  summarizeChecks,
  type A11yCheck,
} from "@/lib/agent-system/a11y-audit";
import { cn } from "@/components/ui/cn";

export function A11yStandardsPanel() {
  const [active, setActive] = useState<StandardId>("wcag22");
  const [checks, setChecks] = useState<A11yCheck[] | null>(null);
  const standard = A11Y_STANDARDS.find((s) => s.id === active) ?? A11Y_STANDARDS[0];

  const runAudit = useCallback(() => {
    setChecks(runControlRoomA11yAudit(document));
  }, []);

  useEffect(() => {
    // first paint after mount only
    runAudit();
  }, [runAudit]);

  const summary = checks ? summarizeChecks(checks) : null;

  return (
    <section
      id="a11y-standards"
      className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-elevated">
            <Accessibility className="size-4 text-muted" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Accessibility compliance standards</h2>
            <p className="mt-1 max-w-2xl text-xs text-muted leading-relaxed">
              Map law → technical standard → implementation → evidence. Default shipping target for
              this Control Room: <span className="text-fg">WCAG 2.2 Level AA</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runAudit}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
        >
          <Play className="size-4" /> Re-run page audit
        </button>
      </div>

      {/* Stack */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE_STACK.map((layer) => (
          <div
            key={layer.layer}
            className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
              {layer.layer}
            </p>
            <ul className="mt-2 space-y-1">
              {layer.items.map((item) => (
                <li key={item} className="text-xs text-muted leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Standard picker */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {A11Y_STANDARDS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={cn(
              "hit-area-chip shrink-0 rounded-full border px-3 text-xs font-medium",
              active === s.id
                ? "border-accent bg-accent text-accent-fg"
                : "border-border text-muted hover:text-fg",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <article className="mt-3 rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold">{standard.fullName}</h3>
            <p className="mt-1 text-xs text-subtle">
              {standard.body} · {standard.year}
            </p>
          </div>
          <a
            href={standard.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 min-target items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-xs font-medium text-fg"
          >
            Spec <ExternalLink className="size-3.5" />
          </a>
        </div>
        <p className="mt-3 text-sm text-muted leading-relaxed">{standard.summary}</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
          <div>
            <dt className="text-subtle">Applies to</dt>
            <dd className="text-fg">{standard.appliesTo}</dd>
          </div>
          {standard.levels && (
            <div>
              <dt className="text-subtle">Levels</dt>
              <dd className="text-fg">{standard.levels}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-subtle">Relation</dt>
            <dd className="text-fg">{standard.relation}</dd>
          </div>
        </dl>
      </article>

      {/* WCAG focus criteria */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted" />
          <h3 className="text-sm font-semibold">WCAG criteria watchlist (Control Room)</h3>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-border bg-elevated text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Level</th>
                <th className="px-3 py-2 font-medium">Principle</th>
                <th className="px-3 py-2 font-medium">Control Room note</th>
              </tr>
            </thead>
            <tbody>
              {WCAG_FOCUS_CRITERIA.map((c) => (
                <tr key={c.id} className="border-b border-border/80">
                  <td className="px-3 py-2 font-mono text-muted">{c.id}</td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.level}</td>
                  <td className="px-3 py-2 text-muted">{c.principle}</td>
                  <td className="px-3 py-2 text-muted">{c.controlRoomNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live audit */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Live page audit (heuristics)</h3>
          {summary && (
            <p className="font-mono text-[11px] text-muted">
              pass {summary.pass} · warn {summary.warn} · fail {summary.fail} / {summary.total}
            </p>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">
          Automated smoke checks only — not a conformance claim. Pair with keyboard + screen reader
          testing.
        </p>
        {checks && (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "rounded-[var(--radius-md)] border border-border bg-surface p-3",
                  !c.pass && c.severity === "fail" && "border-danger/40",
                  !c.pass && c.severity === "warn" && "border-warn/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.title}</p>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase",
                      c.pass ? "text-ok" : c.severity === "fail" ? "text-danger" : "text-warn",
                    )}
                  >
                    {c.pass ? "pass" : c.severity}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-subtle">WCAG {c.criterion}</p>
                <p className="mt-1 text-xs text-muted">{c.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
