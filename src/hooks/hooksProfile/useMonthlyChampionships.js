// src/hooks/hooksProfile/useMonthlyChampionships.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

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

      // Cargar historial de coronas
      const { data: history, error: historyError } = await supabase
        .from('monthly_championship_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('awarded_at', { ascending: false });

      if (historyError) throw historyError;
      setCrownHistory(history || []);

      // Cargar estadísticas mensuales actuales
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('monthly_points, monthly_predictions, monthly_correct, monthly_championships')
        .eq('id', currentUser.id)
        .single();

      if (userError) throw userError;
      
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