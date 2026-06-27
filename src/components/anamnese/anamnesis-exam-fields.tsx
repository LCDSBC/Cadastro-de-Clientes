"use client";

import { Input, Textarea } from "@/components/ui/input";
import type { EyeRefraction } from "@/lib/anamnesis";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-800">
      {children}
    </h3>
  );
}

export function CheckboxChips({
  label,
  options,
  selected,
  onChange,
  color = "primary",
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  color?: "primary" | "amber" | "blue";
}) {
  const activeClass =
    color === "amber"
      ? "border-amber-500 bg-amber-50"
      : color === "blue"
        ? "border-blue-500 bg-blue-50"
        : "border-primary-500 bg-primary-50 text-primary-700";

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
              selected.includes(opt) ? activeClass : "border-slate-200"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function EyePairFields({
  labelOd = "OD",
  labelOe = "OE",
  od,
  oe,
  onOdChange,
  onOeChange,
  placeholder,
}: {
  labelOd?: string;
  labelOe?: string;
  od: string;
  oe: string;
  onOdChange: (v: string) => void;
  onOeChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label={labelOd}
        value={od}
        onChange={(e) => onOdChange(e.target.value)}
        placeholder={placeholder}
      />
      <Input
        label={labelOe}
        value={oe}
        onChange={(e) => onOeChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function RefractionFields({
  od,
  oe,
  onOdChange,
  onOeChange,
  showAdd = true,
}: {
  od: EyeRefraction;
  oe: EyeRefraction;
  onOdChange: (r: EyeRefraction) => void;
  onOeChange: (r: EyeRefraction) => void;
  showAdd?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Olho Direito (OD)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            label="Esférico"
            value={od.esf}
            onChange={(e) => onOdChange({ ...od, esf: e.target.value })}
            placeholder="-2.25"
          />
          <Input
            label="Cilíndrico"
            value={od.cil}
            onChange={(e) => onOdChange({ ...od, cil: e.target.value })}
            placeholder="-0.75"
          />
          <Input
            label="Eixo"
            value={od.eixo}
            onChange={(e) => onOdChange({ ...od, eixo: e.target.value })}
            placeholder="180"
          />
          {showAdd && (
            <Input
              label="Adição"
              value={od.add}
              onChange={(e) => onOdChange({ ...od, add: e.target.value })}
              placeholder="1.50"
            />
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Olho Esquerdo (OE)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            label="Esférico"
            value={oe.esf}
            onChange={(e) => onOeChange({ ...oe, esf: e.target.value })}
            placeholder="-2.00"
          />
          <Input
            label="Cilíndrico"
            value={oe.cil}
            onChange={(e) => onOeChange({ ...oe, cil: e.target.value })}
            placeholder="-0.50"
          />
          <Input
            label="Eixo"
            value={oe.eixo}
            onChange={(e) => onOeChange({ ...oe, eixo: e.target.value })}
            placeholder="175"
          />
          {showAdd && (
            <Input
              label="Adição"
              value={oe.add}
              onChange={(e) => onOeChange({ ...oe, add: e.target.value })}
              placeholder="1.50"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ExamObservations({
  value,
  onChange,
  label = "Observações do exame",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <Textarea
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      placeholder="Achados, limitações ou observações..."
    />
  );
}
