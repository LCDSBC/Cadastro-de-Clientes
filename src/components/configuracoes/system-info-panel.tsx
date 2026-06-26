"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { systemModules } from "@/lib/modules";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { clearLocalData, getLocalDataSize } from "@/lib/settings-store";
import { APP_VERSION, LOCAL_STORAGE_KEYS } from "@/lib/settings";
import { Info, Trash2, RefreshCw } from "lucide-react";

export function SystemInfoPanel() {
  const [dataSize, setDataSize] = useState("0 KB");
  const [cleared, setCleared] = useState(false);

  const storageStatus = getStorageStatus();
  const activeModules = systemModules.filter((m) => m.status === "active");
  const betaModules = systemModules.filter((m) => m.status === "beta");
  const comingSoon = systemModules.filter((m) => m.status === "coming_soon");

  useEffect(() => {
    setDataSize(getLocalDataSize());
  }, [cleared]);

  const handleClearData = () => {
    if (
      !confirm(
        "Limpar todos os dados locais? Os dados na nuvem (Supabase) não serão afetados. A página será recarregada.",
      )
    ) {
      return;
    }
    clearLocalData();
    setCleared((v) => !v);
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Sistema
        </CardTitle>
        <CardDescription>
          Informações e manutenção do OptiCare ERP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Versão</dt>
            <dd className="font-medium">OptiCare ERP v{APP_VERSION}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Armazenamento</dt>
            <dd>
              <Badge
                variant={storageStatus === "supabase" ? "success" : "info"}
              >
                {storageStatus === "supabase"
                  ? "Nuvem Supabase"
                  : storageStatus === "local"
                    ? "Local (navegador)"
                    : "Offline"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Dados locais</dt>
            <dd className="font-medium">{dataSize}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Módulos ativos</dt>
            <dd className="font-medium">{activeModules.length}</dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Módulos instalados
          </p>
          <div className="flex flex-wrap gap-2">
            {activeModules.map((m) => (
              <Badge key={m.id} variant="success">
                {m.name}
              </Badge>
            ))}
            {betaModules.map((m) => (
              <Badge key={m.id} variant="warning">
                {m.name} (beta)
              </Badge>
            ))}
            {comingSoon.map((m) => (
              <Badge key={m.id} variant="default">
                {m.name} (em breve)
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Chaves de armazenamento local
          </p>
          <div className="flex flex-wrap gap-1">
            {LOCAL_STORAGE_KEYS.map((key) => (
              <code
                key={key}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
              >
                {key}
              </code>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-900">
            Limpar cache local
          </p>
          <p className="mb-3 text-xs text-amber-800">
            Remove dados salvos no navegador (clientes, vendas, estoque, etc.).
            Útil para recomeçar com dados demo ou após problemas de sincronização.
            Dados no Supabase não são alterados.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <Trash2 className="h-4 w-4" />
              Limpar dados locais
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar app
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
