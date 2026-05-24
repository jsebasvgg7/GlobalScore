import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, CheckCircle, X, Trophy, Target, Award, Shield,
  Package, Crown, Image, Home, Plane, Calendar, Clock,
  Zap, Star, Flame, AlertCircle, ChevronLeft, Trash2,
  Edit2, UserCheck, Search, ChevronUp, Settings
} from 'lucide-react';
import MatchForm from '../../forms/MatchForm';
import FinishMatchForm from '../../forms/FinishMatchForm';
import { LeagueForm, FinishLeagueForm } from '../../forms/LeagueForm';
import { AwardForm, FinishAwardForm } from '../../forms/AwardForm';
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect, getLogoUrlByLeagueName, getLogoUrlByAwardName } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

const MBA_STYLES = {
  form: 'mba-form', row2: 'mba-row-2', field: 'mba-field',
  label: 'mba-label', req: 'mba-req', hint: 'mba-hint', input: 'mba-input',
  toggle: 'mba-toggle-row', toggleCheck: 'mba-toggle-check',
  toggleTrack: 'mba-toggle-track', toggleThumb: 'mba-toggle-thumb',
  toggleLabel: 'mba-toggle-label', toggleSub: 'mba-toggle-sub',
  sectionSep: 'mba-sep-label',
  logoPreview: 'mba-logo-preview', logoItem: 'mba-logo-item',
  logoImg: 'mba-logo-img', logoEmoji: '', logoVs: 'mba-vs',
  submitBtn: 'mba-submit-btn', submitBtnGreen: 'mba-submit-btn--green',
  spinner: 'mba-spinner',
  matchPreview: 'mba-match-preview', matchTeam: 'mba-match-team',
  matchLogo: 'mba-match-logo', matchName: 'mba-match-name',
  matchVs: 'mba-match-vs', matchKo: 'mba-ko-badge', matchMeta: 'mba-meta',
  scoreRow: 'mba-score-row', scoreInput: 'mba-score-input', scoreSep: 'mba-score-sep',
  koSection: 'mba-ko-section', koLabel: 'mba-ko-label', koGrid: 'mba-ko-grid',
  koBtn: 'mba-ko-btn', koBtnActive: 'active',
  error: 'mba-error', infoBox: 'mba-info-box',
  logoPreviewSingle: 'mba-logo-preview mba-logo-preview--single',
  logoImgLg: 'mba-logo-img-lg',
  logoName: '',
  finishTitle: 'mba-finish-title',
};

/* ================================================================
   HOOK: detectar si es mobile
================================================================ */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

/* ================================================================
   BOTTOM SHEET WRAPPER
================================================================ */
function MobileBottomSheet({ isOpen, onClose, title, color, children }) {
  const sheetRef = useRef(null);
  const startY = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (startY.current === null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (delta > 60) onClose();
    startY.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="mba-overlay" onClick={onClose}>
      <div
        className="mba-sheet"
        ref={sheetRef}
        style={{ borderTopColor: color || 'var(--accent)' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mba-handle-bar" />
        <div className="mba-sheet-header">
          <span className="mba-sheet-dot" style={{ background: color || 'var(--accent)' }} />
          <span className="mba-sheet-title">{title}</span>
          <button className="mba-sheet-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="mba-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FAB — Floating Action Button (mobile add button)
================================================================ */
export function MobileAdminFAB({ activeSection, onOpen }) {
  const sectionColors = {
    matches: '#1D9E75',
    leagues: '#f5a623',
    awards: '#f25f5c',
    achievements: 'var(--accent)',
    titles: '#3b82f6',
    crowns: '#c9a227',
    banners: 'var(--accent)',
  };
  const color = sectionColors[activeSection] || 'var(--accent)';

  return (
    <button
      className="mba-fab"
      style={{ background: color, boxShadow: `0 4px 20px ${color}55` }}
      onClick={onOpen}
      aria-label="Agregar nuevo"
    >
      <Plus size={22} />
    </button>
  );
}

/* ================================================================
   CAMPO REUTILIZABLE
================================================================ */
function Field({ label, required, hint, children }) {
  return (
    <div className="mba-field">
      <label className="mba-label">
        {label}{required && <span className="mba-req">*</span>}
      </label>
      {children}
      {hint && <span className="mba-hint">{hint}</span>}
    </div>
  );
}
function Input(props) { return <input className="mba-input" {...props} />; }
function Sel({ children, ...props }) { return <select className="mba-input" {...props}>{children}</select>; }
function Textarea(props) { return <textarea className="mba-input mba-textarea" {...props} />; }

/* ================================================================
   ADD ACHIEVEMENT FORM
================================================================ */
function AddAchievementForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ id: '', name: '', description: '', icon: '🎯', category: 'Inicio', requirement_type: 'points', requirement_value: 0 });
  const icons = ['🎯', '🌟', '⭐', '✨', '💫', '🔥', '🏆', '👑', '💎', '🎖️', '🥇', '🥈', '🥉'];
  const cats = ['Inicio', 'Progreso', 'Precisión', 'Racha'];
  const reqTypes = [{ value: 'points', label: 'Puntos' }, { value: 'predictions', label: 'Predicciones' }, { value: 'correct', label: 'Aciertos' }, { value: 'streak', label: 'Racha' }];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.description || !form.requirement_value) return;
    const id = form.id || `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    await onAdd({ ...form, id });
    onClose();
  };

  return (
    <div className="mba-form">
      <Field label="Nombre" required><Input name="name" placeholder="Primer Paso" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Descripción" required><Textarea name="description" placeholder="Cómo obtener este logro" value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></Field>
      <Field label="Icono">
        <div className="mba-icon-grid">
          {icons.map(ic => (
            <button key={ic} type="button" className={`mba-icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
          ))}
        </div>
      </Field>
      <div className="mba-row-2">
        <Field label="Categoría">
          <Sel value={form.category} onChange={e => set('category', e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Sel>
        </Field>
        <Field label="Tipo Requisito">
          <Sel value={form.requirement_type} onChange={e => set('requirement_type', e.target.value)}>
            {reqTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Sel>
        </Field>
      </div>
      <Field label="Valor Requerido" required><Input type="number" min="0" placeholder="100" value={form.requirement_value} onChange={e => set('requirement_value', parseInt(e.target.value) || 0)} /></Field>
      <button className="mba-submit-btn" onClick={submit}><Plus size={16} /><span>Crear Logro</span></button>
    </div>
  );
}

/* ================================================================
   ADD CROWN FORM
================================================================ */
function AddCrownForm({ onAdd, onClose }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!month) return;
    setSending(true);
    try { await onAdd(month); onClose(); } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <div className="mba-crown-info">
        <Crown size={32} style={{ color: '#c9a227' }} />
        <p>Otorga la corona mensual al usuario con más puntos en el mes seleccionado.</p>
      </div>
      <Field label="Mes (YYYY-MM)" required hint="Ej: 2026-01 para Enero 2026">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </Field>
      <button className="mba-submit-btn mba-submit-btn--gold" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <Crown size={16} />}
        <span>{sending ? 'Otorgando...' : 'Otorgar Corona'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   ADD BANNER FORM
================================================================ */
function AddBannerForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.name.trim() || !imageFile) return;
    setUploading(true);
    try { await onAdd({ ...form, file: imageFile }); onClose(); } finally { setUploading(false); }
  };

  return (
    <div className="mba-form">
      <div
        className={`mba-drop-zone ${preview ? 'has-image' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="mba-drop-preview" />
            <div className="mba-drop-overlay"><Image size={18} /><span>Cambiar</span></div>
          </>
        ) : (
          <div className="mba-drop-content">
            <Image size={24} style={{ opacity: 0.3 }} />
            <span>Toca para subir imagen</span>
            <span className="mba-hint">1308×654px recomendado</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      <Field label="Nombre" required><Input name="name" placeholder="Banner Clásico" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></Field>
      <Field label="Descripción"><Input name="description" placeholder="Descripción opcional" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></Field>
      <button className="mba-submit-btn" onClick={submit} disabled={uploading || !imageFile}>
        {uploading ? <span className="mba-spinner" /> : <Plus size={16} />}
        <span>{uploading ? 'Subiendo...' : 'Crear Banner'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   EDIT ACHIEVEMENT FORM (mobile)
================================================================ */
function EditAchievementForm({ item, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...item });
  const icons = ['🎯', '🌟', '⭐', '✨', '💫', '🔥', '🏆', '👑', '💎', '🎖️', '🥇', '🥈', '🥉'];
  const cats = ['Inicio', 'Progreso', 'Precisión', 'Racha'];
  const reqTypes = [{ value: 'points', label: 'Puntos' }, { value: 'predictions', label: 'Predicciones' }, { value: 'correct', label: 'Aciertos' }, { value: 'streak', label: 'Racha' }];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="mba-form">
      <Field label="Nombre" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Descripción" required><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></Field>
      <Field label="Icono">
        <div className="mba-icon-grid">
          {icons.map(ic => <button key={ic} type="button" className={`mba-icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>)}
        </div>
      </Field>
      <div className="mba-row-2">
        <Field label="Categoría">
          <Sel value={form.category} onChange={e => set('category', e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Sel>
        </Field>
        <Field label="Tipo">
          <Sel value={form.requirement_type} onChange={e => set('requirement_type', e.target.value)}>
            {reqTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Sel>
        </Field>
      </div>
      <Field label="Valor" required><Input type="number" min="0" value={form.requirement_value} onChange={e => set('requirement_value', parseInt(e.target.value) || 0)} /></Field>
      <div className="mba-form-actions">
        <button className="mba-delete-btn" onClick={() => { onDelete(form.id); onClose(); }}><Trash2 size={14} /><span>Eliminar</span></button>
        <button className="mba-submit-btn" onClick={() => { onSave(form); onClose(); }}><Edit2 size={14} /><span>Guardar</span></button>
      </div>
    </div>
  );
}
function AddTitleForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: '', name: '', description: '',
    color: '#7C3AED', requirement_achievement_id: ''
  });
  const [achievements, setAchievements] = useState([]);
  const [sending, setSending] = useState(false);
  const colors = ['#7C3AED', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from('available_achievements')
      .select('*')
      .order('requirement_value', { ascending: true })
      .then(({ data }) => setAchievements(data || []));
  }, []);

  const submit = async () => {
    if (!form.name || !form.description || !form.requirement_achievement_id) return;
    const id = form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setSending(true);
    try { await onAdd({ ...form, id }); onClose(); }
    finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <Field label="Nombre" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Oráculo" />
      </Field>
      <Field label="Descripción" required>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
      </Field>
      <Field label="Color">
        <div className="mba-color-grid">
          {colors.map(c => (
            <button key={c} type="button"
              className={`mba-color-btn ${form.color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => set('color', c)}
            />
          ))}
        </div>
      </Field>
      <Field label="Logro Requerido" required>
        <Sel value={form.requirement_achievement_id} onChange={e => set('requirement_achievement_id', e.target.value)}>
          <option value="">Selecciona un logro...</option>
          {achievements.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Sel>
      </Field>
      <button className="mba-submit-btn" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <Package size={16} />}
        <span>{sending ? 'Creando...' : 'Crear Título'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function MobileAdminSheet({
  isOpen,
  onClose,
  activeSection,
  panelMode,
  panelItem,
  onAdd,
  onFinish,
  onSave,
  onDelete,
  users = [],
  banners = [],
  onAssignBanner,
  onRevokeBanner,
}) {
  const sectionColors = {
    matches: '#1D9E75',
    leagues: '#f5a623',
    awards: '#f25f5c',
    achievements: 'var(--accent)',
    titles: '#3b82f6',
    crowns: '#c9a227',
    banners: 'var(--accent)',
  };

  const sectionTitles = {
    matches: { add: 'Agregar Partido', finish: 'Finalizar Partido', edit: 'Editar Partido' },
    leagues: { add: 'Agregar Liga', finish: 'Finalizar Liga', edit: 'Editar' },
    awards: { add: 'Agregar Premio', finish: 'Finalizar Premio', edit: 'Editar' },
    achievements: { add: 'Nuevo Logro', finish: '', edit: 'Editar Logro' },
    titles: { add: 'Nuevo Título', finish: '', edit: 'Editar Título' },
    crowns: { add: 'Otorgar Corona', finish: '', edit: '' },
    banners: { add: 'Crear Banner', finish: '', edit: '', assign: 'Asignar Banner' },
  };

  const color = panelMode === 'finish' ? '#1D9E75' : sectionColors[activeSection] || 'var(--accent)';
  const title = sectionTitles[activeSection]?.[panelMode] || sectionTitles[activeSection]?.add || 'Panel Admin';

  const renderContent = () => {
    if (panelMode === 'finish' && panelItem) {
      if (activeSection === 'matches') return <FinishMatchForm match={panelItem} onFinish={onFinish} onClose={onClose} styles={MBA_STYLES} />;
      if (activeSection === 'leagues') return <FinishLeagueForm league={panelItem} onFinish={onFinish} onClose={onClose} styles={MBA_STYLES} />;
      if (activeSection === 'awards') return <FinishAwardForm award={panelItem} onFinish={onFinish} onClose={onClose} styles={MBA_STYLES} />;
    }
    if (panelMode === 'edit' && panelItem) {
      if (activeSection === 'achievements') return <EditAchievementForm item={panelItem} onSave={onSave} onDelete={onDelete} onClose={onClose} />;
    }

    switch (activeSection) {
      case 'matches': return <MatchForm onAdd={onAdd} onClose={onClose} styles={MBA_STYLES} />;
      case 'leagues': return <LeagueForm onAdd={onAdd} onClose={onClose} styles={MBA_STYLES} />;
      case 'awards': return <AwardForm onAdd={onAdd} onClose={onClose} styles={MBA_STYLES} />;
      case 'achievements': return <AddAchievementForm onAdd={onAdd} onClose={onClose} />;
      case 'titles': return <AddTitleForm onAdd={onAdd} onClose={onClose} />;
      case 'crowns': return <AddCrownForm onAdd={onAdd} onClose={onClose} />;
      case 'banners': return <AddBannerForm onAdd={onAdd} onClose={onClose} />;
      default: return <AddMatchForm onAdd={onAdd} onClose={onClose} />;
    }
  };

  return (
    <MobileBottomSheet isOpen={isOpen} onClose={onClose} title={title} color={color}>
      {renderContent()}
    </MobileBottomSheet>
  );
}