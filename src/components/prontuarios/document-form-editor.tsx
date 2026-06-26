"use client";

import type { DocumentFormData } from "@/lib/document-form";
import { Input, Select, Textarea } from "@/components/ui/input";

interface DocumentFormEditorProps {
  data: DocumentFormData;
  onChange: (data: DocumentFormData) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-800">
      {children}
    </h3>
  );
}

function RefractionFields({
  data,
  onChange,
  showAdd = true,
}: {
  data: DocumentFormData;
  onChange: (d: DocumentFormData) => void;
  showAdd?: boolean;
}) {
  const updateRef = (field: keyof DocumentFormData["refraction"], value: string) => {
    onChange({
      ...data,
      refraction: { ...data.refraction, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Olho Direito (OD)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input label="Esférico" value={data.refraction.od_esf} onChange={(e) => updateRef("od_esf", e.target.value)} placeholder="-2.25" />
          <Input label="Cilíndrico" value={data.refraction.od_cil} onChange={(e) => updateRef("od_cil", e.target.value)} placeholder="-0.75" />
          <Input label="Eixo" value={data.refraction.od_eixo} onChange={(e) => updateRef("od_eixo", e.target.value)} placeholder="180" />
          {showAdd && (
            <Input label="Adição" value={data.refraction.od_add} onChange={(e) => updateRef("od_add", e.target.value)} placeholder="1.50" />
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Olho Esquerdo (OE)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input label="Esférico" value={data.refraction.oe_esf} onChange={(e) => updateRef("oe_esf", e.target.value)} placeholder="-2.00" />
          <Input label="Cilíndrico" value={data.refraction.oe_cil} onChange={(e) => updateRef("oe_cil", e.target.value)} placeholder="-0.50" />
          <Input label="Eixo" value={data.refraction.oe_eixo} onChange={(e) => updateRef("oe_eixo", e.target.value)} placeholder="175" />
          {showAdd && (
            <Input label="Adição" value={data.refraction.oe_add} onChange={(e) => updateRef("oe_add", e.target.value)} placeholder="1.50" />
          )}
        </div>
      </div>
      <Input
        label="Distância pupilar (DP) mm"
        value={data.refraction.dp}
        onChange={(e) =>
          onChange({ ...data, refraction: { ...data.refraction, dp: e.target.value } })
        }
        placeholder="62"
      />
    </div>
  );
}

function AcuityFields({ data, onChange }: DocumentFormEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Input label="OD sem correção" value={data.acuity_od_sc} onChange={(e) => onChange({ ...data, acuity_od_sc: e.target.value })} placeholder="20/40" />
      <Input label="OE sem correção" value={data.acuity_oe_sc} onChange={(e) => onChange({ ...data, acuity_oe_sc: e.target.value })} placeholder="20/40" />
      <Input label="OD com correção" value={data.acuity_od_cc} onChange={(e) => onChange({ ...data, acuity_od_cc: e.target.value })} placeholder="20/20" />
      <Input label="OE com correção" value={data.acuity_oe_cc} onChange={(e) => onChange({ ...data, acuity_oe_cc: e.target.value })} placeholder="20/20" />
      <Input label="Tipo de teste" value={data.test_type} onChange={(e) => onChange({ ...data, test_type: e.target.value })} />
      <Input label="Distância" value={data.test_distance} onChange={(e) => onChange({ ...data, test_distance: e.target.value })} />
    </div>
  );
}

export function DocumentFormEditor({ data, onChange }: DocumentFormEditorProps) {
  const updatePatient = (field: keyof DocumentFormData["patient"], value: string) => {
    onChange({ ...data, patient: { ...data.patient, [field]: value } });
  };

  const updateClinic = (field: keyof DocumentFormData["clinic"], value: string) => {
    onChange({ ...data, clinic: { ...data.clinic, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Dados do paciente</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nome completo" required value={data.patient.name} onChange={(e) => updatePatient("name", e.target.value)} />
          <Input label="CPF" value={data.patient.cpf} onChange={(e) => updatePatient("cpf", e.target.value)} />
          <Input label="Data de nascimento" type="date" value={data.patient.birth_date} onChange={(e) => updatePatient("birth_date", e.target.value)} />
          <Input label="Telefone" value={data.patient.phone} onChange={(e) => updatePatient("phone", e.target.value)} />
          <Input label="Endereço" className="sm:col-span-2" value={data.patient.address} onChange={(e) => updatePatient("address", e.target.value)} />
        </div>
      </section>

      <section>
        <SectionTitle>Profissional e clínica</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Optometrista" value={data.optometrist} onChange={(e) => onChange({ ...data, optometrist: e.target.value })} />
          <Input label="Registro profissional" value={data.register_number} onChange={(e) => onChange({ ...data, register_number: e.target.value })} />
          <Input label="Data do exame" type="date" value={data.exam_date} onChange={(e) => onChange({ ...data, exam_date: e.target.value })} />
          <Input label="Nome da clínica/ótica" value={data.clinic.name} onChange={(e) => updateClinic("name", e.target.value)} />
          <Input label="CNPJ" value={data.clinic.cnpj} onChange={(e) => updateClinic("cnpj", e.target.value)} />
          <Input label="Telefone" value={data.clinic.phone} onChange={(e) => updateClinic("phone", e.target.value)} />
          <Input label="Endereço" className="sm:col-span-2" value={data.clinic.address} onChange={(e) => updateClinic("address", e.target.value)} />
          <Input label="Cidade" value={data.clinic.city} onChange={(e) => updateClinic("city", e.target.value)} />
          <Input label="UF" value={data.clinic.state} onChange={(e) => updateClinic("state", e.target.value)} maxLength={2} />
        </div>
      </section>

      {data.document_type === "receita_oculos" && (
        <section>
          <SectionTitle>Prescrição oftálmica</SectionTitle>
          <RefractionFields data={data} onChange={onChange} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Select
              label="Tipo de lente"
              value={data.lens_type}
              onChange={(e) => onChange({ ...data, lens_type: e.target.value })}
              options={[
                { value: "Monofocal", label: "Monofocal" },
                { value: "Bifocal", label: "Bifocal" },
                { value: "Multifocal", label: "Multifocal" },
                { value: "Ocupacional", label: "Ocupacional" },
                { value: "Lente de contato", label: "Lente de contato" },
              ]}
            />
            <Input label="Validade da receita" type="date" value={data.valid_until} onChange={(e) => onChange({ ...data, valid_until: e.target.value })} />
          </div>
          <div className="mt-3">
            <Textarea label="Observações" value={data.observacoes} onChange={(e) => onChange({ ...data, observacoes: e.target.value })} />
          </div>
        </section>
      )}

      {data.document_type === "laudo_acuidade" && (
        <section>
          <SectionTitle>Resultados do exame</SectionTitle>
          <AcuityFields data={data} onChange={onChange} />
          <div className="mt-4">
            <RefractionFields data={data} onChange={onChange} showAdd />
          </div>
          <div className="mt-4">
            <Textarea label="Conclusão / Parecer técnico" value={data.conclusao} onChange={(e) => onChange({ ...data, conclusao: e.target.value })} rows={4} />
          </div>
        </section>
      )}

      {data.document_type === "ficha_clinica" && (
        <>
          <section>
            <SectionTitle>Anamnese</SectionTitle>
            <div className="space-y-3">
              <Textarea label="Queixa principal" value={data.queixa_principal} onChange={(e) => onChange({ ...data, queixa_principal: e.target.value })} />
              <Textarea label="Anamnese" value={data.anamnese} onChange={(e) => onChange({ ...data, anamnese: e.target.value })} />
              <Textarea label="Histórico ocular" value={data.historico_ocular} onChange={(e) => onChange({ ...data, historico_ocular: e.target.value })} />
            </div>
          </section>
          <section>
            <SectionTitle>Exame clínico</SectionTitle>
            <AcuityFields data={data} onChange={onChange} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Biomicroscopia" value={data.biomicroscopia} onChange={(e) => onChange({ ...data, biomicroscopia: e.target.value })} />
              <Input label="Tonometria" value={data.tonometria} onChange={(e) => onChange({ ...data, tonometria: e.target.value })} placeholder="mmHg" />
            </div>
          </section>
          <section>
            <SectionTitle>Refração</SectionTitle>
            <RefractionFields data={data} onChange={onChange} />
            <div className="mt-3">
              <Textarea label="Conduta / Observações" value={data.observacoes} onChange={(e) => onChange({ ...data, observacoes: e.target.value })} />
            </div>
          </section>
        </>
      )}

      {data.document_type === "declaracao_comparecimento" && (
        <section>
          <SectionTitle>Horário do atendimento</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Horário de entrada" type="time" value={data.horario_entrada} onChange={(e) => onChange({ ...data, horario_entrada: e.target.value })} />
            <Input label="Horário de saída" type="time" value={data.horario_saida} onChange={(e) => onChange({ ...data, horario_saida: e.target.value })} />
          </div>
        </section>
      )}

      {data.document_type === "guia_encaminhamento" && (
        <section>
          <SectionTitle>Encaminhamento</SectionTitle>
          <div className="space-y-3">
            <Select
              label="Especialidade de destino"
              value={data.especialidade_destino}
              onChange={(e) => onChange({ ...data, especialidade_destino: e.target.value })}
              options={[
                { value: "Oftalmologia", label: "Oftalmologia" },
                { value: "Glaucoma", label: "Glaucoma" },
                { value: "Retina", label: "Retina" },
                { value: "Córnea", label: "Córnea" },
                { value: "Estrabismo", label: "Estrabismo" },
                { value: "Outro", label: "Outro" },
              ]}
            />
            <Textarea label="Motivo do encaminhamento" value={data.motivo_encaminhamento} onChange={(e) => onChange({ ...data, motivo_encaminhamento: e.target.value })} />
            <Textarea label="Queixa principal" value={data.queixa_principal} onChange={(e) => onChange({ ...data, queixa_principal: e.target.value })} />
            <AcuityFields data={data} onChange={onChange} />
            <RefractionFields data={data} onChange={onChange} showAdd={false} />
            <Textarea label="Observações clínicas" value={data.observacoes} onChange={(e) => onChange({ ...data, observacoes: e.target.value })} />
          </div>
        </section>
      )}
    </div>
  );
}
