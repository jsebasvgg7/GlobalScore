package me.globalscore.app

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class PushDeviceRegistration internal constructor(private val client: SupabaseClient, val authUserId: String) {
    suspend fun register(installationId: String, token: String) {
        client.postgrest.rpc("register_android_push_device", buildJsonObject {
            put("p_installation_id", installationId)
            put("p_fcm_token", token)
        })
    }

    suspend fun unregister(installationId: String) {
        client.postgrest.rpc("unregister_android_push_device", buildJsonObject {
            put("p_installation_id", installationId)
        })
    }
}
