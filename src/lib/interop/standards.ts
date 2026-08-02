/**
 * Agent interoperability standards map (2025–2026 landscape)
 * + how LVL LTD / this Control Room implements each layer.
 */

export type StandardLayer =
  | "tools"
  | "agents"
  | "payments"
  | "identity"
  | "transport"
  | "commerce";

export type InteropStandard = {
  id: string;
  name: string;
  short: string;
  layer: StandardLayer;
  steward: string;
  status: "stable" | "emerging" | "extension" | "de-facto";
  since?: string;
  oneLiner: string;
  solves: string;
  doesNot: string;
  keyArtifacts: string[];
  transports: string[];
  complements: string[];
  refs: { label: string; href: string }[];
  lvl: {
    support: "live" | "partial" | "planned" | "n/a";
    surfaces: string[];
    notes: string;
  };
};

export const INTEROP_STANDARDS: InteropStandard[] = [
  {
    id: "mcp",
    name: "Model Context Protocol",
    short: "MCP",
    layer: "tools",
    steward: "Anthropic → Linux Foundation ecosystem",
    status: "stable",
    since: "2024",
    oneLiner: "How an agent discovers and calls tools, data sources, and local capabilities.",
    solves: "Agent ↔ tool / resource integration without custom adapters per model.",
    doesNot: "Peer agent task handoff across organizational boundaries.",
    keyArtifacts: ["tools/list", "tools/call", "resources", "prompts", "JSON schemas"],
    transports: ["stdio", "HTTP/SSE"],
    complements: ["a2a", "rest"],
    refs: [
      { label: "MCP specification", href: "https://modelcontextprotocol.io/specification" },
    ],
    lvl: {
      support: "partial",
      surfaces: ["Skill outlines as capability schemas", "Control Room tools as MCP-shaped descriptors"],
      notes: "LVL skills are productized tools; full MCP server export is a natural next rail.",
    },
  },
  {
    id: "a2a",
    name: "Agent-to-Agent Protocol",
    short: "A2A",
    layer: "agents",
    steward: "Google → Linux Foundation (150+ orgs by 2026)",
    status: "stable",
    since: "2025-04 (v1.0 2026-03)",
    oneLiner: "How independent agents discover each other and coordinate tasks as peers.",
    solves: "Cross-framework agent collaboration: cards, tasks, streaming updates, auth.",
    doesNot: "Replace tool protocols (MCP) or payment rails (x402/AP2).",
    keyArtifacts: [
      "Agent Card (JSON discovery)",
      "Task lifecycle (submitted→working→completed|failed)",
      "JSON-RPC methods (tasks/send, …)",
      "SSE streaming",
      "Signed Agent Cards (v1)",
    ],
    transports: ["HTTP", "gRPC", "SSE"],
    complements: ["mcp", "x402", "ap2"],
    refs: [
      { label: "A2A protocol", href: "https://a2a-protocol.org/latest/" },
      { label: "Linux Foundation A2A", href: "https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year" },
    ],
    lvl: {
      support: "partial",
      surfaces: [
        "/skills/agent-to-agent-a2a-protocols",
        "Agent Card author in A2A Workbench",
        "lvlltd skill: agent-to-agent-a2a-protocols",
      ],
      notes: "Workbench authors cards + task lifecycle; production Agent Card hosting is next.",
    },
  },
  {
    id: "acp",
    name: "Agent Communication Protocol",
    short: "ACP",
    layer: "agents",
    steward: "IBM / research ecosystem",
    status: "emerging",
    oneLiner: "Lightweight messaging-oriented agent communication (often REST/async).",
    solves: "Simpler message exchange when full A2A task semantics are overkill.",
    doesNot: "Universal enterprise task orchestration (A2A is the heavier standard).",
    keyArtifacts: ["message envelopes", "agent identity hints"],
    transports: ["HTTP/REST", "async queues"],
    complements: ["a2a", "mcp"],
    refs: [],
    lvl: {
      support: "planned",
      surfaces: ["Swarm message log in Control Room"],
      notes: "Control Room work logs are ACP-like; formal ACP mapping optional.",
    },
  },
  {
    id: "anp",
    name: "Agent Network Protocol",
    short: "ANP",
    layer: "identity",
    steward: "Community",
    status: "emerging",
    oneLiner: "Network-level agent identity and discovery (often DID + .well-known).",
    solves: "Decentralized discovery of agents beyond a single registry.",
    doesNot: "Task semantics or tool schemas.",
    keyArtifacts: ["DID documents", ".well-known agent descriptors"],
    transports: ["HTTPS"],
    complements: ["a2a"],
    refs: [],
    lvl: {
      support: "planned",
      surfaces: ["catalog.json as registry", "listing_url canonicals"],
      notes: "LVL catalog is a centralized registry; DID/ANP would federate multi-market discovery.",
    },
  },
  {
    id: "x402",
    name: "x402 Payment Protocol",
    short: "x402",
    layer: "payments",
    steward: "Coinbase / x402 Foundation (w/ Cloudflare et al.)",
    status: "stable",
    since: "2025",
    oneLiner: "HTTP-native pay-per-request using status 402 + stablecoin settlement.",
    solves: "Machine-payable APIs without accounts: challenge → pay USDC → unlock.",
    doesNot: "Human checkout UX or complex multi-party mandates alone (see AP2).",
    keyArtifacts: [
      "HTTP 402 Payment Required",
      "accepts[] (scheme, network, amount, asset, payTo)",
      "X-PAYMENT / payment proof headers",
      "on-chain verification",
    ],
    transports: ["HTTP"],
    complements: ["a2a", "ap2", "mcp"],
    refs: [
      { label: "x402.org", href: "https://x402.org/" },
      { label: "LVL x402 discovery", href: "https://lvlltd.com/api/x402" },
    ],
    lvl: {
      support: "live",
      surfaces: [
        "https://lvlltd.com/api/pay?skill=*",
        "https://lvlltd.com/api/x402",
        "/marketplace/x402",
        "Base USDC (eip155:8453)",
      ],
      notes: "Production: sealed skill packs unlock after USDC proof on Base.",
    },
  },
  {
    id: "ap2",
    name: "Agent Payments Protocol",
    short: "AP2",
    layer: "payments",
    steward: "Google Cloud + partners (MetaMask, Coinbase, EF, …)",
    status: "emerging",
    since: "2025-09",
    oneLiner: "Authorization mandates for agent-initiated payments (broader than HTTP 402).",
    solves: "Delegated spend policies, verifiable mandates, multi-rail agent checkout.",
    doesNot: "Replace simple HTTP micropayments (x402 remains the web-native primitive).",
    keyArtifacts: ["Intent mandates", "verifiable credentials", "A2A x402 extension"],
    transports: ["HTTP", "A2A extensions"],
    complements: ["x402", "a2a"],
    refs: [
      {
        label: "AP2 announcement",
        href: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol",
      },
    ],
    lvl: {
      support: "partial",
      surfaces: ["x402 challenge extras (mandates, allowance, approve APIs on LVL)"],
      notes: "LVL challenge payloads already expose mandate/allowance hooks for AP2-style flows.",
    },
  },
  {
    id: "rest",
    name: "HTTP / REST + OpenAPI",
    short: "REST",
    layer: "transport",
    steward: "IETF / OpenAPI Initiative",
    status: "de-facto",
    oneLiner: "The baseline web contract agents still need when protocols are overkill.",
    solves: "Stable resource access, caching, status codes, universal client support.",
    doesNot: "Agent identity, task state machines, or payment negotiation by itself.",
    keyArtifacts: ["OpenAPI", "JSON Schema", "status codes", "ETags"],
    transports: ["HTTP/HTTPS"],
    complements: ["mcp", "a2a", "x402"],
    refs: [],
    lvl: {
      support: "live",
      surfaces: [
        "/catalog.json",
        "/api/catalog",
        "/api/shop",
        "/api/proof",
        "ETag pagination on catalog",
      ],
      notes: "LVL is HTTP-first; x402 and A2A sit on top of REST resources.",
    },
  },
  {
    id: "erc7857",
    name: "ERC-7857 (agent skill / sealed asset patterns)",
    short: "ERC-7857",
    layer: "commerce",
    steward: "Ethereum community / LVL skill marketplace tagging",
    status: "emerging",
    oneLiner: "On-chain oriented patterns for skill packs and agent-owned digital goods.",
    solves: "Standard vocabulary for licensed/sealed digital assets in agent economies.",
    doesNot: "Replace HTTP discovery or x402 challenge flow.",
    keyArtifacts: ["sealed pack metadata", "license tokens"],
    transports: ["EVM chains"],
    complements: ["x402"],
    refs: [{ label: "LVL shop standards", href: "https://lvlltd.com/api/shop" }],
    lvl: {
      support: "partial",
      surfaces: ["shop schema standards: x402, ERC-7857", "sealed packs"],
      notes: "Referenced in LVL shop discovery as a marketplace standard tag.",
    },
  },
];

export type StackLayer = {
  id: string;
  title: string;
  question: string;
  standards: string[];
  lvlExample: string;
};

/** Vertical stack: how standards compose in a real agent purchase. */
export const INTEROP_STACK: StackLayer[] = [
  {
    id: "discover",
    title: "1. Discover",
    question: "What agents/skills exist?",
    standards: ["rest", "a2a", "anp"],
    lvlExample: "catalog.json · Agent Cards · listing_url",
  },
  {
    id: "describe",
    title: "2. Describe capabilities",
    question: "What can it do, for what price?",
    standards: ["mcp", "a2a", "rest"],
    lvlExample: "outline.json · slim catalog · A2A skills[]",
  },
  {
    id: "coordinate",
    title: "3. Coordinate work",
    question: "How do peers hand off tasks?",
    standards: ["a2a", "acp"],
    lvlExample: "Task lifecycle · Control Room handoffs · supervisor SLA",
  },
  {
    id: "pay",
    title: "4. Pay",
    question: "How does the agent settle value?",
    standards: ["x402", "ap2"],
    lvlExample: "HTTP 402 → USDC on Base → X-PAYMENT unlock",
  },
  {
    id: "tools",
    title: "5. Use tools",
    question: "How does an agent call local/remote tools?",
    standards: ["mcp", "rest"],
    lvlExample: "Scout proxies · skill packs as tools · proof API",
  },
  {
    id: "prove",
    title: "6. Prove & govern",
    question: "What evidence remains?",
    standards: ["x402", "rest", "erc7857"],
    lvlExample: "api/proof · audit packs · sealed license",
  },
];

export type ComplianceRow = {
  capability: string;
  standard: string;
  lvlStatus: "live" | "partial" | "gap";
  evidence: string;
};

export const LVL_COMPLIANCE: ComplianceRow[] = [
  {
    capability: "Machine-readable skill inventory",
    standard: "REST catalog",
    lvlStatus: "live",
    evidence: "catalog.json fields=meta|slim|full + ETag pagination",
  },
  {
    capability: "HTTP-native payment challenge",
    standard: "x402",
    lvlStatus: "live",
    evidence: "/api/pay → 402 accepts[] on Base USDC",
  },
  {
    capability: "Payment discovery document",
    standard: "x402",
    lvlStatus: "live",
    evidence: "/api/x402 network, asset, pay_to, verification",
  },
  {
    capability: "Free evaluate before pay",
    standard: "commerce UX",
    lvlStatus: "live",
    evidence: "outline.json + sample.md on listings",
  },
  {
    capability: "Agent Card publishing",
    standard: "A2A",
    lvlStatus: "partial",
    evidence: "Workbench authors cards; .well-known host TBD",
  },
  {
    capability: "Task lifecycle streaming",
    standard: "A2A",
    lvlStatus: "partial",
    evidence: "Lifecycle UI + Control Room status; SSE transport TBD",
  },
  {
    capability: "MCP tool server",
    standard: "MCP",
    lvlStatus: "gap",
    evidence: "Natural export of catalog/pay/proof as MCP tools",
  },
  {
    capability: "Spend mandates / AP2",
    standard: "AP2",
    lvlStatus: "partial",
    evidence: "Challenge extras: allowance, approve, mandates URLs",
  },
  {
    capability: "Cross-agent orchestration",
    standard: "A2A + internal",
    lvlStatus: "live",
    evidence: "Control Room hub-spoke/swarm + Skill Pack Studio",
  },
  {
    capability: "Audit / compliance trail",
    standard: "governance",
    lvlStatus: "partial",
    evidence: "Audit Evidence Desk + /api/proof; hash-chain export next",
  },
];

export function getStandard(id: string) {
  return INTEROP_STANDARDS.find((s) => s.id === id);
}

export function standardsByLayer(layer: StandardLayer) {
  return INTEROP_STANDARDS.filter((s) => s.layer === layer);
}
