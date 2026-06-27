export const OPTOMETRIC_DISCLAIMER_ITEMS = [
  "Nos primeiros dias de uso efetivo é normal sentir tonturas, dores de cabeça, náuseas e etc…",
  "As lentes bi-focais e multifocais, exigem maior tempo de adaptação, tenha sempre um cuidado maior ao subir e descer escadas.",
  "OPTOMETRISTA é um especialista de saúde na área da visão, não médico, LEI DO ATO MÉDICO - VETO incisos VIII do art.4°.",
  "Classificação Brasileira de Ocupações - CBO - Ópticos e Optometrista, MTE 3223-05 Classificação Nacional de Atividade Econômica - CNAE - IBGE - 8.650-0/99",
] as const;

export function OptometricDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`space-y-1.5 border-t border-slate-200 pt-4 text-[10px] leading-relaxed text-slate-600 ${className}`}
    >
      {OPTOMETRIC_DISCLAIMER_ITEMS.map((item, index) => (
        <p key={item}>
          {index + 1}° {item}
        </p>
      ))}
    </div>
  );
}
