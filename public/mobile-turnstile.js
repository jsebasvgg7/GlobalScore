window.renderGlobalScoreChallenge = () => {
  const params = new URLSearchParams(location.search);
  const sitekey = params.get("sitekey");
  const status = document.getElementById("status");
  if (!sitekey) {
    status.textContent = "Falta la configuración de Turnstile.";
    return;
  }

  window.turnstile.render("#challenge", {
    sitekey,
    size: window.innerWidth < 300 ? "compact" : "flexible",
    appearance: params.get("appearance") === "interaction-only" ? "interaction-only" : "always",
    "before-interactive-callback"() {
      if (params.get("native") === "1") {
        location.assign("/mobile-turnstile-interaction");
      }
    },
    callback(token) {
      // El cliente móvil intercepta la navegación antes de enviar el token por red.
      location.assign("/mobile-turnstile-result#" + encodeURIComponent(token));
    },
    "error-callback"() {
      status.textContent = "No se pudo verificar. Reintenta desde la app.";
    },
    "expired-callback"() {
      status.textContent = "La verificación expiró. Reintenta desde la app.";
    },
  });
  status.textContent = "";
};
