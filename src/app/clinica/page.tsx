"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Appointment, Client } from "@/lib/types";
import {
  loadAppointments,
  saveAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  calcClinicSummary,
} from "@/lib/appointments-store";
import { loadClients } from "@/lib/clients-store";
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_VARIANT,
  APPOINTMENT_STATUS_FLOW,
  DURATION_OPTIONS,
  isSameDay,
  isToday,
} from "@/lib/clinic";
import {
  buildWhatsAppReminderLink,
  buildEmailReminderLink,
  getRecallCandidates,
  getUpcomingReminders,
} from "@/lib/clinic-recall";
import { loadPreferences } from "@/lib/settings-store";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatDate, formatTime } from "@/lib/utils";
import { ProfessionalSelect } from "@/components/profissionais/professional-select";
import { getProfessionalByIdSync } from "@/lib/professionals-store";
import {
  Plus,
  Search,
  Calendar,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  User,
  Clock,
  MessageCircle,
  Mail,
  Bell,
  ExternalLink,
} from "lucide-react";

const emptyForm = {
  client_id: "",
  professional_id: "",
  appointment_type: "Consulta optométrica",
  date: "",
  time: "09:00",
  duration_minutes: "30",
  notes: "",
};

function toLocalDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ClinicaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    toLocalDateInput(new Date()),
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [recallList, setRecallList] = useState<ReturnType<typeof getRecallCandidates>>([]);
  const [reminders, setReminders] = useState<Appointment[]>([]);

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    Promise.all([loadAppointments(), loadClients(), loadPreferences()]).then(
      ([{ appointments: data }, { clients: clientsData }, prefs]) => {
        setAppointments(data);
        setClients(clientsData);
        setRecallList(getRecallCandidates(clientsData, data, prefs.recall_months ?? 12));
        setReminders(getUpcomingReminders(data, 2));
        setLoading(false);
      },
    );
  }, []);

  const summary = calcClinicSummary(appointments);

  const dayAppointments = appointments
    .filter((a) => isSameDay(a.scheduled_at, selectedDate))
    .filter((a) => {
      const matchesSearch =
        a.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (a.professional_name?.toLowerCase().includes(search.toLowerCase()) ??
          false) ||
        (a.appointment_type?.toLowerCase().includes(search.toLowerCase()) ??
          false);
      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(toLocalDateInput(d));
    setSelected(null);
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: selectedDate,
      time: "09:00",
    });
    setShowForm(true);
  };

  const openEditForm = (appointment: Appointment) => {
    const dt = new Date(appointment.scheduled_at);
    setEditingId(appointment.id);
    setForm({
      client_id: appointment.client_id,
      professional_id: appointment.professional_id ?? "",
      appointment_type: appointment.appointment_type ?? "Consulta optométrica",
      date: toLocalDateInput(dt),
      time: `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`,
      duration_minutes: String(appointment.duration_minutes),
      notes: appointment.notes ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const client = clients.find((c) => c.id === form.client_id);
    if (!client) {
      setSaving(false);
      return;
    }

    const professional = getProfessionalByIdSync(form.professional_id);
    const existing = editingId
      ? appointments.find((a) => a.id === editingId)
      : undefined;

    const scheduledAt = new Date(
      `${form.date}T${form.time}:00`,
    ).toISOString();

    const { appointment } = await saveAppointment({
      id: editingId ?? crypto.randomUUID(),
      client_id: client.id,
      client_name: client.name,
      professional_id: form.professional_id || undefined,
      professional_name: professional?.name,
      appointment_type: form.appointment_type,
      scheduled_at: scheduledAt,
      duration_minutes: parseInt(form.duration_minutes, 10) || 30,
      status: existing?.status ?? "agendado",
      notes: form.notes.trim() || undefined,
      created_at: existing?.created_at,
    });

    setAppointments((prev) => {
      const idx = prev.findIndex((a) => a.id === appointment.id);
      const updated = [...prev];
      if (idx >= 0) updated[idx] = appointment;
      else updated.push(appointment);
      return updated.sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      );
    });

    setSelected(appointment);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaving(false);
  };

  const handleAdvanceStatus = async (appointment: Appointment) => {
    const currentIdx = APPOINTMENT_STATUS_FLOW.indexOf(appointment.status);
    if (currentIdx < 0 || currentIdx >= APPOINTMENT_STATUS_FLOW.length - 1) {
      return;
    }

    const nextStatus = APPOINTMENT_STATUS_FLOW[currentIdx + 1];
    const updated = await updateAppointmentStatus(appointment.id, nextStatus);
    if (updated) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setSelected(updated);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    if (!confirm("Cancelar esta consulta?")) return;
    const updated = await updateAppointmentStatus(appointment.id, "cancelado");
    if (updated) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setSelected(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const selectedDateLabel = formatDate(selectedDate + "T12:00:00");
  const isSelectedToday = isSameDay(
    selectedDate + "T12:00:00",
    new Date().toISOString(),
  );

  return (
    <AppShell>
      <PageHeader
        title="Clínica / Agenda"
        description={`Agendamento de consultas e optometria — ${storageLabel}`}
        actions={
          <Button onClick={openNewForm}>
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Hoje</p>
            <p className="text-2xl font-bold text-primary-700">{summary.hoje}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Agendados</p>
            <p className="text-2xl font-bold text-slate-900">
              {summary.agendados}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Confirmados</p>
            <p className="text-2xl font-bold text-slate-900">
              {summary.confirmados}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Realizados</p>
            <p className="text-2xl font-bold text-emerald-700">
              {summary.realizados}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Cancelados</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.cancelados}
            </p>
          </CardContent>
        </Card>
      </div>

      {(reminders.length > 0 || recallList.length > 0) && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {reminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5" />
                  Lembretes (próximas 48h)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reminders.map((a) => (
                  <div key={a.id} className="flex justify-between rounded border p-2 text-sm">
                    <span>{a.client_name} — {formatTime(a.scheduled_at)}</span>
                    <Badge variant="info">{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {recallList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recall — retorno de clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recallList.slice(0, 5).map((r) => (
                  <div key={r.client.id} className="flex justify-between rounded border p-2 text-sm">
                    <span>{r.client.name}</span>
                    <span className="text-slate-500">{r.reason}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => shiftDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedDateLabel}
                </p>
                {isSelectedToday && (
                  <p className="text-xs text-primary-600">Hoje</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => shiftDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelected(null);
              }}
              className="w-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDate(toLocalDateInput(new Date()));
                setSelected(null);
              }}
            >
              Hoje
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar paciente, profissional ou tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos os status</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? "Editar agendamento" : "Novo agendamento"}
            </CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Paciente"
                required
                value={form.client_id}
                onChange={(e) =>
                  setForm({ ...form, client_id: e.target.value })
                }
                options={[
                  { value: "", label: "Selecione o paciente..." },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <ProfessionalSelect
                label="Profissional"
                value={form.professional_id}
                allowEmpty
                emptyLabel="Sem profissional definido"
                onChange={(id) =>
                  setForm({ ...form, professional_id: id })
                }
              />
              <Select
                label="Tipo de consulta"
                value={form.appointment_type}
                onChange={(e) =>
                  setForm({ ...form, appointment_type: e.target.value })
                }
                options={APPOINTMENT_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
              />
              <Select
                label="Duração"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: e.target.value })
                }
                options={DURATION_OPTIONS}
              />
              <Input
                label="Data"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                label="Horário"
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <Textarea
                label="Observações"
                className="sm:col-span-2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Motivo da consulta, preparo necessário..."
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving || !form.client_id}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar ({storageLabel})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Agenda do dia ({loading ? "..." : dayAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] space-y-2 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </div>
              ) : dayAppointments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhuma consulta neste dia.
                </p>
              ) : (
                dayAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelected(appointment)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected?.id === appointment.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 text-center">
                        <p className="text-sm font-bold text-primary-700">
                          {formatTime(appointment.scheduled_at)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {appointment.duration_minutes}min
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {appointment.client_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {appointment.appointment_type ??
                            "Consulta"}
                          {appointment.professional_name &&
                            ` · ${appointment.professional_name}`}
                        </p>
                        <Badge
                          variant={
                            APPOINTMENT_STATUS_VARIANT[appointment.status]
                          }
                          className="mt-1"
                        >
                          {APPOINTMENT_STATUS_LABELS[appointment.status]}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selected.client_name}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {selected.appointment_type ?? "Consulta"} ·{" "}
                      {formatTime(selected.scheduled_at)} (
                      {selected.duration_minutes} min)
                    </p>
                  </div>
                  <Badge variant={APPOINTMENT_STATUS_VARIANT[selected.status]}>
                    {APPOINTMENT_STATUS_LABELS[selected.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">Data</dt>
                      <dd className="font-medium">
                        {formatDate(selected.scheduled_at)}
                        {isToday(selected.scheduled_at) && (
                          <span className="ml-2 text-xs text-primary-600">
                            (Hoje)
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Horário</dt>
                      <dd className="flex items-center gap-1 font-medium">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatTime(selected.scheduled_at)} —{" "}
                        {selected.duration_minutes} min
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Profissional</dt>
                      <dd className="font-medium">
                        {selected.professional_name ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Tipo</dt>
                      <dd className="font-medium">
                        {selected.appointment_type ?? "Consulta optométrica"}
                      </dd>
                    </div>
                  </dl>

                  {selected.notes && (
                    <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="mb-1 font-medium">Observações</p>
                      <p>{selected.notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selected.status !== "cancelado" &&
                      selected.status !== "realizado" && (() => {
                        const client = clients.find((c) => c.id === selected.client_id);
                        const date = formatDate(selected.scheduled_at);
                        const time = formatTime(selected.scheduled_at);
                        return (
                          <>
                            {client?.phone && (
                              <a
                                href={buildWhatsAppReminderLink(client.phone, client.name, date, time)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm" type="button">
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                </Button>
                              </a>
                            )}
                            {client?.email && (
                              <a href={buildEmailReminderLink(client.email, client.name, date, time)}>
                                <Button variant="outline" size="sm" type="button">
                                  <Mail className="h-4 w-4" />
                                  E-mail
                                </Button>
                              </a>
                            )}
                          </>
                        );
                      })()}
                    <Link href="/agenda" target="_blank">
                      <Button variant="outline" size="sm" type="button">
                        <ExternalLink className="h-4 w-4" />
                        Agenda pública
                      </Button>
                    </Link>
                    {APPOINTMENT_STATUS_FLOW.includes(selected.status) &&
                      APPOINTMENT_STATUS_FLOW.indexOf(selected.status) <
                        APPOINTMENT_STATUS_FLOW.length - 1 && (
                        <Button onClick={() => handleAdvanceStatus(selected)}>
                          {
                            APPOINTMENT_STATUS_LABELS[
                              APPOINTMENT_STATUS_FLOW[
                                APPOINTMENT_STATUS_FLOW.indexOf(
                                  selected.status,
                                ) + 1
                              ]
                            ]
                          }
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    {selected.status !== "realizado" &&
                      selected.status !== "cancelado" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => openEditForm(selected)}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCancel(selected)}
                          >
                            Cancelar consulta
                          </Button>
                        </>
                      )}
                    <Link
                      href={
                        selected.client_id
                          ? `/acuidade-visual?client_id=${selected.client_id}`
                          : "/acuidade-visual"
                      }
                    >
                      <Button variant="outline">
                        <Eye className="h-4 w-4" />
                        Acuidade Visual
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(selected.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>

                  {APPOINTMENT_STATUS_FLOW.includes(selected.status) && (
                    <div className="mt-4 flex items-center gap-1">
                      {APPOINTMENT_STATUS_FLOW.map((status, i) => {
                        const currentIdx = APPOINTMENT_STATUS_FLOW.indexOf(
                          selected.status,
                        );
                        const isActive = i <= currentIdx;
                        return (
                          <div key={status} className="flex items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                                isActive
                                  ? "bg-primary-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {i + 1}
                            </div>
                            {i < APPOINTMENT_STATUS_FLOW.length - 1 && (
                              <div
                                className={`mx-1 h-0.5 w-6 ${
                                  i < currentIdx
                                    ? "bg-primary-600"
                                    : "bg-slate-200"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selected.client_name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    ID: {selected.client_id.slice(0, 8)}...
                  </p>
                  <Link
                    href="/clientes"
                    className="mt-3 inline-flex text-sm text-primary-600 hover:underline"
                  >
                    Ver cadastro do cliente →
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione uma consulta para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
