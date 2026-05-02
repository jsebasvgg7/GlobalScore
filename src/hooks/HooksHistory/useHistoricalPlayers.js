import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

// ─── Helper: URL pública del bucket "historical" ─────────────────────────────
export function getHistoricalImageUrl(imagePath) {
  if (!imagePath) return null;
  const { data } = supabase.storage
    .from("historical")
    .getPublicUrl(imagePath);
  return data?.publicUrl || null;
}

// ─── Hook: listado + filtros ─────────────────────────────────────────────────
export function useHistoricalPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [search, setSearch]                 = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterEra, setFilterEra]           = useState("");
  const [filterLegacy, setFilterLegacy]     = useState("");

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("historical_players")
        .select("*")
        .eq("is_published", true)
        .order("significance_level", { ascending: false })
        .order("name");

      if (err) throw err;
      setPlayers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlayers(); }, [loadPlayers]);

  // Filtrado en cliente (dataset pequeño)
  const filtered = players.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.country || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);

    const matchPos    = !filterPosition || p.position === filterPosition;
    const matchEra    = !filterEra      || p.era === filterEra;
    const matchLegacy = !filterLegacy   || p.legacy_type === filterLegacy;

    return matchSearch && matchPos && matchEra && matchLegacy;
  });

  // Opciones únicas para los selectores
  const positions = [...new Set(players.map((p) => p.position).filter(Boolean))].sort();
  const eras      = [...new Set(players.map((p) => p.era).filter(Boolean))].sort();
  const legacies  = [...new Set(players.map((p) => p.legacy_type).filter(Boolean))].sort();

  return {
    players: filtered,
    allPlayers: players,
    loading,
    error,
    reload: loadPlayers,
    search, setSearch,
    filterPosition, setFilterPosition,
    filterEra, setFilterEra,
    filterLegacy, setFilterLegacy,
    positions, eras, legacies,
  };
}

// ─── Hook: detalle de un jugador + relaciones ────────────────────────────────
export function useHistoricalPlayerDetail(playerId) {
  const [player, setPlayer] = useState(null);
  const [teams, setTeams]   = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Jugador base
      const { data: playerData, error: playerErr } = await supabase
        .from("historical_players")
        .select("*")
        .eq("id", playerId)
        .eq("is_published", true)
        .single();

      if (playerErr) throw playerErr;
      setPlayer(playerData);

      // 2. Equipos donde jugó
      const { data: teamsData, error: teamsErr } = await supabase
        .from("historical_player_teams")
        .select(`
          start_year,
          end_year,
          roles,
          historical_teams (
            id, name, country, era_dominance, legacy_type, image_path, is_published
          )
        `)
        .eq("player_id", playerId);

      if (teamsErr) throw teamsErr;

      const publishedTeams = (teamsData || [])
        .filter((r) => r.historical_teams?.is_published)
        .sort((a, b) => (a.start_year || 9999) - (b.start_year || 9999));
      setTeams(publishedTeams);

      // 3. Eventos donde participó
      const { data: eventsData, error: eventsErr } = await supabase
        .from("historical_player_events")
        .select(`
          role_note,
          historical_events (
            id, title, event_type, event_date, image_path, is_published
          )
        `)
        .eq("player_id", playerId);

      if (eventsErr) throw eventsErr;

      const publishedEvents = (eventsData || [])
        .filter((r) => r.historical_events?.is_published)
        .sort((a, b) => {
          const da = a.historical_events?.event_date || "";
          const db = b.historical_events?.event_date || "";
          return da < db ? -1 : 1;
        });
      setEvents(publishedEvents);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => { load(); }, [load]);

  return { player, teams, events, loading, error, reload: load };
}

// ─── Hook: listado de eventos ─────────────────────────────────────────────────
export function useHistoricalEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("historical_events")
          .select("*")
          .eq("is_published", true)
          .order("event_date");
        if (err) throw err;
        setEvents(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { events, loading, error };
}