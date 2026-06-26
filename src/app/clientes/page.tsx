"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { demoClients, demoPrescriptions, type Client } from "@/lib/types";
import { formatCpfCnpj, formatPhone, formatDate } from "@/lib/utils";
import { Plus, Search, User, FileText, X } from "lucide-react";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    birth_date: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search.replace(/\D/g, "")),
  );

  const clientPrescriptions = selectedClient
    ? demoPrescriptions.filter((p) => p.client_id === selectedClient.id)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      ...form,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    setForm({
      name: "",
      cpf: "",
      email: "",
      phone: "",
      birth_date: "",
      address: "",
      city: "",
      state: "",
      notes: "",
    });
    setShowForm(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes, histórico de compras e receitas oftálmicas"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Novo cliente</CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome completo"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="CPF"
                required
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
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
                label="Data de nascimento"
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
              <Input
                label="Cidade"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                label="Endereço"
                className="sm:col-span-2"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <Textarea
                label="Observações"
                className="sm:col-span-2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">Salvar cliente</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Lista de clientes ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] space-y-2 overflow-y-auto p-2">
              {filtered.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClient(client)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedClient?.id === client.id
                      ? "border-primary-300 bg-primary-50"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCpfCnpj(client.cpf)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedClient.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">CPF</dt>
                      <dd className="font-medium">{formatCpfCnpj(selectedClient.cpf)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Telefone</dt>
                      <dd className="font-medium">
                        {selectedClient.phone
                          ? formatPhone(selectedClient.phone)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">E-mail</dt>
                      <dd className="font-medium">{selectedClient.email ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cidade</dt>
                      <dd className="font-medium">
                        {selectedClient.city
                          ? `${selectedClient.city}/${selectedClient.state}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cadastrado em</dt>
                      <dd className="font-medium">
                        {formatDate(selectedClient.created_at)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Receitas oftálmicas
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    Nova receita
                  </Button>
                </CardHeader>
                <CardContent>
                  {clientPrescriptions.length > 0 ? (
                    clientPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="rounded-lg border border-slate-100 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-medium">
                            Exame: {formatDate(rx.exam_date)}
                          </p>
                          <Badge variant="success">
                            Válida até {formatDate(rx.valid_until!)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="mb-1 font-medium text-slate-700">OD</p>
                            <p>Esf: {rx.od_esf} | Cil: {rx.od_cil} | Eixo: {rx.od_eixo}°</p>
                            <p>Adição: {rx.od_add}</p>
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-slate-700">OE</p>
                            <p>Esf: {rx.oe_esf} | Cil: {rx.oe_cil} | Eixo: {rx.oe_eixo}°</p>
                            <p>Adição: {rx.oe_add}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          DP: {rx.dp}mm — {rx.optometrist}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Nenhuma receita cadastrada para este cliente.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <User className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione um cliente para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
