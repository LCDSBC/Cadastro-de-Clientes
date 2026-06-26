import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function RelatoriosPage() {
  return (
    <AppShell>
      <PageHeader
        title="Relatórios"
        description="Indicadores de desempenho, vendas, estoque e financeiro"
      />
      <ModulePlaceholder
        features={[
          "Vendas por período e vendedor",
          "Curva ABC de produtos",
          "Inadimplência e recebíveis",
          "Produtos com estoque baixo",
          "Exames de acuidade realizados",
          "DRE e indicadores gerenciais",
        ]}
      />
    </AppShell>
  );
}
