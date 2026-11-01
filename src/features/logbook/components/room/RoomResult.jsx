export default function RoomResult({ room, userId, me, rival }) {
  const points = room.finalPoints ?? {};
  const mine = points[userId];
  const theirs = rival ? points[rival.userId] : undefined;
  const score = mine !== undefined && theirs !== undefined ? `${mine} – ${theirs}` : null;

  let tone = 'tie';
  let text = 'Empate';
  if (room.winnerUserId) {
    const won = room.winnerUserId === userId;
    tone = won ? 'win' : 'lose';
    text = won ? 'Ganaste la sala' : `Ganó ${rival?.userName ?? 'tu rival'}`;
  }

  return (
    <div className={`lgr-result lgr-result--${tone}`} role="status">
      <span className="lgr-result__text">{text}</span>
      {score && <span className="lgr-result__score">{score}</span>}
      <span className="lgr-result__meta">
        {me?.team?.name ?? 'Tu equipo'} vs {rival?.team?.name ?? 'Rival'}
      </span>
    </div>
  );
}
