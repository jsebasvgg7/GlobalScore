import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase, signOut } from '../../services/supabase';
import { clearAll } from '../../services/storage';
import Colors from '../../constants/Colors';
import globalStyles from '../../styles/globalStyles';
import { User, UserStats } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        setUser(profile);
        setStats({
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
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              await clearAll();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  if (loading || !user || !stats) {
    return (
      <View style={globalStyles.centerContainer}>
        <Text style={globalStyles.bodyText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={60}
                color={Colors.textSecondary}
              />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <MaterialCommunityIcons
              name="camera"
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        
        <View style={styles.levelBadge}>
          <MaterialCommunityIcons
            name="star"
            size={16}
            color={Colors.gold}
          />
          <Text style={styles.levelText}>Nivel {user.level}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="trophy"
            size={32}
            color={Colors.primary}
          />
          <Text style={styles.statValue}>{stats.total_points}</Text>
          <Text style={styles.statLabel}>Puntos Totales</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="check-circle"
            size={32}
            color={Colors.success}
          />
          <Text style={styles.statValue}>{stats.correct_predictions}</Text>
          <Text style={styles.statLabel}>Aciertos</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="chart-line"
            size={32}
            color={Colors.info}
          />
          <Text style={styles.statValue}>{stats.accuracy.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Precisión</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="fire"
            size={32}
            color={Colors.warning}
          />
          <Text style={styles.statValue}>{stats.current_streak}</Text>
          <Text style={styles.statLabel}>Racha Actual</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/stats')}
        >
          <MaterialCommunityIcons
            name="chart-box"
            size={24}
            color={Colors.primary}
          />
          <Text style={styles.menuText}>Estadísticas Detalladas</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {/* Navigate to achievements */}}
        >
          <MaterialCommunityIcons
            name="medal"
            size={24}
            color={Colors.gold}
          />
          <Text style={styles.menuText}>Logros</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <MaterialCommunityIcons
            name="cog"
            size={24}
            color={Colors.textSecondary}
          />
          <Text style={styles.menuText}>Configuración</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {/* Open support */}}
        >
          <MaterialCommunityIcons
            name="help-circle"
            size={24}
            color={Colors.info}
          />
          <Text style={styles.menuText}>Ayuda y Soporte</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={Colors.error}
        />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.versionText}>
          GlobalScore v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 32,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  menuSection: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});