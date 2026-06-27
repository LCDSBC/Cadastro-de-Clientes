"use client";

import {
  clearDirectoryHandle,
  ensureWritePermission,
  loadDirectoryHandle,
  saveDirectoryHandle,
  type FolderHandleKey,
} from "./fs-handle-store";

export const CLIENT_ROOT_FOLDER = "Cadastro de clientes";

const SETTINGS_KEY = "opticare_client_folder_settings";

export type ClientFolderDocumentKind =
  | "ficha-cadastro"
  | "anamnese"
  | "laudo-optometrico"
  | "laudo-acuidade-visual"
  | "ficha-clinica"
  | "resultados-acuidade";

export interface ClientFolderSettings {
  autoSyncOnSave: boolean;
  localFolderLabel?: string;
  pendriveFolderLabel?: string;
}

const defaultSettings: ClientFolderSettings = {
  autoSyncOnSave: true,
};

export function loadClientFolderSettings(): ClientFolderSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveClientFolderSettings(settings: ClientFolderSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function sanitizeFolderName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  return cleaned || "Cliente";
}

export function buildClientPdfFilename(
  kind: ClientFolderDocumentKind,
  date?: string,
  uniqueSuffix?: string,
): string {
  const d = (date ?? new Date().toISOString().split("T")[0]).slice(0, 10);
  const suffix = uniqueSuffix ? `-${uniqueSuffix}` : "";
  return `${kind}-${d}${suffix}.pdf`;
}

export function documentTypeToFolderKind(
  documentType: string,
): ClientFolderDocumentKind | null {
  switch (documentType) {
    case "receita_oculos":
      return "laudo-optometrico";
    case "laudo_acuidade":
      return "laudo-acuidade-visual";
    case "ficha_clinica":
      return "ficha-clinica";
    default:
      return null;
  }
}

async function writeFileToDirectory(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: Blob | string,
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function getClientDirectory(
  baseHandle: FileSystemDirectoryHandle,
  clientName: string,
): Promise<FileSystemDirectoryHandle> {
  const root = await baseHandle.getDirectoryHandle(CLIENT_ROOT_FOLDER, {
    create: true,
  });
  return root.getDirectoryHandle(sanitizeFolderName(clientName), { create: true });
}

async function writePdfToHandle(
  baseHandle: FileSystemDirectoryHandle,
  clientName: string,
  filename: string,
  pdfBlob: Blob,
): Promise<void> {
  const clientDir = await getClientDirectory(baseHandle, clientName);
  await writeFileToDirectory(clientDir, filename, pdfBlob);
}

export async function pickFolderForStorage(
  key: FolderHandleKey,
): Promise<{ success: boolean; label?: string; message: string }> {
  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      message:
        "Seu navegador não suporta gravação em pastas. Use Chrome ou Edge no computador.",
    };
  }

  try {
    const handle = await (
      window as unknown as {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker();

    const granted = await ensureWritePermission(handle);
    if (!granted) {
      return { success: false, message: "Permissão de escrita negada." };
    }

    await saveDirectoryHandle(key, handle);

    const cadastroDir = await handle.getDirectoryHandle(CLIENT_ROOT_FOLDER, {
      create: true,
    });
    await writeFileToDirectory(
      cadastroDir,
      "LEIA-ME.txt",
      [
        "OptiCare ERP — Cadastro de clientes",
        "===================================",
        "",
        "Cada cliente possui uma pasta com PDFs:",
        "- ficha-cadastro",
        "- anamnese",
        "- laudo-optometrico",
        "- laudo-acuidade-visual",
        "- resultados-acuidade",
        "",
        "Os arquivos são atualizados automaticamente ao salvar no sistema.",
      ].join("\n"),
    );

    const settings = loadClientFolderSettings();
    if (key === "local") {
      settings.localFolderLabel = handle.name;
    } else {
      settings.pendriveFolderLabel = handle.name;
    }
    saveClientFolderSettings(settings);

    const dest =
      key === "local"
        ? "computador"
        : "pendrive";

    return {
      success: true,
      label: handle.name,
      message: `Pasta "${handle.name}" configurada no ${dest}. A pasta "${CLIENT_ROOT_FOLDER}" foi criada.`,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, message: "Seleção cancelada." };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao selecionar pasta.",
    };
  }
}

export async function clearFolderForStorage(
  key: FolderHandleKey,
): Promise<void> {
  await clearDirectoryHandle(key);
  const settings = loadClientFolderSettings();
  if (key === "local") {
    delete settings.localFolderLabel;
  } else {
    delete settings.pendriveFolderLabel;
  }
  saveClientFolderSettings(settings);
}

export function isClientFolderSyncConfigured(): boolean {
  const settings = loadClientFolderSettings();
  return settings.autoSyncOnSave && (!!settings.localFolderLabel || !!settings.pendriveFolderLabel);
}

export function isClientFolderLinked(): boolean {
  const settings = loadClientFolderSettings();
  return !!settings.localFolderLabel || !!settings.pendriveFolderLabel;
}

export async function syncPdfToClientFolders(options: {
  clientName: string;
  filename: string;
  pdfBlob: Blob;
  force?: boolean;
}): Promise<{ local: boolean; pendrive: boolean }> {
  const settings = loadClientFolderSettings();
  if (!options.force && !settings.autoSyncOnSave) {
    return { local: false, pendrive: false };
  }

  let local = false;
  let pendrive = false;

  const targets: Array<{ key: FolderHandleKey; enabled: boolean }> = [
    { key: "local", enabled: !!settings.localFolderLabel },
    { key: "pendrive", enabled: !!settings.pendriveFolderLabel },
  ];

  for (const { key, enabled } of targets) {
    if (!enabled) continue;

    const handle = await loadDirectoryHandle(key);
    if (!handle) continue;

    const granted = await ensureWritePermission(handle);
    if (!granted) continue;

    try {
      await writePdfToHandle(handle, options.clientName, options.filename, options.pdfBlob);
      if (key === "local") local = true;
      else pendrive = true;
    } catch {
      // Falha silenciosa em um destino não bloqueia o outro
    }
  }

  return { local, pendrive };
}
