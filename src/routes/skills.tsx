import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/skills")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Skill Pack Studio · LVL" },
      {
        name: "description",
        content: "Twelve LVL agent skills built into useful Control Room products",
      },
    ],
  }),
});
