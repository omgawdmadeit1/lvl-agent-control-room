import { useEffect, useState } from "react";
import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

export function OpenApiExplorer() {
  const [paths, setPaths] = useState<{ path: string; methods: string[] }[]>([]);
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = (await proxyLvlFetch({
        data: { path: "/openapi.json", accept: "application/json" },
      })) as ProxiedResponse;
      const data = parseProxiedJson(res) as {
        info?: Record<string, unknown>;
        paths?: Record<string, Record<string, unknown>>;
      };
      setMs(res.ms);
      setInfo(data?.info || null);
      const list = Object.entries(data?.paths || {}).map(([path, methods]) => ({
        path,
        methods: Object.keys(methods || {}),
      }));
      setPaths(list);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Contract
        </p>
        <h1 className="mt-1 text-2xl font-semibold">OpenAPI explorer</h1>
        <p className="mt-2 text-sm text-muted">
          Live {String(info?.title || "LVL API")} v{String(info?.version || "?")} · {paths.length}{" "}
          paths · {ms}ms
        </p>
      </section>
      <ul className="space-y-1">
        {paths.map((p) => (
          <li
            key={p.path}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-elevated px-3 py-2 text-xs"
          >
            <span className="font-mono">{p.path}</span>
            <span className="font-mono text-muted uppercase">{p.methods.join(" ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
