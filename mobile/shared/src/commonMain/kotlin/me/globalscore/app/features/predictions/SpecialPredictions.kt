package me.globalscore.app.features.predictions

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlinx.serialization.json.*
import kotlin.time.Clock
import kotlin.time.Instant

internal data class PredictionField(val label: String, val column: String, val result: String)

internal enum class CompetitionKind(
    val title: String,
    val table: String,
    val foreignKey: String,
    val fields: List<PredictionField>,
) {
    League("Ligas", "leagues", "league_id", listOf(
        PredictionField("campeón", "predicted_champion", "champion"),
        PredictionField("goleador", "predicted_top_scorer", "top_scorer"),
        PredictionField("asistidor", "predicted_top_assist", "top_assist"),
        PredictionField("MVP", "predicted_mvp", "mvp_player"),
    )),
    Award("Premios", "awards", "award_id", listOf(
        PredictionField("ganador", "predicted_winner", "winner"),
    ));

    val predictionTable get() = "${foreignKey.removeSuffix("_id")}_predictions"
}

internal data class Competition(
    val id: String,
    val name: String,
    val season: String?,
    val logo: String?,
    val category: String?,
    val deadline: String?,
    val finished: Boolean,
    val results: List<String?>,
    val prediction: List<String>?,
    val points: Int?,
) {
    fun expired(): Boolean {
        val value = deadline?.takeIf(String::isNotBlank) ?: return false
        val limit = runCatching { Instant.parse(value) }.getOrNull()
            ?: runCatching { LocalDateTime.parse(value).toInstant(TimeZone.currentSystemDefault()) }.getOrNull()
        return limit == null || Clock.System.now() >= limit
    }
}

private fun JsonObject.string(key: String) = (get(key) as? JsonPrimitive)?.contentOrNull

internal class SpecialPredictions(private val client: SupabaseClient, private val kind: CompetitionKind) {
    suspend fun load(userId: String): List<Competition> {
        val competitions = pages { start, end ->
            client.from(kind.table).select {
                order("id", Order.ASCENDING)
                range(start, end)
            }.decodeList<JsonObject>()
        }
        val predictions = pages { start, end ->
            client.from(kind.predictionTable).select {
                filter { eq("user_id", userId) }
                order(kind.foreignKey, Order.ASCENDING)
                range(start, end)
            }.decodeList<JsonObject>()
        }.associateBy { it.string(kind.foreignKey) }

        return competitions.map { row ->
            val id = requireNotNull(row.string("id"))
            val prediction = predictions[id]
            Competition(
                id = id, name = row.string("name").orEmpty(), season = row.string("season"),
                logo = row.string("logo_url"), category = row.string("category"),
                deadline = row.string("deadline"), finished = row.string("status") == "finished",
                results = kind.fields.map { row.string(it.result) },
                prediction = prediction?.let { saved -> kind.fields.map { saved.string(it.column).orEmpty() } },
                points = prediction?.string("points_earned")?.toIntOrNull(),
            )
        }.sortedWith(compareBy<Competition>({ it.finished }, { it.deadline ?: "\uffff" }, { it.name }))
    }

    suspend fun save(userId: String, competition: Competition, values: List<String>) {
        require(values.size == kind.fields.size && values.all(String::isNotBlank))
        val current = client.from(kind.table).select {
            filter { eq("id", competition.id) }
            limit(1)
        }.decodeList<JsonObject>().firstOrNull()
        check(current != null && current.string("status") != "finished" &&
            !competition.copy(deadline = current.string("deadline")).expired())
        client.from(kind.predictionTable).upsert(buildJsonObject {
            put(kind.foreignKey, competition.id)
            put("user_id", userId)
            kind.fields.zip(values).forEach { (field, value) -> put(field.column, value) }
        }) {
            onConflict = "${kind.foreignKey},user_id"
        }
    }

    private suspend fun pages(page: suspend (Long, Long) -> List<JsonObject>): List<JsonObject> {
        val rows = mutableListOf<JsonObject>()
        do {
            val start = rows.size.toLong()
            val batch = page(start, start + 499)
            rows.addAll(batch)
        } while (batch.size == 500)
        return rows
    }
}
