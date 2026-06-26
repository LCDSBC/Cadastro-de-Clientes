"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product, StockTransfer } from "@/lib/types";
import {
  loadStockTransfers,
  saveStockTransfer,
  completeStockTransfer,
} from "@/lib/inventory-operations-store";
import { STORE_BRANCHES, TRANSFER_STATUS_LABELS } from "@/lib/inventory-savwin";
import { loadProducts } from "@/lib/products-store";
import { formatDate } from "@/lib/utils";
import { Plus, ArrowRightLeft } from "lucide-react";

export function TransfersPanel() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fromId, setFromId] = useState(STORE_BRANCHES[0].id);
  const [toId, setToId] = useState(STORE_BRANCHES[1].id);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    Promise.all([loadStockTransfers(), loadProducts()]).then(
      ([t, { products: p }]) => {
        setTransfers(t);
        setProducts(p);
      },
    );
  }, []);

  const handleCreate = async () => {
    const product = products.find((p) => p.id === productId);
    if (!product || fromId === toId) return;

    const from = STORE_BRANCHES.find((s) => s.id === fromId)!;
    const to = STORE_BRANCHES.find((s) => s.id === toId)!;
    const qty = parseInt(quantity, 10) || 1;

    const transfer: StockTransfer = {
      id: crypto.randomUUID(),
      from_store_id: from.id,
      from_store_name: from.name,
      to_store_id: to.id,
      to_store_name: to.name,
      status: "pendente",
      items: [
        {
          id: crypto.randomUUID(),
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          quantity: qty,
        },
      ],
      created_at: new Date().toISOString(),
    };

    const saved = await saveStockTransfer(transfer);
    setTransfers((prev) => [saved, ...prev]);
    setProductId("");
  };

  const handleComplete = async (transfer: StockTransfer) => {
    const updated = await completeStockTransfer(transfer.id, products);
    if (updated) {
      setTransfers((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      const { products: refreshed } = await loadProducts();
      setProducts(refreshed);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Nova transferência entre filiais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="Origem"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            options={STORE_BRANCHES.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />
          <Select
            label="Destino"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            options={STORE_BRANCHES.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />
          <Select
            label="Produto"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={[
              { value: "", label: "Selecione..." },
              ...products.map((p) => ({
                value: p.id,
                label: `${p.sku} — ${p.name}`,
              })),
            ]}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!productId || fromId === toId}
            >
              <Plus className="h-4 w-4" />
              Transferir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {transfers.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">
                  {t.from_store_name} → {t.to_store_name}
                </p>
                <p className="text-sm text-slate-500">
                  {t.items.map((i) => `${i.product_name} (${i.quantity})`).join(", ")}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(t.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={t.status === "concluida" ? "success" : "warning"}
                >
                  {TRANSFER_STATUS_LABELS[t.status]}
                </Badge>
                {t.status === "pendente" && (
                  <Button size="sm" onClick={() => handleComplete(t)}>
                    Concluir
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
