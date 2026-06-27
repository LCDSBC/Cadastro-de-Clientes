"use client";

import type { TestDistance } from "./acuity-visual";

/** Distância de referência clássica do chart Snellen (6 m). */
export const DESIGN_DISTANCE_M = 6;

/** Ângulo subtendido pela letra 20/20 (5 minutos de arco). */
export const SNELLEN_ARCMIN_AT_20_20 = 5;

/**
 * Relação altura da letra (cap-height) ÷ font-size CSS.
 * Ajustado para fonte monoespaçada em negrito (próximo ao padrão Sloan).
 */
export const SNELLEN_FONT_CAP_RATIO = 0.72;

export const CALIBRATION_STORAGE_KEY = "opticare_snellen_calibration";

export interface SnellenCalibration {
  pixelsPerMm: number;
  method: "screen" | "manual" | "card";
  screenDiagonalInches?: number;
  updatedAt: string;
}

const DEFAULT_DIAGONAL_INCHES = 24;

export function parseSnellenDenominator(acuity: string): number {
  const match = acuity.match(/20\/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 20;
}

/** Altura do optotipo em mm para distância e acuidade dadas. */
export function snellenLetterHeightMm(
  distanceM: number,
  denominator: number,
): number {
  const arcMinutes = SNELLEN_ARCMIN_AT_20_20 * (denominator / 20);
  const arcRadians = (arcMinutes * Math.PI) / (180 * 60);
  return distanceM * 1000 * Math.tan(arcRadians);
}

export function snellenLetterHeightPx(
  distanceM: number,
  denominator: number,
  pixelsPerMm: number,
): number {
  return snellenLetterHeightMm(distanceM, denominator) * pixelsPerMm;
}

export function snellenFontSizePx(
  distanceM: number,
  denominator: number,
  pixelsPerMm: number,
): number {
  const heightPx = snellenLetterHeightPx(distanceM, denominator, pixelsPerMm);
  return heightPx / SNELLEN_FONT_CAP_RATIO;
}

/** Espaçamento entre optotipos ≈ largura da célula Snellen (5× altura do traço). */
export function snellenLetterGapPx(letterHeightPx: number): number {
  return letterHeightPx * 0.85;
}

export function screenCssDiagonalPx(): number {
  if (typeof window === "undefined") return 1100;
  const { width, height } = window.screen;
  return Math.sqrt(width ** 2 + height ** 2);
}

export function pixelsPerMmFromDiagonal(diagonalInches: number): number {
  const diagonalMm = diagonalInches * 25.4;
  return screenCssDiagonalPx() / diagonalMm;
}

export function estimatePixelsPerMm(diagonalInches = DEFAULT_DIAGONAL_INCHES): number {
  return pixelsPerMmFromDiagonal(diagonalInches);
}

export function loadSnellenCalibration(): SnellenCalibration {
  if (typeof window === "undefined") {
    return {
      pixelsPerMm: estimatePixelsPerMm(),
      method: "screen",
      screenDiagonalInches: DEFAULT_DIAGONAL_INCHES,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SnellenCalibration;
      if (parsed.pixelsPerMm > 0) return parsed;
    }
  } catch {
    // fallback abaixo
  }

  return {
    pixelsPerMm: estimatePixelsPerMm(),
    method: "screen",
    screenDiagonalInches: DEFAULT_DIAGONAL_INCHES,
    updatedAt: new Date().toISOString(),
  };
}

export function saveSnellenCalibration(calibration: SnellenCalibration): void {
  localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
}

/** Escala de pré-visualização para caber no card sem alterar o tamanho real no modo TV. */
export function previewScaleForFontSize(
  fontSizePx: number,
  containerMaxPx: number,
): number {
  if (fontSizePx <= 0) return 1;
  return Math.min(1, containerMaxPx / fontSizePx);
}

export function formatLetterSizeLabel(
  distanceM: TestDistance,
  denominator: number,
  pixelsPerMm: number,
): string {
  const mm = snellenLetterHeightMm(distanceM, denominator);
  const px = snellenLetterHeightPx(distanceM, denominator, pixelsPerMm);
  return `${mm.toFixed(1)} mm (${Math.round(px)} px)`;
}
