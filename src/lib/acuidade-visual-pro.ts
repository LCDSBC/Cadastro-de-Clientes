// Acuidade Visual Pró — JL Soluções Digitais
// Software de optometria com testes de acuidade visual e emissão de prontuários

export type DocumentType =
  | "receita_oculos"
  | "ficha_clinica"
  | "laudo_acuidade"
  | "declaracao_comparecimento"
  | "guia_encaminhamento";

export interface DocumentTemplate {
  type: DocumentType;
  name: string;
  description: string;
  icon: string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    type: "receita_oculos",
    name: "Laudo Optométrico",
    description: "Laudo optométrico com prescrição oftálmica para OD e OE",
    icon: "Glasses",
  },
  {
    type: "ficha_clinica",
    name: "Ficha Clínica",
    description: "Registro completo do atendimento optométrico",
    icon: "ClipboardList",
  },
  {
    type: "laudo_acuidade",
    name: "Laudo de Acuidade Visual",
    description: "Documento formal com resultado dos testes de visão",
    icon: "FileCheck",
  },
  {
    type: "declaracao_comparecimento",
    name: "Declaração de Comparecimento",
    description: "Comprovante de presença do paciente na consulta",
    icon: "FileSignature",
  },
  {
    type: "guia_encaminhamento",
    name: "Guia de Encaminhamento",
    description: "Encaminhamento para oftalmologista ou especialista",
    icon: "Send",
  },
];

export interface ClinicalRecord {
  id: string;
  client_id: string;
  client_name: string;
  document_type: DocumentType;
  exam_date: string;
  optometrist: string;
  acuity_result_od?: string;
  acuity_result_oe?: string;
  notes?: string;
  created_at: string;
}

export const demoClinicalRecords: ClinicalRecord[] = [
  {
    id: "1",
    client_id: "1",
    client_name: "Maria Silva Santos",
    document_type: "laudo_acuidade",
    exam_date: "2025-06-20",
    optometrist: "Dr. Ricardo Alves",
    acuity_result_od: "20/20",
    acuity_result_oe: "20/25",
    notes: "Paciente com acuidade visual dentro da normalidade",
    created_at: "2025-06-20T10:30:00Z",
  },
  {
    id: "2",
    client_id: "2",
    client_name: "João Pedro Oliveira",
    document_type: "receita_oculos",
    exam_date: "2025-06-15",
    optometrist: "Dr. Ricardo Alves",
    created_at: "2025-06-15T14:00:00Z",
  },
];

export const ACUIDADE_VISUAL_PRO = {
  name: "Acuidade Visual Pró",
  vendor: "JL Soluções Digitais",
  description:
    "Software para optometristas com testes de acuidade visual digitais e emissão de prontuários profissionais",
} as const;
