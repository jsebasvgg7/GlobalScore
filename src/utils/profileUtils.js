// src/utils/profileUtils.js

export const getPredictionResult = (pred) => {
  if (!pred.matches || pred.matches.status !== 'finished') {
    return { status: 'pending', points: 0, label: 'Pendiente' };
  }

  const match = pred.matches;
  const exactMatch = pred.home_score === match.result_home && pred.away_score === match.result_away;
  const resultCorrect = Math.sign(pred.home_score - pred.away_score) === Math.sign(match.result_home - match.result_away);

  if (exactMatch) {
    return { status: 'exact', points: 5, label: 'Resultado Exacto' };
  } else if (resultCorrect) {
    return { status: 'correct', points: 3, label: 'Resultado Acertado' };
  } else {
    return { status: 'wrong', points: 0, label: 'Fallado' };
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
  const currentPoints = currentUser?.points || 0;
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
  return currentUser?.predictions > 0 
    ? Math.round((currentUser.correct / currentUser.predictions) * 100) 
    : 0;
};