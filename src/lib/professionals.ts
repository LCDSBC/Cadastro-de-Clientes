export type ProfessionalSpecialty =
  | "optometrista"
  | "oftalmologista"
  | "ortoptista"
  | "medico"
  | "outro";

export interface Professional {
  id: string;
  name: string;
  specialty: ProfessionalSpecialty;
  register_number?: string;
  register_type?: string;
  email?: string;
  phone?: string;
  active: boolean;
  is_default: boolean;
  created_at: string;
}

export const SPECIALTY_LABELS: Record<ProfessionalSpecialty, string> = {
  optometrista: "Optometrista",
  oftalmologista: "Oftalmologista",
  ortoptista: "Ortoptista",
  medico: "Médico",
  outro: "Outro",
};

export const REGISTER_TYPE_OPTIONS = [
  "CBO 3223-05",
  "CRM",
  "CRO",
  "CREFITO",
  "Outro",
] as const;

export function professionalLabel(pro: Professional): string {
  const specialty = SPECIALTY_LABELS[pro.specialty];
  return `${pro.name} — ${specialty}`;
}

export function professionalRegisterLabel(pro: Professional): string {
  if (!pro.register_number) return "";
  return pro.register_type
    ? `${pro.register_type}: ${pro.register_number}`
    : pro.register_number;
}
