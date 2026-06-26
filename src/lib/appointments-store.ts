"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import {
  decodeAppointmentNotes,
  encodeAppointmentNotes,
  DEMO_PROFESSIONALS,
  isToday,
} from "@/lib/clinic";
import type { Appointment, ClinicSummary } from "@/lib/types";
import { demoAppointments } from "@/lib/types";

const LOCAL_KEY = "opticare_appointments";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapAppointment(
  row: Record<string, unknown>,
  clientName?: string,
  professionalName?: string,
): Appointment {
  const decoded = decodeAppointmentNotes(row.notes as string | undefined);
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    client_name: clientName ?? "Paciente",
    professional_id: (row.professional_id as string) ?? undefined,
    professional_name: professionalName,
    appointment_type: decoded.appointment_type,
    scheduled_at: row.scheduled_at as string,
    duration_minutes: Number(row.duration_minutes ?? 30),
    status: row.status as Appointment["status"],
    notes: decoded.notes,
    created_at: row.created_at as string,
  };
}

function loadLocal(): Appointment[] {
  if (typeof window === "undefined") return demoAppointments;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : demoAppointments;
  } catch {
    return demoAppointments;
  }
}

function saveLocal(appointments: Appointment[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(appointments));
}

function resolveProfessionalName(professionalId?: string): string | undefined {
  return DEMO_PROFESSIONALS.find((p) => p.id === professionalId)?.name;
}

export function calcClinicSummary(appointments: Appointment[]): ClinicSummary {
  return {
    hoje: appointments.filter(
      (a) => isToday(a.scheduled_at) && a.status !== "cancelado",
    ).length,
    agendados: appointments.filter((a) => a.status === "agendado").length,
    confirmados: appointments.filter((a) => a.status === "confirmado").length,
    realizados: appointments.filter((a) => a.status === "realizado").length,
    cancelados: appointments.filter((a) => a.status === "cancelado").length,
  };
}

export async function loadAppointments(): Promise<{
  appointments: Appointment[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients(name), users(name)")
        .order("scheduled_at", { ascending: true });

      if (!error && data) {
        const appointments = data.map((row) => {
          const clientData = row.clients as { name: string } | null;
          const userData = row.users as { name: string } | null;
          return mapAppointment(
            row,
            clientData?.name,
            userData?.name ??
              resolveProfessionalName(row.professional_id as string),
          );
        });
        saveLocal(appointments);
        return { appointments, source: "supabase" };
      }
    }
  }
  return { appointments: loadLocal(), source: "local" };
}

export async function saveAppointment(
  appointment: Omit<Appointment, "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<{ appointment: Appointment; source: "supabase" | "local" }> {
  const full: Appointment = {
    ...appointment,
    id: appointment.id ?? crypto.randomUUID(),
    professional_name:
      appointment.professional_name ??
      resolveProfessionalName(appointment.professional_id),
    created_at: appointment.created_at ?? new Date().toISOString(),
  };

  const locals = loadLocal();
  const idx = locals.findIndex((a) => a.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.push(full);
  updated.sort(
    (a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        client_id: full.client_id,
        professional_id: full.professional_id ?? null,
        scheduled_at: full.scheduled_at,
        duration_minutes: full.duration_minutes,
        status: full.status,
        notes: encodeAppointmentNotes(full.appointment_type, full.notes) ?? null,
      };
      const { error } = await supabase.from("appointments").upsert(row);
      if (!error) return { appointment: full, source: "supabase" };
    }
  }
  return { appointment: full, source: "local" };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment["status"],
): Promise<Appointment | null> {
  const locals = loadLocal();
  const appointment = locals.find((a) => a.id === appointmentId);
  if (!appointment) return null;

  const updated = { ...appointment, status };
  const { appointment: saved } = await saveAppointment(updated);
  return saved;
}

export async function deleteAppointment(id: string): Promise<void> {
  saveLocal(loadLocal().filter((a) => a.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("appointments").delete().eq("id", id);
    }
  }
}
