import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
export const CAPTCHA_ENABLED = !!SITE_KEY;

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!window.__turnstileLoading) {
    window.__turnstileLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return window.__turnstileLoading;
}

export default function TurnstileWidget({ onToken, resetKey }) {
  const ref = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || widgetId.current !== null) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  // Cada token sirve una sola vez: se reinicia tras cada intento
  useEffect(() => {
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onToken(null);
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ margin: "12px 0" }} />;
}