#!/usr/bin/env node
/**
 * Gera .env.local a partir de argumentos ou variáveis de ambiente.
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/create-env.mjs
 *   node scripts/create-env.mjs <url> <anon_key>
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const url = process.argv[2] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.argv[3] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Uso: node scripts/create-env.mjs <SUPABASE_URL> <ANON_KEY>");
  process.exit(1);
}

const content = `# OptiCare ERP — Supabase
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}
`;

const envPath = resolve(process.cwd(), ".env.local");
writeFileSync(envPath, content, "utf-8");
console.log("✅ .env.local criado em:", envPath);
