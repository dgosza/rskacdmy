-- Funções SECURITY DEFINER da AI Risk Academy.
-- O gabarito do quiz e da prova nunca sai do servidor: as tabelas de questões
-- têm RLS habilitado sem policy alguma, e todo o acesso do navegador passa
-- por estas funções, que também calculam a nota e registram o resultado.

-- Quiz de módulo -------------------------------------------------------
create or replace function public.get_module_quiz(p_module_number integer)
returns table (number integer, question_text text, label text, option_text text)
language sql
security definer
set search_path = public
as $$
  select q.number, q.question_text, o.label, o.option_text
  from public.module_quiz_questions q
  join public.module_quiz_options o on o.question_id = q.id
  where q.module_number = p_module_number
    and auth.uid() is not null
  order by q.number, o.label;
$$;

create or replace function public.submit_module_quiz(
  p_module_number integer,
  p_answers jsonb
)
returns table (score integer, total integer, passed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_score integer;
  v_passed boolean;
begin
  if v_user is null then
    raise exception 'Não autenticado.';
  end if;

  if exists (
    select 1 from public.modules
    where number = p_module_number and is_exam
  ) then
    raise exception 'Este módulo usa a avaliação de certificação.';
  end if;

  select count(*) into v_total
  from public.module_quiz_questions
  where module_number = p_module_number;

  if v_total = 0 then
    raise exception 'Quiz não disponível para este módulo.';
  end if;

  select count(*) into v_score
  from public.module_quiz_questions q
  where q.module_number = p_module_number
    and upper(trim(coalesce(p_answers ->> q.number::text, ''))) = upper(q.correct_label);

  -- 80% de acerto conclui o dossiê (8 de 10)
  v_passed := v_score::numeric / v_total >= 0.8;

  if v_passed then
    insert into public.user_progress (user_id, module_number, score, total, completed_at)
    values (v_user, p_module_number, v_score, v_total, now())
    on conflict (user_id, module_number) do update
      set score = greatest(excluded.score, public.user_progress.score),
          total = excluded.total;
  end if;

  return query select v_score, v_total, v_passed;
end;
$$;

-- Prova de certificação -------------------------------------------------
create or replace function public.get_exam()
returns table (number integer, question_text text, label text, option_text text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Não autenticado.';
  end if;

  if exists (
    select 1
    from public.modules m
    where not m.is_exam
      and not exists (
        select 1 from public.user_progress up
        where up.user_id = v_user and up.module_number = m.number
      )
  ) then
    raise exception 'A avaliação é liberada somente após a conclusão de todos os dossiês anteriores.';
  end if;

  return query
    select q.number, q.question_text, o.label, o.option_text
    from public.exam_questions q
    join public.exam_options o on o.question_id = q.id
    order by q.number, o.label;
end;
$$;

create or replace function public.submit_exam(p_answers jsonb)
returns table (score integer, total integer, passed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_score integer;
  v_passed boolean;
begin
  if v_user is null then
    raise exception 'Não autenticado.';
  end if;

  if exists (
    select 1
    from public.modules m
    where not m.is_exam
      and not exists (
        select 1 from public.user_progress up
        where up.user_id = v_user and up.module_number = m.number
      )
  ) then
    raise exception 'A avaliação é liberada somente após a conclusão de todos os dossiês anteriores.';
  end if;

  select count(*) into v_total from public.exam_questions;

  if v_total = 0 then
    raise exception 'A avaliação ainda não foi publicada.';
  end if;

  select count(*) into v_score
  from public.exam_questions q
  where upper(trim(coalesce(p_answers ->> q.number::text, ''))) = upper(q.correct_label);

  -- 80% de acerto certifica (48 de 60)
  v_passed := v_score::numeric / v_total >= 0.8;

  insert into public.certifications (user_id, score, total, passed)
  values (v_user, v_score, v_total, v_passed);

  if v_passed then
    insert into public.user_progress (user_id, module_number, score, total, completed_at)
    select v_user, m.number, v_score, v_total, now()
    from public.modules m where m.is_exam
    on conflict (user_id, module_number) do nothing;
  end if;

  return query select v_score, v_total, v_passed;
end;
$$;

-- Relatório de conformidade (gestores) ----------------------------------
create or replace function public.get_team_compliance_report()
returns table (
  user_id uuid,
  email text,
  full_name text,
  modules_completed integer,
  modules_total integer,
  cert_score integer,
  cert_total integer,
  cert_passed boolean,
  cert_date timestamptz,
  cert_valid_until timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_study_total integer;
begin
  if not public.is_manager() then
    raise exception 'Acesso restrito a gestores.';
  end if;

  select count(*) into v_study_total from public.modules where not is_exam;

  return query
    select
      p.id,
      p.email,
      p.full_name,
      (
        select count(*)::integer
        from public.user_progress up
        join public.modules m on m.number = up.module_number
        where up.user_id = p.id and not m.is_exam
      ),
      v_study_total,
      c.score,
      c.total,
      c.passed,
      c.created_at,
      case when c.created_at is null then null else c.created_at + interval '1 year' end
    from public.profiles p
    left join lateral (
      select cc.score, cc.total, cc.passed, cc.created_at
      from public.certifications cc
      where cc.user_id = p.id
      order by cc.passed desc, cc.created_at desc
      limit 1
    ) c on true
    order by p.email;
end;
$$;

-- Índice de maturidade (gestores) ---------------------------------------
-- Métrica única ponderada: cobertura de treinamento (30%), certificação
-- válida (30%), desempenho no laboratório (20%) e resposta a incidentes (20%).
create or replace function public.get_maturity_index()
returns table (
  score integer,
  training_coverage numeric,
  certification_valid_pct numeric,
  redteam_success_pct numeric,
  incident_avg_pct numeric,
  history jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_users integer;
  v_study_total integer;
  v_training numeric := 0;
  v_cert numeric := 0;
  v_redteam numeric := 0;
  v_incident numeric := 0;
  v_score integer;
begin
  if not public.is_manager() then
    raise exception 'Acesso restrito a gestores.';
  end if;

  select count(*) into v_users from public.profiles;
  select count(*) into v_study_total from public.modules m where not m.is_exam;

  if v_users > 0 and v_study_total > 0 then
    select round(100.0 * count(*) / (v_users * v_study_total), 1)
      into v_training
    from public.user_progress up
    join public.modules m on m.number = up.module_number
    where not m.is_exam;

    select round(100.0 * count(distinct c.user_id) / v_users, 1)
      into v_cert
    from public.certifications c
    where c.passed and c.created_at > now() - interval '1 year';
  end if;

  -- Alias obrigatório: sem ele, `score` colide com a coluna de saída da função.
  select coalesce(round(100.0 * count(*) filter (where rt.success) / nullif(count(*), 0), 1), 0)
    into v_redteam
  from public.redteam_sim_log rt;

  select coalesce(round(100.0 * avg(ir.score::numeric / nullif(ir.max_score, 0)), 1), 0)
    into v_incident
  from public.incident_sim_runs ir;

  v_score := round(0.30 * v_training + 0.30 * v_cert + 0.20 * v_redteam + 0.20 * v_incident);

  -- O índice acumula um ponto por dia em que o relatório é consultado.
  insert into public.maturity_history as mh (day, score)
  values (current_date, v_score)
  on conflict (day) do update set score = excluded.score;

  return query
    select
      v_score,
      v_training,
      v_cert,
      v_redteam,
      v_incident,
      coalesce(
        (
          select jsonb_agg(jsonb_build_object('date', h.day, 'score', h.score) order by h.day)
          from public.maturity_history h
        ),
        '[]'::jsonb
      );
end;
$$;

-- Grants ----------------------------------------------------------------
revoke all on function public.get_module_quiz(integer) from public, anon;
revoke all on function public.submit_module_quiz(integer, jsonb) from public, anon;
revoke all on function public.get_exam() from public, anon;
revoke all on function public.submit_exam(jsonb) from public, anon;
revoke all on function public.get_team_compliance_report() from public, anon;
revoke all on function public.get_maturity_index() from public, anon;

grant execute on function public.get_module_quiz(integer) to authenticated;
grant execute on function public.submit_module_quiz(integer, jsonb) to authenticated;
grant execute on function public.get_exam() to authenticated;
grant execute on function public.submit_exam(jsonb) to authenticated;
grant execute on function public.get_team_compliance_report() to authenticated;
grant execute on function public.get_maturity_index() to authenticated;

-- handle_new_user() é função de trigger: não deve ser invocável pela API REST.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- is_manager() é usada dentro das policies de RLS, então `authenticated`
-- precisa manter EXECUTE (a expressão da policy é avaliada com os privilégios
-- de quem consulta). Para `anon` não há uso legítimo.
revoke all on function public.is_manager() from public, anon;
grant execute on function public.is_manager() to authenticated;
