package me.globalscore.app.features.profile

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.*

internal class PublicProfileRepository(private val client: SupabaseClient) {
    suspend fun user(id: String): JsonObject = client.from("users").select(
        Columns.list(
            "id", "name", "avatar_url", "equipped_banner_url", "level", "bio",
            "points", "correct", "predictions", "current_streak", "best_streak",
            "season_points", "season_correct", "season_predictions",
            "monthly_points", "monthly_correct", "monthly_predictions", "monthly_championships", "global_championships",
        ),
    ) {
        filter { eq("id", id) }
        limit(1)
    }.decodeList<JsonObject>().first()

    suspend fun titles(id: String, monthly: Boolean): List<JsonObject> {
        val table = if (monthly) "monthly_championship_history" else "global_championship_history"
        val edition = if (monthly) "month_year" else "edition_label"
        return client.from(table).select(Columns.list(edition, "points")) {
            filter { eq("user_id", id) }
            order("awarded_at", Order.DESCENDING)
        }.decodeList<JsonObject>()
    }

    suspend fun achievements(): List<JsonObject> = client.from("available_achievements").select(
        Columns.list("name", "description", "category", "requirement_type", "requirement_value"),
    ) {
        order("requirement_value", Order.ASCENDING)
    }.decodeList<JsonObject>()

    suspend fun albums(id: String): Set<String> = client.from("album_progress").select(Columns.list("album_id")) {
        filter {
            eq("user_id", id)
            eq("is_completed", true)
            isIn("album_id", legendaryAlbums.keys.toList())
        }
    }.decodeList<JsonObject>().mapNotNull { it.text("album_id") }.toSet()
}

internal val legendaryAlbums = linkedMapOf(
    "legendary_1" to "Foundations",
    "legendary_2" to "Rising Legends",
    "legendary_3" to "Historical Depth",
    "legendary_4" to "Elite Construction",
    "legendary_5" to "The Immortals",
)

internal fun JsonObject.text(key: String) = (get(key) as? JsonPrimitive)?.contentOrNull
internal fun JsonObject.count(key: String) = (get(key) as? JsonPrimitive)?.doubleOrNull?.toInt() ?: 0
