export type LensGradeClass =
  | "plana"
  | "baixa"
  | "media"
  | "alta"
  | "muito_alta"
  | "especial";

export interface LensGradeResult {
  class: LensGradeClass;
  label: string;
  description: string;
  complexity: number;
}

function absMax(...values: (number | undefined)[]): number {
  return Math.max(
    0,
    ...values.filter((v): v is number => v != null).map((v) => Math.abs(v)),
  );
}

/** Classificação automática de grau (estilo SavWin). */
export function classifyLensGrade(input: {
  esf?: number;
  cil?: number;
  add?: number;
}): LensGradeResult {
  const sphere = absMax(input.esf);
  const cyl = absMax(input.cil);
  const add = absMax(input.add);
  const combined = sphere + cyl * 0.5;

  if (sphere <= 0.25 && cyl <= 0.25 && add <= 0.5) {
    return {
      class: "plana",
      label: "Plana",
      description: "Grau leve — estoque pronta entrega",
      complexity: 1,
    };
  }
  if (combined <= 2 && cyl <= 1) {
    return {
      class: "baixa",
      label: "Baixa",
      description: "Grau baixo — surfassagem simples",
      complexity: 2,
    };
  }
  if (combined <= 4 && cyl <= 2) {
    return {
      class: "media",
      label: "Média",
      description: "Grau médio — laboratório padrão",
      complexity: 3,
    };
  }
  if (combined <= 6 && cyl <= 3) {
    return {
      class: "alta",
      label: "Alta",
      description: "Grau alto — bloco especial",
      complexity: 4,
    };
  }
  if (combined <= 10) {
    return {
      class: "muito_alta",
      label: "Muito alta",
      description: "Grau elevado — laboratório externo",
      complexity: 5,
    };
  }
  return {
    class: "especial",
    label: "Especial",
    description: "Grau especial — consultar laboratório",
    complexity: 6,
  };
}

export function classifyPrescriptionGrade(rx: {
  od_esf?: number;
  od_cil?: number;
  od_add?: number;
  oe_esf?: number;
  oe_cil?: number;
  oe_add?: number;
}): { od: LensGradeResult; oe: LensGradeResult; overall: LensGradeResult } {
  const od = classifyLensGrade({
    esf: rx.od_esf,
    cil: rx.od_cil,
    add: rx.od_add,
  });
  const oe = classifyLensGrade({
    esf: rx.oe_esf,
    cil: rx.oe_cil,
    add: rx.oe_add,
  });
  const overall =
    od.complexity >= oe.complexity ? od : oe;
  return { od, oe, overall };
}

export const LENS_GRADE_COLORS: Record<LensGradeClass, string> = {
  plana: "text-emerald-700 bg-emerald-50",
  baixa: "text-blue-700 bg-blue-50",
  media: "text-amber-700 bg-amber-50",
  alta: "text-orange-700 bg-orange-50",
  muito_alta: "text-red-700 bg-red-50",
  especial: "text-purple-700 bg-purple-50",
};
