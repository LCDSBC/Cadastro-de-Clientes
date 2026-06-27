"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CLIENT_ROOT_FOLDER,
  clearFolderForStorage,
  isFileSystemAccessSupported,
  loadClientFolderSettings,
  saveClientFolderSettings,
  pickFolderForStorage,
  type ClientFolderSettings,
} from "@/lib/client-folder-storage";
import { FolderOpen, HardDrive, Usb, CheckCircle2, AlertCircle } from "lucide-react";

export function ClientFolderPanel() {
  const [settings, setSettings] = useState<ClientFolderSettings>(() =>
    loadClientFolderSettings(),
  );
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState<"local" | "pendrive" | null>(null);
  const fsSupported = isFileSystemAccessSupported();

  useEffect(() => {
    setSettings(loadClientFolderSettings());
  }, []);

  function showStatus(type: "ok" | "error", text: string) {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 5000);
  }

  async function handlePickFolder(key: "local" | "pendrive") {
    setLoading(key);
    const result = await pickFolderForStorage(key);
    setLoading(null);
    if (result.success) {
      setSettings(loadClientFolderSettings());
      showStatus("ok", result.message);
    } else {
      showStatus("error", result.message);
    }
  }

  async function handleClear(key: "local" | "pendrive") {
    await clearFolderForStorage(key);
    setSettings(loadClientFolderSettings());
    showStatus("ok", "Pasta desvinculada.");
  }

  function toggleAutoSync(enabled: boolean) {
    const next = { ...settings, autoSyncOnSave: enabled };
    saveClientFolderSettings(next);
    setSettings(next);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary-600" />
            Pastas por cliente
          </CardTitle>
          <CardDescription>
            Ao salvar no sistema (nuvem ou local), os PDFs são gravados automaticamente em{" "}
            <strong>{CLIENT_ROOT_FOLDER}</strong> / <em>Nome do cliente</em> no computador e no
            pendrive, quando configurados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!fsSupported && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Gravação automática em pastas requer Chrome ou Edge no computador. No celular ou
                Safari, use o backup ZIP em Acuidade Visual → Prontuários.
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={settings.autoSyncOnSave}
              onChange={(e) => toggleAutoSync(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <div>
              <p className="font-medium text-slate-900">Salvar PDFs automaticamente ao gravar</p>
              <p className="text-sm text-slate-500">
                Ficha de cadastro, anamnese, laudo optométrico, laudo de acuidade e resultados dos
                testes.
              </p>
            </div>
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-slate-600" />
                <p className="font-medium text-slate-900">Pasta no computador</p>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Selecione Documentos, Desktop ou outra pasta. O sistema criará{" "}
                <code className="rounded bg-slate-100 px-1">{CLIENT_ROOT_FOLDER}</code> dentro dela.
              </p>
              {settings.localFolderLabel ? (
                <p className="mb-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Vinculada: {settings.localFolderLabel}
                </p>
              ) : (
                <p className="mb-3 text-sm text-slate-400">Nenhuma pasta selecionada</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!fsSupported || loading === "local"}
                  onClick={() => void handlePickFolder("local")}
                >
                  {loading === "local" ? "Aguarde..." : "Selecionar pasta"}
                </Button>
                {settings.localFolderLabel && (
                  <Button variant="outline" onClick={() => void handleClear("local")}>
                    Desvincular
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Usb className="h-5 w-5 text-slate-600" />
                <p className="font-medium text-slate-900">Pasta no pendrive</p>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Conecte o pendrive e selecione a unidade (ex.: USB). O backup é feito ao mesmo tempo
                que o salvamento no computador.
              </p>
              {settings.pendriveFolderLabel ? (
                <p className="mb-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Vinculado: {settings.pendriveFolderLabel}
                </p>
              ) : (
                <p className="mb-3 text-sm text-slate-400">Nenhum pendrive selecionado</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!fsSupported || loading === "pendrive"}
                  onClick={() => void handlePickFolder("pendrive")}
                >
                  {loading === "pendrive" ? "Aguarde..." : "Selecionar pendrive"}
                </Button>
                {settings.pendriveFolderLabel && (
                  <Button variant="outline" onClick={() => void handleClear("pendrive")}>
                    Desvincular
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="mb-2 font-medium text-slate-800">Estrutura de pastas</p>
            <pre className="overflow-x-auto text-xs leading-relaxed">
{`${CLIENT_ROOT_FOLDER}/
  Maria Silva Santos/
    ficha-cadastro-2025-06-27.pdf
    anamnese-2025-06-27.pdf
    laudo-optometrico-2025-06-27.pdf
    laudo-acuidade-visual-2025-06-27.pdf
    resultados-acuidade-2025-06-27.pdf`}
            </pre>
          </div>

          {status && (
            <p
              className={`text-sm ${
                status.type === "ok" ? "text-green-700" : "text-red-600"
              }`}
            >
              {status.text}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
