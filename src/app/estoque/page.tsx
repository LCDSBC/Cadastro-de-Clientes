"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import {
  deleteProduct,
  getStorageStatus,
  loadProducts,
  saveProduct,
} from "@/lib/products-store";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Search, X } from "lucide-react";

const categoryOptions = [
  { value: "armacao", label: "Armação" },
  { value: "lente", label: "Lente" },
  { value: "lente_contato", label: "Lente de contato" },
  { value: "solar", label: "Solar" },
  { value: "acessorio", label: "Acessório" },
];

const emptyForm = {
  sku: "",
  name: "",
  category: "armacao" as Product["category"],
  brand: "",
  cost_price: "",
  sale_price: "",
  stock_quantity: "",
  min_stock: "5",
};

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadProducts().then(({ products: data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.min_stock).length;
  const storageLabel = getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      brand: product.brand ?? "",
      cost_price: String(product.cost_price),
      sale_price: String(product.sale_price),
      stock_quantity: String(product.stock_quantity),
      min_stock: String(product.min_stock),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { product } = await saveProduct({
      id: editingId ?? crypto.randomUUID(),
      sku: form.sku,
      name: form.name,
      category: form.category,
      brand: form.brand || undefined,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
      min_stock: parseInt(form.min_stock, 10) || 0,
      active: true,
    });

    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });

    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AppShell>
      <PageHeader
        title="Estoque"
        description={`Controle de armações, lentes e inventário — ${storageLabel}`}
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total de produtos</p>
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Estoque baixo</p>
            <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Valor em estoque</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(
                products.reduce((sum, p) => sum + p.cost_price * p.stock_quantity, 0),
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Editar produto" : "Novo produto"}</CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
              <Input
                label="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Select
                label="Categoria"
                options={categoryOptions}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as Product["category"] })
                }
              />
              <Input
                label="Marca"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
              <Input
                label="Preço de custo"
                type="number"
                step="0.01"
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              />
              <Input
                label="Preço de venda"
                type="number"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
              <Input
                label="Quantidade em estoque"
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
              <Input
                label="Estoque mínimo"
                type="number"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
              />
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
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4">SKU</th>
                    <th className="pb-2 pr-4">Produto</th>
                    <th className="pb-2 pr-4">Categoria</th>
                    <th className="pb-2 pr-4">Estoque</th>
                    <th className="pb-2 pr-4">Preço</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-mono text-xs">{product.sku}</td>
                      <td className="py-3 pr-4 font-medium">{product.name}</td>
                      <td className="py-3 pr-4 capitalize">
                        {product.category.replace("_", " ")}
                      </td>
                      <td className="py-3 pr-4">{product.stock_quantity}</td>
                      <td className="py-3 pr-4">{formatCurrency(product.sale_price)}</td>
                      <td className="py-3 pr-4">
                        {product.stock_quantity <= product.min_stock ? (
                          <Badge variant="danger">Estoque baixo</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(product.id)}
                          >
                            Excluir
                          </Button>
                        </div>
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
