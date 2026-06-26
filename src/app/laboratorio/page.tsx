"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ServiceOrder, Sale } from "@/lib/types";
import {
  loadServiceOrders,
  saveServiceOrder,
  updateServiceOrderStatus,
  deleteServiceOrder,
  calcLabSummary,
} from "@/lib/service-orders-store";
import { loadSales } from "@/lib/sales-store";
import {
  LAB_STATUS_LABELS,
  LAB_STATUS_VARIANT,
  LAB_STATUS_FLOW,
  LAB_PARTNERS,
  SURFACING_TYPES,
  BLOCK_CODES,
  isLabOrderOverdue,
} from "@/lib/laboratory";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  FlaskConical,
  X,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";

const emptyForm = {
  sale_id: "",
  lab_name: "",
  custom_lab: "",
  expected_date: "",
  notes: "",
  surfacing_type: "",
  block_code: "",
  external_lab_ref: "",
};

export default function LaboratorioPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ServiceOrder | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    Promise.all([loadServiceOrders(), loadSales()]).then(
      ([{ orders: ordersData }, { sales: salesData }]) => {
        setOrders(ordersData);
        setSales(
          salesData.filter(
            (s) =>
              s.status === "aprovado" ||
              s.status === "producao" ||
              s.status === "entregue",
          ),
        );
        setLoading(false);
      },
    );
  }, []);

  const summary = calcLabSummary(orders);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.lab_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.client_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (o.notes?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const linkedSale = selected?.sale_id
    ? sales.find((s) => s.id === selected.sale_id)
    : undefined;

  const availableSales = sales.filter(
    (s) =>
      !orders.some(
        (o) => o.sale_id === s.id && o.id !== editingId && o.status !== "entregue",
      ),
  );

  const openNewForm = () => {
    setEditingId(null);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setForm({
      ...emptyForm,
      expected_date: defaultDate.toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEditForm = (order: ServiceOrder) => {
    setEditingId(order.id);
    const isKnownLab = LAB_PARTNERS.some(
      (l) => l.value && l.value === order.lab_name,
    );
    setForm({
      sale_id: order.sale_id ?? "",
      lab_name: isKnownLab ? order.lab_name : "Outro",
      custom_lab: isKnownLab ? "" : order.lab_name,
      expected_date: order.expected_date ?? "",
      notes: order.notes ?? "",
      surfacing_type: order.surfacing_type ?? "",
      block_code: order.block_code ?? "",
      external_lab_ref: order.external_lab_ref ?? "",
    });
    setShowForm(true);
  };

  const resolvedLabName = () =>
    form.lab_name === "Outro" ? form.custom_lab.trim() : form.lab_name.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const sale = sales.find((s) => s.id === form.sale_id);
    const existing = editingId
      ? orders.find((o) => o.id === editingId)
      : undefined;

    const { order } = await saveServiceOrder({
      id: editingId ?? crypto.randomUUID(),
      sale_id: form.sale_id || undefined,
      client_name: sale?.client_name ?? existing?.client_name,
      sale_total: sale?.total ?? existing?.sale_total,
      status: existing?.status ?? "aberta",
      lab_name: resolvedLabName(),
      expected_date: form.expected_date || undefined,
      notes: form.notes.trim() || undefined,
      surfacing_type: form.surfacing_type || undefined,
      block_code: form.block_code || undefined,
      external_lab_ref: form.external_lab_ref.trim() || undefined,
      created_at: existing?.created_at,
    });

    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = order;
        return updated;
      }
      return [order, ...prev];
    });

    if (selected?.id === order.id) setSelected(order);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaving(false);
  };

  const handleAdvanceStatus = async (order: ServiceOrder) => {
    const currentIdx = LAB_STATUS_FLOW.indexOf(order.status);
    if (currentIdx < 0 || currentIdx >= LAB_STATUS_FLOW.length - 1) return;

    const nextStatus = LAB_STATUS_FLOW[currentIdx + 1];
    const updated = await updateServiceOrderStatus(order.id, nextStatus);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      setSelected(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta ordem de serviço?")) return;
    await deleteServiceOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Laboratório"
        description={`Pedidos, produção de lentes e ordens de serviço — ${storageLabel}`}
        actions={
          <Button onClick={openNewForm}>
            <Plus className="h-4 w-4" />
            Nova OS
          </Button>
        }
      />

      {summary.atrasadas > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>{summary.atrasadas}</strong>{" "}
            {summary.atrasadas === 1
              ? "ordem com prazo vencido"
              : "ordens com prazo vencido"}
          </span>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {LAB_STATUS_FLOW.map((status) => {
          const count =
            status === "aberta"
              ? summary.abertas
              : status === "producao"
                ? summary.emProducao
                : status === "pronta"
                  ? summary.prontas
                  : summary.entregues;

          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === status ? "all" : status)
              }
              className={`rounded-lg border p-3 text-left transition-colors ${
                statusFilter === status
                  ? "border-primary-300 bg-primary-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500">
                {LAB_STATUS_LABELS[status]}
              </p>
            </button>
          );
        })}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-2xl font-bold text-amber-700">
            {summary.atrasadas}
          </p>
          <p className="text-xs text-amber-600">Atrasadas</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por laboratório, cliente ou observação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos os status</option>
          {Object.entries(LAB_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? "Editar ordem de serviço" : "Nova ordem de serviço"}
            </CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Venda vinculada (opcional)"
                value={form.sale_id}
                onChange={(e) =>
                  setForm({ ...form, sale_id: e.target.value })
                }
                options={[
                  { value: "", label: "Sem vínculo com venda" },
                  ...availableSales.map((s) => ({
                    value: s.id,
                    label: `${s.client_name} — ${formatCurrency(s.total)}`,
                  })),
                  ...(editingId && form.sale_id
                    ? sales
                        .filter((s) => s.id === form.sale_id)
                        .map((s) => ({
                          value: s.id,
                          label: `${s.client_name} — ${formatCurrency(s.total)}`,
                        }))
                    : []),
                ]}
              />
              <Select
                label="Laboratório"
                required
                value={form.lab_name}
                onChange={(e) =>
                  setForm({ ...form, lab_name: e.target.value })
                }
                options={LAB_PARTNERS}
              />
              {form.lab_name === "Outro" && (
                <Input
                  label="Nome do laboratório"
                  required
                  value={form.custom_lab}
                  onChange={(e) =>
                    setForm({ ...form, custom_lab: e.target.value })
                  }
                />
              )}
              <Input
                label="Previsão de entrega"
                type="date"
                value={form.expected_date}
                onChange={(e) =>
                  setForm({ ...form, expected_date: e.target.value })
                }
              />
              <Select
                label="Surfassagem / material"
                value={form.surfacing_type}
                onChange={(e) =>
                  setForm({ ...form, surfacing_type: e.target.value })
                }
                options={SURFACING_TYPES}
              />
              <Select
                label="Bloco"
                value={form.block_code}
                onChange={(e) =>
                  setForm({ ...form, block_code: e.target.value })
                }
                options={BLOCK_CODES}
              />
              <Input
                label="Ref. laboratório externo"
                value={form.external_lab_ref}
                onChange={(e) =>
                  setForm({ ...form, external_lab_ref: e.target.value })
                }
                placeholder="Nº pedido no lab parceiro"
              />
              <Textarea
                label="Observações / especificações das lentes"
                className="sm:col-span-2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Varilux 1.67, antirreflexo, altura 18mm..."
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={saving || !resolvedLabName()}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar ({storageLabel})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Ordens de serviço ({loading ? "..." : filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] space-y-2 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhuma ordem encontrada.
                </p>
              ) : (
                filtered.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelected(order)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected?.id === order.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {order.client_name ?? "OS avulsa"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.lab_name}
                          {order.expected_date &&
                            ` · ${formatDate(order.expected_date)}`}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {order.sale_total != null && (
                          <p className="text-sm font-medium">
                            {formatCurrency(order.sale_total)}
                          </p>
                        )}
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={LAB_STATUS_VARIANT[order.status]}>
                            {LAB_STATUS_LABELS[order.status]}
                          </Badge>
                          {isLabOrderOverdue(order) && (
                            <Badge variant="danger">Atrasada</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {selected.client_name ?? "Ordem de serviço"}
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {selected.lab_name} · Criada em{" "}
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={LAB_STATUS_VARIANT[selected.status]}>
                      {LAB_STATUS_LABELS[selected.status]}
                    </Badge>
                    {isLabOrderOverdue(selected) && (
                      <Badge variant="danger">Atrasada</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">Laboratório</dt>
                      <dd className="font-medium">{selected.lab_name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Previsão de entrega
                      </dt>
                      <dd className="font-medium">
                        {selected.expected_date
                          ? formatDate(selected.expected_date)
                          : "—"}
                      </dd>
                    </div>
                    {selected.sale_total != null && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          Valor da venda
                        </dt>
                        <dd className="font-medium text-primary-700">
                          {formatCurrency(selected.sale_total)}
                        </dd>
                      </div>
                    )}
                    {selected.sale_id && (
                      <div>
                        <dt className="text-xs text-slate-500">Venda</dt>
                        <dd className="font-mono text-sm">
                          #{selected.sale_id.slice(0, 8)}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {selected.notes && (
                    <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="mb-1 font-medium">Especificações</p>
                      <p>{selected.notes}</p>
                    </div>
                  )}

                  {linkedSale && linkedSale.items.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Package className="h-4 w-4" />
                        Itens da venda vinculada
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                              <th className="pb-2 pr-4">Descrição</th>
                              <th className="pb-2 pr-4">Qtd</th>
                              <th className="pb-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {linkedSale.items.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-slate-100"
                              >
                                <td className="py-2 pr-4">
                                  {item.description}
                                </td>
                                <td className="py-2 pr-4">{item.quantity}</td>
                                <td className="py-2">
                                  {formatCurrency(item.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {LAB_STATUS_FLOW.indexOf(selected.status) <
                      LAB_STATUS_FLOW.length - 1 && (
                      <Button onClick={() => handleAdvanceStatus(selected)}>
                        Avançar para{" "}
                        {
                          LAB_STATUS_LABELS[
                            LAB_STATUS_FLOW[
                              LAB_STATUS_FLOW.indexOf(selected.status) + 1
                            ]
                          ]
                        }
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    {selected.status !== "entregue" && (
                      <Button
                        variant="outline"
                        onClick={() => openEditForm(selected)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(selected.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center gap-1">
                    {LAB_STATUS_FLOW.map((status, i) => {
                      const currentIdx = LAB_STATUS_FLOW.indexOf(
                        selected.status,
                      );
                      const isActive = i <= currentIdx;
                      return (
                        <div key={status} className="flex items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-primary-600 text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {i + 1}
                          </div>
                          {i < LAB_STATUS_FLOW.length - 1 && (
                            <div
                              className={`mx-1 h-0.5 w-6 ${
                                i < currentIdx
                                  ? "bg-primary-600"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FlaskConical className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione uma ordem de serviço para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
