/** LVL LTD marketplace types — mirror live catalog slim + x402 challenge. */

export type SkillTier = "free" | "premium" | string;

export type CatalogSkill = {
  id: string;
  name: string;
  price_usd: number;
  price_label: string;
  category: string;
  tier: SkillTier;
  summary: string;
  tags: string[];
  listing_url: string;
  outline?: string;
  challenge?: string;
};

export type CatalogMeta = {
  ok?: boolean;
  schema?: string;
  skill_count: number;
  premium_count?: number;
  version?: string;
  updated_at?: string;
  links?: Record<string, string>;
};

export type X402Accept = {
  scheme?: string;
  network?: string;
  amount?: string;
  asset?: string;
  payTo?: string;
  maxTimeoutSeconds?: number;
  extra?: {
    name?: string;
    skill_id?: string;
    price_usd?: number;
    outline?: string;
    sample?: string;
    unlock?: string;
    standards?: string[];
  };
};

export type X402Challenge = {
  ok: boolean;
  status: number;
  error?: string;
  message?: string;
  protocol?: string;
  description?: string;
  resource?: { url?: string; description?: string };
  accepts?: X402Accept[];
  rawKeys: string[];
  priceUsd?: number;
  network?: string;
  payTo?: string;
  skillId?: string;
};

export type MarketplaceRail = {
  id: string;
  name: string;
  status: "live" | "partial" | "planned";
  idea: string;
  productSurface: string;
  metric?: string;
};

export type MarketplaceSnapshot = {
  loadedAt: string;
  durationMs: number;
  meta: CatalogMeta;
  skills: CatalogSkill[];
  categories: { name: string; count: number }[];
  premiumCount: number;
  freeCount: number;
  priceBuckets: { label: string; count: number; min: number; max: number }[];
  rails: MarketplaceRail[];
  featured: CatalogSkill[];
};
