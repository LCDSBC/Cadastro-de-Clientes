"use client";

import type {
  PriceTable,
  PurchaseOrder,
  PurchaseOrderItem,
  StockTransfer,
  InventoryCount,
  InventoryCountItem,
  Product,
} from "@/lib/types";
import {
  demoPriceTables,
  demoPurchaseOrders,
  demoStockTransfers,
  demoInventoryCounts,
} from "@/lib/inventory-savwin";
import { saveProduct } from "@/lib/products-store";

const KEYS = {
  priceTables: "opticare_price_tables",
  purchaseOrders: "opticare_purchase_orders",
  stockTransfers: "opticare_stock_transfers",
  inventoryCounts: "opticare_inventory_counts",
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

export async function loadPriceTables(): Promise<PriceTable[]> {
  return load(KEYS.priceTables, demoPriceTables);
}

export async function savePriceTable(table: PriceTable): Promise<PriceTable> {
  const tables = await loadPriceTables();
  const idx = tables.findIndex((t) => t.id === table.id);
  const updated = [...tables];
  if (idx >= 0) updated[idx] = table;
  else updated.unshift(table);
  save(KEYS.priceTables, updated);
  return table;
}

export async function deletePriceTable(id: string): Promise<void> {
  const tables = (await loadPriceTables()).filter((t) => t.id !== id);
  save(KEYS.priceTables, tables);
}

export async function loadPurchaseOrders(): Promise<PurchaseOrder[]> {
  return load(KEYS.purchaseOrders, demoPurchaseOrders);
}

export async function savePurchaseOrder(
  order: PurchaseOrder,
): Promise<PurchaseOrder> {
  const orders = await loadPurchaseOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  const updated = [...orders];
  if (idx >= 0) updated[idx] = order;
  else updated.unshift(order);
  save(KEYS.purchaseOrders, updated);
  return order;
}

export async function receivePurchaseOrder(
  orderId: string,
  products: Product[],
): Promise<PurchaseOrder | null> {
  const orders = await loadPurchaseOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order || order.status === "recebido") return null;

  for (const item of order.items) {
    if (item.product_id) {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        await saveProduct({
          ...product,
          stock_quantity: product.stock_quantity + item.quantity,
          cost_price: item.unit_cost || product.cost_price,
        });
      }
    }
  }

  const updated: PurchaseOrder = {
    ...order,
    status: "recebido",
  };
  await savePurchaseOrder(updated);
  return updated;
}

export async function loadStockTransfers(): Promise<StockTransfer[]> {
  return load(KEYS.stockTransfers, demoStockTransfers);
}

export async function saveStockTransfer(
  transfer: StockTransfer,
): Promise<StockTransfer> {
  const transfers = await loadStockTransfers();
  const idx = transfers.findIndex((t) => t.id === transfer.id);
  const updated = [...transfers];
  if (idx >= 0) updated[idx] = transfer;
  else updated.unshift(transfer);
  save(KEYS.stockTransfers, updated);
  return transfer;
}

export async function completeStockTransfer(
  transferId: string,
  products: Product[],
): Promise<StockTransfer | null> {
  const transfers = await loadStockTransfers();
  const transfer = transfers.find((t) => t.id === transferId);
  if (!transfer || transfer.status === "concluida") return null;

  for (const item of transfer.items) {
    const product = products.find((p) => p.id === item.product_id);
    if (product && product.stock_quantity >= item.quantity) {
      await saveProduct({
        ...product,
        stock_quantity: product.stock_quantity - item.quantity,
      });
    }
  }

  const updated: StockTransfer = { ...transfer, status: "concluida" };
  await saveStockTransfer(updated);
  return updated;
}

export async function loadInventoryCounts(): Promise<InventoryCount[]> {
  return load(KEYS.inventoryCounts, demoInventoryCounts);
}

export async function saveInventoryCount(
  count: InventoryCount,
): Promise<InventoryCount> {
  const counts = await loadInventoryCounts();
  const idx = counts.findIndex((c) => c.id === count.id);
  const updated = [...counts];
  if (idx >= 0) updated[idx] = count;
  else updated.unshift(count);
  save(KEYS.inventoryCounts, updated);
  return count;
}

export function createInventoryFromProducts(
  name: string,
  products: Product[],
): InventoryCount {
  return {
    id: crypto.randomUUID(),
    name,
    status: "em_andamento",
    created_at: new Date().toISOString(),
    items: products
      .filter((p) => p.active)
      .map((p) => ({
        id: crypto.randomUUID(),
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        system_quantity: p.stock_quantity,
        counted_quantity: p.stock_quantity,
        difference: 0,
      })),
  };
}

export function applyInventoryCount(
  count: InventoryCount,
  itemId: string,
  countedQuantity: number,
): InventoryCount {
  const items = count.items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      counted_quantity: countedQuantity,
      difference: countedQuantity - item.system_quantity,
    };
  });
  return { ...count, items };
}

export function findInventoryItemByBarcode(
  count: InventoryCount,
  barcode: string,
): InventoryCountItem | undefined {
  const code = barcode.trim();
  return count.items.find(
    (i) => i.barcode === code || i.sku === code || i.product_id === code,
  );
}

export async function finalizeInventoryCount(
  countId: string,
  products: Product[],
): Promise<InventoryCount | null> {
  const counts = await loadInventoryCounts();
  const count = counts.find((c) => c.id === countId);
  if (!count || count.status === "finalizado") return null;

  for (const item of count.items) {
    if (item.difference === 0) continue;
    const product = products.find((p) => p.id === item.product_id);
    if (product) {
      await saveProduct({
        ...product,
        stock_quantity: item.counted_quantity,
      });
    }
  }

  const updated: InventoryCount = {
    ...count,
    status: "finalizado",
    finished_at: new Date().toISOString(),
  };
  await saveInventoryCount(updated);
  return updated;
}

export function calcOrderTotal(items: PurchaseOrderItem[]): number {
  return items.reduce((sum, i) => sum + i.total, 0);
}
