import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { SupabaseSetupPanel } from "@/components/configuracoes/supabase-setup-panel";

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <PageHeader
        title="Configurações"
        description="Banco de dados, integrações e preferências do sistema"
      />
      <SupabaseSetupPanel />
    </AppShell>
  );
}
