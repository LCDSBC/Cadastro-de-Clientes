import type { AcuityExam } from "@/lib/types";
import type { StoreSettings } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PrintClinicHeader } from "@/components/prontuarios/print-clinic-header";
import { ClinicalPrintPage } from "@/components/prontuarios/clinical-print-page";

interface AcuityResultsPrintProps {
  clientName: string;
  exams: AcuityExam[];
  store?: StoreSettings | null;
}

export function AcuityResultsPrint({ clientName, exams, store }: AcuityResultsPrintProps) {
  const clinicName = store?.name ?? "Ótica OptiCare";
  const sorted = [...exams].sort(
    (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime(),
  );

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
          Resultados de Acuidade Visual
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">Paciente: {clientName}</p>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum teste registrado.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left text-xs uppercase text-slate-600">
              <th className="py-2 pr-2">Data</th>
              <th className="py-2 pr-2">Teste</th>
              <th className="py-2 pr-2">Dist.</th>
              <th className="py-2 pr-2">Olho</th>
              <th className="py-2 pr-2">Resultado</th>
              <th className="py-2">Profissional</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((exam) => (
              <tr key={exam.id} className="border-b border-slate-200">
                <td className="py-2 pr-2">{formatDate(exam.performed_at)}</td>
                <td className="py-2 pr-2">{exam.test_type}</td>
                <td className="py-2 pr-2">{exam.distance_meters}m</td>
                <td className="py-2 pr-2">{exam.eye}</td>
                <td className="py-2 pr-2 font-medium">
                  {exam.result_acuity ?? exam.result_logmar ?? "—"}
                </td>
                <td className="py-2">{exam.performed_by ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="mt-10 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
        Total de {sorted.length} teste(s) · Gerado em {formatDate(new Date().toISOString())}
      </footer>
    </ClinicalPrintPage>
  );
}
