import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModuleIcon } from "@/components/icons";
import { demoStats, demoSales } from "@/lib/types";
import { systemModules } from "@/lib/modules";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Eye,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const statCards = [
  {
    label: "Clientes cadastrados",
    value: demoStats.totalClients.toString(),
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Vendas do mês",
    value: formatCurrency(demoStats.monthlySales),
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Pedidos pendentes",
    value: demoStats.pendingOrders.toString(),
    icon: ShoppingCart,
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Estoque baixo",
    value: demoStats.lowStockItems.toString(),
    icon: Package,
    color: "text-red-600 bg-red-50",
  },
  {
    label: "Consultas hoje",
    value: demoStats.todayAppointments.toString(),
    icon: Calendar,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Exames este mês",
    value: demoStats.examsThisMonth.toString(),
    icon: Eye,
    color: "text-teal-600 bg-teal-50",
  },
];

export default function DashboardPage() {
  const activeModules = systemModules.filter((m) => m.status === "active");

  return (
    <AppShell>
      <PageHeader
        title="Painel"
        description="Visão geral da sua ótica em tempo real"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{sale.client_name}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(sale.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(sale.total)}
                    </p>
                    <Badge
                      variant={
                        sale.status === "producao"
                          ? "warning"
                          : sale.status === "entregue"
                            ? "success"
                            : "info"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulos ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {activeModules.map((mod) => (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <ModuleIcon name={mod.icon} className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-slate-900">{mod.name}</p>
                    <p className="text-xs text-slate-500">{mod.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
