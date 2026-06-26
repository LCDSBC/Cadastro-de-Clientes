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

export function isLabOrderOverdue(order: ServiceOrder): boolean {
  if (order.status === "entregue" || !order.expected_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return order.expected_date < today;
}
