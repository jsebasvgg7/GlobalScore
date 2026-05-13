// ============================================================
//  SHARED SERVICES INDEX
//  src/shared/services/index.js
//
//  Punto de entrada único para todos los servicios compartidos.
//
//  Uso:
//    import { supabase } from '@/shared/services';
//    import { uploadToCloudinary } from '@/shared/services';
//    import { offlineSync, syncOfflineData } from '@/shared/services';
//    import { pushManager, subscribeToPush } from '@/shared/services';
//    import { pwaService, registerPWA, isPWAInstalled } from '@/shared/services';
// ============================================================

// ─── Supabase ────────────────────────────────────────────────
export { supabase } from './supabase/client';

// ─── Cloudinary ──────────────────────────────────────────────
export { uploadToCloudinary } from './cloudinary/upload.service';

// ─── Offline / IndexedDB ─────────────────────────────────────
export {
    default as offlineSync,
    savePredictionOffline,
    syncOfflineData,
    getOfflineStats,
    isOnline,
} from './pwa/offlineSync';

// ─── Push Notifications ──────────────────────────────────────
export {
    default as pushManager,
    subscribeToPush,
    unsubscribeFromPush,
    checkPushStatus,
    requestPushPermission,
    isPushSupported,
} from './pwa/pushManager';

// ─── PWA ─────────────────────────────────────────────────────
export {
    default as pwaService,
    registerPWA,
    isPWASupported,
    isPWAInstalled,
    hasUpdateAvailable,
} from './pwa/pwaService';