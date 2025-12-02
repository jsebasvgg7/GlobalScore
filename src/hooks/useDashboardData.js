// src/hooks/useDashboardData.js (Código FINAL Sincronizado)

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useDashboardData() {
  const { profile: currentUser } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]); 

  const [loading, setLoading] = useState(true);

  // Mapea la predicción del usuario logueado
  const mapPredictions = (data, predictionKey, userId) => {
    return data.map(item => {
      // Usamos optional chaining (?) por si el array de predicciones es nulo
      const userPrediction = item[predictionKey]?.find(
        (pred) => pred.user_id === userId 
      );

      return {
        ...item,
        prediction: userPrediction || null,
        // Eliminamos el array completo de predicciones
        [predictionKey]: undefined, 
      };
    });
  };


  const fetchAllData = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      
      // =========================================================
      // ---- A. PARTIDOS (Tabla: predictions) ----
      // =========================================================
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          predictions!predictions_match_id_fkey( 
            id, user_id, home_score_pred, away_score_pred, status, points
          )
        `)
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;
      const processedMatches = mapPredictions(matchesData, 'predictions', userId); 
      setMatches(processedMatches);


      // =========================================================
      // ---- B. LIGAS (Tabla: league_predictions) ----
      // AJUSTANDO COLUMNAS CON EL ESQUEMA QUE ENVIASTE
      // =========================================================
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`
          *,
          league_predictions!league_predictions_league_id_fkey( 
            id, user_id, 
            predicted_champion, 
            predicted_top_scorer, 
            predicted_top_assist, 
            predicted_mvp, 
            points_earned // <-- Columna Corregida
          )
        `)
        .order('name', { ascending: true });

      if (leaguesError) throw leaguesError;
      const processedLeagues = mapPredictions(leaguesData, 'league_predictions', userId);
      setLeagues(processedLeagues);


      // =========================================================
      // ---- C. PREMIOS (Tabla: award_predictions) ----
      // Asumimos que también usa 'points_earned'
      // =========================================================
      const { data: awardsData, error: awardsError } = await supabase
        .from('awards')
        .select(`
          *,
          award_predictions!award_predictions_award_id_fkey( 
            id, user_id, winner_pred, status, 
            points_earned // <-- Columna Asumida
          )
        `)
        .order('name', { ascending: true });

      if (awardsError) throw awardsError;
      const processedAwards = mapPredictions(awardsData, 'award_predictions', userId);
      setAwards(processedAwards);
      
      
      // ---- D. USUARIOS ----
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData);


    } catch (error) {
      console.error("Error al cargar los datos del Dashboard y Predicciones:", error);
      throw error; 
    } finally {
      setLoading(false);
    }
  }, []); 

  
  // EFECTO PRINCIPAL y retorno
  useEffect(() => {
    if (currentUser?.id) { 
      fetchAllData(currentUser.id);
    }
  }, [currentUser?.id, fetchAllData]);
  
  const refreshData = () => {
    if (currentUser?.id) {
        fetchAllData(currentUser.id);
    }
  };

  return {
    matches,
    leagues,
    awards,
    users,
    loading,
    setMatches,
    setLeagues,
    setAwards,
    refreshData,
  };
}