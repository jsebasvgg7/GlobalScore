alter table public.android_push_campaigns
    add column destination text not null default 'matches'
        check (destination in ('home', 'matches', 'ranking', 'stats', 'leagues', 'awards'));

create or replace view public.android_push_campaign_history with (security_invoker = true) as
select c.id, c.created_by, c.category, c.title, c.body, c.created_at,
    count(d.campaign_id)::integer as recipients,
    count(*) filter (where d.state = 'accepted')::integer as accepted,
    count(*) filter (where d.state = 'failed')::integer as failed,
    count(*) filter (where d.state = 'skipped')::integer as skipped,
    count(*) filter (where d.state = 'pending')::integer as pending,
    count(*) filter (where d.state = 'claimed' and d.claimed_at >= now() - interval '1 minute')::integer as processing,
    count(*) filter (where d.state = 'unconfirmed'
        or (d.state = 'claimed' and d.claimed_at < now() - interval '1 minute'))::integer as unconfirmed,
    c.destination
from public.android_push_campaigns c
left join public.android_push_campaign_devices d on d.campaign_id = c.id
group by c.id;

create function public.start_android_push_campaign(
    p_id uuid, p_admin uuid, p_category text, p_title text, p_body text, p_destination text
)
returns void language plpgsql set search_path = '' as $$
begin
    insert into public.android_push_campaigns (id, created_by, category, title, body, destination)
    values (p_id, p_admin, p_category, p_title, p_body, p_destination)
    on conflict (id) do nothing;
    if found then
        insert into public.android_push_campaign_devices (campaign_id, auth_user_id, installation_id)
        select p_id, auth_user_id, installation_id
        from public.push_devices where platform = 'android';
    end if;
end;
$$;

revoke all on function public.start_android_push_campaign(uuid, uuid, text, text, text, text)
    from public, anon, authenticated;
grant execute on function public.start_android_push_campaign(uuid, uuid, text, text, text, text)
    to service_role;

create or replace function public.start_android_push_campaign(
    p_id uuid, p_admin uuid, p_category text, p_title text, p_body text
)
returns void language sql set search_path = '' as $$
    select public.start_android_push_campaign(p_id, p_admin, p_category, p_title, p_body, 'matches');
$$;
