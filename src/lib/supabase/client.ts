import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function testConnection(): Promise<{
  ok: boolean;
  message: string;
  tables?: string[];
}> {
  const supabase = createClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.",
    };
  }

  const { data, error } = await supabase.from("stores").select("name").limit(1);

  if (error) {
    if (error.code === "42P01") {
      return {
        ok: false,
        message: "Conectado, mas tabelas não encontradas. Execute as migrations no SQL Editor.",
      };
    }
    return {
      ok: false,
      message: `Erro de conexão: ${error.message}`,
    };
  }

  return {
    ok: true,
    message: data?.[0]?.name
      ? `Conectado à loja: ${data[0].name}`
      : "Conectado! Execute o seed.sql para dados de demonstração.",
    tables: ["stores", "clients", "clinical_documents", "prescriptions", "products"],
  };
}
