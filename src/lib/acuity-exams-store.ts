"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { AcuityExam } from "@/lib/types";

const LOCAL_KEY = "opticare_acuity_exams";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapRow(row: Record<string, unknown>): AcuityExam {
  return {
    id: row.id as string,
    client_id: (row.client_id as string) ?? undefined,
    client_name: (row.client_name as string) ?? undefined,
    appointment_id: (row.appointment_id as string) ?? undefined,
    test_type: row.test_type as string,
    distance_meters: Number(row.distance_meters),
    eye: row.eye as AcuityExam["eye"],
    result_acuity: (row.result_acuity as string) ?? undefined,
    result_logmar: (row.result_logmar as string) ?? undefined,
    chart_row: row.chart_row != null ? Number(row.chart_row) : undefined,
    notes: (row.notes as string) ?? undefined,
    performed_by: (row.performed_by as string) ?? undefined,
    performed_at: row.performed_at as string,
  };
}

function loadLocal(): AcuityExam[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(exams: AcuityExam[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(exams));
}

export async function loadAcuityExams(
  clientId?: string,
): Promise<AcuityExam[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      let query = supabase
        .from("acuity_exams")
        .select("*")
        .order("performed_at", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (!error && data) {
        const exams = data.map(mapRow);
        if (!clientId) saveLocal(exams);
        return exams;
      }
    }
  }

  const local = loadLocal();
  return clientId ? local.filter((e) => e.client_id === clientId) : local;
}

export async function saveAcuityExam(
  exam: Omit<AcuityExam, "id" | "performed_at"> & {
    id?: string;
    performed_at?: string;
  },
): Promise<AcuityExam> {
  const full: AcuityExam = {
    ...exam,
    id: exam.id ?? crypto.randomUUID(),
    performed_at: exam.performed_at ?? new Date().toISOString(),
  };

  const locals = loadLocal();
  const idx = locals.findIndex((e) => e.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("acuity_exams").upsert({
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        client_id: full.client_id ?? null,
        appointment_id: full.appointment_id ?? null,
        test_type: full.test_type,
        distance_meters: full.distance_meters,
        eye: full.eye,
        result_acuity: full.result_acuity ?? null,
        result_logmar: full.result_logmar ?? null,
        notes: full.notes ?? null,
        performed_by: full.performed_by ?? null,
        performed_at: full.performed_at,
      });
      if (!error) return full;
    }
  }

  return full;
}

export async function deleteAcuityExam(id: string): Promise<void> {
  saveLocal(loadLocal().filter((e) => e.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("acuity_exams").delete().eq("id", id);
    }
  }
}
