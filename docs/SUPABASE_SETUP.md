# Configuração do Supabase — OptiCare ERP

Este guia configura o banco de dados na nuvem para salvar **clientes**, **prontuários** e demais dados do sistema.

## 1. Criar projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **New Project**
3. Escolha um nome (ex: `opticare-erp`) e defina uma senha do banco
4. Aguarde o projeto ser criado (~2 minutos)

## 2. Executar o schema do banco

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `supabase/setup-completo.sql`
4. Cole no editor e clique em **Run**

Isso cria todas as tabelas, políticas de segurança (RLS) e dados de demonstração.

## 3. Obter as credenciais

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. Configurar o projeto local

Na raiz do repositório, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Reinicie o servidor:

```bash
npm run dev
```

## 5. Verificar conexão

1. Abra o sistema em `http://localhost:3000`
2. Vá em **Configurações**
3. Clique em **Testar conexão**

Se aparecer "Conectado à loja: Ótica OptiCare Demo", está funcionando.

## Tabelas criadas

| Tabela | Uso |
|---|---|
| `stores` | Lojas / filiais |
| `clients` | Cadastro de clientes |
| `prescriptions` | Receitas oftálmicas |
| `clinical_documents` | Prontuários Acuidade Visual Pró |
| `acuity_exams` | Exames de acuidade visual |
| `products` | Estoque |
| `sales` | Vendas |
| `appointments` | Agenda clínica |

## Desenvolvimento local (opcional)

Com Docker instalado:

```bash
npx supabase start
npx supabase db reset
```

Use as credenciais locais exibidas pelo CLI no `.env.local`.

## Segurança (produção)

As políticas RLS atuais permitem acesso público (MVP). Antes de produção:

1. Ative autenticação em **Authentication → Providers**
2. Substitua as políticas `USING (true)` por regras baseadas em `auth.uid()` e `store_id`
3. Nunca exponha a chave `service_role` no frontend

## Solução de problemas

| Erro | Solução |
|---|---|
| Tabelas não encontradas | Execute `setup-completo.sql` no SQL Editor |
| `Invalid API key` | Verifique a chave `anon` em Settings → API |
| Dados não aparecem | Confirme que o seed foi executado (loja demo) |
| Funciona local mas não na nuvem | Reinicie `npm run dev` após criar `.env.local` |
