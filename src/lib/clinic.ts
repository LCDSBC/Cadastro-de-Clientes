import type { Appointment } from "@/lib/types";

export type { Appointment };

export const DEMO_PROFESSIONALS = [
  { id: "u1", name: "Dr. Ricardo Alves", role: "optometrista" },
  { id: "u2", name: "Dra. Fernanda Costa", role: "optometrista" },
  { id: "u3", name: "Dr. Paulo Mendes", role: "médico" },
];

export const APPOINTMENT_TYPES = [
  { value: "Consulta optométrica", label: "Consulta optométrica" },
  { value: "Exame de acuidade visual", label: "Exame de acuidade visual" },
  { value: "Adaptação de lente de contato", label: "Adaptação de lente de contato" },
  { value: "Retorno", label: "Retorno" },
  { value: "Avaliação pré-operatória", label: "Avaliação pré-operatória" },
];

export const APPOINTMENT_STATUS_LABELS: Record<Appointment["status"], string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

export const APPOINTMENT_STATUS_VARIANT: Record<
  Appointment["status"],
  "info" | "success" | "warning" | "danger" | "default"
> = {
  agendado: "info",
  confirmado: "default",
  realizado: "success",
  cancelado: "danger",
};

export const APPOINTMENT_STATUS_FLOW: Appointment["status"][] = [
  "agendado",
  "confirmado",
  "realizado",
];

export const DURATION_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1h 30min" },
];

export function isSameDay(dateA: string, dateB: string): boolean {
  return dateA.slice(0, 10) === dateB.slice(0, 10);
}

export function isToday(scheduledAt: string): boolean {
  return isSameDay(scheduledAt, new Date().toISOString());
}

export function encodeAppointmentNotes(
  appointmentType?: string,
  notes?: string,
): string | undefined {
  const parts = [
    appointmentType ? `Tipo: ${appointmentType}` : "",
    notes?.trim() ?? "",
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : undefined;
}

export function decodeAppointmentNotes(raw?: string): {
  appointment_type?: string;
  notes?: string;
} {
  if (!raw) return {};
  const lines = raw.split("\n");
  if (lines[0]?.startsWith("Tipo: ")) {
    return {
      appointment_type: lines[0].replace("Tipo: ", ""),
      notes: lines.slice(1).join("\n").trim() || undefined,
    };
  }
  return { notes: raw };
}
