Sección de Eventos Históricos🎯 Concepto: Narrativa Visual InmersivaObjetivo: Transformar momentos históricos en experiencias cinematográficas donde el usuario viva el evento, no solo lo lea.🗂️ Estructura de Base de DatosModificaciones a historical_events:sqlALTER TABLE historical_events 
ADD COLUMN event_category VARCHAR CHECK (event_category IN ('player', 'team')),
ADD COLUMN banner_image_path TEXT, -- imagen panorámica 16:9 o 21:9
ADD COLUMN context_text TEXT,      -- setup del momento
ADD COLUMN impact_text TEXT,        -- consecuencias/legado
ADD COLUMN protagonist_id UUID REFERENCES historical_players(id), -- para eventos de jugador
ADD COLUMN team_id UUID REFERENCES historical_teams(id);          -- para eventos de equipoNueva tabla: historical_event_lineups (solo eventos de jugador)sqlCREATE TABLE historical_event_lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES historical_events(id),
  team_side VARCHAR NOT NULL CHECK (team_side IN ('team_a', 'team_b')),
  team_name VARCHAR NOT NULL,
  team_id UUID REFERENCES historical_teams(id),
  shirt_number INTEGER CHECK (shirt_number BETWEEN 1 AND 11),
  player_name VARCHAR NOT NULL,
  position_role VARCHAR, -- GK, CB, ST, etc.
  is_protagonist BOOLEAN DEFAULT false, -- destacar al protagonista
  sort_order INTEGER DEFAULT 0
);Nueva tabla: historical_event_squad (solo eventos de equipo)sqlCREATE TABLE historical_event_squad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES historical_events(id),
  player_name VARCHAR NOT NULL,
  player_id UUID REFERENCES historical_players(id),
  shirt_number INTEGER,
  position_role VARCHAR,
  is_key_player BOOLEAN DEFAULT false, -- jugadores clave del momento
  sort_order INTEGER DEFAULT 0
);Nueva tabla: historical_event_standings (para eventos de equipo tipo liga)sqlCREATE TABLE historical_event_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES historical_events(id),
  position INTEGER NOT NULL,
  team_name VARCHAR NOT NULL,
  team_id UUID REFERENCES historical_teams(id),
  points INTEGER,
  wins INTEGER,
  draws INTEGER,
  losses INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  is_champion BOOLEAN DEFAULT false -- marcar al campeón del evento
);Nueva tabla: historical_event_knockout (para eventos de equipo tipo copa)sqlCREATE TABLE historical_event_knockout (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES historical_events(id),
  round VARCHAR NOT NULL, -- "Final", "Semifinal", etc.
  match_number INTEGER,
  team_a VARCHAR NOT NULL,
  team_b VARCHAR NOT NULL,
  score_a INTEGER,
  score_b INTEGER,
  winner VARCHAR, -- "team_a" | "team_b"
  is_decisive BOOLEAN DEFAULT false, -- marcar el partido clave
  sort_order INTEGER DEFAULT 0
);🎨 UI/UX: Experiencia CinematográficaVista de Listado (Grid de Eventos)┌─────────────────────────────────────────────────────────┐
│  MOMENTOS HISTÓRICOS                                    │
│  15 eventos que definieron el fútbol                    │
│  🔍 Buscar evento...    [🎭 Jugador] [🏆 Equipo]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [BANNER IMAGE 16:9]                             │   │
│  │ Maradona vs Inglaterra                          │   │
│  │                                                 │   │
│  │ 🎭 Jugador · Partido Histórico · 1986          │   │
│  │ "El Gol del Siglo y la Mano de Dios"           │   │
│  │ [PROTAGONISTA: Maradona] →                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [BANNER IMAGE 16:9]                             │   │
│  │ Bayer Leverkusen Invencible                     │   │
│  │                                                 │   │
│  │ 🏆 Equipo · Campeonato · 2023-24               │   │
│  │ "51 partidos sin perder en Bundesliga"         │   │
│  │ [EQUIPO: Leverkusen] →                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘🎬 Vista de Detalle: Estructura NarrativaTIPO 1: Evento de Jugador (ej: Maradona vs Inglaterra)┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │         [BANNER PANORÁMICO 21:9]                │  │
│  │         Maradona controlando el balón           │  │
│  │                                                  │  │
│  │  MARADONA VS INGLATERRA                         │  │
│  │  Cuartos de Final · Mundial 1986                │  │
│  │  🎭 Jugador · 22 de junio 1986                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [← Volver]                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ CONTEXTO ━━━                                       │
│                                                         │
│  Cuatro años después de la Guerra de Malvinas,         │
│  Argentina e Inglaterra se enfrentan en el Azteca.     │
│  Maradona busca venganza deportiva ante 114,000        │
│  espectadores. El partido está 0-0 a los 51 minutos... │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ PROTAGONISTA ━━━                                   │
│                                                         │
│  ┌────────────┐                                        │
│  │ [FOTO 1:1] │  DIEGO ARMANDO MARADONA                │
│  │  Maradona  │  Argentina · Centrocampista            │
│  └────────────┘  25 años · Número 10                   │
│                  Capitán de la selección               │
│                                                         │
│  "En el fútbol, como en la vida, hay que saber         │
│   cuándo usar la cabeza y cuándo el corazón"           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ EL ENFRENTAMIENTO ━━━                              │
│                                                         │
│  ┌──────────────────────┬──────────────────────┐       │
│  │   ARGENTINA 2-1      │      INGLATERRA      │       │
│  │   Formación: 4-4-2   │   Formación: 4-4-2   │       │
│  ├──────────────────────┼──────────────────────┤       │
│  │                      │                      │       │
│  │  [CAMPO TÁCTICO]     │   [CAMPO TÁCTICO]    │       │
│  │                      │                      │       │
│  │  Pumpido (1)         │   Shilton (1)        │       │
│  │  Cuciuffo (14)       │   Stevens (2)        │       │
│  │  Brown (19)          │   Butcher (6)        │       │
│  │  Ruggeri (19)        │   Fenwick (5)        │       │
│  │  Olarticoechea (7)   │   Sansom (3)         │       │
│  │  Batista (2)         │   Steven (8)         │       │
│  │  Giusti (16)         │   Reid (7)           │       │
│  │  ★ MARADONA (10) ★   │   Hoddle (10)        │       │
│  │  Burruchaga (11)     │   Beardsley (9)      │       │
│  │  Valdano (11)        │   Lineker (10)       │       │
│  │  Enrique (18)        │   Hodge (4)          │       │
│  │                      │                      │       │
│  └──────────────────────┴──────────────────────┘       │
│                                                         │
│  Goles: Maradona 51' (mano), 55' (gambeta)             │
│         Lineker 81'                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ IMPACTO Y LEGADO ━━━                               │
│                                                         │
│  En 4 minutos, Maradona redefinió el fútbol para       │
│  siempre. "La Mano de Dios" y "El Gol del Siglo"      │
│  coexisten como luz y sombra del genio argentino.      │
│                                                         │
│  Argentina avanzó a semifinales, derrotó a Bélgica     │
│  y conquistó su segundo Mundial. Maradona fue el       │
│  mejor jugador del torneo con 5 goles y 5 asistencias. │
│                                                         │
│  Este partido trasciende el fútbol: es poesía,         │
│  política y arte condensados en 90 minutos.            │
│                                                         │
└─────────────────────────────────────────────────────────┘TIPO 2: Evento de Equipo (ej: Bayer Leverkusen Invencible)┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │         [BANNER PANORÁMICO 21:9]                │  │
│  │         Leverkusen celebrando título            │  │
│  │                                                  │  │
│  │  BAYER LEVERKUSEN INVENCIBLE                    │  │
│  │  Bundesliga 2023-24                             │  │
│  │  🏆 Equipo · Temporada Histórica                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [← Volver]                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ CONTEXTO ━━━                                       │
│                                                         │
│  Nunca campeones en sus 119 años de historia, el       │
│  "Neverkusen" rompe la maldición bajo Xabi Alonso.     │
│  Buscan la perfección: 34 partidos sin perder en       │
│  liga, persiguiendo el récord histórico del Arsenal    │
│  mientras compiten en Europa League y Copa...          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ EL EQUIPO LEGENDARIO ━━━                           │
│                                                         │
│  ┌────────────┐                                        │
│  │ [ESCUDO]   │  BAYER 04 LEVERKUSEN                   │
│  │  Leverkusen│  Alemania · 2023-24                    │
│  └────────────┘  DT: Xabi Alonso                       │
│                  Formación: 3-4-2-1                    │
│                                                         │
│  ━━━ PLANTEL ESTELAR ━━━                                │
│                                                         │
│  Porteros:                                             │
│  • Hradecky (1) ⭐ - Capitán y muro infranqueable      │
│  • Kovář (17)                                          │
│                                                         │
│  Defensores:                                           │
│  • Tapsoba (12) ⭐ - Líder defensivo                   │
│  • Tah (4)                                             │
│  • Hincapié (3)                                        │
│  • Stanisic (2)                                        │
│  • Kossounou (6)                                       │
│                                                         │
│  Centrocampistas:                                      │
│  • Xhaka (34) ⭐ - Cerebro del equipo                  │
│  • Palacios (25)                                       │
│  • Andrich (8)                                         │
│  • Grimaldo (20) ⭐ - 14 goles desde lateral           │
│  • Frimpong (30) ⭐ - Velocidad pura                   │
│                                                         │
│  Delanteros:                                           │
│  • Wirtz (10) ⭐ - La joya alemana                     │
│  • Boniface (22) ⭐ - Goleador implacable              │
│  • Adli (21)                                           │
│  • Hofmann (7)                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ LA CAMPAÑA PERFECTA ━━━                            │
│                                                         │
│  TABLA FINAL - BUNDESLIGA 2023-24                      │
│                                                         │
│  Pos  Equipo              PJ  G  E  P   GF  GC  Pts    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│   1  🏆 Bayer Leverkusen  34 28  6  0   89  24   90    │
│   2  Bayern München       34 23  8  3   94  45   77    │
│   3  VfB Stuttgart        34 23  4  7   78  39   73    │
│   4  RB Leipzig           34 20  7  7   77  42   67    │
│   5  Borussia Dortmund    34 18  9  7   68  43   63    │
│                                                         │
│  ━━━ RÉCORDS ROTOS ━━━                                  │
│                                                         │
│  📊 51 partidos invictos (todas competiciones)         │
│  🎯 28 victorias en 34 partidos de liga               │
│  ⚽ 89 goles anotados                                   │
│  🛡️ Solo 24 goles recibidos                            │
│  🔥 Primera Bundesliga en 119 años                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━ IMPACTO Y LEGADO ━━━                               │
│                                                         │
│  El "Neverkusen" se transformó en "Neverlusen".        │
│  Xabi Alonso escribió el guion perfecto: un equipo     │
│  que no sabía perder, que no conocía el miedo.         │
│                                                         │
│  No solo rompieron la maldición del subcampeonato,     │
│  redefinieron lo posible. Una temporada que pasará     │
│  a la historia como la más dominante de la Bundesliga. │
│                                                         │
│  El fútbol recordará 2023-24 como el año en que        │
│  Leverkusen alcanzó la perfección.                     │
│                                                         │
└─────────────────────────────────────────────────────────┘🔧 Panel de AdministraciónAdminHistorical → EventPanel (4 tabs)┌─────────────────────────────────────────────────────────┐
│ [Info] [Jugador] [Equipo] [Impacto]                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TAB: INFO                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                         │
│  Imagen Principal (1:1):  [📤 Upload]                   │
│  ┌─────────────┐                                       │
│  │ [Preview]   │                                       │
│  └─────────────┘                                       │
│                                                         │
│  Banner Panorámico (16:9 o 21:9):  [📤 Upload]         │
│  ┌──────────────────────────────────────────────┐      │
│  │ [Banner Preview - Más Ancho]                 │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Título: [Maradona vs Inglaterra                    ]  │
│  Tipo:   [Partido Histórico ▼]                        │
│  Fecha:  [1986-06-22]                                  │
│                                                         │
│  Categoría: ● Evento de Jugador                        │
│             ○ Evento de Equipo                         │
│                                                         │
│  Contexto (setup del momento):                         │
│  ┌──────────────────────────────────────────────┐      │
│  │ Cuatro años después de la Guerra de          │      │
│  │ Malvinas, Argentina e Inglaterra se          │      │
│  │ enfrentan en el Azteca...                    │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Publicado: [✓]                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TAB: JUGADOR (solo si categoría = jugador)            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                         │
│  Protagonista: [Maradona ▼]                            │
│                                                         │
│  ━━━ EQUIPO A ━━━                                       │
│  Nombre: [Argentina]                                   │
│  Formación: [4-4-2 ▼]                                  │
│                                                         │
│  Alineación (11 jugadores):                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ 1  Pumpido        GK                         │      │
│  │ 14 Cuciuffo       RB                         │      │
│  │ 19 Brown          CB                         │      │
│  │ 19 Ruggeri        CB                         │      │
│  │ 7  Olarticoechea  LB                         │      │
│  │ 2  Batista        CM                         │      │
│  │ 16 Giusti         CM                         │      │
│  │ 10 ⭐ MARADONA    CAM  ← Protagonista        │      │
│  │ 11 Burruchaga     RW                         │      │
│  │ 11 Valdano        ST                         │      │
│  │ 18 Enrique        LW                         │      │
│  │ [+ Añadir jugador]                           │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  ━━━ EQUIPO B ━━━                                       │
│  [Mismo formato que Equipo A]                          │
│                                                         │
│  Resultado: Argentina [2] - [1] Inglaterra             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TAB: EQUIPO (solo si categoría = equipo)              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                         │
│  Equipo Protagonista: [Bayer Leverkusen ▼]             │
│  Director Técnico: [Xabi Alonso]                       │
│  Formación: [3-4-2-1 ▼]                                │
│                                                         │
│  Plantel (jugadores clave):                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ 1  Hradecky       GK  ⭐ Clave               │      │
│  │ 12 Tapsoba        CB  ⭐ Clave               │      │
│  │ 34 Xhaka          CM  ⭐ Clave               │      │
│  │ 20 Grimaldo       LWB ⭐ Clave               │      │
│  │ 30 Frimpong       RWB ⭐ Clave               │      │
│  │ 10 Wirtz          CAM ⭐ Clave               │      │
│  │ 22 Boniface       ST  ⭐ Clave               │      │
│  │ 4  Tah            CB                         │      │
│  │ [+ Añadir jugador]                           │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Tipo de Competición: ● Liga  ○ Eliminatorias          │
│                                                         │
│  [Si Liga] → Tabla Final:                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Pos  Equipo              PJ  Pts             │      │
│  │ 1    Bayer Leverkusen 🏆 34  90              │      │
│  │ 2    Bayern München      34  77              │      │
│  │ 3    VfB Stuttgart       34  73              │      │
│  │ [+ Añadir equipo]                            │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  [Si Eliminatorias] → Partidos Clave:                  │
│  ┌──────────────────────────────────────────────┐      │
│  │ Final                                        │      │
│  │ Bayer Leverkusen 1 - 0 Kaiserslautern ✓     │      │
│  │ Semifinal                                    │      │
│  │ Bayer Leverkusen 4 - 0 Düsseldorf           │      │
│  │ [+ Añadir partido]                           │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TAB: IMPACTO (ambas categorías)                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                         │
│  Legado y Consecuencias:                               │
│  ┌──────────────────────────────────────────────┐      │
│  │ En 4 minutos, Maradona redefinió el fútbol   │      │
│  │ para siempre. "La Mano de Dios" y "El Gol    │      │
│  │ del Siglo" coexisten como luz y sombra...    │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Estadísticas/Récords (opcional):                      │
│  ┌──────────────────────────────────────────────┐      │
│  │ • 51 partidos invictos                       │      │
│  │ • Primera Bundesliga en 119 años            │      │
│  │ • 89 goles anotados                          │      │
│  │ [+ Añadir récord]                            │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│                                                         │
│  [Cancelar]  [Guardar Evento] 💾                       │
└─────────────────────────────────────────────────────────┘📁 Estructura de Archivossrc/
├─ components/
│  └─ ComHistory/
│     ├─ HistoricalEventsPage.jsx           ← Listado grid
│     ├─ EventDetailView.jsx                ← Vista individual
│     │
│     ├─ EventPlayerView.jsx                ← Layout para eventos de jugador
│     │  ├─ EventHeroBanner.jsx             ← Banner panorámico
│     │  ├─ EventContext.jsx                ← Sección "Contexto"
│     │  ├─ EventProtagonist.jsx            ← Card del protagonista
│     │  ├─ EventLineupDuel.jsx             ← Dos alineaciones enfrentadas
│     │  └─ EventImpact.jsx                 ← Sección "Impacto"
│     │
│     └─ EventTeamView.jsx                  ← Layout para eventos de equipo
│        ├─ EventHeroBanner.jsx             ← Reutilizado
│        ├─ EventContext.jsx                ← Reutilizado
│        ├─ EventSquadShowcase.jsx          ← Plantel con jugadores clave
│        ├─ EventStandingsOrKnockout.jsx    ← Tabla o eliminatorias
│        └─ EventImpact.jsx                 ← Reutilizado
│
├─ hooks/
│  ├─ HooksHistory/
│  │  └─ useHistoricalEvents.js             ← Fetch público
│  └─ HooksAdmin/
│     └─ useAdminHistorical.js              ← Extender con eventos
│
└─ styles/
   ├─ StylesHistory/
   │  ├─ HistoricalEventsPage.css           ← Base desktop
   │  └─ EventDetailView.css                ← Detalle desktop
   │
   └─ StylesMobile/
      ├─ HistoricalEventsPageMobile.css     ← Responsive
      └─ EventDetailViewMobile.css          ← Responsive


🎬 Experiencia de Usuario
Flujo narrativo:

Grid de eventos → Usuario ve banners cinemáticos
Click en evento → Banner panorámico inmersivo
Scroll → Contexto → Setup del momento histórico
Scroll → Protagonista/Equipo → Los personajes principales
Scroll → El Enfrentamiento/Campaña → Los números y hechos
Scroll → Impacto → El legado que dejó


✅ Checklist de Implementación
Backend:

 Migraciones SQL (tablas nuevas)
 Extender useAdminHistorical.js
 Crear EventPanel con 4 tabs
 Implementar upload de banner panorámico

Frontend Público:

 HistoricalEventsPage (grid)
 EventDetailView (router entre jugador/equipo)
 EventPlayerView (6 componentes)
 EventTeamView (5 componentes)
 CSS base + mobile

Pulido:

 Lazy loading de banners
 Animaciones de entrada
 Panel derecho (top eventos)

---
BASE DE DATOS
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
CREATE TABLE public.historical_competition_groups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  competition_id uuid NOT NULL,
  group_name character varying NOT NULL,
  team_name character varying NOT NULL,
  team_id uuid,
  position integer,
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_competition_groups_pkey PRIMARY KEY (id),
  CONSTRAINT historical_competition_groups_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id),
  CONSTRAINT historical_competition_groups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_competition_knockout (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  competition_id uuid NOT NULL,
  round character varying NOT NULL,
  match_number integer DEFAULT 1,
  team_a character varying NOT NULL,
  team_b character varying NOT NULL,
  team_a_id uuid,
  team_b_id uuid,
  score_a integer,
  score_b integer,
  agg_a integer,
  agg_b integer,
  penalties_a integer,
  penalties_b integer,
  winner character varying CHECK (winner::text = ANY (ARRAY['team_a'::character varying, 'team_b'::character varying, 'draw'::character varying]::text[])),
  notes character varying,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_competition_knockout_pkey PRIMARY KEY (id),
  CONSTRAINT historical_competition_knockout_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id),
  CONSTRAINT historical_competition_knockout_team_a_id_fkey FOREIGN KEY (team_a_id) REFERENCES public.historical_teams(id),
  CONSTRAINT historical_competition_knockout_team_b_id_fkey FOREIGN KEY (team_b_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_competition_standings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  competition_id uuid NOT NULL,
  position integer NOT NULL,
  team_name character varying NOT NULL,
  team_id uuid,
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  champion boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT historical_competition_standings_pkey PRIMARY KEY (id),
  CONSTRAINT historical_competition_standings_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.historical_competitions(id),
  CONSTRAINT historical_competition_standings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
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
  format character varying CHECK (format::text = ANY (ARRAY['groups_knockout'::character varying, 'league_only'::character varying, 'knockout_only'::character varying]::text[])),
  winner_text character varying,
  edition character varying,
  country character varying,
  num_teams integer,
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
CREATE TABLE public.historical_event_knockout (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  round character varying NOT NULL,
  match_number integer,
  team_a character varying NOT NULL,
  team_b character varying NOT NULL,
  score_a integer,
  score_b integer,
  winner character varying CHECK (winner::text = ANY (ARRAY['team_a'::character varying, 'team_b'::character varying]::text[])),
  is_decisive boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  CONSTRAINT historical_event_knockout_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_knockout_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id)
);
CREATE TABLE public.historical_event_lineups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  team_side character varying NOT NULL CHECK (team_side::text = ANY (ARRAY['team_a'::character varying, 'team_b'::character varying]::text[])),
  team_name character varying NOT NULL,
  team_id uuid,
  shirt_number integer CHECK (shirt_number >= 1 AND shirt_number <= 11),
  player_name character varying NOT NULL,
  position_role character varying,
  is_protagonist boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  CONSTRAINT historical_event_lineups_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_lineups_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id),
  CONSTRAINT historical_event_lineups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
);
CREATE TABLE public.historical_event_squad (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  player_name character varying NOT NULL,
  player_id uuid,
  shirt_number integer,
  position_role character varying,
  is_key_player boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  CONSTRAINT historical_event_squad_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_squad_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id),
  CONSTRAINT historical_event_squad_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.historical_players(id)
);
CREATE TABLE public.historical_event_standings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  position integer NOT NULL,
  team_name character varying NOT NULL,
  team_id uuid,
  points integer,
  wins integer,
  draws integer,
  losses integer,
  goals_for integer,
  goals_against integer,
  is_champion boolean DEFAULT false,
  CONSTRAINT historical_event_standings_pkey PRIMARY KEY (id),
  CONSTRAINT historical_event_standings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.historical_events(id),
  CONSTRAINT historical_event_standings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.historical_teams(id)
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
  event_category character varying CHECK (event_category::text = ANY (ARRAY['player'::character varying, 'team'::character varying]::text[])),
  banner_image_path text,
  context_text text,
  impact_text text,
  protagonist_id uuid,
  team_protagonist_id uuid,
  CONSTRAINT historical_events_pkey PRIMARY KEY (id),
  CONSTRAINT historical_events_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id),
  CONSTRAINT historical_events_protagonist_id_fkey FOREIGN KEY (protagonist_id) REFERENCES public.historical_players(id),
  CONSTRAINT historical_events_team_protagonist_id_fkey FOREIGN KEY (team_protagonist_id) REFERENCES public.historical_teams(id)
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