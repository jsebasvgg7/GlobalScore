package me.globalscore.app.features.logbook

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.globalscore.app.features.profile.count
import me.globalscore.app.features.profile.text

internal enum class LogbookCounter(val column: String) {
    Wins("gan"), Draws("emp"), Losses("per"), Conceded("gc"), OwnGoals("rival"),
    Goals("g"), Assists("a"), Mvp("mvp"),
}

internal class LogbookTeam(private val row: JsonObject) {
    val id = requireNotNull(row.text("id"))
    val name = row.text("name").orEmpty()
    val game = row.text("game").orEmpty()
    val formation = row.text("formation").orEmpty()
    val players = (row["libreta_players"] as? JsonArray).orEmpty()
        .filterIsInstance<JsonObject>()
        .sortedWith(compareBy<JsonObject> { it.count("sort_order") }.thenBy { it.text("created_at") }.thenBy { it.text("id") })
        .map(::LogbookPlayer)
    fun count(counter: LogbookCounter) = row.count(counter.column)
    val played = count(LogbookCounter.Wins).toLong() + count(LogbookCounter.Draws) + count(LogbookCounter.Losses)
    val goalsFor = players.sumOf { it.count(LogbookCounter.Goals).toLong() } + count(LogbookCounter.OwnGoals) + row.count("archived")
    val difference = goalsFor - count(LogbookCounter.Conceded)
    val empty = played == 0L && goalsFor == 0L && count(LogbookCounter.Conceded) == 0 &&
        players.all { it.count(LogbookCounter.Assists) == 0 && it.count(LogbookCounter.Mvp) == 0 }
}

internal class LogbookPlayer(private val row: JsonObject) {
    val id = requireNotNull(row.text("id"))
    val name = row.text("name").orEmpty()
    val position = row.text("pos").orEmpty()
    fun count(counter: LogbookCounter) = row.count(counter.column)
}

internal class LogbookRepository(private val client: SupabaseClient, private val userId: String) {
    suspend fun teams(): List<LogbookTeam> = buildList {
        val pageSize = 100
        var start = 0L
        do {
            val page = client.from("libreta_teams").select(
                Columns.raw("id,name,game,formation,gan,emp,per,gc,rival,archived,libreta_players(id,name,pos,g,a,mvp,sort_order,created_at)"),
            ) {
                filter { eq("user_id", userId) }
                order("created_at", Order.ASCENDING)
                order("id", Order.ASCENDING)
                range(start, start + pageSize - 1)
            }.decodeList<JsonObject>()
            addAll(page.map(::LogbookTeam))
            start += page.size
        } while (page.size == pageSize)
    }

    suspend fun saveTeam(id: String?, name: String, game: String, formation: String): String {
        val details = buildJsonObject {
            put("name", name)
            put("game", game)
            put("formation", formation)
        }
        val table = client.from("libreta_teams")
        if (id == null) {
            val newTeam = JsonObject(details + buildJsonObject { put("user_id", userId) })
            return requireNotNull(table.insert(newTeam) { select(Columns.list("id")) }
                .decodeList<JsonObject>().single().text("id"))
        }
        table.update(details) {
            filter { eq("id", id); eq("user_id", userId) }
            select(Columns.list("id"))
        }.decodeList<JsonObject>().single()
        return id
    }

    suspend fun savePlayer(teamId: String, id: String?, name: String, position: String) {
        val details = buildJsonObject {
            put("name", name)
            put("pos", position)
        }
        val table = client.from("libreta_players")
        if (id == null) {
            table.insert(JsonObject(details + buildJsonObject { put("team_id", teamId) }))
        } else {
            table.update(details) {
                filter { eq("id", id); eq("team_id", teamId) }
                select(Columns.list("id"))
            }.decodeList<JsonObject>().single()
        }
    }

    suspend fun changeCounter(teamId: String, playerId: String?, counter: LogbookCounter, old: Int, delta: Int) {
        val table = client.from(if (playerId == null) "libreta_teams" else "libreta_players")
        table.update(buildJsonObject { put(counter.column, old + delta) }) {
            filter {
                eq("id", playerId ?: teamId)
                if (playerId == null) eq("user_id", userId) else eq("team_id", teamId)
                // A simultaneous edit must not overwrite the value saved by another client.
                eq(counter.column, old)
            }
            select(Columns.list("id"))
        }.decodeList<JsonObject>().single()
    }

    suspend fun deletePlayer(id: String) {
        client.postgrest.rpc("libreta_delete_player", buildJsonObject { put("p_player_id", id) })
    }

    suspend fun deleteTeam(id: String) {
        client.from("libreta_teams").delete {
            filter { eq("id", id); eq("user_id", userId) }
            select(Columns.list("id"))
        }.decodeList<JsonObject>().single()
    }
}
