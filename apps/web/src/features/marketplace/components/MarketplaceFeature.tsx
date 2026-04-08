import { useEffect, useState } from "react";
import { AdminPageLayout, Badge, Button, DataTable, EmptyState, SurfacePanel, Toast } from "@repo/ui";
import { fetchMarketplaceCatalog, purchaseMarketplaceItem, type MarketplaceItem } from "@/features/billing/api/billing";
import { t, type Locale } from "@/lib/i18n";

interface MarketplaceFeatureProps {
  initialItems: MarketplaceItem[];
  locale: Locale;
}

export function MarketplaceFeature({ initialItems, locale }: MarketplaceFeatureProps) {
  const m = t(locale).dashboard;
  const [items, setItems] = useState<MarketplaceItem[]>(initialItems);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  useEffect(() => {
    if (!initialItems.length) {
      void fetchMarketplaceCatalog()
        .then(setItems)
        .catch(() => {
          setMessage(m.marketplace.failedLoad);
          setTone("warning");
        });
    }
  }, [initialItems.length]);

  async function handlePurchase(itemCode: string) {
    try {
      const response = await purchaseMarketplaceItem(itemCode);
      const balance = response.data.result.current_credit;
      setMessage(`${m.marketplace.purchaseCompleted} ${m.marketplace.currentCredits}: ${balance}`);
      setTone("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : m.marketplace.failedPurchase);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.marketplace.section}
      title={m.marketplace.title}
      description={m.marketplace.description}
    >
      <SurfacePanel title={m.marketplace.catalogTitle} description={m.marketplace.catalogDescription}>
        {items.length ? (
          <DataTable
            columns={[
              { key: "name", title: m.marketplace.colName, render: (item) => item.name },
              { key: "code", title: m.marketplace.colCode, render: (item) => item.code },
              { key: "type", title: m.marketplace.colType, render: (item) => item.item_type },
              { key: "price", title: m.marketplace.colCredits, render: (item) => item.price_credits },
              { key: "enabled", title: m.marketplace.colStatus, render: (item) => <Badge tone={item.enabled ? "success" : "warning"}>{item.enabled ? m.marketplace.enabled : m.marketplace.disabled}</Badge> },
              {
                key: "action",
                title: m.marketplace.colAction,
                render: (item) => (
                  <Button size="sm" disabled={!item.enabled} onClick={() => void handlePurchase(item.code)}>
                    {m.marketplace.purchase}
                  </Button>
                ),
              },
            ]}
            items={items}
          />
        ) : (
          <EmptyState title={m.marketplace.noItemsTitle} description={m.marketplace.noItemsDescription} />
        )}
      </SurfacePanel>
      {message ? <Toast title={m.marketplace.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
