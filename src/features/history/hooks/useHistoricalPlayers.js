import { useState, useEffect, useCallback } from "react";
import {
  getHistoricalImageUrl,
  fetchPublishedPlayers,
  fetchPlayerDetail,
  fetchPlayerTeams,
  fetchPlayerEvents,
  fetchPlayerCareer,
  fetchPlayerNational,
  fetchPlayerTitles,
} from '../services/history.service';

// Re-exportar helper para que otros hooks/componentes puedan usarlo
export { getHistoricalImageUrl };

// ─── Hook: listado + filtros ─────────────────────────────────────────────────
export function useHistoricalPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterBallonDor, setFilterBallonDor] = useState("");
  const [filterLegacy, setFilterLegacy] = useState("");
  const [filterSignificance, setFilterSignificance] = useState("");

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishedPlayers();
      setPlayers(data);
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
    const matchSignificance = !filterSignificance || String(p.significance_level) === filterSignificance; // ← nuevo

    return matchSearch && matchPos && matchBallonDor && matchLegacy && matchSignificance; // ← actualizado
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
    filterSignificance, setFilterSignificance,
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
      const [playerData, teamsData, eventsData, careerData, nationalData, titlesData] = await Promise.all([
        fetchPlayerDetail(playerId),
        fetchPlayerTeams(playerId),
        fetchPlayerEvents(playerId),
        fetchPlayerCareer(playerId),
        fetchPlayerNational(playerId),
        fetchPlayerTitles(playerId),
      ]);

      setPlayer(playerData);
      setTeams(teamsData);
      setEvents(eventsData);
      setCareer(careerData);
      setNational(nationalData);
      setTitles(titlesData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => { load(); }, [load]);

  return { player, teams, events, career, national, titles, loading, error, reload: load };
}
