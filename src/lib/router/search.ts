import { z } from "zod";

/** Board filters as URL search params (TanStack Router validated search). */
export const boardSearchSchema = z.object({
  q: z.string().optional().catch(""),
  priority: z.enum(["ALL", "P0", "P1", "P2", "P3"]).optional().catch("ALL"),
  status: z
    .enum(["ALL", "READY", "PENDING", "RUNNING", "DEFERRED", "DONE", "BLOCKED"])
    .optional()
    .catch("ALL"),
  role: z
    .enum([
      "ALL",
      "conductor",
      "scout",
      "builder",
      "reviewer",
      "shipper",
      "auditor",
      "operator",
    ])
    .optional()
    .catch("ALL"),
  task: z.string().optional().catch(undefined),
});

export type BoardSearch = z.infer<typeof boardSearchSchema>;

export function parseBoardSearch(raw: unknown): BoardSearch {
  const r = boardSearchSchema.safeParse(raw);
  return r.success
    ? r.data
    : { q: "", priority: "ALL", status: "ALL", role: "ALL" };
}
