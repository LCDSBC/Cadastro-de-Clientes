"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentFormEditor } from "./document-form-editor";
import { DocumentPreview, getDocumentTitle } from "./document-preview";
import { BackupPanel } from "./backup-panel";
import { documentTemplates } from "@/lib/acuidade-visual-pro";
import type { DocumentType } from "@/lib/acuidade-visual-pro";
import { createDefaultFormData } from "@/lib/document-form";
import {
  formDataToRecord,
  recordToFormData,
  type StoredClinicalDocument,
} from "@/lib/prontuarios-types";
import {
  loadDocuments,
  saveDocument,
  getStorageStatus,
} from "@/lib/prontuarios-store";
import { downloadDocumentPdf } from "@/lib/backup-pendrive";
import { exportElementToPdf, buildPdfFilename } from "@/lib/export-pdf";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Printer,
  Save,
  ArrowLeft,
  ClipboardList,
  FileDown,
  Loader2,
} from "lucide-react";

type View = "list" | "editor";

export function ProntuariosPanel() {
  const [view, setView] = useState<View>("list");
  const [records, setRecords] = useState<StoredClinicalDocument[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(createDefaultFormData("receita_oculos"));
  const [autoPrint, setAutoPrint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments().then(({ documents }) => {
      setRecords(documents);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (view === "editor" && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
        setAutoPrint(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [view, autoPrint]);

  const openEditor = (type: DocumentType, record?: StoredClinicalDocument) => {
    if (record) {
      setFormData(recordToFormData(record));
      setEditingId(record.id);
    } else {
      setFormData(createDefaultFormData(type));
      setEditingId(null);
    }
    setView("editor");
  };

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const el = printRef.current?.querySelector(".document-print") as HTMLElement;
    if (!el) return;
    setExportingPdf(true);
    try {
      const filename = buildPdfFilename(
        formData.patient.name,
        formData.document_type,
      );
      await exportElementToPdf(el, filename);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const record = formDataToRecord(formData, editingId ?? undefined);
    const { document } = await saveDocument(record);
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === document.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = document;
        return next;
      }
      return [document, ...prev];
    });
    setSaving(false);
    setView("list");
    setEditingId(null);
  };

  const storageLabel =
    getStorageStatus() === "supabase" ? "Nuvem" : "Local";

  if (view === "editor") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportPdf} disabled={exportingPdf}>
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar ({storageLabel})
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
                Preview ao vivo — salve na nuvem ou localmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentFormEditor data={formData} onChange={setFormData} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="no-print">
              <CardTitle className="text-base">Pré-visualização</CardTitle>
              <CardDescription>Impressão A4 / exportação PDF</CardDescription>
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
      <BackupPanel
        documents={records}
        onRestore={(docs) => setRecords(docs)}
      />

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Documentos emitidos
              </CardTitle>
              <CardDescription>
                Histórico sincronizado — {storageLabel}
              </CardDescription>
            </div>
            <Badge variant={getStorageStatus() === "supabase" ? "success" : "info"}>
              {records.length} documento(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando documentos...
            </div>
          ) : records.length === 0 ? (
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
                      {record.synced_at && (
                        <p className="mt-1 text-xs text-emerald-600">Sincronizado na nuvem</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditor(record.document_type, record)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await downloadDocumentPdf(record);
                          } catch {
                            openEditor(record.document_type, record);
                          }
                        }}
                      >
                        <FileDown className="h-3 w-3" />
                        PDF
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
