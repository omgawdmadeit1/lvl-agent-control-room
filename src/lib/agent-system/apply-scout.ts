import type { AgentSystemState, Artifact } from "./types";
import { scoreSiteHealth } from "./site-health";

/**
 * Fold live scout findings into board tasks, rails, and audit notes.
 */
export function applyScoutToBoard(state: AgentSystemState): AgentSystemState {
  if (!state.liveScout.findings.length) return state;

  const findings = state.liveScout.findings;
  const byId = Object.fromEntries(findings.map((f) => [f.id, f]));
  const now = new Date().toISOString();
  let tasks = state.tasks;
  let rails = state.rails;
  let audit = state.audit;
  const notes: string[] = [];

  // Listing seal bug → boost P0.2 evidence
  const listing = byId["listing_canonical"];
  if (listing?.ok) {
    const data = listing.data as { seal_listing_bug?: boolean; trailing_slash?: number; dot_html?: number };
    if (data?.seal_listing_bug) {
      notes.push("Scout confirmed seal.listing .html 404 — P0.2 remains critical path.");
      tasks = tasks.map((t) =>
        t.id === "P0.2"
          ? {
              ...t,
              detail:
                t.detail +
                ` [scout: slash=${data.trailing_slash} html=${data.dot_html} bug=true]`,
              workLog: [...t.workLog, `${now} scout evidence attached (seal bug confirmed)`],
              status: t.status === "DONE" ? t.status : t.status === "PENDING" ? "READY" : t.status,
            }
          : t,
      );
    }
  }

  // x402 live → update rail
  const x402 = byId["x402_orchestration"];
  if (x402?.ok) {
    const data = x402.data as { status?: number; amount_usd?: number; payTo?: string };
    rails = rails.map((r) =>
      r.id === "x402"
        ? {
            ...r,
            status: "live",
            note: `Challenge HTTP ${data.status}; $${data.amount_usd}; payTo ${(data.payTo || "").slice(0, 10)}…`,
          }
        : r,
    );
    notes.push("x402 rail verified live via orchestration challenge.");
  }

  // proof ledger → governance note
  const proof = byId["proof"];
  if (proof?.ok) {
    const data = proof.data as {
      confirmed?: { unlock_count?: number; volume_usdc?: number };
    };
    rails = rails.map((r) =>
      r.id === "governance"
        ? {
            ...r,
            status: "partial",
            note: `Proof confirmed unlocks=${data.confirmed?.unlock_count ?? "?"} vol=$${data.confirmed?.volume_usdc ?? "?"}`,
          }
        : r,
    );
  }

  // catalog sizes → discovery rail
  const meta = byId["catalog_meta"];
  const slim = byId["catalog_slim"];
  if (meta?.ok || slim?.ok) {
    const slimData = slim?.data as { bytes?: number; n?: number } | undefined;
    const metaData = meta?.data as { bytes?: number } | undefined;
    rails = rails.map((r) =>
      r.id === "discovery"
        ? {
            ...r,
            status: "partial",
            note: `meta ${metaData?.bytes ?? "?"}B · slim n=${slimData?.n ?? "?"} (${slimData?.bytes ?? "?"}B)`,
          }
        : r,
    );
    if (slimData?.bytes && slimData.bytes > 500_000) {
      notes.push("Slim catalog still large — prioritize P3.1.");
      tasks = tasks.map((t) =>
        t.id === "P3.1" && t.status === "PENDING"
          ? { ...t, status: "READY", workLog: [...t.workLog, `${now} scout: slim payload large`] }
          : t,
      );
    }
  }

  // status page brand
  const status = byId["status_page"];
  if (status?.ok) {
    const data = status.data as { has_skill_market?: boolean };
    if (!data.has_skill_market) {
      notes.push("Status page may lack skill-market language — check GSC brand.");
    }
  }

  const health = scoreSiteHealth(findings);
  audit = {
    ...audit,
    goNoGo: health.goNoGo === "go" ? "go" : health.goNoGo === "no-go" ? "no-go" : "pending",
    riskScore: Math.min(1, Math.max(0, 1 - health.score / 100 + (health.goNoGo === "no-go" ? 0.15 : 0))),
    notes: `Site health ${health.score}/${health.grade}: ${health.topActions[0] || audit.notes}`,
  };

  const failN = findings.filter((f) => !f.ok).length;
  if (failN > 0) {
    audit = {
      ...audit,
      notes: `${audit.notes} Scout: ${failN} probe(s) failed.`,
      riskScore: Math.min(1, audit.riskScore + failN * 0.05),
    };
  }

  const art: Artifact = {
    id: `art-scout-apply-${Date.now().toString(36)}`,
    type: "scout_apply",
    title: "Scout findings applied to board",
    body: JSON.stringify({ applied_at: now, notes, findings: findings.map((f) => f.id) }, null, 2),
    createdAt: now,
    role: "conductor",
  };

  return {
    ...state,
    tasks,
    rails,
    audit,
    artifacts: [art, ...state.artifacts],
    roles: state.roles.map((r) =>
      r.id === "conductor"
        ? { ...r, status: "working", lastAction: notes[0] || "Applied scout findings" }
        : r,
    ),
    log: [
      {
        t: now,
        msg: `Applied scout → board (${notes.length} notes)`,
        level: "ok" as const,
      },
      ...notes.map((n) => ({ t: now, msg: n, level: "info" as const })),
      ...state.log,
    ].slice(0, 120),
  };
}
