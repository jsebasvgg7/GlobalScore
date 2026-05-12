// ============================================
// OFFLINE SYNC SERVICE 
// ============================================

import { supabase } from '../utils/supabaseClient';

class OfflineSyncService {
  constructor() {
    this.dbName = 'GlobalScoreOffline';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    
    this.initDB();
    this.setupOnlineListener();
  }

  // ============================================
  // 🗄️ INICIALIZAR INDEXEDDB
  // ============================================
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ [Offline] Error abriendo IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ [Offline] IndexedDB inicializado');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para predicciones pendientes
        if (!db.objectStoreNames.contains('predictions')) {
          const predictionsStore = db.createObjectStore('predictions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          predictionsStore.createIndex('match_id', 'match_id', { unique: false });
          predictionsStore.createIndex('user_id', 'user_id', { unique: false });
          predictionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          predictionsStore.createIndex('synced', 'synced', { unique: false });
          
          console.log('📦 [Offline] Store "predictions" creado');
        }

        // Store para datos cacheados
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          
          console.log('📦 [Offline] Store "cache" creado');
        }

        // Store para configuración offline
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
          console.log('📦 [Offline] Store "config" creado');
        }
      };
    });
  }

  // ============================================
  // 🌐 LISTENER DE CONEXIÓN
  // ============================================
  setupOnlineListener() {
    window.addEventListener('online', async () => {
      console.log('✅ [Offline] Conexión restaurada');
      this.isOnline = true;
      await this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      console.log('⚠️ [Offline] Sin conexión a internet');
      this.isOnline = false;
    });
  }

  // ============================================
  // 💾 GUARDAR PREDICCIÓN OFFLINE
  // ============================================
  async savePredictionOffline(prediction) {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['predictions'], 'readwrite');
      const store = transaction.objectStore('predictions');

      const predictionData = {
        ...prediction,
        timestamp: Date.now(),
        synced: false,
        offline: true
      };

      const request = store.add(predictionData);

      request.onsuccess = () => {
        console.log('💾 [Offline] Predicción guardada offline:', request.result);
        resolve({ 
          success: true, 
          id: request.result,
          offline: true 
        });
      };

      request.onerror = () => {
        console.error('❌ [Offline] Error guardando predicción:', request.error);
        reject(request.error);
      };
    });
  }

  // ============================================
  // 📊 OBTENER PREDICCIONES PENDIENTES
  // ============================================
  async getPendingPredictions(userId = null) {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['predictions'], 'readonly');
      const store = transaction.objectStore('predictions');
      const index = store.index('synced');
      
      const request = index.getAll(false); // false = no sincronizadas

      request.onsuccess = () => {
        let predictions = request.result;
        
        // Filtrar por userId si se proporciona
        if (userId) {
          predictions = predictions.filter(p => p.user_id === userId);
        }

        console.log('📊 [Offline] Predicciones pendientes:', predictions.length);
        resolve(predictions);
      };

      request.onerror = () => {
        console.error('❌ [Offline] Error obteniendo predicciones:', request.error);
        reject(request.error);
      };
    });
  }

  // ============================================
  // 🔄 SINCRONIZAR PREDICCIONES PENDIENTES
  // ============================================
  async syncPendingData() {
    if (!this.isOnline) {
      console.log('⚠️ [Offline] Sin conexión para sincronizar');
      return { success: false, reason: 'offline' };
    }

    try {
      const pendingPredictions = await this.getPendingPredictions();

      if (pendingPredictions.length === 0) {
        console.log('✅ [Offline] No hay predicciones pendientes');
        return { success: true, synced: 0 };
      }

      console.log(`🔄 [Offline] Sincronizando ${pendingPredictions.length} predicciones...`);

      let syncedCount = 0;
      let errors = [];

      for (const prediction of pendingPredictions) {
        try {
          // Enviar predicción a Supabase
          const { data, error } = await supabase
            .from('predictions')
            .insert({
              match_id: prediction.match_id,
              user_id: prediction.user_id,
              home_score: prediction.home_score,
              away_score: prediction.away_score,
              predicted_advancing_team: prediction.predicted_advancing_team
            })
            .select()
            .single();

          if (error) throw error;

          // Marcar como sincronizada
          await this.markAsSynced(prediction.id);
          syncedCount++;

          console.log('✅ [Offline] Predicción sincronizada:', data.id);

        } catch (error) {
          console.error('❌ [Offline] Error sincronizando predicción:', error);
          errors.push({
            predictionId: prediction.id,
            error: error.message
          });
        }
      }

      // Limpiar predicciones antiguas sincronizadas
      await this.cleanSyncedPredictions();

      const result = {
        success: true,
        synced: syncedCount,
        total: pendingPredictions.length,
        errors: errors.length > 0 ? errors : null
      };

      console.log('🎉 [Offline] Sincronización completada:', result);

      // Notificar al usuario si se sincronizaron predicciones
      if (syncedCount > 0) {
        this.showSyncNotification(syncedCount);
      }

      return result;

    } catch (error) {
      console.error('❌ [Offline] Error en sincronización:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ============================================
  // ✅ MARCAR PREDICCIÓN COMO SINCRONIZADA
  // ============================================
  async markAsSynced(id) {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['predictions'], 'readwrite');
      const store = transaction.objectStore('predictions');
      
      const request = store.get(id);

      request.onsuccess = () => {
        const prediction = request.result;
        
        if (prediction) {
          prediction.synced = true;
          prediction.syncedAt = Date.now();
          
          const updateRequest = store.put(prediction);
          
          updateRequest.onsuccess = () => {
            resolve({ success: true });
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve({ success: false, reason: 'not_found' });
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ============================================
  // 🗑️ LIMPIAR PREDICCIONES SINCRONIZADAS
  // ============================================
  async cleanSyncedPredictions(olderThanDays = 7) {
    if (!this.db) {
      await this.initDB();
    }

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['predictions'], 'readwrite');
      const store = transaction.objectStore('predictions');
      const request = store.openCursor();

      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          const prediction = cursor.value;
          
          // Eliminar si está sincronizada y es vieja
          if (prediction.synced && prediction.syncedAt < cutoffTime) {
            cursor.delete();
            deletedCount++;
          }
          
          cursor.continue();
        } else {
          console.log(`🗑️ [Offline] ${deletedCount} predicciones antiguas eliminadas`);
          resolve({ deletedCount });
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ============================================
  // 💾 CACHEAR DATOS (para uso offline)
  // ============================================
  async cacheData(key, data, ttl = 86400000) { // TTL default: 1 día
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const cacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      const request = store.put(cacheEntry);

      request.onsuccess = () => {
        console.log('💾 [Offline] Datos cacheados:', key);
        resolve({ success: true });
      };

      request.onerror = () => {
        console.error('❌ [Offline] Error cacheando datos:', request.error);
        reject(request.error);
      };
    });
  }

  // ============================================
  // 📦 OBTENER DATOS CACHEADOS
  // ============================================
  async getCachedData(key) {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Verificar si expiró
        if (entry.expiresAt < Date.now()) {
          console.log('⏰ [Offline] Caché expirado:', key);
          resolve(null);
          return;
        }

        console.log('✅ [Offline] Datos cacheados encontrados:', key);
        resolve(entry.data);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ============================================
  // 🔔 MOSTRAR NOTIFICACIÓN DE SYNC
  // ============================================
  async showSyncNotification(count) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('🔄 Predicciones sincronizadas', {
        body: `${count} predicción${count > 1 ? 'es' : ''} guardada${count > 1 ? 's' : ''} mientras estabas offline`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'sync-notification',
        data: {
          url: '/app',
          type: 'sync'
        }
      });
    } catch (error) {
      console.error('❌ [Offline] Error mostrando notificación:', error);
    }
  }

  // ============================================
  // 📊 OBTENER ESTADÍSTICAS OFFLINE
  // ============================================
  async getStats() {
    const pending = await this.getPendingPredictions();
    
    return {
      isOnline: this.isOnline,
      pendingPredictions: pending.length,
      dbInitialized: !!this.db
    };
  }
}

// ============================================
// 🌐 EXPORTAR SINGLETON
// ============================================
const offlineSync = new OfflineSyncService();

export default offlineSync;

// ============================================
// 🚀 HELPERS
// ============================================

export async function savePredictionOffline(prediction) {
  return await offlineSync.savePredictionOffline(prediction);
}

export async function syncOfflineData() {
  return await offlineSync.syncPendingData();
}

export async function getOfflineStats() {
  return await offlineSync.getStats();
}

export function isOnline() {
  return navigator.onLine;
}