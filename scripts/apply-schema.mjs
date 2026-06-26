#!/usr/bin/env node
/**
 * Aplica supabase/setup-completo.sql diretamente no Postgres.
 * Requer senha do banco em SUPABASE_DB_PASSWORD ou DATABASE_URL no .env.local
 *
 * Senha: Supabase Dashboard → Settings → Database → Database password
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import pg from "pg";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [k, ...v] = t.split("=");
    env[k] = v.join("=").replace(/^["']|["']$/g, "");
  }
  return env;
}

async function main() {
  const env = { ...process.env, ...loadEnvFile() };
  const projectRef = "jhtwoukkxnejjfzugzct";

  const connectionString =
    env.DATABASE_URL ||
    (env.SUPABASE_DB_PASSWORD
      ? `postgresql://postgres.${projectRef}:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`
      : null);

  if (!connectionString) {
    console.error("❌ Defina SUPABASE_DB_PASSWORD ou DATABASE_URL no .env.local");
    console.error("   Dashboard → Settings → Database → Database password");
    process.exit(1);
  }

  const sqlPath = resolve(process.cwd(), "supabase/setup-completo.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("🔌 Conectando ao banco...");
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("📦 Aplicando schema (setup-completo.sql)...");
    await client.query(sql);
    console.log("✅ Schema aplicado com sucesso!");
  } catch (err) {
    // Tentar conexão direta como fallback
    if (!env.DATABASE_URL && env.SUPABASE_DB_PASSWORD) {
      const direct = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`;
      console.log("⚠️  Pooler falhou, tentando conexão direta...");
      const client2 = new pg.Client({ connectionString: direct, ssl: { rejectUnauthorized: false } });
      try {
        await client2.connect();
        await client2.query(sql);
        await client2.end();
        console.log("✅ Schema aplicado com sucesso (conexão direta)!");
        return;
      } catch (e2) {
        await client2.end().catch(() => {});
        throw e2;
      }
    }
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
