import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import Colors from '../constants/Colors';
import globalStyles from '../styles/globalStyles';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Usuario autenticado, ir al dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          // Usuario no autenticado, ir al login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // En caso de error, ir al login
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  // Mostrar loading mientras verifica autenticación
  return (
    <View style={globalStyles.centerContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}