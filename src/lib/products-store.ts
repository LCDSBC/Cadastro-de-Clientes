"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { Product } from "@/lib/types";
import { demoProducts } from "@/lib/types";

const LOCAL_KEY = "opticare_products";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapRow(row: Record<string, unknown>): Product {
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
    active: (row.active as boolean) ?? true,
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
        .order("name", { ascending: true });

      if (!error && data) {
        const products = data.map(mapRow);
        saveLocal(products);
        return { products, source: "supabase" };
      }
    }
  }
  return { products: loadLocal(), source: "local" };
}

export async function saveProduct(
  product: Product,
): Promise<{ product: Product; source: "supabase" | "local" }> {
  const fullProduct: Product = {
    ...product,
    id: product.id || crypto.randomUUID(),
  };

  const locals = loadLocal();
  const idx = locals.findIndex((p) => p.id === fullProduct.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = fullProduct;
  else updated.unshift(fullProduct);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: fullProduct.id,
        store_id: DEFAULT_STORE_ID,
        sku: fullProduct.sku,
        name: fullProduct.name,
        category: fullProduct.category,
        brand: fullProduct.brand ?? null,
        cost_price: fullProduct.cost_price,
        sale_price: fullProduct.sale_price,
        stock_quantity: fullProduct.stock_quantity,
        min_stock: fullProduct.min_stock,
        active: fullProduct.active,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("products").upsert(row);
      if (!error) return { product: fullProduct, source: "supabase" };
    }
  }

  return { product: fullProduct, source: "local" };
}

export async function deleteProduct(id: string): Promise<void> {
  const locals = loadLocal().filter((p) => p.id !== id);
  saveLocal(locals);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("products").delete().eq("id", id);
    }
  }
}

export function getStorageStatus(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
