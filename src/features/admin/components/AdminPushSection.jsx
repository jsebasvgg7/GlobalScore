import React, { useEffect, useRef, useState } from 'react';
import { Bell, Calendar, RefreshCw, Send, Smartphone } from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';
import '../styles/AdminPushSection.css';

const CATEGORIES = { notice: 'Aviso', update: 'Novedad', reminder: 'Recordatorio' };

const PUSH_TEMPLATES = {
  notice: [
    { title: 'Nueva jornada disponible', body: 'Ya puedes hacer tus pronósticos para los partidos de la próxima jornada. Encuéntralos en Partidos.' },
    { title: 'Se añadieron nuevos partidos', body: 'Agregamos más encuentros a la jornada. Entra a Partidos y marca tus resultados.' },
    { title: 'Ya puedes pronosticar el clásico', body: 'El clásico ya está disponible en Partidos. ¿Qué marcador esperas? Deja tu pronóstico.' },
    { title: 'Partidos de copa disponibles', body: 'Ya puedes pronosticar los nuevos encuentros de copa. Revisa la lista en Partidos.' },
  ],
  update: [
    { title: 'Nueva función en GlobalScore', body: 'Acabamos de estrenar una función en GlobalScore. Abre la app y pruébala.' },
    { title: 'Hay cambios en GlobalScore', body: 'Actualizamos una sección de la app. Entra a GlobalScore para conocer los cambios.' },
    { title: 'Llegaron mejoras a GlobalScore', body: 'Ya están disponibles las últimas mejoras de GlobalScore. Entra a la app para ver qué cambió.' },
  ],
  reminder: [
    { title: 'La jornada está por comenzar', body: 'Se acerca el primer partido. Revisa tus pronósticos y guarda los que te falten.' },
    { title: 'Última llamada para pronosticar', body: 'Pronto se cerrarán los pronósticos de los primeros encuentros. Entra a Partidos y envía los que tengas pendientes.' },
    { title: '¿Ya revisaste tus pronósticos?', body: 'La jornada empieza pronto. Todavía puedes revisar tus marcadores y ajustar los partidos que sigan abiertos.' },
  ],
};
const campaignDate = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

async function invokePush(payload) {
  const { data, error } = await supabase.functions.invoke('send-android-push-test', { body: payload });
  if (error) {
    const details = await error.context?.json?.().catch(() => null);
    throw new Error(details?.error || 'No se pudo completar la operación. Consulta el historial antes de reintentar.');
  }
  return data;
}

export default function AdminPushSection({ children }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('notice');
  const [templateCategory, setTemplateCategory] = useState('notice');
  const [operation, setOperation] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const inFlight = useRef(false);
  const titleInput = useRef(null);
  const busy = operation !== null;
  const valid = Boolean(title.trim() && body.trim());

  function applyTemplate(template) {
    setCategory(templateCategory);
    setTitle(template.title);
    setBody(template.body);
    setFeedback(null);
    titleInput.current?.focus();
  }

  async function refreshHistory() {
    try {
      const result = await invokePush({ action: 'history' });
      setHistory(result.history);
      setHistoryError(null);
    } catch (error) {
      setHistoryError(error.message);
    }
  }

  useEffect(() => { void refreshHistory(); }, []);

  async function run(name, action) {
    if (inFlight.current) return;
    inFlight.current = true;
    setOperation(name);
    setFeedback(null);
    try {
      await action();
    } catch (error) {
      setFeedback({ text: error.message, failed: true });
    } finally {
      inFlight.current = false;
      setOperation(null);
    }
  }

  function sendTest(event) {
    event.preventDefault();
    if (!valid || confirmation) return;
    void run('test', async () => {
      const result = await invokePush({ title: title.trim(), body: body.trim() });
      if (result?.accepted !== true) throw new Error('No se pudo confirmar el envío de prueba.');
      setFeedback({ text: 'Firebase aceptó la prueba. Revisa las notificaciones de tu teléfono.' });
    });
  }

  function reviewBroadcast() {
    if (!valid) return;
    void run('count', async () => {
      const { count } = await invokePush({ action: 'count' });
      if (!count) {
        setFeedback({ text: 'Todavía no hay dispositivos Android suscritos.' });
        return;
      }
      setConfirmation({ id: crypto.randomUUID(), count, title: title.trim(), body: body.trim(), category });
    });
  }

  async function sendBatches(campaign) {
    while (campaign.pending > 0) {
      const { campaign: updated } = await invokePush({ action: 'continue', id: campaign.id });
      if (updated.pending >= campaign.pending) {
        throw new Error('El envío sigue en curso. Actualiza el historial antes de continuar.');
      }
      campaign = updated;
    }
    setFeedback({
      text: campaign.processing
        ? 'Se están confirmando los últimos envíos. Actualiza el historial para ver el resultado.'
        : `Firebase aceptó ${campaign.accepted} de ${campaign.recipients} envíos. Consulta el historial para ver el detalle.`,
    });
  }

  function confirmBroadcast() {
    void run('broadcast', async () => {
      try {
        const { campaign } = await invokePush({ ...confirmation, action: 'start' });
        setConfirmation(null);
        await sendBatches(campaign);
      } finally {
        await refreshHistory();
      }
    });
  }

  function resumeBroadcast(campaign) {
    void run('broadcast', async () => {
      try {
        await sendBatches(campaign);
      } finally {
        await refreshHistory();
      }
    });
  }

  return (
    <>
      <div className="admin-left-col admin-push-main">
        {children}
        <section className="admin-content-area admin-push-history" aria-labelledby="admin-push-history-title">
          <div className="admin-controls admin-push-history-toolbar">
            <h2 id="admin-push-history-title"><Bell size={15} /> Historial de envíos</h2>
            <button type="button" className="adm-panel-back" disabled={busy} onClick={refreshHistory}>
              <RefreshCw size={13} /> Actualizar
            </button>
          </div>
          {historyError && <p className="admin-empty-state" role="alert">{historyError}</p>}
          {!history && !historyError && <p className="admin-empty-state" role="status">Cargando historial…</p>}
          {history?.length === 0 && <p className="admin-empty-state">Aún no hay envíos generales.</p>}
          {history?.length > 0 && (
            <div className="admin-push-list">
              <div className="match-list-header admin-push-grid">
                <span>Aviso</span><span>Fecha</span><span>Resultado</span>
              </div>
              {history.map((campaign) => {
                const summary = [
                  [campaign.failed, 'rechazados'],
                  [campaign.skipped, 'bajas'],
                  [campaign.unconfirmed, 'sin confirmar'],
                  [campaign.processing, 'en proceso'],
                  [campaign.pending, 'pendientes'],
                ].filter(([count]) => count > 0).map(([count, label]) => `${count} ${label}`).join(' · ');
                return (
                  <article className="match-list-row admin-push-grid" key={campaign.id}>
                    <div className="mlr-info">
                      <span className="mlr-league-bar" />
                      <div className="admin-push-campaign">
                        <strong>{campaign.title}</strong>
                        <small>{CATEGORIES[campaign.category]}</small>
                      </div>
                    </div>
                    <time className="mlr-date" dateTime={campaign.created_at}>
                      <Calendar size={12} /> {campaignDate.format(new Date(campaign.created_at))}
                    </time>
                    <div className="admin-push-result">
                      <span className={`match-status-badge ${campaign.accepted === campaign.recipients && campaign.recipients > 0 ? 'finished' : 'pending'}`}>
                        {campaign.accepted}/{campaign.recipients} aceptados
                      </span>
                      {summary && <small>{summary}</small>}
                      {campaign.pending > 0 && (
                        <button type="button" className="adm-panel-back" disabled={busy || !!confirmation} onClick={() => resumeBroadcast(campaign)}>
                          Continuar envío
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <aside className="adm-panel admin-push-composer" aria-labelledby="admin-push-title">
        <div className="adm-panel-header">
          <div className="adm-panel-header-left">
            <span className="adm-panel-header-dot" />
            <h2 id="admin-push-title" className="adm-panel-header-title">Nueva notificación push</h2>
          </div>
        </div>
        <div className="adm-panel-body">
          <form className="adm-form" onSubmit={sendTest}>
            <label className="adm-field">
              <span className="adm-label">Tipo de aviso</span>
              <select className="adm-input" value={category} disabled={busy || !!confirmation} onChange={(event) => setCategory(event.target.value)}>
                {Object.entries(CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="adm-field">
              <span className="adm-label">Título</span>
              <input ref={titleInput} className="adm-input" required maxLength={80} value={title} disabled={busy || !!confirmation} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="adm-field">
              <span className="adm-label">Mensaje</span>
              <textarea className="adm-input" required rows={3} maxLength={240} value={body} disabled={busy || !!confirmation} onChange={(event) => setBody(event.target.value)} />
            </label>

            {valid && (
              <div className="admin-push-preview">
                <small className="adm-label">Vista previa · GlobalScore</small>
                <strong>{title.trim()}</strong>
                <p>{body.trim()}</p>
              </div>
            )}

            {confirmation ? (
              <div className="admin-push-preview">
                <strong>Confirmar envío general</strong>
                <p>Hay {confirmation.count} Android suscritos. El aviso se enviará a los dispositivos activos al confirmar.</p>
                <div className="admin-push-actions">
                  <button type="button" className="adm-submit-btn" disabled={busy} onClick={confirmBroadcast}>
                    {busy ? 'Enviando…' : 'Confirmar envío'}
                  </button>
                  <button type="button" className="adm-panel-back admin-push-secondary" disabled={busy} onClick={() => setConfirmation(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-push-actions">
                <button type="submit" className="adm-panel-back admin-push-secondary" disabled={busy || !valid}>
                  <Smartphone size={14} />
                  {operation === 'test' ? 'Enviando prueba…' : 'Enviar prueba a mi teléfono'}
                </button>
                <button type="button" className="adm-submit-btn" disabled={busy || !valid} onClick={reviewBroadcast}>
                  <Send size={14} />
                  {operation === 'count' ? 'Consultando suscritos…' : 'Enviar a todos los suscritos'}
                </button>
              </div>
            )}
            {operation === 'broadcast' && !confirmation && <p role="status">Enviando avisos…</p>}
            {feedback && <p className={feedback.failed ? 'adm-error' : 'admin-push-feedback'} role={feedback.failed ? 'alert' : 'status'}>{feedback.text}</p>}
          </form>
          <p className="adm-hint admin-push-hint">La prueba llega a tu Android registrado más recientemente. Los avisos abren Partidos.</p>
          <section className="admin-push-templates" aria-labelledby="admin-push-templates-title">
            <h3 id="admin-push-templates-title" className="adm-panel-header-title">Plantillas</h3>
            <div className="admin-push-template-filters" role="group" aria-label="Filtrar plantillas por tipo">
              {Object.entries(CATEGORIES).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="adm-panel-back"
                  aria-pressed={templateCategory === value}
                  onClick={() => setTemplateCategory(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="admin-push-template-list">
              {PUSH_TEMPLATES[templateCategory].map((template) => (
                <li key={template.title}>
                  <button
                    type="button"
                    className="admin-push-template"
                    disabled={busy || !!confirmation}
                    onClick={() => applyTemplate(template)}
                  >
                    <strong>{template.title}</strong>
                    <span>{template.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
