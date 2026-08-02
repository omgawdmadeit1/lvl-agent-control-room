/**
 * Twelve LVL skill packs → usable Control Room products.
 * Missing catalog IDs map to closest live skills + original product thesis.
 */
export type SkillPackId =
  | "agent-auditor-compliance-specialist"
  | "agent-economy-marketplace-operator"
  | "agent-evaluation-red-teaming-certification-specialist"
  | "agent-goal-decomposer-orchestrator"
  | "agent-marketplace-infrastructure"
  | "agent-memory-context-engineer"
  | "agent-orchestration"
  | "agent-supervisor"
  | "agent-to-agent-a2a-protocols"
  | "agentic-process-redesigner"
  | "ai-agent-building-orchestration"
  | "ai-workflow-automation-no-code-agentic";

export type SkillPack = {
  id: SkillPackId;
  name: string;
  shortName: string;
  category: string;
  thesis: string;
  productName: string;
  productSummary: string;
  /** Live lvlltd catalog id when different from pack id */
  catalogId: string;
  relatedCatalogIds: string[];
  tools: { id: string; label: string }[];
};

export const SKILL_PACKS: SkillPack[] = [
  {
    id: "agent-auditor-compliance-specialist",
    name: "Agent Auditor Compliance Specialist",
    shortName: "Auditor",
    category: "Trust",
    thesis: "Compliance-ready audit trails: who authorized, what ran, what was paid, what evidence remains.",
    productName: "Audit Evidence Desk",
    productSummary: "Build authorization chains, payment proofs, and exportable compliance packs.",
    catalogId: "agent-auditor-compliance-specialist",
    relatedCatalogIds: ["agent-auditor-compliance-specialist"],
    tools: [
      { id: "chain", label: "Auth chain" },
      { id: "evidence", label: "Evidence checklist" },
      { id: "export", label: "Export pack" },
    ],
  },
  {
    id: "agent-economy-marketplace-operator",
    name: "Agent Economy Marketplace Operator",
    shortName: "Market Ops",
    category: "Commerce",
    thesis: "Operate listings, pricing, buyer matching, and revenue splits.",
    productName: "Marketplace Ops Console",
    productSummary: "Price skills, model revenue splits, and match buyer budgets to inventory.",
    catalogId: "agent-economy-marketplace-operator",
    relatedCatalogIds: ["agent-economy-marketplace-operator", "agent-marketplace-infrastructure"],
    tools: [
      { id: "pricing", label: "Pricing desk" },
      { id: "splits", label: "Revenue splits" },
      { id: "match", label: "Buyer match" },
    ],
  },
  {
    id: "agent-evaluation-red-teaming-certification-specialist",
    name: "Agent Evaluation & Red-Team Certification",
    shortName: "Red Team",
    category: "Trust",
    thesis: "Certify agents under adversarial evaluation before production unlock.",
    productName: "Red-Team Certification Lab",
    productSummary: "Run scenario batteries, score failures, and issue pass/fail certificates.",
    catalogId: "agent-evaluation-framework",
    relatedCatalogIds: ["agent-evaluation-framework", "adversarial-red-team-runner"],
    tools: [
      { id: "scenarios", label: "Scenarios" },
      { id: "score", label: "Scorecard" },
      { id: "cert", label: "Certificate" },
    ],
  },
  {
    id: "agent-goal-decomposer-orchestrator",
    name: "Agent Goal Decomposer Orchestrator",
    shortName: "Decomposer",
    category: "Agent Ops",
    thesis: "Turn ambiguous goals into dependency-aware task graphs with owners.",
    productName: "Goal Decomposition Studio",
    productSummary: "Paste a goal → get roles, tasks, dependencies, and a ship sequence.",
    catalogId: "agent-goal-decomposition",
    relatedCatalogIds: ["agent-goal-decomposition", "goal-decomposition-planner", "agent-orchestration"],
    tools: [
      { id: "decompose", label: "Decompose" },
      { id: "graph", label: "Task graph" },
      { id: "assign", label: "Role assign" },
    ],
  },
  {
    id: "agent-marketplace-infrastructure",
    name: "Agent Marketplace Infrastructure",
    shortName: "Infra",
    category: "Commerce",
    thesis: "Listings, discovery, licensing, and settlement rails for agent skills.",
    productName: "Marketplace Rails Builder",
    productSummary: "Configure listing schema, discovery weights, and settlement endpoints.",
    catalogId: "agent-marketplace-infrastructure",
    relatedCatalogIds: ["agent-marketplace-infrastructure"],
    tools: [
      { id: "schema", label: "Listing schema" },
      { id: "discovery", label: "Discovery weights" },
      { id: "settlement", label: "Settlement" },
    ],
  },
  {
    id: "agent-memory-context-engineer",
    name: "Agent Memory & Context Engineer",
    shortName: "Memory",
    category: "Agent Ops",
    thesis: "Budget context windows, compact memory, and fuse cross-agent state.",
    productName: "Context Memory Lab",
    productSummary: "Simulate token budgets, compaction, and episodic recall policies.",
    catalogId: "agent-memory-compaction-kit",
    relatedCatalogIds: [
      "agent-memory-compaction-kit",
      "episodic-memory-indexer",
      "cross-agent-memory-fusion",
      "long-term-memory-weaver",
    ],
    tools: [
      { id: "budget", label: "Token budget" },
      { id: "compact", label: "Compaction" },
      { id: "policy", label: "Recall policy" },
    ],
  },
  {
    id: "agent-orchestration",
    name: "Agent Orchestration",
    shortName: "Orchestration",
    category: "Agent Ops",
    thesis: "Plan, route, and supervise multi-agent workflows with clear handoffs.",
    productName: "Orchestration Planner",
    productSummary: "Design hub-spoke / pipeline / swarm topologies with handoff contracts.",
    catalogId: "agent-orchestration",
    relatedCatalogIds: ["agent-orchestration"],
    tools: [
      { id: "topology", label: "Topology" },
      { id: "handoffs", label: "Handoffs" },
      { id: "runbook", label: "Runbook" },
    ],
  },
  {
    id: "agent-supervisor",
    name: "Agent Supervisor",
    shortName: "Supervisor",
    category: "Agent Ops",
    thesis: "Watch agent health, intervene on SLA breach, and escalate with authority.",
    productName: "Supervisor Control Panel",
    productSummary: "Heartbeats, intervention queue, SLA thresholds, and kill switches.",
    catalogId: "agent-orchestration",
    relatedCatalogIds: ["agent-orchestration", "agent-evaluation-framework"],
    tools: [
      { id: "heartbeats", label: "Heartbeats" },
      { id: "interventions", label: "Interventions" },
      { id: "sla", label: "SLA" },
    ],
  },
  {
    id: "agent-to-agent-a2a-protocols",
    name: "Agent-to-Agent A2A Protocols",
    shortName: "A2A",
    category: "Agent Ops",
    thesis: "Agent Cards, task lifecycle, JSON-RPC transport, streaming, and auth.",
    productName: "A2A Protocol Workbench",
    productSummary: "Author Agent Cards, task messages, and lifecycle transitions.",
    catalogId: "agent-to-agent-a2a-protocols",
    relatedCatalogIds: ["agent-to-agent-a2a-protocols"],
    tools: [
      { id: "card", label: "Agent Card" },
      { id: "task", label: "Task lifecycle" },
      { id: "rpc", label: "JSON-RPC" },
    ],
  },
  {
    id: "agentic-process-redesigner",
    name: "Agentic Process Redesigner",
    shortName: "Process",
    category: "Agent Ops",
    thesis: "Rewrite human processes into agentic workflows with automation scoring.",
    productName: "Process Redesign Canvas",
    productSummary: "Map as-is steps, mark agentable work, and export a to-be flow.",
    catalogId: "agentic-rag-patterns",
    relatedCatalogIds: ["agentic-rag-patterns", "agent-orchestration"],
    tools: [
      { id: "asis", label: "As-is map" },
      { id: "score", label: "Automate score" },
      { id: "tobe", label: "To-be flow" },
    ],
  },
  {
    id: "ai-agent-building-orchestration",
    name: "AI Agent Building Orchestration",
    shortName: "Builder",
    category: "Agent Ops",
    thesis: "Blueprint multi-agent systems: roles, tools, evals, and ship gates.",
    productName: "Agent Blueprint Factory",
    productSummary: "Compose agent blueprints with tools, evals, and launch checklist.",
    catalogId: "agent-orchestration",
    relatedCatalogIds: ["agent-orchestration", "agent-evaluation-framework"],
    tools: [
      { id: "blueprint", label: "Blueprint" },
      { id: "tools", label: "Tool map" },
      { id: "launch", label: "Launch gate" },
    ],
  },
  {
    id: "ai-workflow-automation-no-code-agentic",
    name: "AI Workflow Automation (No-Code Agentic)",
    shortName: "No-Code",
    category: "Agent Ops",
    thesis: "Drag-simple agentic workflows without writing orchestration code.",
    productName: "No-Code Agentic Builder",
    productSummary: "Chain trigger → agent → gate → action nodes and export JSON.",
    catalogId: "creative-ai-finetuning-workflow",
    relatedCatalogIds: ["creative-ai-finetuning-workflow", "agent-orchestration"],
    tools: [
      { id: "canvas", label: "Canvas" },
      { id: "nodes", label: "Nodes" },
      { id: "export", label: "Export" },
    ],
  },
];

export function getPack(id: string): SkillPack | undefined {
  return SKILL_PACKS.find((p) => p.id === id);
}

export const PACK_IDS = SKILL_PACKS.map((p) => p.id);
