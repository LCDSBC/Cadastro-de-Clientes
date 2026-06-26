"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import { isLabOrderOverdue } from "@/lib/laboratory";
import type { ServiceOrder, LabSummary } from "@/lib/types";
import { demoServiceOrders } from "@/lib/types";

const LOCAL_KEY = "opticare_service_orders";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapOrder(
  row: Record<string, unknown>,
  clientName?: string,
  saleTotal?: number,
): ServiceOrder {
  return {
    id: row.id as string,
    sale_id: (row.sale_id as string) ?? undefined,
    client_name: clientName,
    sale_total: saleTotal,
    status: row.status as ServiceOrder["status"],
    lab_name: row.lab_name as string,
    expected_date: (row.expected_date as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
  };
}

function loadLocal(): ServiceOrder[] {
  if (typeof window === "undefined") return demoServiceOrders;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : demoServiceOrders;
  } catch {
    return demoServiceOrders;
  }
}

function saveLocal(orders: ServiceOrder[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
}

export function calcLabSummary(orders: ServiceOrder[]): LabSummary {
  const open = orders.filter((o) => o.status !== "entregue");

  return {
    abertas: orders.filter((o) => o.status === "aberta").length,
    emProducao: orders.filter((o) => o.status === "producao").length,
    prontas: orders.filter((o) => o.status === "pronta").length,
    entregues: orders.filter((o) => o.status === "entregue").length,
    atrasadas: open.filter(isLabOrderOverdue).length,
  };
}

export async function loadServiceOrders(): Promise<{
  orders: ServiceOrder[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, sales(total, clients(name))")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const orders = data.map((row) => {
          const saleData = row.sales as {
            total: number;
            clients: { name: string } | null;
          } | null;
          return mapOrder(
            row,
            saleData?.clients?.name,
            saleData?.total != null ? Number(saleData.total) : undefined,
          );
        });
        saveLocal(orders);
        return { orders, source: "supabase" };
      }
    }
  }
  return { orders: loadLocal(), source: "local" };
}

export async function saveServiceOrder(
  order: Omit<ServiceOrder, "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<{ order: ServiceOrder; source: "supabase" | "local" }> {
  const full: ServiceOrder = {
    ...order,
    id: order.id ?? crypto.randomUUID(),
    created_at: order.created_at ?? new Date().toISOString(),
  };

  const locals = loadLocal();
  const idx = locals.findIndex((o) => o.id === full.id);
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
        sale_id: full.sale_id ?? null,
        status: full.status,
        lab_name: full.lab_name,
        expected_date: full.expected_date ?? null,
        notes: full.notes ?? null,
      };
      const { error } = await supabase.from("service_orders").upsert(row);
      if (!error) return { order: full, source: "supabase" };
    }
  }
  return { order: full, source: "local" };
}

export async function updateServiceOrderStatus(
  orderId: string,
  status: ServiceOrder["status"],
): Promise<ServiceOrder | null> {
  const locals = loadLocal();
  const order = locals.find((o) => o.id === orderId);
  if (!order) return null;

  const updated = { ...order, status };
  const { order: saved } = await saveServiceOrder(updated);
  return saved;
}

export async function deleteServiceOrder(id: string): Promise<void> {
  saveLocal(loadLocal().filter((o) => o.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("service_orders").delete().eq("id", id);
    }
  }
}
