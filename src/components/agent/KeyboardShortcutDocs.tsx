import { useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { SHORTCUTS, SHORTCUT_FOOTER } from "@/lib/agent-system/shortcuts";
import { cn } from "@/components/ui/cn";

const CATEGORIES = ["Run", "Scout", "Data", "Help"] as const;

function KeyCap({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-[var(--radius-sm)] border border-border bg-elevated px-1.5 py-0.5 font-mono text-[11px] font-medium text-fg shadow-[0_1px_0_var(--color-border)]">
      {label}
    </kbd>
  );
}

/** Inline documentation section (always visible on the page). */
export function KeyboardShortcutDocs() {
  return (
    <section
      id="keyboard-shortcuts"
      className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-elevated">
            <Keyboard className="size-4 text-muted" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
            <p className="mt-1 text-xs text-muted">
              Active when focus is not in an input. Press{" "}
              <KeyCap label="?" /> anytime for the help overlay.
            </p>
          </div>
        </div>
        <p className="font-mono text-[11px] text-subtle">{SHORTCUT_FOOTER}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const items = SHORTCUTS.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <div
              key={cat}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">{cat}</h3>
              <ul className="mt-3 space-y-3">
                {items.map((s) => (
                  <li key={s.action} className="flex gap-3">
                    <div className="flex shrink-0 gap-1 pt-0.5">
                      {s.keys.map((k) => (
                        <KeyCap key={k} label={k} />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="mt-0.5 text-xs text-muted leading-relaxed">{s.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-bg p-3 text-xs text-muted">
        <p className="font-medium text-fg">Notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Shortcuts are ignored while typing in search fields, settings numbers, or filters.</li>
          <li>Auto-run stops on board complete, ship approval wait, or when you press Space again.</li>
          <li>
            Live scout respects <span className="text-fg">Settings → Auto-apply live scout</span>.
          </li>
        </ul>
      </div>
    </section>
  );
}

/** Modal help overlay toggled by ? */
export function KeyboardShortcutHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        aria-label="Close help"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcut help"
        className="relative z-10 max-h-[min(88dvh,640px)] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] border border-border bg-surface p-5 shadow-2xl sm:rounded-[var(--radius-xl)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Keyboard shortcuts</h2>
            <p className="mt-1 text-xs text-muted">Press Esc or ? again to close</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcut help"
            className="hit-area-icon rounded-[var(--radius-md)] border border-border"
          >
            <X className="size-4" />
          </button>
        </div>
        <ul className="space-y-3">
          {SHORTCUTS.map((s) => (
            <li
              key={s.action}
              className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-elevated p-3"
            >
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <KeyCap key={k} label={k} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {s.title}{" "}
                  <span className="text-[10px] font-normal uppercase text-subtle">{s.category}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{s.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
