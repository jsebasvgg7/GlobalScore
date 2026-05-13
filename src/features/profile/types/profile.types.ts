// ─────────────────────────────────────────────
// PROFILE TYPES
// dominio: perfil de usuario, logros, rachas, ranking, campeonatos
// tablas: users · available_achievements · available_titles
//         predictions · monthly_championship_history
// ─────────────────────────────────────────────



// ============================================================
// USER PROFILE
// ============================================================

export interface UserProfile {
    id: string;
    auth_id: string;

    name: string;
    email: string;

    bio: string | null;
    favorite_team: string | null;
    favorite_player: string | null;
    gender: string | null;
    nationality: string | null;

    avatar_url: string | null;
    equipped_banner_url: string | null;

    level: number;

    // ─── GLOBAL STATS ─────────────────────────────
    points: number;
    predictions: number;
    correct: number;
    current_streak: number;
    best_streak: number;

    // ─── MONTHLY STATS ───────────────────────────
    monthly_points: number;
    monthly_predictions: number;
    monthly_correct: number;
    monthly_championships: number;

    // ─── WEEKLY STATS ────────────────────────────
    weekly_points: number;
    weekly_predictions: number;
    weekly_correct: number;

    role: 'user' | 'admin';

    created_at: string;
    updated_at: string;
}

export interface UpdateUserProfileInput {
    name?: string;
    bio?: string;
    favorite_team?: string;
    favorite_player?: string;
    gender?: string;
    nationality?: string;
    equipped_banner_url?: string | null;
}

/** Form state puro del perfil (UI layer) */
export interface ProfileFormData {
    name: string;
    email: string;
    bio: string;
    favorite_team: string;
    favorite_player: string;
    gender: string;
    nationality: string;
    avatar_url: string | null;
    level: number;
    joined_date: string;
    equipped_banner_url: string | null;
}



// ============================================================
// ACHIEVEMENTS
// ============================================================

export type RequirementType =
    | 'points'
    | 'predictions'
    | 'correct'
    | 'streak';

export interface AvailableAchievement {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;

    requirement_type: RequirementType;
    requirement_value: number;

    created_at: string;
}



// ============================================================
// TITLES
// ============================================================

export interface AvailableTitle {
    id: string;
    name: string;
    description: string | null;

    requirement_achievement_id: string;

    created_at: string;
}



// ============================================================
// STREAKS
// ============================================================

export interface StreakData {
    current_streak: number;
    best_streak: number;
    last_prediction_date: string | null;
}



// ============================================================
// MONTHLY CHAMPIONSHIPS
// ============================================================

export interface MonthlyChampionshipRecord {
    id: string;
    user_id: string;

    month_label: string;
    awarded_by: string | null;

    winner_name: string | null;
    winner_points: number | null;
    winner_correct: number | null;

    awarded_at: string;
}

export interface MonthlyStats {
    monthly_points: number;
    monthly_predictions: number;
    monthly_correct: number;
    monthly_championships: number;
}



// ============================================================
// RANKING
// ============================================================

export interface UserRanking {
    position: number;
    totalUsers: number;

    pointsToNext: number;
    pointsToLeader: number;
    pointsFromPrev: number;
}



// ============================================================
// PREDICTION HISTORY
// ============================================================

export interface PredictionHistoryEntry {
    id: string;
    match_id: string;
    user_id: string;

    home_score: number;
    away_score: number;

    points_earned: number;
    advancing_points: number;

    predicted_advancing_team: 'home' | 'away' | null;
    result_type: 'exact' | 'correct' | 'wrong' | null;

    created_at: string;

    // ─── EMBEDDED MATCH ──────────────────────────
    match: {
        id: string;
        league: string;

        home_team: string;
        away_team: string;

        home_team_logo: string;
        away_team_logo: string;

        result_home: number | null;
        result_away: number | null;

        status: 'pending' | 'finished' | 'live';

        date: string;
        time: string;
    } | null;
}



// ============================================================
// HOOK RETURN TYPES
// ============================================================

export interface UseProfileDataReturn {
    userData: ProfileFormData;
    setUserData: (data: ProfileFormData) => void;

    loading: boolean;

    loadUserData: () => Promise<void>;
    saveUserData: (toast: any, onBack: () => void) => Promise<void>;
}

export interface UseAchievementsReturn {
    userAchievements: AvailableAchievement[];
    userTitles: AvailableTitle[];

    availableAchievements: AvailableAchievement[];
    availableTitles: AvailableTitle[];

    achievementsLoading: boolean;

    getActiveTitle: () => AvailableTitle | null;

    handleSaveAchievement: (
        data: Partial<AvailableAchievement>,
        toast: any
    ) => Promise<void>;

    handleDeleteAchievement: (id: string, toast: any) => Promise<void>;

    handleSaveTitle: (
        data: Partial<AvailableTitle>,
        toast: any
    ) => Promise<void>;

    handleDeleteTitle: (id: string, toast: any) => Promise<void>;
}

export interface UseStreaksReturn {
    streakData: StreakData;
    calculateStreaks: () => Promise<void>;
}

export interface UseMonthlyChampionshipsReturn {
    crownHistory: MonthlyChampionshipRecord[];
    monthlyStats: MonthlyStats;
    championshipsLoading: boolean;
    loadMonthlyData: () => Promise<void>;
}

export interface UsePredictionHistoryReturn {
    predictionHistory: PredictionHistoryEntry[];
    historyLoading: boolean;
    loadPredictionHistory: (toast?: any) => Promise<void>;
}

export interface UseUserRankingReturn {
    userRanking: UserRanking;
}