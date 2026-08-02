import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { mcpToolCall, mcpToolsList } from "@/lib/agent-economy/mcp-client";
import { cn } from "@/components/ui/cn";

const PRESETS: { name: string; args: Record<string, unknown>; label: string }[] = [
  { name: "search_skills", args: { q: "x402", limit: 5 }, label: "search x402" },
  {
    name: "get_skill_details",
    args: { skill_id: "agent-x402-first-buy" },
    label: "details canary",
  },
  {
    name: "get_payment_challenge",
    args: { skill_id: "agent-x402-first-buy" },
    label: "402 challenge",
  },
  {
    name: "intent_search",
    args: { q: "agent payments on base usdc", limit: 5 },
    label: "intent search",
  },
  {
    name: "get_commerce_signals",
    args: { sort: "demand", limit: 5 },
    label: "demand signals",
  },
  {
    name: "check_access",
    args: {
      wallet: "0x0000000000000000000000000000000000000001",
      skill_id: "agent-x402-first-buy",
    },
    label: "check access",
  },
  {
    name: "quote_price",
    args: { skill_id: "agent-orchestration" },
    label: "quote orchestration",
  },
];

export function McpConsole() {
  const [tools, setTools] = useState<{ name: string; description?: string }[]>([]);
  const [tool, setTool] = useState("search_skills");
  const [argsJson, setArgsJson] = useState('{"q":"x402","limit":5}');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<unknown>(null);
  const [meta, setMeta] = useState("");

  useEffect(() => {
    void mcpToolsList().then((r) => {
      setTools(r.tools.map((t) => ({ name: t.name, description: t.description })));
    });
  }, []);

  async function run(name = tool, argsText = argsJson) {
    setBusy(true);
    try {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(argsText) as Record<string, unknown>;
      } catch {
        setMeta("invalid JSON args");
        return;
      }
      const r = await mcpToolCall(name, args);
      setOut(r.parsed ?? r.data);
      setMeta(`HTTP ${r.status} · ${r.ms}ms · ${name}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Live MCP
        </p>
        <h1 className="mt-1 text-2xl font-semibold">MCP tool console</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Call lvlltd.com JSON-RPC tools (search, challenge, signals, access). No payment bypass —
          purchase tools still need a real tx_hash.
        </p>
        <Link
          to="/marketplace/protocols"
          className="mt-3 inline-flex text-xs text-accent hover:underline"
        >
          Protocol overview
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[var(--radius-xl)] border border-border bg-surface p-3 max-h-[32rem] overflow-auto">
          <p className="text-[10px] uppercase text-subtle px-1">Tools ({tools.length})</p>
          <ul className="mt-2 space-y-0.5">
            {tools.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  onClick={() => {
                    setTool(t.name);
                    setArgsJson(
                      JSON.stringify(
                        PRESETS.find((p) => p.name === t.name)?.args ||
                          (t.name.includes("skill")
                            ? { skill_id: "agent-x402-first-buy" }
                            : {}),
                        null,
                        2,
                      ),
                    );
                  }}
                  className={cn(
                    "w-full rounded px-2 py-1.5 text-left font-mono text-[11px]",
                    tool === t.name ? "bg-accent/15 text-fg" : "text-muted hover:bg-elevated",
                  )}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex flex-wrap gap-1 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className="inline-flex h-11 items-center rounded-full border border-border px-3 text-[11px]"
                onClick={() => {
                  setTool(p.name);
                  setArgsJson(JSON.stringify(p.args, null, 2));
                  void run(p.name, JSON.stringify(p.args));
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-accent">{tool}</p>
          <textarea
            value={argsJson}
            onChange={(e) => setArgsJson(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-border bg-elevated p-3 font-mono text-[11px] outline-none"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Calling…" : "tools/call"}
          </button>
          {meta && <p className="mt-2 font-mono text-[11px] text-subtle">{meta}</p>}
          {out != null && (
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded bg-elevated p-3 font-mono text-[10px] text-muted">
              {typeof out === "string" ? out : JSON.stringify(out, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
