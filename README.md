# AI Risk Academy

Trilha de estudos sobre riscos de Inteligência Artificial para o time de Riscos de uma
instituição financeira: 9 dossiês de conteúdo com quiz por módulo, laboratório de testes
adversariais, relatório de conformidade para gestores e prova de certificação.

Stack: Next.js 14 (App Router, static export) + Supabase (Auth + Postgres + Edge Functions).

## Ambiente Supabase

| | |
| --- | --- |
| Projeto | `ai-risk-academy` (`mdigelweqxrezeahucjp`) |
| Região | `sa-east-1` (São Paulo) |
| URL | https://mdigelweqxrezeahucjp.supabase.co |

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. O login é por **e-mail e senha** — não há tela de cadastro
público, as contas são provisionadas por um administrador (ver abaixo).

## Estrutura

- `app/login` — tela de login (e-mail + senha)
- `app/inicio` — página inicial autenticada
- `app/trilha` — visão geral dos 10 dossiês, agrupados em 4 fases, com progresso
- `app/trilha/[numero]` — conteúdo do dossiê e quiz; o dossiê 10 renderiza a prova
- `app/laboratorio` — sandbox de prompt injection e simulação de incidente
- `app/glossario` — glossário dos termos da trilha
- `app/relatorio` — relatório de conformidade e índice de maturidade (só gestores)
- `app/dashboard` — progresso pessoal, badges e certificado
- `components/RequireAuth.jsx` — guarda de rota no cliente (o export estático não tem
  servidor pra checar sessão); a proteção real dos dados vem do RLS do Supabase

## Banco de dados

Migrações em `supabase/migrations`. Tabelas principais:

| Tabela | Papel |
| --- | --- |
| `profiles` | espelho de `auth.users` + flag `is_manager` |
| `modules` | os 10 dossiês, com `content_md` em Markdown (GFM) |
| `module_quiz_questions` / `module_quiz_options` | quiz de cada dossiê (10 questões) |
| `exam_questions` / `exam_options` | prova de certificação (60 questões) |
| `user_progress` | dossiês concluídos por usuário |
| `certifications` | tentativas da prova, com nota e aprovação |
| `redteam_sim_log` / `incident_sim_runs` | telemetria do laboratório |
| `assistant_requests` | log e rate limit do Assistente do dossiê |
| `maturity_history` | série histórica do índice de maturidade |

**As tabelas de questões não têm policies de RLS.** Isso é deliberado: o gabarito nunca é
exposto ao navegador. O acesso acontece só pelas funções `SECURITY DEFINER`, que calculam
a nota no servidor:

- `get_module_quiz(p_module_number)` / `submit_module_quiz(p_module_number, p_answers)`
- `get_exam()` / `submit_exam(p_answers)` — ambas validam no servidor que os 9 dossiês
  anteriores foram concluídos antes de liberar a prova
- `get_team_compliance_report()` / `get_maturity_index()` — restritas a `is_manager`

Aprovação exige 80%: 8/10 no quiz de módulo, 48/60 na prova. A credencial vale 1 ano.

## Provisionar usuários

Pelo SQL Editor do Supabase Studio (a função é revogada de `anon` e `authenticated`,
então só roda com a service role / pelo Studio):

```sql
-- novo usuário comum
select public.create_academy_user('pessoa@instituicao.com.br', 'senha-forte', 'Nome Completo');

-- gestor (vê o relatório de conformidade em /relatorio)
select public.create_academy_user('gestor@instituicao.com.br', 'senha-forte', 'Nome', true);
```

Chamar de novo com o mesmo e-mail **redefine a senha** daquela conta.

## Administração de conteúdo

O conteúdo vive na coluna `content_md` da tabela `modules` (Markdown com suporte a tabelas
GFM) e pode ser editado pelo Supabase Studio ou via SQL:

```sql
update public.modules set content_md = $md$ ... $md$ where number = 5;
```

## Assistente do dossiê

A Edge Function `module-assistant` responde dúvidas usando só o conteúdo do dossiê como
contexto, com rate limit (8/min, 60/dia por usuário) e um filtro de tentativa de prompt
injection antes de chamar o modelo. Ela exige uma chave da Gemini API:

```bash
supabase secrets set GEMINI_API_KEY=sua-chave --project-ref mdigelweqxrezeahucjp
```

Sem a chave, a função responde 503 e o widget mostra o erro — o resto do app funciona
normalmente.

## Deploy

Publicado via GitHub Pages a partir da branch `main` (ver `.github/workflows/deploy.yml`).
O build é um export estático (`output: "export"`) com `basePath` = `/rskacdmy`, servido em
https://dgosza.github.io/rskacdmy/.

As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são secrets do
repositório. (A chave `anon` é pública por design — ela vai no bundle do cliente de
qualquer forma; quem protege os dados é o RLS.)
