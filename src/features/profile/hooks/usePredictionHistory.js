import { useState, useEffect } from 'react';
import { fetchPredictionHistory } from '../services/profile.service';

export const usePredictionHistory = (currentUser) => {
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadPredictionHistory = async (toast) => {
    setHistoryLoading(true);
    try {
      const data = await fetchPredictionHistory(currentUser.id);
      setPredictionHistory(data);
    } catch (err) {
      console.error('Error loading prediction history:', err);
      if (toast) {
        toast.error('Error al cargar el historial');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPredictionHistory();
    }
  }, [currentUser]);

  return {
    predictionHistory,
    historyLoading,
    loadPredictionHistory
  };
};