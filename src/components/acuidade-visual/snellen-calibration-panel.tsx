"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  estimatePixelsPerMm,
  formatLetterSizeLabel,
  loadSnellenCalibration,
  pixelsPerMmFromDiagonal,
  saveSnellenCalibration,
  type SnellenCalibration,
} from "@/lib/snellen-calibration";
import { Ruler, CheckCircle2 } from "lucide-react";

const CREDIT_CARD_WIDTH_MM = 85.6;

interface SnellenCalibrationPanelProps {
  distanceM: number;
  onCalibrationChange: (calibration: SnellenCalibration) => void;
}

export function SnellenCalibrationPanel({
  distanceM,
  onCalibrationChange,
}: SnellenCalibrationPanelProps) {
  const [diagonalInches, setDiagonalInches] = useState("24");
  const [cardScale, setCardScale] = useState(100);
  const [calibration, setCalibration] = useState<SnellenCalibration>(() =>
    loadSnellenCalibration(),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadSnellenCalibration();
    setCalibration(loaded);
    if (loaded.screenDiagonalInches) {
      setDiagonalInches(String(loaded.screenDiagonalInches));
    }
  }, []);

  function applyDiagonal() {
    const inches = Number.parseFloat(diagonalInches.replace(",", "."));
    if (!inches || inches < 10 || inches > 100) return;
    const next: SnellenCalibration = {
      pixelsPerMm: pixelsPerMmFromDiagonal(inches),
      method: "screen",
      screenDiagonalInches: inches,
      updatedAt: new Date().toISOString(),
    };
    setCalibration(next);
    saveSnellenCalibration(next);
    onCalibrationChange(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function applyCardCalibration() {
    const barPx = (200 * cardScale) / 100;
    const ppm = barPx / CREDIT_CARD_WIDTH_MM;
    const next: SnellenCalibration = {
      pixelsPerMm: ppm,
      method: "card",
      updatedAt: new Date().toISOString(),
    };
    setCalibration(next);
    saveSnellenCalibration(next);
    onCalibrationChange(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function resetEstimate() {
    const inches = Number.parseFloat(diagonalInches.replace(",", ".")) || 24;
    const next: SnellenCalibration = {
      pixelsPerMm: estimatePixelsPerMm(inches),
      method: "screen",
      screenDiagonalInches: inches,
      updatedAt: new Date().toISOString(),
    };
    setCalibration(next);
    saveSnellenCalibration(next);
    onCalibrationChange(next);
  }

  const cardBarPx = (200 * cardScale) / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ruler className="h-4 w-4" />
          Calibração da tela
        </CardTitle>
        <CardDescription>
          Ajuste o tamanho real dos optotipos para a distância do exame ({distanceM} m).
          Letra 20/20 ≈{" "}
          {formatLetterSizeLabel(distanceM as 2 | 3 | 4 | 6, 20, calibration.pixelsPerMm)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Diagonal da tela (pol.)"
            type="number"
            min={10}
            max={100}
            step={0.1}
            value={diagonalInches}
            onChange={(e) => setDiagonalInches(e.target.value)}
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={applyDiagonal}>
              Aplicar diagonal
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-sm font-medium text-slate-800">
            Calibrar com cartão de crédito (85,6 mm)
          </p>
          <p className="mb-3 text-xs text-slate-500">
            Segure um cartão na borda da barra e ajuste o controle até coincidir com a largura
            real.
          </p>
          <div
            className="mb-3 h-4 rounded bg-primary-600"
            style={{ width: `${cardBarPx}px`, maxWidth: "100%" }}
          />
          <input
            type="range"
            min={50}
            max={150}
            value={cardScale}
            onChange={(e) => setCardScale(Number(e.target.value))}
            className="mb-3 w-full"
          />
          <Button variant="outline" size="sm" onClick={applyCardCalibration}>
            Salvar calibração do cartão
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Escala: {calibration.pixelsPerMm.toFixed(2)} px/mm
            {calibration.method === "card" ? " (cartão)" : " (tela)"}
          </span>
          <button type="button" className="text-primary-600 hover:underline" onClick={resetEstimate}>
            Restaurar estimativa
          </button>
        </div>

        {saved && (
          <p className="flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Calibração salva. Use o Modo TV/Monitor para o exame.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
