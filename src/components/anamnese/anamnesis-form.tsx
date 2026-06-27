"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import type { StructuredAnamnesis, AnamnesisExams } from "@/lib/anamnesis";
import {
  SINTOMAS_OPCOES,
  DOENCAS_SISTEMICAS_OPCOES,
  DOENCAS_OCULARES_OPCOES,
  TIPOS_TESTE_ACUIDADE,
  METODOS_TONOMETRIA,
  createEmptyAnamnesis,
  normalizeAnamnesis,
} from "@/lib/anamnesis";
import { saveAnamnesisRecord } from "@/lib/anamnesis-store";
import { loadStoreSettings } from "@/lib/settings-store";
import type { Client } from "@/lib/types";
import {
  CheckboxChips,
  ExamObservations,
  EyePairFields,
  RefractionFields,
} from "./anamnesis-exam-fields";
import { AnamnesisPrint } from "./anamnesis-print";
import { Loader2, Printer, Save } from "lucide-react";

interface AnamnesisFormProps {
  clientId: string;
  clientName: string;
  client?: Client | null;
  initial?: StructuredAnamnesis;
  onSaved?: (record: StructuredAnamnesis) => void;
}

type FormTab = "anamnese" | "exames" | "conclusao" | "impressao";

const TABS: { id: FormTab; label: string }[] = [
  { id: "anamnese", label: "Anamnese" },
  { id: "exames", label: "Exames clínicos" },
  { id: "conclusao", label: "Conclusão" },
  { id: "impressao", label: "Impressão" },
];

export function AnamnesisForm({
  clientId,
  clientName,
  client,
  initial,
  onSaved,
}: AnamnesisFormProps) {
  const [form, setForm] = useState<StructuredAnamnesis>(() =>
    normalizeAnamnesis(initial ?? createEmptyAnamnesis(clientId, clientName)),
  );
  const [store, setStore] = useState<Awaited<ReturnType<typeof loadStoreSettings>>["store"] | null>(null);
  const [activeTab, setActiveTab] = useState<FormTab>("anamnese");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStoreSettings().then(({ store: s }) => setStore(s));
  }, []);

  useEffect(() => {
    setForm(normalizeAnamnesis(initial ?? createEmptyAnamnesis(clientId, clientName)));
    setActiveTab("anamnese");
    setMsg("");
  }, [initial, clientId, clientName]);

  function updateExams<K extends keyof AnamnesisExams>(
    key: K,
    value: AnamnesisExams[K],
  ) {
    setForm((prev) => ({
      ...prev,
      exames: { ...prev.exames, [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await saveAnamnesisRecord(
      normalizeAnamnesis({
        ...form,
        client_id: clientId,
        client_name: clientName,
      }),
    );
    setMsg("Ficha salva com sucesso.");
    onSaved?.(saved);
    setSaving(false);
  }

  function handlePrint() {
    window.print();
  }

  const ex = form.exames;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "anamnese" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do atendimento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Data do exame"
                type="date"
                required
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
              <Input
                label="Optometrista"
                value={form.optometrist ?? ""}
                onChange={(e) => setForm({ ...form, optometrist: e.target.value })}
              />
              <Input
                label="Registro profissional"
                value={form.register_number ?? ""}
                onChange={(e) => setForm({ ...form, register_number: e.target.value })}
                placeholder="CBO / CRO / registro"
              />
              <Input
                label="Horário de entrada"
                type="time"
                value={form.horario_entrada ?? ""}
                onChange={(e) => setForm({ ...form, horario_entrada: e.target.value })}
              />
              <Input
                label="Horário de saída"
                type="time"
                value={form.horario_saida ?? ""}
                onChange={(e) => setForm({ ...form, horario_saida: e.target.value })}
              />
              <Select
                label="Sexo"
                value={form.sexo ?? ""}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                options={[
                  { value: "", label: "—" },
                  { value: "Feminino", label: "Feminino" },
                  { value: "Masculino", label: "Masculino" },
                  { value: "Outro", label: "Outro" },
                ]}
              />
              <Input
                label="Profissão"
                value={form.profissao ?? ""}
                onChange={(e) => setForm({ ...form, profissao: e.target.value })}
              />
              <Input
                label="Escolaridade"
                value={form.escolaridade ?? ""}
                onChange={(e) => setForm({ ...form, escolaridade: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queixa e sintomas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Queixa principal"
                required
                value={form.queixa_principal}
                onChange={(e) => setForm({ ...form, queixa_principal: e.target.value })}
                placeholder="Descreva o motivo da consulta..."
              />
              <Input
                label="Tempo dos sintomas"
                value={form.tempo_sintomas ?? ""}
                onChange={(e) => setForm({ ...form, tempo_sintomas: e.target.value })}
              />
              <Textarea
                label="História da doença atual (HDA)"
                value={form.historia_doenca_atual ?? ""}
                onChange={(e) => setForm({ ...form, historia_doenca_atual: e.target.value })}
              />
              <CheckboxChips
                label="Sintomas"
                options={SINTOMAS_OPCOES}
                selected={form.sintomas}
                onChange={(sintomas) => setForm({ ...form, sintomas })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CheckboxChips
                label="Doenças sistêmicas"
                options={DOENCAS_SISTEMICAS_OPCOES}
                selected={form.doencas_sistemicas}
                onChange={(doencas_sistemicas) => setForm({ ...form, doencas_sistemicas })}
                color="amber"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Medicamentos em uso"
                  value={form.medicamentos_uso}
                  onChange={(e) => setForm({ ...form, medicamentos_uso: e.target.value })}
                />
                <Input
                  label="Alergias"
                  value={form.alergias}
                  onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                />
                <Input
                  label="Tabagismo"
                  value={form.tabagismo ?? ""}
                  onChange={(e) => setForm({ ...form, tabagismo: e.target.value })}
                  placeholder="Ex: Não fumante, 10 cigarros/dia..."
                />
                <Input
                  label="Etilismo"
                  value={form.etilismo ?? ""}
                  onChange={(e) => setForm({ ...form, etilismo: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.gestante ?? false}
                  onChange={(e) => setForm({ ...form, gestante: e.target.checked })}
                />
                Gestante
              </label>
              <Textarea
                label="Histórico familiar"
                value={form.historico_familiar}
                onChange={(e) => setForm({ ...form, historico_familiar: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico ocular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.uso_oculos}
                    onChange={(e) => setForm({ ...form, uso_oculos: e.target.checked })}
                  />
                  Usa óculos
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.uso_lente_contato}
                    onChange={(e) => setForm({ ...form, uso_lente_contato: e.target.checked })}
                  />
                  Usa lente de contato
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Tempo de uso de correção"
                  value={form.tempo_uso_lentes ?? ""}
                  onChange={(e) => setForm({ ...form, tempo_uso_lentes: e.target.value })}
                />
                <Input
                  label="Tipo de lente atual"
                  value={form.tipo_lente_atual ?? ""}
                  onChange={(e) => setForm({ ...form, tipo_lente_atual: e.target.value })}
                />
                <Input
                  label="Grau atual OD"
                  value={form.grau_atual_od ?? ""}
                  onChange={(e) => setForm({ ...form, grau_atual_od: e.target.value })}
                />
                <Input
                  label="Grau atual OE"
                  value={form.grau_atual_oe ?? ""}
                  onChange={(e) => setForm({ ...form, grau_atual_oe: e.target.value })}
                />
              </div>
              <CheckboxChips
                label="Condições oculares"
                options={DOENCAS_OCULARES_OPCOES}
                selected={form.doencas_oculares}
                onChange={(doencas_oculares) => setForm({ ...form, doencas_oculares })}
                color="blue"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Cirurgias oculares"
                  value={form.cirurgias_oculares}
                  onChange={(e) => setForm({ ...form, cirurgias_oculares: e.target.value })}
                />
                <Input
                  label="Traumatismos oculares"
                  value={form.traumatismos_oculares ?? ""}
                  onChange={(e) => setForm({ ...form, traumatismos_oculares: e.target.value })}
                />
                <Input
                  label="Último exame oftalmológico"
                  type="date"
                  value={form.ultimo_exame_oftalmo ?? ""}
                  onChange={(e) => setForm({ ...form, ultimo_exame_oftalmo: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hábitos visuais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Tempo de tela (h/dia)"
                value={form.tempo_tela_horas ?? ""}
                onChange={(e) => setForm({ ...form, tempo_tela_horas: e.target.value })}
              />
              <Input
                label="Atividade profissional"
                value={form.atividade_profissional ?? ""}
                onChange={(e) => setForm({ ...form, atividade_profissional: e.target.value })}
              />
              <Input
                label="Uso de proteção visual"
                value={form.uso_protecao_visual ?? ""}
                onChange={(e) => setForm({ ...form, uso_protecao_visual: e.target.value })}
                placeholder="Óculos de proteção, filtro azul..."
              />
              <Input
                label="Atividades de lazer"
                value={form.atividades_lazer ?? ""}
                onChange={(e) => setForm({ ...form, atividades_lazer: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "exames" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Acuidade visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                labelOd="OD sem correção"
                labelOe="OE sem correção"
                od={ex.acuidade_visual.od_sc}
                oe={ex.acuidade_visual.oe_sc}
                onOdChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, od_sc: v })}
                onOeChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, oe_sc: v })}
                placeholder="20/20"
              />
              <EyePairFields
                labelOd="OD com correção"
                labelOe="OE com correção"
                od={ex.acuidade_visual.od_cc}
                oe={ex.acuidade_visual.oe_cc}
                onOdChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, od_cc: v })}
                onOeChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, oe_cc: v })}
              />
              <EyePairFields
                labelOd="AO sem correção"
                labelOe="AO com correção"
                od={ex.acuidade_visual.ao_sc}
                oe={ex.acuidade_visual.ao_cc}
                onOdChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, ao_sc: v })}
                onOeChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, ao_cc: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Tipo de teste"
                  value={ex.acuidade_visual.tipo_teste}
                  onChange={(e) => updateExams("acuidade_visual", { ...ex.acuidade_visual, tipo_teste: e.target.value })}
                  options={TIPOS_TESTE_ACUIDADE.map((t) => ({ value: t, label: t }))}
                />
                <Input
                  label="Distância"
                  value={ex.acuidade_visual.distancia}
                  onChange={(e) => updateExams("acuidade_visual", { ...ex.acuidade_visual, distancia: e.target.value })}
                />
              </div>
              <ExamObservations
                value={ex.acuidade_visual.observacoes}
                onChange={(v) => updateExams("acuidade_visual", { ...ex.acuidade_visual, observacoes: v })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lensometria</CardTitle></CardHeader>
            <CardContent>
              <EyePairFields
                od={ex.lensometria.od}
                oe={ex.lensometria.oe}
                onOdChange={(v) => updateExams("lensometria", { ...ex.lensometria, od: v })}
                onOeChange={(v) => updateExams("lensometria", { ...ex.lensometria, oe: v })}
                placeholder="Grau medido na armação"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Auto-refrator</CardTitle></CardHeader>
            <CardContent>
              <RefractionFields
                od={ex.auto_refrator.od}
                oe={ex.auto_refrator.oe}
                onOdChange={(od) => updateExams("auto_refrator", { ...ex.auto_refrator, od })}
                onOeChange={(oe) => updateExams("auto_refrator", { ...ex.auto_refrator, oe })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Refração subjetiva</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RefractionFields
                od={ex.refracao_subjetiva.od}
                oe={ex.refracao_subjetiva.oe}
                onOdChange={(od) => updateExams("refracao_subjetiva", { ...ex.refracao_subjetiva, od })}
                onOeChange={(oe) => updateExams("refracao_subjetiva", { ...ex.refracao_subjetiva, oe })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="DP (mm)"
                  value={ex.refracao_subjetiva.dp}
                  onChange={(e) => updateExams("refracao_subjetiva", { ...ex.refracao_subjetiva, dp: e.target.value })}
                />
                <Input
                  label="DNP OD"
                  value={ex.refracao_subjetiva.dnp_od}
                  onChange={(e) => updateExams("refracao_subjetiva", { ...ex.refracao_subjetiva, dnp_od: e.target.value })}
                />
                <Input
                  label="DNP OE"
                  value={ex.refracao_subjetiva.dnp_oe}
                  onChange={(e) => updateExams("refracao_subjetiva", { ...ex.refracao_subjetiva, dnp_oe: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ceratometria</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Input label="OD K1" value={ex.ceratometria.od_k1} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, od_k1: e.target.value })} />
              <Input label="OD K2" value={ex.ceratometria.od_k2} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, od_k2: e.target.value })} />
              <Input label="OD Eixo" value={ex.ceratometria.od_eixo} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, od_eixo: e.target.value })} />
              <Input label="OE K1" value={ex.ceratometria.oe_k1} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, oe_k1: e.target.value })} />
              <Input label="OE K2" value={ex.ceratometria.oe_k2} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, oe_k2: e.target.value })} />
              <Input label="OE Eixo" value={ex.ceratometria.oe_eixo} onChange={(e) => updateExams("ceratometria", { ...ex.ceratometria, oe_eixo: e.target.value })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tonometria (PIO)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                labelOd="OD (mmHg)"
                labelOe="OE (mmHg)"
                od={ex.tonometria.od_mmhg}
                oe={ex.tonometria.oe_mmhg}
                onOdChange={(v) => updateExams("tonometria", { ...ex.tonometria, od_mmhg: v })}
                onOeChange={(v) => updateExams("tonometria", { ...ex.tonometria, oe_mmhg: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Método"
                  value={ex.tonometria.metodo}
                  onChange={(e) => updateExams("tonometria", { ...ex.tonometria, metodo: e.target.value })}
                  options={[
                    { value: "", label: "—" },
                    ...METODOS_TONOMETRIA.map((m) => ({ value: m, label: m })),
                  ]}
                />
                <Input
                  label="Horário"
                  type="time"
                  value={ex.tonometria.horario}
                  onChange={(e) => updateExams("tonometria", { ...ex.tonometria, horario: e.target.value })}
                />
              </div>
              <ExamObservations value={ex.tonometria.observacoes} onChange={(v) => updateExams("tonometria", { ...ex.tonometria, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Biomicroscopia (lâmpada de fenda)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                od={ex.biomicroscopia.od}
                oe={ex.biomicroscopia.oe}
                onOdChange={(v) => updateExams("biomicroscopia", { ...ex.biomicroscopia, od: v })}
                onOeChange={(v) => updateExams("biomicroscopia", { ...ex.biomicroscopia, oe: v })}
                placeholder="Córnea, íris, cristalino..."
              />
              <ExamObservations value={ex.biomicroscopia.observacoes} onChange={(v) => updateExams("biomicroscopia", { ...ex.biomicroscopia, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Fundoscopia / Mapeamento de retina</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                od={ex.fundoscopia.od}
                oe={ex.fundoscopia.oe}
                onOdChange={(v) => updateExams("fundoscopia", { ...ex.fundoscopia, od: v })}
                onOeChange={(v) => updateExams("fundoscopia", { ...ex.fundoscopia, oe: v })}
              />
              <ExamObservations value={ex.fundoscopia.observacoes} onChange={(v) => updateExams("fundoscopia", { ...ex.fundoscopia, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Motilidade ocular</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                od={ex.motilidade_ocular.od}
                oe={ex.motilidade_ocular.oe}
                onOdChange={(v) => updateExams("motilidade_ocular", { ...ex.motilidade_ocular, od: v })}
                onOeChange={(v) => updateExams("motilidade_ocular", { ...ex.motilidade_ocular, oe: v })}
                placeholder="Versões, restrições..."
              />
              <ExamObservations value={ex.motilidade_ocular.observacoes} onChange={(v) => updateExams("motilidade_ocular", { ...ex.motilidade_ocular, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Cover test</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="À distância" value={ex.cover_test.distancia} onChange={(e) => updateExams("cover_test", { ...ex.cover_test, distancia: e.target.value })} />
                <Input label="De perto" value={ex.cover_test.perto} onChange={(e) => updateExams("cover_test", { ...ex.cover_test, perto: e.target.value })} />
              </div>
              <ExamObservations value={ex.cover_test.observacoes} onChange={(v) => updateExams("cover_test", { ...ex.cover_test, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Teste de Hirschberg</CardTitle></CardHeader>
            <CardContent>
              <Input value={ex.hirschberg} onChange={(e) => updateExams("hirschberg", e.target.value)} placeholder="Resultado do reflexo corneano" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pupilas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Tamanho OD" value={ex.pupilas.od_tamanho} onChange={(e) => updateExams("pupilas", { ...ex.pupilas, od_tamanho: e.target.value })} />
                <Input label="Tamanho OE" value={ex.pupilas.oe_tamanho} onChange={(e) => updateExams("pupilas", { ...ex.pupilas, oe_tamanho: e.target.value })} />
                <Input label="Simetria" value={ex.pupilas.simetria} onChange={(e) => updateExams("pupilas", { ...ex.pupilas, simetria: e.target.value })} />
                <Input label="Reflexos" value={ex.pupilas.reflexos} onChange={(e) => updateExams("pupilas", { ...ex.pupilas, reflexos: e.target.value })} placeholder="Fotorreagentes, RAPD..." />
              </div>
              <ExamObservations value={ex.pupilas.observacoes} onChange={(v) => updateExams("pupilas", { ...ex.pupilas, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Campo visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                od={ex.campo_visual.od}
                oe={ex.campo_visual.oe}
                onOdChange={(v) => updateExams("campo_visual", { ...ex.campo_visual, od: v })}
                onOeChange={(v) => updateExams("campo_visual", { ...ex.campo_visual, oe: v })}
              />
              <Input label="Método" value={ex.campo_visual.metodo} onChange={(e) => updateExams("campo_visual", { ...ex.campo_visual, metodo: e.target.value })} placeholder="Confrontação, Humphrey, Goldman..." />
              <ExamObservations value={ex.campo_visual.observacoes} onChange={(v) => updateExams("campo_visual", { ...ex.campo_visual, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Teste de cores (Ishihara)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                labelOd="OD — placas corretas"
                labelOe="OE — placas corretas"
                od={ex.teste_cores.ishihara_od}
                oe={ex.teste_cores.ishihara_oe}
                onOdChange={(v) => updateExams("teste_cores", { ...ex.teste_cores, ishihara_od: v })}
                onOeChange={(v) => updateExams("teste_cores", { ...ex.teste_cores, ishihara_oe: v })}
              />
              <ExamObservations value={ex.teste_cores.observacoes} onChange={(v) => updateExams("teste_cores", { ...ex.teste_cores, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Sensibilidade ao contraste</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                od={ex.teste_contraste.od}
                oe={ex.teste_contraste.oe}
                onOdChange={(v) => updateExams("teste_contraste", { ...ex.teste_contraste, od: v })}
                onOeChange={(v) => updateExams("teste_contraste", { ...ex.teste_contraste, oe: v })}
              />
              <ExamObservations value={ex.teste_contraste.observacoes} onChange={(v) => updateExams("teste_contraste", { ...ex.teste_contraste, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Filme lacrimal (Schirmer / BUT)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                labelOd="Schirmer OD (mm)"
                labelOe="Schirmer OE (mm)"
                od={ex.filme_lacrimal.od_schirmer}
                oe={ex.filme_lacrimal.oe_schirmer}
                onOdChange={(v) => updateExams("filme_lacrimal", { ...ex.filme_lacrimal, od_schirmer: v })}
                onOeChange={(v) => updateExams("filme_lacrimal", { ...ex.filme_lacrimal, oe_schirmer: v })}
              />
              <EyePairFields
                labelOd="BUT OD (s)"
                labelOe="BUT OE (s)"
                od={ex.filme_lacrimal.od_but}
                oe={ex.filme_lacrimal.oe_but}
                onOdChange={(v) => updateExams("filme_lacrimal", { ...ex.filme_lacrimal, od_but: v })}
                onOeChange={(v) => updateExams("filme_lacrimal", { ...ex.filme_lacrimal, oe_but: v })}
              />
              <ExamObservations value={ex.filme_lacrimal.observacoes} onChange={(v) => updateExams("filme_lacrimal", { ...ex.filme_lacrimal, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Acomodação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EyePairFields
                labelOd="Amplitude acomodativa OD"
                labelOe="Amplitude acomodativa OE"
                od={ex.acomodacao.od_aa}
                oe={ex.acomodacao.oe_aa}
                onOdChange={(v) => updateExams("acomodacao", { ...ex.acomodacao, od_aa: v })}
                onOeChange={(v) => updateExams("acomodacao", { ...ex.acomodacao, oe_aa: v })}
              />
              <EyePairFields
                labelOd="Acomodação relativa OD"
                labelOe="Acomodação relativa OE"
                od={ex.acomodacao.od_ar}
                oe={ex.acomodacao.oe_ar}
                onOdChange={(v) => updateExams("acomodacao", { ...ex.acomodacao, od_ar: v })}
                onOeChange={(v) => updateExams("acomodacao", { ...ex.acomodacao, oe_ar: v })}
              />
              <ExamObservations value={ex.acomodacao.observacoes} onChange={(v) => updateExams("acomodacao", { ...ex.acomodacao, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Foria / Phoria</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Distância — horizontal" value={ex.foria.distancia_horizontal} onChange={(e) => updateExams("foria", { ...ex.foria, distancia_horizontal: e.target.value })} />
                <Input label="Distância — vertical" value={ex.foria.distancia_vertical} onChange={(e) => updateExams("foria", { ...ex.foria, distancia_vertical: e.target.value })} />
                <Input label="Perto — horizontal" value={ex.foria.perto_horizontal} onChange={(e) => updateExams("foria", { ...ex.foria, perto_horizontal: e.target.value })} />
                <Input label="Perto — vertical" value={ex.foria.perto_vertical} onChange={(e) => updateExams("foria", { ...ex.foria, perto_vertical: e.target.value })} />
              </div>
              <ExamObservations value={ex.foria.observacoes} onChange={(v) => updateExams("foria", { ...ex.foria, observacoes: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Estereopsia</CardTitle></CardHeader>
            <CardContent>
              <Input value={ex.estereopsia} onChange={(e) => updateExams("estereopsia", e.target.value)} placeholder="Ex: 40 seg/arc, Titmus..." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Sensibilidade ao desfoque</CardTitle></CardHeader>
            <CardContent>
              <Input value={ex.sensibilidade_desfoque} onChange={(e) => updateExams("sensibilidade_desfoque", e.target.value)} placeholder="Resultado do teste" />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "conclusao" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conclusão e conduta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Conclusão / Parecer técnico"
              value={form.conclusao ?? ""}
              onChange={(e) => setForm({ ...form, conclusao: e.target.value })}
              rows={4}
            />
            <Textarea
              label="Conduta"
              value={form.conduta ?? ""}
              onChange={(e) => setForm({ ...form, conduta: e.target.value })}
              rows={3}
              placeholder="Prescrição, orientações, retorno..."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Encaminhamento para"
                value={form.encaminhamento_especialidade ?? ""}
                onChange={(e) => setForm({ ...form, encaminhamento_especialidade: e.target.value })}
                placeholder="Oftalmologia, neurologia..."
              />
              <Select
                label="Urgência"
                value={form.encaminhamento_urgencia ?? ""}
                onChange={(e) => setForm({ ...form, encaminhamento_urgencia: e.target.value })}
                options={[
                  { value: "", label: "—" },
                  { value: "Eletivo", label: "Eletivo" },
                  { value: "Prioritário", label: "Prioritário" },
                  { value: "Urgente", label: "Urgente" },
                ]}
              />
            </div>
            <Textarea
              label="Motivo do encaminhamento"
              value={form.encaminhamento_motivo ?? ""}
              onChange={(e) => setForm({ ...form, encaminhamento_motivo: e.target.value })}
            />
            <Textarea
              label="Observações gerais"
              value={form.observacoes ?? ""}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "impressao" && (
        <Card className="overflow-hidden">
          <CardHeader className="no-print">
            <CardTitle className="text-base">Pré-visualização para impressão</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              ref={printRef}
              id="anamnesis-print-area"
              className="overflow-auto bg-slate-100 p-4 print:bg-white print:p-0"
            >
              <AnamnesisPrint record={form} client={client} store={store} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="no-print flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar ficha
        </Button>
        <Button type="button" variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Imprimir ficha
        </Button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
      </div>
    </form>
  );
}
