// src/hooks/HooksHistory/useHistoricalTimeline.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

export const useHistoricalTimeline = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("v_historical_events")
        .select(`
          *,
          historical_player_events (
            historical_players ( id, name, country, image_path )
          )
        `)
        .order("event_date", { ascending: true });

      if (err) throw err;

      // Group by decade
      const grouped = {};
      (data || []).forEach(ev => {
        const year   = ev.event_date ? new Date(ev.event_date).getFullYear() : 0;
        const decade = year ? `${Math.floor(year / 10) * 10}s` : "Unknown";
        if (!grouped[decade]) grouped[decade] = [];
        grouped[decade].push(ev);
      });

      setEvents({ raw: data || [], grouped });
    } catch (err) {
      console.error("useHistoricalTimeline error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  return { events, loading, error, loadTimeline };
};
