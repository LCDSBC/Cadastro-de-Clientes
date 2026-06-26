import type {
  PriceTable,
  PurchaseOrder,
  StockTransfer,
  InventoryCount,
  ContactLensSpec,
} from "@/lib/types";

export const STORE_BRANCHES = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    name: "Ótica OptiCare — Matriz",
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    name: "Filial Shopping Center",
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    name: "Filial Centro",
  },
];

export const CONTACT_LENS_MATERIALS = [
  "Hidrogel",
  "Silicone-hidrogel",
  "GP (rígida)",
  "Híbrida",
];

export const CONTACT_LENS_DISPOSAL = [
  { value: "diario", label: "Diário" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
] as const;

export const PO_STATUS_LABELS: Record<PurchaseOrder["status"], string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  recebido: "Recebido",
  cancelado: "Cancelado",
};

export const TRANSFER_STATUS_LABELS: Record<StockTransfer["status"], string> = {
  pendente: "Pendente",
  em_transito: "Em trânsito",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const INVENTORY_STATUS_LABELS: Record<InventoryCount["status"], string> = {
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const LABEL_FORMATS = [
  { value: "argox_50x30", label: "Argox 50×30 mm" },
  { value: "zebra_40x25", label: "Zebra 40×25 mm" },
  { value: "a4_grid", label: "Folha A4 (grade 3×8)" },
];

export const defaultContactLensSpec = (): ContactLensSpec => ({
  curva_base: 8.6,
  diametro: 14.2,
  material: "Silicone-hidrogel",
  descarte: "mensal",
});

export const demoPriceTables: PriceTable[] = [
  {
    id: "pt1",
    name: "Tabela padrão",
    description: "Preço de venda normal",
    discount_percent: 0,
    active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "pt2",
    name: "Promoção Verão",
    description: "10% em solares e armações",
    discount_percent: 10,
    active: true,
    created_at: "2025-06-01T00:00:00Z",
  },
  {
    id: "pt3",
    name: "Convênio Empresarial",
    description: "15% para parceiros",
    discount_percent: 15,
    active: true,
    created_at: "2025-03-15T00:00:00Z",
  },
];

export const demoPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    supplier_name: "Essilor Brasil",
    status: "enviado",
    items: [
      {
        id: "pi1",
        description: "Lente Varilux Comfort 1.67",
        quantity: 20,
        unit_cost: 350,
        total: 7000,
      },
    ],
    total: 7000,
    expected_date: "2025-07-05",
    created_at: "2025-06-20T10:00:00Z",
  },
];

export const demoStockTransfers: StockTransfer[] = [
  {
    id: "st1",
    from_store_id: STORE_BRANCHES[0].id,
    from_store_name: STORE_BRANCHES[0].name,
    to_store_id: STORE_BRANCHES[1].id,
    to_store_name: STORE_BRANCHES[1].name,
    status: "pendente",
    items: [
      {
        id: "sti1",
        product_id: "1",
        product_name: "Armação Ray-Ban RB5228",
        sku: "ARM-001",
        quantity: 3,
      },
    ],
    created_at: "2025-06-22T09:00:00Z",
  },
];

export const demoInventoryCounts: InventoryCount[] = [];

export function calcPriceWithTable(
  basePrice: number,
  table?: PriceTable,
): number {
  if (!table || !table.active) return basePrice;
  return Math.max(0, basePrice * (1 - table.discount_percent / 100));
}

export function formatContactLensSpec(spec?: ContactLensSpec): string {
  if (!spec) return "—";
  const parts: string[] = [];
  if (spec.esf != null) parts.push(`Esf ${spec.esf}`);
  if (spec.cil != null) parts.push(`Cil ${spec.cil}`);
  if (spec.curva_base != null) parts.push(`BC ${spec.curva_base}`);
  if (spec.diametro != null) parts.push(`Ø ${spec.diametro}`);
  if (spec.material) parts.push(spec.material);
  if (spec.descarte) parts.push(spec.descarte);
  return parts.join(" · ") || "—";
}
