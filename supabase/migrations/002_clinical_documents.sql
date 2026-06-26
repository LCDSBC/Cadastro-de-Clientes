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
