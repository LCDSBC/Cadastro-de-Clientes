"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentFormEditor } from "./document-form-editor";
import { DocumentPreview, getDocumentTitle } from "./document-preview";
import {
  documentTemplates,
  demoClinicalRecords,
  type DocumentType,
  type ClinicalRecord,
} from "@/lib/acuidade-visual-pro";
import { createDefaultFormData, type DocumentFormData } from "@/lib/document-form";
import { demoClients } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Printer,
  Save,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

type View = "list" | "editor";

export function ProntuariosPanel() {
  const [view, setView] = useState<View>("list");
  const [records, setRecords] = useState<ClinicalRecord[]>(demoClinicalRecords);
  const [formData, setFormData] = useState<DocumentFormData>(
    createDefaultFormData("receita_oculos"),
  );
  const [autoPrint, setAutoPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === "editor" && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
        setAutoPrint(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [view, autoPrint]);

  const openEditor = (type: DocumentType, record?: ClinicalRecord) => {
    const defaults = createDefaultFormData(type);
    if (record) {
      const client = demoClients.find((c) => c.id === record.client_id);
      setFormData({
        ...defaults,
        exam_date: record.exam_date,
        optometrist: record.optometrist,
        patient: {
          name: record.client_name,
          cpf: client?.cpf ?? "",
          birth_date: client?.birth_date ?? "",
          phone: client?.phone ?? "",
          address: client?.address ?? "",
        },
        acuity_od_sc: record.acuity_result_od ?? defaults.acuity_od_sc,
        acuity_oe_sc: record.acuity_result_oe ?? defaults.acuity_oe_sc,
        conclusao: record.notes ?? defaults.conclusao,
      });
    } else {
      setFormData(defaults);
    }
    setView("editor");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const newRecord: ClinicalRecord = {
      id: Date.now().toString(),
      client_id: demoClients.find((c) => c.name === formData.patient.name)?.id ?? "0",
      client_name: formData.patient.name || "Paciente sem nome",
      document_type: formData.document_type,
      exam_date: formData.exam_date,
      optometrist: formData.optometrist,
      acuity_result_od: formData.acuity_od_cc || formData.acuity_od_sc,
      acuity_result_oe: formData.acuity_oe_cc || formData.acuity_oe_sc,
      notes: formData.conclusao || formData.observacoes,
      created_at: new Date().toISOString(),
    };
    setRecords([newRecord, ...records]);
    setView("list");
  };

  if (view === "editor") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4" />
              Salvar documento
            </Button>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900">
          {getDocumentTitle(formData.document_type)}
        </h2>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="no-print max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Preencher dados</CardTitle>
              <CardDescription>
                Os campos são atualizados em tempo real na pré-visualização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentFormEditor data={formData} onChange={setFormData} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="no-print">
              <CardTitle className="text-base">Pré-visualização</CardTitle>
              <CardDescription>Como o documento será impresso</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={printRef}
                id="document-print-area"
                className="overflow-auto bg-slate-100 p-4 print:bg-white print:p-0"
              >
                <DocumentPreview data={formData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentTemplates.map((doc) => (
          <button
            key={doc.type}
            type="button"
            onClick={() => openEditor(doc.type)}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary-50 p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{doc.name}</p>
                <p className="mt-1 text-sm text-slate-500">{doc.description}</p>
                <span className="mt-3 inline-block text-xs font-medium text-primary-600">
                  Criar documento →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Documentos emitidos
          </CardTitle>
          <CardDescription>
            Histórico de prontuários gerados pelo Acuidade Visual Pró
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhum documento emitido ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const template = documentTemplates.find(
                  (t) => t.type === record.document_type,
                );
                return (
                  <div
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {template?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {record.client_name} — {formatDate(record.exam_date)}
                      </p>
                      {record.acuity_result_od && (
                        <p className="mt-1 text-xs text-slate-400">
                          OD: {record.acuity_result_od} | OE: {record.acuity_result_oe}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditor(record.document_type, record)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          openEditor(record.document_type, record);
                          setAutoPrint(true);
                        }}
                      >
                        <Printer className="h-3 w-3" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
