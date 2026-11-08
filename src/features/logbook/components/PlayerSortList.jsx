import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import '../styles/PlayerCard.css';
import '../styles/PlayerSort.css';

const COUNTERS = [
  { key: 'goals', label: 'GOL' },
  { key: 'assists', label: 'ASI' },
  { key: 'mvp', label: 'MVP' },
];

function SortRow({ player, onDragEnd, onMove }) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    onMove(player.id, event.key === 'ArrowUp' ? -1 : 1);
  };

  return (
    <Reorder.Item
      as="div"
      value={player.id}
      dragListener={false}
      dragControls={controls}
      className={`lg-player lg-sort__item${dragging ? ' lg-sort__item--drag' : ''}`}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false);
        onDragEnd();
      }}
    >
      <div className="lg-player__head lg-sort__row">
        <button
          type="button"
          className="lg-sort__handle"
          onPointerDown={(event) => controls.start(event)}
          onKeyDown={handleKeyDown}
          aria-label={`Mover a ${player.name}. Usa las flechas arriba y abajo`}
        >
          <GripVertical size={18} strokeWidth={3} aria-hidden="true" />
        </button>
        <span className="lg-player__info">
          <span className="lg-player__name">{player.name}</span>
          <span className="lg-player__position">{player.position}</span>
        </span>
        <span className="lg-player__stats">
          {COUNTERS.map(({ key, label }) => (
            <span key={key} className="lg-player__stat">
              <span className="lg-player__stat-label">{label}</span>
              <span className="lg-player__stat-value">{player[key]}</span>
            </span>
          ))}
        </span>
      </div>
    </Reorder.Item>
  );
}

export default function PlayerSortList({ players, onReorder }) {
  const [ids, setIds] = useState(() => players.map((player) => player.id));
  const idsRef = useRef(ids);
  const byId = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);

  useEffect(() => {
    const next = players.map((player) => player.id);
    idsRef.current = next;
    setIds(next);
  }, [players]);

  const update = (next) => {
    idsRef.current = next;
    setIds(next);
  };

  const commit = (next = idsRef.current) => {
    if (next.some((id, index) => id !== players[index]?.id)) onReorder(next);
  };

  const handleMove = (id, step) => {
    const from = idsRef.current.indexOf(id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= idsRef.current.length) return;
    const next = [...idsRef.current];
    next.splice(to, 0, next.splice(from, 1)[0]);
    update(next);
    commit(next);
  };

  return (
    <Reorder.Group as="div" axis="y" values={ids} onReorder={update} className="lg-sort">
      {ids.map((id) => {
        const player = byId.get(id);
        return player ? (
          <SortRow key={id} player={player} onDragEnd={() => commit()} onMove={handleMove} />
        ) : null;
      })}
    </Reorder.Group>
  );
}
