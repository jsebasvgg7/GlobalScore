import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Zap, Target, Loader } from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';

/* ── helpers ── */
const MONTHS_ES = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

const accuracy = (correct, predictions) =>
  predictions > 0 ? Math.round((correct / predictions) * 100) : 0;

/* ── Avatar ── */
function Avatar({ user }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username}
        className="hp-av hp-av--img"
      />
    );
  }
  return (
    <div className="hp-av hp-av--ph">
      {(user?.username || 'U')[0].toUpperCase()}
    </div>
  );
}

/* ── Rank badge ── */
function RankBadge({ rank }) {
  const cls =
    rank === 1 ? 'hp-badge hp-badge--1' :
      rank === 2 ? 'hp-badge hp-badge--2' :
        rank === 3 ? 'hp-badge hp-badge--3' :
          'hp-badge hp-badge--n';
  return <span className={cls}>{rank}</span>;
}

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */
export default function HistoryPanel() {
  const [months, setMonths] = useState([]);   // [{month, year, participant_count}]
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [snapshot, setSnapshot] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [loadingSnap, setLoadingSnap] = useState(false);
  const [error, setError] = useState(null);

  /* ── Load available months ── */
  useEffect(() => {
    async function fetchMonths() {
      setLoadingMonths(true);
      setError(null);
      try {
        const { data, error: e } = await supabase.rpc('get_snapshot_months');
        if (e) throw e;
        setMonths(data || []);
        setSelectedIdx(0);
      } catch (err) {
        console.error('HistoryPanel fetchMonths:', err);
        setError('No se pudo cargar el historial.');
      } finally {
        setLoadingMonths(false);
      }
    }
    fetchMonths();
  }, []);

  /* ── Load snapshot for selected month ── */
  const loadSnapshot = useCallback(async (m) => {
    if (!m) return;
    setLoadingSnap(true);
    setError(null);
    try {
      const { data, error: e } = await supabase
        .from('monthly_ranking_snapshots')
        .select('*')
        .eq('month', m.month)
        .eq('year', m.year)
        .order('rank', { ascending: true })
        .limit(100);
      if (e) throw e;
      setSnapshot(data || []);
    } catch (err) {
      console.error('HistoryPanel loadSnapshot:', err);
      setError('No se pudo cargar el ranking de este mes.');
    } finally {
      setLoadingSnap(false);
    }
  }, []);

  useEffect(() => {
    if (months.length > 0) loadSnapshot(months[selectedIdx]);
  }, [selectedIdx, months, loadSnapshot]);

  /* ── Nav ── */
  const canPrev = selectedIdx > 0;
  const canNext = selectedIdx < months.length - 1;

  const current = months[selectedIdx];

  /* ── Render ── */
  if (loadingMonths) return <PanelLoader />;

  if (months.length === 0) return <PanelEmpty />;

  return (
    <aside className="hp-root">

      {/* ── HEADER ── */}
      <div className="hp-header">
        <div className="hp-header-dot" />
        <span className="hp-header-title">ARCHIVO · RANKINGS</span>
        <div className="hp-header-dot" />
      </div>

      {/* ── MONTH NAVIGATOR ── */}
      <div className="hp-nav">
        <button
          className="hp-nav-btn"
          onClick={() => setSelectedIdx(i => i - 1)}
          disabled={!canPrev}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="hp-nav-center">
          <span className="hp-nav-month">
            {MONTHS_ES[(current?.month ?? 1) - 1]}
          </span>
          <span className="hp-nav-year">{current?.year}</span>
          <span className="hp-nav-count">
            <Users size={9} />
            {current?.participant_count ?? 0}
          </span>
        </div>

        <button
          className="hp-nav-btn"
          onClick={() => setSelectedIdx(i => i + 1)}
          disabled={!canNext}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── MONTH PILLS ── */}
      <div className="hp-pills">
        {months.map((m, i) => (
          <button
            key={`${m.year}-${m.month}`}
            className={`hp-pill${i === selectedIdx ? ' hp-pill--active' : ''}`}
            onClick={() => setSelectedIdx(i)}
          >
            {MONTHS_ES[m.month - 1]}{String(m.year).slice(2)}
          </button>
        ))}
      </div>

      {/* ── SNAPSHOT LIST ── */}
      <div className="hp-list-wrap">
        {loadingSnap ? (
          <div className="hp-list-loader">
            <Loader size={16} className="hp-spin" />
          </div>
        ) : error ? (
          <div className="hp-list-error">{error}</div>
        ) : snapshot.length === 0 ? (
          <div className="hp-list-empty">Sin datos para este mes</div>
        ) : (
          <>
            {/* thead */}
            <div className="hp-thead">
              <span className="hp-th hp-th--rank">#</span>
              <span className="hp-th hp-th--user">Jugador</span>
              <span className="hp-th hp-th--acc">Prec.</span>
              <span className="hp-th hp-th--pts">Pts</span>
            </div>

            {/* rows */}
            <div className="hp-tbody">
              {snapshot.map((row) => {
                const acc = accuracy(row.correct, row.predictions);
                const topMod =
                  row.rank === 1 ? ' hp-row--gold' :
                    row.rank === 2 ? ' hp-row--silver' :
                      row.rank === 3 ? ' hp-row--bronze' : '';

                return (
                  <div
                    key={row.id}
                    className={`hp-row${topMod}`}
                    style={{ animationDelay: `${Math.min(row.rank - 1, 20) * 18}ms` }}
                  >
                    <RankBadge rank={row.rank} />
                    <div className="hp-row-user">
                      <Avatar user={row} />
                      <div className="hp-row-info">
                        <span className="hp-row-name">{row.username}</span>
                        <span className="hp-row-sub">
                          {row.correct ?? 0} aciertos · {row.predictions ?? 0} pred.
                        </span>
                      </div>
                    </div>
                    <span className="hp-row-acc">{acc}%</span>
                    <span className="hp-row-pts">
                      {fmt(row.points)}
                      <span className="hp-row-pts-lbl">p</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* footer */}
            <div className="hp-footer">
              <Calendar size={10} />
              <span>
                {MONTHS_ES[(current?.month ?? 1) - 1]} {current?.year}
                &nbsp;·&nbsp;{snapshot.length} clasificados
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ── Sub-components ── */
function PanelLoader() {
  return (
    <aside className="hp-root hp-root--center">
      <Loader size={20} className="hp-spin" style={{ color: 'rgba(255,255,255,0.25)' }} />
    </aside>
  );
}

function PanelEmpty() {
  return (
    <aside className="hp-root hp-root--center">
      <Calendar size={28} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 10 }} />
      <p className="hp-empty-msg">Sin historial disponible</p>
      <p className="hp-empty-sub">
        Los rankings se archivan automáticamente al final de cada mes.
      </p>
    </aside>
  );
}
