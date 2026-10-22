-- AI Risk Academy — esquema base
-- Conteúdo e gabaritos ficam em tabelas sem policies de RLS: o acesso do
-- navegador acontece exclusivamente pelas funções SECURITY DEFINER, para que
-- a resposta correta nunca seja exposta ao cliente.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  is_manager boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Evita recursão de RLS: a policy de profiles precisa saber se quem consulta
-- é gestor, e lê isso por uma função definer em vez da própria tabela.
create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.is_manager from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create policy "profiles: ler o próprio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_manager());

create policy "profiles: atualizar o próprio nome"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------- modules
create table if not exists public.modules (
  number integer primary key,
  title text not null,
  content_md text not null default '',
  is_exam boolean not null default false,
  phase integer not null,
  phase_label text not null,
  created_at timestamptz not null default now()
);

alter table public.modules enable row level security;

create policy "modules: leitura autenticada"
  on public.modules for select
  to authenticated
  using (true);

-- ------------------------------------------------- quiz de módulo (gabarito)
create table if not exists public.module_quiz_questions (
  id bigint generated always as identity primary key,
  module_number integer not null references public.modules (number) on delete cascade,
  number integer not null,
  question_text text not null,
  correct_label text not null,
  unique (module_number, number)
);

create table if not exists public.module_quiz_options (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.module_quiz_questions (id) on delete cascade,
  label text not null,
  option_text text not null,
  unique (question_id, label)
);

alter table public.module_quiz_questions enable row level security;
alter table public.module_quiz_options enable row level security;

-- ------------------------------------------------------ prova (gabarito)
create table if not exists public.exam_questions (
  id bigint generated always as identity primary key,
  number integer not null unique,
  question_text text not null,
  correct_label text not null
);

create table if not exists public.exam_options (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.exam_questions (id) on delete cascade,
  label text not null,
  option_text text not null,
  unique (question_id, label)
);

alter table public.exam_questions enable row level security;
alter table public.exam_options enable row level security;

-- ---------------------------------------------------------- progresso
create table if not exists public.user_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  module_number integer not null references public.modules (number) on delete cascade,
  score integer,
  total integer,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_number)
);

alter table public.user_progress enable row level security;

create policy "user_progress: ler o próprio progresso"
  on public.user_progress for select
  to authenticated
  using (user_id = auth.uid() or public.is_manager());

-- ------------------------------------------------------- certificações
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  score integer not null,
  total integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists certifications_user_created_idx
  on public.certifications (user_id, created_at desc);

alter table public.certifications enable row level security;

create policy "certifications: ler as próprias tentativas"
  on public.certifications for select
  to authenticated
  using (user_id = auth.uid() or public.is_manager());

-- --------------------------------------------- log do assistente (Gemini)
create table if not exists public.assistant_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists assistant_requests_user_created_idx
  on public.assistant_requests (user_id, created_at desc);

alter table public.assistant_requests enable row level security;

create policy "assistant_requests: ler os próprios pedidos"
  on public.assistant_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "assistant_requests: registrar pedido próprio"
  on public.assistant_requests for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "assistant_requests: completar a própria resposta"
  on public.assistant_requests for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------- laboratório de testes
create table if not exists public.redteam_sim_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_key text not null,
  technique text,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.redteam_sim_log enable row level security;

create policy "redteam_sim_log: ler os próprios registros"
  on public.redteam_sim_log for select
  to authenticated
  using (user_id = auth.uid() or public.is_manager());

create policy "redteam_sim_log: registrar tentativa própria"
  on public.redteam_sim_log for insert
  to authenticated
  with check (user_id = auth.uid());

create table if not exists public.incident_sim_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_key text not null,
  score integer not null,
  max_score integer not null,
  time_taken_seconds integer,
  timed_out boolean not null default false,
  decisions jsonb,
  created_at timestamptz not null default now()
);

alter table public.incident_sim_runs enable row level security;

create policy "incident_sim_runs: ler as próprias execuções"
  on public.incident_sim_runs for select
  to authenticated
  using (user_id = auth.uid() or public.is_manager());

create policy "incident_sim_runs: registrar execução própria"
  on public.incident_sim_runs for insert
  to authenticated
  with check (user_id = auth.uid());

-- -------------------------------------- histórico do índice de maturidade
create table if not exists public.maturity_history (
  day date primary key,
  score integer not null,
  created_at timestamptz not null default now()
);

alter table public.maturity_history enable row level security;
