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
