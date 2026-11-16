create table public.push_devices (
    auth_user_id uuid not null references auth.users(id) on delete cascade,
    installation_id uuid not null,
    fcm_token text not null unique check (char_length(fcm_token) between 1 and 4096),
    platform text not null default 'android' check (platform = 'android'),
    updated_at timestamptz not null default now(),
    primary key (auth_user_id, installation_id)
);

alter table public.push_devices enable row level security;
revoke all on table public.push_devices from public, anon, authenticated;
grant select, delete on table public.push_devices to service_role;

create function public.register_android_push_device(p_installation_id uuid, p_fcm_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller_id uuid := auth.uid();
begin
    if caller_id is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;

    insert into public.push_devices (auth_user_id, installation_id, fcm_token)
    values (caller_id, p_installation_id, btrim(p_fcm_token))
    on conflict (auth_user_id, installation_id) do update
    set fcm_token = excluded.fcm_token, updated_at = now();
end;
$$;

create function public.unregister_android_push_device(p_installation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;

    delete from public.push_devices
    where auth_user_id = auth.uid() and installation_id = p_installation_id;
end;
$$;

revoke all on function public.register_android_push_device(uuid, text) from public, anon;
revoke all on function public.unregister_android_push_device(uuid) from public, anon;
grant execute on function public.register_android_push_device(uuid, text) to authenticated;
grant execute on function public.unregister_android_push_device(uuid) to authenticated;
