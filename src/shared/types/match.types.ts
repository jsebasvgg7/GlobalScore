// ─────────────────────────────────────────────
// MATCH TYPES
// dominio: partidos + predicciones
// tablas: matches · predictions
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// TEAM MODEL (UI helper)
// ─────────────────────────────────────────────

/**
 * Equipo dentro de un partido.
 * Datos listos para render en UI (nombre + logo + fallback).
 */
export interface MatchTeam {
    name: string;
    logo: string; // icono/slug fallback
    logo_url: string | null; // imagen oficial (si existe)
}


// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type MatchStatus = 'pending' | 'finished' | 'live';

export type AdvancingTeam = 'home' | 'away';

/**
 * Resultado de predicción:
 * exact   → marcador perfecto (5 pts)
 * correct → acierto parcial (3 pts)
 * wrong   → fallo (0 pts)
 */
export type PredictionResultType = 'exact' | 'correct' | 'wrong';


// ─────────────────────────────────────────────
// MATCH (DOMINIO)
// ─────────────────────────────────────────────

export interface Match {
    id: string;

    league: string;
    league_logo_url: string | null;

    home_team: MatchTeam;
    away_team: MatchTeam;

    kickoff: string; // ISO datetime (inicio del partido)

    status: MatchStatus;

    result_home: number | null;
    result_away: number | null;

    deadline: string | null; // límite de predicciones

    is_knockout: boolean;
    advancing_team: AdvancingTeam | null;

    created_at: string;
}


// ─────────────────────────────────────────────
// RAW DATA (SUPABASE)
// ─────────────────────────────────────────────

export interface MatchRow {
    id: string;

    league: string;
    league_logo_url: string | null;

    home_team: string;
    home_team_logo: string;
    home_team_logo_url: string | null;

    away_team: string;
    away_team_logo: string;
    away_team_logo_url: string | null;

    date: string; // YYYY-MM-DD
    time: string; // HH:MM

    status: MatchStatus;

    result_home: number | null;
    result_away: number | null;

    deadline: string | null;

    is_knockout: boolean;
    advancing_team: AdvancingTeam | null;

    created_at: string;
}


// ─────────────────────────────────────────────
// MAPPER (DB → DOMAIN)
// ─────────────────────────────────────────────

export function matchRowToMatch(row: MatchRow): Match {
    return {
        id: row.id,

        league: row.league,
        league_logo_url: row.league_logo_url,

        home_team: {
            name: row.home_team,
            logo: row.home_team_logo,
            logo_url: row.home_team_logo_url,
        },

        away_team: {
            name: row.away_team,
            logo: row.away_team_logo,
            logo_url: row.away_team_logo_url,
        },

        kickoff: `${row.date}T${row.time}`,

        status: row.status,

        result_home: row.result_home,
        result_away: row.result_away,

        deadline: row.deadline,

        is_knockout: row.is_knockout,
        advancing_team: row.advancing_team,

        created_at: row.created_at,
    };
}


// ─────────────────────────────────────────────
// WRITE MODELS (ADMIN)
// ─────────────────────────────────────────────

export interface CreateMatchInput {
    league: string;
    league_logo_url?: string | null;

    home_team: string;
    home_team_logo: string;
    home_team_logo_url?: string | null;

    away_team: string;
    away_team_logo: string;
    away_team_logo_url?: string | null;

    date: string; // YYYY-MM-DD
    time: string; // HH:MM

    deadline?: string | null;
    is_knockout?: boolean;
}

export interface FinishMatchInput {
    result_home: number;
    result_away: number;
    advancing_team?: AdvancingTeam | null;
}

export type UpdateMatchInput =
    Partial<CreateMatchInput & FinishMatchInput>;


// ─────────────────────────────────────────────
// PREDICTIONS
// ─────────────────────────────────────────────

export interface Prediction {
    id: string;

    match_id: string;
    user_id: string;

    home_score: number;
    away_score: number;

    result_type: PredictionResultType | null;
    points_earned: number;

    predicted_advancing_team: AdvancingTeam | null;
    advancing_points: number;

    created_at: string;
}

export type CreatePredictionInput = Pick<
    Prediction,
    'match_id' | 'home_score' | 'away_score' | 'predicted_advancing_team'
>;


// ─────────────────────────────────────────────
// JOIN MODELS (UI)
// ─────────────────────────────────────────────

export interface MatchWithUserPrediction extends Match {
    user_prediction: Prediction | null;
}

export interface PredictionWithMatch extends Prediction {
    match: Match;
}