# OptiCare ERP

Sistema de gestão completo para óticas, unificando recursos do **SavWin WEB** (ERP ótico) com o **Acuidade Visual Pró** da JL Soluções Digitais.

## Módulos

### Ativos (MVP)
- **Painel** — Dashboard com indicadores do negócio
- **Clientes** — Cadastro, busca, receitas oftálmicas
- **Acuidade Visual Pró** — Testes digitais calibrados + prontuários optométricos (modo TV/monitor)

### Em desenvolvimento (Beta)
- Clínica / Agenda de consultas
- Estoque (armações, lentes, grade)
- Vendas e ordens de serviço
- Laboratório
- Financeiro
- Relatórios
- Configurações

### Planejado
- Módulo fiscal (NF-e, NFC-e, SPED)

## Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL, Auth, RLS) — schema em `supabase/migrations/`

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Funcionalidades SavWin mapeadas

| Módulo SavWin | Status OptiCare |
|---|---|
| Gestão de Clientes | ✅ Ativo |
| Gestão de Estoque | 🔶 Beta |
| Gestão Comercial (Vendas/OS) | 🔶 Beta |
| Gestão Financeira | 🔶 Beta |
| Módulo Fiscal | ⏳ Planejado |
| Controle de Laboratório | 🔶 Beta |
| Clínica/Agenda Optometria | 🔶 Beta |
| SavWin Vision (vendas digitais) | ⏳ Planejado |

## Funcionalidades Acuidade Visual Pró (JL Soluções Digitais)

### Testes de visão
| Teste | Status |
|---|---|
| Snellen | ✅ Ativo |
| Ishihara (cores) | ✅ Ativo |
| ETDRS (logMAR) | ✅ Ativo |
| Jaeger (visão de perto) | ✅ Ativo |
| Infantil/Funcional | ✅ Ativo |
| Estereopsia | ✅ Ativo |
| Ofuscamento | ✅ Ativo |
| Modo TV/Monitor fullscreen | ✅ Ativo |
| Distâncias 2m, 3m, 4m, 6m | ✅ Ativo |

### Prontuários optométricos (com impressão A4)
| Documento | Status |
|---|---|
| Receita de Óculos e Lentes | ✅ Formulário + impressão + PDF |
| Ficha Clínica | ✅ Formulário + impressão + PDF |
| Laudo de Acuidade Visual | ✅ Formulário + impressão + PDF |
| Declaração de Comparecimento | ✅ Formulário + impressão + PDF |
| Guia de Encaminhamento | ✅ Formulário + impressão + PDF |

### Persistência e backup
| Recurso | Status |
|---|---|
| Salvar no Supabase (nuvem) | ✅ Quando configurado |
| Armazenamento local (offline) | ✅ localStorage automático |
| Exportar PDF individual | ✅ |
| Backup para pendrive | ✅ File System API (Chrome/Edge) |
| Backup ZIP (JSON + PDFs) | ✅ Fallback para outros navegadores |
| Restaurar do pendrive | ✅ JSON ou ZIP |

## Estrutura do projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── acuidade-visual/    # Módulo de testes de visão
│   ├── clientes/           # Cadastro de clientes
│   ├── dashboard/          # Painel principal
│   └── ...                 # Demais módulos
├── components/             # Componentes UI e layout
└── lib/                    # Tipos, utilitários, dados de teste
supabase/
└── migrations/             # Schema PostgreSQL
```

## Licença

Projeto privado — Cadastro de Clientes / OptiCare ERP
