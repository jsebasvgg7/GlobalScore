import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/shared/services/supabase/client';

// ─── Helper: URL pública del bucket "historical" ─────────────────────────────
export function getHistoricalImageUrl(imagePath) {
  if (!imagePath) return null;

  // Cloudinary u otra URL completa
  if (
    typeof imagePath === "string" &&
    imagePath.startsWith("http")
  ) {
    return imagePath;
  }

  // Rutas antiguas de Supabase
  const { data } = supabase.storage
    .from("historical")
    .getPublicUrl(imagePath);

  return data?.publicUrl || null;
}

// ─── Hook: listado + filtros ─────────────────────────────────────────────────
export function useHistoricalPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterBallonDor, setFilterBallonDor] = useState("");
  const [filterLegacy, setFilterLegacy] = useState("");

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

  const filtered = players.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.country || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);

    const matchPos = !filterPosition || p.position === filterPosition;
    const matchBallonDor = !filterBallonDor || (filterBallonDor === "yes" && p.ballon_dor_count > 0);
    const matchLegacy = !filterLegacy || p.legacy_type === filterLegacy;

    return matchSearch && matchPos && matchBallonDor && matchLegacy;
  });

  const positions = [...new Set(players.map((p) => p.position).filter(Boolean))].sort();
  const legacies = [...new Set(players.map((p) => p.legacy_type).filter(Boolean))].sort();

  return {
    players: filtered,
    allPlayers: players,
    loading,
    error,
    reload: loadPlayers,
    search, setSearch,
    filterPosition, setFilterPosition,
    filterBallonDor, setFilterBallonDor,
    filterLegacy, setFilterLegacy,
    positions, legacies,
  };
}

// ─── Hook: detalle de un jugador + relaciones ────────────────────────────────
export function useHistoricalPlayerDetail(playerId) {
  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [career, setCareer] = useState([]);
  const [national, setNational] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // 2. Equipos donde jugó (relación legacy)
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

      // 4. Trayectoria en clubes
      const { data: careerData, error: careerErr } = await supabase
        .from("historical_player_career")
        .select("*")
        .eq("player_id", playerId)
        .order("start_year", { ascending: true });

      if (careerErr) throw careerErr;
      setCareer(careerData || []);

      // 5. Trayectoria en selección
      const { data: nationalData, error: nationalErr } = await supabase
        .from("historical_player_national")
        .select("*")
        .eq("player_id", playerId)
        .order("start_year", { ascending: true });

      if (nationalErr) throw nationalErr;
      setNational(nationalData || []);

      // 6. Palmarés
      const { data: titlesData, error: titlesErr } = await supabase
        .from("historical_player_titles")
        .select("*")
        .eq("player_id", playerId)
        .order("year", { ascending: true });

      if (titlesErr) throw titlesErr;
      setTitles(titlesData || []);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => { load(); }, [load]);

  return { player, teams, events, career, national, titles, loading, error, reload: load };
}
