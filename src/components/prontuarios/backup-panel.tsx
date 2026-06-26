"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoredClinicalDocument } from "@/lib/prontuarios-types";
import {
  saveBackupToPendrive,
  downloadZipBackup,
  downloadJsonBackup,
  restoreBackupFromFile,
  isFileSystemAccessSupported,
} from "@/lib/backup-pendrive";
import { restoreDocuments, getStorageStatus } from "@/lib/prontuarios-store";
import {
  HardDrive,
  Download,
  Upload,
  Usb,
  FileArchive,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface BackupPanelProps {
  documents: StoredClinicalDocument[];
  onRestore: (documents: StoredClinicalDocument[]) => void;
}

export function BackupPanel({ documents, onRestore }: BackupPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const storageStatus = getStorageStatus();
  const fsSupported = isFileSystemAccessSupported();

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 6000);
  };

  const handlePendriveBackup = async () => {
    setLoading("pendrive");
    const result = await saveBackupToPendrive(documents);
    showStatus(result.success ? "success" : "error", result.message);
    setLoading(null);
  };

  const handleZipDownload = async () => {
    setLoading("zip");
    try {
      await downloadZipBackup(documents);
      showStatus("success", "Backup ZIP baixado! Copie o arquivo para seu pendrive.");
    } catch {
      showStatus("error", "Erro ao gerar backup ZIP.");
    }
    setLoading(null);
  };

  const handleJsonDownload = () => {
    downloadJsonBackup(documents);
    showStatus("success", "Backup JSON baixado!");
  };

  const handleRestoreFile = async (file: File) => {
    setLoading("restore");
    const result = await restoreBackupFromFile(file);
    if (result.success) {
      const { count, source } = await restoreDocuments(result.documents);
      onRestore(result.documents);
      showStatus(
        "success",
        `${count} documento(s) restaurado(s) (${source === "supabase" ? "nuvem + local" : "armazenamento local"}).`,
      );
    } else {
      showStatus("error", result.message);
    }
    setLoading(null);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup e Restauração
            </CardTitle>
            <CardDescription>
              Salve seus prontuários no pendrive ou restaure de um backup anterior
            </CardDescription>
          </div>
          <Badge variant={storageStatus === "supabase" ? "success" : "info"}>
            {storageStatus === "supabase"
              ? "Nuvem Supabase"
              : storageStatus === "local"
                ? "Armazenamento local"
                : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {status.message}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            onClick={handlePendriveBackup}
            disabled={documents.length === 0 || loading !== null}
          >
            <Usb className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">
                {fsSupported ? "Salvar no pendrive" : "Salvar em pasta"}
              </p>
              <p className="text-xs font-normal text-slate-500">
                {fsSupported
                  ? "Selecione o pendrive e grave JSON + PDFs"
                  : "Baixa ZIP para copiar ao pendrive"}
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            onClick={handleZipDownload}
            disabled={documents.length === 0 || loading !== null}
          >
            <FileArchive className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">Baixar backup ZIP</p>
              <p className="text-xs font-normal text-slate-500">
                JSON + PDFs de todos os documentos
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            onClick={handleJsonDownload}
            disabled={documents.length === 0 || loading !== null}
          >
            <Download className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium">Baixar JSON</p>
              <p className="text-xs font-normal text-slate-500">
                Apenas dados (arquivo leve)
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left sm:col-span-2 lg:col-span-1"
            onClick={handleRestoreClick}
            disabled={loading !== null}
          >
            <Upload className="h-5 w-5 text-accent-600" />
            <div>
              <p className="font-medium">Restaurar do pendrive</p>
              <p className="text-xs font-normal text-slate-500">
                Selecione opticare-backup.json ou .zip
              </p>
            </div>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip,application/json,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleRestoreFile(file);
            e.target.value = "";
          }}
        />

        <p className="text-xs text-slate-500">
          {documents.length} documento(s) disponível(is) para backup.
          {fsSupported
            ? " No Chrome/Edge, você pode selecionar diretamente a pasta do pendrive."
            : " Use o download ZIP e copie manualmente para o pendrive."}
        </p>
      </CardContent>
    </Card>
  );
}
