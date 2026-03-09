import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, Filter, Calendar, Trophy, CheckCircle2, 
  Clock, Target, Award, BellRing, BellOff
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Footers from '../components/ComOthers/Footer';
import '../styles/StylesPages/NotificationsPage.css';

const VAPID_PUBLIC_KEY = 'BBxgmAtEOHeYNi1tJQcrWzL_Q-6_Mj16ECGgQSL6JPX0i9XyL5V5LFJHjNdde_TTRxAUXJHSYNtUOvXcAsYS_Xs';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(true);

  // ── Verificar estado real de suscripción ──────────────────────────────────
  const checkSubscriptionStatus = useCallback(async () => {
    if (!currentUser?.id) return;
    setPushLoading(true);

    try {
      // 1. ¿El navegador tiene permiso?
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushEnabled(false);
        return;
      }

      if (Notification.permission !== 'granted') {
        setPushEnabled(false);
        return;
      }

      // 2. ¿Hay suscripción activa en el navegador?
      const registration = await navigator.serviceWorker.ready;
      const browserSub = await registration.pushManager.getSubscription();

      if (!browserSub) {
        setPushEnabled(false);
        // Limpiar registro huérfano en Supabase si existe
        await supabase.from('push_subscriptions').delete().eq('user_id', currentUser.id);
        return;
      }

      // 3. ¿Existe en Supabase?
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error verificando suscripción:', error);
        setPushEnabled(false);
        return;
      }

      setPushEnabled(!!data);
    } catch (err) {
      console.error('Error en checkSubscriptionStatus:', err);
      setPushEnabled(false);
    } finally {
      setPushLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadNotifications();
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // ── Cargar notificaciones ─────────────────────────────────────────────────
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifs = (matches || []).map(match => {
        const isNew = match.status === 'pending';
        const isFinished = match.status === 'finished';
        return {
          id: match.id,
          type: isNew ? 'new' : 'finished',
          title: isNew ? '¡Nuevo partido disponible!' : '¡Partido finalizado!',
          description: `${match.home_team} vs ${match.away_team}`,
          league: match.league,
          date: match.date,
          time: match.time,
          result: isFinished ? `${match.result_home ?? 0} - ${match.result_away ?? 0}` : null,
          created_at: match.created_at,
          icon: isNew ? <Trophy size={20} /> : <CheckCircle2 size={20} />
        };
      });

      setNotifications(notifs);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Registrar Service Worker ──────────────────────────────────────────────
  const ensureServiceWorker = async () => {
    try {
      let registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado');
      }
      // Esperar a que esté listo
      return await navigator.serviceWorker.ready;
    } catch (err) {
      console.error('Error registrando SW:', err);
      throw new Error('No se pudo registrar el Service Worker');
    }
  };

  // ── Suscribirse ───────────────────────────────────────────────────────────
  const subscribeToPush = async () => {
    if (!currentUser?.id) {
      alert('Debes iniciar sesión para activar notificaciones');
      return false;
    }

    // Verificar soporte
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push');
      return false;
    }

    // Pedir permiso
    let permission = Notification.permission;
    if (permission === 'denied') {
      alert('Tienes las notificaciones bloqueadas. Actívalas en la configuración de tu navegador.');
      return false;
    }
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('No se otorgaron permisos para notificaciones.');
        return false;
      }
    }

    try {
      const registration = await ensureServiceWorker();

      // Cancelar suscripción previa si existe
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      // Crear nueva suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('📱 Suscripción creada:', subscription.endpoint);

      // Guardar en Supabase
      const subJson = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: currentUser.id,
            subscription: subJson,           // guardar como objeto, no string
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error guardando suscripción en Supabase:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('✅ Suscripción guardada en Supabase');
      return true;

    } catch (err) {
      console.error('Error en subscribeToPush:', err);
      alert(`Error al activar notificaciones: ${err.message}`);
      return false;
    }
  };

  // ── Desuscribirse ─────────────────────────────────────────────────────────
  const unsubscribeFromPush = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }

      if (currentUser?.id) {
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', currentUser.id);

        if (error) console.error('Error eliminando suscripción:', error);
        else console.log('✅ Suscripción eliminada de Supabase');
      }

      return true;
    } catch (err) {
      console.error('Error en unsubscribeFromPush:', err);
      return false;
    }
  };

  // ── Toggle ────────────────────────────────────────────────────────────────
  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setPushEnabled(false);
          alert('Notificaciones desactivadas ✓');
        }
      } else {
        const ok = await subscribeToPush();
        if (ok) {
          setPushEnabled(true);
          alert('¡Notificaciones activadas! 🔔\nTe avisaremos de nuevos partidos.');
        }
      }
    } finally {
      setPushLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-title-section">
          <Bell size={32} className="bell-icon" />
          <div>
            <h1 className="page-title">Notificaciones</h1>
            <p className="page-subtitle">Mantente al día con todos los partidos</p>
          </div>
        </div>

        {!pushLoading && (
          <button
            className={`push-toggle-btn ${pushEnabled ? 'enabled' : ''}`}
            onClick={handleTogglePush}
            disabled={pushLoading}
          >
            {pushEnabled ? <BellRing size={20} /> : <BellOff size={20} />}
            <span>{pushEnabled ? 'Activadas' : 'Activar'}</span>
          </button>
        )}
      </div>

      <div className="notifications-container">
        {/* Banner si no están activas */}
        {!pushEnabled && !pushLoading && (
          <div className="push-info-banner">
            <div className="banner-icon-circle">
              <BellRing size={24} />
            </div>
            <div className="banner-text">
              <h4>Activa las notificaciones push</h4>
              <p>Recibe alertas cuando haya nuevos partidos o resultados</p>
            </div>
            <button onClick={handleTogglePush} className="activate-btn">
              Activar
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="notifications-filters">
          <button
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Filter size={16} />
            <span>Todas</span>
            <span className="chip-count">{notifications.length}</span>
          </button>
          <button
            className={`filter-chip ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            <Trophy size={16} />
            <span>Nuevas</span>
            <span className="chip-count">{notifications.filter(n => n.type === 'new').length}</span>
          </button>
          <button
            className={`filter-chip ${filter === 'finished' ? 'active' : ''}`}
            onClick={() => setFilter('finished')}
          >
            <CheckCircle2 size={16} />
            <span>Finalizadas</span>
            <span className="chip-count">{notifications.filter(n => n.type === 'finished').length}</span>
          </button>
        </div>

        {/* Lista */}
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner-ring"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={64} />
              <h3>No hay notificaciones</h3>
              <p>Cuando haya novedades, aparecerán aquí</p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div key={notif.id} className={`notification-card ${notif.type}`}>
                <div className={`notif-icon-wrapper ${notif.type}`}>
                  {notif.icon}
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4 className="notif-title">{notif.title}</h4>
                  </div>
                  <p className="notif-description">{notif.description}</p>
                  <div className="notif-details">
                    <div className="detail-item">
                      <Award size={14} />
                      <span>{notif.league}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>{notif.date}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      <span>{notif.time}</span>
                    </div>
                  </div>
                  {notif.result && (
                    <div className="notif-result">
                      <Target size={16} />
                      <span className="result-score">{notif.result}</span>
                    </div>
                  )}
                </div>
                <div className={`notif-badge ${notif.type}`}>
                  {notif.type === 'new' ? 'Nuevo' : 'Finalizado'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footers />
    </div>
  );
}