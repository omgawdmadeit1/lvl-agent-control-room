import { createFileRoute } from "@tanstack/react-router";
import { loadMarketplaceSnapshot } from "@/lib/marketplace/catalog";
import { CatalogBrowser } from "@/components/marketplace/CatalogBrowser";
import { LoaderPending, LoaderMetaBadge } from "@/components/router/LoaderStates";

export const Route = createFileRoute("/marketplace/catalog")({
  loader: () => loadMarketplaceSnapshot(),
  pendingComponent: () => <LoaderPending label="Fetching slim catalog…" />,
  pendingMs: 80,
  staleTime: 60_000,
  component: CatalogPage,
  head: () => ({ meta: [{ title: "Catalog · LVL Marketplace" }] }),
});

function CatalogPage() {
  const data = Route.useLoaderData();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Catalog browser</h1>
        <LoaderMetaBadge durationMs={data.durationMs} startedAt={data.loadedAt} />
      </div>
      <CatalogBrowser skills={data.skills} categories={data.categories} />
    </div>
  );
}
