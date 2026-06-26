"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Sale, SaleItem, Client, Product, Prescription, ServiceOrder } from "@/lib/types";
import {
  loadSales,
  saveSale,
  updateSaleStatus,
  calcSaleTotal,
} from "@/lib/sales-store";
import { loadClients, loadPrescriptions } from "@/lib/clients-store";
import { loadProducts } from "@/lib/products-store";
import { loadServiceOrders } from "@/lib/service-orders-store";
import { loadSalespeople } from "@/lib/users-store";
import { printServiceOrder } from "@/lib/service-order-print";
import {
  SALE_STATUS_LABELS,
  SALE_STATUS_VARIANT,
  SALE_STATUS_FLOW,
} from "@/lib/inventory";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  ShoppingCart,
  X,
  Loader2,
  ChevronRight,
  Trash2,
  Printer,
  FileText,
} from "lucide-react";

interface DraftItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

const emptyDraft = {
  client_id: "",
  salesperson_id: "",
  discount: "0",
  notes: "",
  delivery_date: "",
};

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salespeople, setSalespeople] = useState<{ id: string; name: string }[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clientPrescriptions, setClientPrescriptions] = useState<Prescription[]>([]);
  const [integrationMsg, setIntegrationMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [productPicker, setProductPicker] = useState("");

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    Promise.all([
      loadSales(),
      loadClients(),
      loadProducts(),
      loadSalespeople(),
      loadServiceOrders(),
    ]).then(
      ([
        { sales: salesData },
        { clients: clientsData },
        { products: productsData },
        sp,
        { orders },
      ]) => {
        setSales(salesData);
        setClients(clientsData);
        setProducts(productsData.filter((p) => p.active));
        setSalespeople(sp.map((u) => ({ id: u.id, name: u.name })));
        setServiceOrders(orders);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (selectedSale?.client_id) {
      loadPrescriptions(selectedSale.client_id).then(setClientPrescriptions);
    } else {
      setClientPrescriptions([]);
    }
  }, [selectedSale?.client_id]);

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.client_name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = SALE_STATUS_FLOW.reduce(
    (acc, status) => {
      acc[status] = sales.filter((s) => s.status === status).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const openNewForm = () => {
    setDraft(emptyDraft);
    setDraftItems([]);
    setProductPicker("");
    setShowForm(true);
  };

  const addProductToDraft = () => {
    const product = products.find((p) => p.id === productPicker);
    if (!product) return;
    setDraftItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        description: product.name,
        quantity: 1,
        unit_price: product.sale_price,
      },
    ]);
    setProductPicker("");
  };

  const addCustomItem = () => {
    setDraftItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const updateDraftItem = (
    index: number,
    field: keyof DraftItem,
    value: string | number,
  ) => {
    setDraftItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const draftSaleItems: SaleItem[] = draftItems.map((item, i) => ({
    id: `draft-${i}`,
    sale_id: "",
    product_id: item.product_id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
  }));

  const draftTotal = calcSaleTotal(
    draftSaleItems,
    parseFloat(draft.discount) || 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.client_id || draftItems.length === 0) return;

    const client = clients.find((c) => c.id === draft.client_id);
    if (!client) return;

    const sp = salespeople.find((s) => s.id === draft.salesperson_id);

    setSaving(true);
    const items: SaleItem[] = draftItems.map((item) => ({
      id: crypto.randomUUID(),
      sale_id: "",
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    const { sale } = await saveSale({
      id: crypto.randomUUID(),
      client_id: client.id,
      client_name: client.name,
      salesperson_id: sp?.id,
      salesperson_name: sp?.name,
      status: "orcamento",
      total: 0,
      discount: parseFloat(draft.discount) || 0,
      items,
      notes: draft.notes.trim() || undefined,
      delivery_date: draft.delivery_date || undefined,
    });

    setSales((prev) => [sale, ...prev]);
    setSelectedSale(sale);
    setShowForm(false);
    setSaving(false);
  };

  const handleAdvanceStatus = async (sale: Sale) => {
    const currentIdx = SALE_STATUS_FLOW.indexOf(sale.status);
    if (currentIdx < 0 || currentIdx >= SALE_STATUS_FLOW.length - 1) return;

    const nextStatus = SALE_STATUS_FLOW[currentIdx + 1];
    const result = await updateSaleStatus(sale.id, nextStatus);
    if (result) {
      const { sale: updated, integrationMessages } = result;
      setSales((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      setSelectedSale(updated);
      if (integrationMessages.length) {
        setIntegrationMsg(integrationMessages.join(" "));
        const { orders } = await loadServiceOrders();
        setServiceOrders(orders);
      }
    }
  };

  const handlePrintOS = () => {
    if (!selectedSale) return;
    const order = serviceOrders.find((o) => o.sale_id === selectedSale.id);
    const rx = clientPrescriptions[0];
    printServiceOrder(selectedSale, order, rx);
  };

  const handleCancel = async (sale: Sale) => {
    if (!confirm("Cancelar este orçamento/venda?")) return;
    const result = await updateSaleStatus(sale.id, "cancelado");
    if (result) {
      setSales((prev) =>
        prev.map((s) => (s.id === result.sale.id ? result.sale : s)),
      );
      setSelectedSale(result.sale);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Vendas"
        description={`Orçamentos, vendas e ordens de serviço — ${storageLabel}`}
        actions={
          <Button onClick={openNewForm}>
            <Plus className="h-4 w-4" />
            Novo orçamento
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SALE_STATUS_FLOW.map((status) => (
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
            <p className="text-2xl font-bold text-slate-900">
              {statusCounts[status] ?? 0}
            </p>
            <p className="text-xs text-slate-500">
              {SALE_STATUS_LABELS[status]}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="all">Todos os status</option>
          {Object.entries(SALE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Novo orçamento</CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Cliente"
                  required
                  value={draft.client_id}
                  onChange={(e) =>
                    setDraft({ ...draft, client_id: e.target.value })
                  }
                  options={[
                    { value: "", label: "Selecione o cliente..." },
                    ...clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
                <Select
                  label="Vendedor"
                  value={draft.salesperson_id}
                  onChange={(e) =>
                    setDraft({ ...draft, salesperson_id: e.target.value })
                  }
                  options={[
                    { value: "", label: "Selecione..." },
                    ...salespeople.map((s) => ({
                      value: s.id,
                      label: s.name,
                    })),
                  ]}
                />
                <Input
                  label="Previsão de entrega"
                  type="date"
                  value={draft.delivery_date}
                  onChange={(e) =>
                    setDraft({ ...draft, delivery_date: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Itens do orçamento
                </p>
                <div className="mb-3 flex flex-wrap gap-2">
                  <select
                    value={productPicker}
                    onChange={(e) => setProductPicker(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Adicionar produto do estoque...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.sale_price)}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProductToDraft}
                    disabled={!productPicker}
                  >
                    <Plus className="h-4 w-4" />
                    Produto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomItem}
                  >
                    <Plus className="h-4 w-4" />
                    Item avulso
                  </Button>
                </div>

                {draftItems.length > 0 ? (
                  <div className="space-y-2">
                    {draftItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-12"
                      >
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Descrição"
                            required
                            value={item.description}
                            onChange={(e) =>
                              updateDraftItem(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qtd"
                            value={item.quantity}
                            onChange={(e) =>
                              updateDraftItem(
                                index,
                                "quantity",
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Preço unit."
                            value={item.unit_price}
                            onChange={(e) =>
                              updateDraftItem(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-between sm:col-span-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDraftItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Adicione produtos ou itens avulsos ao orçamento.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Desconto (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.discount}
                  onChange={(e) =>
                    setDraft({ ...draft, discount: e.target.value })
                  }
                />
                <div className="flex items-end">
                  <div className="rounded-lg bg-slate-50 px-4 py-2">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-xl font-bold text-primary-700">
                      {formatCurrency(draftTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <Textarea
                label="Observações"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    saving || !draft.client_id || draftItems.length === 0
                  }
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Criar orçamento ({storageLabel})
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
                Orçamentos e vendas ({loading ? "..." : filtered.length})
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
                  Nenhum registro encontrado.
                </p>
              ) : (
                filtered.map((sale) => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => setSelectedSale(sale)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedSale?.id === sale.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {sale.client_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(sale.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(sale.total)}
                        </p>
                        <Badge variant={SALE_STATUS_VARIANT[sale.status]}>
                          {SALE_STATUS_LABELS[sale.status]}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedSale ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedSale.client_name}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(selectedSale.created_at)}
                      {selectedSale.salesperson_name &&
                        ` · Vendedor: ${selectedSale.salesperson_name}`}
                      {selectedSale.delivery_date &&
                        ` · Entrega: ${formatDate(selectedSale.delivery_date)}`}
                    </p>
                  </div>
                  <Badge variant={SALE_STATUS_VARIANT[selectedSale.status]}>
                    {SALE_STATUS_LABELS[selectedSale.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="pb-2 pr-4">Descrição</th>
                          <th className="pb-2 pr-4">Qtd</th>
                          <th className="pb-2 pr-4">Unit.</th>
                          <th className="pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100"
                          >
                            <td className="py-2 pr-4">{item.description}</td>
                            <td className="py-2 pr-4">{item.quantity}</td>
                            <td className="py-2 pr-4">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="py-2">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {selectedSale.discount > 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="pt-3 text-right text-slate-500"
                            >
                              Desconto
                            </td>
                            <td className="pt-3 text-red-600">
                              -{formatCurrency(selectedSale.discount)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td
                            colSpan={3}
                            className="pt-2 text-right font-medium"
                          >
                            Total
                          </td>
                          <td className="pt-2 text-lg font-bold text-primary-700">
                            {formatCurrency(selectedSale.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {selectedSale.notes && (
                    <p className="mb-4 text-sm text-slate-600">
                      <span className="font-medium">Obs:</span>{" "}
                      {selectedSale.notes}
                    </p>
                  )}

                  {integrationMsg && (
                    <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      {integrationMsg}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handlePrintOS}>
                      <Printer className="h-4 w-4" />
                      Imprimir OS
                    </Button>
                    {serviceOrders.some((o) => o.sale_id === selectedSale.id) && (
                      <Badge variant="info">
                        <FileText className="mr-1 inline h-3 w-3" />
                        OS no laboratório
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {SALE_STATUS_FLOW.includes(selectedSale.status) &&
                      SALE_STATUS_FLOW.indexOf(selectedSale.status) <
                        SALE_STATUS_FLOW.length - 1 && (
                        <Button
                          onClick={() => handleAdvanceStatus(selectedSale)}
                        >
                          Avançar para{" "}
                          {
                            SALE_STATUS_LABELS[
                              SALE_STATUS_FLOW[
                                SALE_STATUS_FLOW.indexOf(
                                  selectedSale.status,
                                ) + 1
                              ]
                            ]
                          }
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    {selectedSale.status !== "cancelado" &&
                      selectedSale.status !== "entregue" && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancel(selectedSale)}
                        >
                          Cancelar
                        </Button>
                      )}
                  </div>

                  {SALE_STATUS_FLOW.includes(selectedSale.status) && (
                    <div className="mt-4 flex items-center gap-1">
                      {SALE_STATUS_FLOW.map((status, i) => {
                        const currentIdx = SALE_STATUS_FLOW.indexOf(
                          selectedSale.status,
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
                            {i < SALE_STATUS_FLOW.length - 1 && (
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
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione um orçamento ou venda para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
