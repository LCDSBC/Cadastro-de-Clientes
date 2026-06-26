"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setError("Erro ao conectar com Supabase.");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setMessage("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      setMode("login");
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <Input
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                className="font-medium text-primary-600 hover:underline"
                onClick={() => setMode("register")}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="font-medium text-primary-600 hover:underline"
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Supabase não configurado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Configure as variáveis de ambiente ou acesse o sistema em modo demonstração.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Entrar em modo demonstração</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
            <Eye className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">OptiCare ERP</h1>
          <p className="text-sm text-slate-300">Acesso ao sistema da ótica</p>
        </div>
        <Suspense fallback={<Card className="p-8 text-center text-slate-500">Carregando...</Card>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
