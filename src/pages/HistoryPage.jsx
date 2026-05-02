// src/pages/HistoryPage.jsx
import React, { useState } from "react";

import HistoryNavigation      from "../components/ComHistory/HistoryNavigation";
import HistorySearch          from "../components/ComHistory/HistorySearch";
import HistorySidebar         from "../components/ComHistory/HistorySidebar";
import HistoricalPlayerCard   from "../components/ComHistory/HistoricalPlayerCard";
import HistoricalPlayerDetail from "../components/ComHistory/HistoricalPlayerDetail";
import HistoricalEventCard    from "../components/ComHistory/HistoricalEventCard";
import HistoricalEventDetail  from "../components/ComHistory/HistoricalEventDetail";
import HistoryTimeline        from "../components/ComHistory/HistoryTimeline";

import { useHistoricalPlayers }  from "../hooks/HooksHistory/useHistoricalPlayers";
import { useHistoricalEvents }   from "../hooks/HooksHistory/useHistoricalEvents";
import { useHistoricalTimeline } from "../hooks/HooksHistory/useHistoricalTimeline";

import "../styles/StylesPages/HistoryPage.css";

// ── Filter bar for players ────────────────────────────────────
const POSITIONS  = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const LEGACIES   = ["Goal Scorer", "Tactician", "Innovator", "Leader", "Goalkeeper"];
const EVENT_TYPES = ["Championship", "Historic Match", "Legendary Performance", "Era Defining", "Record"];

function FilterPill({ label, value, active, onClick }) {
  return (
    <button
      className={`hp-filter-pill ${active ? "hp-filter-pill--active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="hp-empty">
      <div className="hp-empty-icon">⚽</div>
      <p>{message}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function HistoryPage() {
  const [activeTab, setActiveTab]       = useState("players");
  const [selectedPlayer, setSelectedPlayer] = useState(null); // id
  const [selectedEvent,  setSelectedEvent]  = useState(null); // id
  const [showFilters, setShowFilters]   = useState(false);

  // ── Hooks ──
  const {
    players, loading: playersLoading,
    search: playerSearch, setSearch: setPlayerSearch,
    position, setPosition,
    legacy, setLegacy,
    era, setEra, availableEras,
    getPlayer,
  } = useHistoricalPlayers();

  const {
    events, loading: eventsLoading,
    search: eventSearch, setSearch: setEventSearch,
    eventType, setEventType,
    getEvent,
  } = useHistoricalEvents();

  const { events: timeline, loading: timelineLoading } = useHistoricalTimeline();

  // ── Navigation helpers ──
  const openPlayer  = (player) => setSelectedPlayer(player.id);
  const closePlayer = ()       => setSelectedPlayer(null);
  const openEvent   = (event)  => setSelectedEvent(event.id || event);
  const closeEvent  = ()       => setSelectedEvent(null);

  const handleEventClickFromPlayer = (eventId) => {
    setSelectedPlayer(null);
    setActiveTab("events");
    setSelectedEvent(eventId);
  };

  const handlePlayerClickFromEvent = (playerId) => {
    setSelectedEvent(null);
    setActiveTab("players");
    setSelectedPlayer(playerId);
  };

  // ── counts for nav ──
  const counts = {
    players:  players.length,
    events:   events.length,
    timeline: timeline?.raw?.length || 0,
  };

  // ── DETAIL VIEWS ──
  if (selectedPlayer) {
    return (
      <div className="hp-root page-root">
        <div className="hp-detail-view">
          <HistoricalPlayerDetail
            playerId={selectedPlayer}
            getPlayer={getPlayer}
            onBack={closePlayer}
            onEventClick={handleEventClickFromPlayer}
          />
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <div className="hp-root page-root">
        <div className="hp-detail-view">
          <HistoricalEventDetail
            eventId={selectedEvent}
            getEvent={getEvent}
            onBack={closeEvent}
            onPlayerClick={handlePlayerClickFromEvent}
          />
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="hp-root page-root">

      {/* ── Topbar ── */}
      <div className="hp-topbar">
        <div className="hp-topbar-left">
          <div className="hp-topbar-title-block">
            <div className="hp-topbar-eyebrow">GLOBALSCORE</div>
            <h1 className="hp-topbar-title">Sección Histórica</h1>
          </div>
        </div>
        <div className="hp-topbar-right">
          {/* Search */}
          {activeTab === "players" && (
            <HistorySearch
              value={playerSearch}
              onChange={setPlayerSearch}
              placeholder="Buscar jugador..."
            />
          )}
          {activeTab === "events" && (
            <HistorySearch
              value={eventSearch}
              onChange={setEventSearch}
              placeholder="Buscar evento..."
            />
          )}
        </div>
      </div>

      {/* ── Nav tabs ── */}
      <HistoryNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setShowFilters(false);
        }}
        counts={counts}
      />

      {/* ── Body ── */}
      <div className="hp-body">

        {/* ── PLAYERS ── */}
        {activeTab === "players" && (
          <>
            {/* Filter bar */}
            <div className="hp-filter-bar">
              <div className="hp-filter-group">
                <span className="hp-filter-label">Posición</span>
                <div className="hp-filter-pills">
                  <FilterPill label="Todas" value="all" active={position === "all"} onClick={() => setPosition("all")} />
                  {POSITIONS.map(p => (
                    <FilterPill key={p} label={p} value={p} active={position === p} onClick={() => setPosition(p)} />
                  ))}
                </div>
              </div>
              <div className="hp-filter-group">
                <span className="hp-filter-label">Legado</span>
                <div className="hp-filter-pills">
                  <FilterPill label="Todos" value="all" active={legacy === "all"} onClick={() => setLegacy("all")} />
                  {LEGACIES.map(l => (
                    <FilterPill key={l} label={l} value={l} active={legacy === l} onClick={() => setLegacy(l)} />
                  ))}
                </div>
              </div>
              {availableEras.length > 0 && (
                <div className="hp-filter-group">
                  <span className="hp-filter-label">Era</span>
                  <div className="hp-filter-pills">
                    <FilterPill label="Todas" value="all" active={era === "all"} onClick={() => setEra("all")} />
                    {availableEras.map(e => (
                      <FilterPill key={e} label={e} value={e} active={era === e} onClick={() => setEra(e)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hp-main-area">
              {/* Sidebar desktop */}
              <HistorySidebar players={players} events={events} />

              {/* Players grid */}
              <div className="hp-content-area">
                {playersLoading ? (
                  <div className="hp-loading-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="hp-skeleton-card" />
                    ))}
                  </div>
                ) : players.length === 0 ? (
                  <EmptyState message="No se encontraron jugadores históricos" />
                ) : (
                  <div className="hp-players-grid">
                    {players.map(p => (
                      <HistoricalPlayerCard key={p.id} player={p} onClick={openPlayer} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── EVENTS ── */}
        {activeTab === "events" && (
          <>
            <div className="hp-filter-bar">
              <div className="hp-filter-group">
                <span className="hp-filter-label">Tipo</span>
                <div className="hp-filter-pills">
                  <FilterPill label="Todos" value="all" active={eventType === "all"} onClick={() => setEventType("all")} />
                  {EVENT_TYPES.map(t => (
                    <FilterPill key={t} label={t} value={t} active={eventType === t} onClick={() => setEventType(t)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="hp-main-area">
              <HistorySidebar players={players} events={events} />
              <div className="hp-content-area">
                {eventsLoading ? (
                  <div className="hp-loading-grid">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="hp-skeleton-card hp-skeleton-card--event" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <EmptyState message="No se encontraron eventos históricos" />
                ) : (
                  <div className="hp-events-grid">
                    {events.map(ev => (
                      <HistoricalEventCard key={ev.id} event={ev} onClick={openEvent} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── TIMELINE ── */}
        {activeTab === "timeline" && (
          <div className="hp-timeline-view">
            <HistoryTimeline
              events={timeline}
              loading={timelineLoading}
              onEventClick={openEvent}
            />
          </div>
        )}

      </div>
    </div>
  );
}
