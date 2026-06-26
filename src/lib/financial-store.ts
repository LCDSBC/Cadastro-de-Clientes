"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import { resolveAccountStatus } from "@/lib/finance";
import type { FinancialAccount, FinancialSummary } from "@/lib/types";
import { demoFinancialAccounts } from "@/lib/types";

const LOCAL_KEY = "opticare_financial";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapAccount(
  row: Record<string, unknown>,
  clientName?: string,
): FinancialAccount {
  const account: FinancialAccount = {
    id: row.id as string,
    type: row.type as FinancialAccount["type"],
    client_id: (row.client_id as string) ?? undefined,
    client_name: clientName ?? undefined,
    sale_id: (row.sale_id as string) ?? undefined,
    description: row.description as string,
    amount: Number(row.amount),
    due_date: row.due_date as string,
    paid_date: (row.paid_date as string) ?? undefined,
    status: row.status as FinancialAccount["status"],
    payment_method: (row.payment_method as string) ?? undefined,
    created_at: row.created_at as string,
  };
  return { ...account, status: resolveAccountStatus(account) };
}

function normalizeAccounts(accounts: FinancialAccount[]): FinancialAccount[] {
  return accounts.map((a) => ({ ...a, status: resolveAccountStatus(a) }));
}

function loadLocal(): FinancialAccount[] {
  if (typeof window === "undefined") return demoFinancialAccounts;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return normalizeAccounts(raw ? JSON.parse(raw) : demoFinancialAccounts);
  } catch {
    return demoFinancialAccounts;
  }
}

function saveLocal(accounts: FinancialAccount[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(accounts));
}

export function calcFinancialSummary(
  accounts: FinancialAccount[],
): FinancialSummary {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const open = accounts.filter(
    (a) => a.status !== "pago" && a.status !== "cancelado",
  );

  const totalReceber = open
    .filter((a) => a.type === "receber")
    .reduce((sum, a) => sum + a.amount, 0);

  const totalPagar = open
    .filter((a) => a.type === "pagar")
    .reduce((sum, a) => sum + a.amount, 0);

  const vencidos = open
    .filter((a) => a.status === "vencido")
    .reduce((sum, a) => sum + a.amount, 0);

  const recebidoMes = accounts
    .filter(
      (a) =>
        a.type === "receber" &&
        a.status === "pago" &&
        a.paid_date &&
        a.paid_date >= monthStart,
    )
    .reduce((sum, a) => sum + a.amount, 0);

  const pagoMes = accounts
    .filter(
      (a) =>
        a.type === "pagar" &&
        a.status === "pago" &&
        a.paid_date &&
        a.paid_date >= monthStart,
    )
    .reduce((sum, a) => sum + a.amount, 0);

  return {
    totalReceber,
    totalPagar,
    saldoPrevisto: totalReceber - totalPagar,
    vencidos,
    recebidoMes,
    pagoMes,
  };
}

export async function loadFinancialAccounts(): Promise<{
  accounts: FinancialAccount[];
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("financial_accounts")
        .select("*, clients(name)")
        .order("due_date", { ascending: true });

      if (!error && data) {
        const accounts = data.map((row) => {
          const clientData = row.clients as { name: string } | null;
          return mapAccount(row, clientData?.name);
        });
        saveLocal(accounts);
        return { accounts, source: "supabase" };
      }
    }
  }
  return { accounts: loadLocal(), source: "local" };
}

export async function saveFinancialAccount(
  account: Omit<FinancialAccount, "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<{ account: FinancialAccount; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const full: FinancialAccount = {
    ...account,
    id: account.id ?? crypto.randomUUID(),
    created_at: account.created_at ?? now,
    status: resolveAccountStatus({
      ...account,
      id: account.id ?? "",
      created_at: account.created_at ?? now,
    } as FinancialAccount),
  };

  const locals = normalizeAccounts(loadLocal());
  const idx = locals.findIndex((a) => a.id === full.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: full.id,
        store_id: DEFAULT_STORE_ID,
        type: full.type,
        client_id: full.client_id ?? null,
        sale_id: full.sale_id ?? null,
        description: full.description,
        amount: full.amount,
        due_date: full.due_date,
        paid_date: full.paid_date ?? null,
        status: full.status,
        payment_method: full.payment_method ?? null,
      };
      const { error } = await supabase.from("financial_accounts").upsert(row);
      if (!error) return { account: full, source: "supabase" };
    }
  }
  return { account: full, source: "local" };
}

export async function markAccountPaid(
  accountId: string,
  paymentMethod: string,
  paidDate?: string,
): Promise<FinancialAccount | null> {
  const locals = loadLocal();
  const account = locals.find((a) => a.id === accountId);
  if (!account) return null;

  const updated: FinancialAccount = {
    ...account,
    status: "pago",
    paid_date: paidDate ?? new Date().toISOString().slice(0, 10),
    payment_method: paymentMethod,
  };

  const { account: saved } = await saveFinancialAccount(updated);
  return saved;
}

export async function cancelFinancialAccount(
  accountId: string,
): Promise<FinancialAccount | null> {
  const locals = loadLocal();
  const account = locals.find((a) => a.id === accountId);
  if (!account) return null;

  const updated: FinancialAccount = { ...account, status: "cancelado" };
  const { account: saved } = await saveFinancialAccount(updated);
  return saved;
}

export async function deleteFinancialAccount(id: string): Promise<void> {
  saveLocal(loadLocal().filter((a) => a.id !== id));
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("financial_accounts").delete().eq("id", id);
    }
  }
}
