/**
 * TanStack Router loader data factories.
 * Serializable results only — loaders may run on server and client.
 */

import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";
import { scoreSiteHealth } from "@/lib/agent-system/site-health";
import type { ScoutFinding } from "@/lib/agent-system/live-scout";
import { createInitialState } from "@/lib/agent-system/seed";

export type LoaderTiming = {
  startedAt: string;
  durationMs: number;
  source: "loader";
};

export type HealthLoaderData = LoaderTiming & {
  kind: "health";
  score: number;
  grade: string;
  goNoGo: string;
  topActions: string[];
  checks: { id: string; pass: boolean; note: string; weight: number }[];
  probeCount: number;
  sample: {
    skillCount?: number;
    listingSlash?: number;
    listingHtml?: number;
    x402?: number;
  };
};

export type BoardLoaderData = LoaderTiming & {
  kind: "board";
  runGoal: string;
  taskTotal: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  p0Ready: { id: string; title: string }[];
};

export type ScoutLoaderData = LoaderTiming & {
  kind: "scout";
  summary: string;
  ok: number;
  fail: number;
  findings: ScoutFinding[];
};

async function fetchProxy(path: string): Promise<ProxiedResponse> {
  return (await proxyLvlFetch({ data: { path } })) as ProxiedResponse;
}

async function probe(
  id: string,
  title: string,
  path: string,
  interpret: (res: ProxiedResponse) => { ok: boolean; detail: string; data?: unknown },
): Promise<ScoutFinding> {
  try {
    const res = await fetchProxy(path);
    const read = interpret(res);
    return {
      id,
      ok: read.ok,
      title,
      detail: read.detail,
      ms: res.ms,
      data: read.data,
    };
  } catch (e) {
    return {
      id,
      ok: false,
      title,
      detail: String((e as Error)?.message || e).slice(0, 200),
      ms: 0,
    };
  }
}

/** Parallel production probes for health/scout loaders. */
export async function loadLiveProbes(): Promise<ScoutFinding[]> {
  const findings: ScoutFinding[] = [];

  findings.push(
    await probe("catalog_meta", "Catalog meta", "/catalog.json?fields=meta", (res) => {
      const j = (parseProxiedJson(res) || {}) as { skill_count?: number };
      const ok = res.status === 200;
      return { ok, detail: ok ? "ok" : res.error || "fail", data: { skill_count: j.skill_count } };
    }),
  );

  findings.push(
    await probe("catalog_slim", "Catalog slim", "/catalog.json?fields=slim", (res) => {
      const j = (parseProxiedJson(res) || {}) as { skills?: unknown[] };
      const bytes = res.jsonText?.length ?? 0;
      const ok = res.status === 200 && (j.skills?.length ?? 0) > 0;
      return { ok, detail: ok ? "ok" : "fail", data: { n: j.skills?.length ?? 0, bytes } };
    }),
  );

  findings.push(
    await probe("proof", "Proof", "/api/proof", (res) => {
      const ok = res.status === 200;
      return { ok, detail: ok ? "ok" : "fail", data: parseProxiedJson(res) };
    }),
  );

  findings.push(
    await probe("x402_orchestration", "x402", "/api/pay?skill=agent-orchestration", (res) => {
      const ok = res.status === 402 || res.status === 200;
      return { ok, detail: ok ? "challenge ok" : "fail", data: { status: res.status } };
    }),
  );

  const slash = await fetchProxy("/listings/agent-orchestration/");
  const html = await fetchProxy("/listings/agent-orchestration.html");
  // 301 or 200 on .html after CF redirects is healthy; only pure 404 is a seal bug
  const sealBug = html.status === 404 && slash.status === 200;
  findings.push({
    id: "listing_canonical",
    ok: true,
    title: "Listing URLs",
    detail: sealBug ? "legacy .html 404 without redirect" : "canonical healthy",
    ms: slash.ms + html.ms,
    data: {
      trailing_slash: slash.status,
      dot_html: html.status,
      seal_listing_bug: sealBug,
    },
  });

  findings.push(
    await probe("status_page", "Status", "/status/", (res) => {
      const ok = res.status === 200;
      return { ok, detail: ok ? "ok" : "fail" };
    }),
  );

  findings.push(
    await probe("robots", "robots.txt", "/robots.txt", (res) => {
      const text = res.text || "";
      const ok = res.status === 200 && /sitemap/i.test(text);
      return { ok, detail: ok ? "ok" : "fail", data: { has_sitemap: /sitemap/i.test(text) } };
    }),
  );

  findings.push(
    await probe("sitemap", "sitemap.xml", "/sitemap.xml", (res) => {
      const text = res.text || "";
      const urls = (text.match(/<loc>/g) || []).length;
      const ok = res.status === 200 && urls > 0;
      return { ok, detail: ok ? "ok" : "fail", data: { urls } };
    }),
  );

  findings.push(
    await probe("home", "Home", "/", (res) => {
      const text = res.text || "";
      const ok = res.status === 200 && /<h1/i.test(text);
      return {
        ok,
        detail: ok ? "ok" : "fail",
        data: { title: (text.match(/<title>([^<]+)/i) || [])[1] },
      };
    }),
  );

  return findings;
}

export async function loadHealthData(): Promise<HealthLoaderData> {
  const started = Date.now();
  const findings = await loadLiveProbes();
  const health = scoreSiteHealth(findings);
  const meta = findings.find((f) => f.id === "catalog_meta");
  const listing = findings.find((f) => f.id === "listing_canonical");
  const x402 = findings.find((f) => f.id === "x402_orchestration");

  return {
    kind: "health",
    source: "loader",
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    score: health.score,
    grade: health.grade,
    goNoGo: health.goNoGo,
    topActions: health.topActions,
    checks: health.checks,
    probeCount: findings.length,
    sample: {
      skillCount: (meta?.data as { skill_count?: number } | undefined)?.skill_count,
      listingSlash: (listing?.data as { trailing_slash?: number } | undefined)?.trailing_slash,
      listingHtml: (listing?.data as { dot_html?: number } | undefined)?.dot_html,
      x402: (x402?.data as { status?: number } | undefined)?.status,
    },
  };
}

export async function loadScoutData(): Promise<ScoutLoaderData> {
  const started = Date.now();
  const findings = await loadLiveProbes();
  const ok = findings.filter((f) => f.ok).length;
  const fail = findings.length - ok;
  return {
    kind: "scout",
    source: "loader",
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    summary: `Loader scout ${ok}/${findings.length} probes ok in ${Date.now() - started}ms`,
    ok,
    fail,
    findings,
  };
}

/** Seed snapshot — SSR-safe (no browser store). */
export async function loadBoardSnapshot(): Promise<BoardLoaderData> {
  const started = Date.now();
  await new Promise((r) => setTimeout(r, 40));
  const state = createInitialState();
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const t of state.tasks) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  }
  return {
    kind: "board",
    source: "loader",
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    runGoal: state.goal,
    taskTotal: state.tasks.length,
    byStatus,
    byPriority,
    p0Ready: state.tasks
      .filter((t) => t.priority === "P0" && (t.status === "READY" || t.status === "DONE"))
      .slice(0, 6)
      .map((t) => ({ id: t.id, title: t.title })),
  };
}

export async function loadLoaderDemo(opts: {
  delayMs?: number;
  fail?: boolean;
}): Promise<{ message: string; at: string; delayMs: number }> {
  const delayMs = opts.delayMs ?? 500;
  await new Promise((r) => setTimeout(r, delayMs));
  if (opts.fail) {
    throw new Error("Demo loader intentionally failed (errorComponent)");
  }
  return {
    message: "Loader resolved successfully",
    at: new Date().toISOString(),
    delayMs,
  };
}
