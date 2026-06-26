"use client";

import { createClient } from "@/lib/supabase/client";
import type { StoredClinicalDocument } from "./prontuarios-types";
import { demoClinicalRecords } from "./acuidade-visual-pro";
import { createDefaultFormData } from "./document-form";
import { formDataToRecord } from "./prontuarios-types";

const LOCAL_STORAGE_KEY = "opticare_clinical_documents";

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function ensureUuid(id: string): string {
  return isValidUuid(id) ? id : crypto.randomUUID();
}

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function loadFromLocalStorage(): StoredClinicalDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return migrateDemoRecords();
    const parsed = JSON.parse(raw) as StoredClinicalDocument[];
    return Array.isArray(parsed) ? parsed : migrateDemoRecords();
  } catch {
    return migrateDemoRecords();
  }
}

function migrateDemoRecords(): StoredClinicalDocument[] {
  return demoClinicalRecords.map((record) => {
    const formData = createDefaultFormData(record.document_type);
    formData.patient.name = record.client_name;
    formData.exam_date = record.exam_date;
    formData.optometrist = record.optometrist;
    formData.acuity_od_cc = record.acuity_result_od ?? "";
    formData.acuity_oe_cc = record.acuity_result_oe ?? "";
    formData.conclusao = record.notes ?? "";
    return formDataToRecord(formData, record.id);
  });
}

function saveToLocalStorage(documents: StoredClinicalDocument[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(documents));
}

function mapFromSupabase(row: Record<string, unknown>): StoredClinicalDocument {
  const content = (row.content as StoredClinicalDocument["form_data"]) ?? createDefaultFormData(
    row.document_type as StoredClinicalDocument["document_type"],
  );
  return {
    id: row.id as string,
    client_id: row.client_id as string | undefined,
    client_name: content.patient?.name ?? "Paciente",
    document_type: row.document_type as StoredClinicalDocument["document_type"],
    exam_date: row.exam_date as string,
    optometrist: (row.optometrist as string) ?? "",
    acuity_result_od: row.acuity_result_od as string | undefined,
    acuity_result_oe: row.acuity_result_oe as string | undefined,
    notes: content.conclusao || content.observacoes,
    form_data: content,
    created_at: row.created_at as string,
    synced_at: row.created_at as string,
  };
}

export async function loadDocuments(): Promise<{
  documents: StoredClinicalDocument[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("clinical_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const documents = data.map(mapFromSupabase);
        saveToLocalStorage(documents);
        return { documents, source: "supabase" };
      }
    }
  }

  return { documents: loadFromLocalStorage(), source: "local" };
}

export async function saveDocument(
  document: StoredClinicalDocument,
): Promise<{ success: boolean; document: StoredClinicalDocument; source: "supabase" | "local" }> {
  const normalized = { ...document, id: ensureUuid(document.id) };
  const localDocs = loadFromLocalStorage();
  const existing = localDocs.findIndex((d) => d.id === normalized.id);
  const updated = [...localDocs];
  if (existing >= 0) {
    updated[existing] = normalized;
  } else {
    updated.unshift(normalized);
  }
  saveToLocalStorage(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: normalized.id,
        document_type: normalized.document_type,
        exam_date: normalized.exam_date,
        optometrist: normalized.optometrist,
        acuity_result_od: normalized.acuity_result_od,
        acuity_result_oe: normalized.acuity_result_oe,
        content: normalized.form_data,
        client_id: normalized.client_id ?? null,
      };

      const { error } = await supabase.from("clinical_documents").upsert(row);

      if (!error) {
        return {
          success: true,
          document: { ...normalized, synced_at: new Date().toISOString() },
          source: "supabase",
        };
      }
    }
  }

  return { success: true, document: normalized, source: "local" };
}

export async function deleteDocument(id: string): Promise<void> {
  const localDocs = loadFromLocalStorage().filter((d) => d.id !== id);
  saveToLocalStorage(localDocs);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("clinical_documents").delete().eq("id", id);
    }
  }
}

export async function restoreDocuments(
  documents: StoredClinicalDocument[],
): Promise<{ count: number; source: "supabase" | "local" }> {
  const normalized = documents.map((d) => ({ ...d, id: ensureUuid(d.id) }));
  saveToLocalStorage(normalized);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const rows = normalized.map((doc) => ({
        id: doc.id,
        document_type: doc.document_type,
        exam_date: doc.exam_date,
        optometrist: doc.optometrist,
        acuity_result_od: doc.acuity_result_od,
        acuity_result_oe: doc.acuity_result_oe,
        content: doc.form_data,
        client_id: doc.client_id ?? null,
      }));

      const { error } = await supabase.from("clinical_documents").upsert(rows);
      if (!error) {
        return { count: normalized.length, source: "supabase" };
      }
    }
  }

  return { count: normalized.length, source: "local" };
}

export function getStorageStatus(): "supabase" | "local" | "offline" {
  if (isSupabaseConfigured()) return "supabase";
  if (typeof window !== "undefined" && localStorage.getItem(LOCAL_STORAGE_KEY)) {
    return "local";
  }
  return "offline";
}
