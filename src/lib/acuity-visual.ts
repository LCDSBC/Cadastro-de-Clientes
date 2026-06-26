// Tipos de teste de acuidade visual — Acuidade Visual Pró (JL Soluções Digitais)

export type TestDistance = 2 | 3 | 4 | 6;

export type AcuityTestType =
  | "snellen"
  | "ishihara"
  | "etdrs"
  | "jaeger"
  | "infantil"
  | "estereopsia"
  | "ofuscamento";

export interface AcuityTestConfig {
  type: AcuityTestType;
  name: string;
  description: string;
  distances: TestDistance[];
  requiresOcclusion: boolean;
}

export const acuityTests: AcuityTestConfig[] = [
  {
    type: "snellen",
    name: "Snellen",
    description: "Teste padrão de acuidade visual com letras optométricas",
    distances: [2, 3, 4, 6],
    requiresOcclusion: true,
  },
  {
    type: "ishihara",
    name: "Ishihara",
    description: "Detecção de daltonismo e deficiências de visão de cores",
    distances: [2, 3],
    requiresOcclusion: false,
  },
  {
    type: "etdrs",
    name: "ETDRS",
    description: "Padrão internacional com logMAR para precisão clínica",
    distances: [2, 3, 4],
    requiresOcclusion: true,
  },
  {
    type: "jaeger",
    name: "Jaeger",
    description: "Avaliação de visão de perto para leitura",
    distances: [2],
    requiresOcclusion: true,
  },
  {
    type: "infantil",
    name: "Infantil / Funcional",
    description: "Figuras e símbolos para crianças e pacientes não alfabetizados",
    distances: [2, 3, 4],
    requiresOcclusion: true,
  },
  {
    type: "estereopsia",
    name: "Estereopsia",
    description: "Avaliação de visão binocular e percepção de profundidade",
    distances: [2, 3],
    requiresOcclusion: false,
  },
  {
    type: "ofuscamento",
    name: "Ofuscamento",
    description: "Teste de sensibilidade ao brilho e ofuscamento",
    distances: [2, 3, 4, 6],
    requiresOcclusion: true,
  },
];

// Tabela Snellen calibrada (tamanho relativo por distância e acuidade)
export interface SnellenRow {
  acuity: string;
  logMAR: string;
  letters: string;
  sizePercent: number;
}

export const snellenChart: SnellenRow[] = [
  { acuity: "20/10", logMAR: "-0.3", letters: "E", sizePercent: 200 },
  { acuity: "20/15", logMAR: "-0.2", letters: "FP", sizePercent: 133 },
  { acuity: "20/20", logMAR: "0.0", letters: "TOZ", sizePercent: 100 },
  { acuity: "20/25", logMAR: "0.1", letters: "LPED", sizePercent: 80 },
  { acuity: "20/30", logMAR: "0.2", letters: "PECF", sizePercent: 67 },
  { acuity: "20/40", logMAR: "0.3", letters: "EDFC", sizePercent: 50 },
  { acuity: "20/50", logMAR: "0.4", letters: "DEFP", sizePercent: 40 },
  { acuity: "20/70", logMAR: "0.5", letters: "FELO", sizePercent: 29 },
  { acuity: "20/100", logMAR: "0.7", letters: "FEDP", sizePercent: 20 },
  { acuity: "20/200", logMAR: "1.0", letters: "E", sizePercent: 10 },
];

export interface IshiharaPlate {
  number: number;
  answer: string;
  description: string;
  colors: string[];
}

export const ishiharaPlates: IshiharaPlate[] = [
  { number: 1, answer: "12", description: "Placa de demonstração", colors: ["#c45c26", "#4a8f3c", "#8b4513"] },
  { number: 2, answer: "8", description: "Número visível para visão normal", colors: ["#d4722a", "#3d7a35", "#6b8e23"] },
  { number: 3, answer: "6", description: "Teste protan/deutan", colors: ["#e07b39", "#2e6b2e", "#a0522d"] },
  { number: 4, answer: "29", description: "Teste de discriminação", colors: ["#cc6633", "#336633", "#996633"] },
  { number: 5, answer: "57", description: "Teste avançado", colors: ["#d4804a", "#2d5a2d", "#8b6914"] },
  { number: 6, answer: "5", description: "Teste simplificado", colors: ["#c95520", "#3a7a3a", "#7a5c2e"] },
];

export interface ETDRSRow {
  acuity: string;
  logMAR: string;
  letters: string;
  sizePercent: number;
}

export const etdrsChart: ETDRSRow[] = [
  { acuity: "20/20", logMAR: "0.0", letters: "D H O V", sizePercent: 100 },
  { acuity: "20/25", logMAR: "0.1", letters: "C Z O S", sizePercent: 80 },
  { acuity: "20/32", logMAR: "0.2", letters: "O N H R", sizePercent: 63 },
  { acuity: "20/40", logMAR: "0.3", letters: "V C S H", sizePercent: 50 },
  { acuity: "20/50", logMAR: "0.4", letters: "D R O C", sizePercent: 40 },
  { acuity: "20/63", logMAR: "0.5", letters: "Z S H N", sizePercent: 32 },
  { acuity: "20/80", logMAR: "0.6", letters: "H O D C", sizePercent: 25 },
  { acuity: "20/100", logMAR: "0.7", letters: "S N V D", sizePercent: 20 },
];

export const infantilSymbols = ["★", "●", "■", "▲", "♥", "◆", "☀", "☂"];

export function getDistanceLabel(distance: TestDistance): string {
  return `${distance} metros`;
}

export function acuityToSnellen(decimal: number): string {
  const denominator = Math.round(20 / decimal);
  return `20/${denominator}`;
}
