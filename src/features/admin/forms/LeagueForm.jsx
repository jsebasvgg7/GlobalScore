import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { getLogoUrlByLeagueName } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

export function LeagueForm({ onAdd, onClose, styles: s }) {
    const [form, setForm] = useState({
        id: '', name: '', season: '', logo: '🏆', deadline: '', deadline_time: ''
    });
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
            onClose?.();
        } finally { setSending(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.field}>
                <label className={s.label}>ID Liga<span className={s.req}>*</span></label>
                <input className={s.input} name="id" placeholder="epl-2024" value={form.id} onChange={handleChange} />
                <span className={s.hint}>Sin espacios, usar guiones</span>
            </div>
            <div className={s.field}>
                <label className={s.label}>Nombre<span className={s.req}>*</span></label>
                <input className={s.input} name="name" placeholder="Premier League" value={form.name} onChange={handleChange} />
                <span className={s.hint}>Logo asignado automáticamente</span>
            </div>

            {form.logo_url && (
                <div className={s.logoPreviewSingle}>
                    <img src={form.logo_url} alt="Logo" className={s.logoImgLg} />
                    <span className={s.logoName}>{form.name}</span>
                </div>
            )}

            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Temporada<span className={s.req}>*</span></label>
                    <input className={s.input} name="season" placeholder="2024/25" value={form.season} onChange={handleChange} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Emoji Respaldo</label>
                    <input className={s.input} name="logo" placeholder="🏆" value={form.logo} onChange={handleChange} maxLength={2} />
                </div>
            </div>

            <div className={s.sectionSep}>Fecha límite</div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Fecha<span className={s.req}>*</span></label>
                    <input className={s.input} type="date" name="deadline" value={form.deadline} onChange={handleChange} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Hora<span className={s.req}>*</span></label>
                    <input className={s.input} type="time" name="deadline_time" value={form.deadline_time} onChange={handleChange} />
                </div>
            </div>

            <button className={s.submitBtn} onClick={submit} disabled={sending}>
                {sending ? <span className={s.spinner} /> : <Plus size={14} />}
                <span>{sending ? 'Agregando...' : 'Agregar Liga'}</span>
            </button>
        </div>
    );
}

export function FinishLeagueForm({ league, onFinish, onClose, styles: s }) {
    const [form, setForm] = useState({
        champion: '', top_scorer: '', top_scorer_goals: '',
        top_assist: '', top_assist_count: '', mvp_player: ''
    });
    const [sending, setSending] = useState(false);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = async () => {
        if (Object.values(form).some(v => !v)) return;
        setSending(true);
        try {
            await onFinish(league.id, {
                ...form,
                top_scorer_goals: parseInt(form.top_scorer_goals),
                top_assist_count: parseInt(form.top_assist_count),
            });
            onClose?.();
        } finally { setSending(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.finishTitle}>{league.logo} {league.name} · {league.season}</div>

            <div className={s.field}>
                <label className={s.label}>Campeón<span className={s.req}>*</span></label>
                <input className={s.input} placeholder="Nombre del equipo" value={form.champion} onChange={e => set('champion', e.target.value)} />
            </div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Máx. Goleador<span className={s.req}>*</span></label>
                    <input className={s.input} placeholder="Jugador" value={form.top_scorer} onChange={e => set('top_scorer', e.target.value)} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Goles<span className={s.req}>*</span></label>
                    <input className={s.input} type="number" min="0" placeholder="0" value={form.top_scorer_goals} onChange={e => set('top_scorer_goals', e.target.value)} />
                </div>
            </div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Máx. Asistidor<span className={s.req}>*</span></label>
                    <input className={s.input} placeholder="Jugador" value={form.top_assist} onChange={e => set('top_assist', e.target.value)} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Asistencias<span className={s.req}>*</span></label>
                    <input className={s.input} type="number" min="0" placeholder="0" value={form.top_assist_count} onChange={e => set('top_assist_count', e.target.value)} />
                </div>
            </div>
            <div className={s.field}>
                <label className={s.label}>MVP<span className={s.req}>*</span></label>
                <input className={s.input} placeholder="Jugador MVP" value={form.mvp_player} onChange={e => set('mvp_player', e.target.value)} />
            </div>

            <button className={`${s.submitBtn} ${s.submitBtnGreen}`} onClick={submit} disabled={sending}>
                {sending ? <span className={s.spinner} /> : <CheckCircle size={14} />}
                <span>{sending ? 'Finalizando...' : 'Finalizar Liga'}</span>
            </button>
        </div>
    );
}