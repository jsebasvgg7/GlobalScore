import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getHistoricalImageUrl } from "./useHistoricalPlayers";

export { getHistoricalImageUrl };

// ─── Hook: listado de eventos ─────────────────────────────────────────────────
export function useHistoricalEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("historical_events")
        .select(`
          *,
          historical_players!historical_events_protagonist_id_fkey(id, name, image_path, country, position),
          historical_teams!historical_events_team_protagonist_id_fkey(id, name, image_path, primary_color)
        `)
        .eq("is_published", true)
        .order("event_date", { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q);
    const matchCat = !filterCategory || e.event_category === filterCategory;
    const matchType = !filterType || e.event_type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const types = [...new Set(events.map((e) => e.event_type).filter(Boolean))];

  return {
    events: filtered,
    allEvents: events,
    loading,
    error,
    reload: load,
    search, setSearch,
    filterCategory, setFilterCategory,
    filterType, setFilterType,
    types,
  };
}

// ─── Hook: detalle de un evento ───────────────────────────────────────────────
export function useHistoricalEventDetail(eventId) {
  const [event, setEvent] = useState(null);
  const [lineups, setLineups] = useState({ team_a: [], team_b: [] });
  const [squad, setSquad] = useState([]);
  const [standings, setStandings] = useState([]);
  const [knockout, setKnockout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      // Evento principal con protagonistas
      const { data: ev, error: evErr } = await supabase
        .from("historical_events")
        .select(`
          *,
          historical_players!historical_events_protagonist_id_fkey(id, name, image_path, country, position, legacy_type, impact_summary),
          historical_teams!historical_events_team_protagonist_id_fkey(id, name, image_path, primary_color, secondary_color, country, formation, manager)
        `)
        .eq("id", eventId)
        .single();
      if (evErr) throw evErr;
      setEvent(ev);

      // Datos adicionales en paralelo
      const [linRes, sqRes, stRes, koRes] = await Promise.all([
        supabase
          .from("historical_event_lineups")
          .select("*")
          .eq("event_id", eventId)
          .order("sort_order"),
        supabase
          .from("historical_event_squad")
          .select("*")
          .eq("event_id", eventId)
          .order("sort_order"),
        supabase
          .from("historical_event_standings")
          .select("*")
          .eq("event_id", eventId)
          .order("position"),
        supabase
          .from("historical_event_knockout")
          .select("*")
          .eq("event_id", eventId)
          .order("sort_order"),
      ]);

      const allLineups = linRes.data || [];
      setLineups({
        team_a: allLineups.filter((l) => l.team_side === "team_a"),
        team_b: allLineups.filter((l) => l.team_side === "team_b"),
      });
      setSquad(sqRes.data || []);
      setStandings(stRes.data || []);
      setKnockout(koRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  return { event, lineups, squad, standings, knockout, loading, error, reload: load };
}
