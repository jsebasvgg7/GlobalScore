import { Plus } from 'lucide-react';

export default function RoomSplitButton({ prefix, onRooms, onNewRoom }) {
  return (
    <div className={`${prefix}-split`}>
      <button type="button" className={`${prefix}-split__main`} onClick={onRooms}>
        Salas
      </button>
      <button
        type="button"
        className={`${prefix}-split__add`}
        onClick={onNewRoom}
        aria-label="Crear o unirme a una sala"
        title="Crear o unirme a una sala"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
