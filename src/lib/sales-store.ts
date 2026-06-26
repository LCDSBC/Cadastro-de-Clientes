"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { Sale, SaleItem } from "@/lib/types";
import { demoSales } from "@/lib/types";

const LOCAL_KEY = "opticare_sales";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapSaleItem(row: Record<string, unknown>): SaleItem {
  return {
    id: row.id as string,
    sale_id: row.sale_id as string,
    product_id: (row.product_id as string) ?? undefined,
    description: row.description as string,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    total: Number(row.total),
  };
}

function mapSale(
  row: Record<string, unknown>,
  items: SaleItem[],
  clientName?: string,
): Sale {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    client_name: clientName ?? "Cliente",
    status: row.status as Sale["status"],
    total: Number(row.total),
    discount: Number(row.discount ?? 0),
    items,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: (row.updated_at as string) ?? undefined,
    delivery_date: (row.delivery_date as string) ?? undefined,
  };
}

function loadLocal(): Sale[] {
  if (typeof window === "undefined") return demoSales;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : demoSales;
  } catch {
    return demoSales;
  }
}

function saveLocal(sales: Sale[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(sales));
}

export function calcSaleTotal(items: SaleItem[], discount = 0): number {
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  return Math.max(0, subtotal - discount);
}

export async function loadSales(): Promise<{
  sales: Sale[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data: salesData, error } = await supabase
        .from("sales")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });

      if (!error && salesData) {
        const sales: Sale[] = [];
        for (const row of salesData) {
          const { data: itemsData } = await supabase
            .from("sale_items")
            .select("*")
            .eq("sale_id", row.id);

          const clientData = row.clients as { name: string } | null;
          sales.push(
            mapSale(
              row,
              (itemsData ?? []).map(mapSaleItem),
              clientData?.name,
            ),
          );
        }
        saveLocal(sales);
        return { sales, source: "supabase" };
      }
    }
  }
  return { sales: loadLocal(), source: "local" };
}

export async function saveSale(
  sale: Omit<Sale, "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  },
): Promise<{ sale: Sale; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const total = calcSaleTotal(sale.items, sale.discount);
  const full: Sale = {
    ...sale,
    id: sale.id ?? crypto.randomUUID(),
    total,
    created_at: sale.created_at ?? now,
    updated_at: now,
    items: sale.items.map((item) => ({
      ...item,
      id: item.id ?? crypto.randomUUID(),
      sale_id: sale.id ?? "",
    })),
  };
  full.items = full.items.map((i) => ({ ...i, sale_id: full.id }));

  const locals = loadLocal();
  const idx = locals.findIndex((s) => s.id === full.id);
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
        client_id: full.client_id,
        status: full.status,
        total: full.total,
        discount: full.discount,
        delivery_date: full.delivery_date ?? null,
        notes: full.notes ?? null,
        updated_at: full.updated_at,
      };

      const { error: saleError } = await supabase.from("sales").upsert(row);
      if (!saleError) {
        await supabase.from("sale_items").delete().eq("sale_id", full.id);
        if (full.items.length > 0) {
          await supabase.from("sale_items").insert(
            full.items.map((item) => ({
              id: item.id,
              sale_id: full.id,
              product_id: item.product_id ?? null,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total,
            })),
          );
        }
        return { sale: full, source: "supabase" };
      }
    }
  }
  return { sale: full, source: "local" };
}

export async function updateSaleStatus(
  saleId: string,
  status: Sale["status"],
): Promise<Sale | null> {
  const locals = loadLocal();
  const sale = locals.find((s) => s.id === saleId);
  if (!sale) return null;

  const updated = { ...sale, status, updated_at: new Date().toISOString() };
  await saveSale(updated);
  return updated;
}
