// src/hooks/HooksHistory/useHistoricalPlayers.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

export const useHistoricalPlayers = () => {
  const [players, setPlayers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filters / search state
  const [search, setSearch]     = useState("");
  const [position, setPosition] = useState("all");
  const [legacy, setLegacy]     = useState("all");
  const [era, setEra]           = useState("all");

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("v_historical_players")
        .select("*")
        .order("significance_level", { ascending: false })
        .order("name");

      if (search.trim()) {
        // Full-text search: filter by name ilike as fallback
        query = query.ilike("name", `%${search.trim()}%`);
      }
      if (position !== "all") query = query.eq("position", position);
      if (legacy   !== "all") query = query.eq("legacy_type", legacy);
      if (era      !== "all") query = query.eq("era", era);

      const { data, error: err } = await query;
      if (err) throw err;
      setPlayers(data || []);
    } catch (err) {
      console.error("useHistoricalPlayers error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, position, legacy, era]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Get single player with all relations
  const getPlayer = useCallback(async (id) => {
    const { data, error: err } = await supabase
      .from("v_historical_players")
      .select(`
        *,
        historical_player_teams (
          start_year, end_year, roles,
          historical_teams ( id, name, country, era_dominance, image_path )
        ),
        historical_player_events (
          role_note,
          historical_events ( id, title, event_type, event_date, image_path )
        )
      `)
      .eq("id", id)
      .single();

    if (err) throw err;
    return data;
  }, []);

  // Unique eras for filter
  const availableEras = [...new Set(players.map(p => p.era).filter(Boolean))].sort();

  return {
    players,
    loading,
    error,
    loadPlayers,
    getPlayer,
    // filters
    search, setSearch,
    position, setPosition,
    legacy, setLegacy,
    era, setEra,
    availableEras,
  };
};
