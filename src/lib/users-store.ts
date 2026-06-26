"use client";

import { STORE_BRANCHES } from "@/lib/inventory-savwin";

export type UserRole = "admin" | "gerente" | "vendedor" | "optometrista" | "caixa";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  store_id: string;
  active: boolean;
  password_hint?: string;
  permissions: string[];
  created_at: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  optometrista: "Optometrista",
  caixa: "Caixa",
};

export const ALL_PERMISSIONS = [
  "vendas",
  "estoque",
  "financeiro",
  "laboratorio",
  "clinica",
  "relatorios",
  "configuracoes",
  "clientes",
] as const;

const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [...ALL_PERMISSIONS],
  gerente: ["vendas", "estoque", "financeiro", "laboratorio", "clinica", "relatorios", "clientes"],
  vendedor: ["vendas", "clientes", "estoque"],
  optometrista: ["clinica", "clientes"],
  caixa: ["vendas", "financeiro", "clientes"],
};

const DEMO_USERS: AppUser[] = [
  {
    id: "u1",
    name: "Administrador",
    email: "admin@opticare.local",
    role: "admin",
    store_id: STORE_BRANCHES[0].id,
    active: true,
    password_hint: "admin123",
    permissions: DEFAULT_PERMISSIONS.admin,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "u2",
    name: "Carlos Vendedor",
    email: "carlos@opticare.local",
    role: "vendedor",
    store_id: STORE_BRANCHES[0].id,
    active: true,
    permissions: DEFAULT_PERMISSIONS.vendedor,
    created_at: "2025-01-01T00:00:00Z",
  },
];

const USERS_KEY = "opticare_users";
const ACTIVE_STORE_KEY = "opticare_active_store";

function loadUsers(): AppUser[] {
  if (typeof window === "undefined") return DEMO_USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  } catch {
    return DEMO_USERS;
  }
}

function saveUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function loadAppUsers(): Promise<AppUser[]> {
  return loadUsers();
}

export async function saveAppUser(
  user: Omit<AppUser, "created_at" | "permissions"> & {
    created_at?: string;
    permissions?: string[];
  },
): Promise<AppUser> {
  const full: AppUser = {
    ...user,
    id: user.id || crypto.randomUUID(),
    permissions: user.permissions ?? DEFAULT_PERMISSIONS[user.role],
    created_at: user.created_at ?? new Date().toISOString(),
  };
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === full.id);
  const updated = [...users];
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);
  saveUsers(updated);
  return full;
}

export async function deleteAppUser(id: string): Promise<void> {
  saveUsers(loadUsers().filter((u) => u.id !== id));
}

export function getActiveStoreId(): string {
  if (typeof window === "undefined") return STORE_BRANCHES[0].id;
  return localStorage.getItem(ACTIVE_STORE_KEY) ?? STORE_BRANCHES[0].id;
}

export function setActiveStoreId(storeId: string): void {
  localStorage.setItem(ACTIVE_STORE_KEY, storeId);
}

export function getActiveStoreName(): string {
  const id = getActiveStoreId();
  return STORE_BRANCHES.find((s) => s.id === id)?.name ?? "Matriz";
}

export async function loadSalespeople(): Promise<AppUser[]> {
  const users = await loadAppUsers();
  return users.filter(
    (u) => u.active && (u.role === "vendedor" || u.role === "gerente" || u.role === "admin"),
  );
}
