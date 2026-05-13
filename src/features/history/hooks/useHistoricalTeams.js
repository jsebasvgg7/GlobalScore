import { useState, useEffect, useCallback } from "react";
import { fetchPublishedTeams, fetchTeamDetail } from '../services/history.service';

export { getHistoricalImageUrl } from "./useHistoricalPlayers";

// ─── Hook: listado de equipos publicados ─────────────────────
export function useHistoricalTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishedTeams();
      setTeams(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const filtered = teams.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || (t.country || "").toLowerCase().includes(q);
  });

  return { teams: filtered, allTeams: teams, loading, error, reload: loadTeams, search, setSearch };
}

// ─── Hook: detalle de equipo + lineup + títulos ──────────────
export function useHistoricalTeamDetail(teamId) {
  const [team, setTeam] = useState(null);
  const [lineup, setLineup] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchTeamDetail(teamId);
      setTeam(detail.team);
      setLineup(detail.lineup);
      setTitles(detail.titles);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { load(); }, [load]);

  return { team, lineup, titles, loading, error, reload: load };
}