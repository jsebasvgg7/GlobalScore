import { useState, useEffect, useCallback } from "react";
import { uploadToCloudinary } from "@/shared/services/cloudinary/upload.service";
import { supabase } from '@/shared/services/supabase/client';

// ─── Helper: URL pública de imagen ───────────────────────────────────────────
export const getHistoricalImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Si ya es URL completa (Cloudinary)
  if (
    typeof imagePath === "string" &&
    imagePath.startsWith("http")
  ) {
    return imagePath;
  }

  // Compatibilidad con imágenes antiguas de Supabase Storage
  const { data } = supabase.storage
    .from("historical")
    .getPublicUrl(imagePath);

  return data?.publicUrl || null;
};

// ─── Helper: subir imagen al bucket ──────────────────────────────────────────
export const uploadHistoricalImage = async (file, folder) => {
  const url = await uploadToCloudinary(file, folder);
  return url;
};

// ─── Helper: eliminar imagen del bucket ──────────────────────────────────────
export const deleteHistoricalImage = async (imagePath) => {
  if (!imagePath) return;
  if (imagePath.startsWith("http")) return;
  await supabase.storage.from("historical").remove([imagePath]);
};

// ─── Helper: obtener admin_id del usuario autenticado ────────────────────────
const getAdminId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// ─── Campos válidos para historical_events ───────────────────────────────────
const VALID_EVENT_FIELDS = new Set([
  "title",
  "event_type",
  "event_date",
  "description",
  "is_published",
  "image_path",
  "banner_image_path",
  "event_category",
  "context_text",
  "impact_text",
  "protagonist_id",
  "team_protagonist_id",
  "score_a",
  "score_b",
  "team_a_name",
  "team_b_name",
  "admin_id",
]);

const cleanEventPayload = (formData) => {
  const filtered = Object.fromEntries(
    Object.entries(formData).filter(([key]) => VALID_EVENT_FIELDS.has(key))
  );

  // Sanitizar UUIDs vacíos → null
  const uuidFields = ["protagonist_id", "team_protagonist_id"];
  for (const field of uuidFields) {
    if (field in filtered && !filtered[field]) {
      filtered[field] = null;
    }
  }

  // Sanitizar event_date vacío → null
  if ("event_date" in filtered && !filtered.event_date) {
    filtered.event_date = null;
  }

  // ✅ AGREGA ESTO — Sanitizar integers vacíos → null
  const integerFields = ["score_a", "score_b"];
  for (const field of integerFields) {
    if (field in filtered) {
      const val = filtered[field];
      filtered[field] = val !== "" && val != null ? parseInt(val) : null;
    }
  }

  return filtered;
};

// ══════════════════════════════════════════════════════════════════════════════
//  HOOK PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function useAdminHistorical() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
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
    const admin_id = await getAdminId();
    const { data, error } = await supabase
      .from("historical_players")
      .insert({ ...formData, image_path, admin_id })
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
  //  PLAYER CAREER
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerCareer = async (playerId) => {
    const { data, error } = await supabase
      .from("historical_player_career")
      .select("*")
      .eq("player_id", playerId)
      .order("start_year", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerCareer = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_player_career")
      .delete()
      .eq("player_id", playerId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      player_id: playerId,
      team_name: r.team_name || null,
      team_country: r.team_country || null,
      start_year: r.start_year ? parseInt(r.start_year) : null,
      end_year: r.end_year ? parseInt(r.end_year) : null,
      appearances: r.appearances ? parseInt(r.appearances) : null,
      goals: r.goals ? parseInt(r.goals) : null,
      assists: r.assists ? parseInt(r.assists) : null,
      role_note: r.role_note || null,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_player_career")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYER NATIONAL
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerNational = async (playerId) => {
    const { data, error } = await supabase
      .from("historical_player_national")
      .select("*")
      .eq("player_id", playerId)
      .order("start_year", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerNational = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_player_national")
      .delete()
      .eq("player_id", playerId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r) => ({
      player_id: playerId,
      country: r.country || null,
      start_year: r.start_year ? parseInt(r.start_year) : null,
      end_year: r.end_year ? parseInt(r.end_year) : null,
      caps: r.caps ? parseInt(r.caps) : null,
      goals: r.goals ? parseInt(r.goals) : null,
      assists: r.assists ? parseInt(r.assists) : null,
      role_note: r.role_note || null,
    }));
    const { error: insErr } = await supabase
      .from("historical_player_national")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYER TITLES
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerTitles = async (playerId) => {
    const { data, error } = await supabase
      .from("historical_player_titles")
      .select("*")
      .eq("player_id", playerId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerTitles = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_player_titles")
      .delete()
      .eq("player_id", playerId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r) => ({
      player_id: playerId,
      title_category: r.title_category || "club",
      title_name: r.title_name || null,
      year: r.year ? String(r.year).trim() : null,
      team_name: r.team_name || null,
      quantity: r.quantity ? parseInt(r.quantity) : 1,
    }));
    const { error: insErr } = await supabase
      .from("historical_player_titles")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAMS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createTeam = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "teams");
    const admin_id = await getAdminId();
    const { data, error } = await supabase
      .from("historical_teams")
      .insert({ ...formData, image_path, admin_id })
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
  //  TEAM LINEUP
  // ══════════════════════════════════════════════════════════════════════════
  const getTeamLineup = async (teamId) => {
    const { data, error } = await supabase
      .from("historical_team_lineup")
      .select("*")
      .eq("team_id", teamId)
      .order("shirt_number");
    if (error) throw error;
    return data || [];
  };

  const setTeamLineup = async (teamId, lineupRows) => {
    const { error: delErr } = await supabase
      .from("historical_team_lineup")
      .delete()
      .eq("team_id", teamId);
    if (delErr) throw delErr;
    if (!lineupRows || lineupRows.length === 0) return;
    const rows = lineupRows.map((r) => ({
      team_id: teamId,
      shirt_number: r.shirt_number,
      player_name: r.player_name,
      position_role: r.position_role || null,
      pos_x: r.pos_x ?? 50,
      pos_y: r.pos_y ?? 50,
      player_id: r.player_id || null,
    }));
    const { error: insErr } = await supabase
      .from("historical_team_lineup")
      .insert(rows);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAM TITLES
  // ══════════════════════════════════════════════════════════════════════════
  const getTeamTitles = async (teamId) => {
    const { data, error } = await supabase
      .from("historical_team_titles")
      .select("*, historical_competitions(id, name)")
      .eq("team_id", teamId)
      .order("year");
    if (error) throw error;
    return data || [];
  };

  const setTeamTitles = async (teamId, titleRows) => {
    const { error: delErr } = await supabase
      .from("historical_team_titles")
      .delete()
      .eq("team_id", teamId);
    if (delErr) throw delErr;
    if (titleRows && titleRows.length > 0) {
      const rows = titleRows.map((r) => ({
        team_id: teamId,
        title_name: r.title_name,
        year: r.year || null,
        competition_id: r.competition_id || null,
      }));
      const { error: insErr } = await supabase
        .from("historical_team_titles")
        .insert(rows);
      if (insErr) throw insErr;
    }
    const count = titleRows?.length ?? 0;
    const { data: updatedTeam, error: updErr } = await supabase
      .from("historical_teams")
      .update({ titles_count: count })
      .eq("id", teamId)
      .select()
      .single();
    if (updErr) throw updErr;
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updatedTeam : t)));
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITIONS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createCompetition = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "competitions");
    const admin_id = await getAdminId();
    const { data, error } = await supabase
      .from("historical_competitions")
      .insert({ ...formData, image_path, admin_id })
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
  const createEvent = async (formData, imageFile, bannerFile) => {
    let image_path = null;
    let banner_image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, "events");
    if (bannerFile) banner_image_path = await uploadHistoricalImage(bannerFile, "events/banners");
    const admin_id = await getAdminId();
    const payload = cleanEventPayload({ ...formData, image_path, banner_image_path, admin_id });
    const { data, error } = await supabase
      .from("historical_events")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => [data, ...prev]);
    return data;
  };

  const updateEvent = async (id, formData, imageFile, bannerFile) => {
    const old = events.find((e) => e.id === id);
    let updates = cleanEventPayload({ ...formData });
    if (imageFile) {
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      updates.image_path = await uploadHistoricalImage(imageFile, "events");
    }
    if (bannerFile) {
      if (old?.banner_image_path) await deleteHistoricalImage(old.banner_image_path);
      updates.banner_image_path = await uploadHistoricalImage(bannerFile, "events/banners");
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
    if (old?.banner_image_path) await deleteHistoricalImage(old.banner_image_path);
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
    const rows = teamLinks.map((t) => ({
      player_id: playerId,
      team_id: t.team_id,
      start_year: t.start_year ? parseInt(t.start_year) : null,
      end_year: t.end_year ? parseInt(t.end_year) : null,
      roles: t.roles || null,
    }));
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
      players: pRes.data || [],
      teams: tRes.data || [],
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

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION GROUPS
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionGroups = async (competitionId) => {
    const { data, error } = await supabase
      .from("historical_competition_groups")
      .select("*")
      .eq("competition_id", competitionId)
      .order("group_name")
      .order("sort_order");
    if (error) throw error;
    return data || [];
  };

  const setCompetitionGroups = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_competition_groups")
      .delete()
      .eq("competition_id", competitionId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      group_name: r.group_name || "Grupo A",
      team_name: r.team_name || "",
      team_id: r.team_id || null,
      position: r.position ? parseInt(r.position) : null,
      points: r.points ? parseInt(r.points) : 0,
      wins: r.wins ? parseInt(r.wins) : 0,
      draws: r.draws ? parseInt(r.draws) : 0,
      losses: r.losses ? parseInt(r.losses) : 0,
      goals_for: r.goals_for ? parseInt(r.goals_for) : 0,
      goals_against: r.goals_against ? parseInt(r.goals_against) : 0,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_competition_groups")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION STANDINGS
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionStandings = async (competitionId) => {
    const { data, error } = await supabase
      .from("historical_competition_standings")
      .select("*")
      .eq("competition_id", competitionId)
      .order("position");
    if (error) throw error;
    return data || [];
  };

  const setCompetitionStandings = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_competition_standings")
      .delete()
      .eq("competition_id", competitionId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      position: r.position ? parseInt(r.position) : idx + 1,
      team_name: r.team_name || "",
      team_id: r.team_id || null,
      points: r.points ? parseInt(r.points) : 0,
      wins: r.wins ? parseInt(r.wins) : 0,
      draws: r.draws ? parseInt(r.draws) : 0,
      losses: r.losses ? parseInt(r.losses) : 0,
      goals_for: r.goals_for ? parseInt(r.goals_for) : 0,
      goals_against: r.goals_against ? parseInt(r.goals_against) : 0,
      champion: !!r.champion,
    }));
    const { error: insErr } = await supabase
      .from("historical_competition_standings")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION KNOCKOUT
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionKnockout = async (competitionId) => {
    const { data, error } = await supabase
      .from("historical_competition_knockout")
      .select("*")
      .eq("competition_id", competitionId)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  };

  const setCompetitionKnockout = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_competition_knockout")
      .delete()
      .eq("competition_id", competitionId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      round: r.round || "Final",
      match_number: r.match_number ? parseInt(r.match_number) : 1,
      team_a: r.team_a || "",
      team_b: r.team_b || "",
      team_a_id: r.team_a_id || null,
      team_b_id: r.team_b_id || null,
      score_a: r.score_a !== "" && r.score_a != null ? parseInt(r.score_a) : null,
      score_b: r.score_b !== "" && r.score_b != null ? parseInt(r.score_b) : null,
      agg_a: r.agg_a !== "" && r.agg_a != null ? parseInt(r.agg_a) : null,
      agg_b: r.agg_b !== "" && r.agg_b != null ? parseInt(r.agg_b) : null,
      penalties_a: r.penalties_a !== "" && r.penalties_a != null ? parseInt(r.penalties_a) : null,
      penalties_b: r.penalties_b !== "" && r.penalties_b != null ? parseInt(r.penalties_b) : null,
      winner: r.winner || null,
      notes: r.notes || null,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_competition_knockout")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT LINEUPS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventLineups = async (eventId) => {
    const { data, error } = await supabase
      .from("historical_event_lineups")
      .select("*")
      .eq("event_id", eventId)
      .order("team_side")
      .order("sort_order");
    if (error) throw error;
    return data || [];
  };

  const setEventLineups = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_event_lineups")
      .delete()
      .eq("event_id", eventId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      team_side: r.team_side || "team_a",
      team_name: r.team_name || "",
      team_id: r.team_id || null,
      shirt_number: r.shirt_number ? parseInt(r.shirt_number) : null,
      player_name: r.player_name || "",
      position_role: r.position_role || null,
      is_protagonist: !!r.is_protagonist,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_event_lineups")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT SQUAD
  // ══════════════════════════════════════════════════════════════════════════
  const getEventSquad = async (eventId) => {
    const { data, error } = await supabase
      .from("historical_event_squad")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  };

  const setEventSquad = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_event_squad")
      .delete()
      .eq("event_id", eventId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      player_name: r.player_name || "",
      player_id: r.player_id || null,
      shirt_number: r.shirt_number ? parseInt(r.shirt_number) : null,
      position_role: r.position_role || null,
      is_key_player: !!r.is_key_player,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_event_squad")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT STANDINGS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventStandings = async (eventId) => {
    const { data, error } = await supabase
      .from("historical_event_standings")
      .select("*")
      .eq("event_id", eventId)
      .order("position");
    if (error) throw error;
    return data || [];
  };

  const setEventStandings = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_event_standings")
      .delete()
      .eq("event_id", eventId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      position: r.position ? parseInt(r.position) : idx + 1,
      team_name: r.team_name || "",
      team_id: r.team_id || null,
      points: r.points ? parseInt(r.points) : null,
      wins: r.wins ? parseInt(r.wins) : null,
      draws: r.draws ? parseInt(r.draws) : null,
      losses: r.losses ? parseInt(r.losses) : null,
      goals_for: r.goals_for ? parseInt(r.goals_for) : null,
      goals_against: r.goals_against ? parseInt(r.goals_against) : null,
      is_champion: !!r.is_champion,
    }));
    const { error: insErr } = await supabase
      .from("historical_event_standings")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT KNOCKOUT
  // ══════════════════════════════════════════════════════════════════════════
  const getEventKnockout = async (eventId) => {
    const { data, error } = await supabase
      .from("historical_event_knockout")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  };

  const setEventKnockout = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from("historical_event_knockout")
      .delete()
      .eq("event_id", eventId);
    if (delErr) throw delErr;
    if (!rows || rows.length === 0) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      round: r.round || "Final",
      match_number: r.match_number ? parseInt(r.match_number) : 1,
      team_a: r.team_a || "",
      team_b: r.team_b || "",
      score_a: r.score_a !== "" && r.score_a != null ? parseInt(r.score_a) : null,
      score_b: r.score_b !== "" && r.score_b != null ? parseInt(r.score_b) : null,
      winner: r.winner || null,
      is_decisive: !!r.is_decisive,
      sort_order: r.sort_order ?? idx,
    }));
    const { error: insErr } = await supabase
      .from("historical_event_knockout")
      .insert(toInsert);
    if (insErr) throw insErr;
  };

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    players, teams, competitions, events,
    loading, error,
    loadAll, loadPlayers, loadTeams, loadCompetitions, loadEvents,
    createPlayer, updatePlayer, deletePlayer, togglePlayerPublished,
    getPlayerCareer, setPlayerCareer,
    getPlayerNational, setPlayerNational,
    getPlayerTitles, setPlayerTitles,
    createTeam, updateTeam, deleteTeam, toggleTeamPublished,
    getTeamLineup, setTeamLineup,
    getTeamTitles, setTeamTitles,
    createCompetition, updateCompetition, deleteCompetition, toggleCompetitionPublished,
    getCompetitionGroups, setCompetitionGroups,
    getCompetitionStandings, setCompetitionStandings,
    getCompetitionKnockout, setCompetitionKnockout,
    createEvent, updateEvent, deleteEvent, toggleEventPublished,
    getEventRelations, setEventRelations,
    getPlayerTeams, setPlayerTeams,
    getEventLineups, setEventLineups,
    getEventSquad, setEventSquad,
    getEventStandings, setEventStandings,
    getEventKnockout, setEventKnockout,
  };
}