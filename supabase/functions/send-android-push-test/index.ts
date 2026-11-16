// deno-lint-ignore-file no-import-prefix
import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.86.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (status: number, data: object) =>
  Response.json(data, { status, headers: cors });

type FirebaseCredential = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const googleTokenUrl = "https://oauth2.googleapis.com/token";
const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function getGoogleAccessToken(
  credential: FirebaseCredential,
): Promise<string> {
  const pem = credential.private_key.replace(/-----[^-]+-----|\s/g, "");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(atob(pem), (character) => character.charCodeAt(0)),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(
    encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const claims = base64Url(encoder.encode(JSON.stringify({
    iss: credential.client_email,
    aud: googleTokenUrl,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    iat: now,
    exp: now + 3600,
  })));
  const unsigned = `${header}.${claims}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(unsigned),
  );
  const response = await fetch(googleTokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64Url(new Uint8Array(signature))}`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Google OAuth: ${response.status}`);
  const { access_token } = await response.json();
  if (typeof access_token !== "string" || !access_token) {
    throw new Error("Missing Google access token");
  }
  return access_token;
}

type DatabaseClient = SupabaseClient;
type CampaignDevice = {
  auth_user_id: string;
  installation_id: string;
  fcm_token: string | null;
};

const categories = new Set(["notice", "reminder", "update"]);

async function firebaseSender() {
  const secret = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!secret) return null;
  const credential: FirebaseCredential = JSON.parse(secret);
  if (
    !credential.project_id || !credential.client_email ||
    !credential.private_key
  ) return null;
  const accessToken = await getGoogleAccessToken(credential);
  return (token: string, title: string, body: string) =>
    fetch(
      `https://fcm.googleapis.com/v1/projects/${
        encodeURIComponent(credential.project_id)
      }/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            data: { push_destination: "matches" },
            android: { ttl: "300s", priority: "HIGH" },
          },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
}

async function campaignSummary(supabase: DatabaseClient, id: string) {
  const { data, error } = await supabase.from("android_push_campaign_history")
    .select(
      "id,category,title,body,created_at,recipients,accepted,failed,skipped,pending,processing,unconfirmed",
    )
    .eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

async function processBatch(supabase: DatabaseClient, id: string) {
  const campaign = await campaignSummary(supabase, id);
  if (!campaign) return reply(404, { error: "No se encontró ese envío." });
  if (!campaign.pending) return reply(200, { campaign });

  const send = await firebaseSender();
  if (!send) {
    return reply(503, {
      error: "Configura la cuenta de servicio de Firebase en Supabase.",
    });
  }

  const { data, error } = await supabase.rpc("claim_android_push_batch", {
    p_campaign: id,
  });
  if (error) throw error;

  const reports = await Promise.allSettled(
    (data as CampaignDevice[]).map(async (device) => {
      let state = "skipped";
      if (device.fcm_token) {
        try {
          const response = await send(
            device.fcm_token,
            campaign.title,
            campaign.body,
          );
          state = response.ok
            ? "accepted"
            : response.status >= 500
            ? "unconfirmed"
            : "failed";
          await response.body?.cancel().catch(() => {});
        } catch {
          state = "unconfirmed";
        }
      }
      const { error: updateError } = await supabase.from(
        "android_push_campaign_devices",
      )
        .update({ state }).eq("campaign_id", id)
        .eq("auth_user_id", device.auth_user_id).eq(
          "installation_id",
          device.installation_id,
        )
        .eq("state", "claimed");
      if (updateError) throw updateError;
    }),
  );
  if (reports.some((report) => report.status === "rejected")) {
    console.error("Could not persist some FCM results");
  }
  return reply(200, { campaign: await campaignSummary(supabase, id) });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "POST") {
    return reply(405, { error: "Método no permitido." });
  }

  const jwt = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)
    ?.[1];
  if (!jwt) return reply(401, { error: "Inicia sesión en el panel admin." });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      jwt,
    );
    if (authError || !user) {
      return reply(401, {
        error: "Tu sesión expiró. Vuelve a iniciar sesión.",
      });
    }

    const { data: profile, error: profileError } = await supabase.from("users")
      .select("is_admin").eq("auth_id", user.id).maybeSingle();
    if (profileError) throw new Error(`Admin lookup: ${profileError.code}`);
    if (profile?.is_admin !== true) {
      return reply(403, {
        error: "Esta acción requiere una cuenta administradora.",
      });
    }

    const payload = await request.json().catch(() => null);
    const action = payload?.action ?? "test";
    if (action === "history") {
      const { data, error } = await supabase.from(
        "android_push_campaign_history",
      )
        .select(
          "id,category,title,created_at,recipients,accepted,failed,skipped,pending,processing,unconfirmed",
        )
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return reply(200, { history: data });
    }

    if (action === "count") {
      const { count, error } = await supabase.from("push_devices")
        .select("installation_id", { count: "exact", head: true }).eq(
          "platform",
          "android",
        );
      if (error) throw error;
      return reply(200, { count });
    }

    if (action !== "test" && action !== "start" && action !== "continue") {
      return reply(400, { error: "Acción desconocida." });
    }

    const id = payload?.id;
    if (
      action !== "test" && (typeof id !== "string" ||
        !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
    ) {
      return reply(400, { error: "El identificador del envío es inválido." });
    }

    if (action === "continue") return await processBatch(supabase, id);

    const title = typeof payload?.title === "string"
      ? payload.title.trim()
      : "";
    const body = typeof payload?.body === "string" ? payload.body.trim() : "";
    if (!title || title.length > 80 || !body || body.length > 240) {
      return reply(400, {
        error:
          "Escribe un título de hasta 80 caracteres y un mensaje de hasta 240.",
      });
    }

    if (action === "start") {
      const category = payload?.category;
      if (!categories.has(category)) {
        return reply(400, { error: "Selecciona un tipo de aviso." });
      }
      const { error } = await supabase.rpc("start_android_push_campaign", {
        p_id: id,
        p_admin: user.id,
        p_category: category,
        p_title: title,
        p_body: body,
      });
      if (error) throw error;
      return reply(200, { campaign: await campaignSummary(supabase, id) });
    }

    const { data: device, error: deviceError } = await supabase.from(
      "push_devices",
    )
      .select("fcm_token")
      .eq("auth_user_id", user.id).eq("platform", "android")
      .order("updated_at", { ascending: false }).order("installation_id")
      .limit(1).maybeSingle();
    if (deviceError) throw new Error(`Device lookup: ${deviceError.code}`);
    if (!device) {
      return reply(404, {
        error: "Activa las notificaciones en Android con esta misma cuenta.",
      });
    }

    const send = await firebaseSender();
    if (!send) {
      return reply(503, {
        error: "Configura la cuenta de servicio de Firebase en Supabase.",
      });
    }
    const response = await send(device.fcm_token, title, body);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      if (
        result?.error?.details?.some((detail: { errorCode?: string }) =>
          detail.errorCode === "UNREGISTERED"
        )
      ) {
        return reply(410, {
          error:
            "El registro del teléfono venció. Desactiva y vuelve a activar las notificaciones en la app.",
        });
      }
      console.error("FCM send failed", response.status);
      return reply(502, {
        error:
          "Firebase rechazó el envío. Revisa la configuración del proyecto y los permisos de la cuenta de servicio.",
      });
    }

    return reply(200, { accepted: true });
  } catch (error) {
    console.error(
      "Android push request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return reply(500, {
      error:
        "No se pudo completar la operación. Revisa el historial y los logs de Supabase.",
    });
  }
});
