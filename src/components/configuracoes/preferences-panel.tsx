"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { AppPreferences } from "@/lib/types";
import { loadPreferences, savePreferences } from "@/lib/settings-store";
import { DURATION_OPTIONS } from "@/lib/clinic";
import { Sliders, Loader2, Save } from "lucide-react";

export function PreferencesPanel() {
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences().then(setPrefs);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    setSaving(true);
    await savePreferences(prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!prefs) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando preferências...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Preferências do sistema
        </CardTitle>
        <CardDescription>
          Configurações salvas localmente neste navegador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Duração padrão de consultas
            </label>
            <select
              value={String(prefs.default_appointment_duration)}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  default_appointment_duration: parseInt(e.target.value, 10),
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.low_stock_alert}
              onChange={(e) =>
                setPrefs({ ...prefs, low_stock_alert: e.target.checked })
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">
              Exibir alertas de estoque baixo
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={prefs.auto_confirm_appointments}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  auto_confirm_appointments: e.target.checked,
                })
              }
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">
              Confirmar agendamentos automaticamente
            </span>
          </label>

          <Input
            label="Horário de funcionamento"
            value={prefs.business_hours ?? ""}
            onChange={(e) =>
              setPrefs({ ...prefs, business_hours: e.target.value })
            }
            placeholder="Seg–Sex 9h–18h | Sáb 9h–13h"
          />

          <Textarea
            label="Rodapé de receitas e documentos"
            value={prefs.receipt_footer ?? ""}
            onChange={(e) =>
              setPrefs({ ...prefs, receipt_footer: e.target.value })
            }
            placeholder="Texto exibido no final dos documentos impressos"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar preferências
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600">Salvo com sucesso!</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
