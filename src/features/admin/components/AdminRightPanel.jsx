import React, { useState, useEffect } from 'react';
import {
  Plus, CheckCircle, X, Trophy, Target, Award, Shield,
  Package, Crown, Image, Home, Plane, Calendar, Clock,
  Zap, Star, Flame, AlertCircle, ChevronLeft, Trash2,
  Edit2, UserCheck, Search
} from 'lucide-react';
import MatchForm from '../forms/MatchForm';
import FinishMatchForm from '../forms/FinishMatchForm';
import { LeagueForm, FinishLeagueForm } from '../forms/LeagueForm';
import { AwardForm, FinishAwardForm } from '../forms/AwardForm';
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect, getLogoUrlByLeagueName, getLogoUrlByAwardName } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

const ADM_STYLES = {
  form: 'adm-form', row2: 'adm-row-2', field: 'adm-field',
  label: 'adm-label', req: 'adm-req', hint: 'adm-hint', input: 'adm-input',
  toggle: 'adm-toggle', toggleCheck: 'adm-toggle-check',
  toggleTrack: 'adm-toggle-track', toggleThumb: 'adm-toggle-thumb',
  toggleLabel: 'adm-toggle-label', toggleSub: 'adm-toggle-sub',
  sectionSep: 'adm-section-sep',
  logoPreview: 'adm-logo-preview', logoItem: 'adm-logo-item',
  logoImg: 'adm-logo-img', logoEmoji: 'adm-logo-emoji', logoVs: 'adm-logo-vs',
  logoPreviewSingle: 'adm-logo-preview adm-logo-preview--single',
  logoImgLg: 'adm-logo-img-lg', logoName: 'adm-logo-name',
  submitBtn: 'adm-submit-btn', submitBtnGreen: 'adm-submit-btn--green',
  spinner: 'adm-spinner',
  matchPreview: 'adm-match-preview', matchTeam: 'adm-match-team',
  matchLogo: 'adm-match-logo', matchName: 'adm-match-name',
  matchVs: 'adm-match-vs', matchKo: 'adm-match-ko', matchMeta: 'adm-match-meta',
  scoreRow: 'adm-score-row', scoreInput: 'adm-score-input', scoreSep: 'adm-score-sep',
  koSection: 'adm-ko-section', koLabel: 'adm-ko-label', koGrid: 'adm-ko-grid',
  koBtn: 'adm-ko-btn', koBtnActive: 'active',
  error: 'adm-error', infoBox: 'adm-info-box',
  finishTitle: 'adm-finish-title',
};

/* ================================================================
   PANEL WRAPPER
================================================================ */
export default function AdminRightPanel({
  activeSection,
  panelMode,
  panelItem,
  onAdd,
  onFinish,
  onSave,
  onDelete,
  onResetPanel,
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
    trophies: '#0ea5a8',
    banners: 'var(--accent)',
  };
  const panelColor = panelMode === 'finish' ? '#1D9E75' : sectionColors[activeSection] || 'var(--accent)';

  return (
    <aside className="adm-panel" style={{ borderTopColor: panelColor }}>
      <div className="adm-panel-inner">
        {/* Header del panel */}
        <PanelHeader
          activeSection={activeSection}
          panelMode={panelMode}
          panelItem={panelItem}
          onResetPanel={onResetPanel}
        />

        {/* Body scrollable */}
        <div className="adm-panel-body">
          {panelMode === 'finish' && panelItem ? (
            <FinishForm
              activeSection={activeSection}
              item={panelItem}
              onFinish={onFinish}
              onResetPanel={onResetPanel}
            />
          ) : panelMode === 'edit' && panelItem ? (
            <EditForm
              activeSection={activeSection}
              item={panelItem}
              onSave={onSave}
              onDelete={onDelete}
              onResetPanel={onResetPanel}
            />
          ) : panelMode === 'assign' ? (
            <AssignBannerForm
              users={users}
              banners={banners}
              onAssign={onAssignBanner}
              onRevoke={onRevokeBanner}
            />
          ) : (
            <AddForm
              activeSection={activeSection}
              onAdd={onAdd}
              users={users}
            />
          )}
        </div>
      </div>
    </aside>
  );
}

/* ================================================================
   PANEL HEADER
================================================================ */
function PanelHeader({ activeSection, panelMode, panelItem, onResetPanel }) {
  const titles = {
    matches: { add: 'Agregar Partido', finish: 'Finalizar Partido', edit: 'Editar' },
    leagues: { add: 'Agregar Liga', finish: 'Finalizar Liga', edit: 'Editar' },
    awards: { add: 'Agregar Premio', finish: 'Finalizar Premio', edit: 'Editar' },
    achievements: { add: 'Nuevo Logro', finish: '', edit: 'Editar Logro' },
    titles: { add: 'Nuevo Título', finish: '', edit: 'Editar Título' },
    crowns: { add: 'Otorgar Corona', finish: '', edit: '' },
    trophies: { add: 'Otorgar Trofeo', finish: '', edit: '' },
    banners: { add: 'Crear Banner', finish: '', edit: '', assign: 'Asignar Banner' },
  };

  const sectionColors = {
    matches: '#1D9E75',
    leagues: '#f5a623',
    awards: '#f25f5c',
    achievements: 'var(--accent)',
    titles: '#3b82f6',
    crowns: '#c9a227',
    banners: 'var(--accent)',
  };

  const title = titles[activeSection]?.[panelMode] || titles[activeSection]?.add || '';
  const color = sectionColors[activeSection] || 'var(--accent)';
  const isDefault = panelMode === 'add';

  return (
    <div className="adm-panel-header" style={{ borderTopColor: color }}>
      <div className="adm-panel-header-left">
        <span className="adm-panel-header-dot" style={{ background: color }} />
        <span className="adm-panel-header-title">{title}</span>
      </div>
      {!isDefault && (
        <button className="adm-panel-back" onClick={onResetPanel} title="Volver">
          <ChevronLeft size={14} />
          <span>Volver</span>
        </button>
      )}
    </div>
  );
}

/* ================================================================
   CAMPO REUTILIZABLE
================================================================ */
function Field({ label, required, hint, children }) {
  return (
    <div className="adm-field">
      <label className="adm-label">
        {label}
        {required && <span className="adm-req">*</span>}
      </label>
      {children}
      {hint && <span className="adm-hint">{hint}</span>}
    </div>
  );
}

function Input({ ...props }) {
  return <input className="adm-input" {...props} />;
}

function Select({ children, ...props }) {
  return <select className="adm-input" {...props}>{children}</select>;
}

function Textarea({ ...props }) {
  return <textarea className="adm-input adm-textarea" {...props} />;
}

function SubmitBtn({ loading, icon, label, color }) {
  return (
    <button
      className="adm-submit-btn"
      type="button"
      disabled={loading}
      style={color ? { '--adm-btn-color': color } : {}}
    >
      {loading ? (
        <span className="adm-spinner" />
      ) : (
        icon
      )}
      <span>{loading ? 'Guardando...' : label}</span>
    </button>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button className="adm-delete-btn" type="button" onClick={onClick}>
      <Trash2 size={13} />
      <span>Eliminar</span>
    </button>
  );
}

/* ================================================================
   ADD FORM — por sección
================================================================ */
function AddForm({ activeSection, onAdd, users }) {
  switch (activeSection) {
    case 'matches': return <MatchForm onAdd={onAdd} styles={ADM_STYLES} />;
    case 'leagues': return <LeagueForm onAdd={onAdd} styles={ADM_STYLES} />;
    case 'awards': return <AwardForm onAdd={onAdd} styles={ADM_STYLES} />;
    case 'achievements': return <AddAchievementForm onAdd={onAdd} />;
    case 'titles': return <AddTitleForm onAdd={onAdd} />;
    case 'crowns': return <AddCrownForm onAdd={onAdd} users={users} />;
    case 'trophies': return <AddTrophyForm onAdd={onAdd} users={users} />;
    case 'banners': return <AddBannerForm onAdd={onAdd} />;
    default: return <MatchForm onAdd={onAdd} styles={ADM_STYLES} />;
  }
}

/* ── ADD ACHIEVEMENT ── */
function AddAchievementForm({ onAdd }) {
  const [form, setForm] = useState({ id: '', name: '', description: '', icon: '🎯', category: 'Inicio', requirement_type: 'points', requirement_value: 0 });
  const icons = ['🎯', '🌟', '⭐', '✨', '💫', '🔥', '🏆', '👑', '💎', '🎖️', '🥇', '🥈', '🥉'];
  const cats = ['Inicio', 'Progreso', 'Precisión', 'Racha'];
  const reqTypes = [{ value: 'points', label: 'Puntos' }, { value: 'predictions', label: 'Predicciones' }, { value: 'correct', label: 'Aciertos' }, { value: 'streak', label: 'Racha' }];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleChange = (e) => {
    const { name, value } = e.target;
    set(name, name === 'requirement_value' ? parseInt(value) || 0 : value);
  };

  const submit = async () => {
    if (!form.name || !form.description || !form.requirement_value) return;
    const id = form.id || `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    await onAdd({ ...form, id });
    setForm({ id: '', name: '', description: '', icon: '🎯', category: 'Inicio', requirement_type: 'points', requirement_value: 0 });
  };

  return (
    <div className="adm-form">
      <Field label="Nombre" required>
        <Input name="name" placeholder="Primer Paso" value={form.name} onChange={handleChange} />
      </Field>
      <Field label="Descripción" required>
        <Textarea name="description" placeholder="Cómo obtener este logro" value={form.description} onChange={handleChange} rows={2} />
      </Field>
      <Field label="Icono">
        <div className="adm-icon-grid">
          {icons.map(ic => (
            <button key={ic} type="button" className={`adm-icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
          ))}
        </div>
      </Field>
      <div className="adm-row-2">
        <Field label="Categoría">
          <Select name="category" value={form.category} onChange={handleChange}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Tipo Requisito">
          <Select name="requirement_type" value={form.requirement_type} onChange={handleChange}>
            {reqTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Valor Requerido" required>
        <Input type="number" name="requirement_value" min="0" placeholder="100" value={form.requirement_value} onChange={handleChange} />
      </Field>
      <button className="adm-submit-btn" onClick={submit}>
        <Plus size={14} /><span>Crear Logro</span>
      </button>
    </div>
  );
}

/* ── ADD TITLE ── */
function AddTitleForm({ onAdd }) {
  const [form, setForm] = useState({ id: '', name: '', description: '', color: '#7C3AED', requirement_achievement_id: '' });
  const [achievements, setAchievements] = useState([]);
  const colors = ['#7C3AED', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6366F1', '#8B5CF6'];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from('available_achievements').select('*').order('requirement_value', { ascending: true })
      .then(({ data }) => setAchievements(data || []));
  }, []);

  const submit = async () => {
    if (!form.name || !form.description || !form.requirement_achievement_id) return;
    const id = form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await onAdd({ ...form, id });
    setForm({ id: '', name: '', description: '', color: '#7C3AED', requirement_achievement_id: '' });
  };

  return (
    <div className="adm-form">
      <Field label="Nombre" required>
        <Input name="name" placeholder="Novato" value={form.name} onChange={e => set('name', e.target.value)} />
      </Field>
      <Field label="Descripción" required>
        <Textarea name="description" placeholder="Qué representa este título" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
      </Field>
      <Field label="Color">
        <div className="adm-color-grid">
          {colors.map(c => (
            <button key={c} type="button" className={`adm-color-btn ${form.color === c ? 'active' : ''}`}
              style={{ background: c }} onClick={() => set('color', c)} />
          ))}
        </div>
      </Field>
      <Field label="Logro Requerido" required>
        <Select name="requirement_achievement_id" value={form.requirement_achievement_id} onChange={e => set('requirement_achievement_id', e.target.value)}>
          <option value="">Selecciona un logro...</option>
          {achievements.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Select>
      </Field>
      <button className="adm-submit-btn" onClick={submit}>
        <Plus size={14} /><span>Crear Título</span>
      </button>
    </div>
  );
}

/* ── ADD CROWN ── */
function AddCrownForm({ onAdd, users = [] }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sending, setSending] = useState(false);
  const topUser = users[0];

  const submit = async () => {
    if (!month || !topUser) return;
    setSending(true);
    try { await onAdd({ winnerId: topUser.id, monthLabel: month }); }
    finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <div className="adm-crown-info">
        <Crown size={28} style={{ color: '#c9a227' }} />
        <p>Otorga la corona mensual al usuario con más puntos en el mes seleccionado.</p>
        {topUser && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Ganador: <strong>{topUser.name}</strong>
          </p>
        )}
      </div>
      <Field label="Mes (YYYY-MM)" required hint="Formato: 2026-01 para Enero 2026">
        <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </Field>
      <button className="adm-submit-btn adm-submit-btn--gold" onClick={submit} disabled={sending || !topUser}>
        {sending ? <span className="adm-spinner" /> : <Crown size={14} />}
        <span>{sending ? 'Otorgando...' : 'Otorgar Corona'}</span>
      </button>
    </div>
  );
}

/* ── ADD TROPHY (Ranking Global) ── */
function AddTrophyForm({ onAdd, users = [] }) {
  const [edition, setEdition] = useState(new Date().getFullYear().toString());
  const [sending, setSending] = useState(false);
  const topUser = users[0];

  const submit = async () => {
    if (!edition || !topUser) return;
    setSending(true);
    try { await onAdd({ winnerId: topUser.id, editionLabel: edition }); }
    finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <div className="adm-crown-info">
        <Trophy size={28} style={{ color: '#0ea5a8' }} />
        <p>Otorga el trofeo del ranking global al usuario con más puntos acumulados.</p>
        {topUser && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Ganador: <strong>{topUser.name}</strong> ({topUser.points} pts)
          </p>
        )}
      </div>
      <Field label="Edición / Temporada" required hint="Ej: 2026, o 'Temporada 1'">
        <Input value={edition} onChange={e => setEdition(e.target.value)} />
      </Field>
      <button className="adm-submit-btn adm-submit-btn--gold" onClick={submit} disabled={sending || !topUser}>
        {sending ? <span className="adm-spinner" /> : <Trophy size={14} />}
        <span>{sending ? 'Otorgando...' : 'Otorgar Trofeo'}</span>
      </button>
    </div>
  );
}

/* ── ADD BANNER ── */
function AddBannerForm({ onAdd }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef(null);

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
    try { await onAdd({ ...form, file: imageFile }); setForm({ name: '', description: '' }); setImageFile(null); setPreview(null); }
    finally { setUploading(false); }
  };

  return (
    <div className="adm-form">
      {/* Drop zone */}
      <div
        className={`adm-drop-zone ${preview ? 'has-image' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="adm-drop-preview" />
            <div className="adm-drop-overlay"><Image size={18} /><span>Cambiar</span></div>
          </>
        ) : (
          <div className="adm-drop-content">
            <Image size={24} style={{ opacity: 0.3 }} />
            <span>Click o arrastra la imagen</span>
            <span className="adm-hint">1308×654px recomendado</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>
      <Field label="Nombre" required>
        <Input name="name" placeholder="Banner Clásico" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
      </Field>
      <Field label="Descripción">
        <Input name="description" placeholder="Descripción opcional" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </Field>
      <button className="adm-submit-btn" onClick={submit} disabled={uploading || !imageFile}>
        {uploading ? <span className="adm-spinner" /> : <Plus size={14} />}
        <span>{uploading ? 'Subiendo...' : 'Crear Banner'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   FINISH FORMS
================================================================ */
function FinishForm({ activeSection, item, onFinish, onResetPanel }) {
  switch (activeSection) {
    case 'matches': return <FinishMatchForm match={item} onFinish={onFinish} onClose={onResetPanel} styles={ADM_STYLES} />;
    case 'leagues': return <FinishLeagueForm league={item} onFinish={onFinish} onClose={onResetPanel} styles={ADM_STYLES} />;
    case 'awards': return <FinishAwardForm award={item} onFinish={onFinish} onClose={onResetPanel} styles={ADM_STYLES} />;
    default: return null;
  }
}

/* ================================================================
   EDIT FORMS
================================================================ */
function EditForm({ activeSection, item, onSave, onDelete, onResetPanel }) {
  switch (activeSection) {
    case 'achievements': return <EditAchievementForm item={item} onSave={onSave} onDelete={onDelete} onResetPanel={onResetPanel} />;
    case 'titles': return <EditTitleForm item={item} onSave={onSave} onDelete={onDelete} onResetPanel={onResetPanel} />;
    default: return null;
  }
}

function EditAchievementForm({ item, onSave, onDelete, onResetPanel }) {
  const [form, setForm] = useState({ ...item });
  const icons = ['🎯', '🌟', '⭐', '✨', '💫', '🔥', '🏆', '👑', '💎', '🎖️', '🥇', '🥈', '🥉'];
  const cats = ['Inicio', 'Progreso', 'Precisión', 'Racha'];
  const reqTypes = [{ value: 'points', label: 'Puntos' }, { value: 'predictions', label: 'Predicciones' }, { value: 'correct', label: 'Aciertos' }, { value: 'streak', label: 'Racha' }];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="adm-form">
      <Field label="Nombre" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Descripción" required><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></Field>
      <Field label="Icono">
        <div className="adm-icon-grid">
          {icons.map(ic => <button key={ic} type="button" className={`adm-icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>)}
        </div>
      </Field>
      <div className="adm-row-2">
        <Field label="Categoría">
          <Select value={form.category} onChange={e => set('category', e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Tipo">
          <Select value={form.requirement_type} onChange={e => set('requirement_type', e.target.value)}>
            {reqTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Valor" required>
        <Input type="number" min="0" value={form.requirement_value} onChange={e => set('requirement_value', parseInt(e.target.value) || 0)} />
      </Field>
      <div className="adm-form-actions">
        <button className="adm-delete-btn" onClick={() => { onDelete(form.id); onResetPanel(); }}><Trash2 size={13} /><span>Eliminar</span></button>
        <button className="adm-submit-btn" onClick={() => { onSave(form); onResetPanel(); }}><Edit2 size={14} /><span>Guardar</span></button>
      </div>
    </div>
  );
}

function EditTitleForm({ item, onSave, onDelete, onResetPanel }) {
  const [form, setForm] = useState({ ...item });
  const [achievements, setAchievements] = useState([]);
  const colors = ['#7C3AED', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6366F1', '#8B5CF6'];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.from('available_achievements').select('*').order('requirement_value', { ascending: true })
      .then(({ data }) => setAchievements(data || []));
  }, []);

  return (
    <div className="adm-form">
      <Field label="Nombre" required><Input value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Descripción" required><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></Field>
      <Field label="Color">
        <div className="adm-color-grid">
          {colors.map(c => <button key={c} type="button" className={`adm-color-btn ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => set('color', c)} />)}
        </div>
      </Field>
      <Field label="Logro Requerido" required>
        <Select value={form.requirement_achievement_id} onChange={e => set('requirement_achievement_id', e.target.value)}>
          <option value="">Selecciona...</option>
          {achievements.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Select>
      </Field>
      <div className="adm-form-actions">
        <button className="adm-delete-btn" onClick={() => { onDelete(form.id); onResetPanel(); }}><Trash2 size={13} /><span>Eliminar</span></button>
        <button className="adm-submit-btn" onClick={() => { onSave(form); onResetPanel(); }}><Edit2 size={14} /><span>Guardar</span></button>
      </div>
    </div>
  );
}

/* ================================================================
   ASSIGN BANNER FORM
================================================================ */
function AssignBannerForm({ users: initialUsers, banners, onAssign, onRevoke }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [userBanners, setUserBanners] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [allUsers, setAllUsers] = useState(initialUsers || []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, points, avatar_url')
        .order('name', { ascending: true });
      if (!error && data) setAllUsers(data);
    };
    fetchUsers();
  }, []);

  const normalize = (str) =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const filtered = !search.trim() ? [] : allUsers.filter(u => {
    const term = normalize(search);
    const name = normalize(u.name);
    const nameRaw = (u.name || '').toLowerCase();
    const termRaw = search.toLowerCase().trim();
    return name.includes(term) || nameRaw.includes(termRaw);
  }).slice(0, 6);

  const loadUserBanners = async (uid) => {
    const { data } = await supabase.from('user_banners').select('*, available_banners(*)').eq('user_id', uid);
    setUserBanners((data || []).map(r => r.available_banners));
  };

  const selectUser = async (u) => { setSelected(u); setSearch(u.name); await loadUserBanners(u.id); };

  const assign = async () => {
    if (!selected || !selectedBanner) return;
    setAssigning(true);
    try { await onAssign(selected.id, selectedBanner.id); await loadUserBanners(selected.id); setSelectedBanner(null); }
    finally { setAssigning(false); }
  };

  const revoke = async (b) => {
    await onRevoke(selected.id, b.id, b.image_url);
    await loadUserBanners(selected.id);
  };

  return (
    <div className="adm-form">
      <Field label="Buscar usuario">
        <div className="adm-search-wrap">
          <Search size={12} className="adm-search-icon" />
          <input className="adm-input adm-search-input" placeholder="Escribe el nombre..." value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }} />
        </div>
      </Field>

      {search && !selected && filtered.length > 0 && (
        <div className="adm-user-list">
          {filtered.map(u => (
            <button key={u.id} className="adm-user-item" onClick={() => selectUser(u)}>
              <div className="adm-user-av">{u.avatar_url ? <img src={u.avatar_url} alt="" /> : (u.name || 'U')[0]}</div>
              <div><div className="adm-user-name">{u.name}</div><div className="adm-user-pts">{u.points || 0} pts</div></div>
            </button>
          ))}
        </div>
      )}

      {search && !selected && filtered.length === 0 && search.trim() && (
        <p style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>
          No se encontraron usuarios
        </p>
      )}

      {selected && (
        <>
          {userBanners.length > 0 && (
            <div className="adm-assigned-chips">
              {userBanners.map(b => (
                <div key={b.id} className="adm-chip">
                  <img src={b.image_url} alt={b.name} className="adm-chip-img" />
                  <span>{b.name}</span>
                  <button className="adm-chip-revoke" onClick={() => revoke(b)}><X size={10} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="adm-section-sep">Selecciona banner</div>
          <div className="adm-banner-grid">
            {banners.map(b => {
              const assigned = userBanners.some(ub => ub.id === b.id);
              return (
                <button key={b.id}
                  className={`adm-banner-card ${selectedBanner?.id === b.id ? 'selected' : ''} ${assigned ? 'assigned' : ''}`}
                  onClick={() => !assigned && setSelectedBanner(b)} disabled={assigned}>
                  <img src={b.image_url} alt={b.name} />
                  <span>{b.name}</span>
                  {assigned && <span className="adm-banner-assigned">✓</span>}
                </button>
              );
            })}
          </div>

          {selectedBanner && (
            <button className="adm-submit-btn" onClick={assign} disabled={assigning}>
              {assigning ? <span className="adm-spinner" /> : <UserCheck size={14} />}
              <span>{assigning ? 'Asignando...' : `Asignar a ${selected.name}`}</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}