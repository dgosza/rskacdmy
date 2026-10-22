-- Provisionamento de usuários da Academy.
-- O app só tem login por e-mail e senha (não há tela de cadastro público),
-- então as contas são criadas por aqui — pelo SQL Editor do Supabase Studio.
--
--   select public.create_academy_user('pessoa@inst.com.br', 'senha', 'Nome');
--   select public.create_academy_user('gestor@inst.com.br', 'senha', 'Nome', true);
--
-- Chamar de novo com o mesmo e-mail redefine a senha daquela conta.
create or replace function public.create_academy_user(
  p_email text,
  p_password text,
  p_full_name text default null,
  p_is_manager boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where email = lower(trim(p_email));

  if v_id is not null then
    update auth.users
      set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
      where id = v_id;
  else
    v_id := gen_random_uuid();

    -- As colunas de token precisam ser '' e não NULL: o GoTrue as lê como
    -- string não-nula e, com NULL, o login falha com
    -- "Database error querying schema".
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token,
      email_change, email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_id, 'authenticated', 'authenticated',
      lower(trim(p_email)),
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (
      v_id::text, v_id,
      jsonb_build_object('sub', v_id::text, 'email', lower(trim(p_email)), 'email_verified', true),
      'email', now(), now()
    );
  end if;

  insert into public.profiles (id, email, full_name, is_manager)
  values (v_id, lower(trim(p_email)), p_full_name, p_is_manager)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        is_manager = excluded.is_manager;

  return v_id;
end;
$$;

-- Nunca exposta pela API REST: só roda com a service role / pelo Studio.
revoke all on function public.create_academy_user(text, text, text, boolean) from public, anon, authenticated;
