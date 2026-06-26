"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StoreSettings } from "@/lib/types";
import { loadStoreSettings, saveStoreSettings } from "@/lib/settings-store";
import { BRAZILIAN_STATES } from "@/lib/settings";
import { formatCpfCnpj, formatPhone } from "@/lib/utils";
import { Building2, Loader2, Save } from "lucide-react";

export function StoreSettingsPanel() {
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "SP",
    zip_code: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadStoreSettings().then(({ store: data, source: src }) => {
      setStore(data);
      setSource(src);
      setForm({
        name: data.name,
        cnpj: data.cnpj,
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "SP",
        zip_code: data.zip_code ?? "",
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setSaved(false);

    const { store: updated, source: src } = await saveStoreSettings({
      ...store,
      name: form.name.trim(),
      cnpj: form.cnpj.replace(/\D/g, ""),
      email: form.email.trim() || undefined,
      phone: form.phone.replace(/\D/g, "") || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state || undefined,
      zip_code: form.zip_code.replace(/\D/g, "") || undefined,
    });

    setStore(updated);
    setSource(src);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados da loja...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da loja
            </CardTitle>
            <CardDescription>
              Informações exibidas em receitas, orçamentos e documentos
            </CardDescription>
          </div>
          <Badge variant={source === "supabase" ? "success" : "info"}>
            {source === "supabase" ? "Nuvem Supabase" : "Local"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome da ótica"
            required
            className="sm:col-span-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="CNPJ"
            required
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
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
          <Input
            label="CEP"
            value={form.zip_code}
            onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
          />
          <Input
            label="Endereço"
            className="sm:col-span-2"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            label="Cidade"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Select
            label="Estado"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            options={BRAZILIAN_STATES.map((uf) => ({
              value: uf,
              label: uf,
            }))}
          />
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar loja
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600">Salvo com sucesso!</span>
            )}
          </div>
        </form>

        {store && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Pré-visualização</p>
            <p className="mt-2">{form.name || "Nome da ótica"}</p>
            <p>CNPJ: {form.cnpj ? formatCpfCnpj(form.cnpj) : "—"}</p>
            {form.phone && <p>Tel: {formatPhone(form.phone)}</p>}
            {form.address && (
              <p>
                {form.address}
                {form.city && ` — ${form.city}/${form.state}`}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
