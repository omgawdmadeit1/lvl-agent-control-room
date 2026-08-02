import type { MarketplaceRail } from "./types";

/** Product rails behind lvlltd.com — agent commerce lifecycle. */
export const MARKETPLACE_RAILS: MarketplaceRail[] = [
  {
    id: "discovery",
    name: "Discovery",
    status: "live",
    idea: "Agents find skills via catalog.json, shop API, search, and ranked categories — not human storefronts alone.",
    productSurface: "catalog.json · /api/catalog · /api/shop · listings/",
    metric: "236 skills",
  },
  {
    id: "negotiation",
    name: "Negotiation",
    status: "partial",
    idea: "Machine-readable terms: price, network, asset, timeout, outline before pay, done_when schemas.",
    productSurface: "x402 challenge · outline.json · A2A cards",
    metric: "HTTP 402 accept",
  },
  {
    id: "sandbox",
    name: "Sandbox / sample",
    status: "partial",
    idea: "Free outline + sample before USDC unlock so agents can evaluate fit without spending.",
    productSurface: "outline.json · sample.md · signals",
  },
  {
    id: "x402",
    name: "x402 payments",
    status: "live",
    idea: "Pay-per-skill on Base USDC with sealed pack unlock after X-PAYMENT proof.",
    productSurface: "/api/pay · Base mainnet · ERC-7857",
    metric: "USDC on Base",
  },
  {
    id: "oracles",
    name: "Outcome oracles",
    status: "partial",
    idea: "Verify payment + delivery; multi-check for high-ticket skills; proof ledger for audit.",
    productSurface: "/api/proof · payment logs",
  },
  {
    id: "governance",
    name: "Governance & trust",
    status: "partial",
    idea: "Proof ledger, sealed packs, skill quality rails, and agent-auditable inventory.",
    productSurface: "proof · sealed packs · tiers",
  },
];
