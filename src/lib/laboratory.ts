import type { ServiceOrder } from "@/lib/types";

export type { ServiceOrder };

export const LAB_STATUS_LABELS: Record<ServiceOrder["status"], string> = {
  aberta: "Aberta",
  producao: "Em produção",
  pronta: "Pronta",
  entregue: "Entregue",
};

export const LAB_STATUS_VARIANT: Record<
  ServiceOrder["status"],
  "info" | "success" | "warning" | "danger" | "default"
> = {
  aberta: "info",
  producao: "warning",
  pronta: "default",
  entregue: "success",
};

export const LAB_STATUS_FLOW: ServiceOrder["status"][] = [
  "aberta",
  "producao",
  "pronta",
  "entregue",
];

export const LAB_PARTNERS = [
  { value: "", label: "Selecione o laboratório..." },
  { value: "Essilor Lab", label: "Essilor Lab" },
  { value: "Hoya Optical", label: "Hoya Optical" },
  { value: "Zeiss Vision", label: "Zeiss Vision" },
  { value: "Laboratório próprio", label: "Laboratório próprio" },
  { value: "Outro", label: "Outro" },
];

export const SURFACING_TYPES = [
  { value: "", label: "Selecione..." },
  { value: "organica_1.56", label: "Orgânica 1.56" },
  { value: "organica_1.67", label: "Orgânica 1.67" },
  { value: "organica_1.74", label: "Orgânica 1.74" },
  { value: "policarbonato", label: "Policarbonato" },
  { value: "bifocal", label: "Bifocal / Multifocal" },
  { value: "prisma", label: "Prisma" },
];

export const BLOCK_CODES = [
  { value: "", label: "Sem bloco especial" },
  { value: "BLK-STD", label: "Bloco padrão" },
  { value: "BLK-HI", label: "Bloco alto índice" },
  { value: "BLK-MF", label: "Bloco multifocal" },
  { value: "BLK-PR", label: "Bloco prisma" },
];

export function isLabOrderOverdue(order: ServiceOrder): boolean {
  if (order.status === "entregue" || !order.expected_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return order.expected_date < today;
}
