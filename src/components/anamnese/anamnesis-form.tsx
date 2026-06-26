"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import {
  SINTOMAS_OPCOES,
  DOENCAS_SISTEMICAS_OPCOES,
  DOENCAS_OCULARES_OPCOES,
  createEmptyAnamnesis,
} from "@/lib/anamnesis";
import { saveAnamnesisRecord } from "@/lib/anamnesis-store";
import { Loader2, Save } from "lucide-react";

interface AnamnesisFormProps {
  clientId: string;
  clientName: string;
  initial?: StructuredAnamnesis;
  onSaved?: (record: StructuredAnamnesis) => void;
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function AnamnesisForm({
  clientId,
  clientName,
  initial,
  onSaved,
}: AnamnesisFormProps) {
  const [form, setForm] = useState<StructuredAnamnesis>(
    initial ?? createEmptyAnamnesis(clientId, clientName),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await saveAnamnesisRecord({
      ...form,
      client_id: clientId,
      client_name: clientName,
    });
    setMsg("Anamnese salva com sucesso.");
    onSaved?.(saved);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queixa e sintomas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Queixa principal"
            required
            value={form.queixa_principal}
            onChange={(e) =>
              setForm({ ...form, queixa_principal: e.target.value })
            }
            placeholder="Descreva o motivo da consulta..."
          />
          <Input
            label="Tempo dos sintomas"
            value={form.tempo_sintomas ?? ""}
            onChange={(e) =>
              setForm({ ...form, tempo_sintomas: e.target.value })
            }
            placeholder="Ex: 3 meses, desde a infância..."
          />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Sintomas</p>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS_OPCOES.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    form.sintomas.includes(s)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.sintomas.includes(s)}
                    onChange={() =>
                      setForm({
                        ...form,
                        sintomas: toggleInList(form.sintomas, s),
                      })
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Doenças sistêmicas
            </p>
            <div className="flex flex-wrap gap-2">
              {DOENCAS_SISTEMICAS_OPCOES.map((d) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    form.doencas_sistemicas.includes(d)
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.doencas_sistemicas.includes(d)}
                    onChange={() =>
                      setForm({
                        ...form,
                        doencas_sistemicas: toggleInList(
                          form.doencas_sistemicas,
                          d,
                        ),
                      })
                    }
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <Input
            label="Medicamentos em uso"
            value={form.medicamentos_uso}
            onChange={(e) =>
              setForm({ ...form, medicamentos_uso: e.target.value })
            }
          />
          <Input
            label="Alergias"
            value={form.alergias}
            onChange={(e) => setForm({ ...form, alergias: e.target.value })}
          />
          <Textarea
            label="Histórico familiar"
            value={form.historico_familiar}
            onChange={(e) =>
              setForm({ ...form, historico_familiar: e.target.value })
            }
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
                onChange={(e) =>
                  setForm({ ...form, uso_oculos: e.target.checked })
                }
              />
              Usa óculos
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.uso_lente_contato}
                onChange={(e) =>
                  setForm({ ...form, uso_lente_contato: e.target.checked })
                }
              />
              Usa lente de contato
            </label>
          </div>
          <Input
            label="Tempo de uso de correção"
            value={form.tempo_uso_lentes ?? ""}
            onChange={(e) =>
              setForm({ ...form, tempo_uso_lentes: e.target.value })
            }
          />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Condições oculares
            </p>
            <div className="flex flex-wrap gap-2">
              {DOENCAS_OCULARES_OPCOES.map((d) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    form.doencas_oculares.includes(d)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.doencas_oculares.includes(d)}
                    onChange={() =>
                      setForm({
                        ...form,
                        doencas_oculares: toggleInList(
                          form.doencas_oculares,
                          d,
                        ),
                      })
                    }
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <Input
            label="Cirurgias oculares"
            value={form.cirurgias_oculares}
            onChange={(e) =>
              setForm({ ...form, cirurgias_oculares: e.target.value })
            }
          />
          <Input
            label="Último exame oftalmológico"
            type="date"
            value={form.ultimo_exame_oftalmo ?? ""}
            onChange={(e) =>
              setForm({ ...form, ultimo_exame_oftalmo: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hábitos e complementos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tempo de tela (h/dia)"
            value={form.tempo_tela_horas ?? ""}
            onChange={(e) =>
              setForm({ ...form, tempo_tela_horas: e.target.value })
            }
          />
          <Input
            label="Atividade profissional"
            value={form.atividade_profissional ?? ""}
            onChange={(e) =>
              setForm({ ...form, atividade_profissional: e.target.value })
            }
          />
          <Input
            label="Data do atendimento"
            type="date"
            required
            value={form.exam_date}
            onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
          />
          <Input
            label="Optometrista"
            value={form.optometrist ?? ""}
            onChange={(e) =>
              setForm({ ...form, optometrist: e.target.value })
            }
          />
          <Textarea
            label="Observações"
            className="sm:col-span-2"
            value={form.observacoes ?? ""}
            onChange={(e) =>
              setForm({ ...form, observacoes: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar anamnese
        </Button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
      </div>
    </form>
  );
}
