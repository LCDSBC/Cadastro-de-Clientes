"use client";

import { useEffect, useState } from "react";
import {
  CONTACT_LENS_DISPOSAL,
  CONTACT_LENS_MATERIALS,
  calcPriceWithTable,
  formatContactLensSpec,
} from "@/lib/inventory-savwin";
import { loadPriceTables } from "@/lib/inventory-operations-store";
import type { PriceTable, Product, LensGridEntry, ContactLensSpec } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  loadProducts,
  saveProduct,
  deleteProduct,
  loadLensGrid,
  saveLensGridEntry,
} from "@/lib/products-store";
import { PRODUCT_CATEGORIES } from "@/lib/inventory";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Package,
  X,
  Loader2,
  AlertTriangle,
  Pencil,
  Trash2,
  Grid3x3,
} from "lucide-react";

const emptyForm = {
  sku: "",
  name: "",
  category: "armacao" as Product["category"],
  brand: "",
  barcode: "",
  price_table_id: "",
  image_url: "",
  cost_price: "",
  sale_price: "",
  stock_quantity: "",
  min_stock: "",
  active: true,
  lc_curva_base: "8.6",
  lc_diametro: "14.2",
  lc_material: "Silicone-hidrogel",
  lc_descarte: "mensal" as ContactLensSpec["descarte"],
  lc_esf: "",
  lc_cil: "",
  lc_eixo: "",
};

const emptyGridForm = {
  esf: "",
  cil: "",
  eixo: "",
  quantity: "",
};

export function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [lensGrid, setLensGrid] = useState<LensGridEntry[]>([]);
  const [gridForm, setGridForm] = useState(emptyGridForm);
  const [savingGrid, setSavingGrid] = useState(false);
  const [priceTables, setPriceTables] = useState<PriceTable[]>([]);

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    Promise.all([loadProducts(), loadPriceTables()]).then(
      ([{ products: data }, tables]) => {
        setProducts(data);
        setPriceTables(tables);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (selectedProduct?.category === "lente") {
      loadLensGrid(selectedProduct.id).then(setLensGrid);
    } else {
      setLensGrid([]);
    }
  }, [selectedProduct]);

  const lowStockCount = products.filter(
    (p) => p.active && p.stock_quantity <= p.min_stock,
  ).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (p.barcode?.includes(search) ?? false);
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      brand: product.brand ?? "",
      barcode: product.barcode ?? "",
      price_table_id: product.price_table_id ?? "",
      image_url: product.image_url ?? "",
      cost_price: String(product.cost_price),
      sale_price: String(product.sale_price),
      stock_quantity: String(product.stock_quantity),
      min_stock: String(product.min_stock),
      active: product.active,
      lc_curva_base: String(product.contact_lens?.curva_base ?? 8.6),
      lc_diametro: String(product.contact_lens?.diametro ?? 14.2),
      lc_material: product.contact_lens?.material ?? "Silicone-hidrogel",
      lc_descarte: product.contact_lens?.descarte ?? "mensal",
      lc_esf: product.contact_lens?.esf != null ? String(product.contact_lens.esf) : "",
      lc_cil: product.contact_lens?.cil != null ? String(product.contact_lens.cil) : "",
      lc_eixo: product.contact_lens?.eixo != null ? String(product.contact_lens.eixo) : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const contact_lens =
      form.category === "lente_contato"
        ? {
            curva_base: parseFloat(form.lc_curva_base) || undefined,
            diametro: parseFloat(form.lc_diametro) || undefined,
            material: form.lc_material,
            descarte: form.lc_descarte,
            esf: form.lc_esf ? parseFloat(form.lc_esf) : undefined,
            cil: form.lc_cil ? parseFloat(form.lc_cil) : undefined,
            eixo: form.lc_eixo ? parseInt(form.lc_eixo, 10) : undefined,
          }
        : undefined;

    const { product } = await saveProduct({
      id: editingId ?? crypto.randomUUID(),
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      image_url: form.image_url || undefined,
      price_table_id: form.price_table_id || undefined,
      contact_lens,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
      min_stock: parseInt(form.min_stock, 10) || 0,
      active: form.active,
    });

    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });

    if (selectedProduct?.id === product.id) setSelectedProduct(product);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct?.id === id) setSelectedProduct(null);
  };

  const handleGridSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSavingGrid(true);
    const entry = await saveLensGridEntry({
      product_id: selectedProduct.id,
      esf: parseFloat(gridForm.esf) || 0,
      cil: parseFloat(gridForm.cil) || 0,
      eixo: gridForm.eixo ? parseInt(gridForm.eixo, 10) : undefined,
      quantity: parseInt(gridForm.quantity, 10) || 0,
    });
    setLensGrid((prev) => {
      const idx = prev.findIndex((g) => g.id === entry.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      }
      return [...prev, entry].sort((a, b) => a.esf - b.esf || a.cil - b.cil);
    });
    setGridForm(emptyGridForm);
    setSavingGrid(false);
  };

  const categoryLabel = (cat: Product["category"]) =>
    PRODUCT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  const selectedTable = priceTables.find(
    (t) => t.id === selectedProduct?.price_table_id,
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNewForm}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {lowStockCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>{lowStockCount}</strong>{" "}
            {lowStockCount === 1 ? "produto com" : "produtos com"} estoque
            abaixo do mínimo
          </span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por SKU, nome ou marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="all">Todas as categorias</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
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
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              <Input
                label="Nome"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Select
                label="Categoria"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as Product["category"],
                  })
                }
                options={PRODUCT_CATEGORIES.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
              />
              <Input
                label="Marca"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
              <Input
                label="Código de barras (EAN/GTIN)"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
              <Select
                label="Tabela de preço"
                value={form.price_table_id}
                onChange={(e) =>
                  setForm({ ...form, price_table_id: e.target.value })
                }
                options={[
                  { value: "", label: "Preço padrão" },
                  ...priceTables
                    .filter((t) => t.active)
                    .map((t) => ({
                      value: t.id,
                      label: `${t.name} (-${t.discount_percent}%)`,
                    })),
                ]}
              />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Imagem do produto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      setForm({
                        ...form,
                        image_url: reader.result as string,
                      });
                    reader.readAsDataURL(file);
                  }}
                  className="text-sm"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-2 h-24 rounded border object-contain"
                  />
                )}
              </div>
              {form.category === "lente_contato" && (
                <>
                  <Input
                    label="Curva base (BC)"
                    type="number"
                    step="0.1"
                    value={form.lc_curva_base}
                    onChange={(e) =>
                      setForm({ ...form, lc_curva_base: e.target.value })
                    }
                  />
                  <Input
                    label="Diâmetro (mm)"
                    type="number"
                    step="0.1"
                    value={form.lc_diametro}
                    onChange={(e) =>
                      setForm({ ...form, lc_diametro: e.target.value })
                    }
                  />
                  <Select
                    label="Material"
                    value={form.lc_material}
                    onChange={(e) =>
                      setForm({ ...form, lc_material: e.target.value })
                    }
                    options={CONTACT_LENS_MATERIALS.map((m) => ({
                      value: m,
                      label: m,
                    }))}
                  />
                  <Select
                    label="Descarte"
                    value={form.lc_descarte}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lc_descarte: e.target.value as typeof form.lc_descarte,
                      })
                    }
                    options={CONTACT_LENS_DISPOSAL.map((d) => ({
                      value: d.value,
                      label: d.label,
                    }))}
                  />
                  <Input
                    label="Esf"
                    type="number"
                    step="0.25"
                    value={form.lc_esf}
                    onChange={(e) =>
                      setForm({ ...form, lc_esf: e.target.value })
                    }
                  />
                  <Input
                    label="Cil"
                    type="number"
                    step="0.25"
                    value={form.lc_cil}
                    onChange={(e) =>
                      setForm({ ...form, lc_cil: e.target.value })
                    }
                  />
                  <Input
                    label="Eixo"
                    type="number"
                    value={form.lc_eixo}
                    onChange={(e) =>
                      setForm({ ...form, lc_eixo: e.target.value })
                    }
                  />
                </>
              )}
              <Input
                label="Preço de custo (R$)"
                type="number"
                step="0.01"
                min="0"
                value={form.cost_price}
                onChange={(e) =>
                  setForm({ ...form, cost_price: e.target.value })
                }
              />
              <Input
                label="Preço de venda (R$)"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: e.target.value })
                }
              />
              <Input
                label="Quantidade em estoque"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm({ ...form, stock_quantity: e.target.value })
                }
              />
              <Input
                label="Estoque mínimo"
                type="number"
                min="0"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
              />
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Produto ativo</span>
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
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
                Produtos ({loading ? "..." : filtered.length})
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
                  Nenhum produto encontrado.
                </p>
              ) : (
                filtered.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedProduct?.id === product.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.sku} · {categoryLabel(product.category)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(product.sale_price)}
                        </p>
                        {product.stock_quantity <= product.min_stock ? (
                          <Badge variant="danger">Baixo</Badge>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {product.stock_quantity} un.
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedProduct ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{selectedProduct.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(selectedProduct)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(selectedProduct.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">SKU</dt>
                      <dd className="font-mono font-medium">
                        {selectedProduct.sku}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Categoria</dt>
                      <dd className="font-medium">
                        {categoryLabel(selectedProduct.category)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Código de barras</dt>
                      <dd className="font-mono text-sm">
                        {selectedProduct.barcode ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Tabela de preço</dt>
                      <dd className="font-medium">
                        {selectedTable?.name ?? "Padrão"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Marca</dt>
                      <dd className="font-medium">
                        {selectedProduct.brand ?? "—"}
                      </dd>
                    </div>
                    {selectedProduct.image_url && (
                      <div className="sm:col-span-2">
                        <dt className="mb-2 text-xs text-slate-500">Imagem</dt>
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="h-32 rounded border object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-slate-500">Status</dt>
                      <dd>
                        {selectedProduct.active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="default">Inativo</Badge>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Custo</dt>
                      <dd className="font-medium">
                        {formatCurrency(selectedProduct.cost_price)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Venda</dt>
                      <dd className="font-medium text-primary-700">
                        {formatCurrency(
                          calcPriceWithTable(
                            selectedProduct.sale_price,
                            selectedTable,
                          ),
                        )}
                        {selectedTable && (
                          <span className="ml-1 text-xs text-slate-500 line-through">
                            {formatCurrency(selectedProduct.sale_price)}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Estoque</dt>
                      <dd className="font-medium">
                        {selectedProduct.stock_quantity} un. (mín.{" "}
                        {selectedProduct.min_stock})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Margem</dt>
                      <dd className="font-medium">
                        {selectedProduct.cost_price > 0
                          ? `${(((selectedProduct.sale_price - selectedProduct.cost_price) / selectedProduct.cost_price) * 100).toFixed(1)}%`
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                  {selectedProduct.category === "lente_contato" &&
                    selectedProduct.contact_lens && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                        <span className="font-medium">Lente de contato: </span>
                        {formatContactLensSpec(selectedProduct.contact_lens)}
                      </p>
                    )}
                </CardContent>
              </Card>

              {selectedProduct.category === "lente" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3x3 className="h-5 w-5" />
                      Grade de lentes (Esf / Cil)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleGridSubmit}
                      className="mb-4 grid gap-3 sm:grid-cols-5"
                    >
                      <Input
                        label="Esf"
                        type="number"
                        step="0.25"
                        required
                        value={gridForm.esf}
                        onChange={(e) =>
                          setGridForm({ ...gridForm, esf: e.target.value })
                        }
                      />
                      <Input
                        label="Cil"
                        type="number"
                        step="0.25"
                        required
                        value={gridForm.cil}
                        onChange={(e) =>
                          setGridForm({ ...gridForm, cil: e.target.value })
                        }
                      />
                      <Input
                        label="Eixo"
                        type="number"
                        min="0"
                        max="180"
                        value={gridForm.eixo}
                        onChange={(e) =>
                          setGridForm({ ...gridForm, eixo: e.target.value })
                        }
                      />
                      <Input
                        label="Qtd"
                        type="number"
                        min="0"
                        required
                        value={gridForm.quantity}
                        onChange={(e) =>
                          setGridForm({ ...gridForm, quantity: e.target.value })
                        }
                      />
                      <div className="flex items-end">
                        <Button type="submit" disabled={savingGrid} className="w-full">
                          {savingGrid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Adicionar
                        </Button>
                      </div>
                    </form>

                    {lensGrid.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-500">
                              <th className="pb-2 pr-4">Esf</th>
                              <th className="pb-2 pr-4">Cil</th>
                              <th className="pb-2 pr-4">Eixo</th>
                              <th className="pb-2">Qtd</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lensGrid.map((entry) => (
                              <tr
                                key={entry.id}
                                className="border-b border-slate-100"
                              >
                                <td className="py-2 pr-4">
                                  {entry.esf > 0 ? `+${entry.esf}` : entry.esf}
                                </td>
                                <td className="py-2 pr-4">{entry.cil}</td>
                                <td className="py-2 pr-4">
                                  {entry.eixo != null ? `${entry.eixo}°` : "—"}
                                </td>
                                <td className="py-2">
                                  {entry.quantity <= 2 ? (
                                    <Badge variant="warning">
                                      {entry.quantity}
                                    </Badge>
                                  ) : (
                                    entry.quantity
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhuma entrada na grade. Adicione combinações
                        esf/cil/eixo.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione um produto para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
