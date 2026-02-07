/**
 * GlobalScore Configuration
 * Constantes de configuración general de la aplicación
 */

export const Config = {
  // App Info
  APP_NAME: 'GlobalScore',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Plataforma de predicciones deportivas',
  
  // Puntos del sistema
  POINTS: {
    EXACT_SCORE: 5,           // Marcador exacto
    CORRECT_RESULT: 3,        // Resultado acertado (ganador correcto)
    WRONG: 0,                 // Predicción incorrecta
    LEAGUE_PREDICTION: 20,    // Predicción de liga completa
    AWARD_PREDICTION: 10,     // Predicción de premio individual
    POINTS_PER_LEVEL: 20,     // Puntos necesarios por nivel
  },
  
  // Límites
  LIMITS: {
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    MAX_BIO_LENGTH: 150,
    PREDICTIONS_PER_PAGE: 10,
    MATCHES_PER_PAGE: 20,
  },
  
  // Tiempo
  TIMING: {
    TOAST_DURATION: 3000,     // ms
    PREDICTION_DEADLINE: 5,   // minutos antes del partido
    REFRESH_INTERVAL: 30000,  // ms para refresh de datos
    CACHE_DURATION: 300000,   // ms (5 minutos)
  },
  
  // URLs
  URLS: {
    WEB_APP: 'https://global-score.vercel.app',
    TERMS: 'https://global-score.vercel.app/terms',
    PRIVACY: 'https://global-score.vercel.app/privacy',
    SUPPORT: 'mailto:globalscore.oficial@gmail.com',
  },
  
  // Feature Flags
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: false,
    SOCIAL_SHARING: false,
    PRIVATE_LEAGUES: false,
    CHAT: false,
  },
  
  // Storage buckets en Supabase
  STORAGE_BUCKETS: {
    TEAM_LOGOS: 'team-logos',
    LEAGUE_LOGOS: 'league-logos',
    AWARD_LOGOS: 'award-logos',
    PROFILES: 'profiles',
    WORLD_CUP_LOGOS: 'world-cup-logos',
  },
  
  // Navegación
  NAVIGATION: {
    INITIAL_ROUTE: 'dashboard',
    AUTH_ROUTE: 'login',
  },
};

export default Config;