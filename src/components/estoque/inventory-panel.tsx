"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { InventoryCount, Product } from "@/lib/types";
import {
  loadInventoryCounts,
  saveInventoryCount,
  createInventoryFromProducts,
  applyInventoryCount,
  findInventoryItemByBarcode,
  finalizeInventoryCount,
} from "@/lib/inventory-operations-store";
import { INVENTORY_STATUS_LABELS } from "@/lib/inventory-savwin";
import { loadProducts } from "@/lib/products-store";
import { findProductByBarcode } from "@/lib/product-meta-store";
import { formatDate } from "@/lib/utils";
import { Barcode, CheckCircle, Plus, Scan } from "lucide-react";

export function InventoryPanel() {
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState<InventoryCount | null>(null);
  const [barcode, setBarcode] = useState("");
  const [countName, setCountName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([loadInventoryCounts(), loadProducts()]).then(
      ([c, { products: p }]) => {
        setCounts(c);
        setProducts(p);
      },
    );
  }, []);

  const startCount = async () => {
    const name =
      countName.trim() ||
      `Inventário ${new Date().toLocaleDateString("pt-BR")}`;
    const count = createInventoryFromProducts(name, products);
    const saved = await saveInventoryCount(count);
    setCounts((prev) => [saved, ...prev]);
    setActive(saved);
    setCountName("");
    inputRef.current?.focus();
  };

  const handleBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !barcode.trim()) return;

    const item = findInventoryItemByBarcode(active, barcode.trim());
    if (item) {
      const updated = applyInventoryCount(
        active,
        item.id,
        item.counted_quantity + 1,
      );
      setActive(updated);
      await saveInventoryCount(updated);
      setCounts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } else {
      const product = findProductByBarcode(products, barcode.trim());
      if (product) {
        alert(`Produto "${product.name}" não está neste inventário.`);
      } else {
        alert("Código não encontrado.");
      }
    }
    setBarcode("");
    inputRef.current?.focus();
  };

  const finalize = async () => {
    if (!active) return;
    const updated = await finalizeInventoryCount(active.id, products);
    if (updated) {
      setActive(null);
      setCounts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
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
            <Scan className="h-5 w-5" />
            Inventário com código de barras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Use um leitor USB (modo teclado) ou digite o código e pressione Enter.
            Cada leitura incrementa a contagem do item.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              label="Nome do inventário"
              value={countName}
              onChange={(e) => setCountName(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex items-end">
              <Button onClick={startCount}>
                <Plus className="h-4 w-4" />
                Iniciar inventário
              </Button>
            </div>
          </div>

          {active && (
            <form onSubmit={handleBarcode} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Passe o código de barras..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <Button type="submit">Registrar</Button>
              <Button type="button" variant="outline" onClick={finalize}>
                <CheckCircle className="h-4 w-4" />
                Finalizar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardHeader>
            <CardTitle>
              {active.name} — {active.items.length} itens
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2">SKU</th>
                  <th className="pb-2">Produto</th>
                  <th className="pb-2">Sistema</th>
                  <th className="pb-2">Contado</th>
                  <th className="pb-2">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {active.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs">{item.sku}</td>
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2">{item.system_quantity}</td>
                    <td className="py-2">{item.counted_quantity}</td>
                    <td className="py-2">
                      {item.difference !== 0 ? (
                        <Badge
                          variant={item.difference < 0 ? "danger" : "warning"}
                        >
                          {item.difference > 0 ? "+" : ""}
                          {item.difference}
                        </Badge>
                      ) : (
                        "0"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {counts
          .filter((c) => c.id !== active?.id)
          .map((c) => (
            <Card key={c.id}>
              <CardContent className="flex justify-between py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(c.created_at)}
                  </p>
                </div>
                <Badge
                  variant={c.status === "finalizado" ? "success" : "info"}
                >
                  {INVENTORY_STATUS_LABELS[c.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
