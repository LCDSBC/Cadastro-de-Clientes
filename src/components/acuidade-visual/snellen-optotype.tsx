"use client";

import {
  snellenFontSizePx,
  snellenLetterGapPx,
  snellenLetterHeightPx,
  type SnellenCalibration,
} from "@/lib/snellen-calibration";
import type { TestDistance } from "@/lib/acuity-visual";

interface SnellenOptotypeProps {
  letters: string;
  acuity: string;
  distanceM: TestDistance;
  calibration: SnellenCalibration;
  /** 1 = tamanho clínico real; <1 apenas na pré-visualização embutida */
  scale?: number;
  className?: string;
  textClassName?: string;
  showMeta?: boolean;
}

export function SnellenOptotype({
  letters,
  acuity,
  distanceM,
  calibration,
  scale = 1,
  className = "",
  textClassName = "text-white",
  showMeta = true,
}: SnellenOptotypeProps) {
  const denominator = Number.parseInt(acuity.split("/")[1] ?? "20", 10);
  const fontSize = snellenFontSizePx(distanceM, denominator, calibration.pixelsPerMm) * scale;
  const letterHeight = snellenLetterHeightPx(distanceM, denominator, calibration.pixelsPerMm) * scale;
  const gap = snellenLetterGapPx(letterHeight);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-center" style={{ gap }}>
        {letters.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`snellen-optotype font-bold ${textClassName}`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1,
              width: `${letterHeight}px`,
              textAlign: "center",
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      {showMeta && (
        <p className="mt-6 text-sm text-slate-500">
          {acuity} — {distanceM} m
          {scale < 1 ? " · pré-visualização reduzida" : ""}
        </p>
      )}
    </div>
  );
}
