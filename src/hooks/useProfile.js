// src/hooks/useProfile.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * useProfile
 * - Carga el perfil del usuario (por auth)
 * - Carga users, matches, leagues, awards y predicciones del usuario
 * - Expone funciones: updateProfile, uploadAvatar, reloadAll
 * - Expone admin actions: addMatch/addLeague/addAward, finalize match/league/award
 *
 * Nota: mantiene la misma lógica de puntos/predicciones que tenías.
 */
export default function useProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // initial load
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authUser?.user) {
        // not logged in
        setLoading(false);
        return;
      }

      // load profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error al cargar perfil:", profileError);
      }

      if (!profile) {
        // create profile automatically
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: authUser.user.id,
            name: authUser.user.email?.split("@")[0] || "Usuario",
            email: authUser.user.email,
            points: 0,
            predictions: 0,
            correct: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error al crear perfil:", createError);
        } else {
          setCurrentUser(newProfile);
        }
      } else {
        setCurrentUser(profile);
      }

      // load other data in parallel
      const [
        { data: userList },
        { data: matchList },
        { data: leagueList },
        { data: awardList },
      ] = await Promise.allSettled([
        supabase.from("users").select("*").order("points", { ascending: false }),
        supabase.from("matches").select("*, predictions(*)"),
        supabase.from("leagues").select("*, league_predictions(*)"),
        supabase.from("awards").select("*, award_predictions(*)"),
      ]).then((results) =>
        results.map((r) => (r.status === "fulfilled" ? r.value : { data: [] }))
      );

      setUsers(userList?.data ?? userList ?? []);
      setMatches(matchList?.data ?? matchList ?? []);
      setLeagues(leagueList?.data ?? leagueList ?? []);
      setAwards(awardList?.data ?? awardList ?? []);
    } catch (err) {
      console.error("useProfile.loadAll error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    // subscribe to auth changes to reload profile if necessary
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadAll();
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      try {
        subscription?.data?.subscription?.unsubscribe();
      } catch (e) {}
    };
  }, [loadAll]);

  // ------- PREDICTIONS (matches) -------
  const makePrediction = async (matchId, homeScore, awayScore) => {
    if (!currentUser) return { error: "No user" };
    setActionLoading(true);
    try {
      const { error } = await supabase.from("predictions").upsert(
        {
          match_id: matchId,
          user_id: currentUser.id,
          home_score: homeScore,
          away_score: awayScore,
        },
        { onConflict: "match_id,user_id" }
      );
      if (error) throw error;
      await reloadMatches();
      return { ok: true };
    } catch (err) {
      console.error("makePrediction error:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const reloadMatches = async () => {
    try {
      const { data } = await supabase.from("matches").select("*, predictions(*)");
      setMatches(data || []);
    } catch (err) {
      console.error("reloadMatches:", err);
    }
  };

  // ------- ADD / ADMIN actions -------
  const addMatch = async (match) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;
      await reloadMatches();
      return { ok: true };
    } catch (err) {
      console.error("addMatch:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const addLeague = async (league) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("leagues").insert(league);
      if (error) throw error;
      await reloadLeagues();
      return { ok: true };
    } catch (err) {
      console.error("addLeague:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const addAward = async (award) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("awards").insert(award);
      if (error) throw error;
      await reloadAwards();
      return { ok: true };
    } catch (err) {
      console.error("addAward:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const reloadLeagues = async () => {
    try {
      const { data } = await supabase.from("leagues").select("*, league_predictions(*)");
      setLeagues(data || []);
    } catch (err) {
      console.error("reloadLeagues:", err);
    }
  };

  const reloadAwards = async () => {
    try {
      const { data } = await supabase.from("awards").select("*, award_predictions(*)");
      setAwards(data || []);
    } catch (err) {
      console.error("reloadAwards:", err);
    }
  };

  // ------- FINALIZE MATCH (and points) -------
  const setMatchResult = async (matchId, homeScore, awayScore) => {
    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          result_home: homeScore,
          result_away: awayScore,
          status: "finished",
        })
        .eq("id", matchId);
      if (updateError) throw updateError;

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .eq("id", matchId)
        .single();
      if (matchError) throw matchError;

      const resultDiff = Math.sign(homeScore - awayScore);

      for (const prediction of match.predictions || []) {
        const predDiff = Math.sign((prediction.home_score || 0) - (prediction.away_score || 0));
        let pointsEarned = 0;
        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
        } else if (resultDiff === predDiff) {
          pointsEarned = 3;
        }

        // update user's points and counters
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();
        if (userError) {
          console.error("Error getting user:", userError);
          continue;
        }

        const newPoints = (userData.points || 0) + pointsEarned;
        const newPredictions = (userData.predictions || 0) + 1;
        const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

        await supabase
          .from("users")
          .update({
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect,
          })
          .eq("id", prediction.user_id);
      }

      // reload all
      await Promise.all([reloadMatches(), reloadUsers()]);
      return { ok: true };
    } catch (err) {
      console.error("setMatchResult error:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const reloadUsers = async () => {
    try {
      const { data } = await supabase.from("users").select("*").order("points", { ascending: false });
      setUsers(data || []);
      // update currentUser from fresh users list (if exists)
      if (currentUser) {
        const updated = (data || []).find((u) => u.id === currentUser.id);
        if (updated) setCurrentUser(updated);
      }
    } catch (err) {
      console.error("reloadUsers:", err);
    }
  };

  // ------- LEAGUE FINALIZE -------
  const finishLeague = async (leagueId, results) => {
    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("leagues")
        .update({
          status: "finished",
          champion: results.champion,
          top_scorer: results.top_scorer,
          top_scorer_goals: results.top_scorer_goals,
          top_assist: results.top_assist,
          top_assist_count: results.top_assist_count,
          mvp_player: results.mvp_player,
        })
        .eq("id", leagueId);
      if (updateError) throw updateError;

      const { data: league } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)")
        .eq("id", leagueId)
        .single();

      for (const prediction of league.league_predictions || []) {
        let pointsEarned = 0;
        if (prediction.predicted_champion?.toLowerCase() === results.champion.toLowerCase()) pointsEarned += 5;
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer.toLowerCase()) pointsEarned += 5;
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist.toLowerCase()) pointsEarned += 5;
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player.toLowerCase()) pointsEarned += 5;

        await supabase.from("league_predictions").update({ points_earned: pointsEarned }).eq("id", prediction.id);

        const { data: userData } = await supabase.from("users").select("points").eq("id", prediction.user_id).single();
        const newPoints = (userData?.points || 0) + pointsEarned;
        await supabase.from("users").update({ points: newPoints }).eq("id", prediction.user_id);
      }

      await Promise.all([reloadLeagues(), reloadUsers()]);
      return { ok: true };
    } catch (err) {
      console.error("finishLeague:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  // ------- AWARD FINALIZE -------
  const finishAward = async (awardId, winner) => {
    setActionLoading(true);
    try {
      const { error: updateError } = await supabase.from("awards").update({ status: "finished", winner }).eq("id", awardId);
      if (updateError) throw updateError;

      const { data: award } = await supabase.from("awards").select("*, award_predictions(*)").eq("id", awardId).single();

      for (const prediction of award.award_predictions || []) {
        let pointsEarned = 0;
        if (prediction.predicted_winner?.toLowerCase() === winner.toLowerCase()) pointsEarned = 10;

        await supabase.from("award_predictions").update({ points_earned: pointsEarned }).eq("id", prediction.id);

        const { data: userData } = await supabase.from("users").select("points, predictions, correct").eq("id", prediction.user_id).single();
        const newPoints = (userData?.points || 0) + pointsEarned;
        const newPredictions = (userData?.predictions || 0) + 1;
        const newCorrect = (userData?.correct || 0) + (pointsEarned > 0 ? 1 : 0);

        await supabase.from("users").update({ points: newPoints, predictions: newPredictions, correct: newCorrect }).eq("id", prediction.user_id);
      }

      await Promise.all([reloadAwards(), reloadUsers()]);
      return { ok: true };
    } catch (err) {
      console.error("finishAward:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  // ------- LEAGUE & AWARD PREDICTIONS -------
  const makeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    if (!currentUser) return { error: "No user" };
    setActionLoading(true);
    try {
      const { error } = await supabase.from("league_predictions").upsert({
        league_id: leagueId,
        user_id: currentUser.id,
        predicted_champion: champion,
        predicted_top_scorer: topScorer,
        predicted_top_assist: topAssist,
        predicted_mvp: mvp,
      }, { onConflict: "league_id,user_id" });
      if (error) throw error;
      await reloadLeagues();
      return { ok: true };
    } catch (err) {
      console.error("makeLeaguePrediction:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  const makeAwardPrediction = async (awardId, predictedWinner) => {
    if (!currentUser) return { error: "No user" };
    setActionLoading(true);
    try {
      const { error } = await supabase.from("award_predictions").upsert({
        award_id: awardId,
        user_id: currentUser.id,
        predicted_winner: predictedWinner,
      }, { onConflict: "award_id,user_id" });
      if (error) throw error;
      await reloadAwards();
      return { ok: true };
    } catch (err) {
      console.error("makeAwardPrediction:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  // ------- PROFILE UPDATE & AVATAR -------
  const updateProfile = async (updates) => {
    if (!currentUser) return { error: "No user" };
    setActionLoading(true);
    try {
      const { error } = await supabase.from("users").update(updates).eq("id", currentUser.id);
      if (error) throw error;
      await reloadUsers();
      return { ok: true };
    } catch (err) {
      console.error("updateProfile:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  // avatar upload assumes you upload to supabase storage and update url
  const uploadAvatar = async (file) => {
    if (!currentUser || !file) return { error: "No user or file" };
    setActionLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${currentUser.id}/avatar.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("users").update({ avatar_url: urlData.publicUrl }).eq("id", currentUser.id);
      await reloadUsers();
      return { ok: true, url: urlData.publicUrl };
    } catch (err) {
      console.error("uploadAvatar:", err);
      return { error: err };
    } finally {
      setActionLoading(false);
    }
  };

  // ------- HISTORY (predictions, awards, leagues) -------
  const loadUserHistory = async (userId) => {
    if (!userId) return [];
    try {
      const { data } = await supabase.rpc("get_user_history", { uid: userId }).catch(() => ({ data: null }));
      return data || [];
    } catch (err) {
      console.error("loadUserHistory:", err);
      return [];
    }
  };

  // helper: compute position of current user
  const userPosition = () => {
    const sorted = [...(users || [])].sort((a, b) => b.points - a.points);
    if (!currentUser) return null;
    return sorted.findIndex((u) => u.id === currentUser.id) + 1;
  };

  return {
    // state
    currentUser,
    users,
    matches,
    leagues,
    awards,
    loading,
    actionLoading,

    // data helpers
    userPosition,
    loadUserHistory,

    // actions
    loadAll,
    reloadMatches,
    reloadLeagues,
    reloadAwards,
    reloadUsers,
    makePrediction,
    addMatch,
    setMatchResult,
    makeLeaguePrediction,
    addLeague,
    finishLeague,
    makeAwardPrediction,
    addAward,
    finishAward,
    updateProfile,
    uploadAvatar,
  };
}
