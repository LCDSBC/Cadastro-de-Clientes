import { OPTOMETRY_EMBLEM_ALT, OPTOMETRY_EMBLEM_PATH } from "@/lib/print-branding";

export function PrintHeaderEmblem({ className = "" }: { className?: string }) {
  return (
    <img
      src={OPTOMETRY_EMBLEM_PATH}
      alt={OPTOMETRY_EMBLEM_ALT}
      className={`h-[6rem] w-[6rem] shrink-0 object-contain print:h-[27mm] print:w-[27mm] ${className}`}
    />
  );
}
