"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { FinancialAccount } from "@/lib/types";
import { demoFinancialAccounts } from "@/lib/types";

const LOCAL_KEY = "opticare_financial";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapRow(row: Record<string, unknown>, clientName?: string): FinancialAccount {
  return {
    id: row.id as string,
    type: row.type as FinancialAccount["type"],
    client_id: (row.client_id as string) ?? undefined,
    client_name: clientName ?? (row.client_name as string) ?? undefined,
    sale_id: (row.sale_id as string) ?? undefined,
    description: row.description as string,
    amount: Number(row.amount ?? 0),
    due_date: row.due_date as string,
    paid_date: (row.paid_date as string) ?? undefined,
    status: row.status as FinancialAccount["status"],
    payment_method: (row.payment_method as string) ?? undefined,
    created_at: row.created_at as string,
  };
}

function loadLocal(): FinancialAccount[] {
  if (typeof window === "undefined") return demoFinancialAccounts;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : demoFinancialAccounts;
  } catch {
    return demoFinancialAccounts;
  }
}

function saveLocal(accounts: FinancialAccount[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(accounts));
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
          const clients = row.clients as { name: string } | null;
          return mapRow(row, clients?.name);
        });
        saveLocal(accounts);
        return { accounts, source: "supabase" };
      }
    }
  }
  return { accounts: loadLocal(), source: "local" };
}

export async function saveFinancialAccount(
  account: Omit<FinancialAccount, "created_at"> & { created_at?: string },
): Promise<{ account: FinancialAccount; source: "supabase" | "local" }> {
  const now = new Date().toISOString();
  const fullAccount: FinancialAccount = {
    ...account,
    id: account.id || crypto.randomUUID(),
    created_at: account.created_at ?? now,
  };

  const locals = loadLocal();
  const idx = locals.findIndex((a) => a.id === fullAccount.id);
  const updated = [...locals];
  if (idx >= 0) updated[idx] = fullAccount;
  else updated.unshift(fullAccount);
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: fullAccount.id,
        store_id: DEFAULT_STORE_ID,
        type: fullAccount.type,
        client_id: fullAccount.client_id || null,
        sale_id: fullAccount.sale_id || null,
        description: fullAccount.description,
        amount: fullAccount.amount,
        due_date: fullAccount.due_date,
        paid_date: fullAccount.paid_date || null,
        status: fullAccount.status,
        payment_method: fullAccount.payment_method ?? null,
      };

      const { error } = await supabase.from("financial_accounts").upsert(row);
      if (!error) return { account: fullAccount, source: "supabase" };
    }
  }

  return { account: fullAccount, source: "local" };
}

export async function markAsPaid(
  id: string,
  paymentMethod?: string,
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const locals = loadLocal();
  const updated = locals.map((a) =>
    a.id === id
      ? { ...a, status: "pago" as const, paid_date: today, payment_method: paymentMethod }
      : a,
  );
  saveLocal(updated);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("financial_accounts")
        .update({
          status: "pago",
          paid_date: today,
          payment_method: paymentMethod ?? null,
        })
        .eq("id", id);
    }
  }
}

export function getStorageStatus(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}

export function getFinancialSummary(accounts: FinancialAccount[]) {
  const receber = accounts.filter((a) => a.type === "receber" && a.status === "pendente");
  const pagar = accounts.filter((a) => a.type === "pagar" && a.status === "pendente");
  const recebido = accounts.filter((a) => a.type === "receber" && a.status === "pago");
  const pago = accounts.filter((a) => a.type === "pagar" && a.status === "pago");

  return {
    totalReceber: receber.reduce((sum, a) => sum + a.amount, 0),
    totalPagar: pagar.reduce((sum, a) => sum + a.amount, 0),
    totalRecebido: recebido.reduce((sum, a) => sum + a.amount, 0),
    totalPago: pago.reduce((sum, a) => sum + a.amount, 0),
    saldo: recebido.reduce((s, a) => s + a.amount, 0) - pago.reduce((s, a) => s + a.amount, 0),
  };
}
