package me.globalscore.app.features.ranking

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.query.filter.PostgrestFilterBuilder
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull

internal data class RankingStats(
    val points: Int = 0,
    val correct: Int = 0,
    val predictions: Int = 0,
) {
    val accuracy get() = if (predictions > 0) (correct * 100L + predictions / 2) / predictions else 0L
}

private data class RankingUser(
    val id: String,
    val name: String? = null,
    val avatar: String? = null,
    val points: Int? = null,
    val seasonPoints: Int? = null,
    val seasonCorrect: Int? = null,
    val seasonPredictions: Int? = null,
    val monthlyPoints: Int? = null,
    val monthlyCorrect: Int? = null,
    val monthlyPredictions: Int? = null,
)

internal data class RankingEntry(
    val id: String,
    val name: String,
    val avatar: String?,
    val position: Int,
    val stats: RankingStats,
)

internal data class RankingTable(
    val entries: List<RankingEntry>,
    val participants: Int,
    val registered: Int,
)

internal data class Rankings(val global: RankingTable, val monthly: RankingTable)

internal class RankingRepository(private val client: SupabaseClient) {
    suspend fun load(): Rankings {
        val users = readRows(
            "users", "id",
            Columns.list(
                "id", "name", "avatar_url", "points",
                "season_points", "season_correct", "season_predictions",
                "monthly_points", "monthly_correct", "monthly_predictions",
            ),
        ).map { row ->
            RankingUser(
                id = requireNotNull(row.string("id")) { "Fila del ranking sin ID." },
                name = row.string("name"),
                avatar = row.string("avatar_url"),
                points = row.number("points"),
                seasonPoints = row.number("season_points"),
                seasonCorrect = row.number("season_correct"),
                seasonPredictions = row.number("season_predictions"),
                monthlyPoints = row.number("monthly_points"),
                monthlyCorrect = row.number("monthly_correct"),
                monthlyPredictions = row.number("monthly_predictions"),
            )
        }

        fun table(statsFor: (RankingUser) -> RankingStats): RankingTable {
            val scored = users.map { it to statsFor(it) }
            val entries = scored.filter { (_, stats) -> stats.points > 0 }
                .sortedWith(
                    compareByDescending<Pair<RankingUser, RankingStats>> { it.second.points }
                        .thenByDescending { it.first.points ?: 0 }
                        .thenBy { it.first.id },
                )
                .mapIndexed { index, (user, stats) ->
                    RankingEntry(user.id, user.name.orEmpty().ifBlank { "Jugador" }, user.avatar, index + 1, stats)
                }
            return RankingTable(entries, scored.count { it.second.predictions > 0 }, users.size)
        }

        return Rankings(
            global = table { RankingStats(it.seasonPoints ?: 0, it.seasonCorrect ?: 0, it.seasonPredictions ?: 0) },
            monthly = table { RankingStats(it.monthlyPoints ?: 0, it.monthlyCorrect ?: 0, it.monthlyPredictions ?: 0) },
        )
    }

    suspend fun archivedMonths(): List<ArchivedMonth> =
        client.postgrest.rpc("get_snapshot_months").decodeList<JsonObject>().map { row ->
            ArchivedMonth(
                year = requireNotNull(row.number("year")),
                month = requireNotNull(row.number("month")).also { require(it in 1..12) },
                participants = requireNotNull(row.number("participant_count")),
            )
        }

    suspend fun archivedRanking(month: ArchivedMonth): List<RankingEntry> =
        readRows(
            "monthly_ranking_snapshots", "rank",
            Columns.list("id", "username", "avatar_url", "rank", "points", "correct", "predictions"),
        ) {
            eq("month", month.month)
            eq("year", month.year)
        }.map { row ->
            RankingEntry(
                id = requireNotNull(row.string("id")),
                name = row.string("username").orEmpty().ifBlank { "Jugador" },
                avatar = row.string("avatar_url"),
                position = requireNotNull(row.number("rank")),
                stats = RankingStats(row.number("points") ?: 0, row.number("correct") ?: 0, row.number("predictions") ?: 0),
            )
        }

    suspend fun loadChampions(monthly: Boolean): List<Champion> {
        val table = if (monthly) "monthly_championship_history" else "global_championship_history"
        val edition = if (monthly) "month_year" else "edition_label"
        val history = readRows(table, edition, Columns.list("user_id", "points", edition))
            .mapNotNull { row -> row.string("user_id")?.let { it to row } }
            .groupBy({ it.first }, { it.second })

        val profiles = history.keys.chunked(50).flatMap { ids ->
            client.from("users").select(
                Columns.list("id", "name", "avatar_url", "equipped_banner_url", "best_streak"),
            ) {
                filter { isIn("id", ids) }
            }.decodeList<JsonObject>()
        }.associateBy { it.string("id") }

        return history.map { (id, titles) ->
            val profile = profiles[id]
            Champion(
                id = id,
                name = profile?.string("name").orEmpty().ifBlank { "Jugador" },
                avatar = profile?.string("avatar_url"),
                banner = profile?.string("equipped_banner_url"),
                titles = titles.size,
                bestPoints = titles.mapNotNull { it.number("points") }.maxOrNull() ?: 0,
                firstEdition = titles.mapNotNull { it.string(edition)?.takeIf(String::isNotBlank) }.minOrNull(),
                bestStreak = profile?.number("best_streak") ?: 0,
            )
        }.sortedWith(compareByDescending(Champion::titles).thenByDescending(Champion::bestPoints).thenBy(Champion::id))
    }

    private suspend fun readRows(
        table: String,
        orderBy: String,
        columns: Columns,
        filters: PostgrestFilterBuilder.() -> Unit = {},
    ): List<JsonObject> = buildList {
        val pageSize = 100
        var start = 0L
        do {
            val page = client.from(table).select(columns) {
                filter(filters)
                order(orderBy, Order.ASCENDING)
                range(start, start + pageSize - 1)
            }.decodeList<JsonObject>()
            addAll(page)
            start += page.size
        } while (page.size == pageSize)
    }

}

private fun JsonObject.string(key: String) = (get(key) as? JsonPrimitive)?.contentOrNull
private fun JsonObject.number(key: String) = (get(key) as? JsonPrimitive)?.doubleOrNull?.toInt()

internal data class Champion(
    val id: String,
    val name: String,
    val avatar: String?,
    val banner: String?,
    val titles: Int,
    val bestPoints: Int,
    val firstEdition: String?,
    val bestStreak: Int,
)

internal data class ArchivedMonth(val year: Int, val month: Int, val participants: Int) {
    val key get() = "$year-$month"
}
