"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { FinancialAccount, Client } from "@/lib/types";
import {
  loadFinancialAccounts,
  saveFinancialAccount,
  markAccountPaid,
  cancelFinancialAccount,
  deleteFinancialAccount,
  calcFinancialSummary,
} from "@/lib/financial-store";
import { loadClients } from "@/lib/clients-store";
import {
  ACCOUNT_TYPES,
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_VARIANT,
  PAYMENT_METHODS,
  paymentMethodLabel,
} from "@/lib/finance";
import { getStorageStatus } from "@/lib/prontuarios-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  Wallet,
  X,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Pencil,
  Trash2,
  BarChart3,
  List,
  Landmark,
} from "lucide-react";
import {
  DrePanel,
  ChartOfAccountsPanel,
  ReconciliationPanel,
} from "@/components/financeiro/accounting-panels";

const financeTabs = [
  { id: "contas", label: "Contas", icon: Wallet },
  { id: "dre", label: "DRE", icon: BarChart3 },
  { id: "plano", label: "Plano de contas", icon: List },
  { id: "conciliacao", label: "Conciliação", icon: Landmark },
] as const;

type FinanceTabId = (typeof financeTabs)[number]["id"];

const emptyForm = {
  type: "receber" as FinancialAccount["type"],
  client_id: "",
  description: "",
  amount: "",
  due_date: "",
};

export default function FinanceiroPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<FinancialAccount | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [payForm, setPayForm] = useState({
    payment_method: "pix",
    paid_date: new Date().toISOString().slice(0, 10),
  });
  const [financeTab, setFinanceTab] = useState<FinanceTabId>("contas");

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";

  useEffect(() => {
    Promise.all([loadFinancialAccounts(), loadClients()]).then(
      ([{ accounts: data }, { clients: clientsData }]) => {
        setAccounts(data);
        setClients(clientsData);
        setLoading(false);
      },
    );
  }, []);

  const summary = calcFinancialSummary(accounts);

  const filtered = accounts.filter((a) => {
    const matchesSearch =
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      (a.client_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openNewForm = (type: FinancialAccount["type"] = "receber") => {
    setEditingId(null);
    setForm({ ...emptyForm, type, due_date: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const openEditForm = (account: FinancialAccount) => {
    setEditingId(account.id);
    setForm({
      type: account.type,
      client_id: account.client_id ?? "",
      description: account.description,
      amount: String(account.amount),
      due_date: account.due_date,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const client = clients.find((c) => c.id === form.client_id);
    const { account } = await saveFinancialAccount({
      id: editingId ?? crypto.randomUUID(),
      type: form.type,
      client_id: form.client_id || undefined,
      client_name: client?.name,
      description: form.description.trim(),
      amount: parseFloat(form.amount) || 0,
      due_date: form.due_date,
      status: "pendente",
    });

    setAccounts((prev) => {
      const idx = prev.findIndex((a) => a.id === account.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = account;
        return updated;
      }
      return [account, ...prev];
    });

    if (selected?.id === account.id) setSelected(account);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setSaving(false);
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    const updated = await markAccountPaid(
      selected.id,
      payForm.payment_method,
      payForm.paid_date,
    );
    if (updated) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setSelected(updated);
    }
    setShowPayForm(false);
    setSaving(false);
  };

  const handleCancel = async (account: FinancialAccount) => {
    if (!confirm("Cancelar esta conta?")) return;
    const updated = await cancelFinancialAccount(account.id);
    if (updated) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setSelected(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta conta permanentemente?")) return;
    await deleteFinancialAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Financeiro"
        description={`Contas a pagar/receber e fluxo de caixa — ${storageLabel}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openNewForm("pagar")}>
              <ArrowUpRight className="h-4 w-4" />
              Nova despesa
            </Button>
            <Button onClick={() => openNewForm("receber")}>
              <Plus className="h-4 w-4" />
              Nova receita
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {financeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFinanceTab(tab.id)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-medium ${
              financeTab === tab.id
                ? "border-b-2 border-primary-600 text-primary-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {financeTab === "dre" && <DrePanel accounts={accounts} />}
      {financeTab === "plano" && <ChartOfAccountsPanel />}
      {financeTab === "conciliacao" && <ReconciliationPanel />}

      {financeTab === "contas" && (
      <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">A receber</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatCurrency(summary.totalReceber)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">A pagar</p>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(summary.totalPagar)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo previsto</p>
              <p
                className={`text-lg font-bold ${
                  summary.saldoPrevisto >= 0
                    ? "text-blue-700"
                    : "text-red-700"
                }`}
              >
                {formatCurrency(summary.saldoPrevisto)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Vencidos</p>
              <p className="text-lg font-bold text-amber-700">
                {formatCurrency(summary.vencidos)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Fluxo do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-600">Recebido no mês</p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(summary.recebidoMes)}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 px-4 py-3">
              <p className="text-xs text-red-600">Pago no mês</p>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(summary.pagoMes)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Receber e pagar</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos os status</option>
          {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId
                ? "Editar conta"
                : form.type === "receber"
                  ? "Nova conta a receber"
                  : "Nova conta a pagar"}
            </CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as FinancialAccount["type"],
                  })
                }
                options={ACCOUNT_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                }))}
              />
              {form.type === "receber" && (
                <Select
                  label="Cliente (opcional)"
                  value={form.client_id}
                  onChange={(e) =>
                    setForm({ ...form, client_id: e.target.value })
                  }
                  options={[
                    { value: "", label: "Sem vínculo com cliente" },
                    ...clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                />
              )}
              <Input
                label="Descrição"
                required
                className="sm:col-span-2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <Input
                label="Vencimento"
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar ({storageLabel})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
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
              <CardTitle>
                Lançamentos ({loading ? "..." : filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] space-y-2 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Nenhum lançamento encontrado.
                </p>
              ) : (
                filtered.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      setSelected(account);
                      setShowPayForm(false);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selected?.id === account.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {account.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          Venc. {formatDate(account.due_date)}
                          {account.client_name && ` · ${account.client_name}`}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-medium ${
                            account.type === "receber"
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          {account.type === "receber" ? "+" : "-"}
                          {formatCurrency(account.amount)}
                        </p>
                        <Badge variant={ACCOUNT_STATUS_VARIANT[account.status]}>
                          {ACCOUNT_STATUS_LABELS[account.status]}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selected.description}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {selected.type === "receber"
                        ? "Conta a receber"
                        : "Conta a pagar"}
                      {selected.client_name && ` · ${selected.client_name}`}
                    </p>
                  </div>
                  <Badge variant={ACCOUNT_STATUS_VARIANT[selected.status]}>
                    {ACCOUNT_STATUS_LABELS[selected.status]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">Valor</dt>
                      <dd
                        className={`text-xl font-bold ${
                          selected.type === "receber"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {formatCurrency(selected.amount)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Vencimento</dt>
                      <dd className="font-medium">
                        {formatDate(selected.due_date)}
                      </dd>
                    </div>
                    {selected.paid_date && (
                      <div>
                        <dt className="text-xs text-slate-500">
                          Data do pagamento
                        </dt>
                        <dd className="font-medium">
                          {formatDate(selected.paid_date)}
                        </dd>
                      </div>
                    )}
                    {selected.payment_method && (
                      <div>
                        <dt className="text-xs text-slate-500">Forma de pagamento</dt>
                        <dd className="font-medium">
                          {paymentMethodLabel(selected.payment_method)}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-slate-500">Cadastrado em</dt>
                      <dd className="font-medium">
                        {formatDate(selected.created_at)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    {selected.status !== "pago" &&
                      selected.status !== "cancelado" && (
                        <Button onClick={() => setShowPayForm(true)}>
                          <CheckCircle className="h-4 w-4" />
                          Marcar como pago
                        </Button>
                      )}
                    {selected.status !== "pago" &&
                      selected.status !== "cancelado" && (
                        <Button
                          variant="outline"
                          onClick={() => openEditForm(selected)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    {selected.status !== "pago" &&
                      selected.status !== "cancelado" && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancel(selected)}
                        >
                          Cancelar
                        </Button>
                      )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(selected.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {showPayForm &&
                selected.status !== "pago" &&
                selected.status !== "cancelado" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Registrar pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleMarkPaid}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <Select
                          label="Forma de pagamento"
                          required
                          value={payForm.payment_method}
                          onChange={(e) =>
                            setPayForm({
                              ...payForm,
                              payment_method: e.target.value,
                            })
                          }
                          options={PAYMENT_METHODS.filter((m) => m.value)}
                        />
                        <Input
                          label="Data do pagamento"
                          type="date"
                          required
                          value={payForm.paid_date}
                          onChange={(e) =>
                            setPayForm({
                              ...payForm,
                              paid_date: e.target.value,
                            })
                          }
                        />
                        <div className="flex gap-2 sm:col-span-2">
                          <Button type="submit" disabled={saving}>
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Confirmar pagamento
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPayForm(false)}
                          >
                            Voltar
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Wallet className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">
                  Selecione um lançamento para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </>
      )}
    </AppShell>
  );
}
