"use client";

import { useEffect, useState } from "react";
import { Percent, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deletePriceTable,
  loadPriceTables,
  savePriceTable,
} from "@/lib/inventory-operations-store";
import { loadProducts } from "@/lib/products-store";
import { saveProductMeta } from "@/lib/product-meta-store";
import type { PriceTable, Product } from "@/lib/types";

function parsePct(v: string): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function PriceTablesPanel() {
  const [tables, setTables] = useState<PriceTable[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("10");
  const [editing, setEditing] = useState<PriceTable | null>(null);

  async function refresh() {
    const [t, { products: p }] = await Promise.all([
      loadPriceTables(),
      loadProducts(),
    ]);
    setTables(t);
    setProducts(p);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    const table: PriceTable = editing
      ? { ...editing, name: name.trim(), discount_percent: parsePct(discount) }
      : {
          id: crypto.randomUUID(),
          name: name.trim(),
          discount_percent: parsePct(discount),
          active: true,
          created_at: new Date().toISOString(),
        };
    await savePriceTable(table);
    setName("");
    setDiscount("10");
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta tabela de preços?")) return;
    await deletePriceTable(id);
    await refresh();
  }

  async function assignTable(productId: string, tableId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    await saveProductMeta(productId, {
      barcode: product.barcode,
      image_url: product.image_url,
      contact_lens: product.contact_lens,
      price_table_id: tableId || undefined,
    });
    await refresh();
  }

  function priceWithTable(product: Product): number {
    if (!product.price_table_id) return product.sale_price;
    const t = tables.find((x) => x.id === product.price_table_id);
    if (!t?.active) return product.sale_price;
    return Math.round(product.sale_price * (1 - t.discount_percent / 100) * 100) / 100;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-5 w-5" />
            Tabelas de preços e promoções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Defina tabelas com desconto percentual e associe aos produtos. O preço promocional é calculado sobre o preço de venda cadastrado.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Nome da tabela (ex: Funcionários -10%)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[200px] flex-1"
            />
            <Input
              type="text"
              placeholder="Desconto %"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-28"
            />
            <Button onClick={() => void handleSave()}>
              <Plus className="mr-2 h-4 w-4" />
              {editing ? "Salvar" : "Nova tabela"}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={() => { setEditing(null); setName(""); }}>
                Cancelar
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {tables.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="info" className="ml-2">
                    -{t.discount_percent}%
                  </Badge>
                  {!t.active && (
                    <Badge variant="warning" className="ml-1">
                      Inativa
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(t);
                      setName(t.name);
                      setDiscount(String(t.discount_percent));
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!tables.length && (
              <p className="text-sm text-muted-foreground">Nenhuma tabela cadastrada.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produtos × tabela de preço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-2">Produto</th>
                  <th className="p-2 text-right">Preço base</th>
                  <th className="p-2">Tabela</th>
                  <th className="p-2 text-right">Preço final</th>
                </tr>
              </thead>
              <tbody>
                {products.filter((p) => p.active).map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 text-right">R$ {p.sale_price.toFixed(2)}</td>
                    <td className="p-2">
                      <select
                        className="w-full max-w-xs rounded-md border bg-background px-2 py-1 text-sm"
                        value={p.price_table_id ?? ""}
                        onChange={(e) => void assignTable(p.id, e.target.value)}
                      >
                        <option value="">— Padrão —</option>
                        {tables.filter((t) => t.active).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (-{t.discount_percent}%)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 text-right font-medium">
                      R$ {priceWithTable(p).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
