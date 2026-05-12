// ============================================================
//  ADMIN TYPES
//  src/features/admin/types/admin.types.ts
// ============================================================

// ─── Entidades base ──────────────────────────────────────────

export interface AdminUser {
    id: string;
    name: string;
    points: number;
    avatar_url?: string | null;
    monthly_points?: number;
    monthly_predictions?: number;
    monthly_correct?: number;
    monthly_championships?: number;
    predictions?: number;
    correct?: number;
    current_streak?: number;
    best_streak?: number;
    equipped_banner_url?: string | null;
}

export interface Match {
    id: string;
    home_team: string;
    away_team: string;
    result_home?: number | null;
    result_away?: number | null;
    status: 'pending' | 'finished';
    is_knockout?: boolean;
    advancing_team?: string | null;
    created_at?: string;
    predictions?: Prediction[];
}

export interface Prediction {
    id: string;
    user_id: string;
    match_id?: string;
    home_score: number;
    away_score: number;
    points_earned?: number;
    advancing_points?: number;
    predicted_advancing_team?: string | null;
}

export interface League {
    id: string;
    name: string;
    status: 'active' | 'finished';
    league_predictions?: LeaguePrediction[];
    [key: string]: unknown;
}

export interface LeaguePrediction {
    id: string;
    league_id: string;
    user_id: string;
    [key: string]: unknown;
}

export interface Award {
    id: string;
    name: string;
    status: 'active' | 'finished';
    winner?: string | null;
    award_predictions?: AwardPrediction[];
}

export interface AwardPrediction {
    id: string;
    award_id: string;
    user_id: string;
    [key: string]: unknown;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'Inicio' | 'Progreso' | 'Precisión' | 'Racha';
    requirement_type: 'points' | 'predictions' | 'correct' | 'streak';
    requirement_value: number;
}

export interface Title {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface Banner {
    id: string;
    name: string;
    description?: string;
    image_url: string;
    created_at?: string;
}

export interface CrownHistoryItem {
    id: string;
    month_year: string;
    points: number;
    awarded_at: string;
    users: { name: string };
}

// ─── Tipos para Historical ───────────────────────────────────

export interface HistoricalPlayer {
    id: string;
    name: string;
    is_published?: boolean;
    [key: string]: unknown;
}

export interface HistoricalTeam {
    id: string;
    name: string;
    is_published?: boolean;
    [key: string]: unknown;
}

export interface HistoricalCompetition {
    id: string;
    name: string;
    is_published?: boolean;
    [key: string]: unknown;
}

export interface HistoricalEvent {
    id: string;
    title: string;
    event_type?: string;
    event_date?: string | null;
    description?: string;
    is_published?: boolean;
    image_path?: string | null;
    banner_image_path?: string | null;
    event_category?: string;
    context_text?: string;
    impact_text?: string;
    protagonist_id?: string | null;
    team_protagonist_id?: string | null;
    score_a?: number | null;
    score_b?: number | null;
    team_a_name?: string;
    team_b_name?: string;
    admin_id?: string | null;
}

export interface EventLineupRow {
    event_id?: string;
    team_side: 'team_a' | 'team_b';
    team_name: string;
    team_id?: string | null;
    shirt_number?: number | null;
    player_name: string;
    position_role?: string | null;
    is_protagonist?: boolean;
    sort_order?: number;
}

export interface EventSquadRow {
    event_id?: string;
    player_name: string;
    player_id?: string | null;
    shirt_number?: number | null;
    position_role?: string | null;
    is_key_player?: boolean;
    sort_order?: number;
}

export interface EventStandingRow {
    event_id?: string;
    position: number;
    team_name: string;
    team_id?: string | null;
    points?: number | null;
    wins?: number | null;
    draws?: number | null;
    losses?: number | null;
    goals_for?: number | null;
    goals_against?: number | null;
    is_champion?: boolean;
}

export interface EventKnockoutRow {
    event_id?: string;
    round: string;
    match_number: number;
    team_a: string;
    team_b: string;
    score_a?: number | null;
    score_b?: number | null;
    winner?: string | null;
    is_decisive?: boolean;
    sort_order?: number;
}

// ─── Estado global del Admin ─────────────────────────────────

export interface AdminDataState {
    matches: Match[];
    leagues: League[];
    awards: Award[];
    achievements: Achievement[];
    titles: Title[];
    users: AdminUser[];
    crownHistory: CrownHistoryItem[];
    banners: Banner[];
    loading: boolean;
    loadData: () => Promise<void>;
}

// ─── Resultados de operaciones ───────────────────────────────

export interface OperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface FinishMatchResult {
    predictions_processed: number;
    exact: number;
    correct: number;
    advancing: number;
}

export interface AwardCrownResult {
    winner_name: string;
    [key: string]: unknown;
}

export interface ResetMonthlyStatsResult {
    users_reset: number;
    success: boolean;
    error?: string;
}

// ─── Props de los hooks ──────────────────────────────────────

export interface ToastService {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
}

// ─── Props de componentes ────────────────────────────────────

export interface AdminAchievementsListProps {
    achievements: Achievement[];
    onEdit: (achievement: Achievement) => void;
    onDelete: (id: string) => void;
}

export interface AdminAchievementsModalProps {
    onClose: () => void;
    onSave: (achievement: Achievement) => void;
    onDelete: (id: string) => void;
    existingAchievement?: Achievement | null;
}

export interface AdminBannerModalProps {
    onClose: () => void;
    onSave: (data: Omit<Banner, 'id' | 'created_at'>, imageFile?: File | null) => void;
}

export interface AdminCrownModalProps {
    currentTopUser: AdminUser | null;
    currentUserId: string;
    onClose: () => void;
    onAward: (winnerId: string, monthLabel: string, adminId: string) => Promise<void>;
}

export interface AdminCrownsSectionProps {
    top10: AdminUser[];
    history: CrownHistoryItem[];
    onResetStats?: () => void;
}

export interface AdminAssignBannerModalProps {
    onClose: () => void;
    banners: Banner[];
    users: AdminUser[];
    onAssign: (userId: string, bannerId: string) => Promise<void>;
    onRevoke: (userId: string, bannerId: string, imageUrl: string) => Promise<void>;
}

// ============================================================
//  SHARED SERVICES TYPES
// ============================================================

// ─── Cloudinary ──────────────────────────────────────────────

/** Carpetas válidas dentro del bucket globalscore en Cloudinary */
export type CloudinaryFolder =
    | 'historical'
    | 'players'
    | 'teams'
    | 'competitions'
    | 'events'
    | 'banners';

// ─── Offline Sync ────────────────────────────────────────────

export interface OfflinePrediction {
    id?: number;              // autoincrement de IndexedDB
    match_id: string;
    user_id: string;
    home_score: number;
    away_score: number;
    predicted_advancing_team?: string | null;
    timestamp?: number;
    synced?: boolean;
    syncedAt?: number;
    offline?: boolean;
}

export interface SyncResult {
    success: boolean;
    synced?: number;
    total?: number;
    errors?: Array<{ predictionId: number; error: string }> | null;
    reason?: string;
    error?: string;
}

export interface OfflineStats {
    isOnline: boolean;
    pendingPredictions: number;
    dbInitialized: boolean;
}

export interface CacheEntry<T = unknown> {
    key: string;
    data: T;
    timestamp: number;
    expiresAt: number;
}

// ─── Push Notifications ──────────────────────────────────────

export type PushPermission = 'granted' | 'denied' | 'default' | 'not_supported';

export interface PushPermissionResult {
    success: boolean;
    permission: PushPermission;
    message?: string;
    error?: string;
}

export interface PushSubscribeResult {
    success: boolean;
    subscription?: PushSubscription;
    message?: string;
    reason?: string;
    error?: string;
}

export interface PushSubscriptionStatus {
    isSubscribed: boolean;
    browserSubscription: boolean;
    serverSubscription: boolean;
    permission?: PushPermission;
    subscription?: PushSubscription | null;
    error?: string;
}

// ─── PWA ─────────────────────────────────────────────────────

export interface PWAStatus {
    supported: boolean;
    registered: boolean;
    updateAvailable: boolean;
    controller: boolean;
    scope: string | null;
}

export interface PWARegisterResult {
    success: boolean;
    registration?: ServiceWorkerRegistration;
    reason?: string;
    error?: string;
}