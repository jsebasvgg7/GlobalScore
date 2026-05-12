import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

export { getHistoricalImageUrl } from "../../features/history/hooks/useHistoricalPlayers";

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
      const { data, error: err } = await supabase
        .from("historical_teams")
        .select("*")
        .eq("is_published", true)
        .order("era_dominance", { ascending: true });
      if (err) throw err;
      setTeams(data || []);
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
      const [teamRes, lineupRes, titlesRes] = await Promise.all([
        supabase
          .from("historical_teams")
          .select("*")
          .eq("id", teamId)
          .eq("is_published", true)
          .single(),
        supabase
          .from("historical_team_lineup")
          .select("*, historical_players(id, name, image_path)")
          .eq("team_id", teamId)
          .order("shirt_number"),
        supabase
          .from("historical_team_titles")
          .select("*")
          .eq("team_id", teamId)
          .order("year"),
      ]);

      if (teamRes.error) throw teamRes.error;
      setTeam(teamRes.data);
      setLineup(lineupRes.data || []);
      setTitles(titlesRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => { load(); }, [load]);

  return { team, lineup, titles, loading, error, reload: load };
}