export interface EyeRefraction {
  esf: string;
  cil: string;
  eixo: string;
  add: string;
}

export interface AnamnesisExams {
  acuidade_visual: {
    od_sc: string;
    oe_sc: string;
    od_cc: string;
    oe_cc: string;
    ao_sc: string;
    ao_cc: string;
    tipo_teste: string;
    distancia: string;
    observacoes: string;
  };
  lensometria: {
    od: string;
    oe: string;
  };
  auto_refrator: {
    od: EyeRefraction;
    oe: EyeRefraction;
  };
  refracao_subjetiva: {
    od: EyeRefraction;
    oe: EyeRefraction;
    dp: string;
    dnp_od: string;
    dnp_oe: string;
  };
  ceratometria: {
    od_k1: string;
    od_k2: string;
    od_eixo: string;
    oe_k1: string;
    oe_k2: string;
    oe_eixo: string;
  };
  tonometria: {
    od_mmhg: string;
    oe_mmhg: string;
    metodo: string;
    horario: string;
    observacoes: string;
  };
  biomicroscopia: {
    od: string;
    oe: string;
    observacoes: string;
  };
  fundoscopia: {
    od: string;
    oe: string;
    observacoes: string;
  };
  motilidade_ocular: {
    od: string;
    oe: string;
    observacoes: string;
  };
  cover_test: {
    distancia: string;
    perto: string;
    observacoes: string;
  };
  hirschberg: string;
  pupilas: {
    od_tamanho: string;
    oe_tamanho: string;
    simetria: string;
    reflexos: string;
    observacoes: string;
  };
  campo_visual: {
    od: string;
    oe: string;
    metodo: string;
    observacoes: string;
  };
  teste_cores: {
    ishihara_od: string;
    ishihara_oe: string;
    observacoes: string;
  };
  teste_contraste: {
    od: string;
    oe: string;
    observacoes: string;
  };
  filme_lacrimal: {
    od_schirmer: string;
    oe_schirmer: string;
    od_but: string;
    oe_but: string;
    observacoes: string;
  };
  acomodacao: {
    od_aa: string;
    oe_aa: string;
    od_ar: string;
    oe_ar: string;
    observacoes: string;
  };
  foria: {
    distancia_horizontal: string;
    distancia_vertical: string;
    perto_horizontal: string;
    perto_vertical: string;
    observacoes: string;
  };
  estereopsia: string;
  sensibilidade_desfoque: string;
}

export interface StructuredAnamnesis {
  id: string;
  client_id: string;
  client_name?: string;
  appointment_id?: string;
  exam_date: string;
  optometrist?: string;
  register_number?: string;
  professional_id?: string;
  horario_entrada?: string;
  horario_saida?: string;

  sexo?: string;
  profissao?: string;
  escolaridade?: string;

  queixa_principal: string;
  sintomas: string[];
  tempo_sintomas?: string;
  historia_doenca_atual?: string;

  doencas_sistemicas: string[];
  medicamentos_uso: string;
  alergias: string;
  historico_familiar: string;
  tabagismo?: string;
  etilismo?: string;
  gestante?: boolean;

  uso_oculos: boolean;
  uso_lente_contato: boolean;
  tempo_uso_lentes?: string;
  tipo_lente_atual?: string;
  cirurgias_oculares: string;
  traumatismos_oculares?: string;
  doencas_oculares: string[];
  ultimo_exame_oftalmo?: string;
  grau_atual_od?: string;
  grau_atual_oe?: string;

  tempo_tela_horas?: string;
  atividade_profissional?: string;
  uso_protecao_visual?: string;
  atividades_lazer?: string;

  exames: AnamnesisExams;

  conclusao?: string;
  conduta?: string;
  encaminhamento_especialidade?: string;
  encaminhamento_motivo?: string;
  encaminhamento_urgencia?: string;
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
  "Lacrimejamento",
  "Sensação de corpo estranho",
  "Olho seco",
  "Visão noturna ruim",
  "Halos / glare",
] as const;

export const DOENCAS_SISTEMICAS_OPCOES = [
  "Diabetes",
  "Hipertensão",
  "Glaucoma (familiar)",
  "Doenças autoimunes",
  "Hipotireoidismo",
  "Asma / rinite",
  "Doença cardiovascular",
  "Artrite reumatoide",
  "Lúpus",
  "HIV/AIDS",
  "Epilepsia",
  "Doença renal",
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
  "Pterígio",
  "Blefarite",
  "Conjuntivite crônica",
  "Degeneração macular",
  "Retinopatia diabética",
] as const;

export const TIPOS_TESTE_ACUIDADE = [
  "Snellen",
  "LogMAR",
  "ETDRS",
  "Tumbling E",
  "Lea",
  "Jaeger (perto)",
] as const;

export const METODOS_TONOMETRIA = [
  "Tonômetro de sopro",
  "Aplanação",
  "iCare",
  "Palpação",
] as const;

export const ANAMNESIS_EXAM_SECTIONS = [
  { id: "acuidade_visual", label: "Acuidade visual" },
  { id: "lensometria", label: "Lensometria" },
  { id: "auto_refrator", label: "Auto-refrator" },
  { id: "refracao_subjetiva", label: "Refração subjetiva" },
  { id: "ceratometria", label: "Ceratometria" },
  { id: "tonometria", label: "Tonometria (PIO)" },
  { id: "biomicroscopia", label: "Biomicroscopia" },
  { id: "fundoscopia", label: "Fundoscopia" },
  { id: "motilidade_ocular", label: "Motilidade ocular" },
  { id: "cover_test", label: "Cover test" },
  { id: "hirschberg", label: "Hirschberg" },
  { id: "pupilas", label: "Pupilas" },
  { id: "campo_visual", label: "Campo visual" },
  { id: "teste_cores", label: "Teste de cores" },
  { id: "teste_contraste", label: "Sensibilidade ao contraste" },
  { id: "filme_lacrimal", label: "Filme lacrimal (Schirmer/BUT)" },
  { id: "acomodacao", label: "Acomodação" },
  { id: "foria", label: "Foria / Phoria" },
  { id: "estereopsia", label: "Estereopsia" },
  { id: "sensibilidade_desfoque", label: "Sensibilidade ao desfoque" },
] as const;

function emptyRefraction(): EyeRefraction {
  return { esf: "", cil: "", eixo: "", add: "" };
}

export function createEmptyExams(): AnamnesisExams {
  return {
    acuidade_visual: {
      od_sc: "",
      oe_sc: "",
      od_cc: "",
      oe_cc: "",
      ao_sc: "",
      ao_cc: "",
      tipo_teste: "Snellen",
      distancia: "6 metros",
      observacoes: "",
    },
    lensometria: { od: "", oe: "" },
    auto_refrator: { od: emptyRefraction(), oe: emptyRefraction() },
    refracao_subjetiva: {
      od: emptyRefraction(),
      oe: emptyRefraction(),
      dp: "",
      dnp_od: "",
      dnp_oe: "",
    },
    ceratometria: {
      od_k1: "",
      od_k2: "",
      od_eixo: "",
      oe_k1: "",
      oe_k2: "",
      oe_eixo: "",
    },
    tonometria: {
      od_mmhg: "",
      oe_mmhg: "",
      metodo: "",
      horario: "",
      observacoes: "",
    },
    biomicroscopia: { od: "", oe: "", observacoes: "" },
    fundoscopia: { od: "", oe: "", observacoes: "" },
    motilidade_ocular: { od: "", oe: "", observacoes: "" },
    cover_test: { distancia: "", perto: "", observacoes: "" },
    hirschberg: "",
    pupilas: {
      od_tamanho: "",
      oe_tamanho: "",
      simetria: "",
      reflexos: "",
      observacoes: "",
    },
    campo_visual: { od: "", oe: "", metodo: "", observacoes: "" },
    teste_cores: { ishihara_od: "", ishihara_oe: "", observacoes: "" },
    teste_contraste: { od: "", oe: "", observacoes: "" },
    filme_lacrimal: {
      od_schirmer: "",
      oe_schirmer: "",
      od_but: "",
      oe_but: "",
      observacoes: "",
    },
    acomodacao: {
      od_aa: "",
      oe_aa: "",
      od_ar: "",
      oe_ar: "",
      observacoes: "",
    },
    foria: {
      distancia_horizontal: "",
      distancia_vertical: "",
      perto_horizontal: "",
      perto_vertical: "",
      observacoes: "",
    },
    estereopsia: "",
    sensibilidade_desfoque: "",
  };
}

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
    exames: createEmptyExams(),
    observacoes: "",
    created_at: now,
  };
}

/** Garante compatibilidade com fichas salvas antes da expansão dos exames. */
export function normalizeAnamnesis(
  record: Partial<StructuredAnamnesis> & Pick<StructuredAnamnesis, "id" | "client_id">,
): StructuredAnamnesis {
  const base = createEmptyAnamnesis(record.client_id, record.client_name);
  const empty = createEmptyExams();
  const incoming = record.exames;

  return {
    ...base,
    ...record,
    exames: incoming
      ? {
          ...empty,
          ...incoming,
          acuidade_visual: { ...empty.acuidade_visual, ...(incoming.acuidade_visual ?? {}) },
          lensometria: { ...empty.lensometria, ...(incoming.lensometria ?? {}) },
          auto_refrator: {
            od: { ...empty.auto_refrator.od, ...incoming.auto_refrator?.od },
            oe: { ...empty.auto_refrator.oe, ...incoming.auto_refrator?.oe },
          },
          refracao_subjetiva: {
            ...empty.refracao_subjetiva,
            ...(incoming.refracao_subjetiva ?? {}),
            od: {
              ...empty.refracao_subjetiva.od,
              ...incoming.refracao_subjetiva?.od,
            },
            oe: {
              ...empty.refracao_subjetiva.oe,
              ...incoming.refracao_subjetiva?.oe,
            },
          },
          ceratometria: { ...empty.ceratometria, ...(incoming.ceratometria ?? {}) },
          tonometria: { ...empty.tonometria, ...(incoming.tonometria ?? {}) },
          biomicroscopia: { ...empty.biomicroscopia, ...(incoming.biomicroscopia ?? {}) },
          fundoscopia: { ...empty.fundoscopia, ...(incoming.fundoscopia ?? {}) },
          motilidade_ocular: {
            ...empty.motilidade_ocular,
            ...(incoming.motilidade_ocular ?? {}),
          },
          cover_test: { ...empty.cover_test, ...(incoming.cover_test ?? {}) },
          hirschberg: incoming.hirschberg ?? "",
          pupilas: { ...empty.pupilas, ...(incoming.pupilas ?? {}) },
          campo_visual: { ...empty.campo_visual, ...(incoming.campo_visual ?? {}) },
          teste_cores: { ...empty.teste_cores, ...(incoming.teste_cores ?? {}) },
          teste_contraste: { ...empty.teste_contraste, ...(incoming.teste_contraste ?? {}) },
          filme_lacrimal: { ...empty.filme_lacrimal, ...(incoming.filme_lacrimal ?? {}) },
          acomodacao: { ...empty.acomodacao, ...(incoming.acomodacao ?? {}) },
          foria: { ...empty.foria, ...(incoming.foria ?? {}) },
          estereopsia: incoming.estereopsia ?? "",
          sensibilidade_desfoque: incoming.sensibilidade_desfoque ?? "",
        }
      : empty,
  };
}

export function anamnesisSummary(record: StructuredAnamnesis): string {
  const parts: string[] = [];
  if (record.queixa_principal) parts.push(record.queixa_principal);
  if (record.sintomas.length) parts.push(record.sintomas.join(", "));
  if (record.doencas_oculares.length) {
    parts.push(`Ocular: ${record.doencas_oculares.join(", ")}`);
  }
  const av = record.exames?.acuidade_visual;
  if (av?.od_sc || av?.oe_sc) {
    parts.push(`AV OD ${av.od_sc || "—"} / OE ${av.oe_sc || "—"}`);
  }
  return parts.join(" · ") || "Ficha de exame registrada";
}

export function formatRefractionShort(r: EyeRefraction): string {
  const parts: string[] = [];
  if (r.esf) parts.push(`Esf ${r.esf}`);
  if (r.cil) parts.push(`Cil ${r.cil}`);
  if (r.eixo) parts.push(`Eixo ${r.eixo}°`);
  if (r.add) parts.push(`Add ${r.add}`);
  return parts.length ? parts.join(" | ") : "—";
}
