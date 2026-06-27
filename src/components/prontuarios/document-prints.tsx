import type { DocumentFormData } from "@/lib/document-form";
import { formatRefractionLine } from "@/lib/document-form";
import { DocumentPrintLayout, PrintField } from "./document-print-layout";
import { formatCpfCnpj, formatDate } from "@/lib/utils";

export function ReceitaOculosPrint({ data }: { data: DocumentFormData }) {
  return (
    <DocumentPrintLayout
      data={data}
      title="Laudo Optométrico"
      showPatientSignature={false}
      showOptometricDisclaimer
    >
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
          Prescrição Oftálmica
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left">Olho</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Esférico</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Cilíndrico</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Eixo</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Adição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OD</td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.od_esf || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.od_cil || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.od_eixo ? `${data.refraction.od_eixo}°` : "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.od_add || "—"}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OE</td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.oe_esf || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.oe_cil || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.oe_eixo ? `${data.refraction.oe_eixo}°` : "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.refraction.oe_add || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6 grid grid-cols-3 gap-4">
        <PrintField label="Distância pupilar (DP)" value={`${data.refraction.dp} mm`} />
        <PrintField label="Tipo de lente" value={data.lens_type} />
        <PrintField
          label="Validade"
          value={data.valid_until ? formatDate(data.valid_until) : ""}
        />
      </section>

      {data.observacoes && (
        <section className="mb-4">
          <PrintField label="Observações" value={data.observacoes} />
        </section>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-600">
        Esta receita é válida por 1 (um) ano a partir da data de emissão, conforme
        legislação vigente. O paciente tem direito de adquirir seus óculos em
        qualquer estabelecimento de sua preferência.
      </p>
    </DocumentPrintLayout>
  );
}

export function LaudoAcuidadePrint({ data }: { data: DocumentFormData }) {
  return (
    <DocumentPrintLayout
      data={data}
      title="Laudo de Acuidade Visual"
      showPatientSignature={false}
      showOptometricDisclaimer
    >
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
          Resultados do Exame
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left">Olho</th>
              <th className="border border-slate-300 px-3 py-2 text-center">
                Sem correção
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center">
                Com correção
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OD</td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.acuity_od_sc || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.acuity_od_cc || "—"}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OE</td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.acuity_oe_sc || "—"}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-center">
                {data.acuity_oe_cc || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4">
        <PrintField label="Tipo de teste" value={data.test_type} />
        <PrintField label="Distância do teste" value={data.test_distance} />
      </section>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-bold uppercase text-slate-700">Refração</h3>
        <p className="text-sm">
          <strong>OD:</strong>{" "}
          {formatRefractionLine(
            data.refraction.od_esf,
            data.refraction.od_cil,
            data.refraction.od_eixo,
            data.refraction.od_add,
          )}
        </p>
        <p className="mt-1 text-sm">
          <strong>OE:</strong>{" "}
          {formatRefractionLine(
            data.refraction.oe_esf,
            data.refraction.oe_cil,
            data.refraction.oe_eixo,
            data.refraction.oe_add,
          )}
        </p>
      </section>

      <section>
        <PrintField label="Conclusão / Parecer técnico" value={data.conclusao} />
      </section>
    </DocumentPrintLayout>
  );
}

export function FichaClinicaPrint({ data }: { data: DocumentFormData }) {
  return (
    <DocumentPrintLayout
      data={data}
      title="Ficha Clínica Optométrica"
      showPatientSignature={false}
      showOptometricDisclaimer
    >
      <section className="mb-4 space-y-4">
        <PrintField label="Queixa principal" value={data.queixa_principal} />
        <PrintField label="Anamnese" value={data.anamnese} />
        <PrintField label="Histórico ocular" value={data.historico_ocular} />
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
          Exame Clínico
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <PrintField label="Acuidade OD (SC/CC)" value={`${data.acuity_od_sc} / ${data.acuity_od_cc}`} />
          <PrintField label="Acuidade OE (SC/CC)" value={`${data.acuity_oe_sc} / ${data.acuity_oe_cc}`} />
          <PrintField label="Biomicroscopia" value={data.biomicroscopia} />
          <PrintField label="Tonometria" value={data.tonometria} />
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">Refração</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-3 py-2 text-left">Olho</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Esf</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Cil</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Eixo</th>
              <th className="border border-slate-300 px-3 py-2 text-center">Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OD</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.od_esf || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.od_cil || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.od_eixo || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.od_add || "—"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold">OE</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.oe_esf || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.oe_cil || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.oe_eixo || "—"}</td>
              <td className="border border-slate-300 px-3 py-2 text-center">{data.refraction.oe_add || "—"}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-sm">DP: {data.refraction.dp || "—"} mm</p>
      </section>

      <section>
        <PrintField label="Conduta / Observações" value={data.observacoes || data.conclusao} />
      </section>
    </DocumentPrintLayout>
  );
}

export function DeclaracaoComparecimentoPrint({ data }: { data: DocumentFormData }) {
  return (
    <DocumentPrintLayout data={data} title="Declaração de Comparecimento">
      <section className="my-8 space-y-6 text-sm leading-relaxed">
        <p>
          Declaro, para os devidos fins, que o(a) paciente{" "}
          <strong>{data.patient.name || "___________________________"}</strong>,
          portador(a) do CPF{" "}
          <strong>
            {data.patient.cpf
              ? formatCpfCnpj(data.patient.cpf.replace(/\D/g, ""))
              : "___________________"}
          </strong>
          , compareceu a este estabelecimento no dia{" "}
          <strong>{formatDate(data.exam_date)}</strong>, no período das{" "}
          <strong>{data.horario_entrada}</strong> às{" "}
          <strong>{data.horario_saida}</strong>, para realização de exame
          optométrico de acuidade visual.
        </p>
        <p>
          Por ser verdade, firmo a presente declaração.
        </p>
        <p className="text-slate-600">
          {data.clinic.city}/{data.clinic.state}, {formatDate(data.exam_date)}.
        </p>
      </section>
    </DocumentPrintLayout>
  );
}

export function GuiaEncaminhamentoPrint({ data }: { data: DocumentFormData }) {
  return (
    <DocumentPrintLayout data={data} title="Guia de Encaminhamento">
      <section className="mb-6 grid grid-cols-2 gap-4">
        <PrintField label="Especialidade de destino" value={data.especialidade_destino} />
        <PrintField label="Profissional solicitante" value={data.optometrist} />
      </section>

      <section className="mb-6 space-y-4">
        <PrintField label="Motivo do encaminhamento" value={data.motivo_encaminhamento} />
        <PrintField label="Queixa principal" value={data.queixa_principal} />
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
          Dados do exame realizado
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <PrintField label="Acuidade OD" value={`SC: ${data.acuity_od_sc} | CC: ${data.acuity_od_cc}`} />
          <PrintField label="Acuidade OE" value={`SC: ${data.acuity_oe_sc} | CC: ${data.acuity_oe_cc}`} />
        </div>
        <div className="mt-3 text-sm">
          <p>
            <strong>OD:</strong>{" "}
            {formatRefractionLine(
              data.refraction.od_esf,
              data.refraction.od_cil,
              data.refraction.od_eixo,
            )}
          </p>
          <p className="mt-1">
            <strong>OE:</strong>{" "}
            {formatRefractionLine(
              data.refraction.oe_esf,
              data.refraction.oe_cil,
              data.refraction.oe_eixo,
            )}
          </p>
        </div>
      </section>

      <section>
        <PrintField label="Observações clínicas" value={data.observacoes} />
      </section>

      <p className="mt-6 text-xs text-slate-600">
        Solicito avaliação especializada conforme motivo acima descrito. Casos
        suspeitos de patologia ocular devem ser encaminhados ao médico
        oftalmologista.
      </p>
    </DocumentPrintLayout>
  );
}
