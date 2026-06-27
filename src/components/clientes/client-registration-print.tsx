import type { Client, StoreSettings } from "@/lib/types";
import { formatCpfCnpj, formatDate, formatPhone } from "@/lib/utils";
import { PrintField } from "@/components/prontuarios/document-print-layout";
import { PrintClinicHeader } from "@/components/prontuarios/print-clinic-header";
import { ClinicalPrintPage } from "@/components/prontuarios/clinical-print-page";

interface ClientRegistrationPrintProps {
  client: Client;
  store?: StoreSettings | null;
}

export function ClientRegistrationPrint({ client, store }: ClientRegistrationPrintProps) {
  const clinicName = store?.name ?? "Ótica OptiCare";

  return (
    <ClinicalPrintPage>
      <header className="mb-6 border-b-2 border-slate-800 pb-4">
        <PrintClinicHeader
          name={clinicName}
          cnpj={store?.cnpj}
          address={store?.address}
          city={store?.city}
          state={store?.state}
          phone={store?.phone}
        />
        <h2 className="mt-4 text-center text-xl font-bold italic tracking-wide text-slate-800">
          Ficha de Cadastro do Cliente
        </h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-4 rounded border border-slate-200 p-4">
        <PrintField label="Nome completo" value={client.name} className="col-span-2" />
        <PrintField
          label="CPF"
          value={client.cpf ? formatCpfCnpj(client.cpf.replace(/\D/g, "")) : ""}
        />
        <PrintField
          label="Data de nascimento"
          value={client.birth_date ? formatDate(client.birth_date) : ""}
        />
        <PrintField label="E-mail" value={client.email} />
        <PrintField
          label="Telefone"
          value={client.phone ? formatPhone(client.phone) : ""}
        />
        <PrintField label="Endereço" value={client.address} className="col-span-2" />
        <PrintField label="Cidade" value={client.city} />
        <PrintField label="Estado" value={client.state} />
        <PrintField label="CEP" value={client.zip_code} />
        <PrintField
          label="Cadastrado em"
          value={formatDate(client.created_at)}
        />
        <PrintField label="Observações" value={client.notes} className="col-span-2" />
      </section>

      <footer className="mt-10 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
        Documento gerado automaticamente pelo OptiCare ERP em{" "}
        {formatDate(new Date().toISOString())}
      </footer>
    </ClinicalPrintPage>
  );
}
