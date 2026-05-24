import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function FinishMatchForm({ match, onFinish, onClose, styles: s }) {
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
        try {
            await onFinish(match.id, h, a, advancing);
            onClose?.();
        } catch { setError('Error al finalizar'); }
        finally { setLoading(false); }
    };

    return (
        <div className={s.form}>
            <div className={s.matchPreview}>
                <div className={s.matchTeam}>
                    <span className={s.matchLogo}>{match.home_team_logo}</span>
                    <span className={s.matchName}>{match.home_team}</span>
                </div>
                <div className={s.matchVs}>
                    <span>VS</span>
                    {match.is_knockout && <span className={s.matchKo}>⚡ Elim.</span>}
                </div>
                <div className={s.matchTeam}>
                    <span className={s.matchLogo}>{match.away_team_logo}</span>
                    <span className={s.matchName}>{match.away_team}</span>
                </div>
            </div>
            <div className={s.matchMeta}>{match.league} · {match.date}</div>

            <div className={s.scoreRow}>
                <div className={s.field}>
                    <label className={s.label}>Local</label>
                    <input className={`${s.input} ${s.scoreInput}`} type="number" min="0" placeholder="0"
                        value={homeScore} onChange={e => setHomeScore(e.target.value)} autoFocus />
                </div>
                <span className={s.scoreSep}>–</span>
                <div className={s.field}>
                    <label className={s.label}>Visitante</label>
                    <input className={`${s.input} ${s.scoreInput}`} type="number" min="0" placeholder="0"
                        value={awayScore} onChange={e => setAwayScore(e.target.value)} />
                </div>
            </div>

            {match.is_knockout && (
                <div className={s.koSection}>
                    <span className={s.koLabel}>¿Quién pasa?</span>
                    <div className={s.koGrid}>
                        {[
                            { key: 'home', label: match.home_team, logo: match.home_team_logo },
                            { key: 'away', label: match.away_team, logo: match.away_team_logo },
                        ].map(({ key, label, logo }) => (
                            <button key={key} type="button"
                                className={`${s.koBtn} ${advancing === key ? s.koBtnActive : ''}`}
                                onClick={() => setAdvancing(key)}>
                                <span>{logo}</span>
                                <span>{label}</span>
                                {advancing === key && <CheckCircle size={13} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className={s.error}>
                    <AlertCircle size={13} /><span>{error}</span>
                </div>
            )}

            <div className={s.infoBox}>
                ⚠️ Esta acción calculará los puntos de todas las predicciones y no se puede deshacer.
            </div>

            <button className={`${s.submitBtn} ${s.submitBtnGreen}`} onClick={submit} disabled={loading || !canSubmit}>
                {loading ? <span className={s.spinner} /> : <CheckCircle size={14} />}
                <span>{loading ? 'Finalizando...' : 'Finalizar Partido'}</span>
            </button>
        </div>
    );
}