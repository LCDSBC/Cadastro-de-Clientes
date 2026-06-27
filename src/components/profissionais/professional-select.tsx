"use client";

import { useEffect, useRef, useState } from "react";
import { Select } from "@/components/ui/input";
import {
  loadProfessionals,
  getDefaultProfessional,
  getProfessionalByIdSync,
} from "@/lib/professionals-store";
import {
  professionalLabel,
  professionalRegisterLabel,
  type Professional,
} from "@/lib/professionals";

interface ProfessionalSelectProps {
  label?: string;
  value: string;
  onChange: (professionalId: string, professional: Professional | null) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  autoDefault?: boolean;
}

export function ProfessionalSelect({
  label = "Profissional",
  value,
  onChange,
  allowEmpty = true,
  emptyLabel = "Selecione o profissional...",
  className,
  autoDefault = false,
}: ProfessionalSelectProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const didAutoDefault = useRef(false);

  useEffect(() => {
    loadProfessionals({ activeOnly: true }).then((list) => {
      setProfessionals(list);
      setLoading(false);
      if (
        autoDefault &&
        !didAutoDefault.current &&
        !value &&
        list.length > 0
      ) {
        didAutoDefault.current = true;
        const def = list.find((p) => p.is_default) ?? list[0];
        onChange(def.id, def);
      }
    });
  }, [autoDefault, onChange, value]);

  const selected = value
    ? professionals.find((p) => p.id === value) ?? getProfessionalByIdSync(value)
    : undefined;

  return (
    <div className={className}>
      <Select
        label={label}
        value={value}
        onChange={(e) => {
          const id = e.target.value;
          const pro =
            professionals.find((p) => p.id === id) ??
            getProfessionalByIdSync(id) ??
            null;
          onChange(id, pro);
        }}
        options={[
          ...(allowEmpty ? [{ value: "", label: emptyLabel }] : []),
          ...professionals.map((p) => ({
            value: p.id,
            label: professionalLabel(p),
          })),
        ]}
        disabled={loading}
      />
      {selected && professionalRegisterLabel(selected) && (
        <p className="mt-1 text-xs text-slate-500">
          Registro: {professionalRegisterLabel(selected)}
        </p>
      )}
      {!loading && professionals.length === 0 && (
        <p className="mt-1 text-xs text-amber-600">
          Nenhum profissional cadastrado. Cadastre em Configurações → Profissionais.
        </p>
      )}
    </div>
  );
}

export function useDefaultProfessional(): Professional | undefined {
  const [professional, setProfessional] = useState<Professional | undefined>();

  useEffect(() => {
    void getDefaultProfessional().then(setProfessional);
  }, []);

  return professional;
}
