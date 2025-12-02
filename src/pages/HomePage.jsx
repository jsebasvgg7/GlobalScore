import useMatches from "../hooks/useMatches";
import useLeagues from "../hooks/useLeagues";
import useAwards from "../hooks/useAwards";
import useAchievements from "../hooks/useAchievements";

import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import AchievementsSection from "../components/AchievementsSection";

import "../styles/HomePage.css";

export default function HomePage() {
  const { matches, loadingMatches } = useMatches();
  const { leagues, loadingLeagues } = useLeagues();
  const { awards, loadingAwards } = useAwards();
  const { achievements } = useAchievements();

  return (
    <div className="home-wrapper">
      
      {/* ==================== STATS / ACHIEVEMENTS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Estadísticas</h2>
        <AchievementsSection achievements={achievements} />
      </section>

      {/* ==================== PARTIDOS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Próximos Partidos</h2>

        {loadingMatches ? (
          <p className="loading-text">Cargando partidos...</p>
        ) : matches.length === 0 ? (
          <p className="empty-text">No hay partidos disponibles.</p>
        ) : (
          <div className="grid-list">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== LIGAS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Ligas Activas</h2>

        {loadingLeagues ? (
          <p className="loading-text">Cargando ligas...</p>
        ) : leagues.length === 0 ? (
          <p className="empty-text">No hay ligas activas.</p>
        ) : (
          <div className="grid-list">
            {leagues.map((l) => (
              <LeagueCard key={l.id} league={l} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== PREMIOS ==================== */}
      <section className="home-section">
        <h2 className="home-title">Premios</h2>

        {loadingAwards ? (
          <p className="loading-text">Cargando premios...</p>
        ) : awards.length === 0 ? (
          <p className="empty-text">No hay premios disponibles.</p>
        ) : (
          <div className="grid-list">
            {awards.map((a) => (
              <AwardCard key={a.id} award={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
