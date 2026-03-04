import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Helpers base64url ─────────────────────────────────────────────────────────
function base64UrlDecode(str) {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  return Uint8Array.from(
    atob(str.replace(/-/g, "+").replace(/_/g, "/") + padding),
    c => c.charCodeAt(0)
  );
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) { out.set(b, offset); offset += b.length; }
  return out;
}

// ── HKDF ─────────────────────────────────────────────────────────────────────
async function hkdf(ikm, salt, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key, length * 8
  );
  return new Uint8Array(bits);
}

// ── Construir info para HKDF ──────────────────────────────────────────────────
function buildInfo(type, clientKey, serverKey) {
  const encoder = new TextEncoder();
  const label = encoder.encode(`Content-Encoding: ${type}\0`);
  const context = concatBuffers(new Uint8Array([0x00]), clientKey, serverKey);
  const len = new Uint8Array(2);
  new DataView(len.buffer).setUint16(0, context.length, false);
  return concatBuffers(label, len, context);
}

// ── Encriptar payload (RFC 8291) ──────────────────────────────────────────────
async function encryptPayload(plaintext, p256dhBase64, authBase64) {
  const encoder = new TextEncoder();
  const p256dh = base64UrlDecode(p256dhBase64);
  const authSecret = base64UrlDecode(authBase64);

  // Par de claves efímeras del servidor
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, ["deriveKey", "deriveBits"]
  );

  // Importar clave pública del cliente
  const clientPublicKey = await crypto.subtle.importKey(
    "raw", p256dh,
    { name: "ECDH", namedCurve: "P-256" },
    true, []
  );

  // Derivar shared secret
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPublicKey },
    serverKeyPair.privateKey,
    256
  );

  // Exportar clave pública efímera
  const serverPublicKeyRaw = await crypto.subtle.exportKey("raw", serverKeyPair.publicKey);
  const serverPubKey = new Uint8Array(serverPublicKeyRaw);

  // Salt aleatorio
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derivar IKM
  const ikm = await hkdf(
    new Uint8Array(sharedBits),
    authSecret,
    buildInfo("auth", new Uint8Array(0), new Uint8Array(0)),
    32
  );

  // Derivar clave de contenido y nonce
  const contentKey = await hkdf(ikm, salt, buildInfo("aesgcm128", p256dh, serverPubKey), 16);
  const nonce = await hkdf(ikm, salt, buildInfo("nonce", p256dh, serverPubKey), 12);

  // Encriptar con AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    "raw", contentKey, { name: "AES-GCM" }, false, ["encrypt"]
  );

  const paddedPlaintext = concatBuffers(new Uint8Array([0, 0]), encoder.encode(plaintext));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    cryptoKey,
    paddedPlaintext
  );

  // Construir body aes128gcm: salt(16) + rs(4) + keyid_len(1) + keyid + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);

  return concatBuffers(salt, rs, new Uint8Array([serverPubKey.length]), serverPubKey, new Uint8Array(ciphertext));
}

// ── VAPID Header (JWT ES256) ──────────────────────────────────────────────────
async function buildVapidHeader(endpoint, vapidPublicKey, vapidPrivateKey, vapidEmail) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 3600;

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const header = encode({ typ: "JWT", alg: "ES256" });
  const payload = encode({ aud: audience, exp: expiration, sub: vapidEmail });
  const signingInput = `${header}.${payload}`;

  // Importar private key VAPID como JWK
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);

  // Extraer x e y de la public key (formato uncompressed: 0x04 + x(32) + y(32))
  const x = base64UrlEncode(publicKeyBytes.slice(1, 33));
  const y = base64UrlEncode(publicKeyBytes.slice(33, 65));
  const d = base64UrlEncode(privateKeyBytes);

  const jwk = { kty: "EC", crv: "P-256", d, x, y };

  const cryptoKey = await crypto.subtle.importKey(
    "jwk", jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = base64UrlEncode(signature);
  const token = `${signingInput}.${sig}`;

  return `vapid t=${token},k=${vapidPublicKey}`;
}

// ── Enviar una notificación push ──────────────────────────────────────────────
async function sendWebPush(subscription, payload, vapidPublicKey, vapidPrivateKey, vapidEmail) {
  const { endpoint, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Suscripción inválida: faltan campos");
  }

  const vapidHeader = await buildVapidHeader(endpoint, vapidPublicKey, vapidPrivateKey, vapidEmail);
  const encrypted = await encryptPayload(payload, keys.p256dh, keys.auth);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": vapidHeader,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
    },
    body: encrypted,
  });

  if (!response.ok && response.status !== 201) {
    const text = await response.text();
    const err = new Error(`Push falló: ${response.status} ${text}`);
    err.statusCode = response.status;
    throw err;
  }

  return response;
}

// ── Handler principal ─────────────────────────────────────────────────────────
serve(async (req) => {
  try {
    const body = await req.json();
    const match = body.record;

    if (!match) {
      return new Response(JSON.stringify({ error: "No match data" }), { status: 400 });
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidEmail = Deno.env.get("VAPID_EMAIL");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // Leer todas las suscripciones activas
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription, user_id");

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_subscribers" }), { status: 200 });
    }

    const payload = JSON.stringify({
      title: "⚽ Nuevo partido disponible",
      body: `${match.home_team} vs ${match.away_team} — ${match.league}`,
      url: "/app",
      tag: `match-${match.id}`,
      matchId: match.id,
    });

    // Enviar a todos en paralelo
    const results = await Promise.allSettled(
      subscriptions.map(async ({ subscription, user_id }) => {
        const sub = typeof subscription === "string"
          ? JSON.parse(subscription)
          : subscription;

        try {
          await sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey, vapidEmail);
          return { user_id, success: true };
        } catch (err) {
          console.error(`Error enviando a ${user_id}:`, err.message);

          // Eliminar suscripciones inválidas (410 = gone, 404 = not found)
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("user_id", user_id);
            console.log(`🗑️ Suscripción eliminada: ${user_id}`);
          }

          return { user_id, success: false };
        }
      })
    );

    const sent = results.filter(r => r.status === "fulfilled" && r.value?.success).length;
    console.log(`✅ Enviadas: ${sent}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});