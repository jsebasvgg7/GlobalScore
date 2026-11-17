package me.globalscore.app.features.matches

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.*
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlin.time.Clock
import kotlin.time.Instant

internal data class Match(
    val id: String,
    val league: String,
    val home: String,
    val away: String,
    val time: String,
    val date: String,
    val homeLogo: String?,
    val awayLogo: String?,
    val leagueLogo: String?,
    val homeProbability: Int?,
    val drawProbability: Int?,
    val awayProbability: Int?,
    val deadline: String?,
    val knockout: Boolean,
) {
    fun isClosed(): Boolean = deadline?.let { value ->
        val instant = runCatching { Instant.parse(value) }.getOrNull()
            ?: runCatching { LocalDateTime.parse(value).toInstant(TimeZone.currentSystemDefault()) }.getOrNull()
        instant == null || Clock.System.now() >= instant
    } ?: false
}

internal data class Prediction(val home: Int, val away: Int, val advancing: String?)
internal data class MatchDashboard(
    val userId: String,
    val name: String,
    val avatar: String?,
    val monthlyPoints: Int,
    val matches: List<Match>,
    val predictions: Map<String, Prediction>,
)

private fun JsonObject.string(key: String) = (get(key) as? JsonPrimitive)?.contentOrNull
private fun JsonObject.number(key: String) = (get(key) as? JsonPrimitive)?.doubleOrNull?.toInt()

internal class MatchRepository(private val client: SupabaseClient) {
    suspend fun load(authId: String): MatchDashboard {
        val user = client.from("users").select {
            filter { eq("auth_id", authId) }
            limit(1)
        }.decodeList<JsonObject>().firstOrNull()
            ?: error("Tu cuenta todavía no tiene un perfil de GlobalScore.")
        val userId = requireNotNull(user.string("id"))
        val matches = readPages { start, end ->
            client.from("matches").select {
                filter { eq("status", "pending") }
                order("id", Order.ASCENDING)
                range(start, end)
            }.decodeList<JsonObject>()
        }.map { row ->
            Match(
                id = requireNotNull(row.string("id")),
                league = row.string("league").orEmpty(),
                home = row.string("home_team").orEmpty(),
                away = row.string("away_team").orEmpty(),
                time = row.string("time").orEmpty().take(5),
                date = row.string("date").orEmpty(),
                homeLogo = row.string("home_team_logo_url"),
                awayLogo = row.string("away_team_logo_url"),
                leagueLogo = row.string("league_logo_url"),
                homeProbability = row.number("prob_home"),
                drawProbability = row.number("prob_draw"),
                awayProbability = row.number("prob_away"),
                deadline = row.string("deadline"),
                knockout = row.string("is_knockout") == "true",
            )
        }.sortedWith(compareBy(Match::date, Match::time))

        val predictions = matches.map(Match::id).chunked(50).flatMap { ids ->
            client.from("predictions").select {
                filter {
                    eq("user_id", userId)
                    isIn("match_id", ids)
                }
            }.decodeList<JsonObject>()
        }.mapNotNull { row ->
            val matchId = row.string("match_id") ?: return@mapNotNull null
            val home = row.number("home_score") ?: return@mapNotNull null
            val away = row.number("away_score") ?: return@mapNotNull null
            matchId to Prediction(home, away, row.string("predicted_advancing_team"))
        }.toMap()
        return MatchDashboard(
            userId, user.string("name").orEmpty().ifBlank { "GlobalScore" },
            user.string("avatar_url"), user.number("monthly_points") ?: 0, matches, predictions,
        )
    }

    suspend fun save(userId: String, match: Match, prediction: Prediction) {
        check(!match.isClosed()) { "El plazo para pronosticar terminó." }
        val pending = client.from("matches").select {
            filter {
                eq("id", match.id)
                eq("status", "pending")
            }
            limit(1)
        }.decodeList<JsonObject>().firstOrNull()
        check(pending != null && !match.copy(deadline = pending.string("deadline")).isClosed()) {
            "El plazo para pronosticar terminó."
        }
        client.from("predictions").upsert(buildJsonObject {
            put("match_id", match.id)
            put("user_id", userId)
            put("home_score", prediction.home)
            put("away_score", prediction.away)
            if (match.knockout) put("predicted_advancing_team", prediction.advancing)
        }) {
            onConflict = "match_id,user_id"
        }
    }

    private suspend fun readPages(
        page: suspend (Long, Long) -> List<JsonObject>,
    ): List<JsonObject> {
        val result = mutableListOf<JsonObject>()
        do {
            val start = result.size.toLong()
            val next = page(start, start + 499)
            result.addAll(next)
        } while (next.size == 500)
        return result
    }
}

internal fun teamCode(name: String): String {
    val words = name.split(" ", "-", ".").filter(String::isNotBlank)
    val initials = words.joinToString("") { it.take(1) }
    return (if (initials.length >= 3) initials else words.joinToString("")).take(3).uppercase()
}
