import type { DocumentFormData } from "@/lib/document-form";
import { formatCpfCnpj, formatDate } from "@/lib/utils";
import { OptometricDisclaimer } from "./optometric-disclaimer";
import { ClinicalPrintPage } from "./clinical-print-page";
import {
  PrintClinicHeader,
  PRINT_TITLE_DEFAULT_CLASS,
} from "./print-clinic-header";

interface PrintLayoutProps {
  data: DocumentFormData;
  title: string;
  titleClassName?: string;
  children: React.ReactNode;
  showPatientSignature?: boolean;
  showOptometricDisclaimer?: boolean;
}

function PrintField({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <p className="mt-0.5 min-h-[1.25rem] border-b border-slate-300 text-sm text-slate-900">
        {value || "\u00A0"}
      </p>
    </div>
  );
}

export function DocumentPrintLayout({
  data,
  title,
  titleClassName = PRINT_TITLE_DEFAULT_CLASS,
  children,
  showPatientSignature = true,
  showOptometricDisclaimer = false,
}: PrintLayoutProps) {
  return (
    <ClinicalPrintPage>
      <header className="mb-6 border-b-2 border-slate-800 pb-4">
        <PrintClinicHeader
          name={data.clinic.name}
          cnpj={data.clinic.cnpj}
          address={data.clinic.address}
          city={data.clinic.city}
          state={data.clinic.state}
          phone={data.clinic.phone}
        />
        <h2 className={titleClassName}>{title}</h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-4 rounded border border-slate-200 p-4">
        <PrintField label="Paciente" value={data.patient.name} className="col-span-2" />
        <PrintField
          label="CPF"
          value={
            data.patient.cpf
              ? formatCpfCnpj(data.patient.cpf.replace(/\D/g, ""))
              : ""
          }
        />
        <PrintField
          label="Data de nascimento"
          value={data.patient.birth_date ? formatDate(data.patient.birth_date) : ""}
        />
        <PrintField label="Telefone" value={data.patient.phone} />
        <PrintField label="Endereço" value={data.patient.address} />
      </section>

      {children}

      <footer className="mt-10 border-t border-slate-300 pt-6">
        <div
          className={`grid gap-8 ${
            showPatientSignature ? "grid-cols-3" : "grid-cols-2 max-w-2xl"
          }`}
        >
          <div>
            <p className="text-xs text-slate-500">Profissional responsável</p>
            <p className="mt-8 border-t border-slate-400 pt-1 text-center text-sm">
              {data.optometrist}
            </p>
            <p className="text-center text-xs text-slate-500">
              {data.register_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Data do exame</p>
            <p className="mt-8 border-t border-slate-400 pt-1 text-center text-sm font-semibold">
              {formatDate(data.exam_date)}
            </p>
          </div>
          {showPatientSignature && (
            <div>
              <p className="text-xs text-slate-500">Assinatura do paciente</p>
              <p className="mt-8 border-t border-slate-400 pt-1 text-center text-sm">
                {data.patient.name || "___________________________"}
              </p>
            </div>
          )}
        </div>
        {showOptometricDisclaimer && <OptometricDisclaimer className="mt-6" />}
      </footer>
    </ClinicalPrintPage>
  );
}

export { PrintField };
