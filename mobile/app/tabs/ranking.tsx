import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../services/supabase';
import Colors from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';
import { RankingEntry } from '../../types';

export default function RankingScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'global' | 'friends'>('global');

  useEffect(() => {
    loadRankings();
  }, [filter]);

  const loadRankings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserId(profile.id);
        }
      }

      // Obtener rankings
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, total_points, correct_predictions, total_predictions, level')
        .order('total_points', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const rankingsWithPosition: RankingEntry[] = data.map((user, index) => ({
          user_id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          total_points: user.total_points,
          correct_predictions: user.correct_predictions,
          total_predictions: user.total_predictions,
          accuracy: user.total_predictions > 0 
            ? (user.correct_predictions / user.total_predictions) * 100 
            : 0,
          position: index + 1,
          level: user.level,
        }));
        setRankings(rankingsWithPosition);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankings();
    setRefreshing(false);
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return Colors.gold;
      case 2:
        return Colors.silver;
      case 3:
        return Colors.bronze;
      default:
        return Colors.textMuted;
    }
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) {
      return 'medal';
    }
    return 'circle-outline';
  };

  const renderRankingItem = ({ item }: { item: RankingEntry }) => {
    const isCurrentUser = item.user_id === currentUserId;

    return (
      <TouchableOpacity
        style={[
          styles.rankingCard,
          isCurrentUser && styles.currentUserCard,
        ]}
      >
        <View style={styles.positionContainer}>
          <MaterialCommunityIcons
            name={getMedalIcon(item.position)}
            size={24}
            color={getMedalColor(item.position)}
          />
          <Text
            style={[
              styles.position,
              { color: getMedalColor(item.position) },
            ]}
          >
            {item.position}
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={Colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {item.username}
            {isCurrentUser && ' (Tú)'}
          </Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {item.accuracy.toFixed(0)}% precisión
            </Text>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>
              Nv. {item.level}
            </Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{item.total_points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.bodyText}>Cargando ranking...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'global' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('global')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'global' && styles.filterTextActive,
            ]}
          >
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'friends' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('friends')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'friends' && styles.filterTextActive,
            ]}
          >
            Amigos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <View style={styles.podium}>
          {/* 2nd Place */}
          <View style={styles.podiumPlace}>
            <View style={[styles.podiumAvatar, styles.podiumSecond]}>
              {rankings[1].avatar_url ? (
                <Image
                  source={{ uri: rankings[1].avatar_url }}
                  style={styles.podiumAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={32}
                  color={Colors.textSecondary}
                />
              )}
            </View>
            <MaterialCommunityIcons
              name="medal"
              size={24}
              color={Colors.silver}
            />
            <Text style={styles.podiumName} numberOfLines={1}>
              {rankings[1].username}
            </Text>
            <Text style={styles.podiumPoints}>
              {rankings[1].total_points} pts
            </Text>
          </View>

          {/* 1st Place */}
          <View style={[styles.podiumPlace, styles.podiumFirst]}>
            <View style={styles.crownContainer}>
              <MaterialCommunityIcons
                name="crown"
                size={32}
                color={Colors.gold}
              />
            </View>
            <View style={[styles.podiumAvatar, styles.podiumGold]}>
              {rankings[0].avatar_url ? (
                <Image
                  source={{ uri: rankings[0].avatar_url }}
                  style={styles.podiumAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={Colors.textSecondary}
                />
              )}
            </View>
            <MaterialCommunityIcons
              name="medal"
              size={32}
              color={Colors.gold}
            />
            <Text style={styles.podiumName} numberOfLines={1}>
              {rankings[0].username}
            </Text>
            <Text style={styles.podiumPoints}>
              {rankings[0].total_points} pts
            </Text>
          </View>

          {/* 3rd Place */}
          <View style={styles.podiumPlace}>
            <View style={[styles.podiumAvatar, styles.podiumThird]}>
              {rankings[2].avatar_url ? (
                <Image
                  source={{ uri: rankings[2].avatar_url }}
                  style={styles.podiumAvatarImage}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={32}
                  color={Colors.textSecondary}
                />
              )}
            </View>
            <MaterialCommunityIcons
              name="medal"
              size={24}
              color={Colors.bronze}
            />
            <Text style={styles.podiumName} numberOfLines={1}>
              {rankings[2].username}
            </Text>
            <Text style={styles.podiumPoints}>
              {rankings[2].total_points} pts
            </Text>
          </View>
        </View>
      )}

      {/* Rankings List */}
      <FlatList
        data={rankings}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.centerContainer}>
            <Text style={globalStyles.secondaryText}>
              No hay rankings disponibles
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  podiumPlace: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    marginBottom: 20,
  },
  crownContainer: {
    position: 'absolute',
    top: -40,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
  },
  podiumGold: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: Colors.gold,
  },
  podiumSecond: {
    borderColor: Colors.silver,
  },
  podiumThird: {
    borderColor: Colors.bronze,
  },
  podiumAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
  },
  position: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  avatarContainer: {
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    marginHorizontal: 6,
    color: Colors.textMuted,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});