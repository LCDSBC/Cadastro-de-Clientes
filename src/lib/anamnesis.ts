export interface StructuredAnamnesis {
  id: string;
  client_id: string;
  client_name?: string;
  appointment_id?: string;
  exam_date: string;
  optometrist?: string;

  queixa_principal: string;
  sintomas: string[];
  tempo_sintomas?: string;

  doencas_sistemicas: string[];
  medicamentos_uso: string;
  alergias: string;
  historico_familiar: string;

  uso_oculos: boolean;
  uso_lente_contato: boolean;
  tempo_uso_lentes?: string;
  cirurgias_oculares: string;
  doencas_oculares: string[];
  ultimo_exame_oftalmo?: string;

  tempo_tela_horas?: string;
  atividade_profissional?: string;
  observacoes?: string;

  created_at: string;
  updated_at?: string;
}

export const SINTOMAS_OPCOES = [
  "Visão embaçada",
  "Dor ocular",
  "Ardência / ressecamento",
  "Cefaleia",
  "Fotofobia",
  "Diplopia",
  "Moscas volantes",
  "Coceira",
  "Vermelhidão",
] as const;

export const DOENCAS_SISTEMICAS_OPCOES = [
  "Diabetes",
  "Hipertensão",
  "Glaucoma (familiar)",
  "Doenças autoimunes",
  "Hipotireoidismo",
  "Asma / rinite",
] as const;

export const DOENCAS_OCULARES_OPCOES = [
  "Miopia",
  "Hipermetropia",
  "Astigmatismo",
  "Presbiopia",
  "Catarata",
  "Glaucoma",
  "Estrabismo",
  "Ceratocone",
  "Ambliopia",
] as const;

export function createEmptyAnamnesis(
  clientId: string,
  clientName?: string,
): StructuredAnamnesis {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    client_id: clientId,
    client_name: clientName,
    exam_date: now.slice(0, 10),
    queixa_principal: "",
    sintomas: [],
    doencas_sistemicas: [],
    medicamentos_uso: "",
    alergias: "",
    historico_familiar: "",
    uso_oculos: false,
    uso_lente_contato: false,
    cirurgias_oculares: "",
    doencas_oculares: [],
    observacoes: "",
    created_at: now,
  };
}

export function anamnesisSummary(record: StructuredAnamnesis): string {
  const parts: string[] = [];
  if (record.queixa_principal) parts.push(record.queixa_principal);
  if (record.sintomas.length) parts.push(record.sintomas.join(", "));
  if (record.doencas_oculares.length) {
    parts.push(`Ocular: ${record.doencas_oculares.join(", ")}`);
  }
  return parts.join(" · ") || "Anamnese registrada";
}
