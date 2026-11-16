-- The browser may edit profile fields, but it must not grant itself broadcast access.
create function public.guard_push_admin_role()
returns trigger language plpgsql set search_path = '' as $$
begin
    if current_user in ('anon', 'authenticated') then
        if tg_op = 'INSERT' then
            if new.is_admin is true then
                raise exception 'Cannot set the administrator role' using errcode = '42501';
            end if;
        elsif new.is_admin is distinct from old.is_admin
            or (old.is_admin is true and new.auth_id is distinct from old.auth_id) then
            raise exception 'Cannot change the administrator role' using errcode = '42501';
        end if;
    end if;
    return new;
end;
$$;

create trigger guard_push_admin_role
before insert or update on public.users
for each row execute function public.guard_push_admin_role();

create table public.android_push_campaigns (
    id uuid primary key,
    created_by uuid references auth.users(id) on delete set null,
    category text not null check (category in ('notice', 'reminder', 'update')),
    title text not null check (char_length(title) between 1 and 80),
    body text not null check (char_length(body) between 1 and 240),
    created_at timestamptz not null default now()
);

create table public.android_push_campaign_devices (
    campaign_id uuid not null references public.android_push_campaigns(id) on delete cascade,
    auth_user_id uuid not null,
    installation_id uuid not null,
    state text not null default 'pending'
        check (state in ('pending', 'claimed', 'accepted', 'failed', 'skipped', 'unconfirmed')),
    claimed_at timestamptz,
    primary key (campaign_id, auth_user_id, installation_id)
);

create index android_push_campaign_pending
    on public.android_push_campaign_devices (campaign_id, auth_user_id, installation_id)
    where state = 'pending';

alter table public.android_push_campaigns enable row level security;
alter table public.android_push_campaign_devices enable row level security;
revoke all on public.android_push_campaigns, public.android_push_campaign_devices from public, anon, authenticated;
grant select, insert on public.android_push_campaigns to service_role;
grant select, insert, update on public.android_push_campaign_devices to service_role;

create view public.android_push_campaign_history with (security_invoker = true) as
select c.*,
    count(d.campaign_id)::integer as recipients,
    count(*) filter (where d.state = 'accepted')::integer as accepted,
    count(*) filter (where d.state = 'failed')::integer as failed,
    count(*) filter (where d.state = 'skipped')::integer as skipped,
    count(*) filter (where d.state = 'pending')::integer as pending,
    count(*) filter (where d.state = 'claimed' and d.claimed_at >= now() - interval '1 minute')::integer as processing,
    count(*) filter (where d.state = 'unconfirmed'
        or (d.state = 'claimed' and d.claimed_at < now() - interval '1 minute'))::integer as unconfirmed
from public.android_push_campaigns c
left join public.android_push_campaign_devices d on d.campaign_id = c.id
group by c.id;

revoke all on public.android_push_campaign_history from public, anon, authenticated;
grant select on public.android_push_campaign_history to service_role;

create function public.start_android_push_campaign(
    p_id uuid, p_admin uuid, p_category text, p_title text, p_body text
)
returns void language plpgsql set search_path = '' as $$
begin
    insert into public.android_push_campaigns (id, created_by, category, title, body)
    values (p_id, p_admin, p_category, p_title, p_body)
    on conflict (id) do nothing;
    if found then
        insert into public.android_push_campaign_devices (campaign_id, auth_user_id, installation_id)
        select p_id, auth_user_id, installation_id
        from public.push_devices where platform = 'android';
    end if;
end;
$$;

create function public.claim_android_push_batch(p_campaign uuid)
returns table (auth_user_id uuid, installation_id uuid, fcm_token text)
language sql set search_path = '' as $$
    with next_batch as (
        select d.auth_user_id, d.installation_id
        from public.android_push_campaign_devices d
        where d.campaign_id = p_campaign and d.state = 'pending'
        order by d.auth_user_id, d.installation_id
        limit 20
        for update skip locked
    ), claimed as (
        update public.android_push_campaign_devices d
        set state = 'claimed', claimed_at = now()
        from next_batch n
        where d.campaign_id = p_campaign
          and (d.auth_user_id, d.installation_id) = (n.auth_user_id, n.installation_id)
        returning d.auth_user_id, d.installation_id
    )
    select c.auth_user_id, c.installation_id, p.fcm_token
    from claimed c left join public.push_devices p using (auth_user_id, installation_id);
$$;

revoke all on function public.start_android_push_campaign(uuid, uuid, text, text, text),
    public.claim_android_push_batch(uuid) from public, anon, authenticated;
grant execute on function public.start_android_push_campaign(uuid, uuid, text, text, text),
    public.claim_android_push_batch(uuid) to service_role;
