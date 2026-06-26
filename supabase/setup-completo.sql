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
-- Prontuários do Acuidade Visual Pró (JL Soluções Digitais)

CREATE TABLE clinical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id),
  document_type VARCHAR(50) NOT NULL,
  -- receita_oculos, ficha_clinica, laudo_acuidade, declaracao_comparecimento, guia_encaminhamento
  exam_date DATE NOT NULL,
  optometrist VARCHAR(255),
  acuity_result_od VARCHAR(20),
  acuity_result_oe VARCHAR(20),
  content JSONB,
  file_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clinical_docs_client ON clinical_documents(client_id);
CREATE INDEX idx_clinical_docs_type ON clinical_documents(document_type);

ALTER TABLE clinical_documents ENABLE ROW LEVEL SECURITY;
-- Políticas RLS para clinical_documents (desenvolvimento/MVP)
-- Em produção, substituir por políticas baseadas em auth.uid() e store_id

CREATE POLICY "clinical_documents_select" ON clinical_documents
  FOR SELECT USING (true);

CREATE POLICY "clinical_documents_insert" ON clinical_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "clinical_documents_update" ON clinical_documents
  FOR UPDATE USING (true);

CREATE POLICY "clinical_documents_delete" ON clinical_documents
  FOR DELETE USING (true);
-- RLS policies para todas as tabelas do OptiCare ERP (MVP)
-- Em produção: substituir USING (true) por auth.uid() + store_id

-- Clients
CREATE POLICY "clients_select" ON clients FOR SELECT USING (true);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (true);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (true);

-- Prescriptions
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prescriptions_select" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "prescriptions_insert" ON prescriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "prescriptions_update" ON prescriptions FOR UPDATE USING (true);
CREATE POLICY "prescriptions_delete" ON prescriptions FOR DELETE USING (true);

-- Acuity exams
CREATE POLICY "acuity_exams_select" ON acuity_exams FOR SELECT USING (true);
CREATE POLICY "acuity_exams_insert" ON acuity_exams FOR INSERT WITH CHECK (true);
CREATE POLICY "acuity_exams_update" ON acuity_exams FOR UPDATE USING (true);
CREATE POLICY "acuity_exams_delete" ON acuity_exams FOR DELETE USING (true);

-- Stores (leitura pública para MVP)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_select" ON stores FOR SELECT USING (true);
CREATE POLICY "stores_insert" ON stores FOR INSERT WITH CHECK (true);
CREATE POLICY "stores_update" ON stores FOR UPDATE USING (true);

-- Products
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- Sales
CREATE POLICY "sales_select" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (true);
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (true);

-- Sale items
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT USING (true);
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "sale_items_update" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "sale_items_delete" ON sale_items FOR DELETE USING (true);

-- Staff users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (true);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (true);
CREATE POLICY "appointments_delete" ON appointments FOR DELETE USING (true);
-- Dados iniciais para demonstração do OptiCare ERP

INSERT INTO stores (id, name, cnpj, email, phone, address, city, state, zip_code)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Ótica OptiCare Demo',
  '12345678000190',
  'contato@opticare.com.br',
  '1133334444',
  'Rua das Flores, 123 — Centro',
  'São Paulo',
  'SP',
  '01310100'
) ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO users (id, store_id, email, name, role)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'optometrista@opticare.com.br',
  'Dr. Ricardo Alves',
  'optometrista'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (id, store_id, name, cpf, email, phone, birth_date, address, city, state, zip_code, notes)
VALUES
  (
    'c0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Maria Silva Santos',
    '12345678901',
    'maria.silva@email.com',
    '11999887766',
    '1985-03-15',
    'Rua das Flores, 123',
    'São Paulo',
    'SP',
    '01310100',
    'Cliente preferencial'
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'João Pedro Oliveira',
    '98765432100',
    'joao.oliveira@email.com',
    '21988776655',
    '1992-07-22',
    'Av. Brasil, 456',
    'Rio de Janeiro',
    'RJ',
    '20040020',
    NULL
  ),
  (
    'c0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000001',
    'Ana Carolina Mendes',
    '45678912300',
    'ana.mendes@email.com',
    '31977665544',
    '1978-11-08',
    NULL,
    'Belo Horizonte',
    'MG',
    NULL,
    NULL
  )
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO prescriptions (id, client_id, exam_date, od_esf, od_cil, od_eixo, od_add, oe_esf, oe_cil, oe_eixo, oe_add, dp, optometrist, valid_until)
VALUES (
  'd0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '2025-05-20',
  -2.25, -0.75, 180, 1.5,
  -2.00, -0.50, 175, 1.5,
  62,
  'Dr. Ricardo Alves',
  '2026-05-20'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, store_id, sku, name, category, brand, cost_price, sale_price, stock_quantity, min_stock)
VALUES
  (
    'e0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'ARM-001',
    'Armação Ray-Ban RB5228',
    'armacao',
    'Ray-Ban',
    280, 599, 15, 5
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'LEN-001',
    'Lente Varilux Comfort 1.67',
    'lente',
    'Essilor',
    350, 890, 3, 10
  )
ON CONFLICT (store_id, sku) DO NOTHING;
