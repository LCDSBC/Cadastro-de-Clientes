# Autenticar Supabase no Cursor (Opção C)

Siga estes passos no **Cursor Desktop**. Depois de conectado, o agente pode criar o projeto, rodar migrations e configurar o `.env.local` automaticamente.

## Passo 1 — Abrir configurações MCP

1. Abra o **Cursor Desktop** (não só o navegador)
2. Pressione:
   - **Windows/Linux:** `Ctrl + Shift + J`
   - **macOS:** `Cmd + Shift + J`
3. No menu lateral, clique em **Tools & MCP** (ou **MCP**)

## Passo 2 — Localizar o servidor Supabase

- Procure **Supabase** na lista de servidores MCP
- O projeto já inclui `.cursor/mcp.json` com a URL oficial
- Se não aparecer: reinicie o Cursor

## Passo 3 — Conectar (OAuth)

1. Clique em **Connect**, **Authorize** ou no link **Needs authentication**
2. O navegador abrirá a página de login do Supabase
3. Faça login na sua conta
4. **Autorize** o acesso do Cursor
5. Selecione a **organização** do seu projeto

## Passo 4 — Verificar

Na lista MCP, o Supabase deve ficar **verde** com algo como **"29 tools enabled"**.

Se não funcionar:
- Clique em **View → Output** (`Ctrl+Shift+U`)
- Selecione **MCP: Supabase** nos logs
- Copie a URL OAuth e abra no navegador manualmente

## Passo 5 — Voltar ao agente

Envie uma mensagem como:

> Supabase conectado. Pode configurar o projeto OptiCare.

O agente irá:
1. Listar/criar projeto Supabase
2. Aplicar migrations (`setup-completo.sql`)
3. Gerar `.env.local` com URL e chave anon
4. Testar conexão com clientes e prontuários

## Importante

- Use um projeto de **desenvolvimento**, não produção
- A autenticação é feita no **Cursor Desktop** logado na sua conta
- Cloud Agents usam a mesma conexão MCP após você autenticar
