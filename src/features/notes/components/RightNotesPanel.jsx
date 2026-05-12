import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Pin, Trash2, Search, Lock, Clock,
  FileText, PinOff, Save, X, Check, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import '../../styles/StylesPanels/RightNotesPanel.css';

// ── Colores ──────────────────────────────────────────────────────
const COLORS = {
  purple: { label: 'Morado', hex: '#8b7fc7' },
  green: { label: 'Verde', hex: '#1D9E75' },
  gold: { label: 'Dorado', hex: '#c9a227' },
  red: { label: 'Rojo', hex: '#e07070' },
  blue: { label: 'Azul', hex: '#60a5fa' },
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

// ── Modal borrado ─────────────────────────────────────────────────
function DeleteModal({ note, onConfirm, onCancel }) {
  return (
    <div className="rnp-modal-backdrop" onClick={onCancel}>
      <div className="rnp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rnp-modal-icon"><AlertTriangle size={24} /></div>
        <div className="rnp-modal-title">Eliminar nota</div>
        <div className="rnp-modal-desc">
          «{note?.title || 'Sin título'}» se eliminará definitivamente.
        </div>
        <div className="rnp-modal-actions">
          <button className="rnp-modal-cancel" onClick={onCancel}>Cancelar</button>
          <button className="rnp-modal-confirm" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de nota ───────────────────────────────────────────────
function NoteCard({ note, active, onSelect }) {
  const c = COLORS[note.color] || COLORS.purple;
  const preview = note.content?.split('\n')[0]?.slice(0, 55) || 'Sin contenido';
  return (
    <button
      className={`rnp-note-card${active ? ' rnp-note-card--active' : ''}`}
      onClick={() => onSelect(note)}
      style={{ '--nc': c.hex }}
    >
      <div className="rnp-nc-accent" style={{ background: c.hex }} />
      <div className="rnp-nc-body">
        <div className="rnp-nc-top">
          <span className="rnp-nc-title">{note.title || 'Sin título'}</span>
          {note.is_pinned && <Pin size={10} style={{ color: '#c9a227', flexShrink: 0 }} />}
        </div>
        <span className="rnp-nc-preview">{preview}</span>
        <span className="rnp-nc-date">
          <Clock size={9} /> {fmtDate(note.updated_at)}
        </span>
      </div>
    </button>
  );
}

// ── Vista: Lista ──────────────────────────────────────────────────
function NotesList({ notes, loading, activeId, onSelect, onNew, search, setSearch }) {
  const pinned = notes.filter((n) => n.is_pinned);
  const unpinned = notes.filter((n) => !n.is_pinned);

  return (
    <div className="rnp-list-view">
      {/* Header */}
      <div className="rnp-list-header">
        <div className="rnp-list-title-row">
          <Lock size={10} className="rnp-lock" />
          <span className="rnp-list-title">MIS NOTAS</span>
          <span className="rnp-list-count">{notes.length}</span>
        </div>
        <button className="rnp-new-btn" onClick={onNew} title="Nueva nota">
          <Plus size={15} />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="rnp-search-row">
        <Search size={11} className="rnp-search-icon" />
        <input
          className="rnp-search-input"
          placeholder="Buscar en notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="rnp-search-clear" onClick={() => setSearch('')}>
            <X size={10} />
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="rnp-list-body">
        {loading ? (
          <div className="rnp-list-loading">
            {[1, 2, 3, 4].map((i) => <div key={i} className="rnp-sk-card" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="rnp-list-empty">
            <FileText size={32} />
            <p>Sin notas aún</p>
            <span>Crea tu primera nota</span>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div className="rnp-group-label"><Pin size={8} /> FIJADAS</div>
                {pinned.map((n) => (
                  <NoteCard key={n.id} note={n} active={n.id === activeId} onSelect={onSelect} />
                ))}
              </>
            )}
            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && <div className="rnp-group-label">TODAS</div>}
                {unpinned.map((n) => (
                  <NoteCard key={n.id} note={n} active={n.id === activeId} onSelect={onSelect} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Vista: Editor ─────────────────────────────────────────────────
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

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setColor(note?.color || 'purple');
    setDirty(false);
    setSaved(false);
  }, [note?.id]);

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
    <div className="rnp-editor-view">
      {/* Header editor */}
      <div className="rnp-editor-header">
        <button className="rnp-back-btn" onClick={handleBack} title="Volver a lista">
          <ArrowLeft size={16} />
        </button>

        <div className="rnp-editor-status">
          {saving && <span className="rnp-st rnp-st--saving">Guardando…</span>}
          {saved && !saving && <span className="rnp-st rnp-st--saved"><Check size={9} /> Guardado</span>}
          {dirty && !saving && !saved && <span className="rnp-st rnp-st--dirty">Sin guardar</span>}
        </div>

        <div className="rnp-editor-actions">
          <button
            className="rnp-action-btn"
            onClick={() => setShowColors((v) => !v)}
            title="Color"
          >
            <div className="rnp-color-dot-btn" style={{ background: c.hex }} />
          </button>
          <button
            className={`rnp-action-btn${note?.is_pinned ? ' rnp-action-btn--gold' : ''}`}
            onClick={() => onTogglePin(note.id)}
            title={note?.is_pinned ? 'Desfijar' : 'Fijar'}
          >
            {note?.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            className="rnp-action-btn rnp-action-btn--danger"
            onClick={() => setShowDel(true)}
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Barra de color */}
      <div className="rnp-editor-color-bar" style={{ background: c.hex }} />

      {/* Selector de colores */}
      {showColors && (
        <div className="rnp-color-picker">
          {Object.entries(COLORS).map(([key, val]) => (
            <button
              key={key}
              className={`rnp-cp-dot${color === key ? ' rnp-cp-dot--active' : ''}`}
              style={{ '--cp-color': val.hex }}
              onClick={() => { setColor(key); setDirty(true); setShowColors(false); }}
              title={val.label}
            />
          ))}
        </div>
      )}

      {/* Título */}
      <input
        className="rnp-title-input"
        placeholder="Título…"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); contentRef.current?.focus(); }
          if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
        }}
      />

      {/* Contenido */}
      <textarea
        ref={contentRef}
        className="rnp-content-textarea"
        placeholder={`Escribe aquí…\n\nCifrado con AES-256. Solo tú puedes leer esto.`}
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); }}
        onKeyDown={(e) => {
          if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
        }}
      />

      {/* Footer */}
      <div className="rnp-editor-footer">
        <Lock size={9} className="rnp-footer-lock" />
        <span>AES-256-CBC · {content.trim() ? content.trim().split(/\s+/).length : 0} palabras</span>
      </div>

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
export default function RightNotesPanel({ currentUser, onClose }) {
  const { notes, loading, saving, createNote, updateNote, deleteNote, togglePin } = useNotes(currentUser);

  const [view, setView] = useState('list');   // 'list' | 'editor'
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');

  // Filtrar por búsqueda
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
    <aside className="rnp-root">
      {/* Label superior — mismo patrón que otros paneles */}
      <div className="rnp-label">
        <span className="rnp-label-dot" />
        NOTAS CIFRADAS
        <span className="rnp-label-dot" />
      </div>

      {view === 'list' ? (
        <NotesList
          notes={filtered}
          loading={loading}
          activeId={activeNote?.id}
          onSelect={handleSelect}
          onNew={handleNew}
          search={search}
          setSearch={setSearch}
        />
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
    </aside>
  );
}