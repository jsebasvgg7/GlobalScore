import { useState, useEffect, useRef, useCallback } from "react";
import { Shuffle, ChevronRight, X } from "lucide-react";
import { getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import "./SectionHeaderMobile.css";

// ─── Animación ruleta ─────────────────────────────────────────────────────────
function RouletteSlot({ items, running, winner, onDone, renderItem }) {
    const [displayed, setDisplayed] = useState(null);
    const [phase, setPhase] = useState("idle"); // idle | spinning | reveal
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!running) return;
        setPhase("spinning");
        let i = 0;
        intervalRef.current = setInterval(() => {
            setDisplayed(items[i % items.length]);
            i++;
        }, 80);

        timeoutRef.current = setTimeout(() => {
            clearInterval(intervalRef.current);
            setDisplayed(winner);
            setPhase("reveal");
            onDone?.();
        }, 2800);

        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, [running]);

    if (!displayed && phase === "idle") return null;

    return (
        <div className={`shm-slot ${phase === "spinning" ? "shm-slot--spin" : ""} ${phase === "reveal" ? "shm-slot--reveal" : ""}`}>
            {displayed && renderItem(displayed, phase)}
        </div>
    );
}

// ─── Renders por tipo ─────────────────────────────────────────────────────────
function PlayerSlotItem({ item, phase }) {
    const img = getHistoricalImageUrl(item.image_path);
    return (
        <div className="shm-slot-player">
            <div className="shm-slot-avatar">
                {img
                    ? <img src={img} alt={item.name} />
                    : <span>{item.name?.slice(0, 2).toUpperCase()}</span>
                }
                {item.significance_level === 5 && <span className="shm-slot-goat">GOAT</span>}
            </div>
            <div className="shm-slot-info">
                <span className="shm-slot-name">{item.name}</span>
                <span className="shm-slot-meta">{item.country}{item.position ? ` · ${item.position}` : ""}</span>
            </div>
            {phase === "reveal" && <ChevronRight size={16} className="shm-slot-chevron" />}
        </div>
    );
}

function TeamSlotItem({ item, phase }) {
    const img = getHistoricalImageUrl(item.image_path);
    return (
        <div className="shm-slot-player">
            <div className="shm-slot-avatar shm-slot-avatar--shield">
                {img
                    ? <img src={img} alt={item.name} />
                    : <span>{item.name?.slice(0, 2).toUpperCase()}</span>
                }
            </div>
            <div className="shm-slot-info">
                <span className="shm-slot-name">{item.name}</span>
                <span className="shm-slot-meta">{item.country}{item.era_dominance ? ` · ${item.era_dominance}` : ""}</span>
            </div>
            {phase === "reveal" && <ChevronRight size={16} className="shm-slot-chevron" />}
        </div>
    );
}

function EventSlotItem({ item, phase }) {
    const img = getHistoricalImageUrl(item.banner_image_path || item.image_path);
    const year = item.event_date ? new Date(item.event_date).getFullYear() : null;
    return (
        <div className="shm-slot-event">
            <div className="shm-slot-event-img">
                {img
                    ? <img src={img} alt={item.title} />
                    : <div className="shm-slot-event-ph" />
                }
                {year && <span className="shm-slot-event-year">{year}</span>}
            </div>
            <div className="shm-slot-info">
                <span className="shm-slot-name">{item.title}</span>
                <span className="shm-slot-meta">{item.event_type || ""}</span>
            </div>
            {phase === "reveal" && <ChevronRight size={16} className="shm-slot-chevron" />}
        </div>
    );
}

function CompSlotItem({ item, phase }) {
    const img = getHistoricalImageUrl(item.image_path);
    return (
        <div className="shm-slot-player">
            <div className="shm-slot-avatar shm-slot-avatar--shield">
                {img
                    ? <img src={img} alt={item.name} />
                    : <span>{item.name?.slice(0, 2).toUpperCase()}</span>
                }
            </div>
            <div className="shm-slot-info">
                <span className="shm-slot-name">{item.name}</span>
                <span className="shm-slot-meta">{item.country}{item.year ? ` · ${item.year}` : ""}</span>
            </div>
            {phase === "reveal" && <ChevronRight size={16} className="shm-slot-chevron" />}
        </div>
    );
}

// ─── Config por sección ───────────────────────────────────────────────────────
const SECTION_CONFIG = {
    players: {
        eyebrow: "Archivo Histórico",
        title: "JUGADORES",
        subtitle: "Leyendas del fútbol mundial",
        randomLabel: "Jugador aleatorio",
        SlotItem: PlayerSlotItem,
    },
    teams: {
        eyebrow: "Archivo Histórico",
        title: "EQUIPOS",
        subtitle: "Los grandes equipos de todos los tiempos",
        randomLabel: "Equipo aleatorio",
        SlotItem: TeamSlotItem,
    },
    events: {
        eyebrow: "Archivo Histórico",
        title: "MOMENTOS",
        subtitle: "Eventos que definieron el fútbol",
        randomLabel: "Momento aleatorio",
        SlotItem: EventSlotItem,
    },
    competitions: {
        eyebrow: "Archivo Histórico",
        title: "COMPETICIONES",
        subtitle: "Torneos que marcaron una era",
        randomLabel: "Competición aleatoria",
        SlotItem: CompSlotItem,
    },
};

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function SectionHeaderMobile({ section, items = [], onRandomSelect, onBack }) {
    const config = SECTION_CONFIG[section] || SECTION_CONFIG.players;
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [done, setDone] = useState(false);

    const handleSpin = useCallback(() => {
        if (spinning || items.length === 0) return;
        const picked = items[Math.floor(Math.random() * items.length)];
        setWinner(picked);
        setDone(false);
        setSpinning(true);
    }, [spinning, items]);

    const handleDone = useCallback(() => {
        setSpinning(false);
        setDone(true);
    }, []);

    const handleClear = useCallback(() => {
        setWinner(null);
        setDone(false);
    }, []);

    const handleReveal = useCallback(() => {
        if (winner && done) {
            onRandomSelect?.(winner);
        }
    }, [winner, done, onRandomSelect]);

    return (
        <div className="shm-root">
            {/* Grid background */}
            <div className="shm-bg" aria-hidden="true" />

            <div className="shm-inner">
                {/* Eyebrow */}
                <div className="shm-eyebrow">
                    <span className="shm-eyebrow-line" />
                    <span className="shm-eyebrow-text">{config.eyebrow}</span>
                    <span className="shm-eyebrow-line" />
                </div>

                {/* Título */}
                <div className="shm-title-row">
                    <h1 className="shm-title">
                        <span className="shm-title-solid">{config.title}</span>
                    </h1>
                    <p className="shm-subtitle">{config.subtitle}</p>
                </div>

                {/* Zona aleatoria */}
                <div className="shm-random-zone">
                    {!done && !spinning && (
                        <button
                            className={`shm-spin-btn ${items.length === 0 ? "shm-spin-btn--disabled" : ""}`}
                            onClick={handleSpin}
                            disabled={items.length === 0 || spinning}
                        >
                            <Shuffle size={15} />
                            <span>{config.randomLabel}</span>
                        </button>
                    )}

                    {(spinning || done) && (
                        <div className={`shm-roulette ${done ? "shm-roulette--done" : ""}`}>
                            {/* Indicadores laterales tipo FIFA */}
                            <div className="shm-roulette-arrow shm-roulette-arrow--left" aria-hidden="true">▶</div>
                            <div className="shm-roulette-arrow shm-roulette-arrow--right" aria-hidden="true">◀</div>

                            <button
                                className="shm-roulette-slot"
                                onClick={done ? handleReveal : undefined}
                                disabled={!done}
                            >
                                <RouletteSlot
                                    items={items}
                                    running={spinning}
                                    winner={winner}
                                    onDone={handleDone}
                                    renderItem={(item, phase) => (
                                        <config.SlotItem item={item} phase={phase} />
                                    )}
                                />
                            </button>

                            {done && (
                                <button className="shm-roulette-clear" onClick={handleClear} aria-label="Cerrar">
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}