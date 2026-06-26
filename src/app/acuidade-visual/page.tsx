"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import {
  acuityTests,
  snellenChart,
  ishiharaPlates,
  etdrsChart,
  infantilSymbols,
  getDistanceLabel,
  type TestDistance,
  type AcuityTestType,
} from "@/lib/acuity-visual";
import {
  Monitor,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
} from "lucide-react";

export default function AcuidadeVisualPage() {
  const [selectedTest, setSelectedTest] = useState<AcuityTestType>("snellen");
  const [distance, setDistance] = useState<TestDistance>(3);
  const [currentRow, setCurrentRow] = useState(2);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [eye, setEye] = useState<"OD" | "OE" | "AO">("OD");
  const [displayMode, setDisplayMode] = useState(false);
  const [glareMode, setGlareMode] = useState(false);

  const testConfig = acuityTests.find((t) => t.type === selectedTest)!;

  const renderSnellenDisplay = () => {
    const row = snellenChart[currentRow];
    return (
      <div
        className={`flex min-h-[60vh] flex-col items-center justify-center bg-black transition-all ${
          glareMode ? "brightness-150" : ""
        }`}
      >
        <div
          className="font-bold tracking-[0.3em] text-white"
          style={{ fontSize: `${row.sizePercent * 0.8}vmin` }}
        >
          {row.letters.split("").join(" ")}
        </div>
        <p className="mt-8 text-sm text-slate-500">
          {row.acuity} — logMAR {row.logMAR}
        </p>
      </div>
    );
  };

  const renderIshiharaDisplay = () => {
    const plate = ishiharaPlates[currentPlate];
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-neutral-800">
        <div
          className="flex h-64 w-64 items-center justify-center rounded-full sm:h-80 sm:w-80"
          style={{
            background: `radial-gradient(circle, ${plate.colors[0]} 0%, ${plate.colors[1]} 50%, ${plate.colors[2]} 100%)`,
          }}
        >
          <span className="text-6xl font-bold text-black/20 sm:text-8xl">
            {plate.answer}
          </span>
        </div>
        <p className="mt-6 text-sm text-slate-400">Placa {plate.number}</p>
      </div>
    );
  };

  const renderETDRSDisplay = () => {
    const row = etdrsChart[currentRow] ?? etdrsChart[0];
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-black">
        <div
          className="font-bold tracking-[0.5em] text-white"
          style={{ fontSize: `${row.sizePercent * 0.7}vmin` }}
        >
          {row.letters}
        </div>
        <p className="mt-8 text-sm text-slate-500">
          {row.acuity} — logMAR {row.logMAR}
        </p>
      </div>
    );
  };

  const renderInfantilDisplay = () => {
    const row = snellenChart[Math.min(currentRow, snellenChart.length - 1)];
    const symbols = infantilSymbols.slice(0, row.letters.length);
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-sky-100">
        <div
          className="flex gap-8"
          style={{ fontSize: `${row.sizePercent * 1.2}vmin` }}
        >
          {symbols.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-600">{row.acuity}</p>
      </div>
    );
  };

  const renderDisplay = () => {
    switch (selectedTest) {
      case "ishihara":
        return renderIshiharaDisplay();
      case "etdrs":
        return renderETDRSDisplay();
      case "infantil":
        return renderInfantilDisplay();
      case "snellen":
      case "jaeger":
      case "ofuscamento":
      case "estereopsia":
      default:
        return renderSnellenDisplay();
    }
  };

  const maxRows =
    selectedTest === "etdrs"
      ? etdrsChart.length - 1
      : selectedTest === "ishihara"
        ? ishiharaPlates.length - 1
        : snellenChart.length - 1;

  if (displayMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-black/50 text-white"
            onClick={() => setGlareMode(!glareMode)}
          >
            {glareMode ? "Desligar ofuscamento" : "Ofuscamento"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-black/50 text-white"
            onClick={() => setDisplayMode(false)}
          >
            Sair da tela cheia
          </Button>
        </div>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-black/50 text-white"
            onClick={() => setCurrentRow(Math.max(0, currentRow - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-black/50 text-white"
            onClick={() => setCurrentRow(Math.min(maxRows, currentRow + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {renderDisplay()}
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Acuidade Visual Digital"
        description="Sistema de testes de visão com optótipos calibrados — Snellen, Ishihara, ETDRS e mais"
        actions={
          <Button onClick={() => setDisplayMode(true)}>
            <Maximize2 className="h-4 w-4" />
            Modo TV / Monitor
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do exame</CardTitle>
              <CardDescription>
                Selecione o teste, distância e olho avaliado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Tipo de teste"
                value={selectedTest}
                onChange={(e) => {
                  setSelectedTest(e.target.value as AcuityTestType);
                  setCurrentRow(0);
                  setCurrentPlate(0);
                }}
                options={acuityTests.map((t) => ({
                  value: t.type,
                  label: t.name,
                }))}
              />

              <Select
                label="Distância"
                value={distance.toString()}
                onChange={(e) => setDistance(Number(e.target.value) as TestDistance)}
                options={testConfig.distances.map((d) => ({
                  value: d.toString(),
                  label: getDistanceLabel(d),
                }))}
              />

              <Select
                label="Olho"
                value={eye}
                onChange={(e) => setEye(e.target.value as "OD" | "OE" | "AO")}
                options={[
                  { value: "OD", label: "OD — Olho Direito" },
                  { value: "OE", label: "OE — Olho Esquerdo" },
                  { value: "AO", label: "AO — Ambos os olhos" },
                ]}
              />

              <div className="flex gap-2 pt-2">
                <Button className="flex-1">
                  <Save className="h-4 w-4" />
                  Salvar resultado
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testes disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {acuityTests.map((test) => (
                <button
                  key={test.type}
                  type="button"
                  onClick={() => setSelectedTest(test.type)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedTest === test.type
                      ? "border-primary-300 bg-primary-50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-medium text-slate-900">{test.name}</p>
                  <p className="text-xs text-slate-500">{test.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {testConfig.name}
                </CardTitle>
                <CardDescription>
                  {testConfig.description} — {getDistanceLabel(distance)} — {eye}
                </CardDescription>
              </div>
              <Badge variant="success">Calibrado HD</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {renderDisplay()}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedTest === "ishihara") {
                      setCurrentPlate(Math.max(0, currentPlate - 1));
                    } else {
                      setCurrentRow(Math.max(0, currentRow - 1));
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Maior
                </Button>
                <span className="text-sm text-slate-500">
                  Linha {currentRow + 1} de {maxRows + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedTest === "ishihara") {
                      setCurrentPlate(Math.min(maxRows, currentPlate + 1));
                    } else {
                      setCurrentRow(Math.min(maxRows, currentRow + 1));
                    }
                  }}
                >
                  Menor
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Tabela de referência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 pr-4">Acuidade</th>
                      <th className="pb-2 pr-4">logMAR</th>
                      <th className="pb-2">Símbolos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTest === "etdrs" ? etdrsChart : snellenChart).map(
                      (row, i) => (
                        <tr
                          key={row.acuity}
                          className={`border-b border-slate-100 ${
                            i === currentRow ? "bg-primary-50 font-medium" : ""
                          }`}
                        >
                          <td className="py-2 pr-4">{row.acuity}</td>
                          <td className="py-2 pr-4">{row.logMAR}</td>
                          <td className="py-2 font-mono tracking-widest">
                            {row.letters}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
