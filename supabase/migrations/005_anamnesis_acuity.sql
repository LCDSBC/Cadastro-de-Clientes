-- Anamnese estruturada (OptiCare)
CREATE TABLE IF NOT EXISTS anamnesis_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  exam_date DATE NOT NULL,
  optometrist VARCHAR(255),
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anamnesis_client ON anamnesis_records(client_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_date ON anamnesis_records(exam_date DESC);

ALTER TABLE anamnesis_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnesis_select" ON anamnesis_records FOR SELECT USING (true);
CREATE POLICY "anamnesis_insert" ON anamnesis_records FOR INSERT WITH CHECK (true);
CREATE POLICY "anamnesis_update" ON anamnesis_records FOR UPDATE USING (true);
CREATE POLICY "anamnesis_delete" ON anamnesis_records FOR DELETE USING (true);

-- Vínculo opcional appointment em acuity_exams (se coluna não existir)
ALTER TABLE acuity_exams ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;
