"use client";

import type { Product } from "@/lib/types";

const META_KEY = "opticare_product_meta";

type ProductMeta = Pick<
  Product,
  "barcode" | "image_url" | "price_table_id" | "contact_lens"
>;

function loadAll(): Record<string, ProductMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(meta: Record<string, ProductMeta>): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function mergeProductMeta(products: Product[]): Product[] {
  const meta = loadAll();
  return products.map((p) => ({
    ...p,
    ...meta[p.id],
    barcode: meta[p.id]?.barcode ?? p.barcode,
    image_url: meta[p.id]?.image_url ?? p.image_url,
    price_table_id: meta[p.id]?.price_table_id ?? p.price_table_id,
    contact_lens: meta[p.id]?.contact_lens ?? p.contact_lens,
  }));
}

export function saveProductMeta(
  productId: string,
  meta: ProductMeta,
): void {
  const all = loadAll();
  all[productId] = meta;
  saveAll(all);
}

export function findProductByBarcode(
  products: Product[],
  barcode: string,
): Product | undefined {
  const code = barcode.trim();
  if (!code) return undefined;
  return products.find(
    (p) =>
      p.barcode === code ||
      p.sku === code ||
      p.id === code,
  );
}
