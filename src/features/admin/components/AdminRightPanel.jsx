import React, { useState, useEffect } from 'react';
import {
  Plus, CheckCircle, X, Trophy, Target, Award, Shield,
  Package, Crown, Image, Home, Plane, Calendar, Clock,
  Zap, Star, Flame, AlertCircle, ChevronLeft, Trash2,
  Edit2, UserCheck, Search
} from 'lucide-react';
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect, getLogoUrlByLeagueName, getLogoUrlByAwardName } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

/* ================================================================
   PANEL WRAPPER
================================================================ */
export default function AdminRightPanel({
  activeSection,
  panelMode,       // 'add' | 'finish' | 'edit'
  panelItem,       // item a finalizar/editar
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
    case 'matches': return <AddMatchForm onAdd={onAdd} />;
    case 'leagues': return <AddLeagueForm onAdd={onAdd} />;
    case 'awards': return <AddAwardForm onAdd={onAdd} />;
    case 'achievements': return <AddAchievementForm onAdd={onAdd} />;
    case 'titles': return <AddTitleForm onAdd={onAdd} />;
    case 'crowns': return <AddCrownForm onAdd={onAdd} users={users} />;
    case 'banners': return <AddBannerForm onAdd={onAdd} />;
    default: return <AddMatchForm onAdd={onAdd} />;
  }
}

/* ── ADD MATCH ── */
function AddMatchForm({ onAdd }) {
  const [form, setForm] = useState({
    id: '', league: '', home_team: '', away_team: '',
    home_team_logo: '🏠', away_team_logo: '✈️',
    date: '', time: '', deadLine: '', deadLine_time: '',
    is_knockout: false,
  });

  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'id' && value.length === 12) {
      const day = value.slice(0, 2);
      const month = value.slice(2, 4);
      const year = `20${value.slice(4, 6)}`;
      const home = value.slice(6, 9).toUpperCase();
      const away = value.slice(9, 12).toUpperCase();
      const dateStr = `${year}-${month}-${day}`;
      setForm(p => ({
        ...p,
        id: value,
        home_team: home,
        away_team: away,
        date: dateStr,
        deadLine: dateStr,
        home_team_logo_url: getLogoUrlByTeamName(supabase, home, p.league),
        away_team_logo_url: getLogoUrlByTeamName(supabase, away, p.league),
      }));
      return;
    }

    if (name === 'date') {
      setForm(p => ({ ...p, date: value, deadLine: value }));
      return;
    }

    if (name === 'time') {
      setForm(p => ({ ...p, time: value, deadLine_time: value }));
      return;
    }

    set(name, type === 'checkbox' ? checked : value);
    if (name === 'home_team' && value && form.league) {
      const url = getLogoUrlByTeamName(supabase, value, form.league);
      if (url) set('home_team_logo_url', url);
    }
    if (name === 'away_team' && value && form.league) {
      const url = getLogoUrlByTeamName(supabase, value, form.league);
      if (url) set('away_team_logo_url', url);
    }
    if (name === 'league' && value) {
      const ll = getLeagueLogoUrlDirect(value);
      if (ll) set('league_logo_url', ll);
    }
  };

  const submit = async () => {
    if (!form.id || !form.home_team || !form.away_team || !form.date || !form.time || !form.deadLine || !form.deadLine_time) return;
    setSending(true);
    try {
      const deadlineISO = `${form.deadLine}T${form.deadLine_time}:00`;
      await onAdd({
        id: form.id,
        league: form.league,
        home_team: form.home_team,
        away_team: form.away_team,
        home_team_logo: form.home_team_logo,
        away_team_logo: form.away_team_logo,
        home_team_logo_url: getLogoUrlByTeamName(supabase, form.home_team, form.league),
        away_team_logo_url: getLogoUrlByTeamName(supabase, form.away_team, form.league),
        league_logo_url: getLeagueLogoUrlDirect(form.league),
        date: form.date,
        time: form.time,
        deadline: deadlineISO,
        status: 'pending',
        is_knockout: form.is_knockout,
      });
      setForm({ id: '', league: '', home_team: '', away_team: '', home_team_logo: '🏠', away_team_logo: '✈️', date: '', time: '', deadLine: '', deadLine_time: '', is_knockout: false });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="adm-form">
      <div className="adm-row-2">
        <Field label="ID Partido" required hint="Sin espacios, usar guiones">
          <Input name="id" placeholder="match-001" value={form.id} onChange={handleChange} />
        </Field>
        <Field label="Liga" hint="Logo auto">
          <Input name="league" placeholder="Premier League" value={form.league} onChange={handleChange} />
        </Field>
      </div>

      {/* Knockout toggle */}
      <label className="adm-toggle">
        <input type="checkbox" name="is_knockout" checked={form.is_knockout} onChange={handleChange} className="adm-toggle-check" />
        <span className="adm-toggle-track"><span className="adm-toggle-thumb" /></span>
        <div className="adm-toggle-label">
          <span>⚡ Eliminatoria</span>
          <span className="adm-toggle-sub">+2 pts por clasificado</span>
        </div>
      </label>

      <div className="adm-row-2">
        <Field label="Equipo Local" required hint="Código 3 letras">
          <Input name="home_team" placeholder="MUN" value={form.home_team} onChange={handleChange} />
        </Field>
        <Field label="Equipo Visitante" required hint="Código 3 letras">
          <Input name="away_team" placeholder="LIV" value={form.away_team} onChange={handleChange} />
        </Field>
      </div>

      {/* Preview logos */}
      {form.home_team && form.away_team && (
        <div className="adm-logo-preview">
          <div className="adm-logo-item">
            {form.home_team_logo_url
              ? <img src={form.home_team_logo_url} alt="" className="adm-logo-img" />
              : <span className="adm-logo-emoji">{form.home_team_logo}</span>}
            <span>{form.home_team}</span>
          </div>
          <span className="adm-logo-vs">VS</span>
          <div className="adm-logo-item">
            {form.away_team_logo_url
              ? <img src={form.away_team_logo_url} alt="" className="adm-logo-img" />
              : <span className="adm-logo-emoji">{form.away_team_logo}</span>}
            <span>{form.away_team}</span>
          </div>
        </div>
      )}

      <div className="adm-section-sep">Fecha del partido</div>
      <div className="adm-row-2">
        <Field label="Fecha" required>
          <Input type="date" name="date" value={form.date} onChange={handleChange} />
        </Field>
        <Field label="Hora" required>
          <Input type="time" name="time" value={form.time} onChange={handleChange} />
        </Field>
      </div>

      <div className="adm-section-sep">Límite predicciones</div>
      <div className="adm-row-2">
        <Field label="Fecha Límite" required>
          <Input type="date" name="deadLine" value={form.deadLine} onChange={handleChange} />
        </Field>
        <Field label="Hora Límite" required>
          <Input type="time" name="deadLine_time" value={form.deadLine_time} onChange={handleChange} />
        </Field>
      </div>

      <button className="adm-submit-btn" onClick={submit} disabled={sending}>
        {sending ? <span className="adm-spinner" /> : <Plus size={14} />}
        <span>{sending ? 'Agregando...' : 'Agregar Partido'}</span>
      </button>
    </div>
  );
}

/* ── ADD LEAGUE ── */
function AddLeagueForm({ onAdd }) {
  const [form, setForm] = useState({ id: '', name: '', season: '', logo: '🏆', deadline: '', deadline_time: '' });
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    set(name, value);
    if (name === 'name' && value) {
      const url = getLogoUrlByLeagueName(supabase, value);
      if (url) set('logo_url', url);
    }
  };

  const submit = async () => {
    if (!form.id || !form.name || !form.season || !form.deadline || !form.deadline_time) return;
    setSending(true);
    try {
      const { deadline_time, deadline: deadline_date, ...rest } = form;
      await onAdd({
        ...rest,
        logo_url: getLogoUrlByLeagueName(supabase, form.name),
        deadline: `${deadline_date}T${deadline_time}:00`,
        status: 'active',
      });
      setForm({ id: '', name: '', season: '', logo: '🏆', deadline: '', deadline_time: '' });
    } finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <Field label="ID Liga" required hint="Sin espacios, usar guiones">
        <Input name="id" placeholder="epl-2024" value={form.id} onChange={handleChange} />
      </Field>
      <Field label="Nombre" required hint="Logo asignado automáticamente">
        <Input name="name" placeholder="Premier League" value={form.name} onChange={handleChange} />
      </Field>
      <div className="adm-row-2">
        <Field label="Temporada" required>
          <Input name="season" placeholder="2024/25" value={form.season} onChange={handleChange} />
        </Field>
        <Field label="Emoji Respaldo">
          <Input name="logo" placeholder="🏆" value={form.logo} onChange={handleChange} maxLength={2} />
        </Field>
      </div>
      {form.logo_url && (
        <div className="adm-logo-preview adm-logo-preview--single">
          <img src={form.logo_url} alt="Logo" className="adm-logo-img-lg" />
          <span className="adm-logo-name">{form.name}</span>
        </div>
      )}
      <div className="adm-section-sep">Fecha límite</div>
      <div className="adm-row-2">
        <Field label="Fecha" required><Input type="date" name="deadline" value={form.deadline} onChange={handleChange} /></Field>
        <Field label="Hora" required><Input type="time" name="deadline_time" value={form.deadline_time} onChange={handleChange} /></Field>
      </div>
      <button className="adm-submit-btn" onClick={submit} disabled={sending}>
        {sending ? <span className="adm-spinner" /> : <Plus size={14} />}
        <span>{sending ? 'Agregando...' : 'Agregar Liga'}</span>
      </button>
    </div>
  );
}

/* ── ADD AWARD ── */
function AddAwardForm({ onAdd }) {
  const [form, setForm] = useState({ id: '', name: '', season: '', logo: '🏆', category: 'Individual', deadline: '', deadline_time: '' });
  const [sending, setSending] = useState(false);
  const cats = ['Individual', 'Equipo', 'Goleador', 'Portero', 'Joven', 'Fair Play'];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    set(name, value);
    if (name === 'name' && value) {
      const url = getLogoUrlByAwardName(supabase, value);
      if (url) set('logo_url', url);
    }
  };

  const submit = async () => {
    if (!form.id || !form.name || !form.season || !form.deadline || !form.deadline_time) return;
    setSending(true);
    try {
      const { deadline_time, deadline: deadline_date, ...rest } = form;
      await onAdd({
        ...rest,
        logo_url: getLogoUrlByAwardName(supabase, form.name),
        deadline: `${deadline_date}T${deadline_time}:00`,
        status: 'active',
      });
      setForm({ id: '', name: '', season: '', logo: '🏆', category: 'Individual', deadline: '', deadline_time: '' });
    } finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <Field label="ID Premio" required hint="Sin espacios, usar guiones">
        <Input name="id" placeholder="balon-oro-2024" value={form.id} onChange={handleChange} />
      </Field>
      <Field label="Nombre" required hint="Logo asignado automáticamente">
        <Input name="name" placeholder="Balón de Oro" value={form.name} onChange={handleChange} />
      </Field>
      <div className="adm-row-2">
        <Field label="Temporada" required>
          <Input name="season" placeholder="2024" value={form.season} onChange={handleChange} />
        </Field>
        <Field label="Categoría">
          <Select name="category" value={form.category} onChange={handleChange}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <div className="adm-section-sep">Fecha límite</div>
      <div className="adm-row-2">
        <Field label="Fecha" required><Input type="date" name="deadline" value={form.deadline} onChange={handleChange} /></Field>
        <Field label="Hora" required><Input type="time" name="deadline_time" value={form.deadline_time} onChange={handleChange} /></Field>
      </div>
      <button className="adm-submit-btn" onClick={submit} disabled={sending}>
        {sending ? <span className="adm-spinner" /> : <Plus size={14} />}
        <span>{sending ? 'Agregando...' : 'Agregar Premio'}</span>
      </button>
    </div>
  );
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
    case 'matches': return <FinishMatchForm match={item} onFinish={onFinish} onResetPanel={onResetPanel} />;
    case 'leagues': return <FinishLeagueForm league={item} onFinish={onFinish} onResetPanel={onResetPanel} />;
    case 'awards': return <FinishAwardForm award={item} onFinish={onFinish} onResetPanel={onResetPanel} />;
    default: return null;
  }
}

/* ── FINISH MATCH ── */
function FinishMatchForm({ match, onFinish, onResetPanel }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [advancing, setAdvancing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = homeScore !== '' && awayScore !== '' && (!match.is_knockout || advancing);

  const submit = async () => {
    const h = parseInt(homeScore), a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { setError('Resultados inválidos'); return; }
    if (match.is_knockout && !advancing) { setError('Selecciona el equipo que pasa'); return; }
    setError(''); setLoading(true);
    try { await onFinish(match.id, h, a, advancing); onResetPanel(); }
    catch { setError('Error al finalizar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="adm-form">
      {/* Info del partido */}
      <div className="adm-match-preview">
        <div className="adm-match-team">
          <span className="adm-match-logo">{match.home_team_logo}</span>
          <span className="adm-match-name">{match.home_team}</span>
        </div>
        <div className="adm-match-vs">
          <span>VS</span>
          {match.is_knockout && <span className="adm-match-ko">⚡ Elim.</span>}
        </div>
        <div className="adm-match-team">
          <span className="adm-match-logo">{match.away_team_logo}</span>
          <span className="adm-match-name">{match.away_team}</span>
        </div>
      </div>
      <div className="adm-match-meta">{match.league} · {match.date}</div>

      {/* Marcador */}
      <div className="adm-score-row">
        <div className="adm-field">
          <label className="adm-label">Local</label>
          <input className="adm-input adm-score-input" type="number" min="0" placeholder="0"
            value={homeScore} onChange={e => setHomeScore(e.target.value)} autoFocus />
        </div>
        <span className="adm-score-sep">–</span>
        <div className="adm-field">
          <label className="adm-label">Visitante</label>
          <input className="adm-input adm-score-input" type="number" min="0" placeholder="0"
            value={awayScore} onChange={e => setAwayScore(e.target.value)} />
        </div>
      </div>

      {/* Eliminatoria */}
      {match.is_knockout && (
        <div className="adm-ko-section">
          <span className="adm-ko-label">¿Quién pasa?</span>
          <div className="adm-ko-grid">
            {[{ key: 'home', label: match.home_team, logo: match.home_team_logo },
            { key: 'away', label: match.away_team, logo: match.away_team_logo }].map(({ key, label, logo }) => (
              <button key={key} type="button"
                className={`adm-ko-btn ${advancing === key ? 'active' : ''}`}
                onClick={() => setAdvancing(key)}>
                <span>{logo}</span>
                <span>{label}</span>
                {advancing === key && <CheckCircle size={13} className="adm-ko-check" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="adm-error"><AlertCircle size={13} /><span>{error}</span></div>
      )}

      <div className="adm-info-box">
        ⚠️ Esta acción calculará los puntos de todas las predicciones y no se puede deshacer.
      </div>

      <button className="adm-submit-btn adm-submit-btn--green" onClick={submit} disabled={loading || !canSubmit}>
        {loading ? <span className="adm-spinner" /> : <CheckCircle size={14} />}
        <span>{loading ? 'Finalizando...' : 'Finalizar Partido'}</span>
      </button>
    </div>
  );
}

/* ── FINISH LEAGUE ── */
function FinishLeagueForm({ league, onFinish, onResetPanel }) {
  const [form, setForm] = useState({ champion: '', top_scorer: '', top_scorer_goals: '', top_assist: '', top_assist_count: '', mvp_player: '' });
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (Object.values(form).some(v => !v)) return;
    setSending(true);
    try {
      await onFinish(league.id, { ...form, top_scorer_goals: parseInt(form.top_scorer_goals), top_assist_count: parseInt(form.top_assist_count) });
      onResetPanel();
    } finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <div className="adm-finish-title">{league.logo} {league.name} · {league.season}</div>
      <Field label="Campeón" required><Input placeholder="Nombre del equipo" value={form.champion} onChange={e => set('champion', e.target.value)} /></Field>
      <div className="adm-row-2">
        <Field label="Máx. Goleador" required><Input placeholder="Jugador" value={form.top_scorer} onChange={e => set('top_scorer', e.target.value)} /></Field>
        <Field label="Goles" required><Input type="number" min="0" placeholder="0" value={form.top_scorer_goals} onChange={e => set('top_scorer_goals', e.target.value)} /></Field>
      </div>
      <div className="adm-row-2">
        <Field label="Máx. Asistidor" required><Input placeholder="Jugador" value={form.top_assist} onChange={e => set('top_assist', e.target.value)} /></Field>
        <Field label="Asistencias" required><Input type="number" min="0" placeholder="0" value={form.top_assist_count} onChange={e => set('top_assist_count', e.target.value)} /></Field>
      </div>
      <Field label="MVP" required><Input placeholder="Jugador MVP" value={form.mvp_player} onChange={e => set('mvp_player', e.target.value)} /></Field>
      <button className="adm-submit-btn adm-submit-btn--green" onClick={submit} disabled={sending}>
        {sending ? <span className="adm-spinner" /> : <CheckCircle size={14} />}
        <span>{sending ? 'Finalizando...' : 'Finalizar Liga'}</span>
      </button>
    </div>
  );
}

/* ── FINISH AWARD ── */
function FinishAwardForm({ award, onFinish, onResetPanel }) {
  const [winner, setWinner] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!winner.trim()) return;
    setSending(true);
    try { await onFinish(award.id, winner.trim()); onResetPanel(); }
    finally { setSending(false); }
  };

  return (
    <div className="adm-form">
      <div className="adm-finish-title">{award.logo} {award.name} · {award.season}</div>
      <Field label="Ganador del Premio" required>
        <Input placeholder="Nombre del ganador" value={winner} onChange={e => setWinner(e.target.value)} />
      </Field>
      <div className="adm-info-box">Cada predicción correcta otorga 10 puntos.</div>
      <button className="adm-submit-btn adm-submit-btn--green" onClick={submit} disabled={sending}>
        {sending ? <span className="adm-spinner" /> : <CheckCircle size={14} />}
        <span>{sending ? 'Finalizando...' : 'Finalizar Premio'}</span>
      </button>
    </div>
  );
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