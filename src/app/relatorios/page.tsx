"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadClients } from "@/lib/clients-store";
import { loadSales } from "@/lib/sales-store";
import { loadProducts } from "@/lib/products-store";
import { loadFinancialAccounts } from "@/lib/financial-store";
import { loadAppointments } from "@/lib/appointments-store";
import { loadServiceOrders } from "@/lib/service-orders-store";
import { loadDocuments, getStorageStatus } from "@/lib/prontuarios-store";
import {
  buildReportsData,
  REPORT_PERIOD_LABELS,
  type ReportPeriod,
  type ReportsData,
} from "@/lib/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Wallet,
  Calendar,
  FlaskConical,
  Eye,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

function BarRow({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">
          {suffix === "currency" ? formatCurrency(value) : value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [loading, setLoading] = useState(true);

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadClients(),
      loadSales(),
      loadProducts(),
      loadFinancialAccounts(),
      loadAppointments(),
      loadServiceOrders(),
      loadDocuments(),
    ]).then(
      ([
        { clients },
        { sales },
        { products },
        { accounts },
        { appointments },
        { orders },
        { documents: clinicalDocs },
      ]) => {
        setReports(
          buildReportsData({
            clients,
            sales,
            products,
            accounts,
            appointments,
            labOrders: orders,
            documentsCount: clinicalDocs.length,
            period,
          }),
        );
        setLoading(false);
      },
    );
  }, [period]);

  const maxSalesStatus = Math.max(
    ...(reports?.salesByStatus.map((s) => s.total) ?? [0]),
    1,
  );
  const maxTopClient = Math.max(
    ...(reports?.topClients.map((c) => c.total) ?? [0]),
    1,
  );
  const maxCategoryValue = Math.max(
    ...(reports?.stockByCategory.map((c) => c.stockValue) ?? [0]),
    1,
  );

  return (
    <AppShell>
      <PageHeader
        title="Relatórios"
        description={`Indicadores de desempenho — ${storageLabel}`}
        actions={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        }
      />

      {loading || !reports ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Gerando relatórios...
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Visão geral
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Clientes",
                  value: reports.overview.totalClients,
                  icon: Users,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Vendas no período",
                  value: formatCurrency(reports.overview.monthlySales),
                  icon: TrendingUp,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Pedidos pendentes",
                  value: reports.overview.pendingOrders,
                  icon: ShoppingCart,
                  color: "text-amber-600 bg-amber-50",
                },
                {
                  label: "Estoque baixo",
                  value: reports.overview.lowStockItems,
                  icon: Package,
                  color: "text-red-600 bg-red-50",
                },
                {
                  label: "Consultas hoje",
                  value: reports.overview.todayAppointments,
                  icon: Calendar,
                  color: "text-purple-600 bg-purple-50",
                },
                {
                  label: "A receber",
                  value: formatCurrency(reports.overview.openReceivables),
                  icon: Wallet,
                  color: "text-teal-600 bg-teal-50",
                },
                {
                  label: "OS em aberto",
                  value: reports.overview.labOrdersOpen,
                  icon: FlaskConical,
                  color: "text-indigo-600 bg-indigo-50",
                },
                {
                  label: "Prontuários",
                  value: reports.overview.documentsCount,
                  icon: Eye,
                  color: "text-cyan-600 bg-cyan-50",
                },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vendas por status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports.salesByStatus.length > 0 ? (
                  reports.salesByStatus.map((item) => (
                    <BarRow
                      key={item.status}
                      label={`${item.label} (${item.count})`}
                      value={item.total}
                      max={maxSalesStatus}
                      suffix="currency"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhuma venda no período selecionado.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports.topClients.length > 0 ? (
                  reports.topClients.map((client, i) => (
                    <BarRow
                      key={client.client_id}
                      label={`${i + 1}. ${client.name} (${client.count} vendas)`}
                      value={client.total}
                      max={maxTopClient}
                      suffix="currency"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Sem dados de clientes no período.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {reports.monthlySales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução de vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="pb-2 pr-4">Mês</th>
                        <th className="pb-2 pr-4">Vendas</th>
                        <th className="pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.monthlySales.map((point) => (
                        <tr
                          key={point.month}
                          className="border-b border-slate-100"
                        >
                          <td className="py-2 pr-4 capitalize">
                            {point.label}
                          </td>
                          <td className="py-2 pr-4">{point.count}</td>
                          <td className="py-2 font-medium">
                            {formatCurrency(point.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Curva ABC de produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.productAbc.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="pb-2 pr-4">Produto</th>
                          <th className="pb-2 pr-4">Qtd</th>
                          <th className="pb-2 pr-4">Receita</th>
                          <th className="pb-2 pr-4">%</th>
                          <th className="pb-2">ABC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.productAbc.map((item) => (
                          <tr
                            key={item.key}
                            className="border-b border-slate-100"
                          >
                            <td className="max-w-[180px] truncate py-2 pr-4">
                              {item.description}
                            </td>
                            <td className="py-2 pr-4">{item.quantity}</td>
                            <td className="py-2 pr-4">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="py-2 pr-4">
                              {item.share.toFixed(1)}%
                            </td>
                            <td className="py-2">
                              <Badge
                                variant={
                                  item.class === "A"
                                    ? "success"
                                    : item.class === "B"
                                      ? "warning"
                                      : "default"
                                }
                              >
                                {item.class}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Sem itens vendidos no período para análise ABC.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Produtos com estoque baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.lowStock.length > 0 ? (
                  <div className="space-y-3">
                    {reports.lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.sku} · {product.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="danger">
                            {product.stock_quantity}/{product.min_stock}
                          </Badge>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatCurrency(product.sale_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhum produto abaixo do estoque mínimo.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">A receber</span>
                  <span className="font-medium text-emerald-700">
                    {formatCurrency(reports.financial.totalReceber)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">A pagar</span>
                  <span className="font-medium text-red-700">
                    {formatCurrency(reports.financial.totalPagar)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo previsto</span>
                  <span className="font-medium">
                    {formatCurrency(reports.financial.saldoPrevisto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vencidos</span>
                  <span className="font-medium text-amber-700">
                    {formatCurrency(reports.financial.vencidos)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Recebido no mês</span>
                  <span className="font-medium">
                    {formatCurrency(reports.financial.recebidoMes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pago no mês</span>
                  <span className="font-medium">
                    {formatCurrency(reports.financial.pagoMes)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultas hoje</span>
                  <span className="font-medium">{reports.clinic.hoje}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agendados</span>
                  <span className="font-medium">{reports.clinic.agendados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmados</span>
                  <span className="font-medium">
                    {reports.clinic.confirmados}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Realizados</span>
                  <span className="font-medium text-emerald-700">
                    {reports.clinic.realizados}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cancelados</span>
                  <span className="font-medium text-red-600">
                    {reports.clinic.cancelados}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Laboratório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Abertas</span>
                  <span className="font-medium">{reports.lab.abertas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Em produção</span>
                  <span className="font-medium">{reports.lab.emProducao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prontas</span>
                  <span className="font-medium">{reports.lab.prontas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entregues</span>
                  <span className="font-medium text-emerald-700">
                    {reports.lab.entregues}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Atrasadas</span>
                  <span className="font-medium text-amber-700">
                    {reports.lab.atrasadas}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estoque por categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.stockByCategory.length > 0 ? (
                reports.stockByCategory.map((cat) => (
                  <BarRow
                    key={cat.category}
                    label={`${cat.label} (${cat.count} produtos, ${cat.stockUnits} un.)`}
                    value={cat.stockValue}
                    max={maxCategoryValue}
                    suffix="currency"
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum produto cadastrado.
                </p>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400">
            Relatório gerado em {formatDate(new Date().toISOString())} ·{" "}
            {REPORT_PERIOD_LABELS[period]} · Fonte: {storageLabel}
          </p>
        </div>
      )}
    </AppShell>
  );
}
