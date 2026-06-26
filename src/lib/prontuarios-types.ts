import type { DocumentFormData } from "./document-form";
import type { DocumentType } from "./acuidade-visual-pro";

export interface StoredClinicalDocument {
  id: string;
  client_id?: string;
  client_name: string;
  document_type: DocumentType;
  exam_date: string;
  optometrist: string;
  acuity_result_od?: string;
  acuity_result_oe?: string;
  notes?: string;
  form_data: DocumentFormData;
  created_at: string;
  synced_at?: string;
}

export interface OpticareBackup {
  version: string;
  app: string;
  exported_at: string;
  documents: StoredClinicalDocument[];
}

export const BACKUP_VERSION = "1.0.0";
export const BACKUP_FILENAME = "opticare-backup.json";
export const BACKUP_ZIP_FILENAME = "opticare-backup.zip";

export function formDataToRecord(
  formData: DocumentFormData,
  id?: string,
): StoredClinicalDocument {
  return {
    id: id ?? crypto.randomUUID(),
    client_id: undefined,
    client_name: formData.patient.name || "Paciente sem nome",
    document_type: formData.document_type,
    exam_date: formData.exam_date,
    optometrist: formData.optometrist,
    acuity_result_od: formData.acuity_od_cc || formData.acuity_od_sc,
    acuity_result_oe: formData.acuity_oe_cc || formData.acuity_oe_sc,
    notes: formData.conclusao || formData.observacoes,
    form_data: formData,
    created_at: new Date().toISOString(),
  };
}

export function recordToFormData(record: StoredClinicalDocument): DocumentFormData {
  return record.form_data;
}
