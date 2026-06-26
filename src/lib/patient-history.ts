import type { Prescription, AcuityExam, Appointment } from "@/lib/types";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import type { StoredClinicalDocument } from "@/lib/prontuarios-types";
import { anamnesisSummary } from "@/lib/anamnesis";
import { formatDate } from "@/lib/utils";

export type PatientHistoryEventType =
  | "anamnesis"
  | "acuity_exam"
  | "prescription"
  | "clinical_document"
  | "appointment";

export interface PatientHistoryEvent {
  id: string;
  type: PatientHistoryEventType;
  date: string;
  title: string;
  summary: string;
  href?: string;
}

const TYPE_LABELS: Record<PatientHistoryEventType, string> = {
  anamnesis: "Anamnese",
  acuity_exam: "Teste de acuidade",
  prescription: "Receita oftálmica",
  clinical_document: "Prontuário",
  appointment: "Consulta",
};

export function historyTypeLabel(type: PatientHistoryEventType): string {
  return TYPE_LABELS[type];
}

export function buildPatientHistory(input: {
  clientId: string;
  anamnesis?: StructuredAnamnesis[];
  acuityExams?: AcuityExam[];
  prescriptions?: Prescription[];
  documents?: StoredClinicalDocument[];
  appointments?: Appointment[];
}): PatientHistoryEvent[] {
  const events: PatientHistoryEvent[] = [];

  for (const a of input.anamnesis ?? []) {
    if (a.client_id !== input.clientId) continue;
    events.push({
      id: a.id,
      type: "anamnesis",
      date: a.exam_date,
      title: "Anamnese estruturada",
      summary: anamnesisSummary(a),
      href: `/anamnese?client_id=${input.clientId}`,
    });
  }

  for (const e of input.acuityExams ?? []) {
    if (e.client_id !== input.clientId) continue;
    events.push({
      id: e.id,
      type: "acuity_exam",
      date: e.performed_at.slice(0, 10),
      title: `${e.test_type} — ${e.eye}`,
      summary: [
        e.result_acuity && `Acuidade: ${e.result_acuity}`,
        e.result_logmar && `logMAR ${e.result_logmar}`,
        `${e.distance_meters}m`,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/acuidade-visual?client_id=${input.clientId}`,
    });
  }

  for (const rx of input.prescriptions ?? []) {
    if (rx.client_id !== input.clientId) continue;
    events.push({
      id: rx.id,
      type: "prescription",
      date: rx.exam_date,
      title: "Receita oftálmica",
      summary: `OD ${rx.od_esf ?? "—"} | OE ${rx.oe_esf ?? "—"}`,
    });
  }

  for (const doc of input.documents ?? []) {
    if (doc.client_id && doc.client_id !== input.clientId) continue;
    if (!doc.client_id && doc.client_name) {
      // skip unlinked docs without client_id
    }
    if (doc.client_id === input.clientId) {
      events.push({
        id: doc.id,
        type: "clinical_document",
        date: doc.exam_date,
        title: doc.document_type.replace(/_/g, " "),
        summary: doc.notes ?? doc.optometrist,
        href: "/acuidade-visual",
      });
    }
  }

  for (const ap of input.appointments ?? []) {
    if (ap.client_id !== input.clientId) continue;
    events.push({
      id: ap.id,
      type: "appointment",
      date: ap.scheduled_at.slice(0, 10),
      title: ap.appointment_type ?? "Consulta",
      summary: `${ap.professional_name ?? "—"} · ${ap.status}`,
      href: "/clinica",
    });
  }

  return events.sort((a, b) => b.date.localeCompare(a.date));
}

export function formatHistoryDate(date: string): string {
  return formatDate(date);
}
