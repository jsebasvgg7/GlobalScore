export const getPredictionResult = (pred) => {
  if (!pred.matches || pred.matches.status !== 'finished') {
    return { status: 'pending', points: 0, label: 'Pendiente' };
  }

  const points = (pred.points_earned || 0) + (pred.advancing_points || 0);

  switch (pred.result_type) {
    case 'exact':
      return { status: 'exact', points, label: 'Resultado Exacto' };
    case 'result':
      return { status: 'correct', points, label: 'Resultado Acertado' };
    case 'miss':
    default:
      // Si fue knockout y acertó quién avanza, no es un fallo total
      if (pred.matches.is_knockout && pred.advancing_points > 0) {
        return { status: 'correct', points, label: 'Avance Acertado' };
      }
      return { status: 'wrong', points, label: 'Fallado' };
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const getIconEmoji = (iconText) => {
  const emojiMap = {
    '🎯': '🎯', '🌟': '🌟', '⭐': '⭐', '✨': '✨',
    '💫': '💫', '🎪': '🎪', '🎭': '🎭', '🎨': '🎨',
    '🔥': '🔥', '🌋': '🌋', '☄️': '☄️'
  };
  return emojiMap[iconText] || '';
};

export const getCategoryColor = (category) => {
  switch(category) {
    case 'Inicio': return '#8B5CF6';
    case 'Progreso': return '#3B82F6';
    case 'Precisión': return '#10B981';
    case 'Racha': return '#EF4444';
    default: return '#8B5CF6';
  }
};

export const calculateLevelProgress = (userData, currentUser) => {
  const currentLevelPoints = (userData.level - 1) * 20;
  const nextLevelPoints = userData.level * 20;
  const currentPoints = currentUser?.season_points || 0;
  const pointsInLevel = currentPoints - currentLevelPoints;
  const pointsToNextLevel = nextLevelPoints - currentPoints;
  const levelProgress = (pointsInLevel / 20) * 100;

  return {
    currentLevelPoints,
    nextLevelPoints,
    currentPoints,
    pointsInLevel,
    pointsToNextLevel,
    levelProgress
  };
};

export const calculateAccuracy = (currentUser) => {
  const predictions = currentUser?.season_predictions || 0;
  const correct = currentUser?.season_correct || 0;
  return predictions > 0 ? Math.round((correct / predictions) * 100) : 0;
};