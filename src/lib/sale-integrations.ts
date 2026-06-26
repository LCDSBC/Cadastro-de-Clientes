"use client";

import type { Sale } from "@/lib/types";
import { loadFinancialAccounts, saveFinancialAccount } from "@/lib/financial-store";
import { loadServiceOrders, saveServiceOrder } from "@/lib/service-orders-store";
import { loadProducts, saveProduct } from "@/lib/products-store";
import { loadPreferences } from "@/lib/settings-store";

const HOOKS_KEY = "opticare_sale_hooks";

interface SaleHooks {
  receivable_created?: boolean;
  service_order_created?: boolean;
  stock_reduced?: boolean;
}

function loadHooks(): Record<string, SaleHooks> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HOOKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHooks(hooks: Record<string, SaleHooks>): void {
  localStorage.setItem(HOOKS_KEY, JSON.stringify(hooks));
}

function getHook(saleId: string): SaleHooks {
  return loadHooks()[saleId] ?? {};
}

function setHook(saleId: string, patch: SaleHooks): void {
  const all = loadHooks();
  all[saleId] = { ...all[saleId], ...patch };
  saveHooks(all);
}

async function createReceivable(sale: Sale): Promise<void> {
  const hook = getHook(sale.id);
  if (hook.receivable_created) return;

  const { accounts } = await loadFinancialAccounts();
  if (accounts.some((a) => a.sale_id === sale.id && a.type === "receber")) {
    setHook(sale.id, { receivable_created: true });
    return;
  }

  const due = sale.delivery_date ?? new Date().toISOString().slice(0, 10);
  await saveFinancialAccount({
    id: crypto.randomUUID(),
    type: "receber",
    client_id: sale.client_id,
    client_name: sale.client_name,
    sale_id: sale.id,
    description: `Venda #${sale.id.slice(0, 8)} — ${sale.client_name}`,
    amount: sale.total,
    due_date: due,
    status: "pendente",
    created_at: new Date().toISOString(),
  });
  setHook(sale.id, { receivable_created: true });
}

async function createServiceOrder(sale: Sale): Promise<void> {
  const hook = getHook(sale.id);
  if (hook.service_order_created) return;

  const { orders } = await loadServiceOrders();
  if (orders.some((o) => o.sale_id === sale.id)) {
    setHook(sale.id, { service_order_created: true });
    return;
  }

  const prefs = await loadPreferences();
  const lab =
    prefs.default_lab_name ?? "Laboratório próprio";

  await saveServiceOrder({
    id: crypto.randomUUID(),
    sale_id: sale.id,
    client_name: sale.client_name,
    sale_total: sale.total,
    status: "aberta",
    lab_name: lab,
    expected_date: sale.delivery_date,
    notes: sale.notes,
    items_summary: sale.items.map((i) => i.description).join(", "),
  });
  setHook(sale.id, { service_order_created: true });
}

async function reduceStock(sale: Sale): Promise<void> {
  const hook = getHook(sale.id);
  if (hook.stock_reduced) return;

  const { products } = await loadProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of sale.items) {
    if (!item.product_id) continue;
    const product = productMap.get(item.product_id);
    if (!product) continue;
    const newQty = Math.max(0, product.stock_quantity - item.quantity);
    if (newQty !== product.stock_quantity) {
      await saveProduct({ ...product, stock_quantity: newQty });
      productMap.set(product.id, { ...product, stock_quantity: newQty });
    }
  }
  setHook(sale.id, { stock_reduced: true });
}

export interface SaleIntegrationResult {
  receivableCreated: boolean;
  serviceOrderCreated: boolean;
  stockReduced: boolean;
  messages: string[];
}

export async function applySaleStatusSideEffects(
  sale: Sale,
  previousStatus: Sale["status"],
  newStatus: Sale["status"],
): Promise<SaleIntegrationResult> {
  const result: SaleIntegrationResult = {
    receivableCreated: false,
    serviceOrderCreated: false,
    stockReduced: false,
    messages: [],
  };

  if (newStatus === "cancelado") return result;

  if (newStatus === "aprovado" && previousStatus !== "aprovado") {
    await createReceivable(sale);
    result.receivableCreated = true;
    result.messages.push("Conta a receber gerada automaticamente.");
  }

  if (newStatus === "producao" && previousStatus !== "producao") {
    await createServiceOrder(sale);
    result.serviceOrderCreated = true;
    result.messages.push("Ordem de serviço criada no laboratório.");
  }

  if (newStatus === "entregue" && previousStatus !== "entregue") {
    await reduceStock(sale);
    result.stockReduced = true;
    result.messages.push("Estoque baixado automaticamente.");
  }

  return result;
}
