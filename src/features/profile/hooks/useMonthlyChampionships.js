import { useState, useEffect } from 'react';
import { fetchUserCrownHistory, fetchUserMonthlyStats } from '../services/profile.service';

export const useMonthlyChampionships = (currentUser) => {
  const [crownHistory, setCrownHistory] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    monthly_points: 0,
    monthly_predictions: 0,
    monthly_correct: 0,
    monthly_championships: 0
  });
  const [championshipsLoading, setChampionshipsLoading] = useState(true);

  const loadMonthlyData = async () => {
    if (!currentUser?.id) return;

    try {
      setChampionshipsLoading(true);

      const [history, userData] = await Promise.all([
        fetchUserCrownHistory(currentUser.id),
        fetchUserMonthlyStats(currentUser.id),
      ]);

      setCrownHistory(history);
      setMonthlyStats({
        monthly_points: userData?.monthly_points || 0,
        monthly_predictions: userData?.monthly_predictions || 0,
        monthly_correct: userData?.monthly_correct || 0,
        monthly_championships: userData?.monthly_championships || 0
      });

    } catch (err) {
      console.error('Error loading monthly data:', err);
    } finally {
      setChampionshipsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadMonthlyData();
    }
  }, [currentUser]);

  return {
    crownHistory,
    monthlyStats,
    championshipsLoading,
    loadMonthlyData
  };
};