// src/pages/RankingPage.jsx — NEW LEADERBOARD DESIGN
import React, { useState, useEffect } from 'react';
import {
  Target, TrendingUp, Calendar, Globe, Zap,
  BarChart3, Crown, Trophy, Users
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Footer from '../components/ComOthers/Footer';
import HallOfFame from '../components/ComOthers/HallOfFame';
import UserProfileModal from '../components/ComOthers/UserProfileModal';
import '../styles/StylesPages/RankingPage.css';

export default function RankingPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankingType, setRankingType] = useState('global');
  const [sortBy, setSortBy] = useState('points');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    checkAndResetMonthly();
    loadUsers();
    loadTopChampions();
  }, []);

  const checkAndResetMonthly = async () => {
    try {
      const now = new Date();
      const { data: config, error: configError } = await supabase
        .from('app_config').select('last_monthly_reset').eq('id', 1).single();
      if (configError && configError.code !== 'PGRST116') return;
      const lastReset = config?.last_monthly_reset ? new Date(config.last_monthly_reset) : new Date(0);
      const monthChanged = (now.getMonth() !== lastReset.getMonth()) || (now.getFullYear() !== lastReset.getFullYear());
      if (monthChanged && now.getDate() === 1) await supabase.rpc('reset_all_monthly_stats');
    } catch (error) { console.error(error); }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('*').order('points', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadTopChampions = async () => {
    try {
      const { data: historyData, error } = await supabase
        .from('monthly_championship_history')
        .select('user_id, points, month_year, awarded_at')
        .order('awarded_at', { ascending: false });
      if (error) throw error;
      if (!historyData?.length) { setChampions([]); return; }

      const map = {};
      historyData.forEach(r => {
        if (!map[r.user_id]) map[r.user_id] = { count: 0, champs: [] };
        map[r.user_id].count++;
        map[r.user_id].champs.push({ points: r.points, monthYear: r.month_year });
      });

      const { data: usersData } = await supabase
        .from('users').select('id, name, avatar_url').in('id', Object.keys(map));
      if (!usersData?.length) { setChampions([]); return; }

      setChampions(
        usersData.map(u => ({
          ...u,
          monthly_championships: map[u.id].count,
          championship_points: map[u.id].champs[0].points,
          championship_month_year: map[u.id].champs[0].monthYear,
        }))
        .sort((a, b) => b.monthly_championships - a.monthly_championships || b.championship_points - a.championship_points)
        .slice(0, 10)
      );
    } catch (err) { console.error(err); setChampions([]); }
  };

  const getRankingData = () => {
    const monthly = rankingType === 'monthly';
    return users.map(u => ({
      ...u,
      rankPoints: monthly ? (u.monthly_points || 0) : (u.points || 0),
      rankCorrect: monthly ? (u.monthly_correct || 0) : (u.correct || 0),
      rankPredictions: monthly ? (u.monthly_predictions || 0) : (u.predictions || 0),
    }));
  };

  const rankingUsers = getRankingData();

  const filteredUsers = [...rankingUsers].sort((a, b) => {
    if (sortBy === 'accuracy') {
      const accA = a.rankPredictions > 0 ? a.rankCorrect / a.rankPredictions : 0;
      const accB = b.rankPredictions > 0 ? b.rankCorrect / b.rankPredictions : 0;
      return accB - accA;
    }
    if (sortBy === 'predictions') return b.rankPredictions - a.rankPredictions;
    return b.rankPoints - a.rankPoints;
  });

  const totalRegistered = rankingUsers.length;
  const totalParticipated = rankingUsers.filter(u => u.rankPredictions > 0).length;
  const top3 = filteredUsers.slice(0, 3);

  const getCurrentMonthLabel = () => {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const Av = ({ user, size = 'md' }) => {
    const cls = `lb-av lb-av-${size}`;
    if (user.avatar_url) return <img src={user.avatar_url} alt={user.name} className={cls} />;
    return <div className={`${cls} lb-av-ph`}>{user.name?.charAt(0).toUpperCase() || '?'}</div>;
  };

  if (loading) return (
    <div className="lb-loading"><div className="lb-spinner" /><p>Cargando ranking…</p></div>
  );

  return (
    <div className="lb-page">
      <div className="lb-container">
        

        {/* HEADER */}
        <div className="lb-header-row">
          <h1 className="lb-page-title">Ranking Globalscore</h1>
          <div className="lb-tabs">
            {[
              { key: 'global',     icon: <Globe size={14} />,    label: 'Global'  },
              { key: 'monthly',    icon: <Calendar size={14} />, label: 'Mensual' },
              { key: 'halloffame', icon: <Crown size={14} />,    label: 'S. Fama' },
            ].map(({ key, icon, label }) => (
              <button key={key} className={`lb-tab ${rankingType === key ? 'active' : ''}`} onClick={() => setRankingType(key)}>
                {icon}<span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      
        {/* HALL OF FAME */}
        {rankingType === 'halloffame' ? (
          <HallOfFame champions={champions} onSelectUser={setSelectedUserId} />
        ) : (
          <>        
            {/* SUMMARY CARDS */}
            <div className="lb-summary-row">
              <div className="lb-summary-card">
                <div className="lb-summary-top">
                  <span className="lb-summary-num">{totalRegistered}</span>
                  <div className="lb-s-icon lb-s-icon-blue"><Users size={16}/></div>
                </div>
                <span className="lb-summary-lbl">Total Registrados</span>
              </div>
              <div className="lb-summary-card">
                <div className="lb-summary-top">
                  <span className="lb-summary-num">{totalParticipated}</span>
                  <div className="lb-s-icon lb-s-icon-green"><Target size={16}/></div>
                </div>
                <span className="lb-summary-lbl">Total Participantes</span>
              </div>
              <div className="lb-summary-card lb-summary-wide">
                <p className="lb-summary-period-title">
                  {rankingType === 'monthly' ? `Mensual — ${getCurrentMonthLabel()}` : 'Clasificación Global'}
                </p>
                <p className="lb-summary-period-sub">
                  {rankingType === 'monthly'
                    ? 'Solo se cuentan puntos del mes actual'
                    : 'Puntos acumulados de toda la temporada'}
                </p>
              </div>
            </div>

              {/* ── Header ── */}
              <div className="hof-header">
                <div className="hof-header-divider">
                <div className="hof-header-line hof-header-line--left" />
                    <Crown size={17} className="hof-header-crown" />
                    <div className="hof-header-line hof-header-line--right" />
                  </div>
                    <h2 className="hof-title">Ranking {rankingType === 'monthly' ? 'Mensual' : 'Global'}</h2>
                <p className="hof-subtitle">Podio</p>
              </div>

              {/* ── TOP 3 CARDS ── */}
              {top3.length >= 1 && (
                <div className="lb-top3-row">
                  {top3.map((user, i) => {
                  const accuracy = user.rankPredictions > 0
                    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;
                  const medals = ['🥇','🥈','🥉'];
                  const ringColors = [
                    'linear-gradient(135deg, #F59E0B, #FCD34D, #F59E0B)',
                    'linear-gradient(135deg, #9CA3AF, #E5E7EB, #9CA3AF)',
                    'linear-gradient(135deg, #CD7F32, #F59E0B, #CD7F32)',
                  ];
                  return (
                    <div key={user.id} className={`lb-top-card lb-top-${i+1}`}>
                      <div className="lb-top-hd">
                        <span className="lb-top-medal">{medals[i]}</span>
                        <span className={`lb-rnk lb-rnk-${i+1}`}>{i+1}</span>
                      </div>
                      <button className="lb-top-identity" onClick={() => setSelectedUserId(user.id)}>
                        {/* Avatar con anillo de color */}
                        <div className="lb-top-avatar-ring" style={{ background: ringColors[i] }}>
                          <div className="lb-top-avatar-inner">
                            <Av user={user} size="lg" />
                          </div>
                        </div>
                        <span className="lb-top-name">{user.name}</span>
                      </button>
                      <div className="lb-top-stats-grid">
                        <div className="lb-top-stat">
                          <span className="lb-ts-l">ACIERTOS</span>
                          <span className="lb-ts-v">{user.rankCorrect}</span>
                        </div>
                        <div className="lb-top-stat">
                          <span className="lb-ts-l">PRED.</span>
                          <span className="lb-ts-v">{user.rankPredictions}</span>
                        </div>
                        <div className="lb-top-stat">
                          <span className="lb-ts-l">PUNTOS</span>
                          <span className="lb-ts-v lb-ts-pts">{user.rankPoints}</span>
                        </div>
                      </div>
                      <div className="lb-top-chips">
                        <span className="lb-chip lb-chip-a"><Trophy size={11}/>{user.rankPoints}</span>
                        <span className="lb-chip lb-chip-b"><Target size={11}/>{accuracy}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FULL TABLE */}
            <div className="lb-card">
              <div className="lb-section-hd"><div>
                </div>
                <div className="lb-sort-row">
                  {[
                    { key: 'points',      icon: <Zap size={12}/>,       label: 'Puntos'    },
                    { key: 'accuracy',    icon: <Target size={12}/>,     label: 'Precisión' },
                    { key: 'predictions', icon: <BarChart3 size={12}/>,  label: 'Actividad' },
                  ].map(({ key, icon, label }) => (
                    <button key={key} className={`lb-sort-btn ${sortBy === key ? 'active' : ''}`} onClick={() => setSortBy(key)}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lb-table">
                <div className="lb-thead">
                  <span className="lbc-rank">Rank</span>
                  <span className="lbc-user">Jugador</span>
                  <span className="lbc-num lbc-hide-sm">Aciertos</span>
                  <span className="lbc-num lbc-hide-sm">Predicciones</span>
                  <span className="lbc-num">Precisión</span>
                  <span className="lbc-num">Puntos</span>
                </div>

                {filteredUsers.map((user, index) => {
                  const accuracy = user.rankPredictions > 0
                    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;
                  const isMe = user.id === currentUser?.id;
                  const pos = index + 1;
                  return (
                    <div key={user.id} className={`lb-trow ${isMe ? 'lb-trow-me' : ''} ${pos <= 3 ? 'lb-trow-top' : ''}`}>
                      <span className="lbc-rank">
                        <span className={`lb-rnk lb-rnk-${Math.min(pos,4)}`}>{pos}</span>
                      </span>
                      <span className="lbc-user">
                        <button className="lb-ucell" onClick={() => setSelectedUserId(user.id)}>
                          <Av user={user} size="sm" />
                          <div className="lb-uinfo">
                            <span className="lb-uname">
                              {user.name}
                              {isMe && <span className="lb-you">Tú</span>}
                            </span>
                          </div>
                        </button>
                      </span>
                      <span className="lbc-num lbc-hide-sm">{user.rankCorrect}</span>
                      <span className="lbc-num lbc-hide-sm">{user.rankPredictions}</span>
                      <span className="lbc-num"><span className="lb-acc">{accuracy}%</span></span>
                      <span className="lbc-num lb-pts">{user.rankPoints}<span className="lb-pts-label">pts</span></span>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="lb-empty">
                  <TrendingUp size={48} className="lb-empty-icon" />
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
      {selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}