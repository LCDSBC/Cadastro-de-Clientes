#!/usr/bin/env node
/**
 * Verifica conexão com Supabase e lista tabelas.
 * Uso: node scripts/verify-supabase.mjs
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ Arquivo .env.local não encontrado.");
    console.error("   Crie com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    env[key] = rest.join("=").replace(/^["']|["']$/g, "");
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.");
    process.exit(1);
  }

  console.log("🔍 Testando conexão com:", url);

  const tables = ["stores", "clients", "clinical_documents", "prescriptions", "products"];
  const results = [];

  for (const table of tables) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (res.status === 404 || res.status === 406) {
      results.push({ table, ok: false, error: "Tabela não encontrada — execute setup-completo.sql" });
    } else if (!res.ok) {
      const body = await res.text();
      results.push({ table, ok: false, error: `${res.status}: ${body.slice(0, 100)}` });
    } else {
      const data = await res.json();
      results.push({ table, ok: true, count: data.length });
    }
  }

  console.log("\n📊 Resultado:\n");
  let allOk = true;
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✅ ${r.table}`);
    } else {
      console.log(`  ❌ ${r.table} — ${r.error}`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log("\n✅ Supabase configurado corretamente!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Execute supabase/setup-completo.sql no SQL Editor do Supabase.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
