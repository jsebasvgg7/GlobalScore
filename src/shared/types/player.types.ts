// ─────────────────────────────────────────────
// PLAYER TYPES
// dominio: jugadores históricos + relaciones
// tablas: historical_players · career · national · teams · titles · events
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────

/**
 * Imagen principal del jugador.
 * Mantiene consistencia con otros módulos (MatchTeam, etc).
 */
export interface PlayerImage {
    path: string | null;
}


// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type PlayerTitleCategory = 'club' | 'national' | 'individual';

export type TeamSide = 'team_a' | 'team_b';

/**
 * Nivel de impacto histórico del jugador.
 * 1 = mínimo · 5 = leyenda absoluta
 */
export type SignificanceLevel = 1 | 2 | 3 | 4 | 5;


// ─────────────────────────────────────────────
// PLAYER (DOMINIO PRINCIPAL)
// ─────────────────────────────────────────────

export interface HistoricalPlayer {
    id: string;
    name: string;
    country: string | null;

    position: string | null;

    birth_year: number | null;
    death_year: number | null;

    description: string | null;
    impact_summary: string | null;

    legacy_type: string | null;

    significance_level: SignificanceLevel | null;

    image: PlayerImage;

    is_published: boolean;

    ballon_dor_count: number;

    created_at: string;
    updated_at: string;

    admin_id: string | null;
}


// ─────────────────────────────────────────────
// RAW DB (SUPABASE)
// ─────────────────────────────────────────────

export interface HistoricalPlayerRow {
    id: string;
    name: string;
    country: string | null;

    position: string | null;

    birth_year: number | null;
    death_year: number | null;

    description: string | null;
    impact_summary: string | null;

    legacy_type: string | null;

    significance_level: number | null;

    image_path: string | null;

    is_published: boolean;

    ballon_dor_count: number;

    created_at: string;
    updated_at: string;

    admin_id: string | null;
}


// ─────────────────────────────────────────────
// MAPPER (DB → DOMAIN)
// ─────────────────────────────────────────────

export function playerRowToHistoricalPlayer(
    row: HistoricalPlayerRow
): HistoricalPlayer {
    return {
        id: row.id,
        name: row.name,
        country: row.country,

        position: row.position,

        birth_year: row.birth_year,
        death_year: row.death_year,

        description: row.description,
        impact_summary: row.impact_summary,

        legacy_type: row.legacy_type,

        significance_level: row.significance_level as SignificanceLevel | null,

        image: {
            path: row.image_path,
        },

        is_published: row.is_published,

        ballon_dor_count: row.ballon_dor_count,

        created_at: row.created_at,
        updated_at: row.updated_at,

        admin_id: row.admin_id,
    };
}


// ─────────────────────────────────────────────
// WRITE MODELS (ADMIN)
// ─────────────────────────────────────────────

export type CreateHistoricalPlayerInput = Omit<
    HistoricalPlayerRow,
    'id' | 'created_at' | 'updated_at' | 'is_published'
> & {
    is_published?: boolean;
};

export type UpdateHistoricalPlayerInput =
    Partial<CreateHistoricalPlayerInput>;


// ─────────────────────────────────────────────
// CAREER (CLUBS)
// ─────────────────────────────────────────────

export interface PlayerCareerEntry {
    id: string;
    player_id: string;

    team_id: string | null;
    team_name: string;
    team_country: string | null;

    start_year: number | null;
    end_year: number | null;

    appearances: number;
    goals: number;
    assists: number;

    role_note: string | null;

    sort_order: number;

    created_at: string;
}


// ─────────────────────────────────────────────
// NATIONAL TEAM
// ─────────────────────────────────────────────

export interface PlayerNationalEntry {
    id: string;
    player_id: string;

    country: string;

    start_year: number | null;
    end_year: number | null;

    caps: number;
    goals: number;
    assists: number;

    role_note: string | null;

    created_at: string;
}


// ─────────────────────────────────────────────
// TEAM RELATIONS
// ─────────────────────────────────────────────

export interface PlayerTeamRelation {
    id: string;
    player_id: string;
    team_id: string;

    start_year: number | null;
    end_year: number | null;

    roles: string | null;

    created_at: string;
}


// ─────────────────────────────────────────────
// TITLES
// ─────────────────────────────────────────────

export interface PlayerTitle {
    id: string;
    player_id: string;

    title_category: PlayerTitleCategory;
    title_name: string;

    year: string | null;
    team_name: string | null;

    quantity: number;

    competition_id: string | null;

    sort_order: number;

    created_at: string;
}


// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────

export interface PlayerEventRelation {
    id: string;
    player_id: string;
    event_id: string;

    role_note: string | null;

    created_at: string;
}


// ─────────────────────────────────────────────
// FULL VIEW (UI COMPOSED)
// ─────────────────────────────────────────────

export interface HistoricalPlayerFull extends HistoricalPlayer {
    career: PlayerCareerEntry[];
    national: PlayerNationalEntry[];
    titles: PlayerTitle[];
    events: PlayerEventRelation[];
}