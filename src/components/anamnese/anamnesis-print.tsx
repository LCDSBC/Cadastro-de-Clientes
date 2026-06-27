import type { StructuredAnamnesis } from "@/lib/anamnesis";
import { formatRefractionShort } from "@/lib/anamnesis";
import type { Client } from "@/lib/types";
import type { StoreSettings } from "@/lib/types";
import { formatCpfCnpj, formatDate } from "@/lib/utils";
import { PrintField } from "@/components/prontuarios/document-print-layout";
import { OptometricDisclaimer } from "@/components/prontuarios/optometric-disclaimer";
import { PrintHeaderEmblem } from "@/components/prontuarios/print-header-emblem";

interface AnamnesisPrintProps {
  record: StructuredAnamnesis;
  client?: Client | null;
  store?: StoreSettings | null;
}

function PrintSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 break-inside-avoid">
      <h3 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">—</p>;
  return (
    <p className="text-sm text-slate-800">{items.join(" · ")}</p>
  );
}

function BoolLabel({ value, yes = "Sim", no = "Não" }: { value?: boolean; yes?: string; no?: string }) {
  return <span>{value ? yes : no}</span>;
}

export function AnamnesisPrint({ record, client, store }: AnamnesisPrintProps) {
  const ex = record.exames;
  const clinicName = store?.name ?? "Ótica OptiCare";
  const clinicCnpj = store?.cnpj ?? "";
  const clinicAddress = [store?.address, store?.city, store?.state]
    .filter(Boolean)
    .join(" — ");
  const clinicPhone = store?.phone ?? "";

  return (
    <div className="document-print mx-auto max-w-[210mm] bg-white p-8 text-slate-900">
      <header className="mb-6 border-b-2 border-slate-800 pb-4">
        <div className="flex items-start gap-4">
          <PrintHeaderEmblem />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold uppercase tracking-wide">{clinicName}</h1>
              {clinicCnpj && (
                <p className="mt-1 text-xs text-slate-600">
                  CNPJ: {formatCpfCnpj(clinicCnpj.replace(/\D/g, "")) || clinicCnpj}
                </p>
              )}
              {clinicAddress && <p className="text-xs text-slate-600">{clinicAddress}</p>}
              {clinicPhone && (
                <p className="text-xs text-slate-600">Tel: {clinicPhone}</p>
              )}
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="text-xs text-slate-500">Data do exame</p>
              <p className="font-semibold">{formatDate(record.exam_date)}</p>
              {record.horario_entrada && (
                <p className="mt-1 text-xs text-slate-500">
                  Entrada: {record.horario_entrada}
                  {record.horario_saida ? ` — Saída: ${record.horario_saida}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
        <h2 className="mt-4 text-center text-base font-bold uppercase tracking-wider text-slate-800">
          Ficha de Anamnese e Exame Clínico Oftalmológico
        </h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 rounded border border-slate-200 p-4">
        <PrintField
          label="Paciente"
          value={client?.name ?? record.client_name}
          className="col-span-2"
        />
        <PrintField
          label="CPF"
          value={
            client?.cpf
              ? formatCpfCnpj(client.cpf.replace(/\D/g, ""))
              : ""
          }
        />
        <PrintField
          label="Data de nascimento"
          value={client?.birth_date ? formatDate(client.birth_date) : ""}
        />
        <PrintField label="Telefone" value={client?.phone} />
        <PrintField label="Sexo" value={record.sexo} />
        <PrintField label="Profissão" value={record.profissao ?? record.atividade_profissional} />
        <PrintField label="Escolaridade" value={record.escolaridade} />
        <PrintField
          label="Endereço"
          value={
            client?.address
              ? [client.address, client.city, client.state].filter(Boolean).join(", ")
              : ""
          }
          className="col-span-2"
        />
      </section>

      <PrintSection title="Queixa e sintomas">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Queixa principal" value={record.queixa_principal} className="sm:col-span-2" />
          <PrintField label="Tempo dos sintomas" value={record.tempo_sintomas} />
          <PrintField label="História da doença atual" value={record.historia_doenca_atual} className="sm:col-span-2" />
        </div>
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Sintomas</p>
          <ChipList items={record.sintomas} />
        </div>
      </PrintSection>

      <PrintSection title="Histórico geral">
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Doenças sistêmicas</p>
          <ChipList items={record.doencas_sistemicas} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Medicamentos em uso" value={record.medicamentos_uso} />
          <PrintField label="Alergias" value={record.alergias} />
          <PrintField label="Tabagismo" value={record.tabagismo} />
          <PrintField label="Etilismo" value={record.etilismo} />
          <PrintField
            label="Gestante"
            value={record.gestante === undefined ? "" : record.gestante ? "Sim" : "Não"}
          />
          <PrintField label="Histórico familiar" value={record.historico_familiar} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Histórico ocular">
        <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
          <p>Usa óculos: <BoolLabel value={record.uso_oculos} /></p>
          <p>Usa lente de contato: <BoolLabel value={record.uso_lente_contato} /></p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Tempo de uso de correção" value={record.tempo_uso_lentes} />
          <PrintField label="Tipo de lente atual" value={record.tipo_lente_atual} />
          <PrintField label="Grau atual OD" value={record.grau_atual_od} />
          <PrintField label="Grau atual OE" value={record.grau_atual_oe} />
          <PrintField label="Cirurgias oculares" value={record.cirurgias_oculares} />
          <PrintField label="Traumatismos oculares" value={record.traumatismos_oculares} />
          <PrintField
            label="Último exame oftalmológico"
            value={record.ultimo_exame_oftalmo ? formatDate(record.ultimo_exame_oftalmo) : ""}
          />
        </div>
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Condições oculares</p>
          <ChipList items={record.doencas_oculares} />
        </div>
      </PrintSection>

      <PrintSection title="Hábitos visuais">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Tempo de tela (h/dia)" value={record.tempo_tela_horas} />
          <PrintField label="Atividade profissional" value={record.atividade_profissional} />
          <PrintField label="Uso de proteção visual" value={record.uso_protecao_visual} />
          <PrintField label="Atividades de lazer" value={record.atividades_lazer} />
        </div>
      </PrintSection>

      <PrintSection title="Acuidade visual">
        <table className="mb-3 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-2 py-1 text-left">Olho</th>
              <th className="border border-slate-300 px-2 py-1 text-center">Sem correção</th>
              <th className="border border-slate-300 px-2 py-1 text-center">Com correção</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2 py-1 font-semibold">OD</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.od_sc || "—"}</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.od_cc || "—"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-1 font-semibold">OE</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.oe_sc || "—"}</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.oe_cc || "—"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-2 py-1 font-semibold">AO</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.ao_sc || "—"}</td>
              <td className="border border-slate-300 px-2 py-1 text-center">{ex.acuidade_visual.ao_cc || "—"}</td>
            </tr>
          </tbody>
        </table>
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Tipo de teste" value={ex.acuidade_visual.tipo_teste} />
          <PrintField label="Distância" value={ex.acuidade_visual.distancia} />
          <PrintField label="Observações" value={ex.acuidade_visual.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Lensometria">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.lensometria.od} />
          <PrintField label="OE" value={ex.lensometria.oe} />
        </div>
      </PrintSection>

      <PrintSection title="Auto-refrator">
        <p className="text-sm"><strong>OD:</strong> {formatRefractionShort(ex.auto_refrator.od)}</p>
        <p className="mt-1 text-sm"><strong>OE:</strong> {formatRefractionShort(ex.auto_refrator.oe)}</p>
      </PrintSection>

      <PrintSection title="Refração subjetiva">
        <p className="text-sm"><strong>OD:</strong> {formatRefractionShort(ex.refracao_subjetiva.od)}</p>
        <p className="mt-1 text-sm"><strong>OE:</strong> {formatRefractionShort(ex.refracao_subjetiva.oe)}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <PrintField label="DP (mm)" value={ex.refracao_subjetiva.dp} />
          <PrintField label="DNP OD" value={ex.refracao_subjetiva.dnp_od} />
          <PrintField label="DNP OE" value={ex.refracao_subjetiva.dnp_oe} />
        </div>
      </PrintSection>

      <PrintSection title="Ceratometria">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD K1" value={ex.ceratometria.od_k1} />
          <PrintField label="OD K2" value={ex.ceratometria.od_k2} />
          <PrintField label="OD Eixo" value={ex.ceratometria.od_eixo} />
          <PrintField label="OE K1" value={ex.ceratometria.oe_k1} />
          <PrintField label="OE K2" value={ex.ceratometria.oe_k2} />
          <PrintField label="OE Eixo" value={ex.ceratometria.oe_eixo} />
        </div>
      </PrintSection>

      <PrintSection title="Tonometria (PIO)">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD (mmHg)" value={ex.tonometria.od_mmhg} />
          <PrintField label="OE (mmHg)" value={ex.tonometria.oe_mmhg} />
          <PrintField label="Método" value={ex.tonometria.metodo} />
          <PrintField label="Horário" value={ex.tonometria.horario} />
          <PrintField label="Observações" value={ex.tonometria.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Biomicroscopia (lâmpada de fenda)">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.biomicroscopia.od} />
          <PrintField label="OE" value={ex.biomicroscopia.oe} />
          <PrintField label="Observações" value={ex.biomicroscopia.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Fundoscopia / Mapeamento de retina">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.fundoscopia.od} />
          <PrintField label="OE" value={ex.fundoscopia.oe} />
          <PrintField label="Observações" value={ex.fundoscopia.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Motilidade ocular">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.motilidade_ocular.od} />
          <PrintField label="OE" value={ex.motilidade_ocular.oe} />
          <PrintField label="Observações" value={ex.motilidade_ocular.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Cover test">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="À distância" value={ex.cover_test.distancia} />
          <PrintField label="De perto" value={ex.cover_test.perto} />
          <PrintField label="Observações" value={ex.cover_test.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Teste de Hirschberg">
        <PrintField label="Resultado" value={ex.hirschberg} />
      </PrintSection>

      <PrintSection title="Pupilas">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Tamanho OD" value={ex.pupilas.od_tamanho} />
          <PrintField label="Tamanho OE" value={ex.pupilas.oe_tamanho} />
          <PrintField label="Simetria" value={ex.pupilas.simetria} />
          <PrintField label="Reflexos" value={ex.pupilas.reflexos} />
          <PrintField label="Observações" value={ex.pupilas.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Campo visual">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.campo_visual.od} />
          <PrintField label="OE" value={ex.campo_visual.oe} />
          <PrintField label="Método" value={ex.campo_visual.metodo} />
          <PrintField label="Observações" value={ex.campo_visual.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Teste de cores (Ishihara)">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.teste_cores.ishihara_od} />
          <PrintField label="OE" value={ex.teste_cores.ishihara_oe} />
          <PrintField label="Observações" value={ex.teste_cores.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Sensibilidade ao contraste">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="OD" value={ex.teste_contraste.od} />
          <PrintField label="OE" value={ex.teste_contraste.oe} />
          <PrintField label="Observações" value={ex.teste_contraste.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Filme lacrimal (Schirmer / BUT)">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Schirmer OD (mm)" value={ex.filme_lacrimal.od_schirmer} />
          <PrintField label="Schirmer OE (mm)" value={ex.filme_lacrimal.oe_schirmer} />
          <PrintField label="BUT OD (s)" value={ex.filme_lacrimal.od_but} />
          <PrintField label="BUT OE (s)" value={ex.filme_lacrimal.oe_but} />
          <PrintField label="Observações" value={ex.filme_lacrimal.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Acomodação">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Amplitude acomodativa OD" value={ex.acomodacao.od_aa} />
          <PrintField label="Amplitude acomodativa OE" value={ex.acomodacao.oe_aa} />
          <PrintField label="Acomodação relativa OD" value={ex.acomodacao.od_ar} />
          <PrintField label="Acomodação relativa OE" value={ex.acomodacao.oe_ar} />
          <PrintField label="Observações" value={ex.acomodacao.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Foria / Phoria">
        <div className="grid gap-3 sm:grid-cols-2">
          <PrintField label="Distância — horizontal" value={ex.foria.distancia_horizontal} />
          <PrintField label="Distância — vertical" value={ex.foria.distancia_vertical} />
          <PrintField label="Perto — horizontal" value={ex.foria.perto_horizontal} />
          <PrintField label="Perto — vertical" value={ex.foria.perto_vertical} />
          <PrintField label="Observações" value={ex.foria.observacoes} className="sm:col-span-2" />
        </div>
      </PrintSection>

      <PrintSection title="Estereopsia">
        <PrintField label="Resultado" value={ex.estereopsia} />
      </PrintSection>

      <PrintSection title="Sensibilidade ao desfoque">
        <PrintField label="Resultado" value={ex.sensibilidade_desfoque} />
      </PrintSection>

      {(record.conclusao || record.conduta || record.encaminhamento_especialidade) && (
        <PrintSection title="Conclusão e conduta">
          <div className="grid gap-3">
            <PrintField label="Conclusão / Parecer" value={record.conclusao} />
            <PrintField label="Conduta" value={record.conduta} />
            <PrintField label="Encaminhamento" value={record.encaminhamento_especialidade} />
            <PrintField label="Motivo do encaminhamento" value={record.encaminhamento_motivo} />
            <PrintField label="Urgência" value={record.encaminhamento_urgencia} />
          </div>
        </PrintSection>
      )}

      {record.observacoes && (
        <PrintSection title="Observações gerais">
          <PrintField label="Observações" value={record.observacoes} />
        </PrintSection>
      )}

      <footer className="mt-8 border-t border-slate-300 pt-6 break-inside-avoid">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-slate-500">Profissional responsável</p>
            <p className="mt-8 border-t border-slate-400 pt-1 text-center text-sm">
              {record.optometrist || "___________________________"}
            </p>
            <p className="text-center text-xs text-slate-500">
              {record.register_number ?? "Registro profissional"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Assinatura do paciente</p>
            <p className="mt-8 border-t border-slate-400 pt-1 text-center text-sm">
              {client?.name ?? record.client_name ?? "___________________________"}
            </p>
          </div>
        </div>
        <OptometricDisclaimer className="mt-6" />
      </footer>
    </div>
  );
}
