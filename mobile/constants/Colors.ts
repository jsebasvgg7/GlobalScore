
export const Colors = {
  // Primary Colors - Purple Theme
  primary: '#8B5CF6',           // Purple principal
  primaryDark: '#7C3AED',       // Purple oscuro
  primaryLight: '#A78BFA',      // Purple claro
  primaryLighter: '#C4B5FD',    // Purple muy claro
  
  // Background Colors
  background: '#0F172A',        // Azul oscuro principal
  backgroundSecondary: '#1E293B', // Gris oscuro
  surface: '#334155',           // Superficie de cards
  surfaceLight: '#475569',      // Superficie clara
  
  // Text Colors
  text: '#F1F5F9',              // Texto principal (blanco suave)
  textSecondary: '#94A3B8',     // Texto secundario (gris claro)
  textMuted: '#64748B',         // Texto deshabilitado
  
  // Status Colors
  success: '#10B981',           // Verde - Aciertos
  error: '#EF4444',             // Rojo - Errores
  warning: '#F59E0B',           // Amarillo - Advertencias
  info: '#3B82F6',              // Azul - Información
  
  // Ranking Colors
  gold: '#FFD700',              // Oro - 1er lugar
  silver: '#C0C0C0',            // Plata - 2do lugar
  bronze: '#CD7F32',            // Bronce - 3er lugar
  
  // Match Status Colors
  live: '#EF4444',              // Partido en vivo (rojo pulsante)
  upcoming: '#8B5CF6',          // Próximo partido (purple)
  finished: '#6B7280',          // Partido finalizado (gris)
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Border Colors
  border: '#475569',
  borderLight: '#64748B',
  
  // Achievement Colors
  achievement: {
    locked: '#475569',
    unlocked: '#8B5CF6',
    rare: '#F59E0B',
    legendary: '#FFD700',
  },
  
  // Crown/Title Colors
  crown: {
    novato: '#94A3B8',          // Gris
    pronosticador: '#3B82F6',   // Azul
    oraculo: '#8B5CF6',         // Purple
    leyenda: '#FFD700',         // Dorado
  },
};

// Gradientes útiles para componentes
export const Gradients = {
  primary: ['#8B5CF6', '#7C3AED'],
  success: ['#10B981', '#059669'],
  error: ['#EF4444', '#DC2626'],
  gold: ['#FFD700', '#FFA500'],
  card: ['#1E293B', '#334155'],
};

// Opacidades comunes
export const Opacity = {
  disabled: 0.5,
  overlay: 0.6,
  subtle: 0.8,
  medium: 0.7,
  light: 0.3,
};

export default Colors;