export interface Client {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  client_id: string;
  exam_date: string;
  od_esf?: number;
  od_cil?: number;
  od_eixo?: number;
  od_add?: number;
  oe_esf?: number;
  oe_cil?: number;
  oe_eixo?: number;
  oe_add?: number;
  dp?: number;
  optometrist?: string;
  valid_until?: string;
  notes?: string;
  created_at: string;
}

export interface AcuityExam {
  id: string;
  client_id?: string;
  test_type: string;
  distance_meters: number;
  eye: "OD" | "OE" | "AO";
  result_acuity?: string;
  result_logmar?: string;
  notes?: string;
  performed_by?: string;
  performed_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: "armacao" | "lente" | "lente_contato" | "acessorio" | "solar";
  brand?: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LensGridEntry {
  id: string;
  product_id: string;
  esf: number;
  cil: number;
  eixo?: number;
  quantity: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Sale {
  id: string;
  client_id: string;
  client_name: string;
  status: "orcamento" | "aprovado" | "producao" | "entregue" | "cancelado";
  total: number;
  discount: number;
  items: SaleItem[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  delivery_date?: string;
}

export interface FinancialAccount {
  id: string;
  type: "receber" | "pagar";
  client_id?: string;
  client_name?: string;
  sale_id?: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: "pendente" | "pago" | "vencido" | "cancelado";
  payment_method?: string;
  created_at: string;
}

export interface FinancialSummary {
  totalReceber: number;
  totalPagar: number;
  saldoPrevisto: number;
  vencidos: number;
  recebidoMes: number;
  pagoMes: number;
}

export interface ServiceOrder {
  id: string;
  sale_id?: string;
  client_name?: string;
  sale_total?: number;
  status: "aberta" | "producao" | "pronta" | "entregue";
  lab_name: string;
  expected_date?: string;
  notes?: string;
  created_at: string;
}

export interface LabSummary {
  abertas: number;
  emProducao: number;
  prontas: number;
  entregues: number;
  atrasadas: number;
}

export interface Appointment {
  id: string;
  client_id: string;
  client_name: string;
  professional_id?: string;
  professional_name?: string;
  appointment_type?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "agendado" | "confirmado" | "realizado" | "cancelado";
  notes?: string;
  created_at: string;
}

export interface ClinicSummary {
  hoje: number;
  agendados: number;
  confirmados: number;
  realizados: number;
  cancelados: number;
}

export interface DashboardStats {
  totalClients: number;
  monthlySales: number;
  pendingOrders: number;
  lowStockItems: number;
  todayAppointments: number;
  examsThisMonth: number;
}

// Dados de demonstração para MVP
export const demoClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    cpf: "12345678901",
    email: "maria.silva@email.com",
    phone: "11999887766",
    birth_date: "1985-03-15",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zip_code: "01310100",
    notes: "Cliente preferencial",
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-06-01T14:30:00Z",
  },
  {
    id: "2",
    name: "João Pedro Oliveira",
    cpf: "98765432100",
    email: "joao.oliveira@email.com",
    phone: "21988776655",
    birth_date: "1992-07-22",
    address: "Av. Brasil, 456",
    city: "Rio de Janeiro",
    state: "RJ",
    zip_code: "20040020",
    created_at: "2025-02-20T09:00:00Z",
    updated_at: "2025-05-15T11:00:00Z",
  },
  {
    id: "3",
    name: "Ana Carolina Mendes",
    cpf: "45678912300",
    email: "ana.mendes@email.com",
    phone: "31977665544",
    birth_date: "1978-11-08",
    city: "Belo Horizonte",
    state: "MG",
    created_at: "2025-03-05T16:00:00Z",
    updated_at: "2025-06-10T08:00:00Z",
  },
];

export const demoPrescriptions: Prescription[] = [
  {
    id: "1",
    client_id: "1",
    exam_date: "2025-05-20",
    od_esf: -2.25,
    od_cil: -0.75,
    od_eixo: 180,
    od_add: 1.5,
    oe_esf: -2.0,
    oe_cil: -0.5,
    oe_eixo: 175,
    oe_add: 1.5,
    dp: 62,
    optometrist: "Dr. Ricardo Alves",
    valid_until: "2026-05-20",
    created_at: "2025-05-20T10:00:00Z",
  },
];

export const demoStats: DashboardStats = {
  totalClients: 248,
  monthlySales: 87450.0,
  pendingOrders: 12,
  lowStockItems: 7,
  todayAppointments: 5,
  examsThisMonth: 34,
};

export const demoProducts: Product[] = [
  {
    id: "1",
    sku: "ARM-001",
    name: "Armação Ray-Ban RB5228",
    category: "armacao",
    brand: "Ray-Ban",
    cost_price: 280,
    sale_price: 599,
    stock_quantity: 15,
    min_stock: 5,
    active: true,
  },
  {
    id: "2",
    sku: "LEN-001",
    name: "Lente Varilux Comfort 1.67",
    category: "lente",
    brand: "Essilor",
    cost_price: 350,
    sale_price: 890,
    stock_quantity: 3,
    min_stock: 10,
    active: true,
  },
];

export const demoSales: Sale[] = [
  {
    id: "1",
    client_id: "1",
    client_name: "Maria Silva Santos",
    status: "producao",
    total: 1489.0,
    discount: 0,
    items: [
      {
        id: "i1",
        sale_id: "1",
        description: "Armação Ray-Ban RB5228",
        quantity: 1,
        unit_price: 599,
        total: 599,
      },
      {
        id: "i2",
        sale_id: "1",
        description: "Lente Varilux Comfort 1.67",
        quantity: 1,
        unit_price: 890,
        total: 890,
      },
    ],
    created_at: "2025-06-20T10:00:00Z",
    delivery_date: "2025-06-28",
  },
  {
    id: "2",
    client_id: "2",
    client_name: "João Pedro Oliveira",
    status: "orcamento",
    total: 750.0,
    discount: 0,
    items: [
      {
        id: "i3",
        sale_id: "2",
        description: "Armação + lente básica",
        quantity: 1,
        unit_price: 750,
        total: 750,
      },
    ],
    created_at: "2025-06-22T14:00:00Z",
  },
];

export const demoFinancialAccounts: FinancialAccount[] = [
  {
    id: "fa1",
    type: "receber",
    client_id: "1",
    client_name: "Maria Silva Santos",
    sale_id: "1",
    description: "Venda #1 — Armação + Lente Varilux",
    amount: 1489.0,
    due_date: "2025-07-05",
    status: "pendente",
    created_at: "2025-06-20T10:00:00Z",
  },
  {
    id: "fa2",
    type: "receber",
    client_id: "2",
    client_name: "João Pedro Oliveira",
    description: "Parcela 1/3 — Armação + lente básica",
    amount: 250.0,
    due_date: "2025-06-15",
    status: "vencido",
    created_at: "2025-06-01T10:00:00Z",
  },
  {
    id: "fa3",
    type: "pagar",
    description: "Fornecedor Essilor — lentes oftálmicas",
    amount: 3200.0,
    due_date: "2025-07-10",
    status: "pendente",
    created_at: "2025-06-18T09:00:00Z",
  },
  {
    id: "fa4",
    type: "pagar",
    description: "Aluguel da loja — Junho/2025",
    amount: 4500.0,
    due_date: "2025-06-10",
    paid_date: "2025-06-10",
    status: "pago",
    payment_method: "PIX",
    created_at: "2025-06-01T08:00:00Z",
  },
  {
    id: "fa5",
    type: "receber",
    client_id: "3",
    client_name: "Ana Carolina Mendes",
    description: "Venda à vista — Lentes de contato",
    amount: 380.0,
    due_date: "2025-06-20",
    paid_date: "2025-06-20",
    status: "pago",
    payment_method: "Cartão de crédito",
    created_at: "2025-06-20T14:00:00Z",
  },
];

export const demoServiceOrders: ServiceOrder[] = [
  {
    id: "so1",
    sale_id: "1",
    client_name: "Maria Silva Santos",
    sale_total: 1489.0,
    status: "producao",
    lab_name: "Essilor Lab",
    expected_date: "2025-06-28",
    notes: "Lente Varilux 1.67 — tratamento antirreflexo",
    created_at: "2025-06-20T11:00:00Z",
  },
  {
    id: "so2",
    sale_id: "2",
    client_name: "João Pedro Oliveira",
    sale_total: 750.0,
    status: "aberta",
    lab_name: "Laboratório próprio",
    expected_date: "2025-07-02",
    notes: "Armação + lente básica CR-39",
    created_at: "2025-06-22T15:00:00Z",
  },
  {
    id: "so3",
    client_name: "Ana Carolina Mendes",
    status: "pronta",
    lab_name: "Hoya Optical",
    expected_date: "2025-06-18",
    notes: "Lentes de contato mensais — reposição",
    created_at: "2025-06-10T09:00:00Z",
  },
];

export const demoAppointments: Appointment[] = [
  {
    id: "ap1",
    client_id: "1",
    client_name: "Maria Silva Santos",
    professional_id: "u1",
    professional_name: "Dr. Ricardo Alves",
    appointment_type: "Consulta optométrica",
    scheduled_at: "2025-06-26T09:00:00Z",
    duration_minutes: 30,
    status: "confirmado",
    notes: "Retorno — verificar adaptação das lentes",
    created_at: "2025-06-20T10:00:00Z",
  },
  {
    id: "ap2",
    client_id: "2",
    client_name: "João Pedro Oliveira",
    professional_id: "u2",
    professional_name: "Dra. Fernanda Costa",
    appointment_type: "Exame de acuidade visual",
    scheduled_at: "2025-06-26T14:30:00Z",
    duration_minutes: 45,
    status: "agendado",
    created_at: "2025-06-22T11:00:00Z",
  },
  {
    id: "ap3",
    client_id: "3",
    client_name: "Ana Carolina Mendes",
    professional_id: "u1",
    professional_name: "Dr. Ricardo Alves",
    appointment_type: "Adaptação de lente de contato",
    scheduled_at: "2025-06-27T10:00:00Z",
    duration_minutes: 60,
    status: "agendado",
    notes: "Primeira adaptação — trazer lentes atuais",
    created_at: "2025-06-24T09:00:00Z",
  },
  {
    id: "ap4",
    client_id: "1",
    client_name: "Maria Silva Santos",
    professional_id: "u2",
    professional_name: "Dra. Fernanda Costa",
    appointment_type: "Consulta optométrica",
    scheduled_at: "2025-06-24T16:00:00Z",
    duration_minutes: 30,
    status: "realizado",
    created_at: "2025-06-18T08:00:00Z",
  },
];
