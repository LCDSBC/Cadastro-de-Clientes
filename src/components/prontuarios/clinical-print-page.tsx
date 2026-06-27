import { OPTOMETRY_EMBLEM_PATH } from "@/lib/print-branding";

/** Marca d'água centralizada e suave em toda a folha (tela e impressão). */
export function PrintPageWatermark() {
  return (
    <div
      aria-hidden
      className="print-watermark pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <img
        src={OPTOMETRY_EMBLEM_PATH}
        alt=""
        className="h-[110%] w-[110%] max-h-[343mm] max-w-[250mm] object-contain opacity-[0.09] grayscale"
      />
    </div>
  );
}

interface ClinicalPrintPageProps {
  children: React.ReactNode;
}

export function ClinicalPrintPage({ children }: ClinicalPrintPageProps) {
  return (
    <div className="document-print relative mx-auto max-w-[210mm] overflow-hidden bg-white p-8 text-slate-900">
      <PrintPageWatermark />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
