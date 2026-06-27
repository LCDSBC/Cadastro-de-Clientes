import type { DocumentType } from "@/lib/acuidade-visual-pro";
import type { DocumentFormData } from "@/lib/document-form";
import {
  ReceitaOculosPrint,
  LaudoAcuidadePrint,
  FichaClinicaPrint,
  DeclaracaoComparecimentoPrint,
  GuiaEncaminhamentoPrint,
} from "./document-prints";

export function DocumentPreview({ data }: { data: DocumentFormData }) {
  switch (data.document_type) {
    case "receita_oculos":
      return <ReceitaOculosPrint data={data} />;
    case "laudo_acuidade":
      return <LaudoAcuidadePrint data={data} />;
    case "ficha_clinica":
      return <FichaClinicaPrint data={data} />;
    case "declaracao_comparecimento":
      return <DeclaracaoComparecimentoPrint data={data} />;
    case "guia_encaminhamento":
      return <GuiaEncaminhamentoPrint data={data} />;
    default:
      return null;
  }
}

export function getDocumentTitle(type: DocumentType): string {
  const titles: Record<DocumentType, string> = {
    receita_oculos: "Laudo Optométrico",
    laudo_acuidade: "Laudo de Acuidade Visual",
    ficha_clinica: "Ficha Clínica",
    declaracao_comparecimento: "Declaração de Comparecimento",
    guia_encaminhamento: "Guia de Encaminhamento",
  };
  return titles[type];
}
