import { createFileRoute, notFound } from "@tanstack/react-router";
import { PackChrome } from "@/components/skill-packs/PackChrome";
import { PackWorkspace } from "@/components/skill-packs/PackWorkspace";
import { getPack, type SkillPackId } from "@/lib/skill-packs/registry";

export const Route = createFileRoute("/skills/$packId")({
  loader: ({ params }) => {
    const pack = getPack(params.packId);
    if (!pack) throw notFound();
    return { pack };
  },
  component: PackPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.pack
          ? `${loaderData.pack.productName} · Skill Pack Studio`
          : "Skill pack · LVL",
      },
    ],
  }),
});

function PackPage() {
  const { pack } = Route.useLoaderData();
  return (
    <PackChrome active={pack.id as SkillPackId}>
      <PackWorkspace pack={pack} />
    </PackChrome>
  );
}
