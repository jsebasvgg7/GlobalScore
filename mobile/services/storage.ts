import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys para storage
export const STORAGE_KEYS = {
  USER_DATA: '@globalscore:user_data',
  AUTH_TOKEN: '@globalscore:auth_token',
  THEME: '@globalscore:theme',
  NOTIFICATIONS_ENABLED: '@globalscore:notifications_enabled',
  LAST_SYNC: '@globalscore:last_sync',
};

// Guardar dato
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

// Obtener dato
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

// Eliminar dato
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

// Limpiar todo el storage
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

// Guardar múltiples datos
export const storeMultiple = async (items: [string, any][]): Promise<void> => {
  try {
    const jsonItems = items.map(([key, value]) => [key, JSON.stringify(value)] as const);
    await AsyncStorage.multiSet(jsonItems);
  } catch (error) {
    console.error('Error storing multiple items:', error);
    throw error;
  }
};