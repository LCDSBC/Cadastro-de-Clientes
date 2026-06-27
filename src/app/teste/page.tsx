"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleIcon } from "@/components/icons";
import { systemModules } from "@/lib/modules";
import {
  getTestAccessUrl,
  TEST_QUICK_LINKS,
  TEST_CHECKLIST,
} from "@/lib/test-access";
import { APP_VERSION } from "@/lib/settings";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Link2,
} from "lucide-react";

export default function TestePage() {
  const [accessUrl, setAccessUrl] = useState("/teste");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAccessUrl(getTestAccessUrl(window.location.origin));
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const activeModules = systemModules.filter((m) => m.status === "active");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">OptiCare ERP</p>
              <p className="text-xs text-slate-500">Ambiente de teste · v{APP_VERSION}</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button>
              Entrar no sistema
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary-600">
            Acesso para testes
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Link de teste do sistema
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Compartilhe este endereço com avaliadores e equipe. Os dados ficam no
            navegador (modo local) ou na nuvem, se o Supabase estiver configurado.
          </p>
        </div>

        <Card className="mb-8 border-primary-200 bg-primary-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5 text-primary-600" />
              Link de acesso para testes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Compartilhe o endereço abaixo com avaliadores, equipe ou clientes em
              homologação. O link abre este portal com atalhos para todos os módulos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm font-medium text-slate-800">
                {accessUrl}
              </code>
              <Button variant="outline" onClick={() => void copyLink()}>
                <Copy className="h-4 w-4" />
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
              <a href={accessUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  Abrir
                </Button>
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Em produção, defina <code className="rounded bg-white px-1">NEXT_PUBLIC_APP_URL</code> no
              ambiente para gerar o link público correto.
            </p>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acesso rápido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {TEST_QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                >
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roteiro sugerido</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {TEST_CHECKLIST.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todos os módulos ativos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {activeModules.map((mod) => (
              <Link
                key={mod.id}
                href={mod.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >
                <ModuleIcon
                  name={mod.icon}
                  className="h-5 w-5 shrink-0 text-primary-600"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {mod.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {mod.description}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <CheckCircle2 className="h-4 w-4" />
          Sem login obrigatório no MVP — ideal para demonstrações e homologação
        </p>
      </main>
    </div>
  );
}
