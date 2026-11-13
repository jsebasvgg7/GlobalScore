window.renderGlobalScoreChallenge = () => {
  const sitekey = new URLSearchParams(location.search).get("sitekey");
  const status = document.getElementById("status");
  if (!sitekey) {
    status.textContent = "Falta la configuración de Turnstile.";
    return;
  }

  window.turnstile.render("#challenge", {
    sitekey,
    size: "flexible",
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
