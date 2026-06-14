import { useState, useEffect, useRef } from 'react';
import {
    fetchLandingEvents,
    fetchLandingTeams,
    fetchLandingCounts,
    getHistoricalImageUrl,
} from '@/features/history/services/history.service';
import '../../styles/mobile/HistoryVaultLanding.css';

// ─── Íconos inline ───────────────────────────────────────────
const IconTrophy = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2h12v6a6 6 0 0 1-12 0V2Z" /><path d="M6 4H3a3 3 0 0 0 3 3" /><path d="M18 4h3a3 3 0 0 1-3 3" /><path d="M12 14v4" /><path d="M8 18h8" /></svg>;
const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const IconShield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l8 4v6c0 5-4 9-8 10C8 21 4 17 4 12V6l8-4Z" /></svg>;
const IconStar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const IconPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>;

// ─── Helpers ─────────────────────────────────────────────────
const EVENT_TYPE_LABELS = {
    final: 'FINAL HISTÓRICA',
    debut: 'DEBUT LEGENDARIO',
    legendary_performance: 'LEGENDARY PERFORMANCE',
    record: 'RÉCORD MUNDIAL',
    tournament: 'TORNEO',
    match: 'PARTIDO ICÓNICO',
};

const getEventLabel = (type) => EVENT_TYPE_LABELS[type] || type?.toUpperCase() || 'EVENTO';
const formatYear = (dateStr) => dateStr ? new Date(dateStr).getFullYear() : '';

// ─── Skeleton para stats mientras cargan los conteos ─────────
const StatSkeleton = () => (
    <div className="hvl__stat-skeleton" aria-hidden="true" />
);

// ─── Componente principal ─────────────────────────────────────
export default function HistoryVaultLanding({ onNavigate }) {
    // Fase 1 — carousel (bloquea el render inicial)
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Fase 2 — datos secundarios (se rellenan sin bloquear)
    const [teams, setTeams] = useState([]);
    const [playerCount, setPlayerCount] = useState(null); // null = aún cargando
    const [compCount, setCompCount] = useState(null);

    const [carouselIdx, setCarouselIdx] = useState(0);
    const carouselRef = useRef(null);
    const autoplayRef = useRef(null);

    // ── FASE 1: solo eventos — desbloquea la UI lo antes posible
    useEffect(() => {
        fetchLandingEvents()
            .then((data) => setEvents(data.slice(0, 8)))
            .catch((e) => console.error('HVL events error:', e))
            .finally(() => setLoadingEvents(false));
    }, []);

    // ── FASE 2: counts ligeros + teams — en paralelo, sin bloquear
    useEffect(() => {
        Promise.allSettled([
            fetchLandingCounts(),        // solo COUNT(*), no descarga filas
            fetchLandingTeams(),
        ]).then(([countsRes, teamsRes]) => {
            if (countsRes.status === 'fulfilled') {
                setPlayerCount(countsRes.value.players);
                setCompCount(countsRes.value.competitions);
            }
            if (teamsRes.status === 'fulfilled') {
                setTeams(teamsRes.value.slice(0, 6));
            }
        });
    }, []);

    // ── Autoplay carousel ─────────────────────────────────────
    useEffect(() => {
        if (!events.length) return;
        autoplayRef.current = setInterval(() => {
            setCarouselIdx((prev) => (prev + 1) % events.length);
        }, 4000);
        return () => clearInterval(autoplayRef.current);
    }, [events.length]);

    // ── Scroll carousel al cambiar índice ─────────────────────
    useEffect(() => {
        if (!carouselRef.current) return;
        const card = carouselRef.current.children[carouselIdx];
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [carouselIdx]);

    const handleCarouselScroll = () => {
        if (!carouselRef.current) return;
        const { scrollLeft, offsetWidth } = carouselRef.current;
        setCarouselIdx(Math.round(scrollLeft / offsetWidth));
        clearInterval(autoplayRef.current);
    };

    // ── Solo bloquea mientras llegan los eventos (carousel) ───
    if (loadingEvents) {
        return (
            <div className="hvl-loading">
                <span className="hvl-loading__spinner" aria-hidden="true" />
                <p className="hvl-loading__text">Cargando bóveda…</p>
            </div>
        );
    }

    const SECTIONS = [
        { key: 'competitions', label: 'TORNEOS', desc: 'Torneos y campeonatos históricos.', icon: <IconTrophy />, color: '#F4B942' },
        { key: 'events', label: 'EVENTOS', desc: 'Momentos del fútbol mundial.', icon: <IconStar />, color: '#6C5CE7' },
        { key: 'players', label: 'LEYENDAS', desc: 'Jugadores que cambiaron el juego.', icon: <IconUser />, color: '#00B894' },
    ];

    return (
        <div className="hvl">

            {/* ── HEADER ──────────────────────────────────── */}
            <header className="hvl__header">
                <div className="hvl__breadcrumb">
                    <span className="hvl__breadcrumb-active">GLOBALSCORE</span>
                    <span className="hvl__breadcrumb-sep">|</span>
                    <span className="hvl__breadcrumb-passive">HISTÓRICO</span>
                </div>
                <h1 className="hvl__title">
                    BÓVEDA<br />HISTÓRICA
                </h1>
                <p className="hvl__subtitle">Explora la historia que definió el fútbol.</p>
            </header>

            {/* ── STATS ROW — skeleton hasta que llegan los counts ── */}
            <div className="hvl__stats-wrap">
                <div className="hvl__stats">
                    <div className="hvl__stat-card hvl__stat-card--purple">
                        <IconUser />
                        <div className="hvl__stat-info">
                            {playerCount === null
                                ? <StatSkeleton />
                                : <span className="hvl__stat-num">{playerCount}</span>
                            }
                            <span className="hvl__stat-label">LEYENDAS</span>
                        </div>
                    </div>
                    <div className="hvl__stat-card hvl__stat-card--gold">
                        <IconTrophy />
                        <div className="hvl__stat-info">
                            {compCount === null
                                ? <StatSkeleton />
                                : <span className="hvl__stat-num">{compCount}</span>
                            }
                            <span className="hvl__stat-label">TORNEOS</span>
                        </div>
                    </div>
                    <div className="hvl__stat-card hvl__stat-card--green">
                        <IconShield />
                        <div className="hvl__stat-info">
                            {teams.length === 0
                                ? <StatSkeleton />
                                : <span className="hvl__stat-num">{teams.length}</span>
                            }
                            <span className="hvl__stat-label">EQUIPOS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CAROUSEL ─────────────────────────────────── */}
            {events.length > 0 && (
                <div className="hvl__carousel-wrap">
                    <div className="hvl__carousel-frame">
                        <div
                            className="hvl__carousel"
                            ref={carouselRef}
                            onScroll={handleCarouselScroll}
                        >
                            {events.map((ev) => {
                                const img = getHistoricalImageUrl(ev.image_path);
                                return (
                                    <div
                                        key={ev.id}
                                        className="hvl__carousel-card"
                                        onClick={() => onNavigate?.('event-detail', ev.id)}
                                    >
                                        {img
                                            ? <img src={img} alt={ev.title} className="hvl__carousel-img" />
                                            : <div className="hvl__carousel-img hvl__carousel-img--placeholder" />
                                        }
                                        <div className="hvl__carousel-overlay">
                                            <span className="hvl__carousel-tag">
                                                {getEventLabel(ev.event_type)}
                                            </span>
                                            <div className="hvl__carousel-bottom">
                                                <div>
                                                    <p className="hvl__carousel-year">{formatYear(ev.event_date)}</p>
                                                    <p className="hvl__carousel-title">{ev.title}</p>
                                                </div>
                                                <button
                                                    className="hvl__carousel-arrow"
                                                    onClick={(e) => { e.stopPropagation(); onNavigate?.('event-detail', ev.id); }}
                                                    aria-label="Ver evento"
                                                >
                                                    <IconArrow />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="hvl__carousel-dots">
                        {events.map((_, i) => (
                            <button
                                key={i}
                                className={`hvl__dot ${i === carouselIdx ? 'hvl__dot--active' : ''}`}
                                onClick={() => setCarouselIdx(i)}
                                aria-label={`Ir a slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── EXPLORA POR SECCIONES ─────────────────────── */}
            <section className="hvl__sections">
                <div className="hvl__section-header">
                    <span className="hvl__section-bar" />
                    <h2 className="hvl__section-title">EXPLORA POR SECCIONES</h2>
                </div>
                <div className="hvl__section-grid">
                    {SECTIONS.map((s) => (
                        <button key={s.key} className="hvl__section-card" onClick={() => onNavigate?.(s.key)}>
                            <div className="hvl__section-icon" style={{ backgroundColor: s.color }}>{s.icon}</div>
                            <p className="hvl__section-name">{s.label}</p>
                            <p className="hvl__section-desc">{s.desc}</p>
                            <div className="hvl__section-footer">
                                <div className="hvl__section-arrow" style={{ backgroundColor: s.color }}><IconArrow /></div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── EQUIPOS DESTACADOS ────────────────────────── */}
            {teams.length > 0 && (
                <section className="hvl__teams">
                    <div className="hvl__section-header">
                        <div className="hvl__section-header-row">
                            <span className="hvl__section-bar" />
                            <h2 className="hvl__section-title">EQUIPOS DESTACADOS</h2>
                        </div>
                        <button className="hvl__teams-see-all" onClick={() => onNavigate?.('teams')}>
                            VER TODOS
                            <span className="hvl__teams-see-all-icon"><IconPlus /></span>
                        </button>
                    </div>
                    <div className="hvl__teams-strip">
                        {teams.map((t) => {
                            const img = getHistoricalImageUrl(t.image_path);
                            return (
                                <button key={t.id} className="hvl__team-card" onClick={() => onNavigate?.('team-detail', t.id)}>
                                    <div className="hvl__team-img-wrap">
                                        {img
                                            ? <img src={img} alt={t.name} className="hvl__team-img" />
                                            : <div className="hvl__team-img hvl__team-img--placeholder" />
                                        }
                                    </div>
                                    <p className="hvl__team-name">{t.name?.toUpperCase()}</p>
                                    <p className="hvl__team-era">{t.era_dominance}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

        </div>
    );
}