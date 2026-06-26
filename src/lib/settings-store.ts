"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_STORE_ID } from "@/lib/supabase/config";
import type { StoreSettings, AppPreferences } from "@/lib/types";
import { demoStoreSettings, defaultAppPreferences } from "@/lib/types";

const STORE_KEY = "opticare_store_settings";
const PREFS_KEY = "opticare_preferences";

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapStore(row: Record<string, unknown>): StoreSettings {
  return {
    id: row.id as string,
    name: row.name as string,
    cnpj: row.cnpj as string,
    email: (row.email as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    city: (row.city as string) ?? undefined,
    state: (row.state as string) ?? undefined,
    zip_code: (row.zip_code as string) ?? undefined,
    active: row.active !== false,
    updated_at: (row.updated_at as string) ?? undefined,
  };
}

function loadLocalStore(): StoreSettings {
  if (typeof window === "undefined") return demoStoreSettings;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : demoStoreSettings;
  } catch {
    return demoStoreSettings;
  }
}

function saveLocalStore(settings: StoreSettings): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(settings));
}

function loadLocalPreferences(): AppPreferences {
  if (typeof window === "undefined") return defaultAppPreferences;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultAppPreferences, ...JSON.parse(raw) } : defaultAppPreferences;
  } catch {
    return defaultAppPreferences;
  }
}

function saveLocalPreferences(prefs: AppPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function loadStoreSettings(): Promise<{
  store: StoreSettings;
  source: "supabase" | "local";
}> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", DEFAULT_STORE_ID)
        .maybeSingle();

      if (!error && data) {
        const store = mapStore(data);
        saveLocalStore(store);
        return { store, source: "supabase" };
      }

      const { data: anyStore } = await supabase
        .from("stores")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (anyStore) {
        const store = mapStore(anyStore);
        saveLocalStore(store);
        return { store, source: "supabase" };
      }
    }
  }
  return { store: loadLocalStore(), source: "local" };
}

export async function saveStoreSettings(
  settings: Omit<StoreSettings, "updated_at"> & { updated_at?: string },
): Promise<{ store: StoreSettings; source: "supabase" | "local" }> {
  const full: StoreSettings = {
    ...settings,
    id: settings.id ?? DEFAULT_STORE_ID,
    active: settings.active ?? true,
    updated_at: new Date().toISOString(),
  };

  saveLocalStore(full);

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const row = {
        id: full.id,
        name: full.name,
        cnpj: full.cnpj.replace(/\D/g, ""),
        email: full.email ?? null,
        phone: full.phone ?? null,
        address: full.address ?? null,
        city: full.city ?? null,
        state: full.state ?? null,
        zip_code: full.zip_code ?? null,
        active: full.active,
        updated_at: full.updated_at,
      };
      const { error } = await supabase.from("stores").upsert(row);
      if (!error) return { store: full, source: "supabase" };
    }
  }
  return { store: full, source: "local" };
}

export async function loadPreferences(): Promise<AppPreferences> {
  return loadLocalPreferences();
}

export async function savePreferences(
  prefs: AppPreferences,
): Promise<AppPreferences> {
  saveLocalPreferences(prefs);
  return prefs;
}

export function clearLocalData(): void {
  const keys = [
    "opticare_clients",
    "opticare_prescriptions",
    "opticare_products",
    "opticare_lens_grid",
    "opticare_sales",
    "opticare_financial",
    "opticare_service_orders",
    "opticare_appointments",
    "opticare_clinical_documents",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
}

export function getLocalDataSize(): string {
  if (typeof window === "undefined") return "0 KB";
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("opticare_")) {
      total += (localStorage.getItem(key) ?? "").length * 2;
    }
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}
