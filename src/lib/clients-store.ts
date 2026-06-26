"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { Client, Prescription } from "@/lib/types";
import { demoClients, demoPrescriptions } from "@/lib/types";

const LOCAL_CLIENTS_KEY = "opticare_clients";
const LOCAL_PRESCRIPTIONS_KEY = "opticare_prescriptions";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapClientRow(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    cpf: (row.cpf as string) ?? "",
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    birth_date: (row.birth_date as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    city: (row.city as string) ?? undefined,
    state: (row.state as string) ?? undefined,
    zip_code: (row.zip_code as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: (row.updated_at as string) ?? (row.created_at as string),
  };
}

function mapPrescriptionRow(row: Record<string, unknown>): Prescription {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    exam_date: row.exam_date as string,
    od_esf: row.od_esf as number | undefined,
    od_cil: row.od_cil as number | undefined,
    od_eixo: row.od_eixo as number | undefined,
    od_add: row.od_add as number | undefined,
    oe_esf: row.oe_esf as number | undefined,
    oe_cil: row.oe_cil as number | undefined,
    oe_eixo: row.oe_eixo as number | undefined,
    oe_add: row.oe_add as number | undefined,
    dp: row.dp as number | undefined,
    optometrist: (row.optometrist as string) ?? undefined,
    valid_until: (row.valid_until as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
  };
}

function loadLocalClients(): Client[] {
  if (typeof window === "undefined") return demoClients;
  try {
    const raw = localStorage.getItem(LOCAL_CLIENTS_KEY);
    return raw ? JSON.parse(raw) : demoClients;
  } catch {
    return demoClients;
  }
}

function saveLocalClients(clients: Client[]): void {
  localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients));
}

function loadLocalPrescriptions(): Prescription[] {
  if (typeof window === "undefined") return demoPrescriptions;
  try {
    const raw = localStorage.getItem(LOCAL_PRESCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : demoPrescriptions;
  } catch {
    return demoPrescriptions;
  }
}

export async function loadClients(): Promise<{
  clients: Client[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const clients = data.map(mapClientRow);
        saveLocalClients(clients);
        return { clients, source: "supabase" };
      }
    }
  }
  return { clients: loadLocalClients(), source: "local" };
}

export async function saveClient(
  client: Omit<Client, "created_at" | "updated_at"> & {
    created_at?: string;
    updated_at?: string;
  },
): Promise<{ client: Client; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const fullClient: Client = {
    ...client,
    id: client.id || crypto.randomUUID(),
    created_at: client.created_at ?? now,
    updated_at: now,
  };

  const locals = loadLocalClients();
  const idx = locals.findIndex((c) => c.id === fullClient.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = fullClient;
  else updated.unshift(fullClient);
  saveLocalClients(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: fullClient.id,
        store_id: DEFAULT_STORE_ID,
        name: fullClient.name,
        cpf: fullClient.cpf.replace(/\D/g, "") || null,
        email: fullClient.email ?? null,
        phone: fullClient.phone ?? null,
        birth_date: fullClient.birth_date || null,
        address: fullClient.address ?? null,
        city: fullClient.city ?? null,
        state: fullClient.state ?? null,
        zip_code: fullClient.zip_code ?? null,
        notes: fullClient.notes ?? null,
        updated_at: fullClient.updated_at,
      };

      const { error } = await supabase.from("clients").upsert(row);
      if (!error) return { client: fullClient, source: "supabase" };
    }
  }

  return { client: fullClient, source: "local" };
}

export async function loadPrescriptions(
  clientId?: string,
): Promise<Prescription[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      let query = supabase.from("prescriptions").select("*").order("exam_date", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (!error && data) return data.map(mapPrescriptionRow);
    }
  }

  const local = loadLocalPrescriptions();
  return clientId ? local.filter((p) => p.client_id === clientId) : local;
}

function saveLocalPrescriptions(prescriptions: Prescription[]): void {
  localStorage.setItem(LOCAL_PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
}

export async function savePrescription(
  rx: Omit<Prescription, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<Prescription> {
  const full: Prescription = {
    ...rx,
    id: rx.id ?? crypto.randomUUID(),
    created_at: rx.created_at ?? new Date().toISOString(),
  };

  const locals = loadLocalPrescriptions();
  const idx = locals.findIndex((p) => p.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveLocalPrescriptions(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        client_id: full.client_id,
        exam_date: full.exam_date,
        od_esf: full.od_esf ?? null,
        od_cil: full.od_cil ?? null,
        od_eixo: full.od_eixo ?? null,
        od_add: full.od_add ?? null,
        oe_esf: full.oe_esf ?? null,
        oe_cil: full.oe_cil ?? null,
        oe_eixo: full.oe_eixo ?? null,
        oe_add: full.oe_add ?? null,
        dp: full.dp ?? null,
        optometrist: full.optometrist ?? null,
        valid_until: full.valid_until ?? null,
        notes: full.notes ?? null,
      };
      await supabase.from("prescriptions").upsert(row);
    }
  }

  return full;
}
