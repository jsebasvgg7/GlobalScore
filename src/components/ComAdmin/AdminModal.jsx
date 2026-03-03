import React, { useState } from "react";
import { X, Plus, Calendar, Clock, Shield, Zap, Home, Plane } from "lucide-react";
import { getLogoUrlByTeamName, getLeagueLogoUrlDirect } from "../../utils/logoHelper.js";
import { supabase } from "../../utils/supabaseClient.js";
import "../../styles/StylesAdmin/AdminModal.css";

export default function AdminModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: "",
    league: "",
    home_team: "",
    away_team: "",
    home_team_logo: "🏠",
    away_team_logo: "✈️",
    date: "",
    time: "",
    deadLine: "",
    deadLine_time: "",
    is_knockout: false,
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      return;
    }
    setForm({ ...form, [name]: value });

    if (name === "home_team" && value && form.league) {
      const logoUrl = getLogoUrlByTeamName(supabase, value, form.league);
      if (logoUrl) setForm((p) => ({ ...p, home_team_logo_url: logoUrl }));
    }
    if (name === "away_team" && value && form.league) {
      const logoUrl = getLogoUrlByTeamName(supabase, value, form.league);
      if (logoUrl) setForm((p) => ({ ...p, away_team_logo_url: logoUrl }));
    }
    if (name === "league" && value) {
      const leagueLogoUrl = getLeagueLogoUrlDirect(value);
      if (leagueLogoUrl) setForm((p) => ({ ...p, league_logo_url: leagueLogoUrl }));
      if (form.home_team) {
        const hl = getLogoUrlByTeamName(supabase, form.home_team, value);
        if (hl) setForm((p) => ({ ...p, home_team_logo_url: hl }));
      }
      if (form.away_team) {
        const al = getLogoUrlByTeamName(supabase, form.away_team, value);
        if (al) setForm((p) => ({ ...p, away_team_logo_url: al }));
      }
    }
  };

  const sendPushNotification = async (matchData) => {
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          matchId: matchData.id,
          title: "🔥 ¡Nuevo partido disponible!",
          body: `${matchData.home_team} vs ${matchData.away_team} - ${matchData.league}`,
          url: `/matches/${matchData.id}`,
          league: matchData.league,
          date: matchData.date,
          time: matchData.time,
        },
      });
    } catch (error) {
      console.error("Error en sendPushNotification:", error);
    }
  };

  const submit = async () => {
    if (!form.id || !form.home_team || !form.away_team || !form.date || !form.time || !form.deadLine || !form.deadLine_time) {
      alert("Todos los campos son obligatorios");
      return;
    }
    setSending(true);
    try {
      const deadlineISO = `${form.deadLine}T${form.deadLine_time}:00`;
      const homeLogoUrl = getLogoUrlByTeamName(supabase, form.home_team, form.league);
      const awayLogoUrl = getLogoUrlByTeamName(supabase, form.away_team, form.league);
      const leagueLogoUrl = getLeagueLogoUrlDirect(form.league);

      const matchData = {
        id: form.id,
        league: form.league,
        home_team: form.home_team,
        away_team: form.away_team,
        home_team_logo: form.home_team_logo,
        away_team_logo: form.away_team_logo,
        home_team_logo_url: homeLogoUrl,
        away_team_logo_url: awayLogoUrl,
        league_logo_url: leagueLogoUrl,
        date: form.date,
        time: form.time,
        deadline: deadlineISO,
        status: "pending",
        is_knockout: form.is_knockout,
      };

      onAdd(matchData);
      sendPushNotification(matchData);
      onClose();
    } catch (error) {
      console.error("Error al crear partido:", error);
      alert("Error al crear el partido");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="am2-backdrop">
      <div className="am2-shell">

        {/* ── Header ── */}
        <div className="am2-header">
          <div className="am2-header-icon">
            <Plus size={18} />
          </div>
          <div className="am2-header-text">
            <h2>Agregar Partido</h2>
            <p>Completa la información del partido</p>
          </div>
          <button className="am2-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="am2-body">

          {/* ID + Liga */}
          <div className="am2-row-2">
            <div className="am2-field">
              <label className="am2-label">
                <Zap size={12} />
                ID del Partido <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="id"
                placeholder="match-001"
                value={form.id}
                onChange={handleChange}
              />
              <span className="am2-hint">Identificador único</span>
            </div>

            <div className="am2-field">
              <label className="am2-label">
                <Shield size={12} />
                Liga <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="league"
                placeholder="Premier League"
                value={form.league}
                onChange={handleChange}
              />
              <span className="am2-hint">Logo asignado automáticamente</span>
            </div>
          </div>

          {/* Knockout toggle */}
          <label className="am2-knockout-toggle">
            <input
              type="checkbox"
              name="is_knockout"
              checked={form.is_knockout}
              onChange={handleChange}
              className="am2-checkbox"
            />
            <span className="am2-knockout-track">
              <span className="am2-knockout-thumb" />
            </span>
            <span className="am2-knockout-label">
              ⚡ Partido de Eliminatoria
              <span className="am2-knockout-sub">
                Activa si se selecciona quién pasa (+2 pts)
              </span>
            </span>
          </label>

          {/* Logo preview liga */}
          {form.league && form.league_logo_url && (
            <div className="am2-logo-preview-row">
              <span className="am2-logo-preview-label">Liga:</span>
              <img src={form.league_logo_url} alt="League" className="am2-logo-img" />
            </div>
          )}

          {/* Equipos */}
          <div className="am2-row-2">
            <div className="am2-field">
              <label className="am2-label">
                <Home size={12} />
                Equipo Local <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="home_team"
                placeholder="MUN"
                value={form.home_team}
                onChange={handleChange}
              />
              <span className="am2-hint">Código 3 letras (MUN, BAR…)</span>
            </div>

            <div className="am2-field">
              <label className="am2-label">
                <Plane size={12} />
                Equipo Visitante <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="away_team"
                placeholder="LIV"
                value={form.away_team}
                onChange={handleChange}
              />
              <span className="am2-hint">Código 3 letras (LIV, ARS…)</span>
            </div>
          </div>

          {/* Logo preview equipos */}
          {form.home_team && form.away_team && form.league && (
            <div className="am2-logo-preview-row am2-logo-preview-row--teams">
              <div className="am2-logo-item">
                <span className="am2-logo-preview-label">Local</span>
                {form.home_team_logo_url
                  ? <img src={form.home_team_logo_url} alt="Home" className="am2-logo-img" />
                  : <span className="am2-logo-emoji">{form.home_team_logo}</span>}
              </div>
              <div className="am2-logo-vs">VS</div>
              <div className="am2-logo-item">
                <span className="am2-logo-preview-label">Visitante</span>
                {form.away_team_logo_url
                  ? <img src={form.away_team_logo_url} alt="Away" className="am2-logo-img" />
                  : <span className="am2-logo-emoji">{form.away_team_logo}</span>}
              </div>
            </div>
          )}

          {/* Sección: Fecha del partido */}
          <div className="am2-section-title">
            <Calendar size={13} />
            Fecha del Partido
          </div>
          <div className="am2-row-2">
            <div className="am2-field">
              <label className="am2-label">
                Fecha <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className="am2-field">
              <label className="am2-label">
                <Clock size={12} />
                Hora <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Sección: Límite predicciones */}
          <div className="am2-section-title">
            <Clock size={13} />
            Límite de Predicciones
          </div>
          <div className="am2-row-2">
            <div className="am2-field">
              <label className="am2-label">
                Fecha Límite <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="deadLine"
                type="date"
                value={form.deadLine}
                onChange={handleChange}
              />
            </div>
            <div className="am2-field">
              <label className="am2-label">
                Hora Límite <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input"
                name="deadLine_time"
                type="time"
                value={form.deadLine_time}
                onChange={handleChange}
              />
            </div>
          </div>
          <span className="am2-hint" style={{ marginTop: '-8px', display: 'block' }}>
            Fecha y hora hasta la cual se pueden hacer predicciones
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="am2-footer">
          <button className="am2-btn am2-btn--cancel" onClick={onClose} disabled={sending}>
            Cancelar
          </button>
          <button className="am2-btn am2-btn--submit" onClick={submit} disabled={sending}>
            <Plus size={15} />
            {sending ? "Enviando…" : "Agregar Partido"}
          </button>
        </div>

      </div>
    </div>
  );
}