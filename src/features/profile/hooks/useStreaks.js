import { useState, useEffect } from 'react';
import { fetchUserPredictionsWithMatches } from '../services/profile.service';

const isHit = (prediction, match) => {
  if (prediction.result_type && prediction.result_type !== 'miss') return true;
  if (match?.is_knockout && prediction.advancing_points > 0) return true;
  return false;
};

const isConsecutive = (dateA, dateB) => {
  const d1 = new Date(dateA);
  const d2 = new Date(dateB);
  const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

export const useStreaks = (currentUser) => {
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0,
    last_prediction_date: null
  });

  const calculateStreaks = async () => {
    try {
      const data = await fetchUserPredictionsWithMatches(currentUser.id);

      // Solo partidos ya finalizados, y con result_type ya calculado (evita nulls en tránsito)
      const finishedPredictions = data
        .filter(p => p.matches?.status === 'finished' && p.result_type != null)
        .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let stillCounting = true; // se apaga en cuanto encontramos un fallo o un corte, para current_streak
      const lastDate = finishedPredictions[0]?.matches?.date || null;

      finishedPredictions.forEach((pred, index) => {
        const match = pred.matches;
        const hit = isHit(pred, match);
        const prevMatch = finishedPredictions[index - 1]?.matches;

        // Si hay un hueco de más de 7 días respecto al pick anterior, la racha se corta aquí
        const brokeByGap = index > 0 && !isConsecutive(prevMatch.date, match.date);

        if (brokeByGap) {
          tempStreak = 0;
          stillCounting = false;
        }

        if (hit) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
          if (stillCounting) currentStreak = tempStreak;
        } else {
          tempStreak = 0;
          stillCounting = false;
        }
      });

      setStreakData({
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_prediction_date: lastDate
      });
    } catch (err) {
      console.error('Error calculating streaks:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      calculateStreaks();
    }
  }, [currentUser]);

  return {
    streakData,
    calculateStreaks
  };
};