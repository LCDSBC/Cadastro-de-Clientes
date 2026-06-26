import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Configurações"
        description="Usuários, loja, permissões e integrações"
      />
      <ModulePlaceholder
        features={[
          "Usuários, senhas e grupos de permissão",
          "Dados da loja e CNPJ",
          "Exceções de horários e IPs de acesso",
          "Integração WhatsApp",
          "Integração e-commerce",
          "Integração Boa Vista / Serasa",
        ]}
      />
    </AppShell>
  );
}
