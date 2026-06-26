"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { loadProducts } from "@/lib/products-store";
import { LABEL_FORMATS } from "@/lib/inventory-savwin";
import {
  printProductLabels,
  type LabelFormat,
} from "@/lib/product-labels";
import type { Product } from "@/lib/types";

export function LabelsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<LabelFormat>("argox_50x30");
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadProducts().then(({ products: data }) => setProducts(data));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode ?? "").includes(search)),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function print() {
    const list = products.filter((p) => selected.has(p.id));
    if (!list.length) return;
    printProductLabels(list, format, qty);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Printer className="h-5 w-5" />
            Etiquetas — Argox / Zebra / A4
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione produtos e o formato da impressora. Gera página de impressão
            com código de barras (EAN/SKU), nome e preço.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="Formato"
              value={format}
              onChange={(e) => setFormat(e.target.value as LabelFormat)}
              options={LABEL_FORMATS.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
              className="w-52"
            />
            <Input
              type="number"
              label="Cópias"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-24"
            />
            <Button onClick={print} disabled={!selected.size}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir ({selected.size})
            </Button>
          </div>
          <Input
            placeholder="Buscar produto, SKU ou código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto rounded-lg border">
            {filtered.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 border-b p-3 hover:bg-muted/50 last:border-0"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {p.sku}
                    {p.barcode ? ` · EAN: ${p.barcode}` : ""} · R${" "}
                    {p.sale_price.toFixed(2)}
                  </p>
                </div>
              </label>
            ))}
            {!filtered.length && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
