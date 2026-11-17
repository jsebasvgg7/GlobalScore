package me.globalscore.app.features.stats

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.datetime.DayOfWeek
import kotlinx.datetime.LocalDate
import kotlinx.datetime.parseOrNull
import kotlinx.serialization.json.JsonObject
import me.globalscore.app.features.profile.count
import me.globalscore.app.features.profile.text
import kotlin.math.roundToInt

internal enum class StatsRange(val label: String, val prefix: String?) {
    Global("Global", "season"), Month("Mes", "monthly"), All("Histórico", null),
}

internal class StatsRepository(private val database: SupabaseClient) {
    suspend fun load(userId: String): StatsData = coroutineScope {
        val matches = async {
            rows("predictions", userId, "id,created_at,result_type,points_earned,advancing_points,matches!inner(date,status,league,league_logo_url)", finishedMatches = true)
                .mapNotNull { row ->
                    val match = row["matches"] as? JsonObject ?: return@mapNotNull null
                    val type = row.text("result_type") ?: return@mapNotNull null
                    if (match.text("status") != "finished") return@mapNotNull null
                    val date = match.text("date").orEmpty().take(10)
                    MatchResult(date, row.text("created_at").orEmpty(), type, row.count("points_earned"),
                        row.count("advancing_points"), match.text("league"), match.text("league_logo_url"))
                }.sortedWith(compareByDescending<MatchResult> { it.date }.thenByDescending { it.created })
        }
        val leagues = async { rows("league_predictions", userId, "id,created_at,points_earned") }
        val awards = async { rows("award_predictions", userId, "id,created_at,points_earned") }
        val counters = async {
            database.from("users").select(Columns.raw(
                "season_points,season_predictions,season_correct,monthly_points,monthly_predictions,monthly_correct",
            )) {
                filter { eq("id", userId) }
                limit(1)
            }.decodeList<JsonObject>().firstOrNull()
        }
        StatsData(matches.await(), leagues.await(), awards.await(), counters.await())
    }

    private suspend fun rows(table: String, userId: String, columns: String, finishedMatches: Boolean = false): List<JsonObject> = buildList {
        val pageSize = 500
        var offset = 0L
        do {
            val page = database.from(table).select(Columns.raw(columns)) {
                filter {
                    eq("user_id", userId)
                    if (finishedMatches) eq("matches.status", "finished")
                }
                order("id", Order.ASCENDING)
                range(offset, offset + pageSize - 1)
            }.decodeList<JsonObject>()
            addAll(page)
            offset += page.size
        } while (page.size == pageSize)
    }
}

internal data class MatchResult(
    val date: String, val created: String, val type: String, val points: Int,
    val advancing: Int, val league: String?, val logo: String?,
) {
    val correct get() = type == "exact" || type == "result"
}

internal data class LeagueAccuracy(val name: String, val logo: String?, val accuracy: Int)
internal data class DayAccuracy(val total: Int, val correct: Int)

internal data class StatsReport(
    val windowFrom: String?, val total: Int, val points: Int, val accuracy: Int,
    val exact: Int, val correct: Int, val wrong: Int,
    val leagues: List<LeagueAccuracy>, val days: List<DayAccuracy>,
    val matchPoints: Int, val leaguePoints: Int, val awardPoints: Int,
    val leagueCount: Int, val awardCount: Int,
    val currentStreak: Int, val bestStreak: Int,
)

internal fun percentage(part: Int, total: Int) = if (total > 0) (100.0 * part / total).roundToInt() else 0

private val whitespace = Regex("\\s+")
private val finalSuffix = Regex("\\s*[-–—]?\\s*\\(?\\s*final\\s*\\)?\\s*$", RegexOption.IGNORE_CASE)

private fun leagueName(name: String): String {
    val normalized = name.replace(whitespace, " ").trim().replace(finalSuffix, "").trim()
    return if (normalized.equals("elf cup", ignoreCase = true)) "EFL Cup" else normalized
}

internal class StatsData(
    private val matches: List<MatchResult>,
    private val leagues: List<JsonObject>,
    private val awards: List<JsonObject>,
    private val counters: JsonObject?,
) {
    fun report(range: StatsRange, today: LocalDate): StatsReport {
        val prefix = range.prefix
        val useCounters = prefix != null && counters != null
        val predictionCount = counters?.count("${prefix}_predictions")?.coerceAtLeast(0) ?: 0
        val correctCount = counters?.count("${prefix}_correct") ?: 0
        val rankedPoints = counters?.count("${prefix}_points") ?: 0
        val monthFrom = today.toString().take(7) + "-01"
        val finished = when {
            range == StatsRange.All -> matches
            useCounters && range == StatsRange.Month -> matches.take(predictionCount).filter { it.date >= monthFrom }
            useCounters -> matches.take(predictionCount)
            range == StatsRange.Month -> matches.filter { it.date.startsWith(monthFrom.take(7)) }
            else -> matches.filter { it.date >= "2026-10-04" }
        }
        val windowFrom = finished.lastOrNull()?.date
        val scopedLeagues = specialInRange(leagues, range, windowFrom)
        val scopedAwards = specialInRange(awards, range, windowFrom)
        val leaguePoints = scopedLeagues.sumOf { it.count("points_earned") }
        val awardPoints = scopedAwards.sumOf { it.count("points_earned") }
        val matchPoints = when {
            !useCounters -> finished.sumOf { it.points + it.advancing }
            range == StatsRange.Month -> (rankedPoints - leaguePoints - awardPoints).coerceAtLeast(0)
            else -> rankedPoints
        }

        val total = if (useCounters) predictionCount else finished.size
        val hits = if (useCounters) correctCount else finished.count { it.correct }
        val exact = finished.count { it.type == "exact" }.coerceAtMost(hits)
        val namedMatches = finished.filter { !it.league.isNullOrEmpty() }
            .map { leagueName(it.league.orEmpty()) to it }
        val topLeagues = namedMatches.groupBy { it.first.lowercase() }.values
            .sortedByDescending { it.size }.take(6).map { group ->
                val name = group.groupingBy { it.first }.eachCount().maxBy { it.value }.key
                val logo = group.firstNotNullOfOrNull { it.second.logo?.takeIf(String::isNotBlank) }
                LeagueAccuracy(name, logo, percentage(group.count { it.second.correct }, group.size))
            }
        val byDay = finished.groupBy { LocalDate.parseOrNull(it.date)?.dayOfWeek }
        val days = DayOfWeek.entries.map { day ->
            val rows = byDay[day].orEmpty()
            DayAccuracy(rows.size, rows.count { it.points > 0 })
        }
        val currentStreak = finished.takeWhile { it.correct }.size
        var bestStreak = 0
        var streak = 0
        for (result in finished) {
            streak = if (result.correct) streak + 1 else 0
            bestStreak = maxOf(bestStreak, streak)
        }
        return StatsReport(
            windowFrom, total, if (useCounters) rankedPoints else matchPoints + leaguePoints + awardPoints,
            percentage(hits, total), exact, hits - exact, (total - hits).coerceAtLeast(0),
            topLeagues, listOf(days.last()) + days.dropLast(1), matchPoints, leaguePoints, awardPoints,
            scopedLeagues.size, scopedAwards.size, currentStreak, bestStreak,
        )
    }

    private fun specialInRange(rows: List<JsonObject>, range: StatsRange, windowFrom: String?) =
        if (range == StatsRange.All) rows
        else rows.filter { windowFrom != null && it.text("created_at").orEmpty().take(10) >= windowFrom }
}
