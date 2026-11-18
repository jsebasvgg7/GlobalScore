package me.globalscore.app.features.logbook

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import me.globalscore.app.features.profile.AccountProgressHeader
import me.globalscore.app.features.profile.text
import me.globalscore.app.ui.SkeletonBlock

@Composable
internal fun LogbookRoomsScreen(
    database: SupabaseClient,
    userId: String,
    teams: List<LogbookTeam>,
    bottomPadding: Dp,
    onBack: () -> Unit,
) {
    val repository = remember(database) { LogbookRoomRepository(database) }
    val scope = rememberCoroutineScope()
    val colors = MaterialTheme.colorScheme
    var roomId by rememberSaveable(userId) { mutableStateOf<String?>(null) }
    var rooms by remember(repository) { mutableStateOf<List<JsonObject>?>(null) }
    var room by remember(repository) { mutableStateOf<LogbookRoom?>(null) }
    var busy by remember(repository) { mutableStateOf(false) }
    var error by remember(repository) { mutableStateOf<String?>(null) }
    var confirmation by remember { mutableStateOf<String?>(null) }
    var fromZero by rememberSaveable { mutableStateOf(false) }
    var createTeamId by rememberSaveable { mutableStateOf<String?>(null) }
    var joinTeamId by rememberSaveable { mutableStateOf<String?>(null) }
    var code by rememberSaveable { mutableStateOf("") }

    fun request(action: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                action()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (failure: Exception) {
                error = roomError(failure)
            } finally {
                busy = false
            }
        }
    }

    fun refresh() = request {
        val id = roomId
        if (id == null) rooms = repository.list() else room = repository.get(id)
    }

    fun openRoom(id: String) {
        room = null
        roomId = id
    }

    LaunchedEffect(repository, roomId) { refresh() }

    Column(Modifier.fillMaxSize()) {
        AccountProgressHeader(if (roomId == null) "Salas 1 vs 1" else "Sala 1 vs 1") {
            if (!busy) {
                if (roomId == null) onBack()
                else {
                    room = null
                    roomId = null
                }
            }
        }
        LazyColumn(
            Modifier.weight(1f),
            contentPadding = PaddingValues(top = 12.dp, bottom = bottomPadding),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (error != null) {
                item {
                    LogbookCard {
                        Text(error.orEmpty(), color = colors.error)
                        TextButton(onClick = ::refresh, enabled = !busy) { Text("Actualizar") }
                    }
                }
            }
            if (roomId == null) {
                val createOptions = teams.filter { !fromZero || it.empty }
                val createTeam = createOptions.firstOrNull { it.id == createTeamId }
                val joinTeam = teams.firstOrNull { it.id == joinTeamId }
                item {
                    LogbookCard {
                        RoomHeading("Crear sala")
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            FilterChip(!fromZero, { fromZero = false }, { Text("Historial") }, modifier = Modifier.weight(1f), enabled = !busy)
                            FilterChip(fromZero, { fromZero = true }, { Text("Desde 0") }, modifier = Modifier.weight(1f), enabled = !busy)
                        }
                        Text("Tu equipo", style = MaterialTheme.typography.labelMedium)
                        LogbookSelect(
                            createTeam?.name ?: "Elige un equipo", createOptions, { it.name },
                            !busy && createOptions.isNotEmpty(), Modifier.fillMaxWidth(),
                        ) { createTeamId = it.id }
                        if (createOptions.isEmpty()) {
                            Text(if (fromZero) "Necesitas un equipo sin estadísticas." else "Crea un equipo en tu Libreta.")
                        }
                        Button(
                            onClick = {
                                if (createTeam != null) request { openRoom(repository.create(createTeam.id, fromZero)) }
                            },
                            enabled = !busy && createTeam != null, modifier = Modifier.fillMaxWidth(),
                        ) { Text("Crear sala") }
                    }
                }
                item {
                    LogbookCard {
                        RoomHeading("Unirme con código")
                        OutlinedTextField(
                            code, { code = it.uppercase().filter { char -> char in 'A'..'Z' || char in '0'..'9' }.take(6) },
                            modifier = Modifier.fillMaxWidth(), label = { Text("Código") },
                            placeholder = { Text("XXXXXX") }, singleLine = true, enabled = !busy,
                        )
                        Text("Tu equipo", style = MaterialTheme.typography.labelMedium)
                        LogbookSelect(
                            joinTeam?.name ?: "Elige un equipo", teams, { it.name },
                            !busy && teams.isNotEmpty(), Modifier.fillMaxWidth(),
                        ) { joinTeamId = it.id }
                        Button(
                            onClick = { if (joinTeam != null) request { openRoom(repository.join(code, joinTeam.id)) } },
                            enabled = !busy && code.length == 6 && joinTeam != null, modifier = Modifier.fillMaxWidth(),
                        ) { Text("Unirme") }
                    }
                }
                val listed = rooms
                if (listed == null && error == null) {
                    items(2) { SkeletonBlock(Modifier.fillMaxWidth().height(72.dp)) }
                } else if (listed != null) {
                    val (ongoing, ended) = listed.partition { it.text("status") in listOf("waiting", "active") }
                    listOf("En curso" to ongoing, "Historial" to ended).forEach { (title, entries) ->
                        item {
                            LogbookCard {
                                RoomHeading(title)
                                if (entries.isEmpty()) {
                                    Text(if (title == "En curso") "Aún no hay salas en curso." else "Aún no hay salas terminadas.")
                                }
                                entries.forEach { entry ->
                                    val id = entry.text("id")
                                    if (id != null) RoomListEntry(entry, enabled = !busy) { openRoom(id) }
                                }
                            }
                        }
                    }
                }
            } else {
                val current = room
                val id = roomId
                if (current == null && error == null) {
                    items(3) { SkeletonBlock(Modifier.fillMaxWidth().height(80.dp)) }
                }
                if (current != null && id != null) {
                    val ongoing = current.status == "waiting" || current.status == "active"
                    if (ongoing) {
                        item {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                                OutlinedButton(onClick = {
                                    request {
                                        repository.pin(id, !current.pinned)
                                        room = repository.get(id)
                                    }
                                }, enabled = !busy) { Text(if (current.pinned) "★ Desfijar" else "☆ Fijar") }
                                Spacer(Modifier.width(8.dp))
                                Button(onClick = ::refresh, enabled = !busy) { Text("Actualizar") }
                            }
                        }
                    }
                    item {
                        LogbookCard(highlight = true) {
                            RoomHeading(if (current.status == "waiting") "Esperando rival" else "Tabla de posiciones")
                            SelectionContainer { Text("Código: ${current.code}", fontWeight = FontWeight.Bold) }
                            Text(if (current.fromZero) "Desde 0" else "Historial", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    if (current.status == "waiting") {
                        item { LogbookCard { Text("Comparte el código para que tu rival pueda unirse.") } }
                    }
                    if (current.status == "cancelled") {
                        item { LogbookCard { Text("La sala fue cancelada.") } }
                    }
                    if (current.status == "finished") {
                        item {
                            LogbookCard {
                                RoomHeading(when (current.winner) {
                                    null -> "Empate"
                                    userId -> "Ganaste la sala"
                                    else -> "Ganó tu rival"
                                })
                            }
                        }
                    }
                    if (current.members.size == 2 && current.members.all { it.team != null }) {
                        item { RoomComparison(current) }
                    }
                    if (ongoing) {
                        item {
                            if (current.status == "active") {
                                Button(
                                    onClick = { confirmation = "Finalizar" }, enabled = !busy,
                                    modifier = Modifier.fillMaxWidth(),
                                ) { Text("Finalizar sala") }
                            }
                            OutlinedButton(
                                onClick = { confirmation = "Cancelar" }, enabled = !busy,
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.error),
                            ) { Text("Cancelar sala") }
                        }
                    }
                }
            }
        }
    }
    confirmation?.let { action ->
        val id = roomId
        val finish = action == "Finalizar"
        AlertDialog(
            onDismissRequest = { confirmation = null },
            title = { Text("$action sala") },
            text = { Text(if (finish) "Se guardará la tabla actual como resultado final." else "La sala dejará de estar disponible.") },
            confirmButton = {
                TextButton(
                    enabled = id != null && !busy,
                    onClick = {
                        confirmation = null
                        if (id != null) request {
                            if (finish) repository.finish(id) else repository.cancel(id)
                            room = repository.get(id)
                        }
                    },
                ) { Text(action) }
            },
            dismissButton = { TextButton(onClick = { confirmation = null }) { Text("Volver") } },
        )
    }
}

@Composable
private fun RoomListEntry(row: JsonObject, enabled: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val status = when (row.text("status")) {
        "waiting" -> "Esperando rival"
        "active" -> "En juego"
        "finished" -> "Terminada"
        else -> "Cancelada"
    }
    val scores = row.text("my_points")?.let { mine -> row.text("rival_points")?.let { "$mine – $it" } }
    Surface(
        onClick = onClick, enabled = enabled, modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.small, color = colors.primary.copy(alpha = 0.07f),
        contentColor = colors.primary, border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.16f)),
    ) {
        Row(Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Column(Modifier.weight(1f)) {
                Text(row.text("my_team_name") ?: "Equipo", fontWeight = FontWeight.Bold)
                row.text("rival_name")?.let { Text("vs $it", style = MaterialTheme.typography.bodySmall) }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(if (row.text("pinned") == "true") "★ $status" else status, style = MaterialTheme.typography.labelMedium)
                Text(scores ?: row.text("code").orEmpty(), style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

private class RoomStats(val member: RoomMember) {
    val team = requireNotNull(member.team)
    val wins = team.count(LogbookCounter.Wins)
    val draws = team.count(LogbookCounter.Draws)
    val losses = team.count(LogbookCounter.Losses)
    val against = team.count(LogbookCounter.Conceded)
    val winRate = if (team.played > 0) (wins * 100L + team.played / 2) / team.played else 0L
    fun best(by: LogbookCounter, tie: LogbookCounter) = team.players.sortedWith(
        compareByDescending<LogbookPlayer> { it.count(by) }.thenByDescending { it.count(tie) }.thenBy { it.name },
    ).firstOrNull()
    val scorer = best(LogbookCounter.Goals, LogbookCounter.Assists)
    val assister = best(LogbookCounter.Assists, LogbookCounter.Goals)
    val mvp = best(LogbookCounter.Mvp, LogbookCounter.Goals)

    fun comparison() = listOf(
        wins.toLong(), -losses.toLong(), winRate, team.goalsFor, -against.toLong(), team.difference,
        (scorer?.count(LogbookCounter.Goals) ?: 0).toLong(),
        (assister?.count(LogbookCounter.Assists) ?: 0).toLong(),
        (mvp?.count(LogbookCounter.Mvp) ?: 0).toLong(),
    )
}

@Composable
private fun RoomComparison(room: LogbookRoom) {
    val entries = remember(room) {
        val sides = room.members.map(::RoomStats)
        val values = sides[0].comparison().zip(sides[1].comparison())
        sides.mapIndexed { index, side ->
            val calculated = if (index == 0) values.count { it.first > it.second } else values.count { it.second > it.first }
            side to (room.finalPoints(side.member.id) ?: calculated)
        }.sortedByDescending { it.second }
    }
    LogbookCard {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            entries.forEachIndexed { index, (side, points) ->
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    RoomMetric("N.º ${index + 1}", side.team.name, side.member.name)
                    RoomMetric("Puntos", points.toString())
                    RoomMetric("Partidos", side.team.played.toString())
                    RoomHeading("Datos")
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        RoomMetric("PG", side.wins.toString(), modifier = Modifier.weight(1f))
                        RoomMetric("PP", side.losses.toString(), modifier = Modifier.weight(1f))
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        RoomMetric("PE", side.draws.toString(), modifier = Modifier.weight(1f))
                        RoomMetric("%V", "${side.winRate}%", modifier = Modifier.weight(1f))
                    }
                    RoomHeading("Goles")
                    RoomMetric("A favor", side.team.goalsFor.toString())
                    RoomMetric("En contra", side.against.toString())
                    RoomMetric("Diferencia", side.team.difference.toString())
                    RoomHeading("Stats Jug.")
                    RoomMetric("Goleador", (side.scorer?.count(LogbookCounter.Goals) ?: 0).toString(), side.scorer?.name)
                    RoomMetric("Asistidor", (side.assister?.count(LogbookCounter.Assists) ?: 0).toString(), side.assister?.name)
                    RoomMetric("MVP", (side.mvp?.count(LogbookCounter.Mvp) ?: 0).toString(), side.mvp?.name)
                }
            }
        }
    }
}

@Composable
private fun RoomHeading(text: String) {
    Text(text.replaceFirstChar { it.lowercaseChar() }, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
}

@Composable
private fun RoomMetric(label: String, value: String, name: String? = null, modifier: Modifier = Modifier) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier.fillMaxWidth(), shape = MaterialTheme.shapes.small,
        color = colors.primary.copy(alpha = 0.09f), contentColor = colors.primary,
    ) {
        Column(Modifier.padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, style = MaterialTheme.typography.labelSmall, textAlign = TextAlign.Center)
            Text(value, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            if (name != null) Text(name, style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
        }
    }
}

private fun roomError(failure: Exception): String {
    val detail = failure.message.orEmpty()
    return listOf(
        "Equipo no válido", "El equipo ya está en una sala activa",
        "La sala es desde 0 y el equipo ya tiene stats", "Sala no encontrada",
        "La sala no está disponible", "Ya estás en esta sala", "La sala está llena",
        "Sin acceso a la sala", "La sala ya terminó", "La sala no está en juego",
        "Faltan equipos en la sala", "Solo puedes marcar salas en curso",
        "Ya tienes otra sala marcada. Quita su estrella primero",
    ).firstOrNull { it in detail } ?: "No se pudo completar la operación. Inténtalo de nuevo."
}
