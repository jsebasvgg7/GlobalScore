import { supabase } from '@/shared/services/supabase/client';
import { fromTeamRow } from './logbook.service';

function fromMemberRow(row) {
  return {
    userId: row.user_id,
    userName: row.user_name,
    team: row.team ? fromTeamRow(row.team) : null,
  };
}

function fromRoomRow(row) {
  return {
    id: row.id,
    code: row.code,
    fromZero: row.from_zero,
    status: row.status,
    createdBy: row.created_by,
    winnerUserId: row.winner_user_id,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    members: (row.members ?? []).map(fromMemberRow),
  };
}

function fromRoomSummaryRow(row) {
  return {
    id: row.id,
    code: row.code,
    fromZero: row.from_zero,
    status: row.status,
    createdAt: row.created_at,
    winnerUserId: row.winner_user_id,
    myTeamName: row.my_team_name,
    rivalName: row.rival_name,
  };
}

async function call(name, args) {
  const { data, error } = await supabase.rpc(name, args);

  if (error) throw error;
  return data;
}

export async function createRoom(teamId, fromZero = false) {
  const data = await call('libreta_room_create', { p_team_id: teamId, p_from_zero: fromZero });
  return { roomId: data.room_id, code: data.code };
}

export async function joinRoom(code, teamId) {
  const data = await call('libreta_room_join', { p_code: code, p_team_id: teamId });
  return { roomId: data.room_id };
}

export async function getRoom(roomId) {
  const data = await call('libreta_room_get', { p_room_id: roomId });
  return fromRoomRow(data);
}

export async function listRooms() {
  const data = await call('libreta_room_list');
  return (data ?? []).map(fromRoomSummaryRow);
}

export async function cancelRoom(roomId) {
  await call('libreta_room_cancel', { p_room_id: roomId });
}
