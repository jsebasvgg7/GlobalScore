import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, Filter, Calendar, Trophy, CheckCircle2, 
  Clock, Target, Award, BellRing, BellOff
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Footer from '../components/ComOthers/Footer';
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

  // ── Verificar estado real de suscripción ─────────────────────────────────
  const checkSubscriptionStatus = useCallback(async () => {
    if (!currentUser?.id) return;
    setPushLoading(true);

    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushEnabled(false);
        return;
      }

      if (Notification.permission !== 'granted') {
        setPushEnabled(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const browserSub = await registration.pushManager.getSubscription();

      if (!browserSub) {
        setPushEnabled(false);
        await supabase.from('push_subscriptions').delete().eq('user_id', currentUser.id);
        return;
      }

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
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadNotifications();
    checkSubscriptionStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          icon: isNew ? <Trophy size={18} /> : <CheckCircle2 size={18} />
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
      }
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

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push');
      return false;
    }

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

      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const subJson = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: currentUser.id,
            subscription: subJson,
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error guardando suscripción en Supabase:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

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

  const newCount      = notifications.filter(n => n.type === 'new').length;
  const finishedCount = notifications.filter(n => n.type === 'finished').length;

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="np-page page-root">

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <div className="np-shell">

        {/* ── MAIN COLUMN ── */}
        <div className="np-main">

          {/* Topbar */}
          <div className="np-topbar">
            <div className="np-topbar-left">
              <div className="np-topbar-dot" />
              <span className="np-topbar-title">Notificaciones</span>
              <span className="np-topbar-count">{notifications.length}</span>
            </div>

            {!pushLoading && (
              <button
                className={`np-push-btn${pushEnabled ? ' np-push-btn--on' : ''}`}
                onClick={handleTogglePush}
              >
                {pushEnabled ? <BellRing size={13} /> : <BellOff size={13} />}
                <span>{pushEnabled ? 'Push activo' : 'Activar push'}</span>
              </button>
            )}
          </div>

          {/* Banner push desactivado */}
          {!pushEnabled && !pushLoading && (
            <div className="np-banner">
              <div className="np-banner-icon"><BellRing size={16} /></div>
              <div className="np-banner-text">
                <div className="np-banner-title">Activa las notificaciones push</div>
                <div className="np-banner-sub">Recibe alertas cuando haya nuevos partidos o resultados</div>
              </div>
              <button className="np-banner-btn" onClick={handleTogglePush}>Activar</button>
            </div>
          )}

          {/* Filtros */}
          <div className="np-filters">
            {[
              { key: 'all',      label: 'Todas',       icon: <Filter size={11} />,      count: notifications.length },
              { key: 'new',      label: 'Nuevas',      icon: <Trophy size={11} />,       count: newCount },
              { key: 'finished', label: 'Finalizadas', icon: <CheckCircle2 size={11} />, count: finishedCount },
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                className={`np-filter-btn${filter === key ? ' active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {icon}
                <span>{label}</span>
                <span className="np-filter-count">{count}</span>
              </button>
            ))}
          </div>

          {/* Scroll area */}
          <div className="np-scroll">
            {loading ? (
              <div className="np-loading">
                <div className="np-spinner" />
                <span>Cargando notificaciones</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon-wrap"><Bell size={28} /></div>
                <div className="np-empty-title">Sin notificaciones</div>
                <div className="np-empty-sub">Cuando haya novedades, aparecerán aquí</div>
              </div>
            ) : (
              <div className="np-list">
                {filteredNotifications.map((notif) => (
                  <div key={notif.id} className={`np-card np-card--${notif.type}`}>
                    <div className={`np-card-stripe np-card-stripe--${notif.type}`} />
                    <div className={`np-card-icon-wrap np-card-icon-wrap--${notif.type}`}>
                      {notif.icon}
                    </div>
                    <div className="np-card-content">
                      <div className="np-card-header">
                        <span className={`np-card-badge np-card-badge--${notif.type}`}>
                          {notif.type === 'new' ? 'Nuevo' : 'Finalizado'}
                        </span>
                        <span className="np-card-title">{notif.description}</span>
                      </div>
                      <div className="np-card-meta">
                        <span className="np-card-meta-item"><Award size={11} />{notif.league}</span>
                        <span className="np-card-meta-sep">·</span>
                        <span className="np-card-meta-item"><Calendar size={11} />{notif.date}</span>
                        {notif.time && (
                          <>
                            <span className="np-card-meta-sep">·</span>
                            <span className="np-card-meta-item"><Clock size={11} />{notif.time}</span>
                          </>
                        )}
                      </div>
                      {notif.result && (
                        <div className="np-card-result">
                          <Target size={12} /><span>{notif.result}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Footer />
          </div>
        </div>

        {/* ── SIDEBAR DERECHO ── */}
        <div className="np-sidebar">
          <div className="np-sidebar-label">
            <span className="np-sidebar-label-dot" />
            Resumen
          </div>

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">TOTAL</div>
            <div className="np-sidebar-num np-sidebar-num--accent">{notifications.length}</div>
            <div className="np-sidebar-sub">notificaciones · 7 días</div>
          </div>

          <div className="np-sidebar-sep" />

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">TIPOS</div>
            <div className="np-sidebar-types">
              <div className="np-sidebar-type">
                <div className="np-sidebar-type-stripe np-sidebar-type-stripe--new" />
                <div className="np-sidebar-type-info">
                  <span className="np-sidebar-type-num">{newCount}</span>
                  <span className="np-sidebar-type-lbl">Nuevos</span>
                </div>
              </div>
              <div className="np-sidebar-type">
                <div className="np-sidebar-type-stripe np-sidebar-type-stripe--fin" />
                <div className="np-sidebar-type-info">
                  <span className="np-sidebar-type-num">{finishedCount}</span>
                  <span className="np-sidebar-type-lbl">Finalizados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="np-sidebar-sep" />

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">PUSH</div>
            <div className={`np-sidebar-push${pushEnabled ? ' np-sidebar-push--on' : ''}`}>
              {pushEnabled ? <BellRing size={13} /> : <BellOff size={13} />}
              <span>{pushEnabled ? 'Activado' : 'Desactivado'}</span>
            </div>
            <div className="np-sidebar-push-desc">
              {pushEnabled
                ? 'Recibirás alertas de partidos y resultados.'
                : 'Activa para no perderte ningún partido.'}
            </div>
          </div>

          {/* Acento al fondo */}
          <div className="np-sidebar-accent">
            <div className="np-sidebar-accent-lbl">VIENDO AHORA</div>
            <div className="np-sidebar-accent-num">
              {filter === 'all' ? notifications.length : filteredNotifications.length}
            </div>
            <div className="np-sidebar-accent-sub">
              {filter === 'all' ? 'Todas' : filter === 'new' ? 'Nuevas' : 'Finalizadas'}
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (≤768px)
      ══════════════════════════════════════════ */}
      <div className="np-mobile">

        {/* Topbar mobile */}
        <div className="npm-topbar">
          <div className="npm-topbar-left">
            <div className="npm-dot" />
            <span className="npm-title">Notificaciones</span>
          </div>
          {!pushLoading && (
            <button
              className={`npm-push-btn${pushEnabled ? ' npm-push-btn--on' : ''}`}
              onClick={handleTogglePush}
            >
              {pushEnabled ? <BellRing size={13} /> : <BellOff size={13} />}
              <span>{pushEnabled ? 'Activas' : 'Activar'}</span>
            </button>
          )}
        </div>

        {/* Banner mobile */}
        {!pushEnabled && !pushLoading && (
          <div className="npm-banner">
            <div className="npm-banner-icon"><BellRing size={16} /></div>
            <div className="npm-banner-text">
              <div className="npm-banner-title">Activa las notificaciones</div>
              <div className="npm-banner-sub">Recibe alertas de nuevos partidos</div>
            </div>
            <button className="npm-banner-btn" onClick={handleTogglePush}>Activar</button>
          </div>
        )}

        {/* Filtros mobile */}
        <div className="npm-filters">
          {[
            { key: 'all',      label: 'Todas',    count: notifications.length },
            { key: 'new',      label: 'Nuevas',    count: newCount },
            { key: 'finished', label: 'Final.',    count: finishedCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              className={`npm-filter${filter === key ? ' active' : ''}`}
              onClick={() => setFilter(key)}
            >
              <span>{label}</span>
              <span className="npm-filter-count">{count}</span>
            </button>
          ))}
        </div>

        {/* Lista mobile */}
        <div className="npm-list">
          {loading ? (
            <div className="npm-loading">
              <div className="npm-spinner" />
              <span>Cargando...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="npm-empty">
              <Bell size={36} className="npm-empty-icon" />
              <div className="npm-empty-title">Sin notificaciones</div>
              <div className="npm-empty-sub">Aquí aparecerán las novedades</div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className={`npm-card npm-card--${notif.type}`}>
                <div className={`npm-card-icon npm-card-icon--${notif.type}`}>
                  {notif.type === 'new' ? <Trophy size={15} /> : <CheckCircle2 size={15} />}
                </div>
                <div className="npm-card-body">
                  <div className="npm-card-title">{notif.description}</div>
                  <div className="npm-card-meta">
                    <span>{notif.league}</span>
                    <span>·</span>
                    <span>{notif.date}</span>
                    {notif.time && <><span>·</span><span>{notif.time}</span></>}
                  </div>
                  {notif.result && (
                    <div className="npm-card-result">{notif.result}</div>
                  )}
                </div>
                <span className={`npm-card-badge npm-card-badge--${notif.type}`}>
                  {notif.type === 'new' ? 'Nuevo' : 'Final'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}