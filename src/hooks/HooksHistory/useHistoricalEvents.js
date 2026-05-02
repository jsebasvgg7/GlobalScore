// src/hooks/HooksHistory/useHistoricalEvents.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

export const useHistoricalEvents = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [search, setSearch]       = useState("");
  const [eventType, setEventType] = useState("all");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("v_historical_events")
        .select("*")
        .order("event_date", { ascending: false });

      if (search.trim())       query = query.ilike("title", `%${search.trim()}%`);
      if (eventType !== "all") query = query.eq("event_type", eventType);

      const { data, error: err } = await query;
      if (err) throw err;
      setEvents(data || []);
    } catch (err) {
      console.error("useHistoricalEvents error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, eventType]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Get single event with full relations
  const getEvent = useCallback(async (id) => {
    const { data, error: err } = await supabase
      .from("v_historical_events")
      .select(`
        *,
        historical_player_events (
          role_note,
          historical_players ( id, name, country, position, image_path )
        ),
        historical_event_teams (
          role_note,
          historical_teams ( id, name, country, image_path )
        ),
        historical_event_competitions (
          historical_competitions ( id, name, type, year, image_path )
        )
      `)
      .eq("id", id)
      .single();

    if (err) throw err;
    return data;
  }, []);

  return {
    events,
    loading,
    error,
    loadEvents,
    getEvent,
    search, setSearch,
    eventType, setEventType,
  };
};
