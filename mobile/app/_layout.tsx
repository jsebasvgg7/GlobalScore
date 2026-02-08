import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import Colors from '../constants/Colors';

// Tema personalizado
const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={customDarkTheme}>
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
            presentation: 'modal',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.white,
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