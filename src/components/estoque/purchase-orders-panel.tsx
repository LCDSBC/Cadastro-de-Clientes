"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product, PurchaseOrder, PurchaseOrderItem } from "@/lib/types";
import {
  loadPurchaseOrders,
  savePurchaseOrder,
  receivePurchaseOrder,
  calcOrderTotal,
} from "@/lib/inventory-operations-store";
import { PO_STATUS_LABELS } from "@/lib/inventory-savwin";
import { loadProducts } from "@/lib/products-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, PackageCheck, Trash2 } from "lucide-react";

export function PurchaseOrdersPanel() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Omit<PurchaseOrderItem, "id" | "total">[]
  >([{ description: "", quantity: 1, unit_cost: 0 }]);

  useEffect(() => {
    Promise.all([loadPurchaseOrders(), loadProducts()]).then(
      ([ordersData, { products: p }]) => {
        setOrders(ordersData);
        setProducts(p);
      },
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullItems: PurchaseOrderItem[] = items
      .filter((i) => i.description.trim())
      .map((i) => ({
        id: crypto.randomUUID(),
        description: i.description,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
        total: i.quantity * i.unit_cost,
      }));

    const order: PurchaseOrder = {
      id: crypto.randomUUID(),
      supplier_name: supplier.trim(),
      status: "rascunho",
      items: fullItems,
      total: calcOrderTotal(fullItems),
      notes: notes.trim() || undefined,
      expected_date: expectedDate || undefined,
      created_at: new Date().toISOString(),
    };

    const saved = await savePurchaseOrder(order);
    setOrders((prev) => [saved, ...prev]);
    setShowForm(false);
    setSupplier("");
    setItems([{ description: "", quantity: 1, unit_cost: 0 }]);
  };

  const handleReceive = async (order: PurchaseOrder) => {
    const updated = await receivePurchaseOrder(order.id, products);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
      const { products: refreshed } = await loadProducts();
      setProducts(refreshed);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Novo pedido de compra
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo pedido de compra</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Fornecedor"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
                <Input
                  label="Previsão de entrega"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>
              <p className="text-sm font-medium text-slate-700">Itens</p>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-5">
                    <select
                      className="mb-1 w-full rounded border px-2 py-1.5 text-sm"
                      value={item.product_id ?? ""}
                      onChange={(e) => {
                        const p = products.find((x) => x.id === e.target.value);
                        const updated = [...items];
                        updated[idx] = {
                          ...updated[idx],
                          product_id: e.target.value || undefined,
                          description: p?.name ?? updated[idx].description,
                          unit_cost: p?.cost_price ?? updated[idx].unit_cost,
                        };
                        setItems(updated);
                      }}
                    >
                      <option value="">Item avulso...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full rounded border px-2 py-1.5 text-sm"
                      placeholder="Descrição"
                      required
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].description = e.target.value;
                        setItems(updated);
                      }}
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    className="rounded border px-2 py-1.5 text-sm sm:col-span-2"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].quantity =
                        parseInt(e.target.value, 10) || 1;
                      setItems(updated);
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="rounded border px-2 py-1.5 text-sm sm:col-span-3"
                    value={item.unit_cost}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].unit_cost =
                        parseFloat(e.target.value) || 0;
                      setItems(updated);
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-500 sm:col-span-1"
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems([
                    ...items,
                    { description: "", quantity: 1, unit_cost: 0 },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                Adicionar item
              </Button>
              <Textarea
                label="Observações"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit">Salvar pedido</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{order.supplier_name}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(order.created_at)} · {order.items.length} itens
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{formatCurrency(order.total)}</p>
                <Badge variant={order.status === "recebido" ? "success" : "info"}>
                  {PO_STATUS_LABELS[order.status]}
                </Badge>
                {order.status !== "recebido" && (
                  <Button size="sm" onClick={() => handleReceive(order)}>
                    <PackageCheck className="h-4 w-4" />
                    Receber
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
