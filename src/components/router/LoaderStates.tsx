import { Link } from "@tanstack/react-router";

export function LoaderPending({ label = "Loading route data…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-8"
      role="status"
      aria-live="polite"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="text-sm text-muted">{label}</p>
      <p className="font-mono text-[11px] text-subtle">pendingComponent · loader in flight</p>
    </div>
  );
}

export function LoaderError({
  error,
  reset,
}: {
  error: Error;
  reset?: () => void;
}) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-danger/40 bg-surface p-6"
      role="alert"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-danger">Loader error</p>
      <p className="mt-2 text-sm font-medium">{error.message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            Retry loader
          </button>
        )}
        <Link
          to="/lab/loaders"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm"
        >
          Loader lab
        </Link>
      </div>
    </div>
  );
}

export function LoaderMetaBadge({
  durationMs,
  startedAt,
  source = "loader",
}: {
  durationMs: number;
  startedAt: string;
  source?: string;
}) {
  return (
    <p className="font-mono text-[11px] text-subtle">
      {source} · {durationMs}ms · started {startedAt}
    </p>
  );
}
