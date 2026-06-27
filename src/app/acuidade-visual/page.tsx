"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, Input } from "@/components/ui/input";
import {
  acuityTests,
  snellenChart,
  ishiharaPlates,
  etdrsChart,
  infantilSymbols,
  getDistanceLabel,
  getAcuityResultAtRow,
  type TestDistance,
  type AcuityTestType,
} from "@/lib/acuity-visual";
import {
  loadSnellenCalibration,
  previewScaleForFontSize,
  snellenFontSizePx,
  formatLetterSizeLabel,
  type SnellenCalibration,
} from "@/lib/snellen-calibration";
import { SnellenOptotype } from "@/components/acuidade-visual/snellen-optotype";
import { SnellenCalibrationPanel } from "@/components/acuidade-visual/snellen-calibration-panel";
import { ACUIDADE_VISUAL_PRO } from "@/lib/acuidade-visual-pro";
import { ProntuariosPanel } from "@/components/prontuarios/prontuarios-panel";
import { ProfessionalSelect } from "@/components/profissionais/professional-select";
import { loadClients } from "@/lib/clients-store";
import { loadAcuityExams, saveAcuityExam } from "@/lib/acuity-exams-store";
import type { AcuityExam, Client } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Monitor,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
  Loader2,
  History,
} from "lucide-react";

type Tab = "testes" | "prontuarios";

function AcuidadeVisualContent() {
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client_id") ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("testes");
  const [selectedTest, setSelectedTest] = useState<AcuityTestType>("snellen");
  const [distance, setDistance] = useState<TestDistance>(6);
  const [currentRow, setCurrentRow] = useState(2);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [eye, setEye] = useState<"OD" | "OE" | "AO">("OD");
  const [displayMode, setDisplayMode] = useState(false);
  const [glareMode, setGlareMode] = useState(false);
  const [calibration, setCalibration] = useState<SnellenCalibration>(() =>
    loadSnellenCalibration(),
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(preselectedClient);
  const [professionalId, setProfessionalId] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [examNotes, setExamNotes] = useState("");
  const [recentExams, setRecentExams] = useState<AcuityExam[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const testConfig = acuityTests.find((t) => t.type === selectedTest)!;
  const currentResult = getAcuityResultAtRow(
    selectedTest,
    currentRow,
    currentPlate,
  );

  useEffect(() => {
    loadClients().then(({ clients: data }) => {
      setClients(data);
      if (preselectedClient && data.some((c) => c.id === preselectedClient)) {
        setClientId(preselectedClient);
      }
    });
  }, [preselectedClient]);

  useEffect(() => {
    if (!clientId) {
      setRecentExams([]);
      return;
    }
    void loadAcuityExams(clientId).then(setRecentExams);
  }, [clientId]);

  const handleSaveResult = async () => {
    if (!clientId) {
      setSaveMsg("Selecione o paciente antes de salvar.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    const client = clients.find((c) => c.id === clientId);
    const saved = await saveAcuityExam({
      client_id: clientId,
      client_name: client?.name,
      test_type: selectedTest,
      distance_meters: distance,
      eye,
      result_acuity: currentResult.acuity,
      result_logmar: currentResult.logMAR,
      chart_row: currentResult.chartRow,
      notes: examNotes.trim() || undefined,
      performed_by: performedBy.trim() || undefined,
    });
    setRecentExams((prev) => [saved, ...prev]);
    setSaveMsg(`Salvo: ${currentResult.acuity} (${eye})`);
    setSaving(false);
  };

  const renderSnellenDisplay = (fullscreen = false) => {
    const row = snellenChart[currentRow];
    const fontSize = snellenFontSizePx(
      distance,
      row.denominator,
      calibration.pixelsPerMm,
    );
    const scale = fullscreen ? 1 : previewScaleForFontSize(fontSize * 1.2, 280);

    return (
      <div
        className={`flex min-h-[60vh] flex-col items-center justify-center bg-black transition-all ${
          glareMode ? "brightness-150" : ""
        } ${fullscreen ? "min-h-screen" : ""}`}
      >
        <SnellenOptotype
          letters={row.letters}
          acuity={row.acuity}
          distanceM={distance}
          calibration={calibration}
          scale={scale}
          showMeta
        />
        <p className="mt-2 text-xs text-slate-500">
          logMAR {row.logMAR} ·{" "}
          {formatLetterSizeLabel(distance, row.denominator, calibration.pixelsPerMm)}
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

  const renderETDRSDisplay = (fullscreen = false) => {
    const row = etdrsChart[currentRow] ?? etdrsChart[0];
    const fontSize = snellenFontSizePx(
      distance,
      row.denominator,
      calibration.pixelsPerMm,
    );
    const scale = fullscreen ? 1 : previewScaleForFontSize(fontSize * 1.2, 280);

    return (
      <div
        className={`flex min-h-[60vh] flex-col items-center justify-center bg-black ${
          fullscreen ? "min-h-screen" : ""
        }`}
      >
        <SnellenOptotype
          letters={row.letters.replace(/\s+/g, "")}
          acuity={row.acuity}
          distanceM={distance}
          calibration={calibration}
          scale={scale}
        />
        <p className="mt-2 text-xs text-slate-500">
          logMAR {row.logMAR} · ETDRS
        </p>
      </div>
    );
  };

  const renderInfantilDisplay = (fullscreen = false) => {
    const row = snellenChart[Math.min(currentRow, snellenChart.length - 1)];
    const symbols = infantilSymbols.slice(0, row.letters.length);
    const fontSize = snellenFontSizePx(
      distance,
      row.denominator,
      calibration.pixelsPerMm,
    );
    const scale = fullscreen ? 1 : previewScaleForFontSize(fontSize * 1.2, 280);
    const gap = fontSize * scale * 0.5;

    return (
      <div
        className={`flex min-h-[60vh] flex-col items-center justify-center bg-sky-100 ${
          fullscreen ? "min-h-screen" : ""
        }`}
      >
        <div className="flex items-center" style={{ gap }}>
          {symbols.map((symbol, index) => (
            <span
              key={index}
              className="leading-none text-slate-900"
              style={{ fontSize: `${fontSize * scale}px` }}
            >
              {symbol}
            </span>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-600">{row.acuity}</p>
      </div>
    );
  };

  const renderDisplay = (fullscreen = false) => {
    switch (selectedTest) {
      case "ishihara":
        return renderIshiharaDisplay();
      case "etdrs":
        return renderETDRSDisplay(fullscreen);
      case "infantil":
        return renderInfantilDisplay(fullscreen);
      default:
        return renderSnellenDisplay(fullscreen);
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
            onClick={() => {
              if (selectedTest === "ishihara") {
                setCurrentPlate(Math.max(0, currentPlate - 1));
              } else {
                setCurrentRow(Math.max(0, currentRow - 1));
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 bg-black/50 text-white"
            onClick={() => {
              if (selectedTest === "ishihara") {
                setCurrentPlate(Math.min(maxRows, currentPlate + 1));
              } else {
                setCurrentRow(Math.min(maxRows, currentRow + 1));
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {renderDisplay(true)}
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={ACUIDADE_VISUAL_PRO.name}
        description={`${ACUIDADE_VISUAL_PRO.vendor} — Testes de acuidade visual e histórico do paciente`}
        actions={
          activeTab === "testes" ? (
            <Button onClick={() => setDisplayMode(true)}>
              <Maximize2 className="h-4 w-4" />
              Modo TV / Monitor
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("testes")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "testes"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Testes de Visão
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("prontuarios")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "prontuarios"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Prontuários
        </button>
      </div>

      {activeTab === "prontuarios" ? (
        <ProntuariosPanel />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do exame</CardTitle>
                <CardDescription>
                  Paciente, teste, distância e olho avaliado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Paciente"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  options={[
                    { value: "", label: "Selecione o paciente..." },
                    ...clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
                {clientId && (
                  <Link
                    href={`/anamnese?client_id=${clientId}`}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Abrir anamnese do paciente
                  </Link>
                )}
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
                  onChange={(e) =>
                    setDistance(Number(e.target.value) as TestDistance)
                  }
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
                <ProfessionalSelect
                  label="Profissional"
                  value={professionalId}
                  autoDefault
                  onChange={(id, pro) => {
                    setProfessionalId(id);
                    setPerformedBy(pro?.name ?? "");
                  }}
                />
                <Input
                  label="Observações"
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                />
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-slate-500">Resultado atual</p>
                  <p className="font-semibold text-slate-900">
                    {currentResult.acuity} · logMAR {currentResult.logMAR}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => void handleSaveResult()}
                    disabled={saving || !clientId}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar resultado
                  </Button>
                </div>
                {saveMsg && (
                  <p className="text-sm text-emerald-600">{saveMsg}</p>
                )}
              </CardContent>
            </Card>

            {clientId && recentExams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4" />
                    Histórico de testes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentExams.slice(0, 8).map((ex) => (
                    <div
                      key={ex.id}
                      className="rounded border border-slate-100 p-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">
                          {ex.test_type} · {ex.eye}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(ex.performed_at.slice(0, 10))}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {ex.result_acuity}
                        {ex.result_logmar && ` (${ex.result_logmar})`}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <SnellenCalibrationPanel
              distanceM={distance}
              onCalibrationChange={setCalibration}
            />

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
                <Badge variant="success">Calibrado · {distance} m</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {renderDisplay(false)}
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
                        <th className="pb-2 pr-4">Altura ({distance} m)</th>
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
                            <td className="py-2 pr-4 text-xs text-slate-500">
                              {formatLetterSizeLabel(
                                distance,
                                row.denominator,
                                calibration.pixelsPerMm,
                              )}
                            </td>
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
      )}
    </AppShell>
  );
}

export default function AcuidadeVisualPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </AppShell>
      }
    >
      <AcuidadeVisualContent />
    </Suspense>
  );
}
