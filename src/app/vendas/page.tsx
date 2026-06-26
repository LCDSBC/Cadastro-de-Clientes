import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function VendasPage() {
  return (
    <AppShell>
      <PageHeader
        title="Vendas"
        description="Orçamentos, vendas, trocas, assistência e ordens de serviço"
      />
      <ModulePlaceholder
        features={[
          "Orçamentos e conversão em venda",
          "Ordem de serviço com impressão",
          "Crédito de cliente e crediário",
          "Comissões de vendedores",
          "Controle de entregas",
          "Devolução e troca de produtos",
        ]}
      />
    </AppShell>
  );
}
