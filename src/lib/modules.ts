export type ModuleStatus = "active" | "coming_soon" | "beta";

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  status: ModuleStatus;
  category: "gestao" | "clinica" | "fiscal" | "integracao";
}

export const systemModules: SystemModule[] = [
  {
    id: "dashboard",
    name: "Painel",
    description: "Visão geral do negócio",
    href: "/dashboard",
    icon: "LayoutDashboard",
    status: "active",
    category: "gestao",
  },
  {
    id: "clientes",
    name: "Clientes",
    description: "Cadastro, histórico e receitas",
    href: "/clientes",
    icon: "Users",
    status: "active",
    category: "gestao",
  },
  {
    id: "acuidade-visual",
    name: "Acuidade Visual Pró",
    description: "Testes de visão + prontuários optométricos (JL Soluções Digitais)",
    href: "/acuidade-visual",
    icon: "Eye",
    status: "active",
    category: "clinica",
  },
  {
    id: "clinica",
    name: "Clínica / Agenda",
    description: "Consultas e optometria",
    href: "/clinica",
    icon: "Calendar",
    status: "active",
    category: "clinica",
  },
  {
    id: "estoque",
    name: "Estoque",
    description: "Armações, lentes e inventário em grade",
    href: "/estoque",
    icon: "Package",
    status: "active",
    category: "gestao",
  },
  {
    id: "vendas",
    name: "Vendas",
    description: "Orçamentos, vendas e ordens de serviço",
    href: "/vendas",
    icon: "ShoppingCart",
    status: "active",
    category: "gestao",
  },
  {
    id: "laboratorio",
    name: "Laboratório",
    description: "Pedidos e produção de lentes",
    href: "/laboratorio",
    icon: "FlaskConical",
    status: "active",
    category: "gestao",
  },
  {
    id: "financeiro",
    name: "Financeiro",
    description: "Contas, fluxo de caixa e DRE",
    href: "/financeiro",
    icon: "Wallet",
    status: "active",
    category: "gestao",
  },
  {
    id: "fiscal",
    name: "Fiscal",
    description: "NF-e, NFC-e e obrigações acessórias",
    href: "/fiscal",
    icon: "FileText",
    status: "coming_soon",
    category: "fiscal",
  },
  {
    id: "relatorios",
    name: "Relatórios",
    description: "Indicadores e análises",
    href: "/relatorios",
    icon: "BarChart3",
    status: "active",
    category: "gestao",
  },
  {
    id: "configuracoes",
    name: "Configurações",
    description: "Usuários, loja e integrações",
    href: "/configuracoes",
    icon: "Settings",
    status: "beta",
    category: "integracao",
  },
];

export const categoryLabels: Record<SystemModule["category"], string> = {
  gestao: "Gestão",
  clinica: "Clínica",
  fiscal: "Fiscal",
  integracao: "Integrações",
};
