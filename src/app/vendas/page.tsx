"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Client, Sale } from "@/lib/types";
import { loadClients } from "@/lib/clients-store";
import { getStorageStatus, loadSales, saveSale, updateSaleStatus } from "@/lib/sales-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, Plus, X } from "lucide-react";

const statusOptions = [
  { value: "orcamento", label: "Orçamento" },
  { value: "aprovado", label: "Aprovado" },
  { value: "producao", label: "Em produção" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const statusBadge: Record<Sale["status"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  orcamento: { label: "Orçamento", variant: "info" },
  aprovado: { label: "Aprovado", variant: "default" },
  producao: { label: "Em produção", variant: "warning" },
  entregue: { label: "Entregue", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    total: "",
    status: "orcamento" as Sale["status"],
    delivery_date: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([loadSales(), loadClients()]).then(([{ sales: data }, { clients: clientData }]) => {
      setSales(data);
      setClients(clientData);
      setLoading(false);
    });
  }, []);

  const storageLabel = getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";
  const totalMes = sales
    .filter((s) => s.status !== "cancelado")
    .reduce((sum, s) => sum + s.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const client = clients.find((c) => c.id === form.client_id);
    const { sale } = await saveSale({
      id: crypto.randomUUID(),
      client_id: form.client_id,
      client_name: client?.name ?? "Cliente",
      status: form.status,
      total: parseFloat(form.total) || 0,
      delivery_date: form.delivery_date || undefined,
      notes: form.notes || undefined,
    });
    setSales((prev) => [sale, ...prev]);
    setShowForm(false);
    setForm({ client_id: "", total: "", status: "orcamento", delivery_date: "", notes: "" });
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: Sale["status"]) => {
    await updateSaleStatus(id, status);
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  return (
    <AppShell>
      <PageHeader
        title="Vendas"
        description={`Orçamentos, vendas e ordens de serviço — ${storageLabel}`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nova venda
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total de vendas</p>
            <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Em produção</p>
            <p className="text-2xl font-bold text-amber-600">
              {sales.filter((s) => s.status === "producao").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Valor total</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMes)}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nova venda / orçamento</CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Cliente"
                options={[
                  { value: "", label: "Selecione..." },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required
              />
              <Input
                label="Valor total (R$)"
                type="number"
                step="0.01"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                required
              />
              <Select
                label="Status"
                options={statusOptions}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Sale["status"] })
                }
              />
              <Input
                label="Previsão de entrega"
                type="date"
                value={form.delivery_date}
                onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Observações"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4">Cliente</th>
                    <th className="pb-2 pr-4">Data</th>
                    <th className="pb-2 pr-4">Valor</th>
                    <th className="pb-2 pr-4">Entrega</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium">{sale.client_name}</td>
                      <td className="py-3 pr-4">{formatDate(sale.created_at)}</td>
                      <td className="py-3 pr-4">{formatCurrency(sale.total)}</td>
                      <td className="py-3 pr-4">
                        {sale.delivery_date ? formatDate(sale.delivery_date) : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadge[sale.status].variant}>
                          {statusBadge[sale.status].label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <select
                          value={sale.status}
                          onChange={(e) =>
                            handleStatusChange(sale.id, e.target.value as Sale["status"])
                          }
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
