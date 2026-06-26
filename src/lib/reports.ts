import type {
  Client,
  Sale,
  Product,
  FinancialAccount,
  Appointment,
  ServiceOrder,
} from "@/lib/types";
import { calcFinancialSummary } from "@/lib/financial-store";
import { calcClinicSummary } from "@/lib/appointments-store";
import { calcLabSummary } from "@/lib/service-orders-store";
import { isToday } from "@/lib/clinic";
import { isLabOrderOverdue } from "@/lib/laboratory";
import { PRODUCT_CATEGORIES } from "@/lib/inventory";
import { SALE_STATUS_LABELS } from "@/lib/inventory";

export type ReportPeriod = "month" | "30days" | "all";

export interface ReportsOverview {
  totalClients: number;
  monthlySales: number;
  salesCount: number;
  pendingOrders: number;
  lowStockItems: number;
  todayAppointments: number;
  openReceivables: number;
  openPayables: number;
  overdueAmount: number;
  labOrdersOpen: number;
  documentsCount: number;
}

export interface SalesByStatus {
  status: Sale["status"];
  label: string;
  count: number;
  total: number;
}

export interface TopClientReport {
  client_id: string;
  name: string;
  count: number;
  total: number;
}

export interface ProductAbcItem {
  key: string;
  description: string;
  quantity: number;
  revenue: number;
  share: number;
  cumulativeShare: number;
  class: "A" | "B" | "C";
}

export interface CategoryStockReport {
  category: string;
  label: string;
  count: number;
  stockUnits: number;
  stockValue: number;
}

export interface LowStockReport {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock_quantity: number;
  min_stock: number;
  sale_price: number;
}

export interface MonthlySalesPoint {
  month: string;
  label: string;
  total: number;
  count: number;
}

export interface ReportsData {
  overview: ReportsOverview;
  salesByStatus: SalesByStatus[];
  topClients: TopClientReport[];
  productAbc: ProductAbcItem[];
  lowStock: LowStockReport[];
  stockByCategory: CategoryStockReport[];
  monthlySales: MonthlySalesPoint[];
  financial: ReturnType<typeof calcFinancialSummary>;
  clinic: ReturnType<typeof calcClinicSummary>;
  lab: ReturnType<typeof calcLabSummary>;
}

function periodStart(period: ReportPeriod): string | null {
  if (period === "all") return null;
  const now = new Date();
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return start.toISOString();
}

function inPeriod(date: string, period: ReportPeriod): boolean {
  const start = periodStart(period);
  if (!start) return true;
  return date >= start;
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function categoryLabel(category: Product["category"]): string {
  return (
    PRODUCT_CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}

export function buildReportsData(input: {
  clients: Client[];
  sales: Sale[];
  products: Product[];
  accounts: FinancialAccount[];
  appointments: Appointment[];
  labOrders: ServiceOrder[];
  documentsCount?: number;
  period?: ReportPeriod;
}): ReportsData {
  const period = input.period ?? "month";
  const filteredSales = input.sales.filter((s) =>
    inPeriod(s.created_at, period),
  );
  const activeSales = filteredSales.filter((s) => s.status !== "cancelado");

  const financial = calcFinancialSummary(input.accounts);
  const clinic = calcClinicSummary(input.appointments);
  const lab = calcLabSummary(input.labOrders);

  const monthlySales = activeSales.reduce<Record<string, MonthlySalesPoint>>(
    (acc, sale) => {
      const key = monthKey(sale.created_at);
      if (!acc[key]) {
        acc[key] = { month: key, label: monthLabel(key), total: 0, count: 0 };
      }
      acc[key].total += sale.total;
      acc[key].count += 1;
      return acc;
    },
    {},
  );

  const salesByStatus = (
    ["orcamento", "aprovado", "producao", "entregue", "cancelado"] as const
  ).map((status) => {
    const items = filteredSales.filter((s) => s.status === status);
    return {
      status,
      label: SALE_STATUS_LABELS[status],
      count: items.length,
      total: items.reduce((sum, s) => sum + s.total, 0),
    };
  });

  const clientTotals = activeSales.reduce<Record<string, TopClientReport>>(
    (acc, sale) => {
      if (!acc[sale.client_id]) {
        acc[sale.client_id] = {
          client_id: sale.client_id,
          name: sale.client_name,
          count: 0,
          total: 0,
        };
      }
      acc[sale.client_id].count += 1;
      acc[sale.client_id].total += sale.total;
      return acc;
    },
    {},
  );

  const itemTotals = activeSales
    .flatMap((s) => s.items)
    .reduce<Record<string, { description: string; quantity: number; revenue: number }>>(
      (acc, item) => {
        const key = item.product_id ?? item.description;
        if (!acc[key]) {
          acc[key] = {
            description: item.description,
            quantity: 0,
            revenue: 0,
          };
        }
        acc[key].quantity += item.quantity;
        acc[key].revenue += item.total;
        return acc;
      },
      {},
    );

  const sortedItems = Object.entries(itemTotals)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = sortedItems.reduce((sum, i) => sum + i.revenue, 0);
  let cumulative = 0;
  const productAbc: ProductAbcItem[] = sortedItems.map((item) => {
    const share = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    cumulative += share;
    const abcClass: ProductAbcItem["class"] =
      cumulative <= 80 ? "A" : cumulative <= 95 ? "B" : "C";
    return {
      key: item.key,
      description: item.description,
      quantity: item.quantity,
      revenue: item.revenue,
      share,
      cumulativeShare: cumulative,
      class: abcClass,
    };
  });

  const lowStock = input.products
    .filter((p) => p.active && p.stock_quantity <= p.min_stock)
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: categoryLabel(p.category),
      stock_quantity: p.stock_quantity,
      min_stock: p.min_stock,
      sale_price: p.sale_price,
    }))
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  const stockByCategory = PRODUCT_CATEGORIES.map((cat) => {
    const items = input.products.filter(
      (p) => p.active && p.category === cat.value,
    );
    return {
      category: cat.value,
      label: cat.label,
      count: items.length,
      stockUnits: items.reduce((sum, p) => sum + p.stock_quantity, 0),
      stockValue: items.reduce(
        (sum, p) => sum + p.stock_quantity * p.sale_price,
        0,
      ),
    };
  }).filter((c) => c.count > 0);

  const overview: ReportsOverview = {
    totalClients: input.clients.length,
    monthlySales: activeSales.reduce((sum, s) => sum + s.total, 0),
    salesCount: activeSales.length,
    pendingOrders: input.sales.filter(
      (s) => s.status === "orcamento" || s.status === "producao",
    ).length,
    lowStockItems: lowStock.length,
    todayAppointments: input.appointments.filter(
      (a) => isToday(a.scheduled_at) && a.status !== "cancelado",
    ).length,
    openReceivables: financial.totalReceber,
    openPayables: financial.totalPagar,
    overdueAmount: financial.vencidos,
    labOrdersOpen: input.labOrders.filter((o) => o.status !== "entregue")
      .length,
    documentsCount: input.documentsCount ?? 0,
  };

  return {
    overview,
    salesByStatus: salesByStatus.filter((s) => s.count > 0),
    topClients: Object.values(clientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    productAbc: productAbc.slice(0, 10),
    lowStock,
    stockByCategory,
    monthlySales: Object.values(monthlySales).sort((a, b) =>
      a.month.localeCompare(b.month),
    ),
    financial,
    clinic,
    lab: {
      ...lab,
      atrasadas: input.labOrders.filter(isLabOrderOverdue).length,
    },
  };
}

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  month: "Este mês",
  "30days": "Últimos 30 dias",
  all: "Todo o período",
};
