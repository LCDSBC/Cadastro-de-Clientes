"use client";

import JSZip from "jszip";
import type { Client } from "@/lib/types";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import type { StoredClinicalDocument } from "./prontuarios-types";
import {
  buildClientPdfFilename,
  documentTypeToFolderKind,
  isClientFolderLinked,
  isFileSystemAccessSupported,
  syncPdfToClientFolders,
  type ClientFolderDocumentKind,
} from "./client-folder-storage";

export interface ClientPdfItem {
  filename: string;
  clientName: string;
  label: string;
  generate: () => Promise<Blob | null>;
}

export interface ClientExportProgress {
  phase: "preparing" | "generating" | "saving";
  clientName: string;
  current: number;
  total: number;
  label?: string;
}

export interface ClientExportResult {
  success: boolean;
  total: number;
  saved: number;
  failed: number;
  local: boolean;
  pendrive: boolean;
  downloadedZip: boolean;
  message: string;
}

export interface RetroactiveSyncProgress extends ClientExportProgress {
  clientIndex: number;
  clientCount: number;
}

export interface RetroactiveSyncResult {
  success: boolean;
  clientsProcessed: number;
  totalPdfs: number;
  savedPdfs: number;
  failedPdfs: number;
  message: string;
}

async function getStoreSettings() {
  const { loadStoreSettings } = await import("./settings-store");
  const { store } = await loadStoreSettings();
  return store;
}

async function getPdfRenderers() {
  return import("./client-pdf-export");
}

async function getClients() {
  const { loadClients } = await import("./clients-store");
  return loadClients();
}

async function getAnamnesisRecords(clientId: string) {
  const { loadAnamnesisRecords } = await import("./anamnesis-store");
  return loadAnamnesisRecords(clientId);
}

async function getAcuityExams(clientId: string) {
  const { loadAcuityExams } = await import("./acuity-exams-store");
  return loadAcuityExams(clientId);
}

async function getDocuments() {
  const { loadDocuments } = await import("./prontuarios-store");
  return loadDocuments();
}

async function pushPdf(
  clientName: string,
  kind: ClientFolderDocumentKind,
  pdfBlob: Blob,
  date?: string,
  uniqueSuffix?: string,
  force = false,
): Promise<{ local: boolean; pendrive: boolean }> {
  return syncPdfToClientFolders({
    clientName,
    filename: buildClientPdfFilename(kind, date, uniqueSuffix),
    pdfBlob,
    force,
  });
}

export function queueClientRegistrationSync(client: Client): void {
  void (async () => {
    const [store, pdf] = await Promise.all([getStoreSettings(), getPdfRenderers()]);
    const blob = await pdf.renderClientRegistrationPdf(client, store);
    if (!blob) return;
    await pushPdf(client.name, "ficha-cadastro", blob, client.updated_at.slice(0, 10));
  })();
}

export function queueAnamnesisSync(
  record: StructuredAnamnesis,
  client?: Client | null,
): void {
  void (async () => {
    const [store, pdf] = await Promise.all([getStoreSettings(), getPdfRenderers()]);
    let resolvedClient = client;
    if (!resolvedClient && record.client_id) {
      const { clients } = await getClients();
      resolvedClient = clients.find((c) => c.id === record.client_id) ?? null;
    }
    const clientName = resolvedClient?.name ?? record.client_name ?? "Cliente";
    const blob = await pdf.renderAnamnesisPdf(record, resolvedClient, store);
    if (!blob) return;
    await pushPdf(clientName, "anamnese", blob, record.exam_date);
  })();
}

export function queueClinicalDocumentSync(doc: StoredClinicalDocument): void {
  void (async () => {
    const kind = documentTypeToFolderKind(doc.document_type);
    if (!kind) return;
    const pdf = await getPdfRenderers();
    const blob = await pdf.renderClinicalDocumentPdf(doc);
    if (!blob) return;
    await pushPdf(doc.client_name, kind, blob, doc.exam_date);
  })();
}

export function queueAcuityResultsSync(
  clientId: string | undefined,
  clientName: string,
): void {
  void (async () => {
    if (!clientId && !clientName) return;
    const [store, pdf, exams] = await Promise.all([
      getStoreSettings(),
      getPdfRenderers(),
      getAcuityExams(clientId ?? ""),
    ]);
    const filtered = clientId
      ? exams.filter((e) => e.client_id === clientId)
      : exams.filter((e) => e.client_name === clientName);
    if (!filtered.length) return;

    const name = clientName || filtered[0]?.client_name || "Cliente";
    const blob = await pdf.renderAcuityResultsPdf(name, filtered, store);
    if (!blob) return;

    const latestDate = filtered
      .map((e) => e.performed_at.slice(0, 10))
      .sort()
      .reverse()[0];

    await pushPdf(name, "resultados-acuidade", blob, latestDate);
  })();
}

export function queueAcuityExamSync(exam: import("@/lib/types").AcuityExam): void {
  queueAcuityResultsSync(exam.client_id, exam.client_name ?? "");
}

function filterClientDocuments(
  documents: StoredClinicalDocument[],
  client: Client,
): StoredClinicalDocument[] {
  return documents.filter(
    (d) =>
      d.client_id === client.id ||
      d.client_name.toLowerCase() === client.name.toLowerCase(),
  );
}

export async function collectClientPdfItems(client: Client): Promise<ClientPdfItem[]> {
  const [store, pdf, anamnesis, acuityExams, { documents }] = await Promise.all([
    getStoreSettings(),
    getPdfRenderers(),
    getAnamnesisRecords(client.id),
    getAcuityExams(client.id),
    getDocuments(),
  ]);

  const clientDocs = filterClientDocuments(documents, client);
  const items: ClientPdfItem[] = [];

  items.push({
    filename: buildClientPdfFilename("ficha-cadastro", client.updated_at.slice(0, 10)),
    clientName: client.name,
    label: "Ficha de cadastro",
    generate: () => pdf.renderClientRegistrationPdf(client, store),
  });

  for (const record of anamnesis) {
    const suffix = anamnesis.length > 1 ? record.id.slice(0, 8) : undefined;
    items.push({
      filename: buildClientPdfFilename("anamnese", record.exam_date, suffix),
      clientName: client.name,
      label: `Anamnese (${record.exam_date})`,
      generate: () => pdf.renderAnamnesisPdf(record, client, store),
    });
  }

  for (const doc of clientDocs) {
    const kind = documentTypeToFolderKind(doc.document_type);
    if (!kind) continue;
    const sameKindCount = clientDocs.filter(
      (d) => documentTypeToFolderKind(d.document_type) === kind,
    ).length;
    const suffix = sameKindCount > 1 ? doc.id.slice(0, 8) : undefined;
    items.push({
      filename: buildClientPdfFilename(kind, doc.exam_date, suffix),
      clientName: client.name,
      label: `${kind} (${doc.exam_date})`,
      generate: () => pdf.renderClinicalDocumentPdf(doc),
    });
  }

  if (acuityExams.length > 0) {
    const latestDate = acuityExams
      .map((e) => e.performed_at.slice(0, 10))
      .sort()
      .reverse()[0];
    items.push({
      filename: buildClientPdfFilename("resultados-acuidade", latestDate),
      clientName: client.name,
      label: "Resultados de acuidade visual",
      generate: () => pdf.renderAcuityResultsPdf(client.name, acuityExams, store),
    });
  }

  return items;
}

async function downloadClientZip(
  client: Client,
  files: Array<{ filename: string; blob: Blob }>,
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(client.name.replace(/[<>:"/\\|?*]/g, "").slice(0, 80) || "Cliente");
  if (!folder) return;

  for (const file of files) {
    folder.file(file.filename, file.blob);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${client.name.replace(/\s+/g, "-").toLowerCase()}-documentos-${new Date().toISOString().split("T")[0]}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportAllClientPdfs(
  client: Client,
  onProgress?: (progress: ClientExportProgress) => void,
): Promise<ClientExportResult> {
  const items = await collectClientPdfItems(client);

  if (items.length === 0) {
    return {
      success: false,
      total: 0,
      saved: 0,
      failed: 0,
      local: false,
      pendrive: false,
      downloadedZip: false,
      message: "Nenhum documento encontrado para este cliente.",
    };
  }

  const foldersLinked = isClientFolderLinked();
  const generated: Array<{ filename: string; blob: Blob; clientName: string }> = [];
  let failed = 0;
  let local = false;
  let pendrive = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.({
      phase: "generating",
      clientName: client.name,
      current: i + 1,
      total: items.length,
      label: item.label,
    });

    const blob = await item.generate();
    if (!blob) {
      failed++;
      continue;
    }
    generated.push({ filename: item.filename, blob, clientName: item.clientName });
  }

  if (foldersLinked) {
    for (let i = 0; i < generated.length; i++) {
      const file = generated[i];
      onProgress?.({
        phase: "saving",
        clientName: client.name,
        current: i + 1,
        total: generated.length,
        label: file.filename,
      });

      const result = await syncPdfToClientFolders({
        clientName: file.clientName,
        filename: file.filename,
        pdfBlob: file.blob,
        force: true,
      });
      if (result.local) local = true;
      if (result.pendrive) pendrive = true;
    }
  }

  let downloadedZip = false;
  if (!foldersLinked && generated.length > 0) {
    await downloadClientZip(
      client,
      generated.map((g) => ({ filename: g.filename, blob: g.blob })),
    );
    downloadedZip = true;
  }

  const saved = generated.length;
  const total = items.length;

  let message: string;
  if (saved === 0) {
    message = "Não foi possível gerar os PDFs.";
  } else if (downloadedZip) {
    message = `${saved} PDF(s) baixados em ZIP. Configure pastas em Configurações → Arquivos para gravação automática.`;
  } else if (local && pendrive) {
    message = `${saved} PDF(s) salvos no computador e no pendrive.`;
  } else if (local) {
    message = `${saved} PDF(s) salvos no computador.`;
  } else if (pendrive) {
    message = `${saved} PDF(s) salvos no pendrive.`;
  } else {
    message = `${saved} PDF(s) gerados, mas as pastas não estão acessíveis. Verifique as permissões em Configurações → Arquivos.`;
  }

  if (failed > 0) {
    message += ` ${failed} arquivo(s) falharam.`;
  }

  return {
    success: saved > 0,
    total,
    saved,
    failed,
    local,
    pendrive,
    downloadedZip,
    message,
  };
}

export async function syncAllClientsRetroactively(
  onProgress?: (progress: RetroactiveSyncProgress) => void,
): Promise<RetroactiveSyncResult> {
  if (!isClientFolderLinked()) {
    return {
      success: false,
      clientsProcessed: 0,
      totalPdfs: 0,
      savedPdfs: 0,
      failedPdfs: 0,
      message: "Configure a pasta do computador ou pendrive em Configurações → Arquivos antes de sincronizar.",
    };
  }

  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      clientsProcessed: 0,
      totalPdfs: 0,
      savedPdfs: 0,
      failedPdfs: 0,
      message: "Sincronização em pastas requer Chrome ou Edge no computador.",
    };
  }

  const { clients } = await getClients();
  let totalPdfs = 0;
  let savedPdfs = 0;
  let failedPdfs = 0;

  for (let c = 0; c < clients.length; c++) {
    const client = clients[c];
    onProgress?.({
      phase: "preparing",
      clientName: client.name,
      clientIndex: c + 1,
      clientCount: clients.length,
      current: 0,
      total: 0,
    });

    const result = await exportAllClientPdfs(client, (p) => {
      onProgress?.({
        ...p,
        clientIndex: c + 1,
        clientCount: clients.length,
      });
    });

    totalPdfs += result.total;
    savedPdfs += result.saved;
    failedPdfs += result.failed;
  }

  return {
    success: savedPdfs > 0,
    clientsProcessed: clients.length,
    totalPdfs,
    savedPdfs,
    failedPdfs,
    message:
      clients.length === 0
        ? "Nenhum cliente cadastrado."
        : `Sincronização concluída: ${clients.length} cliente(s), ${savedPdfs} PDF(s) gravado(s).` +
          (failedPdfs > 0 ? ` ${failedPdfs} falha(s).` : ""),
  };
}
