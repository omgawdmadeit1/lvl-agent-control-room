/**
 * Tokenized settlement intelligence — distilled from BIS Project Agorá
 * materials, XRPL xrpld 3.3.0 coverage, and X discourse (Aug 2026).
 *
 * NOTE: Community posts often claim "Agorá = XRPL". Primary sources describe
 * Agorá as a multi-party prototype using tokenised deposits + CB reserves,
 * not as XRP-as-settlement-asset. XRPL capabilities may *align thematically*
 * (atomic batches, permissions, privacy) without being the Agorá ledger.
 */

export type SourceRef = {
  label: string;
  href: string;
  kind: "primary" | "reporting" | "x-discourse";
};

export type AgoráFact = {
  id: string;
  claim: string;
  detail: string;
  confidence: "high" | "medium" | "low";
  sources: SourceRef[];
};

export const AGORA_BRIEF: AgoráFact[] = [
  {
    id: "what",
    claim: "Shared programmable platform for wholesale cross-border payments",
    detail:
      "Project Agorá (Greek for marketplace) is a BIS + IIF public-private collaboration exploring tokenisation of commercial bank deposits combined with tokenised central bank reserves for multi-currency wholesale settlement.",
    confidence: "high",
    sources: [
      {
        label: "BIS Innovation Hub — Agorá",
        href: "https://www.bis.org/about/bisih/topics/fmis/agora.htm",
        kind: "primary",
      },
      {
        label: "BIS publication othp110",
        href: "https://www.bis.org/publ/othp110.htm",
        kind: "primary",
      },
    ],
  },
  {
    id: "who",
    claim: "Central banks + large private banks",
    detail:
      "Prototype work involved seven–eight central banks and 40+ regulated FIs. Real-value testing (RVT) in July 2026 involved 28 institutions/central banks across Asia, Europe, and North America.",
    confidence: "high",
    sources: [
      {
        label: "BIS Agorá page (RVT update)",
        href: "https://www.bis.org/about/bisih/topics/fmis/agora.htm",
        kind: "primary",
      },
    ],
  },
  {
    id: "rvt",
    claim: "Real-value testing ~CHF 800k across 17 scenarios",
    detail:
      "July 2026 RVT: ~CHF 800,000 total; scenario values roughly CHF 9k–125k. Secondary reports also cite ~$1M across six currencies averaging ~80s — treat media numbers as approximate unless confirmed in primary docs.",
    confidence: "medium",
    sources: [
      {
        label: "BIS Agorá RVT",
        href: "https://www.bis.org/about/bisih/topics/fmis/agora.htm",
        kind: "primary",
      },
      {
        label: "X trend summary (secondary)",
        href: "https://x.com/i/trending/2083623212202823882",
        kind: "x-discourse",
      },
    ],
  },
  {
    id: "tech",
    claim: "Atomic multi-currency settlement + smart-contract workflow",
    detail:
      "Prototype showed tokenised deposits + tokenised CB reserves enabling atomic (all-or-nothing) multi-currency settlement with embedded compliance/workflow logic — reducing reconciliation and manual steps while preserving settlement finality / AML-CFT constraints.",
    confidence: "high",
    sources: [
      {
        label: "ECB note on Agorá",
        href: "https://www.ecb.europa.eu/press/intro/news/html/ecb.mipnews20260527.en.html",
        kind: "primary",
      },
    ],
  },
  {
    id: "not-xrp",
    claim: "Agorá settlement asset ≠ XRP (per careful discourse)",
    detail:
      "Primary materials emphasize tokenised bank money and CB reserves. Independent X analysis notes Agorá is not defined as settling in XRP. XRPL upgrades are thematically adjacent (atomic batches, institutional controls), not proven Agorá infrastructure.",
    confidence: "medium",
    sources: [
      {
        label: "XRPpundit note on settlement asset",
        href: "https://x.com/XRPpundit/status/2083599865611792434",
        kind: "x-discourse",
      },
      {
        label: "BIS Agorá concept",
        href: "https://www.bis.org/about/bisih/topics/fmis/agora.htm",
        kind: "primary",
      },
    ],
  },
];

export type XrplAmendment = {
  id: string;
  name: string;
  status: "proposed" | "revised" | "hotfix-related";
  oneLiner: string;
  enables: string[];
  agentAngle: string;
  riskNote?: string;
};

/** xrpld 3.3.0 — five amendments (validator vote still required: ~80% for 2 weeks). */
export const XRPL_330_AMENDMENTS: XrplAmendment[] = [
  {
    id: "confidential-mpt",
    name: "Confidential MPT",
    status: "proposed",
    oneLiner:
      "Privacy for Multi-Purpose Tokens using ZK proofs + elliptic-curve encryption for balances/amounts.",
    enables: [
      "Private tokenized-asset activity",
      "Institutional confidentiality on public rails",
      "Selective disclosure patterns",
    ],
    agentAngle:
      "Agents can settle tokenized inventory without leaking full positions to every observer.",
  },
  {
    id: "batch",
    name: "Batch (BatchV1_1)",
    status: "revised",
    oneLiner:
      "Atomic multi-tx packages (up to ~8 cross-account ops): all succeed or all fail.",
    enables: [
      "Delivery-vs-payment style atomicity",
      "Multi-leg settlement without partial fills",
      "Lower operational risk in multi-party flows",
    ],
    agentAngle:
      "Agent swarms can commit multi-step deals (pay + unlock + receipt) as one atomic unit.",
    riskNote: "Earlier Batch proposal was withdrawn after security findings; 3.3.0 ships revised form.",
  },
  {
    id: "permission-delegation",
    name: "Permission Delegation",
    status: "revised",
    oneLiner:
      "Narrowly scoped delegated signing authority without handing over full keys.",
    enables: [
      "Role-based institutional ops",
      "Least-privilege agent operators",
      "Safer multi-user treasury control",
    ],
    agentAngle:
      "Marketplace agents can hold spend scopes (e.g. max $N / skill category) without full wallet control.",
    riskNote: "Prior version disabled after critical vuln disclosures; revised for 3.3.0 vote.",
  },
  {
    id: "sponsored-fees",
    name: "Sponsored Fees and Reserves",
    status: "proposed",
    oneLiner:
      "A sponsor (bank/issuer/platform) pays XRP fees and reserves for another account.",
    enables: [
      "Gasless / fee-abstracted UX",
      "Institution-sponsored end users",
      "Lower onboarding friction",
    ],
    agentAngle:
      "LVL-like platforms could sponsor micro-agent fees so buyers only care about skill USDC price.",
  },
  {
    id: "dynamic-mpt",
    name: "Dynamic MPT",
    status: "proposed",
    oneLiner:
      "Issuers adjust certain token properties post-issuance without full migrations.",
    enables: [
      "Compliance parameter updates",
      "Lifecycle fixes without reissue",
      "Evolving RWA metadata",
    ],
    agentAngle:
      "Skill/license tokens can update policy fields as regulation or product terms change.",
  },
];

export type RailCompare = {
  id: string;
  name: string;
  domain: string;
  settlementAsset: string;
  atomicity: string;
  privacy: string;
  programmability: string;
  agentFit: string;
  maturity: "prototype" | "production" | "proposed";
};

export const RAIL_COMPARE: RailCompare[] = [
  {
    id: "agora",
    name: "BIS Project Agorá",
    domain: "Wholesale cross-border (central banks + banks)",
    settlementAsset: "Tokenised deposits + tokenised CB reserves",
    atomicity: "Atomic multi-currency settlement demonstrated",
    privacy: "Permissioned / regulated data rules",
    programmability: "Smart contracts for workflow + compliance",
    agentFit: "Indirect — shapes rails agents eventually settle on at bank scale",
    maturity: "prototype",
  },
  {
    id: "xrpl-330",
    name: "XRP Ledger (xrpld 3.3.0 amendments)",
    domain: "Public L1 + institutional tokenized assets",
    settlementAsset: "XRP fees; issued tokens / MPTs / RWAs (e.g. OUSG via RLUSD flows in discourse)",
    atomicity: "Batch: multi-account atomic packages (if activated)",
    privacy: "Confidential MPT (ZK) if activated",
    programmability: "Native amendments + issued token logic",
    agentFit: "Strong for tokenized inventory + fee sponsorship + delegated agent ops",
    maturity: "proposed",
  },
  {
    id: "lvl-x402",
    name: "LVL LTD x402 (Base USDC)",
    domain: "Agent skill marketplace micropayments",
    settlementAsset: "USDC on Base (eip155:8453)",
    atomicity: "Pay then unlock sealed pack (challenge → proof → deliver)",
    privacy: "Public chain; skill outlines free, packs sealed",
    programmability: "HTTP 402 accepts[] + optional AP2 mandate hooks",
    agentFit: "Production path for agent commerce today",
    maturity: "production",
  },
];

/** Design patterns agents should steal from Agorá + XRPL discourse. */
export const AGENT_PATTERNS = [
  {
    id: "atomic-multi-leg",
    title: "Atomic multi-leg settlement",
    from: "Agorá atomic multi-currency · XRPL Batch",
    apply:
      "Bundle pay + unlock + proof-write as one all-or-nothing unit (or explicit compensating tx).",
  },
  {
    id: "least-privilege",
    title: "Least-privilege agent keys",
    from: "Permission Delegation",
    apply:
      "Issue scoped operator keys (max amount, skill categories, time window) — never full treasury.",
  },
  {
    id: "sponsor-fees",
    title: "Fee sponsorship / abstraction",
    from: "Sponsored Fees and Reserves",
    apply:
      "Platform pays gas; agent budgets only skill USDC. Matches consumer mental model of 'price tag'.",
  },
  {
    id: "selective-privacy",
    title: "Selective privacy for inventory",
    from: "Confidential MPT",
    apply:
      "Publish capability cards; hide amounts/counterparties until need-to-know (auditors/oracles).",
  },
  {
    id: "programmable-compliance",
    title: "Compliance in the settlement path",
    from: "Agorá smart-contract workflows",
    apply:
      "Encode AML/approval gates into unlock path (LVL: approval_id + audit pack + proof).",
  },
  {
    id: "dynamic-terms",
    title: "Dynamic product terms",
    from: "Dynamic MPT",
    apply:
      "Allow post-list price/policy updates with versioned catalog ETags — no silent rewrites.",
  },
];

export type BatchLeg = {
  id: string;
  from: string;
  to: string;
  action: string;
  amountUsd: number;
};

export function simulateAtomicBatch(legs: BatchLeg[], failId?: string) {
  if (failId && legs.some((l) => l.id === failId)) {
    return {
      ok: false,
      applied: [] as BatchLeg[],
      reason: `Atomic abort: leg ${failId} failed — no legs applied`,
      totalUsd: 0,
    };
  }
  const totalUsd = Math.round(legs.reduce((a, l) => a + l.amountUsd, 0) * 100) / 100;
  return { ok: true, applied: legs, reason: "All legs committed", totalUsd };
}

export function simulateDelegation(scope: {
  maxUsd: number;
  categories: string[];
  expiresHours: number;
  requestUsd: number;
  category: string;
}) {
  const reasons: string[] = [];
  if (scope.requestUsd > scope.maxUsd) reasons.push("exceeds maxUsd");
  if (!scope.categories.includes(scope.category) && !scope.categories.includes("*"))
    reasons.push("category not delegated");
  if (scope.expiresHours <= 0) reasons.push("delegation expired");
  return {
    allowed: reasons.length === 0,
    reasons,
    remainingUsd: Math.max(0, Math.round((scope.maxUsd - scope.requestUsd) * 100) / 100),
  };
}

export function sponsoredFeeModel(opts: {
  agentTxCount: number;
  feePerTxXrp: number;
  xrpUsd: number;
  sponsorCovers: boolean;
}) {
  const grossXrp = opts.agentTxCount * opts.feePerTxXrp;
  const grossUsd = Math.round(grossXrp * opts.xrpUsd * 10000) / 10000;
  return {
    agentPaysUsd: opts.sponsorCovers ? 0 : grossUsd,
    sponsorPaysUsd: opts.sponsorCovers ? grossUsd : 0,
    grossXrp,
    note: opts.sponsorCovers
      ? "Agent only budgets skill USDC; platform sponsors rail fees."
      : "Agent must hold fee token + skill payment asset.",
  };
}

export const TREND_META = {
  xTrend: "https://x.com/i/trending/2083623212202823882",
  title: "XRP Ledger Upgrades Align with BIS Tokenized Payment Tests",
  asOf: "2026-08-01",
  xrpPriceMention: "~$1.06 (discourse; not financial advice)",
};
