import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useAgentSystem } from "@/lib/agent-system/store";
import { cn } from "@/components/ui/cn";

export function ArtifactBrowser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const artifacts = useAgentSystem((s) => s.artifacts);
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return artifacts;
    return artifacts.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.type.toLowerCase().includes(needle) ||
        a.role.toLowerCase().includes(needle) ||
        a.body.toLowerCase().includes(needle),
    );
  }, [artifacts, q]);

  const active = filtered.find((a) => a.id === activeId) || filtered[0] || null;

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Artifact browser"
        className="relative z-10 flex h-[min(88dvh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-border bg-surface shadow-2xl sm:rounded-[var(--radius-xl)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Artifact browser</h2>
            <p className="text-xs text-muted">{artifacts.length} total</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close artifacts"
            className="hit-area-icon rounded-[var(--radius-md)] border border-border"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="border-b border-border px-4 py-2">
          <label className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3">
            <Search className="size-4 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter type, title, role, body…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
            />
          </label>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[240px_1fr]">
          <ul className="max-h-[40vh] overflow-y-auto border-b border-border md:max-h-none md:border-b-0 md:border-r">
            {filtered.length === 0 ? (
              <li className="p-4 text-sm text-muted">No artifacts match.</li>
            ) : (
              filtered.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(a.id)}
                    className={cn(
                      "min-h-11 w-full border-b border-border px-3 py-3 text-left transition hover:bg-elevated",
                      active?.id === a.id && "bg-elevated",
                    )}
                  >
                    <p className="font-mono text-[10px] text-subtle">{a.type}</p>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-[11px] text-muted">{a.role}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="min-h-0 overflow-y-auto p-4">
            {!active ? (
              <p className="text-sm text-muted">Select an artifact.</p>
            ) : (
              <>
                <p className="font-mono text-[11px] text-subtle">{active.id}</p>
                <h3 className="mt-1 text-base font-semibold">{active.title}</h3>
                <p className="mt-1 text-xs text-muted">
                  {active.type} · {active.role} · {active.createdAt}
                </p>
                <pre className="mt-4 whitespace-pre-wrap rounded-[var(--radius-md)] border border-border bg-bg p-3 font-mono text-[11px] leading-relaxed text-fg/90">
                  {active.body}
                </pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
