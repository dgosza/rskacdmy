# AI Risk Academy

Trilha de estudos sobre riscos de Inteligência Artificial, com módulos, questões dissertativas e prova de certificação.

Stack: Next.js 14 (App Router) + Supabase (Auth + Postgres).

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. O login é feito por magic link (e-mail).

## Estrutura

- `app/login` — tela de login (magic link)
- `app/auth/callback` — troca o código do magic link pela sessão
- `app/trilha` — visão geral dos módulos com progresso
- `app/trilha/[numero]` — conteúdo do módulo e banco de questões dissertativas; último módulo renderiza a prova
- `app/dashboard` — progresso pessoal e certificado
- `middleware.js` — protege rotas autenticadas e mantém a sessão do Supabase

## Prova de certificação

As questões e o gabarito nunca são enviados ao navegador diretamente: o front-end chama funções no banco (`get_exam()` / `submit_exam(answers)`, via `SECURITY DEFINER`) que calculam a nota e registram a tentativa. A aprovação libera o certificado em PDF, gerado no navegador com `jspdf`.

## Deploy

Publicado via GitHub Pages a partir da branch `main` (ver `.github/workflows/deploy.yml`). As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são configuradas como secrets do repositório.

## Administração de conteúdo

O conteúdo vive nas tabelas `modules`, `essay_questions`, `exam_questions` e `exam_options` do Supabase. Para atualizar um módulo, edite a coluna `content_md` (Markdown com suporte a tabelas GFM) pelo Supabase Studio ou via SQL.
