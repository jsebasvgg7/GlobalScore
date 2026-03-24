import React, { useState, useEffect } from 'react';
import {
  Bell, Filter, Calendar, Trophy, CheckCircle2,
  Clock, Target, Award, BellRing, BellOff,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import Footer from '../../components/ComOthers/Footer';
import MobileNotifications from '../../components/ComMobile/MobileNotifications';
import '../../styles/StylesPages/NotificationsPage.css';

const VAPID_PUBLIC_KEY = 'BBxgmAtEOHeYNi1tJQcrWzL_Q-6_Mj16ECGgQSL6JPX0i9XyL5V5LFJHjNdde_TTRxAUXJHSYNtUOvXcAsYS_Xs';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function NotificationsPage({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');
  const [pushEnabled, setPushEnabled]     = useState(false);
  const [pushLoading, setPushLoading]     = useState(true);

  // Solo se ejecuta una vez al montar (y si cambia el userId)
  useEffect(() => {
    loadNotifications();
    checkPushStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  async function loadNotifications() {
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

      setNotifications(
        (matches || []).map(match => ({
          id:          match.id,
          type:        match.status === 'pending' ? 'new' : 'finished',
          description: `${match.home_team} vs ${match.away_team}`,
          league:      match.league,
          date:        match.date,
          time:        match.time,
          result:      match.status === 'finished'
                         ? `${match.result_home ?? 0} - ${match.result_away ?? 0}`
                         : null,
          created_at: match.created_at,
        }))
      );
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }

  async function checkPushStatus() {
    const userId = currentUser?.id;
    setPushLoading(true);
    try {
      if (!userId) { setPushEnabled(false); return; }
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushEnabled(false); return;
      }
      if (Notification.permission !== 'granted') { setPushEnabled(false); return; }

      const registration = await navigator.serviceWorker.ready;
      const browserSub   = await registration.pushManager.getSubscription();

      if (!browserSub) {
        setPushEnabled(false);
        await supabase.from('push_subscriptions').delete().eq('user_id', userId);
        return;
      }

      const { data } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      setPushEnabled(!!data);
    } catch {
      setPushEnabled(false);
    } finally {
      setPushLoading(false);
    }
  }

  async function ensureServiceWorker() {
    let registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) registration = await navigator.serviceWorker.register('/sw.js');
    return navigator.serviceWorker.ready;
  }

  async function subscribeToPush() {
    if (!currentUser?.id) { alert('Debes iniciar sesión'); return false; }
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push'); return false;
    }
    let permission = Notification.permission;
    if (permission === 'denied') { alert('Notificaciones bloqueadas. Actívalas en la configuración del navegador.'); return false; }
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;
    }
    try {
      const registration = await ensureServiceWorker();
      const existingSub  = await registration.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          { user_id: currentUser.id, subscription: subscription.toJSON(), created_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      alert(`Error al activar notificaciones: ${err.message}`);
      return false;
    }
  }

  async function unsubscribeFromPush() {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      if (currentUser?.id) {
        await supabase.from('push_subscriptions').delete().eq('user_id', currentUser.id);
      }
      return true;
    } catch {
      return false;
    }
  }

  async function handleTogglePush() {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const ok = await unsubscribeFromPush();
        if (ok) { setPushEnabled(false); alert('Notificaciones desactivadas ✓'); }
      } else {
        const ok = await subscribeToPush();
        if (ok) { setPushEnabled(true); alert('¡Notificaciones activadas! 🔔'); }
      }
    } finally {
      setPushLoading(false);
    }
  }

  const filteredNotifications = notifications.filter(n => filter === 'all' || n.type === filter);
  const newCount      = notifications.filter(n => n.type === 'new').length;
  const finishedCount = notifications.filter(n => n.type === 'finished').length;

  return (
    <>
      {/* ══ VISTA MOBILE ══ */}
      <MobileNotifications
        notifications={notifications}
        loading={loading}
        filter={filter}
        onFilterChange={setFilter}
        pushEnabled={pushEnabled}
        pushLoading={pushLoading}
        onTogglePush={handleTogglePush}
      />

      {/* ══ VISTA DESKTOP ══ */}
      <div className="np-shell">

        {/* ── PANEL IZQUIERDO ── */}
        <div className="np-main">

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
                    <div className={`np-card-icon np-card-icon--${notif.type}`}>
                      {notif.type === 'new' ? <Trophy size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className="np-card-content">
                      <div className="np-card-header">
                        <span className={`np-card-type np-card-type--${notif.type}`}>
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
                          <Target size={13} /><span>{notif.result}</span>
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

        {/* ── PANEL DERECHO ── */}
        <div className="np-sidebar">
          <div className="np-sidebar-label">
            <span className="np-sidebar-label-dot" />
            Resumen
          </div>

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">TOTAL</div>
            <div className="np-sidebar-num np-sidebar-num--accent">{notifications.length}</div>
            <div className="np-sidebar-sub">notificaciones (7 días)</div>
          </div>

          <div className="np-sidebar-divider" />

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">TIPOS</div>
            <div className="np-sidebar-type-row">
              <div className="np-sidebar-type">
                <div className="np-sidebar-type-dot np-sidebar-type-dot--new" />
                <div className="np-sidebar-type-info">
                  <span className="np-sidebar-type-val">{newCount}</span>
                  <span className="np-sidebar-type-lbl">Nuevos</span>
                </div>
              </div>
              <div className="np-sidebar-type">
                <div className="np-sidebar-type-dot np-sidebar-type-dot--fin" />
                <div className="np-sidebar-type-info">
                  <span className="np-sidebar-type-val">{finishedCount}</span>
                  <span className="np-sidebar-type-lbl">Finalizados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="np-sidebar-divider" />

          <div className="np-sidebar-block">
            <div className="np-sidebar-block-lbl">PUSH</div>
            <div className={`np-sidebar-push-status${pushEnabled ? ' np-sidebar-push-status--on' : ''}`}>
              {pushEnabled ? <BellRing size={14} /> : <BellOff size={14} />}
              <span>{pushEnabled ? 'Activado' : 'Desactivado'}</span>
            </div>
            <div className="np-sidebar-push-desc">
              {pushEnabled
                ? 'Recibirás alertas de nuevos partidos y resultados.'
                : 'Activa para no perderte ningún partido o resultado.'}
            </div>
          </div>

          <div className="np-sidebar-accent">
            <div className="np-sidebar-accent-lbl">ESTADO ACTUAL</div>
            <div className="np-sidebar-accent-big">
              {filter === 'all' ? notifications.length : filteredNotifications.length}
            </div>
            <div className="np-sidebar-accent-sub">
              {filter === 'all' ? 'Totales' : filter === 'new' ? 'Nuevas' : 'Finalizadas'}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}