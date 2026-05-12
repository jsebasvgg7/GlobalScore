import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Pin, Trash2, Search, Lock, Clock,
  FileText, PinOff, Circle, Save, X, AlertTriangle
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import './NotesPage.css';

// ── Mapa de colores ──────────────────────────────────────────────
const COLORS = {
  purple: { label: 'Morado', hex: '#8b7fc7', bg: 'rgba(139,127,199,0.12)' },
  green: { label: 'Verde', hex: '#1D9E75', bg: 'rgba(29,158,117,0.12)' },
  gold: { label: 'Dorado', hex: '#c9a227', bg: 'rgba(201,162,39,0.12)' },
  red: { label: 'Rojo', hex: '#e07070', bg: 'rgba(224,112,112,0.12)' },
  blue: { label: 'Azul', hex: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  gray: { label: 'Gris', hex: '#8186a0', bg: 'rgba(129,134,160,0.12)' },
};

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function wordCount(text = '') {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Componente: item de la lista lateral ─────────────────────────
function NoteItem({ note, active, onClick }) {
  const c = COLORS[note.color] || COLORS.purple;
  const preview = note.content?.split('\n')[0]?.slice(0, 80) || 'Sin contenido';
  return (
    <button
      className={`np-note-item${active ? ' np-note-item--active' : ''}`}
      onClick={onClick}
      style={{ '--ni-color': c.hex }}
    >
      <div className="np-ni-accent" style={{ background: c.hex }} />
      <div className="np-ni-body">
        <div className="np-ni-top">
          <span className="np-ni-title">{note.title || 'Sin título'}</span>
          {note.is_pinned && <Pin size={10} className="np-ni-pin" />}
        </div>
        <span className="np-ni-preview">{preview}</span>
        <span className="np-ni-date">
          <Clock size={8} />
          {fmtDate(note.updated_at)}
        </span>
      </div>
    </button>
  );
}

// ── Componente: modal de confirmación de borrado ─────────────────
function DeleteModal({ note, onConfirm, onCancel }) {
  return (
    <div className="np-modal-backdrop" onClick={onCancel}>
      <div className="np-modal" onClick={(e) => e.stopPropagation()}>
        <div className="np-modal-icon"><AlertTriangle size={28} /></div>
        <h3 className="np-modal-title">Eliminar nota</h3>
        <p className="np-modal-desc">
          «{note?.title || 'Sin título'}» se eliminará permanentemente.<br />
          Esta acción no se puede deshacer.
        </p>
        <div className="np-modal-actions">
          <button className="np-modal-cancel" onClick={onCancel}>Cancelar</button>
          <button className="np-modal-confirm" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function NotesPage({ currentUser }) {
  const { notes, loading, saving, createNote, updateNote, deleteNote, togglePin } = useNotes(currentUser);

  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState('purple');
  const [dirty, setDirty] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saved, setSaved] = useState(false);

  const saveTimer = useRef(null);
  const contentRef = useRef(null);

  // Nota activa
  const activeNote = notes.find((n) => n.id === activeId) || null;

  // Filtrar por búsqueda
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));
  });

  const pinned = filtered.filter((n) => n.is_pinned);
  const unpinned = filtered.filter((n) => !n.is_pinned);

  // ── Abrir nota ────────────────────────────────────────────────
  const openNote = useCallback((note) => {
    if (dirty && activeId) handleSave(true);   // guardar antes de cambiar
    setActiveId(note.id);
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditColor(note.color || 'purple');
    setDirty(false);
    setSaved(false);
  }, [dirty, activeId]);                        // eslint-disable-line

  // Sincronizar editor si las notas cambian (p.ej. tras reload)
  useEffect(() => {
    if (!activeId) return;
    const n = notes.find((x) => x.id === activeId);
    if (n && !dirty) {
      setEditTitle(n.title || '');
      setEditContent(n.content || '');
      setEditColor(n.color || 'purple');
    }
  }, [notes]);                                  // eslint-disable-line

  // ── Auto-guardado con debounce 1.5s ──────────────────────────
  useEffect(() => {
    if (!dirty || !activeId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => handleSave(false), 1500);
    return () => clearTimeout(saveTimer.current);
  }, [editTitle, editContent, editColor, dirty]); // eslint-disable-line

  const handleSave = useCallback(async (silent = false) => {
    if (!activeId) return;
    await updateNote(activeId, {
      title: editTitle,
      content: editContent,
      color: editColor,
    });
    setDirty(false);
    if (!silent) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }, [activeId, editTitle, editContent, editColor, updateNote]);

  // ── Nueva nota ────────────────────────────────────────────────
  const handleNew = async () => {
    if (dirty && activeId) await handleSave(true);
    const n = await createNote({ title: '', content: '', color: 'purple' });
    if (n) {
      setActiveId(n.id);
      setEditTitle('');
      setEditContent('');
      setEditColor('purple');
      setDirty(false);
      setTimeout(() => contentRef.current?.focus(), 100);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteNote(deleteTarget.id);
    if (activeId === deleteTarget.id) {
      setActiveId(null);
      setEditTitle('');
      setEditContent('');
    }
    setDeleteTarget(null);
  };

  // ── Cambio de color en el editor ─────────────────────────────
  const handleColorChange = (color) => {
    setEditColor(color);
    setDirty(true);
  };

  const activeColor = COLORS[editColor] || COLORS.purple;

  return (
    <div className="notes-page">
      <div className="np-root">

        {/* ══ SIDEBAR — lista de notas ══ */}
        <aside className="np-sidebar">

          {/* Header sidebar */}
          <div className="np-sidebar-header">
            <div className="np-sidebar-title">
              <Lock size={12} className="np-lock-icon" />
              <span>NOTAS</span>
              <span className="np-notes-count">{notes.length}</span>
            </div>
            <button className="np-new-btn" onClick={handleNew} title="Nueva nota">
              <Plus size={14} />
            </button>
          </div>

          {/* Búsqueda */}
          <div className="np-search-wrap">
            <Search size={11} className="np-search-icon" />
            <input
              className="np-search-input"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="np-search-clear" onClick={() => setSearch('')}>
                <X size={10} />
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="np-note-list">
            {loading ? (
              <div className="np-list-loading">
                {[1, 2, 3].map((i) => <div key={i} className="np-sk-item" />)}
              </div>
            ) : notes.length === 0 ? (
              <div className="np-list-empty">
                <FileText size={28} />
                <p>Sin notas aún</p>
                <span>Crea tu primera nota</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="np-list-empty">
                <Search size={24} />
                <p>Sin resultados</p>
              </div>
            ) : (
              <>
                {pinned.length > 0 && (
                  <>
                    <div className="np-list-group-label">
                      <Pin size={9} /> FIJADAS
                    </div>
                    {pinned.map((n) => (
                      <NoteItem key={n.id} note={n} active={n.id === activeId} onClick={() => openNote(n)} />
                    ))}
                  </>
                )}
                {unpinned.length > 0 && (
                  <>
                    {pinned.length > 0 && (
                      <div className="np-list-group-label">TODAS</div>
                    )}
                    {unpinned.map((n) => (
                      <NoteItem key={n.id} note={n} active={n.id === activeId} onClick={() => openNote(n)} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </aside>

        {/* ══ EDITOR ══ */}
        <main className="np-editor">
          {!activeNote && !activeId ? (
            <div className="np-editor-empty">
              <Lock size={40} />
              <h2>Tus notas están cifradas</h2>
              <p>Solo tú puedes leer este contenido.<br />Selecciona una nota o crea una nueva.</p>
              <button className="np-editor-new-btn" onClick={handleNew}>
                <Plus size={14} /> Nueva nota
              </button>
            </div>
          ) : (
            <>
              {/* Barra de herramientas del editor */}
              <div className="np-editor-toolbar" style={{ '--ec': activeColor.hex }}>

                {/* Selector de color */}
                <div className="np-color-picker">
                  {Object.entries(COLORS).map(([key, val]) => (
                    <button
                      key={key}
                      className={`np-color-dot${editColor === key ? ' np-color-dot--active' : ''}`}
                      style={{ '--dc': val.hex }}
                      onClick={() => handleColorChange(key)}
                      title={val.label}
                    />
                  ))}
                </div>

                <div className="np-toolbar-right">
                  {/* Estado guardado */}
                  {saving && <span className="np-status np-status--saving">Guardando…</span>}
                  {saved && <span className="np-status np-status--saved"><Save size={10} /> Guardado</span>}
                  {dirty && !saving && <span className="np-status np-status--dirty">Sin guardar</span>}

                  {/* Botón guardar manual */}
                  <button
                    className="np-toolbar-btn np-toolbar-btn--save"
                    onClick={() => handleSave(false)}
                    disabled={saving || !dirty}
                    title="Guardar (Ctrl+S)"
                  >
                    <Save size={13} />
                  </button>

                  {/* Pin */}
                  <button
                    className={`np-toolbar-btn${activeNote?.is_pinned ? ' np-toolbar-btn--active' : ''}`}
                    onClick={() => togglePin(activeId)}
                    title={activeNote?.is_pinned ? 'Desfijar' : 'Fijar'}
                  >
                    {activeNote?.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  </button>

                  {/* Eliminar */}
                  <button
                    className="np-toolbar-btn np-toolbar-btn--danger"
                    onClick={() => setDeleteTarget(activeNote)}
                    title="Eliminar nota"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Línea de acento de color */}
              <div className="np-editor-color-bar" style={{ background: activeColor.hex }} />

              {/* Título */}
              <input
                className="np-title-input"
                placeholder="Título de la nota…"
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
                onKeyDown={(e) => {
                  if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(false); }
                  if (e.key === 'Enter') { e.preventDefault(); contentRef.current?.focus(); }
                }}
              />

              {/* Área de contenido */}
              <textarea
                ref={contentRef}
                className="np-content-area"
                placeholder="Escribe tu nota aquí…&#10;&#10;Tu contenido está cifrado con AES-256 y solo tú puedes leerlo."
                value={editContent}
                onChange={(e) => { setEditContent(e.target.value); setDirty(true); }}
                onKeyDown={(e) => {
                  if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(false); }
                }}
              />
            </>
          )}
        </main>

        {/* ══ PANEL INFO (derecha) ══ */}
        {activeNote && (
          <aside className="np-info-panel">
            <div className="np-info-header">
              <span className="np-info-label">// DETALLES</span>
            </div>

            {/* Cifrado */}
            <div className="np-info-block">
              <div className="np-info-block-label">CIFRADO</div>
              <div className="np-info-enc-badge">
                <Lock size={10} />
                <span>AES-256-CBC</span>
              </div>
              <p className="np-info-enc-desc">
                El contenido se cifra en tu dispositivo antes de enviarse.
                Nadie más puede leerlo.
              </p>
            </div>

            {/* Estadísticas */}
            <div className="np-info-block">
              <div className="np-info-block-label">ESTADÍSTICAS</div>
              <div className="np-info-stat">
                <span>Palabras</span>
                <span>{wordCount(editContent)}</span>
              </div>
              <div className="np-info-stat">
                <span>Caracteres</span>
                <span>{editContent.length}</span>
              </div>
              <div className="np-info-stat">
                <span>Líneas</span>
                <span>{editContent ? editContent.split('\n').length : 0}</span>
              </div>
            </div>

            {/* Fechas */}
            <div className="np-info-block">
              <div className="np-info-block-label">FECHAS</div>
              <div className="np-info-date">
                <span className="np-info-date-label">Creada</span>
                <span className="np-info-date-val">{fmtDate(activeNote.created_at)}</span>
              </div>
              <div className="np-info-date">
                <span className="np-info-date-label">Modificada</span>
                <span className="np-info-date-val">{fmtDate(activeNote.updated_at)}</span>
              </div>
            </div>

            {/* Color actual */}
            <div className="np-info-block">
              <div className="np-info-block-label">COLOR</div>
              <div className="np-info-color-row">
                <Circle size={12} fill={activeColor.hex} color={activeColor.hex} />
                <span style={{ color: activeColor.hex, fontWeight: 700 }}>
                  {activeColor.label}
                </span>
              </div>
            </div>
          </aside>
        )}

        {/* ══ MODAL BORRADO ══ */}
        {deleteTarget && (
          <DeleteModal
            note={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </div>
  );
}