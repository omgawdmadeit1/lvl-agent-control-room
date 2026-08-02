import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FileJson, FileText } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAgentSystem } from "@/lib/agent-system/store";
import { synthesizeRunReport } from "@/lib/agent-system/report";
import { downloadJson } from "@/lib/agent-system/persist";
import { cn } from "@/components/ui/cn";

export function RunReportPanel() {
  const snap = useAgentSystem(
    useShallow((s) => ({
      runId: s.runId,
      goal: s.goal,
      topology: s.topology,
      status: s.status,
      audit: s.audit,
      roles: s.roles,
      tasks: s.tasks,
      artifacts: s.artifacts,
      rails: s.rails,
      log: s.log,
      metrics: s.metrics,
      backpressure: s.backpressure,
      tokenBuckets: s.tokenBuckets,
      liveScout: s.liveScout,
    })),
  );

  const [tab, setTab] = useState<"md" | "json">("md");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const report = useMemo(() => {
    if (!mounted) return null;
    return synthesizeRunReport(snap);
  }, [snap, mounted]);

  const text = !report
    ? "Loading report…"
    : tab === "md"
      ? report.markdown
      : JSON.stringify(report.json, null, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function download() {
    if (!report) return;
    if (tab === "json") {
      downloadJson(`lvl-report-${snap.runId}.json`, report.json);
    } else {
      const blob = new Blob([report.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lvl-report-${snap.runId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <section className="col-span-full lg:col-span-12 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Run report</h2>
          <p className="mt-1 text-xs text-muted">
            Live synthesis of board, scout, pressure, and next actions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("md")}
            className={cn(
              "inline-flex h-11 min-target items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
              tab === "md" ? "border-accent bg-accent text-accent-fg" : "border-border text-muted",
            )}
          >
            <FileText className="size-3.5" /> Markdown
          </button>
          <button
            type="button"
            onClick={() => setTab("json")}
            className={cn(
              "inline-flex h-11 min-target items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
              tab === "json" ? "border-accent bg-accent text-accent-fg" : "border-border text-muted",
            )}
          >
            <FileJson className="size-3.5" /> JSON
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-[min(22rem,50vh)] overflow-auto rounded-[var(--radius-lg)] border border-border bg-bg p-4 font-mono text-[11px] leading-relaxed text-fg/90">
        {text}
      </pre>
    </section>
  );
}
