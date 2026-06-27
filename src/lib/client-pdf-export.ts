"use client";

import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Client, StoreSettings } from "@/lib/types";
import type { StructuredAnamnesis } from "@/lib/anamnesis";
import type { AcuityExam } from "@/lib/types";
import type { StoredClinicalDocument } from "./prontuarios-types";
import { renderReactComponentToPdfBlob } from "./pdf-render";
import { DocumentPreview } from "@/components/prontuarios/document-preview";
import { AnamnesisPrint } from "@/components/anamnese/anamnesis-print";
import { ClientRegistrationPrint } from "@/components/clientes/client-registration-print";
import { AcuityResultsPrint } from "@/components/clientes/acuity-results-print";

export async function renderClinicalDocumentPdf(
  doc: StoredClinicalDocument,
): Promise<Blob | null> {
  return renderReactComponentToPdfBlob((container) => {
    const root = createRoot(container);
    root.render(createElement(DocumentPreview, { data: doc.form_data }));
    return { unmount: () => root.unmount() };
  });
}

export async function renderClientRegistrationPdf(
  client: Client,
  store?: StoreSettings | null,
): Promise<Blob | null> {
  return renderReactComponentToPdfBlob((container) => {
    const root = createRoot(container);
    root.render(createElement(ClientRegistrationPrint, { client, store }));
    return { unmount: () => root.unmount() };
  });
}

export async function renderAnamnesisPdf(
  record: StructuredAnamnesis,
  client?: Client | null,
  store?: StoreSettings | null,
): Promise<Blob | null> {
  return renderReactComponentToPdfBlob((container) => {
    const root = createRoot(container);
    root.render(createElement(AnamnesisPrint, { record, client, store }));
    return { unmount: () => root.unmount() };
  });
}

export async function renderAcuityResultsPdf(
  clientName: string,
  exams: AcuityExam[],
  store?: StoreSettings | null,
): Promise<Blob | null> {
  return renderReactComponentToPdfBlob((container) => {
    const root = createRoot(container);
    root.render(
      createElement(AcuityResultsPrint, { clientName, exams, store }),
    );
    return { unmount: () => root.unmount() };
  });
}
