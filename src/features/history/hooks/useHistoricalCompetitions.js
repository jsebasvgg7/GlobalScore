import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

export { getHistoricalImageUrl } from "./useHistoricalPlayers";

// ─── Listado de competencias publicadas ───────────────────────────────────────
export function useHistoricalCompetitions() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("");
  const [filterFormat, setFilterFormat] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("historical_competitions")
        .select("*, historical_teams(id, name, image_path)")
        .eq("is_published", true)
        .order("year", { ascending: false });
      if (err) throw err;
      setCompetitions(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = competitions.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.country || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q);
    const matchType   = !filterType   || c.type   === filterType;
    const matchFormat = !filterFormat || c.format === filterFormat;
    return matchSearch && matchType && matchFormat;
  });

  const types   = [...new Set(competitions.map(c => c.type).filter(Boolean))].sort();
  const formats = [...new Set(competitions.map(c => c.format).filter(Boolean))].sort();

  return {
    competitions: filtered,
    allCompetitions: competitions,
    loading, error, reload: load,
    search, setSearch,
    filterType, setFilterType,
    filterFormat, setFilterFormat,
    types, formats,
  };
}

// ─── Detalle de una competición ───────────────────────────────────────────────
export function useHistoricalCompetitionDetail(competitionId) {
  const [competition, setCompetition] = useState(null);
  const [groups,      setGroups]      = useState([]);   // rows planas
  const [standings,   setStandings]   = useState([]);
  const [knockout,    setKnockout]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const load = useCallback(async () => {
    if (!competitionId) return;
    setLoading(true);
    setError(null);
    try {
      const [compRes, groupsRes, standRes, knockRes] = await Promise.all([
        supabase
          .from("historical_competitions")
          .select("*, historical_teams(id, name, image_path, country)")
          .eq("id", competitionId)
          .eq("is_published", true)
          .single(),
        supabase
          .from("historical_competition_groups")
          .select("*")
          .eq("competition_id", competitionId)
          .order("group_name")
          .order("sort_order"),
        supabase
          .from("historical_competition_standings")
          .select("*")
          .eq("competition_id", competitionId)
          .order("position"),
        supabase
          .from("historical_competition_knockout")
          .select("*")
          .eq("competition_id", competitionId)
          .order("sort_order"),
      ]);

      if (compRes.error) throw compRes.error;
      setCompetition(compRes.data);
      setGroups(groupsRes.data   || []);
      setStandings(standRes.data || []);
      setKnockout(knockRes.data  || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => { load(); }, [load]);

  // Agrupar grupos por nombre de grupo (ej. { "Grupo A": [...], "Grupo B": [...] })
  const groupedGroups = groups.reduce((acc, row) => {
    const key = row.group_name || "Grupo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return {
    competition,
    groupedGroups, // { "Grupo A": [rows...], ... }
    standings,
    knockout,
    loading, error, reload: load,
  };
}
