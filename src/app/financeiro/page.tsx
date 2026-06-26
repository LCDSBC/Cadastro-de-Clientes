import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function FinanceiroPage() {
  return (
    <AppShell>
      <PageHeader
        title="Financeiro"
        description="Contas a pagar/receber, fluxo de caixa, DRE e conciliação"
      />
      <ModulePlaceholder
        features={[
          "Contas a receber e a pagar",
          "Fluxo de caixa e movimento bancário",
          "Centro de custos e plano de contas",
          "Conciliação bancária e de cartões",
          "Renegociação e cobrança",
          "DRE e relatórios financeiros",
          "Boleto e PIX integrados",
        ]}
      />
    </AppShell>
  );
}
