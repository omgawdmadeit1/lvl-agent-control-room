import { test } from "node:test";
import assert from "node:assert/strict";
import { build, classify, parseProof, totals } from "./build.mjs";

const proofBody = { framing: { statement: "the on-chain unlock rows on this ledger (currently 42 row(s) / $14.17 USDC) are self-funded test transactions" } };
const fakeFetch = async (url) => {
  if (url.includes("/api/proof")) return { ok: true, status: 200, url, json: async () => proofBody };
  if (url.includes("control.")) throw Object.assign(new Error("fetch failed"), { cause: { code: "ENOTFOUND" } });
  if (url.includes("release.") || url.includes("swarm.")) return { ok: true, status: 200, url: "https://rexchange.cloudflareaccess.com/cdn-cgi/access/login" };
  return { ok: true, status: 200, url };
};

test("classify states", () => {
  assert.equal(classify(200, "https://a"), "up");
  assert.equal(classify(200, "https://x.cloudflareaccess.com/cdn-cgi/access/login"), "gated");
  assert.equal(classify(404, "https://a"), "broken");
  assert.equal(classify(0, "", "not_set_up"), "not_set_up");
  assert.equal(classify(0, ""), "down");
});

test("x402 proof parses to 42 rows / $14.17 and counts as self-funded, never live", async () => {
  assert.deepEqual(parseProof(proofBody.framing.statement), { count: 42, amount_usd: 14.17 });
  const { data, html } = await build({ fetchImpl: fakeFetch, now: new Date("2026-10-13T10:30:00Z") });
  const x = data.money.find((r) => r.rail.startsWith("x402"));
  assert.equal(x.class, "self_funded"); assert.equal(x.amount_usd, 14.17); assert.equal(x.count, 42);
  assert.equal(data.totals.live, 0);
  assert.equal(data.totals.self_funded, 15.16);
  assert.ok(data.totals.unknown_rows >= 1);
  assert.match(html, /\$0\.00<\/div>live/);
  assert.match(data.built_at_et, /6:30 AM ET/);
});

test("every money row cites a source; classes are only live/test/self_funded", async () => {
  const { data } = await build({ fetchImpl: fakeFetch });
  for (const r of data.money) { assert.ok(r.source && r.source.length > 10, r.rail); assert.ok(["live", "test", "self_funded"].includes(r.class)); }
  assert.equal(totals([{ class: "live", amount_usd: null }]).unknown_rows, 1);
});

test("health board covers every surface with gated and DNS states", async () => {
  const { data, html } = await build({ fetchImpl: fakeFetch });
  assert.equal(data.health.find((p) => p.id === "release-gated").state, "gated");
  assert.equal(data.health.find((p) => p.id === "control-dns").state, "not_set_up");
  for (const p of data.health) assert.ok(html.includes(p.url));
  assert.ok(!/<script/i.test(html), "static page, no scripts");
});
