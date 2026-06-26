-- RLS para financial_accounts
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "financial_accounts_select" ON financial_accounts FOR SELECT USING (true);
CREATE POLICY "financial_accounts_insert" ON financial_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "financial_accounts_update" ON financial_accounts FOR UPDATE USING (true);
CREATE POLICY "financial_accounts_delete" ON financial_accounts FOR DELETE USING (true);
