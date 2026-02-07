
// ==================== USER ====================
export interface User {
  id: string;
  auth_id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  current_streak: number;
  best_streak: number;
  level: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  ranking_position?: number;
  accuracy?: number;
  achievements?: Achievement[];
  titles?: Title[];
}

// ==================== MATCH ====================
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_logo?: string;
  away_logo?: string;
  home_score?: number;
  away_score?: number;
  match_date: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface MatchPrediction {
  id: string;
  user_id: string;
  match_id: string;
  home_prediction: number;
  away_prediction: number;
  points_earned?: number;
  created_at: string;
}

// ==================== LEAGUE ====================
export interface League {
  id: string;
  name: string;
  logo_url?: string;
  country: string;
  deadline: string;
  status: 'open' | 'closed' | 'finished';
  created_at: string;
}

export interface LeaguePrediction {
  id: string;
  user_id: string;
  league_id: string;
  champion?: string;
  top_scorer?: string;
  top_assists?: string;
  mvp?: string;
  points_earned?: number;
  created_at: string;
}

// ==================== AWARD ====================
export interface Award {
  id: string;
  name: string;
  logo_url?: string;
  category: string;
  deadline: string;
  status: 'open' | 'closed' | 'finished';
  created_at: string;
}

export interface AwardPrediction {
  id: string;
  user_id: string;
  award_id: string;
  predicted_winner: string;
  points_earned?: number;
  created_at: string;
}

// ==================== ACHIEVEMENTS ====================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'inicio' | 'progreso' | 'precision' | 'racha';
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// ==================== TITLES ====================
export interface Title {
  id: string;
  name: string;
  description: string;
  color: string;
  required_achievement_id?: string;
  created_at: string;
}

export interface UserTitle {
  id: string;
  user_id: string;
  title_id: string;
  is_active: boolean;
  unlocked_at: string;
  title?: Title;
}

// ==================== WORLD CUP ====================
export interface WorldCupGroup {
  id: string;
  group_name: string;
  teams: string[];
  created_at: string;
}

export interface WorldCupGroupPrediction {
  id: string;
  user_id: string;
  group_id: string;
  first_place?: string;
  second_place?: string;
  third_place?: string;
  fourth_place?: string;
  created_at: string;
}

export interface KnockoutMatch {
  id: string;
  round: string;
  position: number;
  team1?: string;
  team2?: string;
  winner?: string;
  match_date?: string;
  created_at: string;
}

export interface KnockoutPrediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner?: string;
  created_at: string;
}

// ==================== RANKING ====================
export interface RankingEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy: number;
  position: number;
  level: number;
  active_title?: Title;
}

// ==================== STATISTICS ====================
export interface UserStats {
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy: number;
  current_streak: number;
  best_streak: number;
  level: number;
  achievements_unlocked: number;
  ranking_position: number;
}

export interface PredictionHistory {
  id: string;
  match?: Match;
  league?: League;
  award?: Award;
  prediction_type: 'match' | 'league' | 'award';
  prediction_data: any;
  points_earned?: number;
  created_at: string;
}

// ==================== NOTIFICATIONS ====================
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  read: boolean;
  created_at: string;
}

// ==================== NAVIGATION ====================
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(auth)/forgot-password': undefined;
  '(auth)/reset-password': { token: string };
  'admin/index': undefined;
  'worldcup': undefined;
  'settings': undefined;
  'stats': undefined;
};

export type TabParamList = {
  'dashboard': undefined;
  'ranking': undefined;
  'profile': undefined;
  'notifications': undefined;
};

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}