"use client";

import JSZip from "jszip";
import type { OpticareBackup, StoredClinicalDocument } from "./prontuarios-types";
import {
  BACKUP_FILENAME,
  BACKUP_VERSION,
  BACKUP_ZIP_FILENAME,
} from "./prontuarios-types";
import { getDocumentTitle } from "@/components/prontuarios/document-preview";
import { createRoot } from "react-dom/client";
import { DocumentPreview } from "@/components/prontuarios/document-preview";
import { createElement } from "react";

function createBackupPayload(documents: StoredClinicalDocument[]): OpticareBackup {
  return {
    version: BACKUP_VERSION,
    app: "OptiCare ERP — Acuidade Visual Pró",
    exported_at: new Date().toISOString(),
    documents,
  };
}

export function downloadJsonBackup(documents: StoredClinicalDocument[]): void {
  const payload = createBackupPayload(documents);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = BACKUP_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}

async function renderDocumentToPdfBlob(
  doc: StoredClinicalDocument,
): Promise<Blob | null> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  document.body.appendChild(container);

  const printArea = document.createElement("div");
  printArea.id = "temp-pdf-export";
  container.appendChild(printArea);

  const root = createRoot(printArea);
  root.render(createElement(DocumentPreview, { data: doc.form_data }));

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(printArea.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

    root.unmount();
    document.body.removeChild(container);
    return pdf.output("blob");
  } catch {
    root.unmount();
    document.body.removeChild(container);
    return null;
  }
}

export async function downloadZipBackup(
  documents: StoredClinicalDocument[],
): Promise<void> {
  const zip = new JSZip();
  const payload = createBackupPayload(documents);

  zip.file(BACKUP_FILENAME, JSON.stringify(payload, null, 2));
  zip.file(
    "LEIA-ME.txt",
    [
      "OptiCare ERP — Backup Acuidade Visual Pró",
      "========================================",
      "",
      "Este backup contém todos os prontuários da sua ótica.",
      "",
      "Para restaurar:",
      "1. Abra o OptiCare ERP",
      "2. Vá em Acuidade Visual Pró → Prontuários → Backup",
      "3. Clique em 'Restaurar do pendrive' e selecione opticare-backup.json",
      "",
      `Exportado em: ${payload.exported_at}`,
      `Total de documentos: ${documents.length}`,
    ].join("\n"),
  );

  const pdfFolder = zip.folder("documentos-pdf");
  for (const doc of documents) {
    const pdfBlob = await renderDocumentToPdfBlob(doc);
    if (pdfBlob && pdfFolder) {
      const name = `${doc.exam_date}_${getDocumentTitle(doc.document_type).replace(/\s+/g, "-")}_${doc.client_name.replace(/\s+/g, "-")}.pdf`;
      pdfFolder.file(name, pdfBlob);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = BACKUP_ZIP_FILENAME.replace(".zip", `-${new Date().toISOString().split("T")[0]}.zip`);
  link.click();
  URL.revokeObjectURL(url);
}

type DirectoryHandle = FileSystemDirectoryHandle;

async function writeFileToDirectory(
  dirHandle: DirectoryHandle,
  filename: string,
  content: Blob | string,
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function saveBackupToPendrive(
  documents: StoredClinicalDocument[],
): Promise<{ success: boolean; message: string }> {
  if (!isFileSystemAccessSupported()) {
    await downloadZipBackup(documents);
    return {
      success: true,
      message:
        "Seu navegador não suporta gravação direta em pendrive. O backup ZIP foi baixado — copie para o pendrive.",
    };
  }

  try {
    const dirHandle = await (
      window as unknown as { showDirectoryPicker: () => Promise<DirectoryHandle> }
    ).showDirectoryPicker();

    const payload = createBackupPayload(documents);
    await writeFileToDirectory(
      dirHandle,
      BACKUP_FILENAME,
      JSON.stringify(payload, null, 2),
    );

    const readme = [
      "OptiCare ERP — Backup",
      `Exportado: ${payload.exported_at}`,
      `Documentos: ${documents.length}`,
      "",
      "Selecione opticare-backup.json no sistema para restaurar.",
    ].join("\n");
    await writeFileToDirectory(dirHandle, "LEIA-ME.txt", readme);

    let pdfDir: DirectoryHandle;
    try {
      pdfDir = await dirHandle.getDirectoryHandle("documentos-pdf", { create: true });
    } catch {
      pdfDir = dirHandle;
    }

    for (const doc of documents) {
      const pdfBlob = await renderDocumentToPdfBlob(doc);
      if (pdfBlob) {
        const name = `${doc.exam_date}_${doc.document_type}_${doc.client_name.replace(/\s+/g, "-")}.pdf`;
        await writeFileToDirectory(pdfDir, name, pdfBlob);
      }
    }

    return {
      success: true,
      message: `Backup salvo com sucesso! ${documents.length} documento(s) gravado(s) na pasta selecionada.`,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, message: "Operação cancelada." };
    }
    return {
      success: false,
      message: `Erro ao gravar no pendrive: ${error instanceof Error ? error.message : "erro desconhecido"}`,
    };
  }
}

export async function restoreBackupFromFile(
  file: File,
): Promise<{ success: boolean; documents: StoredClinicalDocument[]; message: string }> {
  try {
    let text: string;

    if (file.name.endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file);
      const jsonFile = zip.file(BACKUP_FILENAME);
      if (!jsonFile) {
        return {
          success: false,
          documents: [],
          message: "Arquivo ZIP inválido: opticare-backup.json não encontrado.",
        };
      }
      text = await jsonFile.async("string");
    } else {
      text = await file.text();
    }

    const payload = JSON.parse(text) as OpticareBackup;

    if (!payload.documents || !Array.isArray(payload.documents)) {
      return {
        success: false,
        documents: [],
        message: "Formato de backup inválido.",
      };
    }

    return {
      success: true,
      documents: payload.documents,
      message: `${payload.documents.length} documento(s) restaurado(s) com sucesso.`,
    };
  } catch {
    return {
      success: false,
      documents: [],
      message: "Não foi possível ler o arquivo de backup.",
    };
  }
}

export async function downloadDocumentPdf(
  doc: StoredClinicalDocument,
): Promise<void> {
  const blob = await renderDocumentToPdfBlob(doc);
  if (!blob) throw new Error("Falha ao gerar PDF");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${doc.exam_date}_${doc.document_type}_${doc.client_name.replace(/\s+/g, "-")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
