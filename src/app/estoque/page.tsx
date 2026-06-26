"use client";

import { useState } from "react";
import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  ClipboardList,
  FileUp,
  Printer,
  Percent,
} from "lucide-react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsPanel } from "@/components/estoque/products-panel";
import { PurchaseOrdersPanel } from "@/components/estoque/purchase-orders-panel";
import { TransfersPanel } from "@/components/estoque/transfers-panel";
import { InventoryPanel } from "@/components/estoque/inventory-panel";
import { XmlImportPanel } from "@/components/estoque/xml-import-panel";
import { LabelsPanel } from "@/components/estoque/labels-panel";
import { PriceTablesPanel } from "@/components/estoque/price-tables-panel";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "pedidos", label: "Pedidos de compra", icon: ShoppingCart },
  { id: "transferencias", label: "Transferências", icon: ArrowLeftRight },
  { id: "inventario", label: "Inventário", icon: ClipboardList },
  { id: "xml", label: "Importar XML", icon: FileUp },
  { id: "etiquetas", label: "Etiquetas", icon: Printer },
  { id: "precos", label: "Tabelas de preço", icon: Percent },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EstoquePage() {
  const [tab, setTab] = useState<TabId>("produtos");

  return (
    <AppShell>
      <PageHeader
        title="Estoque"
        description="SavWin — produtos, pedidos, transferências, inventário, NF-e, etiquetas e promoções"
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {tab === "produtos" && <ProductsPanel />}
      {tab === "pedidos" && <PurchaseOrdersPanel />}
      {tab === "transferencias" && <TransfersPanel />}
      {tab === "inventario" && <InventoryPanel />}
      {tab === "xml" && <XmlImportPanel />}
      {tab === "etiquetas" && <LabelsPanel />}
      {tab === "precos" && <PriceTablesPanel />}
    </AppShell>
  );
}
