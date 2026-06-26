import type { FinancialAccount } from "@/lib/types";

export type { FinancialAccount };

export const ACCOUNT_TYPES = [
  { value: "receber", label: "Conta a receber" },
  { value: "pagar", label: "Conta a pagar" },
] as const;

export const ACCOUNT_STATUS_LABELS: Record<FinancialAccount["status"], string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

export const ACCOUNT_STATUS_VARIANT: Record<
  FinancialAccount["status"],
  "info" | "success" | "warning" | "danger" | "default"
> = {
  pendente: "info",
  pago: "success",
  vencido: "danger",
  cancelado: "default",
};

export const PAYMENT_METHODS = [
  { value: "", label: "Selecione..." },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "crediario", label: "Crediário" },
];

export function paymentMethodLabel(value?: string): string {
  if (!value) return "—";
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export function isOverdue(account: FinancialAccount): boolean {
  if (account.status === "pago" || account.status === "cancelado") return false;
  const today = new Date().toISOString().slice(0, 10);
  return account.due_date < today;
}

export function resolveAccountStatus(
  account: FinancialAccount,
): FinancialAccount["status"] {
  if (account.status === "pago" || account.status === "cancelado") {
    return account.status;
  }
  return isOverdue(account) ? "vencido" : account.status;
}
