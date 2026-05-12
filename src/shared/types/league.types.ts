// =============================================================================
// league.types.ts
// Dominio: ligas y predicciones
// Tablas: leagues · league_predictions
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Primitivos compartidos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Icono de liga.
 * Representación visual (fallback + imagen real).
 */
export interface LeagueLogo {
    logo: string;
    logo_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────────────────────────────

/** Estado de la liga */
export type LeagueStatus = 'active' | 'finished';

// ─────────────────────────────────────────────────────────────────────────────
// Dominio: League
// ─────────────────────────────────────────────────────────────────────────────

export interface League {
    id: string;
    name: string;
    season: string;

    icon: LeagueLogo;

    status: LeagueStatus;

    champion: string | null;
    top_scorer: string | null;
    top_scorer_goals: number | null;
    top_assist: string | null;
    top_assist_count: number | null;
    mvp_player: string | null;

    /** Cierre de predicciones (ISO 8601) */
    deadline: string | null;

    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Capa DB (Supabase raw)
// ─────────────────────────────────────────────────────────────────────────────

export interface LeagueRow {
    id: string;
    name: string;
    season: string;

    logo: string;
    logo_url: string | null;

    status: LeagueStatus;

    champion: string | null;

    top_scorer: string | null;
    top_scorer_goals: number | null;

    top_assist: string | null;
    top_assist_count: number | null;

    mvp_player: string | null;

    deadline: string | null;

    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper DB → Dominio
// ─────────────────────────────────────────────────────────────────────────────

export function leagueRowToLeague(row: LeagueRow): League {
    return {
        id: row.id,
        name: row.name,
        season: row.season,

        icon: {
            logo: row.logo,
            logo_url: row.logo_url,
        },

        status: row.status,

        champion: row.champion,

        top_scorer: row.top_scorer,
        top_scorer_goals: row.top_scorer_goals,

        top_assist: row.top_assist,
        top_assist_count: row.top_assist_count,

        mvp_player: row.mvp_player,

        deadline: row.deadline,

        created_at: row.created_at,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inputs (admin)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateLeagueInput {
    id: string;
    name: string;
    season: string;

    logo: string;
    logo_url?: string | null;

    deadline?: string | null;
    status?: LeagueStatus;
}

export interface FinishLeagueInput {
    champion: string;
    top_scorer: string;
    top_scorer_goals: number;
    top_assist: string;
    top_assist_count: number;
    mvp_player: string;
}

export type UpdateLeagueInput =
    Partial<CreateLeagueInput>;

// ─────────────────────────────────────────────────────────────────────────────
// Predicciones
// ─────────────────────────────────────────────────────────────────────────────

export interface LeaguePrediction {
    id: string;
    league_id: string;
    user_id: string;

    predicted_champion: string;
    predicted_top_scorer: string;
    predicted_top_assist: string;
    predicted_mvp: string;

    points_earned: number;

    created_at: string;
    updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vistas compuestas
// ─────────────────────────────────────────────────────────────────────────────

export interface LeagueWithUserPrediction extends League {
    user_prediction: LeaguePrediction | null;
}