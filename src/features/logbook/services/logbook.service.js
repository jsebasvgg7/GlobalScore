import { supabase } from '@/shared/services/supabase/client';

const TEAM_SELECT = '*, libreta_players(*)';

const TEAM_COLUMNS = {
  name: 'name',
  game: 'game',
  formation: 'formation',
  wins: 'gan',
  draws: 'emp',
  losses: 'per',
  goalsAgainst: 'gc',
  opponentOwnGoals: 'rival',
  archivedGoals: 'archived',
};

const PLAYER_COLUMNS = {
  name: 'name',
  position: 'pos',
  goals: 'g',
  assists: 'a',
  mvp: 'mvp',
};

function toRow(values, columns) {
  return Object.keys(values).reduce((row, key) => {
    if (columns[key] !== undefined) row[columns[key]] = values[key];
    return row;
  }, {});
}

function fromPlayerRow(row) {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    position: row.pos,
    goals: row.g,
    assists: row.a,
    mvp: row.mvp,
    createdAt: row.created_at,
  };
}

export function fromTeamRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    game: row.game,
    formation: row.formation,
    wins: row.gan,
    draws: row.emp,
    losses: row.per,
    goalsAgainst: row.gc,
    opponentOwnGoals: row.rival,
    archivedGoals: row.archived,
    createdAt: row.created_at,
    players: (row.libreta_players ?? [])
      .map(fromPlayerRow)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function fetchTeams(userId) {
  const { data, error } = await supabase
    .from('libreta_teams')
    .select(TEAM_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(fromTeamRow);
}

export async function createTeam(userId, values = {}) {
  const { data, error } = await supabase
    .from('libreta_teams')
    .insert({ user_id: userId, ...toRow(values, TEAM_COLUMNS) })
    .select(TEAM_SELECT)
    .single();

  if (error) throw error;
  return fromTeamRow(data);
}

export async function updateTeam(teamId, values) {
  const { error } = await supabase
    .from('libreta_teams')
    .update(toRow(values, TEAM_COLUMNS))
    .eq('id', teamId);

  if (error) throw error;
}

export async function deleteTeam(teamId) {
  const { error } = await supabase.from('libreta_teams').delete().eq('id', teamId);

  if (error) throw error;
}

export async function addPlayer(teamId, values) {
  const { data, error } = await supabase
    .from('libreta_players')
    .insert({ team_id: teamId, ...toRow(values, PLAYER_COLUMNS) })
    .select()
    .single();

  if (error) throw error;
  return fromPlayerRow(data);
}

export async function updatePlayer(playerId, values) {
  const { error } = await supabase
    .from('libreta_players')
    .update(toRow(values, PLAYER_COLUMNS))
    .eq('id', playerId);

  if (error) throw error;
}

export async function deletePlayer(playerId) {
  const { error } = await supabase.rpc('libreta_delete_player', { p_player_id: playerId });

  if (error) throw error;
}

export async function importTeams(teams) {
  const payload = teams.map(({ players, ...values }) => ({
    ...toRow(values, TEAM_COLUMNS),
    players: players.map((player) => toRow(player, PLAYER_COLUMNS)),
  }));

  const { error } = await supabase.rpc('libreta_import', { p_teams: payload });

  if (error) throw error;
}
