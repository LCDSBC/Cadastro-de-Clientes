import { formatCpfCnpj } from "@/lib/utils";
import { PrintHeaderEmblem } from "./print-header-emblem";

interface PrintClinicHeaderProps {
  name: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  extra?: React.ReactNode;
}

export function PrintClinicHeader({
  name,
  cnpj,
  address,
  city,
  state,
  phone,
  extra,
}: PrintClinicHeaderProps) {
  const cityStatePhone = [city, state].filter(Boolean).join("/");
  const contactLine = [cityStatePhone, phone ? `Tel: ${phone}` : ""]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <PrintHeaderEmblem />
      <div>
        <h1 className="text-lg font-bold uppercase tracking-wide">{name}</h1>
        {cnpj && (
          <p className="mt-1 text-xs text-slate-600">
            CNPJ: {formatCpfCnpj(cnpj.replace(/\D/g, "")) || cnpj}
          </p>
        )}
        {address && <p className="text-xs text-slate-600">{address}</p>}
        {contactLine && <p className="text-xs text-slate-600">{contactLine}</p>}
        {extra}
      </div>
    </div>
  );
}

export const PRINT_TITLE_DEFAULT_CLASS =
  "mt-4 text-center text-base font-bold uppercase tracking-wider text-slate-800";

export const PRINT_TITLE_LAUDO_CLASS =
  "mt-4 text-center text-2xl font-semibold italic tracking-wide text-slate-800";
