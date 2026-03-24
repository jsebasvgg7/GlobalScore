import React, { useState, useEffect } from 'react';
import {
  Target, TrendingUp, Calendar, Globe, Zap,
  BarChart3, Crown, Users
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import HallOfFame from '../components/ComOthers/HallOfFame';
import UserProfilePanel from '../components/ComProfile/UserProfilePanel';
import MobileUserProfile from '../components/ComProfile/MobileUserProfile';
import RankingRightPanel from '../components/ComPanels/RankingRightPanel';
import MobileRanking from '../components/ComMobile/MobileRanking';
import HallOfFamePanel from '../components/ComPanels/HallOfFamePanel';
import GlobalLoader from "../components/ComFeedback/GlobalLoader";
import '../styles/StylesPages/RankingPage.css';

export default function RankingPage({ currentUser }) {
  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [rankingType, setRankingType]       = useState('global');
  const [sortBy, setSortBy]                 = useState('points');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [champions, setChampions]           = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
      const monthChanged =
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear();
      if (monthChanged && now.getDate() === 1) await supabase.rpc('reset_all_monthly_stats');
    } catch (error) { console.error(error); }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users').select('*').order('points', { ascending: false });
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
          monthly_championships:   map[u.id].count,
          championship_points:     map[u.id].champs[0].points,
          championship_month_year: map[u.id].champs[0].monthYear,
        }))
        .sort((a, b) =>
          b.monthly_championships - a.monthly_championships ||
          b.championship_points - a.championship_points
        )
        .slice(0, 10)
      );
    } catch (err) { console.error(err); setChampions([]); }
  };

  const getRankingData = () => {
    const monthly = rankingType === 'monthly';
    return users.map(u => ({
      ...u,
      rankPoints:      monthly ? (u.monthly_points      || 0) : (u.points      || 0),
      rankCorrect:     monthly ? (u.monthly_correct     || 0) : (u.correct     || 0),
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

  const totalRegistered   = rankingUsers.length;
  const totalParticipated = rankingUsers.filter(u => u.rankPredictions > 0).length;

  const getCurrentMonthLabel = () => {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const Av = ({ user, size = 'md' }) => {
    const cls = `lb-av lb-av-${size}`;
    if (user.avatar_url) return <img src={user.avatar_url} alt={user.name} className={cls} />;
    return <div className={`${cls} lb-av-ph`}>{user.name?.charAt(0).toUpperCase() || '?'}</div>;
  };

  if (loading) return <GlobalLoader variant="page" />;

  return (
    <>
      {/* ══════════════════════════════════════
          VISTA MOBILE — solo ≤768px
          Componente propio, no toca desktop
      ══════════════════════════════════════ */}
      <MobileRanking
        users={users}
        currentUser={currentUser}
        rankingType={rankingType}
        onChangeType={setRankingType}
        champions={champions}
      />

      {/* ══════════════════════════════════════
          VISTA DESKTOP — solo >768px
      ══════════════════════════════════════ */}
      <div className="lb-shell">

        <div className="lb-page">

          {/* TABS */}
          <div className="lb-tabs-bar">
            <button className={`lb-tab${rankingType === 'global'     ? ' active' : ''}`} onClick={() => setRankingType('global')}>
              <Globe size={13} /><span>Global</span>
            </button>
            <button className={`lb-tab${rankingType === 'monthly'    ? ' active' : ''}`} onClick={() => setRankingType('monthly')}>
              <Calendar size={13} /><span>Mensual</span>
            </button>
            <button className={`lb-tab${rankingType === 'halloffame' ? ' active' : ''}`} onClick={() => setRankingType('halloffame')}>
              <Crown size={13} /><span>S. Fama</span>
            </button>
          </div>

          {rankingType === 'halloffame' ? (
            <div className="lb-hof-wrap">
              <HallOfFame champions={champions} onSelectUser={setSelectedUserId} />
            </div>
          ) : (
            <div className="lb-grid">

              {/* STATS */}
              <div className="lb-row lb-row--stats">
                <div className="lb-stat-block">
                  <span className="lb-stat-num">{totalRegistered}</span>
                  <span className="lb-stat-lbl">Registrados</span>
                  <div className="lb-stat-icon lb-stat-icon--blue"><Users size={13}/></div>
                </div>
                <div className="lb-stat-block">
                  <span className="lb-stat-num">{totalParticipated}</span>
                  <span className="lb-stat-lbl">Participantes</span>
                  <div className="lb-stat-icon lb-stat-icon--green"><Target size={13}/></div>
                </div>
                <div className="lb-stat-block lb-stat-block--wide">
                  <span className="lb-stat-period">
                    {rankingType === 'monthly'
                      ? `Mensual · ${getCurrentMonthLabel()}`
                      : 'Clasificación Global'}
                  </span>
                  <span className="lb-stat-sub">
                    {rankingType === 'monthly'
                      ? 'Puntos del mes · Se reinicia cada mes'
                      : 'Puntos acumulados · Temporada 25/26'}
                  </span>
                </div>
              </div>

              {/* SORT */}
              <div className="lb-row lb-row--sort">
                <span className="lb-sort-label">Ordenar</span>
                <div className="lb-sort-btns">
                  {[
                    { key: 'points',      icon: <Zap size={11}/>,      label: 'Puntos'    },
                    { key: 'accuracy',    icon: <Target size={11}/>,    label: 'Precisión' },
                    { key: 'predictions', icon: <BarChart3 size={11}/>, label: 'Actividad' },
                  ].map(({ key, icon, label }) => (
                    <button
                      key={key}
                      className={`lb-sort-btn${sortBy === key ? ' active' : ''}`}
                      onClick={() => setSortBy(key)}
                    >
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* THEAD */}
              <div className="lb-thead">
                <span className="lbc-rank">Rank</span>
                <span className="lbc-user">Jugador</span>
                <span className="lbc-num lbc-hide-sm">Aciertos</span>
                <span className="lbc-num lbc-hide-sm">Pred.</span>
                <span className="lbc-num">Precisión</span>
                <span className="lbc-num">Puntos</span>
              </div>

              {/* TBODY */}
              <div className="lb-tbody-wrap">
                {filteredUsers.map((user, index) => {
                  const accuracy = user.rankPredictions > 0
                    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;
                  const isMe = user.id === currentUser?.id;
                  const pos  = index + 1;
                  const topMod = pos === 1 ? ' lb-trow--gold'
                               : pos === 2 ? ' lb-trow--silver'
                               : pos === 3 ? ' lb-trow--bronze'
                               : '';
                  return (
                    <div
                      key={user.id}
                      className={`lb-trow${topMod}${isMe ? ' lb-trow--me' : ''}`}
                    >
                      <span className="lbc-rank">
                        <span className={`lb-rnk lb-rnk-${Math.min(pos, 4)}`}>{pos}</span>
                      </span>
                      <span className="lbc-user">
                        <button className="lb-ucell" onClick={() => setSelectedUserId(user.id)}>
                          <Av user={user} size="sm" />
                          <div className="lb-uinfo">
                            <span className="lb-uname">
                              {user.name}
                              {isMe && <span className="lb-you">TÚ</span>}
                            </span>
                            <span className="lb-uname-sub">{user.rankCorrect} aciertos</span>
                          </div>
                        </button>
                      </span>
                      <span className="lbc-num lbc-hide-sm">{user.rankCorrect}</span>
                      <span className="lbc-num lbc-hide-sm">{user.rankPredictions}</span>
                      <span className="lbc-num lb-acc">{accuracy}%</span>
                      <span className="lbc-num lb-pts">
                        {user.rankPoints}<span className="lb-pts-lbl">pts</span>
                      </span>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="lb-empty">
                    <TrendingUp size={32} className="lb-empty-icon" />
                    <p>Sin usuarios</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* PANEL DERECHO */}
        {rankingType !== 'halloffame' ? (
          <RankingRightPanel
            users={users}
            currentUser={currentUser}
            rankingType={rankingType}
          />
        ) : (
          <HallOfFamePanel champions={champions} />
        )}
      </div>

      {selectedUserId && isMobile && (
        <MobileUserProfile
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {selectedUserId && !isMobile && (
        <UserProfilePanel
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}