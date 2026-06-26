import type { FinancialAccount } from "@/lib/types";

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: "receita" | "despesa" | "ativo" | "passivo";
  parent_code?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface BankReconciliation {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "entrada" | "saida";
  matched_account_id?: string;
  payment_method?: string;
  reconciled: boolean;
}

export interface CheckRegister {
  id: string;
  number: string;
  bank: string;
  amount: number;
  payee: string;
  issue_date: string;
  due_date?: string;
  status: "emitido" | "compensado" | "cancelado";
  account_id?: string;
}

export interface DreLine {
  label: string;
  amount: number;
  pct?: number;
}

export interface DreReport {
  period: string;
  receitas: DreLine[];
  despesas: DreLine[];
  receitaBruta: number;
  despesasTotal: number;
  resultado: number;
  margem: number;
}

export const DEFAULT_CHART_OF_ACCOUNTS: ChartAccount[] = [
  { id: "1", code: "3.1", name: "Vendas de produtos", type: "receita" },
  { id: "2", code: "3.2", name: "Serviços ópticos", type: "receita" },
  { id: "3", code: "4.1", name: "Custo de mercadorias", type: "despesa" },
  { id: "4", code: "4.2", name: "Folha de pagamento", type: "despesa" },
  { id: "5", code: "4.3", name: "Aluguel", type: "despesa" },
  { id: "6", code: "4.4", name: "Marketing", type: "despesa" },
  { id: "7", code: "4.5", name: "Laboratório externo", type: "despesa" },
  { id: "8", code: "4.6", name: "Taxas cartão/PIX", type: "despesa" },
];

export const DEFAULT_COST_CENTERS: CostCenter[] = [
  { id: "cc1", code: "LOJA", name: "Loja / Vendas", active: true },
  { id: "cc2", code: "LAB", name: "Laboratório", active: true },
  { id: "cc3", code: "CLIN", name: "Clínica", active: true },
  { id: "cc4", code: "ADM", name: "Administrativo", active: true },
];

export function buildDreReport(
  accounts: FinancialAccount[],
  monthKey: string,
): DreReport {
  const inMonth = (a: FinancialAccount) =>
    (a.paid_date ?? a.due_date).startsWith(monthKey);

  const receitas = accounts.filter(
    (a) => a.type === "receber" && a.status === "pago" && inMonth(a),
  );
  const despesas = accounts.filter(
    (a) => a.type === "pagar" && a.status === "pago" && inMonth(a),
  );

  const receitaBruta = receitas.reduce((s, a) => s + a.amount, 0);
  const despesasTotal = despesas.reduce((s, a) => s + a.amount, 0);
  const resultado = receitaBruta - despesasTotal;

  const groupBy = (items: FinancialAccount[]) => {
    const map = new Map<string, number>();
    for (const a of items) {
      const key = a.category_code ?? "Outros";
      map.set(key, (map.get(key) ?? 0) + a.amount);
    }
    return Array.from(map.entries()).map(([label, amount]) => ({
      label,
      amount,
      pct: receitaBruta > 0 ? (amount / receitaBruta) * 100 : undefined,
    }));
  };

  return {
    period: monthKey,
    receitas: groupBy(receitas),
    despesas: groupBy(despesas),
    receitaBruta,
    despesasTotal,
    resultado,
    margem: receitaBruta > 0 ? (resultado / receitaBruta) * 100 : 0,
  };
}
