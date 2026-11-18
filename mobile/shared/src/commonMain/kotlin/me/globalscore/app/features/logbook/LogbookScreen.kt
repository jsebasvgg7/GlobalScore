package me.globalscore.app.features.logbook

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_arrow_right_01
import globalscore.shared.generated.resources.logbook_disclosure
import globalscore.shared.generated.resources.logbook_trash
import globalscore.shared.generated.resources.profile_pencil
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import me.globalscore.app.ui.SkeletonBlock
import org.jetbrains.compose.resources.painterResource

private val logbookShape = RoundedCornerShape(12.dp)
private val games = listOf("FIFA", "EA FC", "PES", "eFootball", "Otro")
private val formations = listOf("4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "4-1-4-1", "3-4-3", "4-5-1")
private val positions = listOf("Portero", "Defensa", "Mediocampista", "Delantero")

@Composable
internal fun LogbookScreen(database: SupabaseClient, userId: String, bottomPadding: Dp, onBack: () -> Unit) {
    val repository = remember(database, userId) { LogbookRepository(database, userId) }
    val scope = rememberCoroutineScope()
    var selectedId by rememberSaveable(userId) { mutableStateOf<String?>(null) }
    var teams by remember(repository) { mutableStateOf<List<LogbookTeam>?>(null) }
    var busy by remember(repository) { mutableStateOf(false) }
    var refreshRequired by remember(repository) { mutableStateOf(false) }
    var error by remember(repository) { mutableStateOf<String?>(null) }
    var editor by remember(repository) { mutableStateOf<LogbookEditor?>(null) }
    var removal by remember(repository) { mutableStateOf<LogbookRemoval?>(null) }

    suspend fun reload() {
        val fresh = repository.teams()
        teams = fresh
        if (fresh.none { it.id == selectedId }) selectedId = fresh.firstOrNull()?.id
        refreshRequired = false
    }

    fun runRequest(change: (suspend () -> Unit)? = null) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                change?.invoke()
                refreshRequired = change != null
                reload()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                error = when {
                    teams == null -> "No se pudo cargar la libreta."
                    refreshRequired -> "Se guardó el cambio, pero falta actualizar la libreta."
                    change != null -> "No se pudo completar el cambio. Actualiza e inténtalo de nuevo."
                    else -> "No se pudo actualizar la libreta."
                }
            } finally {
                busy = false
            }
        }
    }

    LaunchedEffect(repository) { runRequest() }

    var showRooms by rememberSaveable(userId) { mutableStateOf(false) }
    val loaded = teams
    if (showRooms && loaded != null) {
        LogbookRoomsScreen(database, userId, loaded, bottomPadding) {
            showRooms = false
            runRequest()
        }
        return
    }
    val active = loaded?.firstOrNull { it.id == selectedId }
    val editable = !busy && !refreshRequired
    val colors = MaterialTheme.colorScheme
    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            Modifier.weight(1f),
            contentPadding = PaddingValues(bottom = bottomPadding),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item {
                LogbookCard(highlight = true) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onBack) {
                            Icon(
                                painterResource(Res.drawable.huge_arrow_right_01), "Volver a Inicio",
                                Modifier.size(22.dp).graphicsLayer { scaleX = -1f }, tint = colors.onTertiary,
                            )
                        }
                        Column(Modifier.weight(1f)) {
                            Text("mi libreta futbolera", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            active?.let { Text("${it.name} · ${it.game}", style = MaterialTheme.typography.bodyMedium) }
                        }
                        TextButton(
                            onClick = { showRooms = true }, enabled = loaded != null && !busy,
                            colors = ButtonDefaults.textButtonColors(contentColor = colors.onTertiary),
                            contentPadding = PaddingValues(horizontal = 8.dp),
                        ) { Text("Salas") }
                    }
                }
            }
            if (loaded == null && error == null) {
                items(3) { SkeletonBlock(Modifier.fillMaxWidth().height(82.dp), logbookShape) }
            }
            if (error != null) {
                item {
                    LogbookCard {
                        Text(error.orEmpty(), color = colors.error)
                        TextButton(onClick = { runRequest() }, enabled = !busy) { Text("Actualizar") }
                    }
                }
            }
            if (loaded != null) {
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Equipo", color = colors.primary, style = MaterialTheme.typography.labelMedium)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            if (loaded.isNotEmpty()) {
                                LogbookSelect(
                                    active?.name ?: "Equipo", loaded, { it.name }, editable, Modifier.weight(1f),
                                ) { selectedId = it.id }
                            }
                            OutlinedButton(
                                onClick = { editor = LogbookEditor.Team(null) },
                                enabled = editable, shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.heightIn(min = 56.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary),
                            ) {
                                Text("+ Equipo")
                            }
                        }
                        if (active == null) Text("Crea un equipo para registrar tu temporada.", color = colors.primary)
                    }
                }
            }
            if (active != null) {
                item {
                    LogbookTeamFields(active, editable) { name, game, formation ->
                        runRequest { repository.saveTeam(active.id, name, game, formation) }
                    }
                }
                item {
                    LogbookTeamSummary(active, editable) { counter, delta ->
                        runRequest { repository.changeCounter(active.id, null, counter, active.count(counter), delta) }
                    }
                }
                item(key = "players:${active.id}") {
                    LogbookCard {
                        Text("jugadores destacados", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        val top = active.players.maxByOrNull { it.count(LogbookCounter.Goals) }
                        Text(
                            top?.takeIf { it.count(LogbookCounter.Goals) > 0 }?.let {
                                "Máximo goleador: ${it.name} (${it.count(LogbookCounter.Goals)})."
                            } ?: "Los goles de la plantilla suman a GA.",
                            style = MaterialTheme.typography.bodySmall,
                        )
                        active.players.forEach { player ->
                            key(player.id) {
                                LogbookPlayerRow(
                                    player, editable,
                                    onEdit = { editor = LogbookEditor.Player(active.id, player) },
                                    onDelete = { removal = LogbookRemoval(player.name, player = true) { repository.deletePlayer(player.id) } },
                                ) { counter, delta ->
                                    runRequest { repository.changeCounter(active.id, player.id, counter, player.count(counter), delta) }
                                }
                            }
                        }
                        LogbookRival(active.count(LogbookCounter.OwnGoals), editable) { delta ->
                            runRequest { repository.changeCounter(active.id, null, LogbookCounter.OwnGoals, active.count(LogbookCounter.OwnGoals), delta) }
                        }
                        LogbookNewPlayer(active.id, editable) { name, position, clear ->
                            runRequest {
                                repository.savePlayer(active.id, null, name, position)
                                clear()
                            }
                        }
                    }
                }
                item {
                    OutlinedButton(
                        onClick = { removal = LogbookRemoval(active.name) { repository.deleteTeam(active.id) } },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = editable,
                        shape = logbookShape,
                        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.30f)),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = colors.surface, contentColor = colors.primary),
                    ) { Text("Borrar este equipo", fontWeight = FontWeight.Bold) }
                }
            }
        }
    }

    editor?.let { target ->
        LogbookEditDialog(target, busy, error, onDismiss = { if (!busy) { editor = null; error = null } }) { name, kind, formation ->
            runRequest {
                when (target) {
                    is LogbookEditor.Team -> selectedId = repository.saveTeam(target.team?.id, name, kind, formation)
                    is LogbookEditor.Player -> repository.savePlayer(target.teamId, target.player?.id, name, kind)
                }
                editor = null
            }
        }
    }
    removal?.let { target ->
        AlertDialog(
            onDismissRequest = { if (!busy) { removal = null; error = null } },
            title = { Text(if (target.player) "Borrar jugador" else "Borrar equipo") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(if (target.player) "Se eliminará ${target.name}. Sus goles seguirán en el total del equipo."
                        else "Se eliminará ${target.name} y su plantilla.")
                    error?.let { Text(it, color = colors.error) }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = { runRequest { target.delete(); removal = null } },
                    enabled = !busy, colors = ButtonDefaults.textButtonColors(contentColor = colors.error),
                ) { Text("Borrar") }
            },
            dismissButton = { TextButton(onClick = { removal = null; error = null }, enabled = !busy) { Text("Cancelar") } },
        )
    }
}

private sealed interface LogbookEditor {
    data class Team(val team: LogbookTeam?) : LogbookEditor
    data class Player(val teamId: String, val player: LogbookPlayer?) : LogbookEditor
}

private class LogbookRemoval(val name: String, val player: Boolean = false, val delete: suspend () -> Unit)

@Composable
private fun LogbookTeamFields(team: LogbookTeam, enabled: Boolean, onSave: (String, String, String) -> Unit) {
    var name by rememberSaveable(team.id, team.name) { mutableStateOf(team.name) }
    var game by rememberSaveable(team.id, team.game) { mutableStateOf(team.game) }
    var formation by rememberSaveable(team.id, team.formation) { mutableStateOf(team.formation) }
    val changed = name.trim() != team.name || game != team.game || formation != team.formation
    val colors = MaterialTheme.colorScheme
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Nombre del equipo", color = colors.primary, style = MaterialTheme.typography.labelMedium)
                LogbookNameField(name, 30, "Nombre del equipo", enabled) { name = it }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Formación táctica", color = colors.primary, style = MaterialTheme.typography.labelMedium)
                LogbookSelect(formation, formations, { it }, enabled, Modifier.fillMaxWidth()) { formation = it }
            }
        }
        Text("Juego", color = colors.primary, style = MaterialTheme.typography.labelMedium)
        LogbookSelect(game, (games + team.game).distinct(), { it }, enabled, Modifier.fillMaxWidth()) { game = it }
        if (changed) {
            Button(
                onClick = { onSave(name.trim(), game, formation) },
                enabled = enabled && name.isNotBlank(), modifier = Modifier.fillMaxWidth(), shape = logbookShape,
            ) { Text("Guardar equipo") }
        }
    }
}

@Composable
private fun LogbookTeamSummary(team: LogbookTeam, enabled: Boolean, onChange: (LogbookCounter, Int) -> Unit) {
    LogbookCard {
        Text("resumen de temporada", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("JUG suma los partidos ganados, empatados y perdidos.", style = MaterialTheme.typography.bodySmall)
        Row(Modifier.align(Alignment.CenterHorizontally).widthIn(max = 296.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            VerticalCounter("JUG", "Partidos jugados", team.played, Modifier.weight(1f))
            listOf(
                Triple("GAN", "Partidos ganados", LogbookCounter.Wins),
                Triple("EMP", "Partidos empatados", LogbookCounter.Draws),
                Triple("PER", "Partidos perdidos", LogbookCounter.Losses),
            ).forEach { (label, description, counter) ->
                VerticalCounter(label, description, team.count(counter).toLong(), Modifier.weight(1f), enabled) {
                    onChange(counter, it)
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text("goles", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("GA incluye los goles de tus jugadores y los autogoles del rival.", style = MaterialTheme.typography.bodySmall)
        Row(
            Modifier.align(Alignment.CenterHorizontally).widthIn(max = 220.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            VerticalCounter("GA", "Goles a favor", team.goalsFor, Modifier.weight(1f))
            VerticalCounter("GC", "Goles en contra", team.count(LogbookCounter.Conceded).toLong(), Modifier.weight(1f), enabled) {
                onChange(LogbookCounter.Conceded, it)
            }
            VerticalCounter("+/−", "Diferencia de goles", team.difference, Modifier.weight(1f), signed = true)
        }
    }
}

@Composable
private fun LogbookPlayerRow(
    player: LogbookPlayer,
    enabled: Boolean,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onChange: (LogbookCounter, Int) -> Unit,
) {
    var expanded by rememberSaveable(player.id) { mutableStateOf(false) }
    val colors = MaterialTheme.colorScheme
    val metrics = listOf(
        Triple("GOL", "Goles", LogbookCounter.Goals),
        Triple("ASI", "Asistencias", LogbookCounter.Assists),
        Triple("MVP", "MVP", LogbookCounter.Mvp),
    )
    Surface(
        Modifier.fillMaxWidth(), shape = logbookShape, color = colors.surface, contentColor = colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.24f)),
    ) {
        Column {
            Row(
                Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(horizontal = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                IconButton(onClick = { expanded = !expanded }, modifier = Modifier.size(36.dp)) {
                    Icon(
                        painterResource(Res.drawable.logbook_disclosure),
                        if (expanded) "Contraer ${player.name}" else "Desplegar ${player.name}",
                        Modifier.size(18.dp).graphicsLayer { rotationZ = if (expanded) 180f else 0f },
                        tint = colors.primary,
                    )
                }
                Column(Modifier.weight(1f).clickable { expanded = !expanded }.padding(vertical = 6.dp)) {
                    Text(player.name, fontWeight = FontWeight.Bold)
                    Text(player.position, style = MaterialTheme.typography.bodySmall)
                }
                if (!expanded) {
                    metrics.forEach { (label, _, counter) ->
                        Column(Modifier.widthIn(min = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(label, style = MaterialTheme.typography.labelSmall)
                            Text(player.count(counter).toString(), style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                } else {
                    IconButton(onClick = onEdit, enabled = enabled, modifier = Modifier.size(38.dp)) {
                        Icon(painterResource(Res.drawable.profile_pencil), "Editar ${player.name}", Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDelete, enabled = enabled, modifier = Modifier.size(38.dp)) {
                        Icon(painterResource(Res.drawable.logbook_trash), "Borrar ${player.name}", Modifier.size(18.dp))
                    }
                }
            }
            if (expanded) {
                HorizontalDivider(color = colors.primary.copy(alpha = 0.14f))
                Row(
                    Modifier.align(Alignment.CenterHorizontally).widthIn(max = 200.dp).fillMaxWidth().padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    metrics.forEach { (label, description, counter) ->
                        VerticalCounter(label, description, player.count(counter).toLong(), Modifier.weight(1f), enabled) {
                            onChange(counter, it)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VerticalCounter(
    label: String,
    description: String,
    value: Long,
    modifier: Modifier = Modifier,
    enabled: Boolean = false,
    signed: Boolean = false,
    onChange: ((Int) -> Unit)? = null,
) {
    val colors = MaterialTheme.colorScheme
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
        Surface(
            Modifier.fillMaxWidth().heightIn(min = 132.dp),
            shape = RoundedCornerShape(8.dp),
            color = if (onChange == null) colors.primary.copy(alpha = 0.12f) else colors.surface,
            contentColor = colors.primary,
            border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.25f)),
        ) {
            Column(
                Modifier.padding(vertical = 2.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = if (onChange == null) Arrangement.Center else Arrangement.SpaceBetween,
            ) {
                if (onChange != null) {
                    LogbookCounterButton("+", "Sumar: $description", enabled && value < Int.MAX_VALUE) { onChange(1) }
                }
                Text(
                    if (signed && value > 0) "+$value" else value.toString(),
                    style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                )
                if (onChange != null) {
                    LogbookCounterButton("−", "Restar: $description", enabled && value > 0) { onChange(-1) }
                }
            }
        }
    }
}

@Composable
private fun LogbookCounterButton(symbol: String, label: String, enabled: Boolean, onClick: () -> Unit) {
    IconButton(
        onClick = onClick, enabled = enabled,
        modifier = Modifier.size(40.dp).semantics { contentDescription = label },
        colors = IconButtonDefaults.iconButtonColors(contentColor = MaterialTheme.colorScheme.primary),
    ) {
        Text(symbol, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun LogbookRival(value: Int, enabled: Boolean, onChange: (Int) -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(Modifier.fillMaxWidth(), shape = logbookShape, color = colors.primary.copy(alpha = 0.10f), contentColor = colors.primary) {
        Row(
            Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Column(Modifier.weight(1f)) {
                Text("rival (autogol)", fontWeight = FontWeight.Bold)
                Text("Suma a GA sin asignar un jugador.", style = MaterialTheme.typography.bodySmall)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("GOL", style = MaterialTheme.typography.labelSmall)
                Surface(
                    shape = RoundedCornerShape(8.dp), color = colors.surface,
                    border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.25f)),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        LogbookCounterButton("+", "Sumar autogol del rival", enabled && value < Int.MAX_VALUE) { onChange(1) }
                        Text(value.toString(), fontWeight = FontWeight.Bold, color = colors.primary)
                        LogbookCounterButton("−", "Restar autogol del rival", enabled && value > 0) { onChange(-1) }
                    }
                }
            }
        }
    }
}

@Composable
private fun LogbookNewPlayer(teamId: String, enabled: Boolean, onAdd: (String, String, () -> Unit) -> Unit) {
    var name by rememberSaveable(teamId) { mutableStateOf("") }
    var position by rememberSaveable(teamId) { mutableStateOf(positions.last()) }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        LogbookNameField(name, 24, "Nombre del jugador", enabled, Modifier.weight(1f)) { name = it }
        LogbookSelect(position, positions, { it }, enabled, Modifier.weight(1f)) { position = it }
    }
    Button(
        onClick = { onAdd(name.trim(), position) { name = "" } },
        enabled = enabled && name.isNotBlank(), modifier = Modifier.fillMaxWidth(), shape = logbookShape,
    ) { Text("Añadir") }
}

@Composable
private fun LogbookNameField(
    value: String, limit: Int, label: String, enabled: Boolean, modifier: Modifier = Modifier,
    onChange: (String) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    OutlinedTextField(
        value, { if (it.length <= limit) onChange(it) }, modifier.fillMaxWidth(),
        enabled = enabled, singleLine = true, shape = RoundedCornerShape(8.dp),
        placeholder = { Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis) },
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = colors.primary, unfocusedTextColor = colors.primary,
            focusedContainerColor = colors.surface, unfocusedContainerColor = colors.primary.copy(alpha = 0.06f),
            unfocusedBorderColor = colors.primary.copy(alpha = 0.16f),
            focusedPlaceholderColor = colors.primary.copy(alpha = 0.75f),
            unfocusedPlaceholderColor = colors.primary.copy(alpha = 0.75f),
        ),
    )
}

@Composable
private fun LogbookEditDialog(
    editor: LogbookEditor,
    busy: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onSave: (String, String, String) -> Unit,
) {
    val team = (editor as? LogbookEditor.Team)?.team
    val player = (editor as? LogbookEditor.Player)?.player
    val isTeam = editor is LogbookEditor.Team
    var name by remember(editor) { mutableStateOf(team?.name ?: player?.name.orEmpty()) }
    var kind by remember(editor) { mutableStateOf(if (isTeam) team?.game ?: games.first() else player?.position ?: positions.last()) }
    var formation by remember(editor) { mutableStateOf(team?.formation ?: formations.first()) }
    val limit = if (isTeam) 30 else 24
    val options = if (isTeam) games else positions
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isTeam) if (team == null) "Nuevo equipo" else "Editar equipo"
            else if (player == null) "Nuevo jugador" else "Editar jugador") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                LogbookNameField(name, limit, "Nombre", !busy) { name = it }
                LogbookSelect(kind, (options + kind).distinct(), { it }, !busy, Modifier.fillMaxWidth()) { kind = it }
                if (isTeam) {
                    LogbookSelect(formation, formations, { it }, !busy, Modifier.fillMaxWidth()) { formation = it }
                }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(name.trim(), kind, formation) }, enabled = !busy && name.isNotBlank()) {
                Text(if (busy) "Guardando…" else "Guardar")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss, enabled = !busy) { Text("Cancelar") } },
    )
}

@Composable
internal fun <T> LogbookSelect(
    selected: String,
    options: List<T>,
    label: (T) -> String,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    onSelect: (T) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    val colors = MaterialTheme.colorScheme
    Box(modifier) {
        OutlinedButton(
            onClick = { open = true }, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
            border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.16f)),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = colors.primary.copy(alpha = 0.06f), contentColor = colors.primary,
            ),
        ) {
            Text(selected, Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            Icon(painterResource(Res.drawable.logbook_disclosure), null, Modifier.size(16.dp))
        }
        DropdownMenu(
            expanded = open, onDismissRequest = { open = false }, shape = logbookShape,
            containerColor = colors.surface, border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.16f)),
        ) {
            options.forEach { option ->
                val name = label(option)
                DropdownMenuItem(
                    text = { Text(name, color = colors.primary, fontWeight = if (name == selected) FontWeight.Bold else FontWeight.Normal) },
                    onClick = { open = false; onSelect(option) },
                )
            }
        }
    }
}

@Composable
internal fun LogbookCard(highlight: Boolean = false, content: @Composable ColumnScope.() -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        Modifier.fillMaxWidth(), shape = logbookShape,
        color = if (highlight) colors.tertiary else colors.surface,
        contentColor = if (highlight) colors.onTertiary else colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.15f)),
        shadowElevation = 1.dp,
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp), content = content)
    }
}
