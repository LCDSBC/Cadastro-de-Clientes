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
