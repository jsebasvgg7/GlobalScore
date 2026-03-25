import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, CheckCircle, X, Trophy, Target, Award, Shield,
  Package, Crown, Image, Home, Plane, Calendar, Clock,
  Zap, Star, Flame, AlertCircle, ChevronLeft, Trash2,
  Edit2, UserCheck, Search, ChevronUp, Settings
} from 'lucide-react';
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect, getLogoUrlByLeagueName, getLogoUrlByAwardName } from '../../utils/logoHelper.js';
import { supabase } from '../../utils/supabaseClient.js';

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
    matches:      '#1D9E75',
    leagues:      '#f5a623',
    awards:       '#f25f5c',
    achievements: 'var(--accent)',
    titles:       '#3b82f6',
    crowns:       '#c9a227',
    banners:      'var(--accent)',
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
   ADD MATCH FORM
================================================================ */
function AddMatchForm({ onAdd, onClose }) {
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
      await onAdd({
        id: form.id, league: form.league,
        home_team: form.home_team, away_team: form.away_team,
        home_team_logo: form.home_team_logo, away_team_logo: form.away_team_logo,
        home_team_logo_url: getLogoUrlByTeamName(supabase, form.home_team, form.league),
        away_team_logo_url: getLogoUrlByTeamName(supabase, form.away_team, form.league),
        league_logo_url: getLeagueLogoUrlDirect(form.league),
        date: form.date, time: form.time,
        deadline: `${form.deadLine}T${form.deadLine_time}:00`,
        status: 'pending', is_knockout: form.is_knockout,
      });
      onClose();
    } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <div className="mba-row-2">
        <Field label="ID Partido" required hint="Sin espacios">
          <Input name="id" placeholder="match-001" value={form.id} onChange={handleChange} />
        </Field>
        <Field label="Liga" hint="Logo auto">
          <Input name="league" placeholder="Premier League" value={form.league} onChange={handleChange} />
        </Field>
      </div>

      <label className="mba-toggle-row">
        <input type="checkbox" name="is_knockout" checked={form.is_knockout} onChange={handleChange} className="mba-toggle-check" />
        <span className="mba-toggle-track"><span className="mba-toggle-thumb" /></span>
        <div className="mba-toggle-label">
          <span>⚡ Eliminatoria</span>
          <span className="mba-toggle-sub">+2 pts por clasificado</span>
        </div>
      </label>

      <div className="mba-row-2">
        <Field label="Local" required hint="Código 3 letras">
          <Input name="home_team" placeholder="MUN" value={form.home_team} onChange={handleChange} />
        </Field>
        <Field label="Visitante" required hint="Código 3 letras">
          <Input name="away_team" placeholder="LIV" value={form.away_team} onChange={handleChange} />
        </Field>
      </div>

      {form.home_team && form.away_team && (
        <div className="mba-logo-preview">
          <div className="mba-logo-item">
            {form.home_team_logo_url
              ? <img src={form.home_team_logo_url} alt="" className="mba-logo-img" />
              : <span>{form.home_team_logo}</span>}
            <span>{form.home_team}</span>
          </div>
          <span className="mba-vs">VS</span>
          <div className="mba-logo-item">
            {form.away_team_logo_url
              ? <img src={form.away_team_logo_url} alt="" className="mba-logo-img" />
              : <span>{form.away_team_logo}</span>}
            <span>{form.away_team}</span>
          </div>
        </div>
      )}

      <div className="mba-sep-label">Fecha del partido</div>
      <div className="mba-row-2">
        <Field label="Fecha" required><Input type="date" name="date" value={form.date} onChange={handleChange} /></Field>
        <Field label="Hora" required><Input type="time" name="time" value={form.time} onChange={handleChange} /></Field>
      </div>

      <div className="mba-sep-label">Límite predicciones</div>
      <div className="mba-row-2">
        <Field label="Fecha Límite" required><Input type="date" name="deadLine" value={form.deadLine} onChange={handleChange} /></Field>
        <Field label="Hora Límite" required><Input type="time" name="deadLine_time" value={form.deadLine_time} onChange={handleChange} /></Field>
      </div>

      <button className="mba-submit-btn mba-submit-btn--green" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <Plus size={16} />}
        <span>{sending ? 'Agregando...' : 'Agregar Partido'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   ADD LEAGUE FORM
================================================================ */
function AddLeagueForm({ onAdd, onClose }) {
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
      await onAdd({ ...form, logo_url: getLogoUrlByLeagueName(supabase, form.name), deadline: `${form.deadline}T${form.deadline_time}:00`, status: 'active' });
      onClose();
    } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <Field label="ID Liga" required hint="Sin espacios, usar guiones"><Input name="id" placeholder="epl-2024" value={form.id} onChange={handleChange} /></Field>
      <Field label="Nombre" required hint="Logo asignado automáticamente"><Input name="name" placeholder="Premier League" value={form.name} onChange={handleChange} /></Field>
      {form.logo_url && (
        <div className="mba-logo-preview mba-logo-preview--single">
          <img src={form.logo_url} alt="Logo" className="mba-logo-img-lg" />
          <span>{form.name}</span>
        </div>
      )}
      <div className="mba-row-2">
        <Field label="Temporada" required><Input name="season" placeholder="2024/25" value={form.season} onChange={handleChange} /></Field>
        <Field label="Emoji Respaldo"><Input name="logo" placeholder="🏆" value={form.logo} onChange={handleChange} maxLength={2} /></Field>
      </div>
      <div className="mba-sep-label">Fecha límite</div>
      <div className="mba-row-2">
        <Field label="Fecha" required><Input type="date" name="deadline" value={form.deadline} onChange={handleChange} /></Field>
        <Field label="Hora" required><Input type="time" name="deadline_time" value={form.deadline_time} onChange={handleChange} /></Field>
      </div>
      <button className="mba-submit-btn mba-submit-btn--amber" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <Plus size={16} />}
        <span>{sending ? 'Agregando...' : 'Agregar Liga'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   ADD AWARD FORM
================================================================ */
function AddAwardForm({ onAdd, onClose }) {
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
      await onAdd({ ...form, logo_url: getLogoUrlByAwardName(supabase, form.name), deadline: `${form.deadline}T${form.deadline_time}:00`, status: 'active' });
      onClose();
    } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <Field label="ID Premio" required hint="Sin espacios, usar guiones"><Input name="id" placeholder="balon-oro-2024" value={form.id} onChange={handleChange} /></Field>
      <Field label="Nombre" required hint="Logo asignado automáticamente"><Input name="name" placeholder="Balón de Oro" value={form.name} onChange={handleChange} /></Field>
      <div className="mba-row-2">
        <Field label="Temporada" required><Input name="season" placeholder="2024" value={form.season} onChange={handleChange} /></Field>
        <Field label="Categoría">
          <Sel name="category" value={form.category} onChange={e => set('category', e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Sel>
        </Field>
      </div>
      <div className="mba-sep-label">Fecha límite</div>
      <div className="mba-row-2">
        <Field label="Fecha" required><Input type="date" name="deadline" value={form.deadline} onChange={handleChange} /></Field>
        <Field label="Hora" required><Input type="time" name="deadline_time" value={form.deadline_time} onChange={handleChange} /></Field>
      </div>
      <button className="mba-submit-btn mba-submit-btn--red" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <Plus size={16} />}
        <span>{sending ? 'Agregando...' : 'Agregar Premio'}</span>
      </button>
    </div>
  );
}

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
   FINISH MATCH FORM (mobile)
================================================================ */
function FinishMatchForm({ match, onFinish, onClose }) {
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
    try { await onFinish(match.id, h, a, advancing); onClose(); }
    catch { setError('Error al finalizar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mba-form">
      <div className="mba-match-preview">
        <div className="mba-match-team">
          <span className="mba-match-logo">{match.home_team_logo}</span>
          <span className="mba-match-name">{match.home_team}</span>
        </div>
        <div className="mba-match-vs">
          <span>VS</span>
          {match.is_knockout && <span className="mba-ko-badge">⚡ Elim.</span>}
        </div>
        <div className="mba-match-team">
          <span className="mba-match-logo">{match.away_team_logo}</span>
          <span className="mba-match-name">{match.away_team}</span>
        </div>
      </div>
      <div className="mba-meta">{match.league} · {match.date}</div>

      <div className="mba-score-row">
        <div className="mba-field">
          <label className="mba-label">Local</label>
          <input className="mba-input mba-score-input" type="number" min="0" placeholder="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} autoFocus />
        </div>
        <span className="mba-score-sep">–</span>
        <div className="mba-field">
          <label className="mba-label">Visitante</label>
          <input className="mba-input mba-score-input" type="number" min="0" placeholder="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} />
        </div>
      </div>

      {match.is_knockout && (
        <div className="mba-ko-section">
          <span className="mba-ko-label">¿Quién pasa?</span>
          <div className="mba-ko-grid">
            {[{ key: 'home', label: match.home_team, logo: match.home_team_logo },
              { key: 'away', label: match.away_team, logo: match.away_team_logo }].map(({ key, label, logo }) => (
              <button key={key} type="button"
                className={`mba-ko-btn ${advancing === key ? 'active' : ''}`}
                onClick={() => setAdvancing(key)}>
                <span>{logo}</span><span>{label}</span>
                {advancing === key && <CheckCircle size={13} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="mba-error"><AlertCircle size={13} /><span>{error}</span></div>}

      <div className="mba-info-box">⚠️ Esta acción calculará los puntos y no se puede deshacer.</div>

      <button className="mba-submit-btn mba-submit-btn--green" onClick={submit} disabled={loading || !canSubmit}>
        {loading ? <span className="mba-spinner" /> : <CheckCircle size={16} />}
        <span>{loading ? 'Finalizando...' : 'Finalizar Partido'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   FINISH LEAGUE FORM (mobile)
================================================================ */
function FinishLeagueForm({ league, onFinish, onClose }) {
  const [form, setForm] = useState({ champion: '', top_scorer: '', top_scorer_goals: '', top_assist: '', top_assist_count: '', mvp_player: '' });
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (Object.values(form).some(v => !v)) return;
    setSending(true);
    try {
      await onFinish(league.id, { ...form, top_scorer_goals: parseInt(form.top_scorer_goals), top_assist_count: parseInt(form.top_assist_count) });
      onClose();
    } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <div className="mba-finish-title">{league.logo} {league.name} · {league.season}</div>
      <Field label="Campeón" required><Input placeholder="Nombre del equipo" value={form.champion} onChange={e => set('champion', e.target.value)} /></Field>
      <div className="mba-row-2">
        <Field label="Máx. Goleador" required><Input placeholder="Jugador" value={form.top_scorer} onChange={e => set('top_scorer', e.target.value)} /></Field>
        <Field label="Goles" required><Input type="number" min="0" placeholder="0" value={form.top_scorer_goals} onChange={e => set('top_scorer_goals', e.target.value)} /></Field>
      </div>
      <div className="mba-row-2">
        <Field label="Máx. Asistidor" required><Input placeholder="Jugador" value={form.top_assist} onChange={e => set('top_assist', e.target.value)} /></Field>
        <Field label="Asistencias" required><Input type="number" min="0" placeholder="0" value={form.top_assist_count} onChange={e => set('top_assist_count', e.target.value)} /></Field>
      </div>
      <Field label="MVP" required><Input placeholder="Jugador MVP" value={form.mvp_player} onChange={e => set('mvp_player', e.target.value)} /></Field>
      <button className="mba-submit-btn mba-submit-btn--green" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <CheckCircle size={16} />}
        <span>{sending ? 'Finalizando...' : 'Finalizar Liga'}</span>
      </button>
    </div>
  );
}

/* ================================================================
   FINISH AWARD FORM (mobile)
================================================================ */
function FinishAwardForm({ award, onFinish, onClose }) {
  const [winner, setWinner] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!winner.trim()) return;
    setSending(true);
    try { await onFinish(award.id, winner.trim()); onClose(); } finally { setSending(false); }
  };

  return (
    <div className="mba-form">
      <div className="mba-finish-title">{award.logo} {award.name} · {award.season}</div>
      <Field label="Ganador del Premio" required><Input placeholder="Nombre del ganador" value={winner} onChange={e => setWinner(e.target.value)} /></Field>
      <div className="mba-info-box">Cada predicción correcta otorga 10 puntos.</div>
      <button className="mba-submit-btn mba-submit-btn--green" onClick={submit} disabled={sending}>
        {sending ? <span className="mba-spinner" /> : <CheckCircle size={16} />}
        <span>{sending ? 'Finalizando...' : 'Finalizar Premio'}</span>
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

/* ================================================================
   MAIN EXPORT — MobileAdminSheet
   Este componente reemplaza/complementa el panel derecho en mobile
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
    matches:      '#1D9E75',
    leagues:      '#f5a623',
    awards:       '#f25f5c',
    achievements: 'var(--accent)',
    titles:       '#3b82f6',
    crowns:       '#c9a227',
    banners:      'var(--accent)',
  };

  const sectionTitles = {
    matches:      { add: 'Agregar Partido',   finish: 'Finalizar Partido',   edit: 'Editar Partido' },
    leagues:      { add: 'Agregar Liga',       finish: 'Finalizar Liga',       edit: 'Editar' },
    awards:       { add: 'Agregar Premio',     finish: 'Finalizar Premio',     edit: 'Editar' },
    achievements: { add: 'Nuevo Logro',        finish: '',                     edit: 'Editar Logro' },
    titles:       { add: 'Nuevo Título',       finish: '',                     edit: 'Editar Título' },
    crowns:       { add: 'Otorgar Corona',     finish: '',                     edit: '' },
    banners:      { add: 'Crear Banner',       finish: '',                     edit: '',  assign: 'Asignar Banner' },
  };

  const color = panelMode === 'finish' ? '#1D9E75' : sectionColors[activeSection] || 'var(--accent)';
  const title = sectionTitles[activeSection]?.[panelMode] || sectionTitles[activeSection]?.add || 'Panel Admin';

  const renderContent = () => {
    if (panelMode === 'finish' && panelItem) {
      if (activeSection === 'matches') return <FinishMatchForm match={panelItem} onFinish={onFinish} onClose={onClose} />;
      if (activeSection === 'leagues') return <FinishLeagueForm league={panelItem} onFinish={onFinish} onClose={onClose} />;
      if (activeSection === 'awards')  return <FinishAwardForm award={panelItem} onFinish={onFinish} onClose={onClose} />;
    }
    if (panelMode === 'edit' && panelItem) {
      if (activeSection === 'achievements') return <EditAchievementForm item={panelItem} onSave={onSave} onDelete={onDelete} onClose={onClose} />;
    }

    switch (activeSection) {
      case 'matches':      return <AddMatchForm onAdd={onAdd} onClose={onClose} />;
      case 'leagues':      return <AddLeagueForm onAdd={onAdd} onClose={onClose} />;
      case 'awards':       return <AddAwardForm onAdd={onAdd} onClose={onClose} />;
      case 'achievements': return <AddAchievementForm onAdd={onAdd} onClose={onClose} />;
      case 'crowns':       return <AddCrownForm onAdd={onAdd} onClose={onClose} />;
      case 'banners':      return <AddBannerForm onAdd={onAdd} onClose={onClose} />;
      default: return <AddMatchForm onAdd={onAdd} onClose={onClose} />;
    }
  };

  return (
    <MobileBottomSheet isOpen={isOpen} onClose={onClose} title={title} color={color}>
      {renderContent()}
    </MobileBottomSheet>
  );
}