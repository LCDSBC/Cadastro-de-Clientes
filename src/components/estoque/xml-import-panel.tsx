"use client";

import { useState } from "react";
import { FileUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseNfeXml, type NfeImportResult } from "@/lib/nfe-import";
import {
  calcOrderTotal,
  savePurchaseOrder,
} from "@/lib/inventory-operations-store";
import { loadProducts, saveProduct } from "@/lib/products-store";
import type { PurchaseOrder, PurchaseOrderItem } from "@/lib/types";

export function XmlImportPanel() {
  const [preview, setPreview] = useState<NfeImportResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleFile(file: File) {
    setError("");
    setMsg("");
    setPreview(null);
    try {
      const text = await file.text();
      setPreview(parseNfeXml(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "XML inválido");
    }
  }

  async function importAsPurchaseOrder() {
    if (!preview) return;
    setBusy(true);
    try {
      const fullItems: PurchaseOrderItem[] = preview.items.map((i) => ({
        id: crypto.randomUUID(),
        description: i.description,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
        total: i.total || i.quantity * i.unit_cost,
      }));

      const order: PurchaseOrder = {
        id: crypto.randomUUID(),
        supplier_name: preview.supplier_name,
        status: "rascunho",
        notes: `NF-e ${preview.invoice_number ?? ""} importada`.trim(),
        items: fullItems,
        total: calcOrderTotal(fullItems),
        created_at: new Date().toISOString(),
      };

      await savePurchaseOrder(order);
      setMsg("Pedido de compra criado a partir da NF-e. Confira em Pedidos de compra.");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function importProducts() {
    if (!preview) return;
    setBusy(true);
    try {
      const { products: existing } = await loadProducts();
      let created = 0;
      for (const item of preview.items) {
        const sku =
          item.sku ||
          `NFE-${item.description.slice(0, 20).replace(/\s/g, "-")}`;
        if (existing.some((p) => p.sku === sku)) continue;
        await saveProduct({
          id: crypto.randomUUID(),
          sku,
          name: item.description,
          category: "acessorio",
          cost_price: item.unit_cost,
          sale_price: Math.round(item.unit_cost * 1.5 * 100) / 100,
          stock_quantity: 0,
          min_stock: 0,
          active: true,
          barcode: item.barcode || undefined,
        });
        created++;
      }
      setMsg(
        `${created} produto(s) cadastrado(s). Revise categorias e preços em Produtos.`,
      );
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileUp className="h-5 w-5" />
            Importação de XML de fornecedores (NF-e)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envie o arquivo XML da nota fiscal eletrônica. O sistema extrai
            fornecedor, itens, quantidades e valores para gerar pedido de compra
            ou cadastrar produtos.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:bg-muted/50">
            <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              Clique ou arraste o arquivo .xml
            </span>
            <input
              type="file"
              accept=".xml,text/xml,application/xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização da NF-e</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Fornecedor:</span>{" "}
                {preview.supplier_name}
              </p>
              <p>
                <span className="text-muted-foreground">CNPJ:</span>{" "}
                {preview.supplier_cnpj || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">NF-e:</span>{" "}
                {preview.invoice_number || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Emissão:</span>{" "}
                {preview.issue_date || "—"}
              </p>
              <p className="font-medium sm:col-span-2">
                Total: R$ {preview.total.toFixed(2)}
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-2">Descrição</th>
                    <th className="p-2">SKU/EAN</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Unit.</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.items.map((i, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{i.description}</td>
                      <td className="p-2 font-mono text-xs">
                        {i.sku || i.barcode || "—"}
                      </td>
                      <td className="p-2 text-right">{i.quantity}</td>
                      <td className="p-2 text-right">
                        R$ {i.unit_cost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void importAsPurchaseOrder()}
                disabled={busy}
              >
                <Package className="mr-2 h-4 w-4" />
                Criar pedido de compra
              </Button>
              <Button
                variant="outline"
                onClick={() => void importProducts()}
                disabled={busy}
              >
                Cadastrar produtos novos
              </Button>
              <Badge variant="info">{preview.items.length} itens</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
