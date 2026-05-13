// ─────────────────────────────────────────────────────────────
// HISTORY TYPES
// dominio: contenido histórico público (solo lectura)
// tablas: historical_teams · historical_competitions
//         historical_events · lineups · squad · standings · knockout
//
// NOTA:
// HistoricalPlayer está en shared/types/player.types.ts
// aquí solo tipos exclusivos del módulo history
// ─────────────────────────────────────────────────────────────



// ============================================================
// TEAMS
// ============================================================

export interface HistoricalTeamRow {
    id: string;
    name: string;
    country: string | null;

    era_dominance: string | null;
    legacy_type: string | null;

    formation: string | null;
    manager: string | null;

    description: string | null;
    curiosity: string | null;

    primary_color: string | null;
    secondary_color: string | null;

    image_path: string | null;

    is_published: boolean;

    admin_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface TeamLineupRow {
    id: string;
    team_id: string;
    player_id: string | null;

    player_name: string;
    position: string | null;
    shirt_number: number | null;

    is_captain: boolean;
    is_key_player: boolean;

    sort_order: number;

    // Supabase relation (opcional)
    historical_players?: {
        id: string;
        name: string;
        image_path: string | null;
    } | null;
}

export interface TeamTitleRow {
    id: string;
    team_id: string;

    title_name: string;
    year: string | null;
    competition_id: string | null;

    sort_order: number;
    created_at: string;
}

export interface TeamDetailResult {
    team: HistoricalTeamRow;
    lineup: TeamLineupRow[];
    titles: TeamTitleRow[];
}



// ============================================================
// COMPETITIONS
// ============================================================

export type CompetitionType =
    | 'mundial'
    | 'eurocopa'
    | 'copa_america'
    | 'liga'
    | (string & {});

export type CompetitionFormat =
    | 'grupos_y_eliminatoria'
    | 'liga'
    | 'eliminatoria'
    | (string & {});

export interface HistoricalCompetitionRow {
    id: string;
    name: string;
    year: number;

    country: string | null;
    description: string | null;

    type: CompetitionType;
    format: CompetitionFormat;

    is_published: boolean;

    image_path: string | null;
    champion_id: string | null;

    admin_id: string | null;
    created_at: string;
    updated_at: string;

    // Supabase relation
    historical_teams?: {
        id: string;
        name: string;
        image_path: string | null;
        country?: string;
    } | null;
}

export interface CompetitionGroupRow {
    id: string;
    competition_id: string;
    group_name: string;

    team_name: string;
    team_id: string | null;

    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;

    sort_order: number;
}

export interface CompetitionStandingRow {
    id: string;
    competition_id: string;

    position: number;
    team_name: string;
    team_id: string | null;

    points: number | null;
    wins: number | null;
    draws: number | null;
    losses: number | null;

    goals_for: number | null;
    goals_against: number | null;

    is_champion: boolean;
}

export interface CompetitionKnockoutRow {
    id: string;
    competition_id: string;

    round: string;
    match_number: number;

    team_a: string;
    team_b: string;

    score_a: number | null;
    score_b: number | null;

    winner: string | null;
    is_decisive: boolean;

    sort_order: number;
}

export interface CompetitionDetailResult {
    competition: HistoricalCompetitionRow;
    groups: CompetitionGroupRow[];
    standings: CompetitionStandingRow[];
    knockout: CompetitionKnockoutRow[];
}

export type GroupedGroups = Record<string, CompetitionGroupRow[]>;



// ============================================================
// EVENTS
// ============================================================

export type EventCategory =
    | 'match'
    | 'team'
    | 'player'
    | (string & {});

export type EventType =
    | 'final'
    | 'semifinal'
    | 'gesta'
    | 'debut'
    | 'record'
    | (string & {});

export type TeamSide = 'team_a' | 'team_b';

export interface HistoricalEventRow {
    id: string;
    title: string;

    event_type: EventType | null;
    event_category: EventCategory | null;
    event_date: string | null;

    description: string | null;
    context_text: string | null;
    impact_text: string | null;

    image_path: string | null;
    banner_image_path: string | null;

    protagonist_id: string | null;
    team_protagonist_id: string | null;

    score_a: number | null;
    score_b: number | null;
    team_a_name: string | null;
    team_b_name: string | null;

    is_published: boolean;

    admin_id: string | null;
    created_at: string;
    updated_at: string;

    historical_players?: {
        id: string;
        name: string;
        image_path: string | null;
        country: string | null;
        position: string | null;
    } | null;

    historical_teams?: {
        id: string;
        name: string;
        image_path: string | null;
        primary_color: string | null;
        secondary_color?: string | null;
        country?: string | null;
    } | null;
}

export interface EventLineupRow {
    id: string;
    event_id: string;
    team_side: TeamSide;

    team_name: string;
    team_id: string | null;

    player_name: string;
    shirt_number: number | null;
    position_role: string | null;

    is_protagonist: boolean;
    sort_order: number;
}

export interface EventSquadRow {
    id: string;
    event_id: string;

    player_name: string;
    player_id: string | null;

    shirt_number: number | null;
    position_role: string | null;

    is_key_player: boolean;
    sort_order: number;
}

export interface EventStandingRow {
    id: string;
    event_id: string;

    position: number;
    team_name: string;
    team_id: string | null;

    points: number | null;
    wins: number | null;
    draws: number | null;
    losses: number | null;

    goals_for: number | null;
    goals_against: number | null;

    is_champion: boolean;
}

export interface EventKnockoutRow {
    id: string;
    event_id: string;

    round: string;
    match_number: number;

    team_a: string;
    team_b: string;

    score_a: number | null;
    score_b: number | null;

    winner: string | null;
    is_decisive: boolean;

    sort_order: number;
}

export interface EventLineups {
    team_a: EventLineupRow[];
    team_b: EventLineupRow[];
}

export interface EventDetailResult {
    event: HistoricalEventRow;
    lineups: EventLineups;
    squad: EventSquadRow[];
    standings: EventStandingRow[];
    knockout: EventKnockoutRow[];
}



// ============================================================
// HOOK RETURNS
// ============================================================

export interface UseHistoricalPlayersReturn {
    players: import('@/shared/types/player.types').HistoricalPlayerRow[];
    allPlayers: import('@/shared/types/player.types').HistoricalPlayerRow[];

    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;

    search: string;
    setSearch: (v: string) => void;

    filterPosition: string;
    setFilterPosition: (v: string) => void;

    filterBallonDor: string;
    setFilterBallonDor: (v: string) => void;

    filterLegacy: string;
    setFilterLegacy: (v: string) => void;

    positions: string[];
    legacies: string[];
}

export interface UseHistoricalTeamsReturn {
    teams: HistoricalTeamRow[];
    allTeams: HistoricalTeamRow[];

    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;

    search: string;
    setSearch: (v: string) => void;
}

export interface UseHistoricalCompetitionsReturn {
    competitions: HistoricalCompetitionRow[];
    allCompetitions: HistoricalCompetitionRow[];

    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;

    search: string;
    setSearch: (v: string) => void;

    filterType: string;
    setFilterType: (v: string) => void;

    filterFormat: string;
    setFilterFormat: (v: string) => void;

    types: string[];
    formats: string[];
}

export interface UseHistoricalEventsReturn {
    events: HistoricalEventRow[];
    allEvents: HistoricalEventRow[];

    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;

    search: string;
    setSearch: (v: string) => void;

    filterCategory: string;
    setFilterCategory: (v: string) => void;

    filterType: string;
    setFilterType: (v: string) => void;

    types: string[];
}