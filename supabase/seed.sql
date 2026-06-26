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
