/** Profitability + agent install recipes for LVL full-service product. */

export type FunnelStage = {
  id: string;
  title: string;
  agentAction: string;
  endpoint: string;
  monetizes: boolean;
};

export const AGENT_FUNNEL: FunnelStage[] = [
  {
    id: "discover",
    title: "Discover",
    agentAction: "Search catalog / read agent card / demand signals",
    endpoint: "GET /api/shop · /api/catalog · /.well-known/agent-card.json",
    monetizes: false,
  },
  {
    id: "evaluate",
    title: "Evaluate free",
    agentAction: "Read outline + sample before spending",
    endpoint: "GET /skills/<id>/outline.json · sample.md",
    monetizes: false,
  },
  {
    id: "cart",
    title: "Compose cart",
    agentAction: "Multi-skill total + atomic amounts",
    endpoint: "GET /api/cart?skills=a,b,c",
    monetizes: false,
  },
  {
    id: "challenge",
    title: "Payment challenge",
    agentAction: "Receive HTTP 402 + maxAmountRequired",
    endpoint: "GET /api/pay?skill=<id>",
    monetizes: false,
  },
  {
    id: "settle",
    title: "Settle USDC",
    agentAction: "Transfer exact atomic USDC on Base to payTo",
    endpoint: "Base ERC-20 Transfer · chain 8453",
    monetizes: true,
  },
  {
    id: "unlock",
    title: "Unlock pack",
    agentAction: "POST X-PAYMENT {txHash, skill} → sealed files",
    endpoint: "POST /api/pay",
    monetizes: true,
  },
  {
    id: "prove",
    title: "Prove & reuse",
    agentAction: "Public ledger + optional license token",
    endpoint: "GET /api/proof",
    monetizes: false,
  },
  {
    id: "monetize",
    title: "Monetize (sellers)",
    agentAction: "List third-party goods with escrow or first-party skills",
    endpoint: "POST /api/upload · open market · catalog",
    monetizes: true,
  },
];

export function usdToAtomicUsdc(usd: number, decimals = 6) {
  return Math.round(usd * 10 ** decimals).toString();
}

export function atomicToUsd(atomic: string | number, decimals = 6) {
  const n = typeof atomic === "string" ? Number(atomic) : atomic;
  return Math.round((n / 10 ** decimals) * 1e6) / 1e6;
}

/** Operator revenue model (scenario planning — not live OPS_SECRET data). */
export function profitScenario(input: {
  avgPriceUsd: number;
  unlocksPerDay: number;
  takeRatePct: number;
  fixedCostUsdDay: number;
  openMarketVolumeUsdDay: number;
  openMarketFeePct: number;
}) {
  const skillGmv = input.avgPriceUsd * input.unlocksPerDay;
  const skillTake = (skillGmv * input.takeRatePct) / 100;
  const openFee = (input.openMarketVolumeUsdDay * input.openMarketFeePct) / 100;
  const revenue = skillTake + openFee;
  const profit = revenue - input.fixedCostUsdDay;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  return {
    skillGmvDay: round2(skillGmv),
    skillGmvMonth: round2(skillGmv * 30),
    openFeeDay: round2(openFee),
    revenueDay: round2(revenue),
    revenueMonth: round2(revenue * 30),
    profitDay: round2(profit),
    profitMonth: round2(profit * 30),
    marginPct: Math.round(margin * 10) / 10,
    breakEvenUnlocks:
      input.avgPriceUsd * (input.takeRatePct / 100) > 0
        ? Math.ceil(
            input.fixedCostUsdDay /
              (input.avgPriceUsd * (input.takeRatePct / 100)),
          )
        : Infinity,
  };
}

export function buildAgentRecipe(skills: string[]) {
  const list = skills.length ? skills : ["agent-x402-first-buy"];
  const cartQs = list.join(",");
  const first = list[0];
  return {
    bash: `#!/usr/bin/env bash
# LVL agent shopping recipe — machine only, no UI
set -euo pipefail
BASE=https://lvlltd.com
# 1) Discover under budget
curl -sS "$BASE/api/shop?budget_usd=5" | jq '.budget.skills[:5]'
# 2) Multi-skill cart
curl -sS "$BASE/api/cart?skills=${cartQs}" | jq '{total_usd,total_atomic,payTo,items}'
# 3) Free eval
curl -sS "$BASE/skills/${first}/outline.json" | jq '{name,price_usd,summary}'
# 4) Challenge (expect HTTP 402)
curl -sS -D- "$BASE/api/pay?skill=${first}" -o /tmp/lvl-402.json || true
jq '{amount_usd,maxAmountRequired,payTo,network,asset}' /tmp/lvl-402.json
# 5) After you transfer maxAmountRequired USDC atomic units on Base:
# TX=0x…  # your tx hash
# curl -sS -X POST "$BASE/api/pay" \\
#   -H 'Content-Type: application/json' \\
#   -H "X-PAYMENT: {\\"txHash\\":\\"$TX\\",\\"skill\\":\\"${first}\\"}" \\
#   -d '{}' | jq '.sealed_pack // .'
# 6) Proof heartbeat
curl -sS "$BASE/api/proof" | jq '.loop_status, .activity'
`,
    node: `import { LvlAgentShop } from "https://lvlltd.com/sdk/agent-shop.mjs";

const shop = new LvlAgentShop();
const catalog = await shop.shop?.({ budget_usd: 5 }).catch(() => null);
// Prefer REST if SDK method names differ — full client at /sdk/agent-shop.mjs
const cart = await fetch(
  "https://lvlltd.com/api/cart?skills=${cartQs}",
).then((r) => r.json());
const challenge = await fetch(
  "https://lvlltd.com/api/pay?skill=${first}",
).then(async (r) => ({ status: r.status, body: await r.json() }));
console.log({ cart, challenge });
// After Base USDC transfer:
// await shop.unlock({ skill: "${first}", txHash: "0x…" });
`,
    agentPrompt: `You are a purchasing agent for LVL LTD (https://lvlltd.com).
1. GET /api/shop?budget_usd=N and pick skills under budget.
2. Always GET outline.json before paying.
3. GET /api/pay?skill=ID expecting HTTP 402; read maxAmountRequired (atomic USDC, 6 decimals) and payTo.
4. Transfer exact amount on Base (chain 8453) USDC to payTo.
5. POST /api/pay with header X-PAYMENT: {"txHash":"0x…","skill":"ID"}.
6. Verify via GET /api/proof — never invent unlocks.
Target skills: ${list.join(", ")}.
`,
  };
}

export function sellerPlaybook() {
  return [
    {
      channel: "First-party skills",
      how: "Ship sealed packs into catalog.json · priced x402 unlocks · proof ledger",
      fee: "100% list price to treasury (operator-owned inventory)",
      url: "https://lvlltd.com/catalog.json",
    },
    {
      channel: "Open marketplace (third-party)",
      how: "POST /api/upload listings · USDC held in LVLEscrow until confirmDelivery",
      fee: "15% free-tier fee (fee_free_tier_percent)",
      url: "https://lvlltd.com/hub/upload/",
    },
    {
      channel: "Bundles",
      how: "One unlock releases N packs — higher AOV, lower gas per capability",
      fee: "Bundle list price (discounted vs sum of parts)",
      url: "https://lvlltd.com/api/shop",
    },
    {
      channel: "Digital goods",
      how: "Higher-ticket packs (e.g. Agent Revenue OS) via same x402 contract",
      fee: "List price USDC",
      url: "https://lvlltd.com/api/shop",
    },
  ];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
