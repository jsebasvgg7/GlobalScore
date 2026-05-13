import { useState, useEffect } from 'react';
import { fetchUserPredictionsWithMatches } from '../services/profile.service';

const checkPredictionCorrect = (prediction, match) => {
  if (match.result_home === null || match.result_away === null) return false;

  const predDiff = Math.sign(prediction.home_score - prediction.away_score);
  const resultDiff = Math.sign(match.result_home - match.result_away);

  return predDiff === resultDiff ||
    (prediction.home_score === match.result_home && prediction.away_score === match.result_away);
};

const isConsecutive = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
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

      const finishedPredictions = data
        .filter(p => p.matches?.status === 'finished')
        .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;

      finishedPredictions.forEach((pred, index) => {
        const match = pred.matches;
        const isCorrect = checkPredictionCorrect(pred, match);

        if (index === 0) lastDate = match.date;

        if (isCorrect) {
          tempStreak++;
          if (index === 0 || isConsecutive(finishedPredictions[index - 1]?.matches.date, match.date)) {
            currentStreak = tempStreak;
          }
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (index === 0) currentStreak = 0;
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