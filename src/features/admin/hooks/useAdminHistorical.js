// src/features/admin/hooks/useAdminHistorical.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/services/supabase/client';
import {
  uploadHistoricalImage,
  getHistoricalImageUrl,
  deleteHistoricalImage,
  getEventMoments,
  setEventMoments as setEventMomentsService,
  getEventProtagonists,
  setEventProtagonists as setEventProtagonistsService,
} from '../services/admin.service';

// ─── Re-exportamos los helpers para quien los importe desde el hook ───────────
export { getHistoricalImageUrl, uploadHistoricalImage, deleteHistoricalImage };

// ══════════════════════════════════════════════════════════════════════════════
//  UTILIDADES DE SANITIZACIÓN
//  Toda conversión de "" → null vive aquí. Nunca pasar strings vacíos
//  a columnas UUID, integer o date de Supabase.
// ══════════════════════════════════════════════════════════════════════════════

/** Convierte cualquier valor vacío/falsy en null para campos UUID */
const uuid = (v) => (v && typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

/** Convierte a entero; devuelve null si el valor es vacío o no parseable */
const int = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

/** Convierte a string recortado; devuelve null si queda vacío */
const str = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s !== '' ? s : null;
};

/** Convierte a boolean explícito (acepta string "true"/"false") */
const bool = (v) => {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  return false;
};

/** Convierte a date ISO; devuelve null si está vacío */
const date = (v) => (v && String(v).trim() !== '' ? String(v).trim() : null);

// ─── Helper: obtener admin_id del usuario autenticado ────────────────────────
const getAdminId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// ──────────────────────────────────────────────────────────────────────────────
//  CAMPOS VÁLIDOS Y LIMPIADORES POR TABLA
//  Cada función recibe el objeto crudo del formulario y devuelve un payload
//  listo para insertar/actualizar en Supabase sin ningún campo sucio.
// ──────────────────────────────────────────────────────────────────────────────

const cleanPlayer = (f) => ({
  name: str(f.name),
  country: str(f.country),
  position: str(f.position),
  birth_year: int(f.birth_year),
  death_year: int(f.death_year),
  ballon_dor_count: int(f.ballon_dor_count) ?? 0,
  legacy_type: str(f.legacy_type),
  significance_level: int(f.significance_level) ?? 3,
  description: str(f.description),
  impact_summary: str(f.impact_summary),
  is_published: bool(f.is_published),
  is_special: bool(f.is_special),
  special_owner_id: uuid(f.special_owner_id),
  // image_path se maneja fuera
});

const cleanTeam = (f) => ({
  name: str(f.name),
  country: str(f.country),
  founded_year: int(f.founded_year),
  era_dominance: str(f.era_dominance),
  active_years: str(f.active_years),
  manager: str(f.manager),
  legacy_type: str(f.legacy_type),
  primary_color: str(f.primary_color),
  secondary_color: str(f.secondary_color),
  formation: str(f.formation),
  titles_count: int(f.titles_count) ?? 0,
  description: str(f.description),
  historical_note: str(f.historical_note),
  is_published: bool(f.is_published),
  // image_path se maneja fuera
});

const cleanCompetition = (f) => {
  const base = {
    name: str(f.name),
    type: str(f.type),
    format: str(f.format),
    year: int(f.year),
    country: str(f.country),
    edition: str(f.edition),
    num_teams: int(f.num_teams),
    description: str(f.description),
    is_published: bool(f.is_published),
  };
  // Modo ganador: equipo registrado vs texto libre
  if (f.use_winner_text) {
    base.winner_text = str(f.winner_text);
    base.winner_team_id = null;
  } else {
    base.winner_team_id = uuid(f.winner_team_id);
    base.winner_text = null;
  }
  return base;
};

const cleanEvent = (f) => ({
  title: str(f.title),
  event_type: str(f.event_type),
  event_date: date(f.event_date),
  event_category: str(f.event_category),
  context_text: str(f.context_text),
  impact_text: str(f.impact_text),
  description: str(f.description),
  protagonist_id: uuid(f.protagonist_id),
  team_protagonist_id: uuid(f.team_protagonist_id),
  score_a: int(f.score_a),
  score_b: int(f.score_b),
  team_a_name: str(f.team_a_name),
  team_b_name: str(f.team_b_name),
  is_published: bool(f.is_published),
  // image_path y banner_image_path se manejan fuera
});

// ══════════════════════════════════════════════════════════════════════════════
//  HOOK PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function useAdminHistorical() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from('historical_players')
      .select('*')
      .order('significance_level', { ascending: false });
    if (error) throw error;
    setPlayers(data || []);
  }, []);

  const loadTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('historical_teams')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setTeams(data || []);
  }, []);

  const loadCompetitions = useCallback(async () => {
    const { data, error } = await supabase
      .from('historical_competitions')
      .select('*')
      .order('year', { ascending: false });
    if (error) throw error;
    setCompetitions(data || []);
  }, []);

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('historical_events')
      .select('*')
      .order('event_date', { ascending: false });
    if (error) throw error;
    setEvents(data || []);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .order('name');
    if (error) throw error;
    setUsers(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadPlayers(), loadTeams(), loadCompetitions(), loadEvents(), loadUsers(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadPlayers, loadTeams, loadCompetitions, loadEvents, loadUsers]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYERS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createPlayer = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, 'players');
    const admin_id = await getAdminId();
    const payload = { ...cleanPlayer(formData), image_path, admin_id };
    const { data, error } = await supabase
      .from('historical_players')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => [data, ...prev]);
    return data;
  };

  const updatePlayer = async (id, formData, imageFile) => {
    let payload = { ...cleanPlayer(formData) };
    if (imageFile) {
      const old = players.find((p) => p.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      payload.image_path = await uploadHistoricalImage(imageFile, 'players');
    }
    const { data, error } = await supabase
      .from('historical_players')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const deletePlayer = async (id) => {
    const old = players.find((p) => p.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from('historical_players').delete().eq('id', id);
    if (error) throw error;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlayerPublished = async (id, current) => {
    const { data, error } = await supabase
      .from('historical_players')
      .update({ is_published: !current })
      .eq('id', id)
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
      .from('historical_player_career')
      .select('*')
      .eq('player_id', playerId)
      .order('start_year', { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerCareer = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_player_career')
      .delete()
      .eq('player_id', playerId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      player_id: playerId,
      team_name: str(r.team_name),
      team_country: str(r.team_country),
      start_year: int(r.start_year),
      end_year: int(r.end_year),
      appearances: int(r.appearances),
      goals: int(r.goals),
      assists: int(r.assists),
      role_note: str(r.role_note),
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase.from('historical_player_career').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYER NATIONAL
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerNational = async (playerId) => {
    const { data, error } = await supabase
      .from('historical_player_national')
      .select('*')
      .eq('player_id', playerId)
      .order('start_year', { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerNational = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_player_national')
      .delete()
      .eq('player_id', playerId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r) => ({
      player_id: playerId,
      country: str(r.country),
      start_year: int(r.start_year),
      end_year: int(r.end_year),
      caps: int(r.caps),
      goals: int(r.goals),
      assists: int(r.assists),
      role_note: str(r.role_note),
    }));
    const { error: insErr } = await supabase.from('historical_player_national').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  PLAYER TITLES
  // ══════════════════════════════════════════════════════════════════════════
  const getPlayerTitles = async (playerId) => {
    const { data, error } = await supabase
      .from('historical_player_titles')
      .select('*')
      .eq('player_id', playerId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const setPlayerTitles = async (playerId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_player_titles')
      .delete()
      .eq('player_id', playerId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      player_id: playerId,
      title_category: str(r.title_category) || 'club',
      title_name: str(r.title_name),
      year: str(r.year),
      team_name: str(r.team_name),
      quantity: int(r.quantity) ?? 1,
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase.from('historical_player_titles').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAMS CRUD
  // ══════════════════════════════════════════════════════════════════════════
  const createTeam = async (formData, imageFile) => {
    let image_path = null;
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, 'teams');
    const admin_id = await getAdminId();
    const payload = { ...cleanTeam(formData), image_path, admin_id };
    const { data, error } = await supabase
      .from('historical_teams')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setTeams((prev) => [data, ...prev]);
    return data;
  };

  const updateTeam = async (id, formData, imageFile) => {
    let payload = { ...cleanTeam(formData) };
    if (imageFile) {
      const old = teams.find((t) => t.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      payload.image_path = await uploadHistoricalImage(imageFile, 'teams');
    }
    const { data, error } = await supabase
      .from('historical_teams')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTeams((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTeam = async (id) => {
    const old = teams.find((t) => t.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from('historical_teams').delete().eq('id', id);
    if (error) throw error;
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTeamPublished = async (id, current) => {
    const { data, error } = await supabase
      .from('historical_teams')
      .update({ is_published: !current })
      .eq('id', id)
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
      .from('historical_team_lineup')
      .select('*')
      .eq('team_id', teamId)
      .order('shirt_number');
    if (error) throw error;
    return data || [];
  };

  const setTeamLineup = async (teamId, lineupRows) => {
    const { error: delErr } = await supabase
      .from('historical_team_lineup')
      .delete()
      .eq('team_id', teamId);
    if (delErr) throw delErr;
    if (!lineupRows?.length) return;
    const rows = lineupRows.map((r) => ({
      team_id: teamId,
      shirt_number: int(r.shirt_number),
      player_name: str(r.player_name),
      position_role: str(r.position_role),
      pos_x: r.pos_x != null ? parseFloat(r.pos_x) : 50,
      pos_y: r.pos_y != null ? parseFloat(r.pos_y) : 50,
      player_id: uuid(r.player_id),
    }));
    const { error: insErr } = await supabase.from('historical_team_lineup').insert(rows);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  TEAM TITLES
  // ══════════════════════════════════════════════════════════════════════════
  const getTeamTitles = async (teamId) => {
    const { data, error } = await supabase
      .from('historical_team_titles')
      .select('*, historical_competitions(id, name)')
      .eq('team_id', teamId)
      .order('year');
    if (error) throw error;
    return data || [];
  };

  const setTeamTitles = async (teamId, titleRows) => {
    const { error: delErr } = await supabase
      .from('historical_team_titles')
      .delete()
      .eq('team_id', teamId);
    if (delErr) throw delErr;
    if (titleRows?.length) {
      const rows = titleRows.map((r) => ({
        team_id: teamId,
        title_name: str(r.title_name),
        year: str(r.year),
        competition_id: uuid(r.competition_id),
      }));
      const { error: insErr } = await supabase.from('historical_team_titles').insert(rows);
      if (insErr) throw insErr;
    }
    const count = titleRows?.length ?? 0;
    const { data: updatedTeam, error: updErr } = await supabase
      .from('historical_teams')
      .update({ titles_count: count })
      .eq('id', teamId)
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
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, 'competitions');
    const admin_id = await getAdminId();
    const payload = { ...cleanCompetition(formData), image_path, admin_id };
    const { data, error } = await supabase
      .from('historical_competitions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setCompetitions((prev) => [data, ...prev]);
    return data;
  };

  const updateCompetition = async (id, formData, imageFile) => {
    let payload = { ...cleanCompetition(formData) };
    if (imageFile) {
      const old = competitions.find((c) => c.id === id);
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      payload.image_path = await uploadHistoricalImage(imageFile, 'competitions');
    }
    const { data, error } = await supabase
      .from('historical_competitions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setCompetitions((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  };

  const deleteCompetition = async (id) => {
    const old = competitions.find((c) => c.id === id);
    if (old?.image_path) await deleteHistoricalImage(old.image_path);
    const { error } = await supabase.from('historical_competitions').delete().eq('id', id);
    if (error) throw error;
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCompetitionPublished = async (id, current) => {
    const { data, error } = await supabase
      .from('historical_competitions')
      .update({ is_published: !current })
      .eq('id', id)
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
    if (imageFile) image_path = await uploadHistoricalImage(imageFile, 'events');
    if (bannerFile) banner_image_path = await uploadHistoricalImage(bannerFile, 'events/banners');
    const admin_id = await getAdminId();
    const payload = { ...cleanEvent(formData), image_path, banner_image_path, admin_id };
    const { data, error } = await supabase
      .from('historical_events')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setEvents((prev) => [data, ...prev]);
    return data;
  };

  const updateEvent = async (id, formData, imageFile, bannerFile) => {
    const old = events.find((e) => e.id === id);
    let payload = { ...cleanEvent(formData) };
    if (imageFile) {
      if (old?.image_path) await deleteHistoricalImage(old.image_path);
      payload.image_path = await uploadHistoricalImage(imageFile, 'events');
    }
    if (bannerFile) {
      if (old?.banner_image_path) await deleteHistoricalImage(old.banner_image_path);
      payload.banner_image_path = await uploadHistoricalImage(bannerFile, 'events/banners');
    }
    const { data, error } = await supabase
      .from('historical_events')
      .update(payload)
      .eq('id', id)
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
    const { error } = await supabase.from('historical_events').delete().eq('id', id);
    if (error) throw error;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleEventPublished = async (id, current) => {
    const { data, error } = await supabase
      .from('historical_events')
      .update({ is_published: !current })
      .eq('id', id)
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
      .from('historical_player_teams')
      .select('*, historical_teams(*)')
      .eq('player_id', playerId);
    if (error) throw error;
    return data || [];
  };

  const setPlayerTeams = async (playerId, teamLinks) => {
    await supabase.from('historical_player_teams').delete().eq('player_id', playerId);
    if (!teamLinks?.length) return;
    const rows = teamLinks
      .filter((t) => uuid(t.team_id)) // descartar filas sin team_id válido
      .map((t) => ({
        player_id: playerId,
        team_id: uuid(t.team_id),
        start_year: int(t.start_year),
        end_year: int(t.end_year),
        roles: str(t.roles),
      }));
    if (!rows.length) return;
    const { error } = await supabase.from('historical_player_teams').insert(rows);
    if (error) throw error;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  RELACIONES — eventos ↔ jugadores / equipos / competencias
  // ══════════════════════════════════════════════════════════════════════════
  const getEventRelations = async (eventId) => {
    const [pRes, tRes, cRes] = await Promise.all([
      supabase.from('historical_player_events')
        .select('*, historical_players(id, name)').eq('event_id', eventId),
      supabase.from('historical_event_teams')
        .select('*, historical_teams(id, name)').eq('event_id', eventId),
      supabase.from('historical_event_competitions')
        .select('*, historical_competitions(id, name)').eq('event_id', eventId),
    ]);
    return {
      players: pRes.data || [],
      teams: tRes.data || [],
      competitions: cRes.data || [],
    };
  };

  const setEventRelations = async (eventId, { playerIds, teamIds, competitionIds }) => {
    await Promise.all([
      supabase.from('historical_player_events').delete().eq('event_id', eventId),
      supabase.from('historical_event_teams').delete().eq('event_id', eventId),
      supabase.from('historical_event_competitions').delete().eq('event_id', eventId),
    ]);
    const inserts = [];
    const validPlayers = (playerIds || []).filter(uuid);
    const validTeams = (teamIds || []).filter(uuid);
    const validComps = (competitionIds || []).filter(uuid);
    if (validPlayers.length)
      inserts.push(supabase.from('historical_player_events')
        .insert(validPlayers.map((id) => ({ event_id: eventId, player_id: id }))));
    if (validTeams.length)
      inserts.push(supabase.from('historical_event_teams')
        .insert(validTeams.map((id) => ({ event_id: eventId, team_id: id }))));
    if (validComps.length)
      inserts.push(supabase.from('historical_event_competitions')
        .insert(validComps.map((id) => ({ event_id: eventId, competition_id: id }))));
    await Promise.all(inserts);
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION GROUPS
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionGroups = async (competitionId) => {
    const { data, error } = await supabase
      .from('historical_competition_groups')
      .select('*')
      .eq('competition_id', competitionId)
      .order('group_name')
      .order('sort_order');
    if (error) throw error;
    return data || [];
  };

  const setCompetitionGroups = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_competition_groups').delete().eq('competition_id', competitionId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      group_name: str(r.group_name) || 'Grupo A',
      team_name: str(r.team_name) || '',
      team_id: uuid(r.team_id),
      position: int(r.position),
      points: int(r.points) ?? 0,
      wins: int(r.wins) ?? 0,
      draws: int(r.draws) ?? 0,
      losses: int(r.losses) ?? 0,
      goals_for: int(r.goals_for) ?? 0,
      goals_against: int(r.goals_against) ?? 0,
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase
      .from('historical_competition_groups').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION STANDINGS
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionStandings = async (competitionId) => {
    const { data, error } = await supabase
      .from('historical_competition_standings')
      .select('*')
      .eq('competition_id', competitionId)
      .order('position');
    if (error) throw error;
    return data || [];
  };

  const setCompetitionStandings = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_competition_standings').delete().eq('competition_id', competitionId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      position: int(r.position) ?? idx + 1,
      team_name: str(r.team_name) || '',
      team_id: uuid(r.team_id),
      points: int(r.points) ?? 0,
      wins: int(r.wins) ?? 0,
      draws: int(r.draws) ?? 0,
      losses: int(r.losses) ?? 0,
      goals_for: int(r.goals_for) ?? 0,
      goals_against: int(r.goals_against) ?? 0,
      champion: bool(r.champion),
    }));
    const { error: insErr } = await supabase
      .from('historical_competition_standings').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  COMPETITION KNOCKOUT
  // ══════════════════════════════════════════════════════════════════════════
  const getCompetitionKnockout = async (competitionId) => {
    const { data, error } = await supabase
      .from('historical_competition_knockout')
      .select('*')
      .eq('competition_id', competitionId)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  };

  const setCompetitionKnockout = async (competitionId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_competition_knockout').delete().eq('competition_id', competitionId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      competition_id: competitionId,
      round: str(r.round) || 'Final',
      match_number: int(r.match_number) ?? 1,
      team_a: str(r.team_a) || '',
      team_b: str(r.team_b) || '',
      team_a_id: uuid(r.team_a_id),
      team_b_id: uuid(r.team_b_id),
      score_a: int(r.score_a),
      score_b: int(r.score_b),
      agg_a: int(r.agg_a),
      agg_b: int(r.agg_b),
      penalties_a: int(r.penalties_a),
      penalties_b: int(r.penalties_b),
      winner: str(r.winner),
      notes: str(r.notes),
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase
      .from('historical_competition_knockout').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT LINEUPS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventLineups = async (eventId) => {
    const { data, error } = await supabase
      .from('historical_event_lineups')
      .select('*')
      .eq('event_id', eventId)
      .order('team_side')
      .order('sort_order');
    if (error) throw error;
    return data || [];
  };

  const setEventLineups = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_event_lineups').delete().eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      team_side: str(r.team_side) || 'team_a',
      team_name: str(r.team_name) || '',
      team_id: uuid(r.team_id),
      shirt_number: int(r.shirt_number),
      player_name: str(r.player_name) || '',
      position_role: str(r.position_role),
      is_protagonist: bool(r.is_protagonist),
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase
      .from('historical_event_lineups').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT SQUAD
  // ══════════════════════════════════════════════════════════════════════════
  const getEventSquad = async (eventId) => {
    const { data, error } = await supabase
      .from('historical_event_squad')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  };

  const setEventSquad = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_event_squad').delete().eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      player_name: str(r.player_name) || '',
      player_id: uuid(r.player_id),
      shirt_number: int(r.shirt_number),
      position_role: str(r.position_role),
      is_key_player: bool(r.is_key_player),
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase
      .from('historical_event_squad').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT STANDINGS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventStandings = async (eventId) => {
    const { data, error } = await supabase
      .from('historical_event_standings')
      .select('*')
      .eq('event_id', eventId)
      .order('position');
    if (error) throw error;
    return data || [];
  };

  const setEventStandings = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_event_standings').delete().eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      position: int(r.position) ?? idx + 1,
      team_name: str(r.team_name) || '',
      team_id: uuid(r.team_id),
      points: int(r.points),
      wins: int(r.wins),
      draws: int(r.draws),
      losses: int(r.losses),
      goals_for: int(r.goals_for),
      goals_against: int(r.goals_against),
      is_champion: bool(r.is_champion),
    }));
    const { error: insErr } = await supabase
      .from('historical_event_standings').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT KNOCKOUT
  // ══════════════════════════════════════════════════════════════════════════
  const getEventKnockout = async (eventId) => {
    const { data, error } = await supabase
      .from('historical_event_knockout')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  };

  const setEventKnockout = async (eventId, rows) => {
    const { error: delErr } = await supabase
      .from('historical_event_knockout').delete().eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;
    const toInsert = rows.map((r, idx) => ({
      event_id: eventId,
      round: str(r.round) || 'Final',
      match_number: int(r.match_number) ?? 1,
      team_a: str(r.team_a) || '',
      team_b: str(r.team_b) || '',
      score_a: int(r.score_a),
      score_b: int(r.score_b),
      winner: str(r.winner),
      is_decisive: bool(r.is_decisive),
      sort_order: int(r.sort_order) ?? idx,
    }));
    const { error: insErr } = await supabase
      .from('historical_event_knockout').insert(toInsert);
    if (insErr) throw insErr;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT MOMENTS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventMomentsHook = async (eventId) => {
    return await getEventMoments(eventId);
  };

  const setEventMomentsHook = async (eventId, rows) => {
    const cleaned = (rows || []).map((r, idx) => ({
      minute: r.minute !== '' && r.minute != null ? int(r.minute) : null,
      moment_date: str(r.moment_date),
      title: str(r.title) || '',
      description: str(r.description),
      icon: str(r.icon),
      sort_order: int(r.sort_order) ?? idx,
    }));
    await setEventMomentsService(eventId, cleaned);
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENT PROTAGONISTS
  // ══════════════════════════════════════════════════════════════════════════
  const getEventProtagonistsHook = async (eventId) => {
    return await getEventProtagonists(eventId);
  };

  const setEventProtagonistsHook = async (eventId, rows) => {
    const cleaned = (rows || []).map((r, idx) => ({
      player_id: uuid(r.player_id),
      team_id: uuid(r.team_id),
      name_override: str(r.name_override),
      role_label: str(r.role_label),
      icon: str(r.icon),
      sort_order: int(r.sort_order) ?? idx,
    }));
    await setEventProtagonistsService(eventId, cleaned);
  };

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    players, teams, competitions, events, users,
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
    getEventMoments: getEventMomentsHook,
    setEventMoments: setEventMomentsHook,
    getEventProtagonists: getEventProtagonistsHook,
    setEventProtagonists: setEventProtagonistsHook,
  };
}