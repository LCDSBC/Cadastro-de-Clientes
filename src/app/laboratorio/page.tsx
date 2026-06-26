import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function LaboratorioPage() {
  return (
    <AppShell>
      <PageHeader
        title="Laboratório"
        description="Gestão de pedidos, produção e integração com laboratórios externos"
      />
      <ModulePlaceholder
        features={[
          "Fechamento de pedido em laboratório",
          "Controle de produção de lentes",
          "Integração com laboratórios parceiros",
          "Acompanhamento de prazos de entrega",
          "Impressão de OS para laboratório",
          "Gestão de blocos e surfassagem",
        ]}
      />
    </AppShell>
  );
}
