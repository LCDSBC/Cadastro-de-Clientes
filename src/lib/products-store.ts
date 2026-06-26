"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { Product, LensGridEntry } from "@/lib/types";
import { demoProducts } from "@/lib/types";

const LOCAL_KEY = "opticare_products";
const GRID_KEY = "opticare_lens_grid";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    sku: row.sku as string,
    name: row.name as string,
    category: row.category as Product["category"],
    brand: (row.brand as string) ?? undefined,
    cost_price: Number(row.cost_price ?? 0),
    sale_price: Number(row.sale_price ?? 0),
    stock_quantity: Number(row.stock_quantity ?? 0),
    min_stock: Number(row.min_stock ?? 0),
    active: row.active !== false,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

function loadLocal(): Product[] {
  if (typeof window === "undefined") return demoProducts;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : demoProducts;
  } catch {
    return demoProducts;
  }
}

function saveLocal(products: Product[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
}

export async function loadProducts(): Promise<{
  products: Product[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (!error && data) {
        const products = data.map(mapProduct);
        saveLocal(products);
        return { products, source: "supabase" };
      }
    }
  }
  return { products: loadLocal(), source: "local" };
}

export async function saveProduct(
  product: Omit<Product, "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  },
): Promise<{ product: Product; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const full: Product = {
    ...product,
    id: product.id ?? crypto.randomUUID(),
    active: product.active ?? true,
    created_at: product.created_at ?? now,
    updated_at: now,
  };

  const locals = loadLocal();
  const idx = locals.findIndex((p) => p.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        sku: full.sku,
        name: full.name,
        category: full.category,
        brand: full.brand ?? null,
        cost_price: full.cost_price,
        sale_price: full.sale_price,
        stock_quantity: full.stock_quantity,
        min_stock: full.min_stock,
        active: full.active,
        updated_at: full.updated_at,
      };
      const { error } = await supabase.from("products").upsert(row);
      if (!error) return { product: full, source: "supabase" };
    }
  }
  return { product: full, source: "local" };
}

export async function deleteProduct(id: string): Promise<void> {
  saveLocal(loadLocal().filter((p) => p.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) await supabase.from("products").delete().eq("id", id);
  }
}

export async function loadLensGrid(productId: string): Promise<LensGridEntry[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase
        .from("lens_grid")
        .select("*")
        .eq("product_id", productId)
        .order("esf");
      if (data) return data.map((r) => ({
        id: r.id as string,
        product_id: r.product_id as string,
        esf: Number(r.esf),
        cil: Number(r.cil),
        eixo: r.eixo as number | undefined,
        quantity: Number(r.quantity),
      }));
    }
  }
  try {
    const raw = localStorage.getItem(GRID_KEY);
    const all: LensGridEntry[] = raw ? JSON.parse(raw) : [];
    return all.filter((g) => g.product_id === productId);
  } catch {
    return [];
  }
}

export async function saveLensGridEntry(
  entry: Omit<LensGridEntry, "id"> & { id?: string },
): Promise<LensGridEntry> {
  const full: LensGridEntry = { ...entry, id: entry.id ?? crypto.randomUUID() };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("lens_grid").upsert({
        id: full.id,
        product_id: full.product_id,
        esf: full.esf,
        cil: full.cil,
        eixo: full.eixo ?? null,
        quantity: full.quantity,
      });
      return full;
    }
  }

  const raw = localStorage.getItem(GRID_KEY);
  const all: LensGridEntry[] = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex((g) => g.id === full.id);
  if (idx >= 0) all[idx] = full;
  else all.push(full);
  localStorage.setItem(GRID_KEY, JSON.stringify(all));
  return full;
}
