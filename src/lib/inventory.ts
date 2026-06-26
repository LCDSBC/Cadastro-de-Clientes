import type { Product, Sale, SaleItem, LensGridEntry } from "@/lib/types";

export type { Product, Sale, SaleItem, LensGridEntry };

export const PRODUCT_CATEGORIES = [
  { value: "armacao", label: "Armação" },
  { value: "lente", label: "Lente oftálmica" },
  { value: "lente_contato", label: "Lente de contato" },
  { value: "solar", label: "Solar" },
  { value: "acessorio", label: "Acessório" },
] as const;

export const SALE_STATUS_LABELS: Record<Sale["status"], string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  producao: "Em produção",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const SALE_STATUS_VARIANT: Record<
  Sale["status"],
  "info" | "success" | "warning" | "danger" | "default"
> = {
  orcamento: "info",
  aprovado: "default",
  producao: "warning",
  entregue: "success",
  cancelado: "danger",
};

export const SALE_STATUS_FLOW: Sale["status"][] = [
  "orcamento",
  "aprovado",
  "producao",
  "entregue",
];
