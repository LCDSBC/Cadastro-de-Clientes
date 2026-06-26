import type { StoreSettings, AppPreferences } from "@/lib/types";

export type { StoreSettings, AppPreferences };

export const LOCAL_STORAGE_KEYS = [
  "opticare_clients",
  "opticare_prescriptions",
  "opticare_products",
  "opticare_lens_grid",
  "opticare_sales",
  "opticare_financial",
  "opticare_service_orders",
  "opticare_appointments",
  "opticare_clinical_documents",
  "opticare_store_settings",
  "opticare_preferences",
  "opticare_product_meta",
  "opticare_price_tables",
  "opticare_purchase_orders",
  "opticare_stock_transfers",
  "opticare_inventory_counts",
  "opticare_sale_hooks",
  "opticare_users",
  "opticare_active_store",
  "opticare_chart_of_accounts",
  "opticare_cost_centers",
  "opticare_bank_reconciliation",
  "opticare_checks",
] as const;

export const APP_VERSION = "0.1.0";

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
