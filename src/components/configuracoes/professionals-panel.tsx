"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  loadProfessionals,
  saveProfessional,
  deleteProfessional,
  setDefaultProfessional,
} from "@/lib/professionals-store";
import {
  SPECIALTY_LABELS,
  REGISTER_TYPE_OPTIONS,
  professionalRegisterLabel,
  type Professional,
  type ProfessionalSpecialty,
} from "@/lib/professionals";
import { Check, Pencil, Plus, Star, Trash2, X } from "lucide-react";

const emptyForm = {
  name: "",
  specialty: "optometrista" as ProfessionalSpecialty,
  register_number: "",
  register_type: "CBO 3223-05",
  email: "",
  phone: "",
};

export function ProfessionalsPanel() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    setProfessionals(await loadProfessionals());
  }

  useEffect(() => {
    void refresh();
  }, []);

  function startEdit(pro: Professional) {
    setEditingId(pro.id);
    setForm({
      name: pro.name,
      specialty: pro.specialty,
      register_number: pro.register_number ?? "",
      register_type: pro.register_type ?? "CBO 3223-05",
      email: pro.email ?? "",
      phone: pro.phone ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const existing = editingId
      ? professionals.find((p) => p.id === editingId)
      : undefined;

    await saveProfessional({
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      specialty: form.specialty,
      register_number: form.register_number.trim() || undefined,
      register_type: form.register_type || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      active: existing?.active ?? true,
      is_default: existing?.is_default ?? professionals.length === 0,
      created_at: existing?.created_at,
    });

    cancelEdit();
    await refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissionais de atendimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-500">
          Cadastre optometristas, oftalmologistas e demais profissionais. Eles
          aparecem pré-definidos na anamnese, clínica, acuidade visual e
          prontuários.
        </p>

        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-800">
            {editingId ? "Editar profissional" : "Novo profissional"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Nome completo"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Ricardo Alves"
            />
            <Select
              label="Especialidade"
              value={form.specialty}
              onChange={(e) =>
                setForm({
                  ...form,
                  specialty: e.target.value as ProfessionalSpecialty,
                })
              }
              options={Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Select
              label="Tipo de registro"
              value={form.register_type}
              onChange={(e) => setForm({ ...form, register_type: e.target.value })}
              options={REGISTER_TYPE_OPTIONS.map((r) => ({ value: r, label: r }))}
            />
            <Input
              label="Número do registro"
              value={form.register_number}
              onChange={(e) => setForm({ ...form, register_number: e.target.value })}
              placeholder="3223-05 / CRM 123456"
            />
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => void handleSave()}>
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Salvar alterações
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Adicionar profissional
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{pro.name}</p>
                  {pro.is_default && (
                    <Badge variant="success" className="gap-1">
                      <Star className="h-3 w-3" />
                      Padrão
                    </Badge>
                  )}
                  {!pro.active && <Badge variant="warning">Inativo</Badge>}
                </div>
                <p className="text-sm text-slate-600">
                  {SPECIALTY_LABELS[pro.specialty]}
                  {professionalRegisterLabel(pro)
                    ? ` · ${professionalRegisterLabel(pro)}`
                    : ""}
                </p>
                {(pro.email || pro.phone) && (
                  <p className="text-xs text-slate-500">
                    {[pro.email, pro.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!pro.is_default && pro.active && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void setDefaultProfessional(pro.id).then(refresh)}
                  >
                    <Check className="h-4 w-4" />
                    Definir padrão
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => startEdit(pro)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void deleteProfessional(pro.id).then(refresh)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!professionals.length && (
            <p className="text-sm text-slate-500">
              Nenhum profissional cadastrado ainda.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
