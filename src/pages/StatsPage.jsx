// src/pages/StatsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, Flame, Trophy, Award,
  Calendar, Clock, Percent, CheckCircle2, XCircle, Activity,
  Zap, Users, ChevronRight, TrendingDown, Minus, Star, Hash
} from 'lucide-react';
// import { supabase } from '../utils/supabaseClient'; // Asumo que esto sigue existiendo
import '../styles/StatsPage.css';

// Componente de Tarjeta de Estadística Principal (Overview)
const OverviewCard = ({ icon: Icon, value, label, colorClass = 'blue' }) => (
  <div className="overview-card">
    <div className={`card-icon ${colorClass}`}>
      <Icon size={28} />
    </div>
    <div className="card-label">{label}</div>
    <div className="card-value">{value}</div>
  </div>
);

// Componente de Tarjeta de Estadística Secundaria (Mini Card para Ligas/Días)
const MiniStatCard = ({ icon: Icon, label, value, typeClass = 'day' }) => (
    <div className={`stat-mini-card ${typeClass}`}>
        <div className="stat-icon-mini">
            <Icon size={24} />
        </div>
        <div className="stat-value-mini">{value}</div>
        <div className="stat-label-mini">{label}</div>
    </div>
);

// Componente para una fila de resultados (barra de progreso)
const ResultItem = ({ icon: Icon, label, total, count, colorClass }) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    const value = count;

    return (
        <div className="result-item">
            <div className="result-label-group">
                <Icon size={18} className={`result-icon ${colorClass}`} style={{color: `var(--accent-${colorClass})`}}/>
                <span className="result-label">{label} ({value})</span>
            </div>
            <div className="result-bar-container">
                <div 
                    className={`result-bar ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                    title={`${percentage}%`}
                ></div>
            </div>
            <span className={`result-percentage ${colorClass}`}>{percentage}%</span>
        </div>
    );
};

export default function StatsPage({ currentUser }) {
  // Mock Data (Reemplaza con tu lógica real de carga)
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week
  const [stats, setStats] = useState({
      totalPredictions: 450,
      exact: 82,
      correctResult: 154,
      wrong: 214,
      points: 1280,
      rank: 12,
      totalUsers: 98,
      streak: 7, // Días consecutivos de predicción exacta
      
      // Detalle de predicciones por liga (Mocked)
      leagueStats: [
          { name: 'Champions League', accuracy: 68, count: 50, icon: Zap },
          { name: 'Premier League', accuracy: 52, count: 120, icon: Star },
          { name: 'LaLiga', accuracy: 45, count: 80, icon: Trophy },
          { name: 'Bundesliga', accuracy: 38, count: 40, icon: Hash },
      ],
      
      // Detalle de predicciones por día de la semana (Mocked)
      dayStats: [
          { day: 'Lun', accuracy: 60, icon: Calendar },
          { day: 'Mar', accuracy: 45, icon: Calendar },
          { day: 'Mié', accuracy: 55, icon: Calendar },
          { day: 'Jue', accuracy: 70, icon: Calendar },
          { day: 'Vie', accuracy: 65, icon: Calendar },
          { day: 'Sáb', accuracy: 40, icon: Calendar },
          { day: 'Dom', accuracy: 50, icon: Calendar },
      ],
  });

  // useEffect(() => {
  //   if (currentUser) {
  //     loadStats();
  //   }
  // }, [currentUser, timeRange]);
  // 
  // const loadStats = async () => {
  //   // ... Tu lógica de carga de datos con Supabase y dateLimit
  // };


  // Cálculos derivados
  const totalCompleted = stats.exact + stats.correctResult + stats.wrong;
  const accuracyPercentage = totalCompleted > 0 ? (stats.exact / totalCompleted * 100).toFixed(1) : 0;
  
  return (
    <div className="stats-page">
      <div className="stats-page-container">
        
        {/* HEADER - Título y Selector de Rango de Tiempo */}
        <header className="stats-page-header">
          <div className="stats-page-title-group">
            <h1 className="stats-page-title">Estadísticas de Predicción</h1>
            <p className="stats-page-subtitle">Analiza tu rendimiento y progresión, {currentUser?.name || 'Usuario'}.</p>
          </div>
          
          <div className="time-range-selector">
            <button 
              className={`time-range-button ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              Todo
            </button>
            <button 
              className={`time-range-button ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Último Mes
            </button>
            <button 
              className={`time-range-button ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Última Semana
            </button>
          </div>
        </header>

        {/* 1. VISIÓN GENERAL (Overview Grid) */}
        <section className="stats-section">
            <h2 className="section-title"><BarChart3 size={20}/> Resumen de Métricas Clave</h2>
            
            <div className="stats-overview-grid">
                <OverviewCard
                    icon={TrendingUp}
                    label="PUNTOS TOTALES"
                    value={stats.points.toLocaleString()}
                    colorClass="blue"
                />
                <OverviewCard
                    icon={Target}
                    label="PRED. EXACTAS"
                    value={stats.exact}
                    colorClass="green"
                />
                <OverviewCard
                    icon={Percent}
                    label="EFECTIVIDAD EXACTA"
                    value={`${accuracyPercentage}%`}
                    colorClass="green"
                />
                <OverviewCard
                    icon={Users}
                    label="POSICIÓN EN RANKING"
                    value={`#${stats.rank}/${stats.totalUsers}`}
                    colorClass="red"
                />
            </div>
        </section>

        {/* 2. RESULTADOS DE PREDICCIÓN Y RACHA (Two Column Grid) */}
        <div className="additional-stats-grid">
            
            {/* IZQUIERDA: RACHA */}
            <div className="stats-section">
                <h2 className="section-title"><Flame size={20}/> Racha de Predicciones</h2>
                
                <div className="streak-card">
                    <span className="streak-icon">🔥</span>
                    <div className="streak-value">{stats.streak}</div>
                    <div className="streak-label">DÍAS CONSECUTIVOS DE EXACTITUD</div>
                    <p style={{fontSize: '13px', opacity: 0.8, fontWeight: 500}}>¡Sigue así para ganar bonificaciones!</p>
                </div>
            </div>
            
            {/* DERECHA: DISTRIBUCIÓN DE RESULTADOS */}
            <div className="stats-section">
                <h2 className="section-title"><Activity size={20}/> Detalle de Resultados ({totalCompleted} PRED)</h2>
                
                <div className="results-list">
                    <ResultItem 
                        icon={Target} 
                        label="Resultado Exacto" 
                        total={totalCompleted}
                        count={stats.exact}
                        colorClass="green"
                    />
                    <ResultItem 
                        icon={CheckCircle2} 
                        label="Resultado Correcto" 
                        total={totalCompleted}
                        count={stats.correctResult}
                        colorClass="blue"
                    />
                    <ResultItem 
                        icon={XCircle} 
                        label="Incorrecto" 
                        total={totalCompleted}
                        count={stats.wrong}
                        colorClass="red"
                    />
                </div>
            </div>
        </div>


        {/* 3. PREDICCIONES POR LIGA Y POR DÍA */}
        <div className="additional-stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            
            {/* PREDICCIONES POR LIGA */}
            <div className="stats-section">
                <h2 className="section-title"><Trophy size={20}/> Rendimiento por Liga</h2>
                
                <div className="league-stats-grid">
                    {stats.leagueStats.map((stat, index) => (
                        <MiniStatCard 
                            key={index} 
                            icon={stat.icon}
                            label={stat.name}
                            value={`${stat.accuracy}%`}
                            typeClass="league"
                        />
                    ))}
                </div>
            </div>
            
            {/* PREDICCIONES POR DÍA */}
            <div className="stats-section">
                <h2 className="section-title"><Calendar size={20}/> Precisión por Día</h2>
                
                <div className="day-stats-grid">
                    {stats.dayStats.map((stat, index) => (
                        <MiniStatCard 
                            key={index} 
                            icon={Clock} // O usa el icono que prefieras para el día
                            label={stat.day}
                            value={`${stat.accuracy}%`}
                            typeClass="day"
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Puedes añadir una sección para Predicciones Pendientes o Premios aquí si es necesario */}

      </div>
      {/* {loading && <LoadingOverlay message="Cargando estadísticas..." />} */}
    </div>
  );
}