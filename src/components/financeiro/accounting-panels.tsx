"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import type { FinancialAccount } from "@/lib/types";
import { buildDreReport } from "@/lib/accounting";
import {
  loadChartOfAccounts,
  loadCostCenters,
  loadReconciliations,
  saveReconciliation,
  loadChecks,
  saveCheck,
} from "@/lib/accounting-store";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export function DrePanel({ accounts }: { accounts: FinancialAccount[] }) {
  const month = new Date().toISOString().slice(0, 7);
  const dre = buildDreReport(accounts, month);

  return (
    <Card>
      <CardHeader>
        <CardTitle>DRE — {month}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Receita bruta</p>
            <p className="text-xl font-bold">{formatCurrency(dre.receitaBruta)}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">Despesas</p>
            <p className="text-xl font-bold">{formatCurrency(dre.despesasTotal)}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Resultado ({dre.margem.toFixed(1)}%)</p>
            <p className="text-xl font-bold">{formatCurrency(dre.resultado)}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 font-medium">Receitas</p>
            {dre.receitas.length ? dre.receitas.map((r) => (
              <div key={r.label} className="flex justify-between border-b py-1 text-sm">
                <span>{r.label}</span>
                <span>{formatCurrency(r.amount)}</span>
              </div>
            )) : <p className="text-sm text-slate-500">Sem receitas pagas no período.</p>}
          </div>
          <div>
            <p className="mb-2 font-medium">Despesas</p>
            {dre.despesas.length ? dre.despesas.map((d) => (
              <div key={d.label} className="flex justify-between border-b py-1 text-sm">
                <span>{d.label}</span>
                <span>{formatCurrency(d.amount)}</span>
              </div>
            )) : <p className="text-sm text-slate-500">Sem despesas pagas no período.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartOfAccountsPanel() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof loadChartOfAccounts>>>([]);
  const [centers, setCenters] = useState<Awaited<ReturnType<typeof loadCostCenters>>>([]);

  useEffect(() => {
    void Promise.all([loadChartOfAccounts(), loadCostCenters()]).then(
      ([a, c]) => { setAccounts(a); setCenters(c); },
    );
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Plano de contas</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-2">Código</th>
                <th className="pb-2">Nome</th>
                <th className="pb-2">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2 font-mono">{a.code}</td>
                  <td className="py-2">{a.name}</td>
                  <td className="py-2 capitalize">{a.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Centros de custo</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {centers.map((c) => (
              <li key={c.id} className="flex justify-between rounded border p-2 text-sm">
                <span><span className="font-mono text-slate-500">{c.code}</span> — {c.name}</span>
                <span className={c.active ? "text-emerald-600" : "text-slate-400"}>
                  {c.active ? "Ativo" : "Inativo"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReconciliationPanel() {
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof loadReconciliations>>>([]);
  const [checks, setChecks] = useState<Awaited<ReturnType<typeof loadChecks>>>([]);
  const [form, setForm] = useState<{
    description: string;
    amount: string;
    type: "entrada" | "saida";
  }>({ description: "", amount: "", type: "entrada" });

  useEffect(() => {
    void Promise.all([loadReconciliations(), loadChecks()]).then(
      ([e, c]) => { setEntries(e); setChecks(c); },
    );
  }, []);

  async function addEntry() {
    if (!form.description || !form.amount) return;
    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      reconciled: false,
    };
    await saveReconciliation(entry);
    setEntries((prev) => [entry, ...prev]);
    setForm({ description: "", amount: "", type: "entrada" });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Conciliação bancária / cartões</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="flex-1" />
            <Input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-32" />
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "entrada" | "saida" })} options={[{ value: "entrada", label: "Entrada" }, { value: "saida", label: "Saída" }]} className="w-32" />
            <Button onClick={() => void addEntry()}><Plus className="h-4 w-4" />Lançar</Button>
          </div>
          {entries.map((e) => (
            <div key={e.id} className="flex justify-between rounded border p-2 text-sm">
              <span>{e.date} — {e.description}</span>
              <span className={e.type === "entrada" ? "text-emerald-600" : "text-red-600"}>
                {e.type === "entrada" ? "+" : "-"}{formatCurrency(e.amount)}
              </span>
            </div>
          ))}
          {!entries.length && <p className="text-sm text-slate-500">Nenhum lançamento de conciliação.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Cheques</CardTitle></CardHeader>
        <CardContent>
          {checks.length ? checks.map((c) => (
            <div key={c.id} className="mb-2 flex justify-between rounded border p-2 text-sm">
              <span>#{c.number} — {c.payee}</span>
              <span>{formatCurrency(c.amount)} — {c.status}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-500">Cadastre cheques vinculados a contas a pagar.</p>
          )}
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => void saveCheck({
              id: crypto.randomUUID(),
              number: String(1000 + checks.length + 1),
              bank: "Banco",
              amount: 0,
              payee: "Fornecedor",
              issue_date: new Date().toISOString().slice(0, 10),
              status: "emitido",
            }).then(() => loadChecks().then(setChecks))}
          >
            Exemplo de cheque
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
