import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

interface ModulePlaceholderProps {
  features: string[];
  status?: "beta" | "coming_soon";
}

export function ModulePlaceholder({
  features,
  status = "beta",
}: ModulePlaceholderProps) {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="mb-6 flex items-center gap-3">
          <Construction className="h-8 w-8 text-amber-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Módulo em desenvolvimento
            </h3>
            <p className="text-sm text-slate-500">
              Funcionalidades planejadas para as próximas versões
            </p>
          </div>
          <Badge variant={status === "coming_soon" ? "warning" : "info"}>
            {status === "coming_soon" ? "Em breve" : "Beta"}
          </Badge>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 rounded-lg border border-slate-100 px-4 py-3 text-sm text-slate-700"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
