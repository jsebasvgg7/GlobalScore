// =============================================================================
// award.types.ts
// Dominio: premios individuales y predicciones
// Tablas: awards · award_predictions
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Primitivos compartidos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Icono de un premio.
 * Representación visual reutilizable en UI.
 */
export interface AwardIcon {
    logo: string;
    logo_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────────────────────────────

/** Estado del premio */
export type AwardStatus = 'active' | 'finished';

/**
 * Categoría del premio.
 * Define lógica de puntuación y representación visual.
 */
export type AwardCategory =
    | 'balon_de_oro'
    | 'bota_de_oro'
    | 'the_best_fifa'
    | (string & {});

// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Award
// ─────────────────────────────────────────────────────────────────────────────

export interface Award {
    id: string;
    name: string;
    season: string;

    icon: AwardIcon;

    category: AwardCategory;

    /** Cierre de predicciones (ISO 8601) */
    deadline: string;

    status: AwardStatus;

    /** Ganador final (null si aún está activo) */
    winner: string | null;

    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Capa de base de datos (Supabase raw)
// ─────────────────────────────────────────────────────────────────────────────

export interface AwardRow {
    id: string;
    name: string;
    season: string;

    logo: string;
    logo_url: string | null;

    category: AwardCategory;

    deadline: string;
    status: AwardStatus;

    winner: string | null;

    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper DB → Dominio
// ─────────────────────────────────────────────────────────────────────────────

export function awardRowToAward(row: AwardRow): Award {
    return {
        id: row.id,
        name: row.name,
        season: row.season,

        icon: {
            logo: row.logo,
            logo_url: row.logo_url,
        },

        category: row.category,
        deadline: row.deadline,
        status: row.status,
        winner: row.winner,

        created_at: row.created_at,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inputs (admin)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateAwardInput {
    id: string;
    name: string;
    season: string;

    logo: string;
    logo_url?: string | null;

    category: AwardCategory;

    deadline: string;
    status?: AwardStatus;
}

export interface FinishAwardInput {
    winner: string;
}

export type UpdateAwardInput =
    Partial<CreateAwardInput>;

// ─────────────────────────────────────────────────────────────────────────────
// Predicciones
// ─────────────────────────────────────────────────────────────────────────────

export interface AwardPrediction {
    id: string;
    award_id: string;
    user_id: string;

    predicted_winner: string;

    /** 10 si acierta, 0 si falla */
    points_earned: number;

    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vistas compuestas
// ─────────────────────────────────────────────────────────────────────────────

export interface AwardWithUserPrediction extends Award {
    user_prediction: AwardPrediction | null;
}