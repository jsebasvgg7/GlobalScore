import {
  Clock,           // pending
  Star,            // exact
  CheckCircle,     // correct
  XCircle,         // wrong
  Flame,           // 🔥
  Zap,             // ⭐ / ✨ energía
  Sparkles,        // 🌟 / ✨
  Target,          // 🎯
  Trophy,          // 🏆
  Rocket,          // 🚀
  Volcano,         // ← no existe en lucide, usamos Flame como fallback
  Crosshair,       // 🎪 / alternativa
  Palette,         // 🎨
  Drama,           // 🎭 ← no existe, usamos Clapperboard
  Clapperboard,
  CircleDot,       // 💫
} from 'lucide-react';

export const getPredictionResult = (pred) => {
  if (!pred.matches || pred.matches.status !== 'finished') {
    return {
      status: 'pending',
      points: 0,
      label: 'Pendiente',
      Icon: Clock,
      color: '#6B7280',
    };
  }

  const match = pred.matches;
  const exactMatch =
    pred.home_score === match.result_home &&
    pred.away_score === match.result_away;
  const resultCorrect =
    Math.sign(pred.home_score - pred.away_score) ===
    Math.sign(match.result_home - match.result_away);

  if (exactMatch) {
    return {
      status: 'exact',
      points: 5,
      label: 'Resultado Exacto',
      Icon: Star,
      color: '#F59E0B',
    };
  } else if (resultCorrect) {
    return {
      status: 'correct',
      points: 3,
      label: 'Resultado Acertado',
      Icon: CheckCircle,
      color: '#10B981',
    };
  } else {
    return {
      status: 'wrong',
      points: 0,
      label: 'Fallado',
      Icon: XCircle,
      color: '#EF4444',
    };
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Devuelve el componente Lucide correspondiente a un emoji o texto de icono.
 * Uso: const { Icon, color } = getIconData(achievement.icon);
 *       <Icon size={16} color={color} />
 */
export const getIconData = (iconText) => {
  const map = {
    '🎯': { Icon: Target,       color: '#EF4444' },
    '🌟': { Icon: Sparkles,     color: '#F59E0B' },
    '⭐': { Icon: Star,         color: '#F59E0B' },
    '✨': { Icon: Sparkles,     color: '#A78BFA' },
    '💫': { Icon: CircleDot,    color: '#A78BFA' },
    '🎪': { Icon: Crosshair,    color: '#8B5CF6' },
    '🎭': { Icon: Clapperboard, color: '#6366F1' },
    '🎨': { Icon: Palette,      color: '#EC4899' },
    '🔥': { Icon: Flame,        color: '#EF4444' },
    '🌋': { Icon: Flame,        color: '#F97316' },
    '☄️': { Icon: Rocket,       color: '#8B5CF6' },
    '⚡': { Icon: Zap,          color: '#F59E0B' },
    '🏆': { Icon: Trophy,       color: '#C9A227' },
  };
  return map[iconText] ?? { Icon: Star, color: '#8B5CF6' };
};

/** @deprecated usa getIconData en su lugar */
export const getIconEmoji = (iconText) => iconText;

export const getCategoryColor = (category) => {
  switch (category) {
    case 'Inicio':    return '#8B5CF6';
    case 'Progreso':  return '#3B82F6';
    case 'Precisión': return '#10B981';
    case 'Racha':     return '#EF4444';
    default:          return '#8B5CF6';
  }
};

export const calculateLevelProgress = (userData, currentUser) => {
  const currentLevelPoints = (userData.level - 1) * 20;
  const nextLevelPoints    = userData.level * 20;
  const currentPoints      = currentUser?.points || 0;
  const pointsInLevel      = currentPoints - currentLevelPoints;
  const pointsToNextLevel  = nextLevelPoints - currentPoints;
  const levelProgress      = (pointsInLevel / 20) * 100;

  return {
    currentLevelPoints,
    nextLevelPoints,
    currentPoints,
    pointsInLevel,
    pointsToNextLevel,
    levelProgress,
  };
};

export const calculateAccuracy = (currentUser) => {
  return currentUser?.predictions > 0
    ? Math.round((currentUser.correct / currentUser.predictions) * 100)
    : 0;
};