// Notifications service
// Este feature delega su lógica al pushManager de shared/services/pwa.
// Re-exportamos para mantener consistencia de arquitectura.
export { default as pushManager } from '@/shared/services/pwa/pushManager';
