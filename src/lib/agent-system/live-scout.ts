/**
 * Live scout probes against lvlltd.com (read-only) via server proxy.
 */

import { parseProxiedJson, proxyLvlFetch, type ProxiedResponse } from "./scout-server";

export type ScoutFinding = {
  id: string;
  ok: boolean;
  title: string;
  detail: string;
  ms: number;
  data?: unknown;
};

async function probe(
  id: string,
  title: string,
  path: string,
  interpret: (res: ProxiedResponse) => { ok: boolean; detail: string; data?: unknown },
): Promise<ScoutFinding> {
  try {
    const res = (await proxyLvlFetch({ data: { path } })) as ProxiedResponse;
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
      detail: String((e as Error)?.message || e).slice(0, 240),
      ms: 0,
    };
  }
}

export async function runLiveScoutSuite(_base = "https://lvlltd.com"): Promise<{
  findings: ScoutFinding[];
  summary: string;
  artifactBody: string;
}> {
  const findings: ScoutFinding[] = [];

  findings.push(
    await probe("home", "Home HTML", "/", (res) => {
      const text = res.text || "";
      const title = (text.match(/<title>([^<]+)/i) || [])[1] || "";
      const ok = res.status === 200 && /<h1/i.test(text);
      return {
        ok,
        detail: ok ? "ok" : `HTTP ${res.status}`,
        data: {
          status: res.status,
          bytes: text.length,
          title,
          has_h1: /<h1/i.test(text),
          has_x402: /x402/i.test(text),
        },
      };
    }),
  );

  findings.push(
    await probe("catalog_meta", "Catalog meta", "/catalog.json?fields=meta", (res) => {
      const j = (parseProxiedJson(res) || {}) as Record<string, unknown>;
      const ok = res.status === 200 && !!parseProxiedJson(res);
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: {
          skill_count: j.skill_count ?? j.count,
          keys: Object.keys(j).slice(0, 12),
          bytes: JSON.stringify(j).length,
        },
      };
    }),
  );

  findings.push(
    await probe("catalog_slim", "Catalog slim sample", "/catalog.json?fields=slim", (res) => {
      const j = (parseProxiedJson(res) || {}) as { skills?: { id: string }[] };
      const skills = j.skills || [];
      const bytes = JSON.stringify(j).length;
      const ok = res.status === 200 && skills.length > 0;
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: {
          n: skills.length,
          sample_ids: skills.slice(0, 5).map((s) => s.id),
          bytes,
        },
      };
    }),
  );

  findings.push(
    await probe("proof", "Proof ledger", "/api/proof", (res) => {
      const j = (parseProxiedJson(res) || {}) as {
        confirmed?: { unlock_count?: number; volume_usdc?: number };
        activity?: { unlock_count?: number; volume_usdc?: number };
        last_successful_agent_purchase?: { skill_id?: string; price_usd?: number };
      };
      const ok = res.status === 200 && !!parseProxiedJson(res);
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: {
          confirmed: j.confirmed || j.activity,
          last: j.last_successful_agent_purchase,
        },
      };
    }),
  );

  findings.push(
    await probe("x402_orchestration", "x402 agent-orchestration", "/api/pay?skill=agent-orchestration", (res) => {
      const j = (parseProxiedJson(res) || {}) as {
        error_code?: string;
        amount_usd?: number;
        maxAmountRequired?: string;
        payTo?: string;
        network?: string;
      };
      // 402 is success for challenge
      const ok = res.status === 402 || res.status === 200;
      return {
        ok,
        detail: ok ? "challenge ok" : res.error || `HTTP ${res.status}`,
        data: {
          status: res.status,
          error_code: j.error_code,
          amount_usd: j.amount_usd,
          maxAmountRequired: j.maxAmountRequired,
          payTo: j.payTo,
          network: j.network,
        },
      };
    }),
  );

  // listing checks — two paths
  const slash = (await proxyLvlFetch({ data: { path: "/listings/agent-orchestration/" } })) as ProxiedResponse;
  const html = (await proxyLvlFetch({ data: { path: "/listings/agent-orchestration.html" } })) as ProxiedResponse;
  const sealBug = html.status === 404 && slash.status === 200;
  findings.push({
    id: "listing_canonical",
    ok: true, // check executed
    title: "Listing URL shape",
    detail: sealBug ? "seal bug confirmed" : "checked",
    ms: slash.ms + html.ms,
    data: {
      trailing_slash: slash.status,
      dot_html: html.status,
      seal_listing_bug: sealBug,
    },
  });

  findings.push(
    await probe("status_page", "Status HTML", "/status/", (res) => {
      const text = res.text || "";
      const ok = res.status === 200;
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: {
          status: res.status,
          bytes: text.length,
          has_skill_market: /skill|x402|agent/i.test(text),
        },
      };
    }),
  );

  findings.push(
    await probe("robots", "robots.txt", "/robots.txt", (res) => {
      const text = res.text || "";
      const ok = res.status === 200 && /sitemap/i.test(text);
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: { status: res.status, has_sitemap: /sitemap/i.test(text), bytes: text.length },
      };
    }),
  );

  findings.push(
    await probe("sitemap", "sitemap.xml", "/sitemap.xml", (res) => {
      const text = res.text || "";
      const urls = (text.match(/<loc>/g) || []).length;
      const ok = res.status === 200 && urls > 0;
      return {
        ok,
        detail: ok ? "ok" : res.error || `HTTP ${res.status}`,
        data: { status: res.status, urls, has_listings: /listings/i.test(text) },
      };
    }),
  );

  const okN = findings.filter((f) => f.ok).length;
  const sealNote = sealBug
    ? "CONFIRMED: .html listing URLs 404 while trailing slash 200."
    : "Listing URL check complete.";

  const summary = `Live scout ${okN}/${findings.length} probes ok. ${sealNote}`;

  const artifactBody = JSON.stringify(
    {
      source: "https://lvlltd.com",
      via: "server-proxy",
      generated_at: new Date().toISOString(),
      summary,
      findings,
    },
    null,
    2,
  );

  return { findings, summary, artifactBody };
}
