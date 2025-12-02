
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useDashboardData() {
  const { profile: currentUser } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]); // Aunque los users se usan más en Ranking, los cargamos aquí

  const [loading, setLoading] = useState(true);

  // Función de mapeo para inyectar la predicción del usuario en el objeto principal
  const mapPredictions = (data, predictionKey, userId) => {
    return data.map(item => {
      // Intenta encontrar la predicción que pertenece al usuario actual (userId)
      const userPrediction = item[predictionKey].find(
        // NOTA: Asumimos que la columna en las tablas de predicción es 'user_id'
        (pred) => pred.user_id === userId
      );

      return {
        ...item,
        // Inyectamos la predicción como una propiedad 'prediction' si existe
        prediction: userPrediction || null,
        // Opcional: limpiar la lista original de predicciones para no duplicar datos
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
      // 1. Cargar datos base (Partidos, Ligas, Premios)
      
      // ---- A. PARTIDOS ----
      // Hacemos un LEFT JOIN para traer TODAS las predicciones y luego filtramos en mapPredictions
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_predictions!left(
            id, user_id, home_score_pred, away_score_pred, status, points
          )
        `)
        .order('date', { ascending: true });

      if (matchesError) throw matchesError;
      const processedMatches = mapPredictions(matchesData, 'match_predictions', userId);
      setMatches(processedMatches);


      // ---- B. LIGAS ----
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`
          *,
          league_predictions!left(
            id, user_id, champion_pred, topscorer_pred, topassist_pred, mvp_pred, status, points
          )
        `)
        .order('name', { ascending: true });

      if (leaguesError) throw leaguesError;
      const processedLeagues = mapPredictions(leaguesData, 'league_predictions', userId);
      setLeagues(processedLeagues);


      // ---- C. PREMIOS ----
      const { data: awardsData, error: awardsError } = await supabase
        .from('awards')
        .select(`
          *,
          award_predictions!left(
            id, user_id, winner_pred, status, points
          )
        `)
        .order('name', { ascending: true });

      if (awardsError) throw awardsError;
      const processedAwards = mapPredictions(awardsData, 'award_predictions', userId);
      setAwards(processedAwards);
      
      
      // ---- D. USUARIOS (Para Ranking/Perfil) ----
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData);


    } catch (error) {
      console.error("Error al cargar los datos del Dashboard y Predicciones:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencia vacía para que no se recree a menos que la llamemos manualmente

  
  // EFECTO PRINCIPAL: Cargar los datos cuando el currentUser.id esté disponible
  useEffect(() => {
    // Usamos currentUser.id porque este es el ID primario de la tabla 'users'
    if (currentUser?.id) { 
      fetchAllData(currentUser.id);
    }
  }, [currentUser?.id, fetchAllData]);
  
  // Función para forzar la recarga de datos
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