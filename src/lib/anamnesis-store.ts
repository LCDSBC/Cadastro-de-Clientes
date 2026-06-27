"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import { normalizeAnamnesis } from "@/lib/anamnesis";
import { queueAnamnesisSync } from "@/lib/client-folder-sync";

const LOCAL_KEY = "opticare_anamnesis_records";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function loadLocal(): StructuredAnamnesis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(records: StructuredAnamnesis[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

function mapRow(row: Record<string, unknown>): StructuredAnamnesis {
  const content = (row.content as StructuredAnamnesis) ?? ({} as StructuredAnamnesis);
  return normalizeAnamnesis({
    ...content,
    id: row.id as string,
    client_id: row.client_id as string,
    exam_date: (row.exam_date as string) ?? content.exam_date,
    optometrist: (row.optometrist as string) ?? content.optometrist,
    created_at: (row.created_at as string) ?? new Date().toISOString(),
  });
}

export async function loadAnamnesisRecords(
  clientId?: string,
): Promise<StructuredAnamnesis[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      let query = supabase
        .from("anamnesis_records")
        .select("*")
        .order("exam_date", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (!error && data) {
        const records = data.map(mapRow);
        if (!clientId) saveLocal(records);
        return records;
      }
    }
  }

  const local = loadLocal();
  return clientId ? local.filter((r) => r.client_id === clientId) : local;
}

export async function saveAnamnesisRecord(
  record: StructuredAnamnesis,
): Promise<StructuredAnamnesis> {
  const now = new Date().toISOString();
  const full = normalizeAnamnesis({
    ...record,
    id: record.id || crypto.randomUUID(),
    updated_at: now,
    created_at: record.created_at ?? now,
  });

  const locals = loadLocal();
  const idx = locals.findIndex((r) => r.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("anamnesis_records").upsert({
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        client_id: full.client_id,
        appointment_id: full.appointment_id ?? null,
        exam_date: full.exam_date,
        optometrist: full.optometrist ?? null,
        content: full,
      });
      if (!error) {
        queueAnamnesisSync(full);
        return full;
      }
    }
  }

  queueAnamnesisSync(full);
  return full;
}

export async function deleteAnamnesisRecord(id: string): Promise<void> {
  saveLocal(loadLocal().filter((r) => r.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("anamnesis_records").delete().eq("id", id);
    }
  }
}
