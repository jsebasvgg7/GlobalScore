import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Plus, Pin, Trash2, Search,
  Lock, Clock, FileText, PinOff, Save, X, Check, AlertTriangle
} from 'lucide-react';
import { useNotes } from '../../hooks/useNotes';
import './MobileNotes.css';

// ── Colores ──────────────────────────────────────────────────────
const COLORS = {
  purple: { label: 'Morado', hex: '#5b4fd8' },
  green: { label: 'Verde', hex: '#1D9E75' },
  gold: { label: 'Dorado', hex: '#c9a227' },
  red: { label: 'Rojo', hex: '#E24B4A' },
  blue: { label: 'Azul', hex: '#378ADD' },
  gray: { label: 'Gris', hex: '#8186a0' },
};

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// ── Modal de confirmación borrado ────────────────────────────────
function DeleteModal({ note, onConfirm, onCancel }) {
  return (
    <div className="mn-modal-backdrop" onClick={onCancel}>
      <div className="mn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mn-modal-icon"><AlertTriangle size={24} /></div>
        <div className="mn-modal-title">Eliminar nota</div>
        <div className="mn-modal-desc">
          «{note?.title || 'Sin título'}» se eliminará definitivamente.
        </div>
        <div className="mn-modal-actions">
          <button className="mn-modal-cancel" onClick={onCancel}>Cancelar</button>
          <button className="mn-modal-confirm" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Vista: Lista de notas ────────────────────────────────────────
function NotesList({ notes, loading, onSelect, onNew, search, setSearch }) {
  const pinned = notes.filter((n) => n.is_pinned);
  const unpinned = notes.filter((n) => !n.is_pinned);

  return (
    <div className="mn-list-view">
      {/* Header */}
      <div className="mn-list-header">
        <div className="mn-list-title-row">
          <div className="mn-header-icon">
            <Lock size={13} />
          </div>
          <div className="mn-header-text">
            <span className="mn-list-title">Mis notas</span>
            <span className="mn-header-sub">Cifradas · AES-256</span>
          </div>
        </div>
        <div className="mn-header-actions">
          <span className="mn-list-count">{notes.length}</span>
          <button className="mn-new-btn" onClick={onNew}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mn-search-row">
        <Search size={12} className="mn-search-icon" />
        <input
          className="mn-search-input"
          placeholder="Buscar en notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="mn-search-clear" onClick={() => setSearch('')}>
            <X size={11} />
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="mn-list-body">
        {loading ? (
          <div className="mn-list-loading">
            {[1, 2, 3, 4].map((i) => <div key={i} className="mn-sk-card" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="mn-list-empty">
            <FileText size={36} />
            <p>Sin notas aún</p>
            <span>Toca el + para crear una nota</span>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="mn-group-label"><Pin size={9} /> FIJADAS</div>
                {pinned.map((n) => <NoteCard key={n.id} note={n} onSelect={onSelect} />)}
              </>
            )}
            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && <div className="mn-group-label">TODAS</div>}
                {unpinned.map((n) => <NoteCard key={n.id} note={n} onSelect={onSelect} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de nota en la lista ──────────────────────────────────
function NoteCard({ note, onSelect }) {
  const c = COLORS[note.color] || COLORS.purple;
  const preview = note.content?.split('\n')[0]?.slice(0, 60) || 'Sin contenido';
  return (
    <button className="mn-note-card" onClick={() => onSelect(note)}>
      <div className="mn-nc-accent" style={{ background: c.hex }} />
      <div className="mn-nc-body">
        <div className="mn-nc-top">
          <span className="mn-nc-title">{note.title || 'Sin título'}</span>
          {note.is_pinned && <Pin size={10} style={{ color: '#c9a227', flexShrink: 0 }} />}
        </div>
        <span className="mn-nc-preview">{preview}</span>
        <span className="mn-nc-date">
          <Clock size={9} /> {fmtDate(note.updated_at)}
        </span>
      </div>
    </button>
  );
}

// ── Vista: Editor ────────────────────────────────────────────────
function NoteEditor({ note, onBack, onUpdate, onDelete, onTogglePin, saving }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'purple');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const saveTimer = useRef(null);
  const contentRef = useRef(null);

  // Sincronizar cuando cambia la nota activa
  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setColor(note?.color || 'purple');
    setDirty(false);
    setSaved(false);
  }, [note?.id]);

  // Auto-guardado
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(handleSave, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [title, content, color, dirty]); // eslint-disable-line

  const handleSave = useCallback(async () => {
    if (!note) return;
    const ok = await onUpdate(note.id, { title, content, color });
    if (ok) { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }, [note, title, content, color, onUpdate]);

  const handleBack = () => {
    if (dirty) handleSave();
    onBack();
  };

  const handleDeleteConfirm = async () => {
    await onDelete(note.id);
    setShowDel(false);
    onBack();
  };

  const c = COLORS[color] || COLORS.purple;

  return (
    <div className="mn-editor-view">
      {/* Header */}
      <div className="mn-editor-header" style={{ '--eh-color': c.hex }}>
        <button className="mn-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
        </button>

        {/* Status */}
        <div className="mn-editor-status">
          {saving && <span className="mn-st mn-st--saving">Guardando…</span>}
          {saved && !saving && <span className="mn-st mn-st--saved"><Check size={9} /> Guardado</span>}
          {dirty && !saving && !saved && <span className="mn-st mn-st--dirty">Sin guardar</span>}
        </div>

        {/* Acciones */}
        <div className="mn-editor-actions">
          <button
            className="mn-action-btn"
            onClick={() => setShowColors((v) => !v)}
            style={{ color: c.hex }}
            title="Color"
          >
            <div className="mn-color-dot-btn" style={{ background: c.hex }} />
          </button>
          <button
            className={`mn-action-btn${note?.is_pinned ? ' mn-action-btn--gold' : ''}`}
            onClick={() => onTogglePin(note.id)}
            title={note?.is_pinned ? 'Desfijar' : 'Fijar'}
          >
            {note?.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
          <button
            className="mn-action-btn mn-action-btn--danger"
            onClick={() => setShowDel(true)}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Barra de color seleccionado */}
      <div className="mn-editor-color-bar" style={{ background: c.hex }} />

      {/* Selector de colores (desplegable) */}
      {showColors && (
        <div className="mn-color-picker">
          {Object.entries(COLORS).map(([key, val]) => (
            <button
              key={key}
              className={`mn-cp-dot${color === key ? ' mn-cp-dot--active' : ''}`}
              style={{ '--cp-color': val.hex }}
              onClick={() => { setColor(key); setDirty(true); setShowColors(false); }}
            />
          ))}
        </div>
      )}

      {/* Título */}
      <input
        className="mn-title-input"
        placeholder="Título…"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); contentRef.current?.focus(); } }}
      />

      {/* Contenido */}
      <textarea
        ref={contentRef}
        className="mn-content-textarea"
        placeholder="Escribe aquí…&#10;&#10;Cifrado con AES-256. Solo tú puedes leer esto."
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); }}
      />

      {/* Footer info */}
      <div className="mn-editor-footer">
        <Lock size={9} className="mn-footer-lock" />
        <span>AES-256-CBC · {content.trim() ? content.trim().split(/\s+/).length : 0} palabras</span>
      </div>

      {/* Modal borrado */}
      {showDel && (
        <DeleteModal
          note={{ ...note, title }}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function MobileNotes({ currentUser, onBack }) {
  const { notes, loading, saving, createNote, updateNote, deleteNote, togglePin } = useNotes(currentUser);

  const [view, setView] = useState('list');   // 'list' | 'editor'
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');

  // Ocultar header del sistema mientras estamos en notas
  useEffect(() => {
    const header = document.querySelector('.gs-mobile-header');
    if (header) header.style.display = 'none';
    return () => { if (header) header.style.display = ''; };
  }, []);

  // Filtrar
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  // Mantener activeNote actualizado tras operaciones
  useEffect(() => {
    if (activeNote) {
      const updated = notes.find((n) => n.id === activeNote.id);
      if (updated) setActiveNote(updated);
    }
  }, [notes]); // eslint-disable-line

  const handleSelect = (note) => {
    setActiveNote(note);
    setView('editor');
  };

  const handleNew = async () => {
    const n = await createNote({ title: '', content: '', color: 'purple' });
    if (n) {
      setActiveNote(n);
      setView('editor');
    }
  };

  const handleBack = () => {
    setView('list');
    setActiveNote(null);
  };

  return (
    <div className="mn-root">
      {view === 'list' ? (
        <>
          {/* Botón volver al perfil/ajustes */}
          <div className="mn-top-back">
            <button className="mn-top-back-btn" onClick={onBack}>
              <ArrowLeft size={16} /> Ajustes
            </button>
          </div>
          <NotesList
            notes={filtered}
            loading={loading}
            onSelect={handleSelect}
            onNew={handleNew}
            search={search}
            setSearch={setSearch}
          />
        </>
      ) : (
        <NoteEditor
          note={activeNote}
          onBack={handleBack}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          saving={saving}
        />
      )}
    </div>
  );
}