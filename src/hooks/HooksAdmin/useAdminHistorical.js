import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";

// ─── Helper: URL pública de imagen ───────────────────────────────────────────
export const getHistoricalImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const { data } = supabase.storage
    .from("historical")
    .getPublicUrl(imagePath);
  return data?.publicUrl || null;
};

// ─── Helper: subir imagen al bucket ──────────────────────────────────────────
export const uploadHistoricalImage = async (file, folder) => {
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("historical")
    .upload(fileName, file, { upsert: false });
  if (error) throw error;
  return fileName;
};

// ─── Helper: eliminar imagen del bucket ──────────────────────────────────────
export const deleteHistoricalImage = async (imagePath) => {
  if (!imagePath) return;
  await supabase.storage.from("historical").remove([imagePath]);
};

// ══════════════════════════════════════════════════════════════════════════════
//  HOOK PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function useAdminHistorical() {
  // ── State ────────────────────────────────────────────────────────────────
  const [players, setPlayers]           = useState([]);
  const [teams, setTeams]               = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // ── Loaders ──────────────────────────────────────────────────────────────
  const loadPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("historical_players")
      .select("*")
      .order("significance_level", { ascending: false });
    if (error) throw error;
    setPlayers(data || []);
  }, []);

  const loadTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from("historical_teams")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setTeams(data || []);
  }, []);

  const loadCompetitions = useCallback(async () => {
    const { data, error } = await supabase
      .from("historical_competitions")
      .select("*")
      .order("year", { ascending: false });
    if (error) throw error;
    setCompetitions(data || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("historical_events")
      .select("*")
      .order("event_date", { ascending: false });
    if (error) throw error;
    setEvents(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadPlayers(), loadTeams(), loadCompetitions(), loadEvents()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadPlayers, loadTeams, loadCompetitions, loadEvents]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYERS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createPlayer = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "players");
    const { data, error } = await supabase
      .from("historical_players")
      .insert({ ...formData, image_path })
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => [data, ...prev]);
    return data;
  };

  const updatePlayer = async (id, formData, imageFile) => {
    let updates = { ...formData };
    if (imageFile) {
      const old = players.find((p) => p.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      updates.image_path = await uploadHistoricalImage(imageFile, "players");
    }
    const { data, error } = await supabase
      .from("historical_players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const deletePlayer = async (id) => {
    const old = players.find((p) => p.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from("historical_players").delete().eq("id", id);
    if (error) throw error;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlayerPublished = async (id, current) => {
    const { data, error } = await supabase
      .from("historical_players")
      .update({ is_published: !current })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAMS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createTeam = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "teams");
    const { data, error } = await supabase
      .from("historical_teams")
      .insert({ ...formData, image_path })
      .select()
      .single();
    if (error) throw error;
    setTeams((prev) => [data, ...prev]);
    return data;
  };

  const updateTeam = async (id, formData, imageFile) => {
    let updates = { ...formData };
    if (imageFile) {
      const old = teams.find((t) => t.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      updates.image_path = await uploadHistoricalImage(imageFile, "teams");
    }
    const { data, error } = await supabase
      .from("historical_teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setTeams((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTeam = async (id) => {
    const old = teams.find((t) => t.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from("historical_teams").delete().eq("id", id);
    if (error) throw error;
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTeamPublished = async (id, current) => {
    const { data, error } = await supabase
      .from("historical_teams")
      .update({ is_published: !current })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setTeams((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAM LINEUP — 11 titular
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Devuelve los 11 jugadores del lineup de un equipo.
   * Ordenados por shirt_number.
   */
  const getTeamLineup = async (teamId) => {
    const { data, error } = await supabase
      .from("historical_team_lineup")
      .select("*")
      .eq("team_id", teamId)
      .order("shirt_number");
    if (error) throw error;
    return data || [];
  };

  /**
   * Reemplaza toda la alineación de un equipo.
   * lineupRows = [{ shirt_number, player_name, position_role, pos_x, pos_y, player_id? }]
   * Elimina los registros anteriores e inserta los nuevos en una sola operación.
   */
  const setTeamLineup = async (teamId, lineupRows) => {
    // 1. Borrar alineación existente
    const { error: delErr } = await supabase
      .from("historical_team_lineup")
      .delete()
      .eq("team_id", teamId);
    if (delErr) throw delErr;

    // 2. Insertar nueva si hay jugadores
    if (!lineupRows || lineupRows.length === 0) return;

    const rows = lineupRows.map((r) => ({
      team_id:       teamId,
      shirt_number:  r.shirt_number,
      player_name:   r.player_name,
      position_role: r.position_role || null,
      pos_x:         r.pos_x ?? 50,
      pos_y:         r.pos_y ?? 50,
      player_id:     r.player_id || null,
    }));

    const { error: insErr } = await supabase
      .from("historical_team_lineup")
      .insert(rows);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAM TITLES — palmarés
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Devuelve los títulos de un equipo, ordenados por año.
   */
  const getTeamTitles = async (teamId) => {
    const { data, error } = await supabase
      .from("historical_team_titles")
      .select("*, historical_competitions(id, name)")
      .eq("team_id", teamId)
      .order("year");
    if (error) throw error;
    return data || [];
  };

  /**
   * Reemplaza todos los títulos de un equipo.
   * titleRows = [{ title_name, year, competition_id? }]
   * También actualiza el campo titles_count en historical_teams.
   */
  const setTeamTitles = async (teamId, titleRows) => {
    // 1. Borrar títulos existentes
    const { error: delErr } = await supabase
      .from("historical_team_titles")
      .delete()
      .eq("team_id", teamId);
    if (delErr) throw delErr;

    // 2. Insertar nuevos si hay
    if (titleRows && titleRows.length > 0) {
      const rows = titleRows.map((r) => ({
        team_id:        teamId,
        title_name:     r.title_name,
        year:           r.year || null,
        competition_id: r.competition_id || null,
      }));
      const { error: insErr } = await supabase
        .from("historical_team_titles")
        .insert(rows);
      if (insErr) throw insErr;
    }

    // 3. Sincronizar titles_count en historical_teams
    const count = titleRows?.length ?? 0;
    const { data: updatedTeam, error: updErr } = await supabase
      .from("historical_teams")
      .update({ titles_count: count })
      .eq("id", teamId)
      .select()
      .single();
    if (updErr) throw updErr;

    // 4. Actualizar estado local
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updatedTeam : t)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITIONS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createCompetition = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "competitions");
    const { data, error } = await supabase
      .from("historical_competitions")
      .insert({ ...formData, image_path })
      .select()
      .single();
    if (error) throw error;
    setCompetitions((prev) => [data, ...prev]);
    return data;
  };

  const updateCompetition = async (id, formData, imageFile) => {
    let updates = { ...formData };
    if (imageFile) {
      const old = competitions.find((c) => c.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      updates.image_path = await uploadHistoricalImage(imageFile, "competitions");
    }
    const { data, error } = await supabase
      .from("historical_competitions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setCompetitions((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  };

  const deleteCompetition = async (id) => {
    const old = competitions.find((c) => c.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from("historical_competitions").delete().eq("id", id);
    if (error) throw error;
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCompetitionPublished = async (id, current) => {
    const { data, error } = await supabase
      .from("historical_competitions")
      .update({ is_published: !current })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setCompetitions((prev) => prev.map((c) => (c.id === id ? data : c)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENTS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createEvent = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "events");
    const { data, error } = await supabase
      .from("historical_events")
      .insert({ ...formData, image_path })
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => [data, ...prev]);
    return data;
  };

  const updateEvent = async (id, formData, imageFile) => {
    let updates = { ...formData };
    if (imageFile) {
      const old = events.find((e) => e.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      updates.image_path = await uploadHistoricalImage(imageFile, "events");
    }
    const { data, error } = await supabase
      .from("historical_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  };

  const deleteEvent = async (id) => {
    const old = events.find((e) => e.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from("historical_events").delete().eq("id", id);
    if (error) throw error;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleEventPublished = async (id, current) => {
    const { data, error } = await supabase
      .from("historical_events")
      .update({ is_published: !current })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  RELACIONES — jugadores ↔ equipos
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerTeams = async (playerId) => {
    const { data, error } = await supabase
      .from("historical_player_teams")
      .select("*, historical_teams(*)")
      .eq("player_id", playerId);
    if (error) throw error;
    return data || [];
  };

  const setPlayerTeams = async (playerId, teamLinks) => {
    await supabase.from("historical_player_teams").delete().eq("player_id", playerId);
    if (teamLinks.length === 0) return;
    const rows = teamLinks.map((t) => ({ player_id: playerId, ...t }));
    const { error } = await supabase.from("historical_player_teams").insert(rows);
    if (error) throw error;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  RELACIONES — eventos ↔ jugadores / equipos / competencias
  // ══════════════════════════════════════════════════════════════════════════
  const getEventRelations = async (eventId) => {
    const [pRes, tRes, cRes] = await Promise.all([
      supabase
        .from("historical_player_events")
        .select("*, historical_players(id, name)")
        .eq("event_id", eventId),
      supabase
        .from("historical_event_teams")
        .select("*, historical_teams(id, name)")
        .eq("event_id", eventId),
      supabase
        .from("historical_event_competitions")
        .select("*, historical_competitions(id, name)")
        .eq("event_id", eventId),
    ]);
    return {
      players:      pRes.data || [],
      teams:        tRes.data || [],
      competitions: cRes.data || [],
    };
  };

  const setEventRelations = async (eventId, { playerIds, teamIds, competitionIds }) => {
    await Promise.all([
      supabase.from("historical_player_events").delete().eq("event_id", eventId),
      supabase.from("historical_event_teams").delete().eq("event_id", eventId),
      supabase.from("historical_event_competitions").delete().eq("event_id", eventId),
    ]);

    const inserts = [];
    if (playerIds?.length)
      inserts.push(
        supabase.from("historical_player_events")
          .insert(playerIds.map((id) => ({ event_id: eventId, player_id: id })))
      );
    if (teamIds?.length)
      inserts.push(
        supabase.from("historical_event_teams")
          .insert(teamIds.map((id) => ({ event_id: eventId, team_id: id })))
      );
    if (competitionIds?.length)
      inserts.push(
        supabase.from("historical_event_competitions")
          .insert(competitionIds.map((id) => ({ event_id: eventId, competition_id: id })))
      );

    await Promise.all(inserts);
  };

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    // State
    players, teams, competitions, events,
    loading, error,
    // Reload
    loadAll, loadPlayers, loadTeams, loadCompetitions, loadEvents,
    // Players
    createPlayer, updatePlayer, deletePlayer, togglePlayerPublished,
    // Teams
    createTeam, updateTeam, deleteTeam, toggleTeamPublished,
    // Team lineup ← NUEVO
    getTeamLineup, setTeamLineup,
    // Team titles ← NUEVO
    getTeamTitles, setTeamTitles,
    // Competitions
    createCompetition, updateCompetition, deleteCompetition, toggleCompetitionPublished,
    // Events
    createEvent, updateEvent, deleteEvent, toggleEventPublished,
    // Relations
    getPlayerTeams, setPlayerTeams,
    getEventRelations, setEventRelations,
  };
}