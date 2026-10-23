-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.available_achievements (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text,
  requirement_type text,
  requirement_value integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.available_titles (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  requirement_achievement_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_titles_pkey PRIMARY KEY (id),
  CONSTRAINT available_titles_requirement_achievement_id_fkey FOREIGN KEY (requirement_achievement_id) REFERENCES public.available_achievements(id)
);
CREATE TABLE public.award_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  award_id text,
  user_id uuid,
  predicted_winner text NOT NULL,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT award_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT award_predictions_award_id_fkey FOREIGN KEY (award_id) REFERENCES public.awards(id),
  CONSTRAINT award_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.awards (
  id text NOT NULL,
  name text NOT NULL,
  season text NOT NULL,
  logo text DEFAULT '🏆'::text,
  category text NOT NULL,
  deadline timestamp with time zone NOT NULL,
  status text DEFAULT 'active'::text,
  winner text,
  created_at timestamp with time zone DEFAULT now(),
  logo_url text,
  CONSTRAINT awards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.league_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  league_id text,
  user_id uuid,
  predicted_champion text NOT NULL,
  predicted_top_scorer text NOT NULL,
  predicted_top_assist text NOT NULL,
  predicted_mvp text NOT NULL,
  points_earned integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT league_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT league_predictions_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id),
  CONSTRAINT league_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.leagues (
  id text NOT NULL,
  name text NOT NULL,
  season text NOT NULL,
  logo text DEFAULT '🏆'::text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'finished'::text])),
  champion text,
  top_scorer text,
  top_scorer_goals integer,
  top_assist text,
  top_assist_count integer,
  mvp_player text,
  deadline timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  logo_url text,
  CONSTRAINT leagues_pkey PRIMARY KEY (id)
);
create table public.libreta_teams (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'Mi equipo',
  game text not null default 'FIFA',
  formation text not null default '4-3-3',
  gan integer not null default 0,
  emp integer not null default 0,
  per integer not null default 0,
  gc integer not null default 0,
  rival integer not null default 0,
  archived integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint libreta_teams_pkey primary key (id),
  constraint libreta_teams_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint libreta_teams_name_check check (char_length(btrim(name)) between 1 and 30),
  constraint libreta_teams_game_check check (game = any (array['FIFA', 'EA FC', 'PES', 'eFootball', 'Otro'])),
  constraint libreta_teams_formation_check check (formation = any (array['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3', '4-5-1'])),
  constraint libreta_teams_counters_check check (gan >= 0 and emp >= 0 and per >= 0 and gc >= 0 and rival >= 0 and archived >= 0)
);

create table public.libreta_players (
  id uuid not null default gen_random_uuid(),
  team_id uuid not null,
  name text not null,
  pos text not null default 'Delantero',
  g integer not null default 0,
  a integer not null default 0,
  mvp integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint libreta_players_pkey primary key (id),
  constraint libreta_players_team_id_fkey foreign key (team_id) references public.libreta_teams(id) on delete cascade,
  constraint libreta_players_name_check check (char_length(btrim(name)) between 1 and 24),
  constraint libreta_players_pos_check check (pos = any (array['Portero', 'Defensa', 'Mediocampista', 'Delantero'])),
  constraint libreta_players_counters_check check (g >= 0 and a >= 0 and mvp >= 0)
);
CREATE TABLE public.matches (
  id text NOT NULL,
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_team_logo text DEFAULT '🏠'::text,
  away_team_logo text DEFAULT '✈️'::text,
  date text NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'pending'::text,
  result_home integer,
  result_away integer,
  created_at timestamp with time zone DEFAULT now(),
  deadline timestamp with time zone,
  home_team_logo_url text,
  away_team_logo_url text,
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);
CREATE TABLE public.predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id text,
  user_id uuid,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  result_type text,
  points_earned integer DEFAULT 0,
  CONSTRAINT predictions_pkey PRIMARY KEY (id),
  CONSTRAINT predictions_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  points integer DEFAULT 0,
  predictions integer DEFAULT 0,
  correct integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  auth_id uuid NOT NULL,
  is_admin boolean DEFAULT false,
  bio text,
  favorite_team character varying,
  email character varying,
  avatar_url text,
  gender text CHECK (gender = ANY (ARRAY['Masculino'::text, 'Femenino'::text, 'Otro'::text, 'Prefiero no decir'::text])),
  nationality text,
  favorite_player text,
  level integer DEFAULT 1,
  achievements jsonb DEFAULT '[]'::jsonb,
  titles jsonb DEFAULT '[]'::jsonb,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  weekly_correct integer DEFAULT 0,
  weekly_predictions integer DEFAULT 0,
  last_weekly_reset timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.worldcup_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  groups_predictions jsonb DEFAULT '{}'::jsonb,
  knockout_predictions jsonb DEFAULT '{"final": {}, "semis": {}, "round16": {}, "quarters": {}, "thirdPlace": {}}'::jsonb,
  awards_predictions jsonb DEFAULT '{"topAssist": "", "topScorer": "", "surpriseTeam": "", "breakoutPlayer": "", "disappointmentTeam": "", "disappointmentPlayer": ""}'::jsonb,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT worldcup_predictions_pkey PRIMARY KEY (id),
  CONSTRAINT worldcup_predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

create index libreta_teams_user_id_idx on public.libreta_teams (user_id);
create index libreta_players_team_id_idx on public.libreta_players (team_id);

create or replace function public.libreta_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger libreta_teams_touch_updated_at
before update on public.libreta_teams
for each row
execute function public.libreta_touch_updated_at();

alter table public.libreta_teams enable row level security;
alter table public.libreta_players enable row level security;

create policy libreta_teams_owner_all
on public.libreta_teams
for all
to authenticated
using (user_id in (select id from public.users where auth_id = auth.uid()))
with check (user_id in (select id from public.users where auth_id = auth.uid()));

create policy libreta_players_owner_all
on public.libreta_players
for all
to authenticated
using (
  exists (
    select 1
    from public.libreta_teams t
    where t.id = libreta_players.team_id
      and t.user_id in (select id from public.users where auth_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.libreta_teams t
    where t.id = libreta_players.team_id
      and t.user_id in (select id from public.users where auth_id = auth.uid())
  )
);

create or replace function public.libreta_delete_player(p_player_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_team uuid;
  v_goals integer;
begin
  delete from public.libreta_players
  where id = p_player_id
  returning team_id, g into v_team, v_goals;

  if v_team is null then
    return;
  end if;

  update public.libreta_teams
  set archived = archived + v_goals
  where id = v_team;
end;
$$;

revoke all on function public.libreta_delete_player(uuid) from public;
grant execute on function public.libreta_delete_player(uuid) to authenticated;

create or replace function public.libreta_import(p_teams jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_owner uuid;
  v_team jsonb;
  v_player jsonb;
  v_team_id uuid;
begin
  select id into v_owner from public.users where auth_id = auth.uid() limit 1;

  if v_owner is null then
    raise exception 'usuario no encontrado';
  end if;

  if exists (select 1 from public.libreta_teams where user_id = v_owner) then
    return;
  end if;

  for v_team in select * from jsonb_array_elements(p_teams) loop
    insert into public.libreta_teams (user_id, name, game, formation, gan, emp, per, gc, rival, archived, created_at)
    values (
      v_owner,
      v_team->>'name',
      v_team->>'game',
      v_team->>'formation',
      (v_team->>'gan')::integer,
      (v_team->>'emp')::integer,
      (v_team->>'per')::integer,
      (v_team->>'gc')::integer,
      (v_team->>'rival')::integer,
      (v_team->>'archived')::integer,
      clock_timestamp()
    )
    returning id into v_team_id;

    for v_player in select * from jsonb_array_elements(coalesce(v_team->'players', '[]'::jsonb)) loop
      insert into public.libreta_players (team_id, name, pos, g, a, mvp, created_at)
      values (
        v_team_id,
        v_player->>'name',
        v_player->>'pos',
        (v_player->>'g')::integer,
        (v_player->>'a')::integer,
        (v_player->>'mvp')::integer,
        clock_timestamp()
      );
    end loop;
  end loop;
end;
$$;

revoke all on function public.libreta_import(jsonb) from public;
grant execute on function public.libreta_import(jsonb) to authenticated;
