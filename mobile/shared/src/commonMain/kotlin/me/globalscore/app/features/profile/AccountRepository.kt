package me.globalscore.app.features.profile

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.storage.storage
import io.ktor.http.ContentType
import kotlin.time.Clock
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull

internal data class AccountProgress(val catalog: List<JsonObject>, val achievements: List<JsonObject>)

internal class AccountRepository(private val client: SupabaseClient) {
    suspend fun user(id: String): JsonObject = client.from("users").select(
        Columns.list(*(accountFields.keys + listOf(
            "email", "level", "gender", "avatar_url", "equipped_banner_url",
            "points", "predictions", "correct", "current_streak",
        )).toTypedArray()),
    ) {
        filter { eq("id", id) }
        limit(1)
    }.decodeList<JsonObject>().first()

    suspend fun banners(id: String): List<JsonObject> = client.from("user_banners").select(
        Columns.raw("available_banners(id,name,image_url)"),
    ) {
        filter { eq("user_id", id) }
        order("id", Order.ASCENDING)
    }.decodeList<JsonObject>().mapNotNull { it["available_banners"] as? JsonObject }

    suspend fun uploadAvatar(id: String, photo: AvatarPhoto): String {
        val bucket = client.storage.from("profiles")
        val path = "avatars/$id-${Clock.System.now().toEpochMilliseconds()}.${photo.extension}"
        bucket.upload(path, photo.bytes) {
            contentType = ContentType.parse(photo.mimeType)
        }
        return bucket.publicUrl(path)
    }

    suspend fun saveProfile(id: String, authId: String, changes: JsonObject): JsonObject =
        client.from("users").update(changes) {
            filter {
                eq("id", id)
                eq("auth_id", authId)
            }
            select(Columns.list("name", "avatar_url"))
        }.decodeList<JsonObject>().single()

    suspend fun progress(id: String): AccountProgress {
        val user = user(id)
        val catalog = client.from("available_achievements").select(
            Columns.list("id", "name", "description", "category", "requirement_type", "requirement_value"),
        ) {
            order("requirement_value", Order.ASCENDING)
        }.decodeList<JsonObject>()
        val unlocked = catalog.filter { achievement ->
            val field = when (val type = achievement.text("requirement_type")) {
                "points", "predictions", "correct" -> type
                "streak" -> "current_streak"
                else -> return@filter false
            }
            user.count(field) >= achievement.count("requirement_value")
        }
        return AccountProgress(catalog, unlocked)
    }

    suspend fun unlockedTitles(id: String): List<JsonObject> = unlockedTitles(progress(id).achievements)

    suspend fun unlockedTitles(achievements: List<JsonObject>): List<JsonObject> {
        val unlocked = achievements.associateBy { it.text("id") }
        if (unlocked.isEmpty()) return emptyList()
        return client.from("available_titles").select(
            Columns.list("id", "name", "description", "color", "requirement_achievement_id"),
        ).decodeList<JsonObject>()
            .mapNotNull { title ->
                val achievement = unlocked[title.text("requirement_achievement_id")] ?: return@mapNotNull null
                title to achievement.count("requirement_value")
            }
            .sortedWith(compareByDescending<Pair<JsonObject, Int>> { it.second }.thenBy { it.first.text("id") })
            .map { it.first }
    }

    suspend fun history(id: String, filter: HistoryFilter, offset: Long): AccountHistoryPage {
        val join = if (filter == HistoryFilter.All) "" else "!inner"
        val knockout = if (filter == HistoryFilter.Correct || filter == HistoryFilter.Wrong) {
            ",knockout:matches()"
        } else {
            ""
        }
        val response = client.from("predictions").select(Columns.raw(
            "id,home_score,away_score,result_type,points_earned,advancing_points," +
                "matches$join(home_team,away_team,league,date,time,status,result_home,result_away,is_knockout)$knockout",
        )) {
            if (offset == 0L) count(Count.EXACT)
            filter {
                eq("user_id", id)
                when (filter) {
                    HistoryFilter.All -> Unit
                    HistoryFilter.Active -> eq("matches.status", "pending")
                    HistoryFilter.Finished -> eq("matches.status", "finished")
                    HistoryFilter.Exact -> {
                        eq("matches.status", "finished")
                        eq("result_type", "exact")
                    }
                    HistoryFilter.Correct -> {
                        eq("matches.status", "finished")
                        eq("knockout.is_knockout", true)
                        or {
                            eq("result_type", "result")
                            and {
                                or {
                                    neq("result_type", "exact")
                                    exact("result_type", null)
                                }
                                gt("advancing_points", 0)
                                filterNot("knockout", FilterOperator.IS, null)
                            }
                        }
                    }
                    HistoryFilter.Wrong -> {
                        eq("matches.status", "finished")
                        eq("knockout.is_knockout", true)
                        // A null result type can still be a failed prediction.
                        or {
                            notIn("result_type", listOf("exact", "result"))
                            exact("result_type", null)
                        }
                        and {
                            or {
                                exact("knockout", null)
                                lte("advancing_points", 0)
                                exact("advancing_points", null)
                            }
                        }
                    }
                }
            }
            order("created_at", Order.DESCENDING)
            order("id", Order.ASCENDING)
            range(offset, offset + HistoryPageSize - 1)
        }
        return AccountHistoryPage(response.decodeList<JsonObject>().map(::AccountPrediction), response.countOrNull())
    }
}

internal const val HistoryPageSize = 30

internal enum class HistoryFilter(val label: String) {
    All("Todas"), Active("Activas"), Finished("Terminadas"),
    Exact("Exactas"), Correct("Acertadas"), Wrong("Falladas"),
}

internal data class AccountHistoryPage(val entries: List<AccountPrediction>, val total: Long?)

internal class AccountPrediction(private val row: JsonObject) {
    val match = row["matches"] as? JsonObject
    val id = requireNotNull(row.text("id"))
    val finished = match?.text("status") == "finished"
    val points = row.count("points_earned") + row.count("advancing_points")
    val prediction = "${row.text("home_score") ?: "—"} – ${row.text("away_score") ?: "—"}"
    val result = "${match?.text("result_home") ?: "—"} – ${match?.text("result_away") ?: "—"}"
    private val advancingCorrect =
        (match?.get("is_knockout") as? JsonPrimitive)?.booleanOrNull == true && row.count("advancing_points") > 0

    val outcome = when {
        !finished -> AccountOutcome.Pending
        row.text("result_type") == "exact" -> AccountOutcome.Exact
        row.text("result_type") == "result" -> AccountOutcome.Correct
        advancingCorrect -> AccountOutcome.Advancing
        else -> AccountOutcome.Wrong
    }
}

internal enum class AccountOutcome(val label: String) {
    Pending("Pendiente"), Exact("Exacto"), Correct("Acertado"),
    Advancing("Avance acertado"), Wrong("Fallado"),
}
