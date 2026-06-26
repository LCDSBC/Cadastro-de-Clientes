import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function FiscalPage() {
  return (
    <AppShell>
      <PageHeader
        title="Fiscal"
        description="Emissão de notas fiscais e obrigações acessórias"
      />
      <ModulePlaceholder
        features={[
          "NF-e e NFC-e",
          "SAT e ECF (PAF)",
          "Importação e exportação de XML",
          "SPED Fiscal e SPED Contribuições",
          "Sintegra",
        ]}
        status="coming_soon"
      />
    </AppShell>
  );
}
