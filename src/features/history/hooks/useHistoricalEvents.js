import { useState, useEffect, useCallback } from "react";
import { fetchPublishedEvents, fetchEventDetail } from "../services/history.service";
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
      const data = await fetchPublishedEvents();
      setEvents(data);
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
      const detail = await fetchEventDetail(eventId);
      setEvent(detail.event);
      setLineups(detail.lineups);
      setSquad(detail.squad);
      setStandings(detail.standings);
      setKnockout(detail.knockout);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  return { event, lineups, squad, standings, knockout, loading, error, reload: load };
}
