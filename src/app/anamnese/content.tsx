"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnamnesisForm } from "@/components/anamnese/anamnesis-form";
import { loadClients } from "@/lib/clients-store";
import { loadAnamnesisRecords } from "@/lib/anamnesis-store";
import { anamnesisSummary } from "@/lib/anamnesis";
import type { Client } from "@/lib/types";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Loader2 } from "lucide-react";

export default function AnamnesePageContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("client_id") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(preselectedId);
  const [history, setHistory] = useState<StructuredAnamnesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StructuredAnamnesis | undefined>();

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  const selectedClient = clients.find((c) => c.id === clientId);

  useEffect(() => {
    loadClients().then(({ clients: data }) => {
      setClients(data);
      if (preselectedId && data.some((c) => c.id === preselectedId)) {
        setClientId(preselectedId);
      }
      setLoading(false);
    });
  }, [preselectedId]);

  useEffect(() => {
    if (!clientId) {
      setHistory([]);
      return;
    }
    void loadAnamnesisRecords(clientId).then(setHistory);
  }, [clientId]);

  return (
    <AppShell>
      <PageHeader
        title="Anamnese estruturada"
        description={`Ficha clínica com histórico do paciente — ${storageLabel}`}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Cliente"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setEditing(undefined);
                  }}
                  options={[
                    { value: "", label: "Selecione o paciente..." },
                    ...clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
                {selectedClient && (
                  <p className="mt-2 text-xs text-slate-500">
                    <Link
                      href="/clientes"
                      className="text-primary-600 hover:underline"
                    >
                      Ver ficha completa e histórico
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {clientId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4" />
                    Anamneses anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-2 w-full"
                    onClick={() => setEditing(undefined)}
                  >
                    Nova anamnese
                  </Button>
                  {history.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setEditing(h)}
                      className="w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50"
                    >
                      <p className="font-medium">{formatDate(h.exam_date)}</p>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {anamnesisSummary(h)}
                      </p>
                    </button>
                  ))}
                  {!history.length && (
                    <p className="text-sm text-slate-500">
                      Nenhuma anamnese registrada.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedClient ? (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
                  {editing && (
                    <Badge variant="info">
                      Editando {formatDate(editing.exam_date)}
                    </Badge>
                  )}
                </div>
                <AnamnesisForm
                  key={editing?.id ?? `new-${clientId}`}
                  clientId={clientId}
                  clientName={selectedClient.name}
                  initial={editing}
                  onSaved={(record) => {
                    setHistory((prev) => {
                      const idx = prev.findIndex((r) => r.id === record.id);
                      if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = record;
                        return next;
                      }
                      return [record, ...prev];
                    });
                    setEditing(undefined);
                  }}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-slate-500">
                  Selecione um paciente para preencher a anamnese.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
