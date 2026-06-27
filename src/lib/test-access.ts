export const TEST_ACCESS_PATH = "/teste";

export function getTestAccessUrl(origin?: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return base ? `${base}${TEST_ACCESS_PATH}` : TEST_ACCESS_PATH;
}

export const TEST_QUICK_LINKS = [
  { href: "/dashboard", label: "Painel", description: "Indicadores gerais" },
  { href: "/clientes", label: "Clientes", description: "Cadastro e histórico" },
  { href: "/anamnese", label: "Anamnese", description: "Ficha clínica estruturada" },
  {
    href: "/acuidade-visual",
    label: "Acuidade Visual",
    description: "Testes de visão e prontuários",
  },
  { href: "/clinica", label: "Clínica", description: "Agenda de consultas" },
  { href: "/estoque", label: "Estoque", description: "Produtos e inventário" },
  { href: "/vendas", label: "Vendas", description: "Orçamentos e OS" },
  { href: "/financeiro", label: "Financeiro", description: "Contas e DRE" },
  { href: "/relatorios", label: "Relatórios", description: "KPIs e análises" },
] as const;

export const TEST_CHECKLIST = [
  "Abrir o Painel e conferir indicadores",
  "Cadastrar ou selecionar um cliente",
  "Preencher anamnese e salvar teste de acuidade",
  "Criar orçamento em Vendas e avançar status",
  "Conferir integrações em Financeiro e Laboratório",
] as const;
