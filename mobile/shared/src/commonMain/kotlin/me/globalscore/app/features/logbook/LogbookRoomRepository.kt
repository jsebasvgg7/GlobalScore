package me.globalscore.app.features.logbook

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.globalscore.app.features.profile.count
import me.globalscore.app.features.profile.text

internal class LogbookRoomRepository(private val client: SupabaseClient) {
    suspend fun list(): List<JsonObject> = client.postgrest.rpc("libreta_room_list").decodeList<JsonObject>()

    suspend fun get(id: String): LogbookRoom = LogbookRoom(
        client.postgrest.rpc("libreta_room_get", buildJsonObject { put("p_room_id", id) }).decodeAs<JsonObject>(),
    )

    suspend fun create(teamId: String, fromZero: Boolean): String = requireNotNull(
        client.postgrest.rpc("libreta_room_create", buildJsonObject {
            put("p_team_id", teamId)
            put("p_from_zero", fromZero)
        }).decodeAs<JsonObject>().text("room_id"),
    )

    suspend fun join(code: String, teamId: String): String = requireNotNull(
        client.postgrest.rpc("libreta_room_join", buildJsonObject {
            put("p_code", code)
            put("p_team_id", teamId)
        }).decodeAs<JsonObject>().text("room_id"),
    )

    suspend fun pin(id: String, pinned: Boolean) {
        client.postgrest.rpc("libreta_room_pin", buildJsonObject {
            put("p_room_id", id)
            put("p_pinned", pinned)
        })
    }

    suspend fun finish(id: String) {
        client.postgrest.rpc("libreta_room_finish", buildJsonObject { put("p_room_id", id) })
    }

    suspend fun cancel(id: String) {
        client.postgrest.rpc("libreta_room_cancel", buildJsonObject { put("p_room_id", id) })
    }
}

internal class LogbookRoom(private val row: JsonObject) {
    val code = row.text("code").orEmpty()
    val status = row.text("status").orEmpty()
    val fromZero = row.text("from_zero") == "true"
    val pinned = row.text("my_pinned") == "true"
    val winner = row.text("winner_user_id")
    val members = (row["members"] as? JsonArray).orEmpty().filterIsInstance<JsonObject>().map(::RoomMember)
    fun finalPoints(userId: String): Int? =
        (row["final_points"] as? JsonObject)?.let { if (userId in it) it.count(userId) else null }
}

internal class RoomMember(row: JsonObject) {
    val id = requireNotNull(row.text("user_id"))
    val name = row.text("user_name").orEmpty()
    val team = (row["team"] as? JsonObject)?.let(::LogbookTeam)
}
