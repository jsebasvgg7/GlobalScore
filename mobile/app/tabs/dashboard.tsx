import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../services/supabase';
import Colors from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';
import { Match, UserStats } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      // Cargar partidos
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['upcoming', 'live'])
        .order('match_date', { ascending: true })
        .limit(10);

      if (matches) {
        setLiveMatches(matches.filter(m => m.status === 'live'));
        setUpcomingMatches(matches.filter(m => m.status === 'upcoming'));
      }

      // Cargar stats del usuario
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (profile) {
        setUserStats({
          total_points: profile.total_points,
          correct_predictions: profile.correct_predictions,
          total_predictions: profile.total_predictions,
          accuracy: profile.total_predictions > 0
            ? (profile.correct_predictions / profile.total_predictions) * 100
            : 0,
          current_streak: profile.current_streak,
          best_streak: profile.best_streak,
          level: profile.level,
          achievements_unlocked: 0,
          ranking_position: 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.bodyText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Stats Card */}
      {userStats && (
        <View style={[globalStyles.card, styles.statsCard]}>
          <View style={globalStyles.rowBetween}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="trophy"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.statValue}>{userStats.total_points}</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color={Colors.success}
              />
              <Text style={styles.statValue}>
                {userStats.accuracy.toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Precisión</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={Colors.warning}
              />
              <Text style={styles.statValue}>{userStats.current_streak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={Colors.gold}
              />
              <Text style={styles.statValue}>Nv. {userStats.level}</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>
        </View>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <View style={styles.section}>
          <View style={globalStyles.rowBetween}>
            <Text style={globalStyles.subtitle}>⚡ En Vivo</Text>
            <View style={[styles.liveBadge]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          {liveMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={[globalStyles.card, styles.matchCard]}
              onPress={() => {/* Navigate to match detail */}}
            >
              <View style={styles.matchHeader}>
                <Text style={styles.leagueText}>{match.league}</Text>
              </View>
              <View style={styles.matchContent}>
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.home_team}</Text>
                  <Text style={styles.score}>{match.home_score ?? '-'}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.away_team}</Text>
                  <Text style={styles.score}>{match.away_score ?? '-'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Upcoming Matches */}
      <View style={styles.section}>
        <Text style={globalStyles.subtitle}>📅 Próximos Partidos</Text>
        {upcomingMatches.length === 0 ? (
          <View style={globalStyles.card}>
            <Text style={globalStyles.secondaryText}>
              No hay partidos próximos disponibles
            </Text>
          </View>
        ) : (
          upcomingMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={[globalStyles.card, styles.matchCard]}
              onPress={() => {/* Navigate to match detail */}}
            >
              <View style={styles.matchHeader}>
                <Text style={styles.leagueText}>{match.league}</Text>
                <Text style={styles.dateText}>
                  {new Date(match.match_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.matchContent}>
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.home_team}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.team}>
                  <Text style={styles.teamName}>{match.away_team}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.predictButton}>
                <MaterialCommunityIcons
                  name="soccer"
                  size={20}
                  color={Colors.white}
                />
                <Text style={styles.predictButtonText}>Predecir</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={globalStyles.subtitle}>⚡ Acciones Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/worldcup')}
          >
            <MaterialCommunityIcons
              name="earth"
              size={32}
              color={Colors.primary}
            />
            <Text style={styles.quickActionText}>Mundial 2026</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/stats')}
          >
            <MaterialCommunityIcons
              name="chart-box"
              size={32}
              color={Colors.info}
            />
            <Text style={styles.quickActionText}>Estadísticas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginRight: 4,
  },
  liveText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchCard: {
    marginTop: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leagueText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  vs: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  predictButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});