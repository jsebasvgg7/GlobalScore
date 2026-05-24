import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { getLogoUrlByAwardName } from '@/shared/utils/logoHelper.js';
import { supabase } from '@/shared/services/supabase/client';

const CATS = ['Individual', 'Equipo', 'Goleador', 'Portero', 'Joven', 'Fair Play'];

export function AwardForm({ onAdd, onClose, styles: s }) {
    const [form, setForm] = useState({
        id: '', name: '', season: '', logo: '🏆',
        category: 'Individual', deadline: '', deadline_time: ''
    });
    const [sending, setSending] = useState(false);
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
            onClose?.();
        } finally { setSending(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.field}>
                <label className={s.label}>ID Premio<span className={s.req}>*</span></label>
                <input className={s.input} name="id" placeholder="balon-oro-2024" value={form.id} onChange={handleChange} />
                <span className={s.hint}>Sin espacios, usar guiones</span>
            </div>
            <div className={s.field}>
                <label className={s.label}>Nombre<span className={s.req}>*</span></label>
                <input className={s.input} name="name" placeholder="Balón de Oro" value={form.name} onChange={handleChange} />
                <span className={s.hint}>Logo asignado automáticamente</span>
            </div>
            <div className={s.row2}>
                <div className={s.field}>
                    <label className={s.label}>Temporada<span className={s.req}>*</span></label>
                    <input className={s.input} name="season" placeholder="2024" value={form.season} onChange={handleChange} />
                </div>
                <div className={s.field}>
                    <label className={s.label}>Categoría</label>
                    <select className={s.input} name="category" value={form.category} onChange={handleChange}>
                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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
                <span>{sending ? 'Agregando...' : 'Agregar Premio'}</span>
            </button>
        </div>
    );
}

export function FinishAwardForm({ award, onFinish, onClose, styles: s }) {
    const [winner, setWinner] = useState('');
    const [sending, setSending] = useState(false);

    const submit = async () => {
        if (!winner.trim()) return;
        setSending(true);
        try { await onFinish(award.id, winner.trim()); onClose?.(); }
        finally { setSending(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.finishTitle}>{award.logo} {award.name} · {award.season}</div>
            <div className={s.field}>
                <label className={s.label}>Ganador del Premio<span className={s.req}>*</span></label>
                <input className={s.input} placeholder="Nombre del ganador" value={winner} onChange={e => setWinner(e.target.value)} />
            </div>
            <div className={s.infoBox}>Cada predicción correcta otorga 10 puntos.</div>
            <button className={`${s.submitBtn} ${s.submitBtnGreen}`} onClick={submit} disabled={sending}>
                {sending ? <span className={s.spinner} /> : <CheckCircle size={14} />}
                <span>{sending ? 'Finalizando...' : 'Finalizar Premio'}</span>
            </button>
        </div>
    );
}