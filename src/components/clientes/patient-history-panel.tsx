"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadAnamnesisRecords } from "@/lib/anamnesis-store";
import { loadAcuityExams } from "@/lib/acuity-exams-store";
import { loadPrescriptions } from "@/lib/clients-store";
import { loadDocuments } from "@/lib/prontuarios-store";
import { loadAppointments } from "@/lib/appointments-store";
import {
  buildPatientHistory,
  historyTypeLabel,
  formatHistoryDate,
  type PatientHistoryEvent,
} from "@/lib/patient-history";
import { History, Loader2, Plus } from "lucide-react";

interface PatientHistoryPanelProps {
  clientId: string;
  clientName: string;
}

const BADGE_VARIANT: Record<
  PatientHistoryEvent["type"],
  "info" | "success" | "warning" | "default"
> = {
  anamnesis: "info",
  acuity_exam: "success",
  prescription: "default",
  clinical_document: "warning",
  appointment: "info",
};

export function PatientHistoryPanel({
  clientId,
  clientName,
}: PatientHistoryPanelProps) {
  const [events, setEvents] = useState<PatientHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadAnamnesisRecords(clientId),
      loadAcuityExams(clientId),
      loadPrescriptions(clientId),
      loadDocuments(),
      loadAppointments(),
    ]).then(([anamnesis, acuityExams, prescriptions, { documents }, { appointments }]) => {
      setEvents(
        buildPatientHistory({
          clientId,
          anamnesis,
          acuityExams,
          prescriptions,
          documents: documents.filter(
            (d) => d.client_id === clientId || d.client_name === clientName,
          ),
          appointments,
        }),
      );
      setLoading(false);
    });
  }, [clientId, clientName]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico do paciente
        </CardTitle>
        <div className="flex gap-2">
          <Link href={`/anamnese?client_id=${clientId}`}>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              Anamnese
            </Button>
          </Link>
          <Link href={`/acuidade-visual?client_id=${clientId}`}>
            <Button size="sm" variant="outline">
              Teste AV
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <ol className="relative border-l border-slate-200 pl-4">
            {events.map((ev) => (
              <li key={`${ev.type}-${ev.id}`} className="mb-4 ml-2">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={BADGE_VARIANT[ev.type]}>
                    {historyTypeLabel(ev.type)}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatHistoryDate(ev.date)}
                  </span>
                </div>
                <p className="mt-1 font-medium text-slate-900">{ev.title}</p>
                <p className="text-sm text-slate-600">{ev.summary}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">
            Nenhum registro clínico para {clientName}. Inicie com uma anamnese
            ou teste de acuidade.
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          Linha do tempo: anamneses, testes AV, receitas, prontuários e consultas.
        </p>
      </CardContent>
    </Card>
  );
}
