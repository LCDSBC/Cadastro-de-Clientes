"use client";

import { useState } from "react";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { exportAllClientPdfs } from "@/lib/client-folder-sync";
import { isClientFolderLinked } from "@/lib/client-folder-storage";
import { FolderDown, Loader2 } from "lucide-react";

interface ClientExportButtonProps {
  client: Client;
  className?: string;
}

export function ClientExportButton({ client, className }: ClientExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setStatus(null);
    setProgress(null);

    const result = await exportAllClientPdfs(client, (p) => {
      const phase =
        p.phase === "generating"
          ? "Gerando"
          : p.phase === "saving"
            ? "Salvando"
            : "Preparando";
      setProgress(`${phase}: ${p.label ?? p.clientName} (${p.current}/${p.total})`);
    });

    setExporting(false);
    setProgress(null);
    setStatus(result.message);
    setTimeout(() => setStatus(null), 8000);
  }

  const foldersLinked = isClientFolderLinked();

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        disabled={exporting}
        onClick={() => void handleExport()}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FolderDown className="h-4 w-4" />
        )}
        {exporting ? "Exportando..." : "Exportar todos os PDFs"}
      </Button>
      {!foldersLinked && !exporting && (
        <p className="mt-1 text-xs text-slate-500">
          Sem pasta configurada: os PDFs serão baixados em ZIP.
        </p>
      )}
      {progress && (
        <p className="mt-1 text-xs text-primary-600">{progress}</p>
      )}
      {status && (
        <p className="mt-1 text-xs text-green-700">{status}</p>
      )}
    </div>
  );
}
