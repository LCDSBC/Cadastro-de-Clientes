"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadAppointments } from "@/lib/appointments-store";
import { loadStoreSettings } from "@/lib/settings-store";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/clinic";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import { Calendar, Loader2 } from "lucide-react";

export default function PublicAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [storeName, setStoreName] = useState("OptiCare");
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([loadAppointments(), loadStoreSettings()]).then(
      ([{ appointments: data }, { store }]) => {
        setAppointments(
          data.filter(
            (a) =>
              a.scheduled_at.startsWith(today) &&
              a.status !== "cancelado",
          ),
        );
        if (store?.name) setStoreName(store.name);
        setLoading(false);
      },
    );
  }, [today]);

  return (
    <AppShell>
      <PageHeader
        title="Agenda pública"
        description={`Horários disponíveis hoje — ${storeName}`}
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="mb-4 flex items-center gap-2 text-slate-600">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(today)}</span>
            </div>
            {appointments.length ? (
              <ul className="space-y-3">
                {appointments
                  .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                  .map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{formatTime(a.scheduled_at)}</p>
                        <p className="text-sm text-slate-500">
                          {a.appointment_type ?? "Consulta"}
                          {a.professional_name && ` · ${a.professional_name}`}
                        </p>
                      </div>
                      <Badge variant={a.status === "confirmado" ? "success" : "info"}>
                        {APPOINTMENT_STATUS_LABELS[a.status]}
                      </Badge>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500">
                Nenhum horário agendado para hoje.
              </p>
            )}
            <p className="mt-6 text-center text-xs text-slate-400">
              Para agendar, entre em contato com a loja. Dados sem identificação do cliente (LGPD).
            </p>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
