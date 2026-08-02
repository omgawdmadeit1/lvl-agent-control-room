import { Link } from "@tanstack/react-router";
import { controlRoomManifest } from "@/lib/agent-economy/swarm";

export function ManifestPage() {
  const m = controlRoomManifest();
  const json = JSON.stringify(m, null, 2);
  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Machine map
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Control Room manifest</h1>
        <p className="mt-2 text-sm text-muted">
          Exportable route map for agents that navigate this Control Room + LVL APIs.
        </p>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
          onClick={() => void navigator.clipboard?.writeText(json)}
        >
          Copy JSON
        </button>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(m.routes).map(([group, routes]) => (
          <section
            key={group}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <h2 className="text-sm font-semibold capitalize">{group}</h2>
            <ul className="mt-2 space-y-1 text-xs">
              {(routes as string[]).map((r) => (
                <li key={r}>
                  <Link to={r as "/marketplace"} className="text-accent hover:underline">
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <pre className="max-h-96 overflow-auto rounded-[var(--radius-xl)] border border-border bg-elevated p-4 font-mono text-[10px] text-muted">
        {json}
      </pre>
    </div>
  );
}
