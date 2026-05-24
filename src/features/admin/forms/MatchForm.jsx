import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

export default function MatchForm({ onAdd, onClose, styles: s }) {
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
                ...p, id: value,
                home_team: home, away_team: away,
                date: dateStr, deadLine: dateStr,
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
        if (!form.id || !form.home_team || !form.away_team ||
            !form.date || !form.time || !form.deadLine || !form.deadLine_time) return;
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
            setForm({
                id: '', league: '', home_team: '', away_team: '',
                home_team_logo: '🏠', away_team_logo: '✈️',
                date: '', time: '', deadLine: '', deadLine_time: '', is_knockout: false,
            });
            onClose?.();
        } finally { setSending(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>ID Partido<span className={s.req}>*</span></label>
                    <input className={s.input} name="id" placeholder="match-001" value={form.id} onChange={handleChange} />
                    <span className={s.hint}>Sin espacios, usar guiones</span>
                </div>
                <div className={s.field}>
                    <label className={s.label}>Liga</label>
                    <input className={s.input} name="league" placeholder="Premier League" value={form.league} onChange={handleChange} />
                    <span className={s.hint}>Logo auto</span>
                </div>
            </div>

            <label className={s.toggle}>
                <input type="checkbox" name="is_knockout" checked={form.is_knockout} onChange={handleChange} className={s.toggleCheck} />
                <span className={s.toggleTrack}><span className={s.toggleThumb} /></span>
                <div className={s.toggleLabel}>
                    <span>⚡ Eliminatoria</span>
                    <span className={s.toggleSub}>+2 pts por clasificado</span>
                </div>
            </label>

            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Equipo Local<span className={s.req}>*</span></label>
                    <input className={s.input} name="home_team" placeholder="MUN" value={form.home_team} onChange={handleChange} />
                    <span className={s.hint}>Código 3 letras</span>
                </div>
                <div className={s.field}>
                    <label className={s.label}>Equipo Visitante<span className={s.req}>*</span></label>
                    <input className={s.input} name="away_team" placeholder="LIV" value={form.away_team} onChange={handleChange} />
                    <span className={s.hint}>Código 3 letras</span>
                </div>
            </div>

            {form.home_team && form.away_team && (
                <div className={s.logoPreview}>
                    <div className={s.logoItem}>
                        {form.home_team_logo_url
                            ? <img src={form.home_team_logo_url} alt="" className={s.logoImg} />
                            : <span className={s.logoEmoji}>{form.home_team_logo}</span>}
                        <span>{form.home_team}</span>
                    </div>
                    <span className={s.logoVs}>VS</span>
                    <div className={s.logoItem}>
                        {form.away_team_logo_url
                            ? <img src={form.away_team_logo_url} alt="" className={s.logoImg} />
                            : <span className={s.logoEmoji}>{form.away_team_logo}</span>}
                        <span>{form.away_team}</span>
                    </div>
                </div>
            )}

            <div className={s.sectionSep}>Fecha del partido</div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Fecha<span className={s.req}>*</span></label>
                    <input className={s.input} type="date" name="date" value={form.date} onChange={handleChange} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Hora<span className={s.req}>*</span></label>
                    <input className={s.input} type="time" name="time" value={form.time} onChange={handleChange} />
                </div>
            </div>

            <div className={s.sectionSep}>Límite predicciones</div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Fecha Límite<span className={s.req}>*</span></label>
                    <input className={s.input} type="date" name="deadLine" value={form.deadLine} onChange={handleChange} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Hora Límite<span className={s.req}>*</span></label>
                    <input className={s.input} type="time" name="deadLine_time" value={form.deadLine_time} onChange={handleChange} />
                </div>
            </div>

            <button className={s.submitBtn} onClick={submit} disabled={sending}>
                {sending ? <span className={s.spinner} /> : <Plus size={14} />}
                <span>{sending ? 'Agregando...' : 'Agregar Partido'}</span>
            </button>
        </div>
    );
}