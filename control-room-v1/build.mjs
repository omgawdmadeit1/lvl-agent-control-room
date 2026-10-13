#!/usr/bin/env node
// Control room v1 build: probe every surface (GET, no auth), read x402 proof, write dist/ (static).
// Read-only: no writes to any service.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));

export function classify(status, finalUrl, expect) {
  const gated = /cloudflareaccess\.com|\/cdn-cgi\/access/.test(finalUrl || "");
  if (status === 0) return expect === "not_set_up" ? "not_set_up" : "down";
  if (gated) return "gated";
  if (status >= 200 && status < 400) return "up";
  if (status === 401 || status === 403) return "gated";
  return "broken";
}

export function parseProof(statement) {
  const m = /(\d+) row\(s\) \/ \$(\d+(?:\.\d+)?) USDC/.exec(statement || "");
  return m ? { count: Number(m[1]), amount_usd: Number(m[2]) } : null;
}

export function totals(rows) {
  const t = { live: 0, test: 0, self_funded: 0, unknown_rows: 0 };
  for (const r of rows) { if (typeof r.amount_usd === "number") t[r.class] = Math.round((t[r.class] + r.amount_usd) * 100) / 100; else t.unknown_rows++; }
  return t;
}

async function probe(s, fetchImpl) {
  const t0 = Date.now();
  try {
    const r = await fetchImpl(s.url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "user-agent": "lvl-control-room-v1 (health probe)" } });
    return { ...s, status: r.status, final_url: r.url, ms: Date.now() - t0, state: classify(r.status, r.url, s.expect) };
  } catch (e) {
    return { ...s, status: 0, ms: Date.now() - t0, state: classify(0, "", s.expect), error: String(e.cause?.code || e.name) };
  }
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function render(data) {
  const row = (p) => `<tr class="${p.state}"><td>${esc(p.pillar)}</td><td>${esc(p.id)}</td><td><a href="${esc(p.url)}">${esc(p.url)}</a></td><td>${p.status}</td><td><b>${p.state}</b>${p.expect ? ` (expected ${esc(p.expect)})` : ""}</td></tr>`;
  const money = (r) => `<tr class="${r.class}"><td>${esc(r.rail)}</td><td>${r.class}</td><td>${typeof r.amount_usd === "number" ? "$" + r.amount_usd.toFixed(2) : "unknown"}</td><td>${r.count ?? "unknown"}</td><td>${esc(r.source)}</td></tr>`;
  const t = data.totals;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>LVL Control Room v1</title>
<style>body{margin:0;font:14px/1.5 system-ui,sans-serif;background:#0a0a0b;color:#f4f4f5}main{max-width:1100px;margin:0 auto;padding:2rem 1rem}table{border-collapse:collapse;width:100%;margin:1rem 0}td,th{border-bottom:1px solid #27272a;padding:.35rem .5rem;text-align:left;vertical-align:top}a{color:#22c55e}.up b{color:#22c55e}.gated b{color:#eab308}.broken b,.down b{color:#ef4444}.not_set_up b{color:#a1a1aa}.big{font-size:1.6rem;font-weight:700}.card{display:inline-block;border:1px solid #27272a;border-radius:12px;padding:.75rem 1rem;margin:.25rem}small{color:#a1a1aa}</style></head>
<body><main><h1>LVL Control Room v1</h1><p><small>Read-only. Snapshot built ${esc(data.built_at)} (${esc(data.built_at_et)}). Writes (price, payout, send, deploy) are never made from here.</small></p>
<h2>Money scoreboard</h2>
<div class="card"><div class="big">$${t.live.toFixed(2)}</div>live (third-party) revenue</div>
<div class="card"><div class="big">$${t.self_funded.toFixed(2)}</div>self-funded tests (not revenue)</div>
<div class="card"><div class="big">$${t.test.toFixed(2)}</div>test mode (not revenue)</div>
<div class="card"><div class="big">${t.unknown_rows}</div>rails not read</div>
<table><tr><th>Rail</th><th>Class</th><th>Amount</th><th>Count</th><th>Source</th></tr>${data.money.map(money).join("")}</table>
<h2>Surface health (${data.health.filter((p) => p.state === "up").length}/${data.health.length} up)</h2>
<table><tr><th>Pillar</th><th>Surface</th><th>URL</th><th>HTTP</th><th>State</th></tr>${data.health.map(row).join("")}</table>
<p><small>Sources: control-room-v1/surfaces.json, control-room-v1/money.json, ${esc(data.proof_source)}. Machine-readable: <a href="data.json">data.json</a>.</small></p></main></body></html>`;
}

export async function build({ fetchImpl = fetch, now = new Date() } = {}) {
  const { surfaces } = JSON.parse(fs.readFileSync(path.join(here, "surfaces.json"), "utf8"));
  const money = JSON.parse(fs.readFileSync(path.join(here, "money.json"), "utf8")).rows.map((r) => ({ ...r }));
  const health = await Promise.all(surfaces.map((s) => probe(s, fetchImpl)));
  let proof = null;
  try { const r = await fetchImpl("https://lvlltd.com/api/proof", { signal: AbortSignal.timeout(15000) }); if (r.ok) proof = parseProof((await r.json()).framing?.statement); } catch {}
  for (const r of money) if (r.amount_usd === "from_proof") { r.amount_usd = proof ? proof.amount_usd : null; r.count = proof ? proof.count : null; if (!proof) r.source += " — fetch failed at build"; }
  const built_at_et = now.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  const data = { schema: "lvl-control-room-v1", built_at: now.toISOString(), built_at_et, proof_source: "https://lvlltd.com/api/proof", health, money, totals: totals(money) };
  return { data, html: render(data) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { data, html } = await build();
  const out = path.join(here, "dist"); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  fs.writeFileSync(path.join(out, "data.json"), JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ up: data.health.filter((p) => p.state === "up").length, of: data.health.length, totals: data.totals }));
}
