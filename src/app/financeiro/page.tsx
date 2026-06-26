"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { FinancialAccount } from "@/lib/types";
import {
  getFinancialSummary,
  getStorageStatus,
  loadFinancialAccounts,
  markAsPaid,
  saveFinancialAccount,
} from "@/lib/financial-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, Loader2, Plus, X } from "lucide-react";

const typeOptions = [
  { value: "receber", label: "A receber" },
  { value: "pagar", label: "A pagar" },
];

const statusBadge: Record<
  FinancialAccount["status"],
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  pendente: { label: "Pendente", variant: "warning" },
  pago: { label: "Pago", variant: "success" },
  vencido: { label: "Vencido", variant: "danger" },
  cancelado: { label: "Cancelado", variant: "default" },
};

export default function FinanceiroPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"todos" | "receber" | "pagar">("todos");
  const [form, setForm] = useState({
    type: "receber" as FinancialAccount["type"],
    description: "",
    amount: "",
    due_date: "",
    client_name: "",
  });

  useEffect(() => {
    loadFinancialAccounts().then(({ accounts: data }) => {
      setAccounts(data);
      setLoading(false);
    });
  }, []);

  const storageLabel = getStorageStatus() === "supabase" ? "Nuvem Supabase" : "Local";
  const summary = getFinancialSummary(accounts);

  const filtered = accounts.filter((a) => filter === "todos" || a.type === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { account } = await saveFinancialAccount({
      id: crypto.randomUUID(),
      type: form.type,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      due_date: form.due_date,
      client_name: form.client_name || undefined,
      status: "pendente",
    });
    setAccounts((prev) => [account, ...prev]);
    setShowForm(false);
    setForm({ type: "receber", description: "", amount: "", due_date: "", client_name: "" });
    setSaving(false);
  };

  const handleMarkPaid = async (id: string) => {
    await markAsPaid(id, "PIX");
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "pago", paid_date: new Date().toISOString().split("T")[0] }
          : a,
      ),
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Financeiro"
        description={`Contas a pagar e receber — ${storageLabel}`}
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">A receber</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalReceber)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">A pagar</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalPagar)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Saldo realizado</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.saldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600">
              {accounts.filter((a) => a.status === "pendente").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nova conta</CardTitle>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tipo"
                options={typeOptions}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as FinancialAccount["type"] })
                }
              />
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              <Input
                label="Descrição"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                className="sm:col-span-2"
              />
              <Input
                label="Cliente / Fornecedor"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              />
              <Input
                label="Vencimento"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex gap-2">
            {(["todos", "receber", "pagar"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "todos" ? "Todos" : f === "receber" ? "A receber" : "A pagar"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4">Descrição</th>
                    <th className="pb-2 pr-4">Valor</th>
                    <th className="pb-2 pr-4">Vencimento</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((account) => (
                    <tr key={account.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">
                        <Badge variant={account.type === "receber" ? "success" : "danger"}>
                          {account.type === "receber" ? "Receber" : "Pagar"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{account.description}</div>
                        {account.client_name && (
                          <div className="text-xs text-slate-500">{account.client_name}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {formatCurrency(account.amount)}
                      </td>
                      <td className="py-3 pr-4">{formatDate(account.due_date)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadge[account.status].variant}>
                          {statusBadge[account.status].label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {account.status === "pendente" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkPaid(account.id)}
                          >
                            <Check className="h-4 w-4" />
                            Baixar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
