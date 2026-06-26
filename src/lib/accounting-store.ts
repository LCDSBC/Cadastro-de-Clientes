"use client";

import type { BankReconciliation, CheckRegister } from "@/lib/accounting";
import {
  DEFAULT_CHART_OF_ACCOUNTS,
  DEFAULT_COST_CENTERS,
  type ChartAccount,
  type CostCenter,
} from "@/lib/accounting";

const KEYS = {
  chart: "opticare_chart_of_accounts",
  costCenters: "opticare_cost_centers",
  reconciliation: "opticare_bank_reconciliation",
  checks: "opticare_checks",
};

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function loadChartOfAccounts(): Promise<ChartAccount[]> {
  return load(KEYS.chart, DEFAULT_CHART_OF_ACCOUNTS);
}

export async function saveChartAccount(account: ChartAccount): Promise<void> {
  const list = await loadChartOfAccounts();
  const idx = list.findIndex((a) => a.id === account.id);
  const updated = [...list];
  if (idx >= 0) updated[idx] = account;
  else updated.push(account);
  save(KEYS.chart, updated);
}

export async function loadCostCenters(): Promise<CostCenter[]> {
  return load(KEYS.costCenters, DEFAULT_COST_CENTERS);
}

export async function saveCostCenter(center: CostCenter): Promise<void> {
  const list = await loadCostCenters();
  const idx = list.findIndex((c) => c.id === center.id);
  const updated = [...list];
  if (idx >= 0) updated[idx] = center;
  else updated.push(center);
  save(KEYS.costCenters, updated);
}

export async function loadReconciliations(): Promise<BankReconciliation[]> {
  return load(KEYS.reconciliation, []);
}

export async function saveReconciliation(
  entry: BankReconciliation,
): Promise<void> {
  const list = await loadReconciliations();
  const idx = list.findIndex((e) => e.id === entry.id);
  const updated = [...list];
  if (idx >= 0) updated[idx] = entry;
  else updated.unshift(entry);
  save(KEYS.reconciliation, updated);
}

export async function loadChecks(): Promise<CheckRegister[]> {
  return load(KEYS.checks, []);
}

export async function saveCheck(check: CheckRegister): Promise<void> {
  const list = await loadChecks();
  const idx = list.findIndex((c) => c.id === check.id);
  const updated = [...list];
  if (idx >= 0) updated[idx] = check;
  else updated.unshift(check);
  save(KEYS.checks, updated);
}
