"use client";

import type { Professional } from "@/lib/professionals";

const LOCAL_KEY = "opticare_professionals";

const DEMO_PROFESSIONALS: Professional[] = [
  {
    id: "u1",
    name: "Dr. Ricardo Alves",
    specialty: "optometrista",
    register_number: "3223-05",
    register_type: "CBO 3223-05",
    email: "ricardo@opticare.local",
    active: true,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "u2",
    name: "Dra. Fernanda Costa",
    specialty: "optometrista",
    register_number: "3223-05",
    register_type: "CBO 3223-05",
    email: "fernanda@opticare.local",
    active: true,
    is_default: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "u3",
    name: "Dr. Paulo Mendes",
    specialty: "oftalmologista",
    register_number: "123456",
    register_type: "CRM",
    active: true,
    is_default: false,
    created_at: "2025-01-01T00:00:00Z",
  },
];

function loadRaw(): Professional[] {
  if (typeof window === "undefined") return DEMO_PROFESSIONALS;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : DEMO_PROFESSIONALS;
  } catch {
    return DEMO_PROFESSIONALS;
  }
}

function saveRaw(professionals: Professional[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(professionals));
}

function ensureSingleDefault(professionals: Professional[]): Professional[] {
  const activeDefault = professionals.find((p) => p.active && p.is_default);
  if (activeDefault) {
    return professionals.map((p) => ({
      ...p,
      is_default: p.id === activeDefault.id,
    }));
  }
  const firstActive = professionals.find((p) => p.active);
  if (!firstActive) return professionals;
  return professionals.map((p) => ({
    ...p,
    is_default: p.id === firstActive.id,
  }));
}

export function resolveProfessionalNameSync(
  professionalId?: string,
): string | undefined {
  if (!professionalId) return undefined;
  return loadRaw().find((p) => p.id === professionalId)?.name;
}

export function getProfessionalByIdSync(
  professionalId?: string,
): Professional | undefined {
  if (!professionalId) return undefined;
  return loadRaw().find((p) => p.id === professionalId);
}

export async function loadProfessionals(options?: {
  activeOnly?: boolean;
}): Promise<Professional[]> {
  const list = loadRaw();
  if (options?.activeOnly) {
    return list.filter((p) => p.active);
  }
  return list;
}

export async function getDefaultProfessional(): Promise<Professional | undefined> {
  const list = await loadProfessionals({ activeOnly: true });
  return list.find((p) => p.is_default) ?? list[0];
}

export async function saveProfessional(
  professional: Omit<Professional, "created_at"> & { created_at?: string },
): Promise<Professional> {
  const full: Professional = {
    ...professional,
    id: professional.id || crypto.randomUUID(),
    created_at: professional.created_at ?? new Date().toISOString(),
  };

  let updated = [...loadRaw()];
  const idx = updated.findIndex((p) => p.id === full.id);
  if (idx >= 0) updated[idx] = full;
  else updated.unshift(full);

  if (full.is_default) {
    updated = updated.map((p) => ({
      ...p,
      is_default: p.id === full.id,
    }));
  } else {
    updated = ensureSingleDefault(updated);
  }

  saveRaw(updated);
  return full;
}

export async function setDefaultProfessional(id: string): Promise<void> {
  const updated = loadRaw().map((p) => ({
    ...p,
    is_default: p.id === id,
  }));
  saveRaw(ensureSingleDefault(updated));
}

export async function deleteProfessional(id: string): Promise<void> {
  const updated = ensureSingleDefault(loadRaw().filter((p) => p.id !== id));
  saveRaw(updated);
}
