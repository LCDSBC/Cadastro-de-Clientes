import type { DocumentType } from "./acuidade-visual-pro";

export interface ClinicInfo {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

export interface PatientInfo {
  name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  address: string;
}

export interface RefractionData {
  od_esf: string;
  od_cil: string;
  od_eixo: string;
  od_add: string;
  oe_esf: string;
  oe_cil: string;
  oe_eixo: string;
  oe_add: string;
  dp: string;
}

export interface DocumentFormData {
  document_type: DocumentType;
  exam_date: string;
  valid_until: string;
  optometrist: string;
  register_number: string;
  professional_id?: string;
  clinic: ClinicInfo;
  patient: PatientInfo;
  refraction: RefractionData;
  lens_type: string;
  acuity_od_sc: string;
  acuity_oe_sc: string;
  acuity_od_cc: string;
  acuity_oe_cc: string;
  test_distance: string;
  test_type: string;
  queixa_principal: string;
  anamnese: string;
  historico_ocular: string;
  biomicroscopia: string;
  tonometria: string;
  conclusao: string;
  horario_entrada: string;
  horario_saida: string;
  especialidade_destino: string;
  motivo_encaminhamento: string;
  observacoes: string;
}

export const defaultClinic: ClinicInfo = {
  name: "Ótica OptiCare",
  cnpj: "12.345.678/0001-90",
  address: "Rua das Flores, 123 — Centro",
  city: "São Paulo",
  state: "SP",
  phone: "(11) 3333-4444",
};

export function createDefaultFormData(type: DocumentType): DocumentFormData {
  const today = new Date().toISOString().split("T")[0];
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return {
    document_type: type,
    exam_date: today,
    valid_until: validUntil.toISOString().split("T")[0],
    optometrist: "Dr. Ricardo Alves",
    register_number: "CBO 3223-05",
    clinic: { ...defaultClinic },
    patient: {
      name: "",
      cpf: "",
      birth_date: "",
      phone: "",
      address: "",
    },
    refraction: {
      od_esf: "",
      od_cil: "",
      od_eixo: "",
      od_add: "",
      oe_esf: "",
      oe_cil: "",
      oe_eixo: "",
      oe_add: "",
      dp: "",
    },
    lens_type: "Multifocal",
    acuity_od_sc: "20/40",
    acuity_oe_sc: "20/40",
    acuity_od_cc: "20/20",
    acuity_oe_cc: "20/20",
    test_distance: "3 metros",
    test_type: "Snellen",
    queixa_principal: "",
    anamnese: "",
    historico_ocular: "",
    biomicroscopia: "Sem alterações",
    tonometria: "",
    conclusao: "Paciente apresenta acuidade visual compatível com a faixa etária.",
    horario_entrada: "09:00",
    horario_saida: "09:45",
    especialidade_destino: "Oftalmologia",
    motivo_encaminhamento: "",
    observacoes: "",
  };
}

export function formatRefractionLine(
  esf: string,
  cil: string,
  eixo: string,
  add?: string,
): string {
  const parts: string[] = [];
  if (esf) parts.push(`Esf: ${esf}`);
  if (cil) parts.push(`Cil: ${cil}`);
  if (eixo) parts.push(`Eixo: ${eixo}°`);
  if (add) parts.push(`Adição: ${add}`);
  return parts.length > 0 ? parts.join(" | ") : "—";
}
