import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import Colors from '../constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="worldcup" 
          options={{ 
            title: 'Mundial 2026',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ title: 'Configuración' }} 
        />
        <Stack.Screen 
          name="stats" 
          options={{ title: 'Estadísticas' }} 
        />
      </Stack>
    </PaperProvider>
  );
}