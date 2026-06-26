-- OptiCare ERP - Schema completo para óticas
-- Inspirado em SavWin WEB + Acuidade Visual Pró (JL Soluções Digitais)

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lojas / Filiais
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state CHAR(2),
  zip_code VARCHAR(10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuários do sistema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'vendedor', -- admin, gerente, vendedor, optometrista
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  state CHAR(2),
  zip_code VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receitas oftálmicas
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  od_esf DECIMAL(5,2),
  od_cil DECIMAL(5,2),
  od_eixo INTEGER,
  od_add DECIMAL(4,2),
  oe_esf DECIMAL(5,2),
  oe_cil DECIMAL(5,2),
  oe_eixo INTEGER,
  oe_add DECIMAL(4,2),
  dp INTEGER,
  optometrist VARCHAR(255),
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exames de acuidade visual (Acuidade Visual Pró)
CREATE TABLE acuity_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  store_id UUID REFERENCES stores(id),
  test_type VARCHAR(50) NOT NULL, -- snellen, ishihara, etdrs, jaeger, infantil, estereopsia, ofuscamento
  distance_meters INTEGER NOT NULL, -- 2, 3, 4, 6
  eye VARCHAR(2) NOT NULL, -- OD, OE, AO
  result_acuity VARCHAR(20),
  result_logmar VARCHAR(10),
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos (armações, lentes, etc.)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- armacao, lente, lente_contato, acessorio, solar
  brand VARCHAR(100),
  cost_price DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, sku)
);

-- Grade de lentes (estoque em grade - SavWin)
CREATE TABLE lens_grid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  esf DECIMAL(5,2) NOT NULL,
  cil DECIMAL(5,2) DEFAULT 0,
  eixo INTEGER,
  quantity INTEGER DEFAULT 0,
  UNIQUE(product_id, esf, cil, eixo)
);

-- Vendas / Orçamentos
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  client_id UUID REFERENCES clients(id),
  seller_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'orcamento', -- orcamento, aprovado, producao, entregue, cancelado
  total DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  description VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL
);

-- Ordens de serviço (laboratório)
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id),
  store_id UUID REFERENCES stores(id),
  status VARCHAR(20) DEFAULT 'aberta', -- aberta, producao, pronta, entregue
  lab_name VARCHAR(255),
  expected_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financeiro - Contas
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  type VARCHAR(10) NOT NULL, -- receber, pagar
  client_id UUID REFERENCES clients(id),
  sale_id UUID REFERENCES sales(id),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, vencido, cancelado
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agenda de consultas (clínica)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  client_id UUID REFERENCES clients(id),
  professional_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'agendado', -- agendado, confirmado, realizado, cancelado
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clients_store ON clients(store_id);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_acuity_exams_client ON acuity_exams(client_id);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_financial_due ON financial_accounts(due_date);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);

-- RLS (Row Level Security) - habilitar por store_id
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE acuity_exams ENABLE ROW LEVEL SECURITY;
