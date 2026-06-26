import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ClinicaPage() {
  return (
    <AppShell>
      <PageHeader
        title="Clínica / Agenda"
        description="Agendamento de consultas, optometria e prontuário clínico"
      />
      <ModulePlaceholder
        features={[
          "Agenda de consultas com calendário",
          "Cadastro de optometristas e médicos",
          "Prontuário eletrônico do paciente",
          "Emissão de receitas digitais",
          "Integração com módulo de acuidade visual",
          "Lembretes por WhatsApp e e-mail",
        ]}
      />
    </AppShell>
  );
}
