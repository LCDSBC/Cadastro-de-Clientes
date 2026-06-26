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
