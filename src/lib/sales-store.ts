"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { Sale } from "@/lib/types";
import { demoSales } from "@/lib/types";

const LOCAL_KEY = "opticare_sales";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapRow(row: Record<string, unknown>, clientName?: string): Sale {
  return {
    id: row.id as string,
    client_id: (row.client_id as string) ?? "",
    client_name: clientName ?? (row.client_name as string) ?? "Cliente",
    status: row.status as Sale["status"],
    total: Number(row.total ?? 0),
    discount: row.discount != null ? Number(row.discount) : undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
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

export async function loadSales(): Promise<{
  sales: Sale[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("sales")
        .select("*, clients(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const sales = data.map((row) => {
          const clients = row.clients as { name: string } | null;
          return mapRow(row, clients?.name);
        });
        saveLocal(sales);
        return { sales, source: "supabase" };
      }
    }
  }
  return { sales: loadLocal(), source: "local" };
}

export async function saveSale(
  sale: Omit<Sale, "created_at"> & { created_at?: string },
): Promise<{ sale: Sale; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const fullSale: Sale = {
    ...sale,
    id: sale.id || crypto.randomUUID(),
    created_at: sale.created_at ?? now,
  };

  const locals = loadLocal();
  const idx = locals.findIndex((s) => s.id === fullSale.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = fullSale;
  else updated.unshift(fullSale);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: fullSale.id,
        store_id: DEFAULT_STORE_ID,
        client_id: fullSale.client_id || null,
        status: fullSale.status,
        total: fullSale.total,
        discount: fullSale.discount ?? 0,
        delivery_date: fullSale.delivery_date || null,
        notes: fullSale.notes ?? null,
        updated_at: now,
      };

      const { error } = await supabase.from("sales").upsert(row);
      if (!error) return { sale: fullSale, source: "supabase" };
    }
  }

  return { sale: fullSale, source: "local" };
}

export async function updateSaleStatus(
  id: string,
  status: Sale["status"],
): Promise<void> {
  const locals = loadLocal();
  const updated = locals.map((s) => (s.id === id ? { ...s, status } : s));
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("sales")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
    }
  }
}

export function getStorageStatus(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
