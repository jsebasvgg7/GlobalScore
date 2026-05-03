Sección de Competiciones
🎯 Objetivo
Crear una vista modular que soporte 3 formatos de competición:

Grupos + Eliminatorias (Mundial, Champions, Libertadores)
Solo Liga (LaLiga, Premier League, Serie A)
Solo Eliminatorias (Copa del Rey, FA Cup, Supercopa)


🗂️ Estructura de Base de Datos (Ya existe)
Según tu PageHistory.md, ya tienes:
sqlhistorical_competitions (
  id, name, type, year, description, 
  winner_team_id, image_path, is_published
)

historical_team_titles (
  team_id, competition_id, title_name, year
)
✅ Modificaciones necesarias:

Agregar campo format a historical_competitions:

sqlALTER TABLE historical_competitions 
ADD COLUMN format VARCHAR 
CHECK (format IN ('groups_knockout', 'league_only', 'knockout_only'));

Modificar winner_team_id para permitir texto libre:

sqlALTER TABLE historical_competitions 
ADD COLUMN winner_text VARCHAR;
-- Mantener winner_team_id para cuando sea un equipo registrado

Crear tabla para Grupos (formato 1):

sqlCREATE TABLE historical_competition_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES historical_competitions(id),
  group_name VARCHAR NOT NULL, -- "Grupo A", "Grupo B"
  team_name VARCHAR NOT NULL,
  team_id UUID REFERENCES historical_teams(id), -- opcional
  position INTEGER, -- 1, 2, 3, 4
  points INTEGER,
  wins INTEGER,
  draws INTEGER,
  losses INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  sort_order INTEGER DEFAULT 0
);

Crear tabla para Tabla de Liga (formato 2):

sqlCREATE TABLE historical_competition_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES historical_competitions(id),
  position INTEGER NOT NULL,
  team_name VARCHAR NOT NULL,
  team_id UUID REFERENCES historical_teams(id), -- opcional
  points INTEGER,
  wins INTEGER,
  draws INTEGER,
  losses INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  champion BOOLEAN DEFAULT false -- marcar al campeón
);

Crear tabla para Fases Eliminatorias (formatos 1 y 3):

sqlCREATE TABLE historical_competition_knockout (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES historical_competitions(id),
  round VARCHAR NOT NULL, -- "Final", "Semifinal", "Cuartos", "Octavos"
  match_number INTEGER, -- 1, 2 (para ida/vuelta o SF1/SF2)
  team_a VARCHAR NOT NULL,
  team_b VARCHAR NOT NULL,
  team_a_id UUID REFERENCES historical_teams(id),
  team_b_id UUID REFERENCES historical_teams(id),
  score_a INTEGER,
  score_b INTEGER,
  winner VARCHAR, -- "team_a" | "team_b" | "draw"
  penalties_a INTEGER, -- para finales con penales
  penalties_b INTEGER,
  sort_order INTEGER DEFAULT 0
);

🎨 UI/UX Propuesta
Vista de Listado (similar a HistoricalTeamsPage)
┌─────────────────────────────────────────────────────┐
│  COMPETICIONES HISTÓRICAS                           │
│  12 torneos legendarios                             │
│  🔍 Buscar competición...                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  COPA DEL MUNDO 1970                 │
│  │ 🏆 LOGO  │  Brasil · Mundial · 1970             │
│  └──────────┘  Formato: Grupos + Eliminatorias    │
│                3 títulos registrados               │
│                                                     │
│  ┌──────────┐  SERIE A 1988-89                     │
│  │ ⚽ LOGO  │  Italia · Doméstico · 1989           │
│  └──────────┘  Formato: Solo Liga                 │
│                1 campeón registrado                │
│                                                     │
└─────────────────────────────────────────────────────┘
Vista de Detalle (3 pestañas según formato)
TAB 1: Info General (todos los formatos)
jsx<section>
  <Hero>
    <Logo /> 
    <Nombre: "Copa del Mundo 1970" />
    <Chips: País, Tipo, Año, Formato />
    <Campeón: "Brasil" o texto libre />
  </Hero>
  
  <Contexto Histórico>
    {description}
  </Contexto>
</section>
TAB 2: Fase de Grupos (solo formato 1)
jsx<section>
  <GrupoA>
    <TablaGrupo teams={grupoA} />
  </GrupoA>
  <GrupoB>
    <TablaGrupo teams={grupoB} />
  </GrupoB>
  ...
</section>
TAB 3: Tabla General (solo formato 2)
jsx<section>
  <TablaLiga standings={standings} />
  {/* Similar a tu componente actual de equipos */}
</section>
TAB 4: Fase Final / Eliminatorias (formatos 1 y 3)
jsx<section>
  <BracketView>
    <Final />
    <Semifinales />
    <Cuartos />
    <Octavos />
  </BracketView>
</section>

🔧 Panel de Administración
Pestañas del AdminHistorical (competiciones)
┌─────────────────────────────────────────────────────┐
│ [Info] [Grupos] [Tabla Liga] [Eliminatorias]       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TAB: INFO                                          │
│  ├─ Nombre: [Copa del Mundo 1970]                  │
│  ├─ Tipo: [Internacional ▼]                        │
│  ├─ Año: [1970]                                    │
│  ├─ Formato: [Grupos + Eliminatorias ▼]            │
│  ├─ Campeón: ○ Equipo registrado [Brasil ▼]       │
│  │           ● Texto libre [_____________]         │
│  ├─ Descripción: [...]                             │
│  └─ Publicado: [✓]                                 │
│                                                     │
│  TAB: GRUPOS (solo si formato = groups_knockout)   │
│  ┌────────────────────────────────────────────┐    │
│  │ Grupo A                                    │    │
│  │ ├─ Uruguay · 1° · 6pts · 2-0-1            │    │
│  │ ├─ México  · 2° · 4pts · 1-1-1            │    │
│  │ └─ [+ Añadir equipo]                       │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  TAB: TABLA (solo si formato = league_only)        │
│  [Tabla editable como en TeamPanel]                │
│                                                     │
│  TAB: ELIMINATORIAS                                │
│  ┌────────────────────────────────────────────┐    │
│  │ Final                                       │    │
│  │ Brasil 4 - 1 Italia                        │    │
│  │ Semifinal 1                                │    │
│  │ Brasil 3 - 1 Uruguay                       │    │
│  │ [+ Añadir partido]                         │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

📁 Archivos a Crear/Modificar
Nuevos archivos:
src/
├─ components/
│  └─ ComHistory/
│     ├─ HistoricalCompetitionsPage.jsx  ← Vista principal
│     ├─ CompetitionDetailView.jsx       ← Detalle con tabs
│     ├─ GroupStageTable.jsx             ← Tabla de grupos
│     ├─ LeagueStandingsTable.jsx        ← Tabla de liga
│     └─ KnockoutBracket.jsx             ← Llave eliminatoria
│
├─ hooks/HooksHistory/
│  └─ useHistoricalCompetitions.js       ← Hook para fetch
│
└─ styles/StylesHistory/
   └─ HistoricalCompetitionsPage.css
Modificar:
src/
├─ components/ComAdmin/AdminHistorical.jsx
│  └─ Añadir CompetitionPanel con 4 tabs
│
├─ hooks/HooksAdmin/useAdminHistorical.js
│  └─ Añadir funciones CRUD para grupos/tabla/eliminatorias
│
└─ pages/HistoryPage.jsx
   └─ Añadir ruta a competiciones en HistorySectionNav

🎯 Flujo de Trabajo Recomendado
Fase 1: Backend (Admin)

✅ Crear migraciones SQL para nuevas tablas
✅ Extender useAdminHistorical.js con funciones CRUD
✅ Crear CompetitionPanel con 4 tabs
✅ Implementar tablas editables (similar a TeamPanel)

Fase 2: Frontend (Público)

✅ Crear HistoricalCompetitionsPage (listado)
✅ Crear CompetitionDetailView (vista individual)
✅ Implementar componentes de visualización:

GroupStageTable
LeagueStandingsTable
KnockoutBracket


✅ Integrar con HistorySectionNav

Fase 3: Pulido

✅ Responsive mobile
✅ Añadir filtros (por tipo, año, formato)
✅ Integrar panel derecho (top competiciones)


💡 Consideraciones Clave
1. Campeón flexible:
jsx// En el admin
{winnerId 
  ? teams.find(t => t.id === winnerId)?.name 
  : winnerText
}
2. Visualización del bracket:
jsx// Usar CSS Grid para la llave
.knockout-bracket {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; /* Octavos → Cuartos → SF → Final */
  gap: 20px;
}
3. Reutilización de componentes:

LeagueStandingsTable puede ser similar a tu tabla de equipos existente
GroupStageTable es una variante más pequeña
Usa los mismos helpers (getHistoricalImageUrl, badges, etc.)


---
Base de datos completa de la pagina GLOBALSCORE

CREATE TABLE public.app_config (
  id integer NOT NULL DEFAULT 1 CHECK (id = 1),
  last_monthly_reset timestamp with time zone,
  CONSTRAINT app_config_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.available_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_banners_pkey PRIMARY KEY (id)
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
CREATE TABLE public.historical_competitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  type character varying,
  year integer,
  description text,
  winner_team_id uuid,
  image_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_id uuid,
  CONSTRAINT historical_competitions_pkey PRIMARY KEY (id),
  CONSTRAINT historical_competitions_winner_team_id_fkey FOREIGN KEY (winner_team_id) REFERENCES public.historical_teams(id),
  CONSTRAINT historical_competitions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id)
);
CREATE TABLE public.historical_event_competitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  competition_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_event_competitions_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_competitions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id),
  CONSTRAINT historical_event_competitions_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id)
);
CREATE TABLE public.historical_event_teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  team_id uuid NOT NULL,
  role_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_event_teams_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_teams_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id),
  CONSTRAINT historical_event_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  description text,
  event_date date,
  event_type character varying,
  image_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_id uuid,
  CONSTRAINT historical_events_pkey PRIMARY KEY (id),
  CONSTRAINT historical_events_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id)
);
CREATE TABLE public.historical_player_career (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  team_id uuid,
  team_name character varying NOT NULL,
  team_country character varying,
  start_year integer,
  end_year integer,
  appearances integer DEFAULT 0,
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  role_note character varying,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_player_career_pkey PRIMARY KEY (id),
  CONSTRAINT historical_player_career_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id),
  CONSTRAINT historical_player_career_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_player_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  event_id uuid NOT NULL,
  role_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_player_events_pkey PRIMARY KEY (id),
  CONSTRAINT historical_player_events_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id),
  CONSTRAINT historical_player_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id)
);
CREATE TABLE public.historical_player_national (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  country character varying NOT NULL,
  start_year integer,
  end_year integer,
  caps integer DEFAULT 0,
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  role_note character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_player_national_pkey PRIMARY KEY (id),
  CONSTRAINT historical_player_national_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id)
);
CREATE TABLE public.historical_player_teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  team_id uuid NOT NULL,
  start_year integer,
  end_year integer,
  roles character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_player_teams_pkey PRIMARY KEY (id),
  CONSTRAINT historical_player_teams_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id),
  CONSTRAINT historical_player_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_player_titles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  title_category character varying NOT NULL DEFAULT 'club'::character varying CHECK (title_category::text = ANY (ARRAY['club'::character varying, 'national'::character varying, 'individual'::character varying]::text[])),
  title_name character varying NOT NULL,
  year character varying,
  team_name character varying,
  quantity integer DEFAULT 1,
  competition_id uuid,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_player_titles_pkey PRIMARY KEY (id),
  CONSTRAINT historical_player_titles_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id),
  CONSTRAINT historical_player_titles_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id)
);
CREATE TABLE public.historical_players (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  country character varying,
  position character varying,
  birth_year integer,
  death_year integer,
  description text,
  impact_summary text,
  era character varying,
  legacy_type character varying,
  significance_level integer CHECK (significance_level >= 1 AND significance_level <= 5),
  image_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_id uuid,
  CONSTRAINT historical_players_pkey PRIMARY KEY (id),
  CONSTRAINT historical_players_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id)
);
CREATE TABLE public.historical_team_lineup (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  shirt_number integer NOT NULL CHECK (shirt_number >= 1 AND shirt_number <= 11),
  player_name character varying NOT NULL,
  position_role character varying,
  pos_x numeric NOT NULL DEFAULT 50,
  pos_y numeric NOT NULL DEFAULT 50,
  player_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_team_lineup_pkey PRIMARY KEY (id),
  CONSTRAINT historical_team_lineup_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id),
  CONSTRAINT historical_team_lineup_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id)
);
CREATE TABLE public.historical_team_titles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  competition_id uuid,
  title_name character varying NOT NULL,
  year integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_team_titles_pkey PRIMARY KEY (id),
  CONSTRAINT historical_team_titles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id),
  CONSTRAINT historical_team_titles_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id)
);
CREATE TABLE public.historical_teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  country character varying,
  founded_year integer,
  description text,
  era_dominance character varying,
  legacy_type character varying,
  image_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_id uuid,
  primary_color character varying DEFAULT '#FFFFFF'::character varying,
  secondary_color character varying DEFAULT '#000000'::character varying,
  formation character varying DEFAULT '4-3-3'::character varying,
  titles_count integer DEFAULT 0,
  active_years character varying,
  manager character varying,
  historical_note text,
  CONSTRAINT historical_teams_pkey PRIMARY KEY (id),
  CONSTRAINT historical_teams_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id)
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
  deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  logo_url text,
  CONSTRAINT leagues_pkey PRIMARY KEY (id)
);
CREATE TABLE public.matches (
  id text NOT NULL,
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_team_logo text DEFAULT 'home'::text,
  away_team_logo text DEFAULT 'plane'::text,
  date text NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'pending'::text,
  result_home integer,
  result_away integer,
  created_at timestamp with time zone DEFAULT now(),
  deadline timestamp with time zone,
  home_team_logo_url text,
  away_team_logo_url text,
  league_logo_url text,
  is_knockout boolean DEFAULT false,
  advancing_team text CHECK (advancing_team = ANY (ARRAY['home'::text, 'away'::text])),
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);
CREATE TABLE public.monthly_championship_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_year text NOT NULL,
  points integer NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  awarded_by uuid,
  CONSTRAINT monthly_championship_history_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_championship_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT monthly_championship_history_awarded_by_fkey FOREIGN KEY (awarded_by) REFERENCES public.users(id)
);
CREATE TABLE public.monthly_ranking_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL,
  avatar_url text,
  points integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  predictions integer NOT NULL DEFAULT 0,
  rank integer NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT monthly_ranking_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_ranking_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title_enc text NOT NULL DEFAULT ''::text,
  content_enc text NOT NULL DEFAULT ''::text,
  color text NOT NULL DEFAULT 'purple'::text CHECK (color = ANY (ARRAY['purple'::text, 'green'::text, 'gold'::text, 'red'::text, 'blue'::text, 'gray'::text])),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  predicted_advancing_team text CHECK (predicted_advancing_team = ANY (ARRAY['home'::text, 'away'::text])),
  advancing_points integer DEFAULT 0,
  CONSTRAINT predictions_pkey PRIMARY KEY (id),
  CONSTRAINT predictions_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT predictions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  subscription jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banner_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_banners_pkey PRIMARY KEY (id),
  CONSTRAINT user_banners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_banners_banner_id_fkey FOREIGN KEY (banner_id) REFERENCES public.available_banners(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'light'::text CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text, 'auto'::text])),
  font_size text DEFAULT 'medium'::text CHECK (font_size = ANY (ARRAY['small'::text, 'medium'::text, 'large'::text])),
  push_enabled boolean DEFAULT false,
  notif_new_matches boolean DEFAULT true,
  notif_finished_matches boolean DEFAULT true,
  notif_new_leagues boolean DEFAULT true,
  notif_reminders boolean DEFAULT true,
  notif_sound boolean DEFAULT true,
  confirm_before_save boolean DEFAULT false,
  auto_save boolean DEFAULT true,
  show_probabilities boolean DEFAULT false,
  predictions_public boolean DEFAULT true,
  profile_public boolean DEFAULT true,
  show_stats_in_ranking boolean DEFAULT true,
  share_activity boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  monthly_points integer DEFAULT 0,
  monthly_correct integer DEFAULT 0,
  monthly_predictions integer DEFAULT 0,
  last_monthly_reset timestamp with time zone DEFAULT now(),
  monthly_championships integer DEFAULT 0,
  equipped_banner_url text,
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

---