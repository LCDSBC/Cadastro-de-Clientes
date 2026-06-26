"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { testConnection } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Copy,
} from "lucide-react";

export function SupabaseSetupPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    tables?: string[];
  } | null>(null);
  const configured = isSupabaseConfigured();

  const runTest = async () => {
    setTesting(true);
    const res = await testConnection();
    setResult(res);
    setTesting(false);
  };

  useEffect(() => {
    if (configured) runTest();
  }, [configured]);

  const copyEnvTemplate = () => {
    const text = `NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase — Banco de dados na nuvem
              </CardTitle>
              <CardDescription>
                Configure para salvar clientes e prontuários na nuvem
              </CardDescription>
            </div>
            <Badge variant={result?.ok ? "success" : configured ? "warning" : "info"}>
              {result?.ok ? "Conectado" : configured ? "Aguardando teste" : "Não configurado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                result.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {result.ok ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p>{result.message}</p>
                {result.tables && (
                  <p className="mt-1 text-xs opacity-80">
                    Tabelas: {result.tables.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-medium text-slate-900">Passo a passo</h4>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">1</span>
                <span>
                  Crie um projeto gratuito em{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
                  >
                    supabase.com/dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">2</span>
                <span>
                  Em <strong>SQL Editor</strong>, execute o arquivo{" "}
                  <code className="rounded bg-slate-200 px-1">supabase/setup-completo.sql</code>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">3</span>
                <span>
                  Em <strong>Settings → API</strong>, copie a URL e a chave <code className="rounded bg-slate-200 px-1">anon public</code>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">4</span>
                <span>
                  Crie <code className="rounded bg-slate-200 px-1">.env.local</code> na raiz do projeto com as variáveis
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">5</span>
                <span>Reinicie o servidor (<code className="rounded bg-slate-200 px-1">npm run dev</code>) e clique em Testar conexão</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runTest} disabled={!configured || testing}>
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Testar conexão
            </Button>
            <Button variant="outline" onClick={copyEnvTemplate}>
              <Copy className="h-4 w-4" />
              Copiar modelo .env
            </Button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4" />
                Abrir Supabase
              </Button>
            </a>
          </div>

          {!configured && (
            <p className="text-xs text-slate-500">
              Sem Supabase, os dados ficam salvos localmente no navegador (localStorage).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
