import type { Appointment, Client } from "@/lib/types";

export interface RecallCandidate {
  client: Client;
  lastVisit?: string;
  daysSinceVisit: number;
  reason: string;
}

export function buildWhatsAppReminderLink(
  phone: string,
  clientName: string,
  date: string,
  time: string,
): string {
  const digits = phone.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Olá ${clientName}! Lembrete da OptiCare: sua consulta está agendada para ${date} às ${time}. Confirme sua presença respondendo esta mensagem.`,
  );
  return `https://wa.me/55${digits}?text=${msg}`;
}

export function buildEmailReminderLink(
  email: string,
  clientName: string,
  date: string,
  time: string,
): string {
  const subject = encodeURIComponent("Lembrete de consulta — OptiCare");
  const body = encodeURIComponent(
    `Olá ${clientName},\n\nSua consulta na OptiCare está agendada para ${date} às ${time}.\n\nAté lá!`,
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function getRecallCandidates(
  clients: Client[],
  appointments: Appointment[],
  monthsThreshold = 12,
): RecallCandidate[] {
  const thresholdDays = monthsThreshold * 30;
  const today = new Date();

  return clients
    .map((client) => {
      const clientAppts = appointments
        .filter(
          (a) =>
            a.client_id === client.id &&
            a.status === "realizado",
        )
        .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));

      const last = clientAppts[0];
      if (!last) {
        return {
          client,
          daysSinceVisit: 999,
          reason: "Nunca realizou consulta",
        };
      }

      const lastDate = new Date(last.scheduled_at);
      const days = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (days < thresholdDays) return null;

      return {
        client,
        lastVisit: last.scheduled_at,
        daysSinceVisit: days,
        reason: `Última consulta há ${days} dias`,
      };
    })
    .filter((c): c is RecallCandidate => c !== null)
    .sort((a, b) => b.daysSinceVisit - a.daysSinceVisit);
}

export function getUpcomingReminders(
  appointments: Appointment[],
  daysAhead = 1,
): Appointment[] {
  const now = new Date();
  const limit = new Date(now);
  limit.setDate(limit.getDate() + daysAhead);

  return appointments.filter((a) => {
    if (a.status === "cancelado" || a.status === "realizado") return false;
    const d = new Date(a.scheduled_at);
    return d >= now && d <= limit;
  });
}
