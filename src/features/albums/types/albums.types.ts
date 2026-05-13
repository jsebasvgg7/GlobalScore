export type CardType = 'player' | 'team' | 'competition' | 'event';
export type FrameLevel = 'normal' | 'silver' | 'gold' | 'legendary';
export type AlbumType = 'legendary' | 'stars' | 'cult';
export type SignificanceLevel = 1 | 2 | 3 | 4 | 5;

export interface AlbumCard {
    id: string;
    card_type: CardType;
    reference_id: string;
    name: string;
    image_path: string | null;
    significance_level: SignificanceLevel | null;
    is_active: boolean;
    created_at: string;
}

export interface AlbumPacks {
    id: string;
    user_id: string;
    packs_available: number;
    bar_progress: number;
    bar_threshold: number;
    total_packs_earned: number;
    total_packs_opened: number;
    created_at: string;
    updated_at: string;
}

export interface AlbumCollectionItem {
    id: string;
    user_id: string;
    card_id: string;
    copies: number;
    frame_level: FrameLevel;
    first_obtained_at: string;
    last_obtained_at: string;
    card?: AlbumCard;
}

export interface AlbumDefinition {
    id: string;
    name: string;
    description: string | null;
    album_type: AlbumType;
    sort_order: number;
    required_unique_players: number | null;
    required_min_stars_4: number;
    required_min_stars_5: number;
    required_card_type: CardType | null;
    star_filter: SignificanceLevel | null;
    unlocks_album_id: string | null;
    reward_banner_id: string | null;
    reward_title: string | null;
    reward_description: string | null;
    is_active: boolean;
}

export interface AlbumProgress {
    id: string;
    user_id: string;
    album_id: string;
    unique_cards: number;
    is_completed: boolean;
    completed_at: string | null;
    reward_claimed: boolean;
    updated_at: string;
}

export interface AlbumPackHistory {
    id: string;
    user_id: string;
    opened_at: string;
    card_player_id: string | null;
    card_team_id: string | null;
    card_competition_id: string | null;
    card_event_id: string | null;
    player_significance: SignificanceLevel | null;
    player_card?: AlbumCard;
    team_card?: AlbumCard;
    competition_card?: AlbumCard;
    event_card?: AlbumCard;
}

export interface PackOpenResult {
    player: AlbumCard | null;
    team: AlbumCard | null;
    competition: AlbumCard | null;
    event: AlbumCard | null;
}

export const STAR_LABELS: Record<SignificanceLevel, string> = {
    1: 'Actual Relevante',
    2: 'Momento Puntual',
    3: 'Culto',
    4: 'Leyenda',
    5: 'GOAT',
};

export const DROP_RATES: Record<SignificanceLevel, number> = {
    1: 55,
    2: 25,
    3: 12,
    4: 7.5,
    5: 0.5,
};

export const LEGENDARY_ALBUM_IDS = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];