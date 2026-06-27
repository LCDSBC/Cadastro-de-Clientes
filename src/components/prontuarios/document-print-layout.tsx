import type { DocumentFormData } from "@/lib/document-form";
import { formatCpfCnpj, formatDate } from "@/lib/utils";
import { OptometricDisclaimer } from "./optometric-disclaimer";

interface PrintLayoutProps {
  data: DocumentFormData;
  title: string;
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
  children,
  showPatientSignature = true,
  showOptometricDisclaimer = false,
}: PrintLayoutProps) {
  return (
    <div className="document-print mx-auto max-w-[210mm] bg-white p-8 text-slate-900">
      <header className="mb-6 border-b-2 border-slate-800 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              {data.clinic.name}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              CNPJ: {formatCpfCnpj(data.clinic.cnpj.replace(/\D/g, "")) || data.clinic.cnpj}
            </p>
            <p className="text-xs text-slate-600">{data.clinic.address}</p>
            <p className="text-xs text-slate-600">
              {data.clinic.city}/{data.clinic.state} — Tel: {data.clinic.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Data do exame</p>
            <p className="font-semibold">{formatDate(data.exam_date)}</p>
          </div>
        </div>
        <h2 className="mt-4 text-center text-base font-bold uppercase tracking-wider text-slate-800">
          {title}
        </h2>
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
          className={
            showPatientSignature
              ? "grid grid-cols-2 gap-8"
              : "max-w-md"
          }
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
        <p className="mt-6 text-center text-[10px] text-slate-400">
          Documento emitido pelo Acuidade Visual Pró — OptiCare ERP
        </p>
      </footer>
    </div>
  );
}

export { PrintField };
