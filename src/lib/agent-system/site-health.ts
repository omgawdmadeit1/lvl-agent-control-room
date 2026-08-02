import type { ScoutFinding } from "./live-scout";

export type HealthScore = {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  goNoGo: "go" | "no-go" | "caution";
  checks: { id: string; weight: number; pass: boolean; note: string }[];
  topActions: string[];
};

export function scoreSiteHealth(findings: ScoutFinding[]): HealthScore {
  const by = Object.fromEntries(findings.map((f) => [f.id, f]));
  const checks: HealthScore["checks"] = [];

  const home = by["status_page"] || by["home"];
  // catalog_meta
  const meta = by["catalog_meta"];
  checks.push({
    id: "catalog_meta",
    weight: 15,
    pass: !!meta?.ok,
    note: meta?.ok
      ? `meta ok ${meta.ms}ms · ${JSON.stringify((meta.data as { skill_count?: number })?.skill_count ?? "?")} skills`
      : meta?.detail || "meta missing",
  });

  const slim = by["catalog_slim"];
  const slimBytes = (slim?.data as { bytes?: number })?.bytes ?? 0;
  const slimOk = !!slim?.ok && slimBytes > 0 && slimBytes < 400_000;
  checks.push({
    id: "catalog_slim",
    weight: 15,
    pass: slimOk,
    note: slim?.ok
      ? `slim ${slimBytes}B · n=${(slim.data as { n?: number })?.n ?? "?"}${(slimBytes > 200_000 ? " (still heavy)" : "")}`
      : slim?.detail || "slim fail",
  });

  const proof = by["proof"];
  checks.push({
    id: "proof",
    weight: 15,
    pass: !!proof?.ok,
    note: proof?.ok ? `proof ledger ${proof.ms}ms` : proof?.detail || "proof fail",
  });

  const x402 = by["x402_orchestration"];
  const xStatus = (x402?.data as { status?: number })?.status;
  checks.push({
    id: "x402",
    weight: 20,
    pass: !!x402?.ok && (xStatus === 402 || xStatus === 200),
    note: x402?.ok ? `challenge HTTP ${xStatus}` : x402?.detail || "x402 fail",
  });

  const listing = by["listing_canonical"];
  const sealBug = !!(listing?.data as { seal_listing_bug?: boolean })?.seal_listing_bug;
  checks.push({
    id: "listing_urls",
    weight: 20,
    pass: !!listing?.ok && !sealBug,
    note: listing?.ok
      ? sealBug
        ? "CONFIRMED: .html 404 vs trailing-slash 200 — fix seal.listing"
        : "listing URL shape healthy"
      : listing?.detail || "listing check fail",
  });

  const status = by["status_page"];
  checks.push({
    id: "status",
    weight: 10,
    pass: !!status?.ok,
    note: status?.ok ? `status page ${status.ms}ms` : status?.detail || "status fail",
  });

  // optional robots/sitemap if present
  for (const id of ["robots", "sitemap", "home"] as const) {
    const f = by[id];
    if (!f) continue;
    checks.push({
      id,
      weight: 5,
      pass: !!f.ok,
      note: f.ok ? `${id} ok ${f.ms}ms` : f.detail || `${id} fail`,
    });
  }

  const totalW = checks.reduce((a, c) => a + c.weight, 0) || 1;
  const earned = checks.reduce((a, c) => a + (c.pass ? c.weight : 0), 0);
  const score = Math.round((earned / totalW) * 100);
  const grade: HealthScore["grade"] =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const goNoGo: HealthScore["goNoGo"] =
    score >= 85 && !sealBug ? "go" : sealBug || score < 70 ? "no-go" : "caution";

  const topActions: string[] = [];
  if (sealBug) topActions.push("P0: Rewrite seal.listing URLs to trailing-slash canonical");
  if (slimBytes > 200_000) topActions.push("P3: Further slim catalog payload (fields + pagination)");
  if (!proof?.ok) topActions.push("Fix /api/proof availability");
  if (!x402?.ok) topActions.push("Verify x402 challenge path for agent-orchestration");
  if (topActions.length === 0) topActions.push("Maintain green rails · continue focus-four P0 board");

  return { score, grade, goNoGo, checks, topActions };
}
