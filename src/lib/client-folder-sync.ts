"use client";

import type { Client } from "@/lib/types";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import type { AcuityExam } from "@/lib/types";
import type { StoredClinicalDocument } from "./prontuarios-types";
import { loadStoreSettings } from "./settings-store";
import { loadClients } from "./clients-store";
import { loadAcuityExams } from "./acuity-exams-store";
import {
  buildClientPdfFilename,
  documentTypeToFolderKind,
  syncPdfToClientFolders,
  type ClientFolderDocumentKind,
} from "./client-folder-storage";
import {
  renderAcuityResultsPdf,
  renderAnamnesisPdf,
  renderClientRegistrationPdf,
  renderClinicalDocumentPdf,
} from "./client-pdf-export";

async function getStore() {
  const { store } = await loadStoreSettings();
  return store;
}

async function pushPdf(
  clientName: string,
  kind: ClientFolderDocumentKind,
  pdfBlob: Blob,
  date?: string,
): Promise<void> {
  await syncPdfToClientFolders({
    clientName,
    filename: buildClientPdfFilename(kind, date),
    pdfBlob,
  });
}

export function queueClientRegistrationSync(client: Client): void {
  void (async () => {
    const store = await getStore();
    const pdf = await renderClientRegistrationPdf(client, store);
    if (!pdf) return;
    await pushPdf(client.name, "ficha-cadastro", pdf, client.updated_at.slice(0, 10));
  })();
}

export function queueAnamnesisSync(
  record: StructuredAnamnesis,
  client?: Client | null,
): void {
  void (async () => {
    const store = await getStore();
    let resolvedClient = client;
    if (!resolvedClient && record.client_id) {
      const { clients } = await loadClients();
      resolvedClient = clients.find((c) => c.id === record.client_id) ?? null;
    }
    const clientName = resolvedClient?.name ?? record.client_name ?? "Cliente";
    const pdf = await renderAnamnesisPdf(record, resolvedClient, store);
    if (!pdf) return;
    await pushPdf(clientName, "anamnese", pdf, record.exam_date);
  })();
}

export function queueClinicalDocumentSync(doc: StoredClinicalDocument): void {
  void (async () => {
    const kind = documentTypeToFolderKind(doc.document_type);
    if (!kind) return;
    const pdf = await renderClinicalDocumentPdf(doc);
    if (!pdf) return;
    await pushPdf(doc.client_name, kind, pdf, doc.exam_date);
  })();
}

export function queueAcuityResultsSync(
  clientId: string | undefined,
  clientName: string,
): void {
  void (async () => {
    if (!clientId && !clientName) return;
    const store = await getStore();
    const exams = await loadAcuityExams(clientId);
    const filtered = clientId
      ? exams.filter((e) => e.client_id === clientId)
      : exams.filter((e) => e.client_name === clientName);
    if (!filtered.length) return;

    const name =
      clientName ||
      filtered[0]?.client_name ||
      "Cliente";

    const pdf = await renderAcuityResultsPdf(name, filtered, store);
    if (!pdf) return;

    const latestDate = filtered
      .map((e) => e.performed_at.slice(0, 10))
      .sort()
      .reverse()[0];

    await pushPdf(name, "resultados-acuidade", pdf, latestDate);
  })();
}

export function queueAcuityExamSync(exam: AcuityExam): void {
  queueAcuityResultsSync(exam.client_id, exam.client_name ?? "");
}
