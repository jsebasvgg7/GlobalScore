package me.globalscore.app.features.logbook

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.compositeOver
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_arrow_left_double
import globalscore.shared.generated.resources.huge_arrow_big_down_dash
import globalscore.shared.generated.resources.huge_user_warning_02
import globalscore.shared.generated.resources.logbook_group
import globalscore.shared.generated.resources.logbook_pitch
import globalscore.shared.generated.resources.stats_star
import globalscore.shared.generated.resources.logbook_sort
import globalscore.shared.generated.resources.logbook_disclosure
import globalscore.shared.generated.resources.logbook_trash
import globalscore.shared.generated.resources.profile_pencil
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import me.globalscore.app.ui.SkeletonBlock
import me.globalscore.app.features.home.RemoteImage
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import org.jetbrains.compose.resources.painterResource

private val logbookShape = RoundedCornerShape(12.dp)
private val games = listOf("FIFA", "EA FC", "PES", "eFootball", "Otro")
private val formations = listOf("4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "4-1-4-1", "3-4-3", "4-5-1")
private val positions = listOf("Portero", "Defensa", "Mediocampista", "Delantero")

@Composable
internal fun LogbookScreen(
    database: SupabaseClient,
    userId: String,
    avatar: String?,
    banner: String?,
    bottomPadding: Dp,
    saveScope: CoroutineScope,
    writeLock: Mutex,
    dark: Boolean,
    onBack: () -> Unit,
) {
    val repository = remember(database, userId) { LogbookRepository(database, userId) }
    val scope = rememberCoroutineScope()
    var selectedId by rememberSaveable(userId) { mutableStateOf<String?>(null) }
    var teams by remember(repository) { mutableStateOf<List<LogbookTeam>?>(null) }
    var busy by remember(repository) { mutableStateOf(false) }
    var refreshRequired by remember(repository) { mutableStateOf(false) }
    var error by remember(repository) { mutableStateOf<String?>(null) }
    var showNewTeam by remember(repository) { mutableStateOf(false) }
    var removal by remember(repository) { mutableStateOf<LogbookRemoval?>(null) }

    var saveJob by remember(repository) { mutableStateOf<Job?>(null) }
    val pending = remember(repository) { mutableStateListOf<LogbookChange>() }

    suspend fun reload() {
        val fresh = repository.teams()
        teams = fresh
        if (fresh.none { it.id == selectedId }) selectedId = fresh.firstOrNull()?.id
        refreshRequired = false
    }

    fun runRequest(change: (suspend () -> Unit)? = null) {
        if (busy || pending.isNotEmpty()) return
        busy = true
        error = null
        scope.launch {
            try {
                writeLock.withLock {
                    change?.invoke()
                    refreshRequired = change != null
                    reload()
                }
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

    fun changeCounter(teamId: String, playerId: String?, counter: LogbookCounter, delta: Int) {
        if (busy || refreshRequired) return
        pending += LogbookChange(teamId, playerId, counter, delta)
        if (saveJob?.isActive == true) return
        error = null
        saveJob = saveScope.launch {
            writeLock.withLock {
                while (pending.isNotEmpty()) {
                    val change = pending.first()
                    val team = teams?.firstOrNull { it.id == change.teamId }
                    val old = team?.let(change::count)
                    try {
                        if (old != null && change.adjust(old) != old) {
                            val value = change.adjust(old)
                            repository.changeCounter(change.teamId, change.playerId, change.counter, old, value - old)
                            teams = teams?.map { if (it.id == change.teamId) it.withCounter(change.playerId, change.counter, value) else it }
                        }
                    } catch (cancelled: CancellationException) {
                        throw cancelled
                    } catch (_: Exception) {
                        error = "No se pudo guardar un cambio en el marcador."
                        try {
                            reload()
                        } catch (cancelled: CancellationException) {
                            throw cancelled
                        } catch (_: Exception) {
                            refreshRequired = true
                            pending.clear()
                            break
                        }
                    }
                    pending.removeAt(0)
                }
            }
        }
    }

    LaunchedEffect(repository) { runRequest() }

    var roomsDestination by rememberSaveable(userId) { mutableStateOf<String?>(null) }
    var showPlayers by rememberSaveable(userId) { mutableStateOf(false) }
    val panelState = rememberSaveableStateHolder()
    val loaded = teams
    if (roomsDestination != null && loaded != null) {
        LogbookRoomsScreen(database, userId, loaded, bottomPadding, openFavorite = roomsDestination == "favorite") {
            roomsDestination = null
            runRequest()
        }
        return
    }

    val active = loaded?.firstOrNull { it.id == selectedId }?.let { base ->
        pending.filter { it.teamId == base.id }.fold(base) { team, change ->
            val old = change.count(team)
            if (old == null) team else team.withCounter(change.playerId, change.counter, change.adjust(old))
        }
    }
    val countersEnabled = !busy && !refreshRequired
    val editable = countersEnabled && pending.isEmpty()
    val colors = MaterialTheme.colorScheme
    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            Modifier.weight(1f),
            contentPadding = PaddingValues(bottom = bottomPadding),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item(key = "team-header") {
                LogbookTeamHeader(
                    active, loaded.orEmpty(), avatar, banner, dark, editable, loaded != null && editable,
                    onBack = onBack,
                    onRooms = { roomsDestination = "list" },
                    onFavorite = { roomsDestination = "favorite" },
                    onSelect = { selectedId = it.id },
                    onAdd = { showNewTeam = true },
                    onSave = { name, game, formation, onSaved ->
                        if (active != null) runRequest {
                            repository.saveTeam(active.id, name, game, formation)
                            onSaved()
                        }
                    },
                )
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
            if (active != null) {
                item(key = "team-content") {
                    Box(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                        if (showPlayers) {
                            panelState.SaveableStateProvider("players:${active.id}") {
                                LogbookPlayers(
                                    active, editable, countersEnabled,
                                    onDelete = { player ->
                                        removal = LogbookRemoval(player.name, player = true) { repository.deletePlayer(player.id) }
                                    },
                                    onAdd = { name, position, clear ->
                                        runRequest { repository.savePlayer(active.id, null, name, position); clear() }
                                    },
                                    onReorder = { ids -> runRequest { repository.reorderPlayers(active.id, ids) } },
                                    onChange = { playerId, counter, delta -> changeCounter(active.id, playerId, counter, delta) },
                                )
                            }
                        } else {
                            panelState.SaveableStateProvider("summary:${active.id}") {
                                LogbookTeamSummary(active, countersEnabled) { counter, delta ->
                                    changeCounter(active.id, null, counter, delta)
                                }
                            }
                        }
                        Surface(
                            onClick = { showPlayers = !showPlayers },
                            modifier = Modifier.align(Alignment.TopEnd).offset(x = 6.dp, y = (-8).dp).size(40.dp),
                            shape = CircleShape,
                            color = colors.surface,
                            contentColor = colors.primary,
                            border = BorderStroke(1.5.dp, colors.primary),
                            shadowElevation = 2.dp,
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    painterResource(if (showPlayers) Res.drawable.logbook_pitch else Res.drawable.logbook_group),
                                    if (showPlayers) "Mostrar resumen y goles" else "Mostrar jugadores",
                                    Modifier.size(23.dp),
                                )
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

    if (showNewTeam) {
        LogbookNewTeamDialog(busy, error, onDismiss = { if (!busy) { showNewTeam = false; error = null } }) { name, game, formation ->
            runRequest {
                selectedId = repository.saveTeam(null, name, game, formation)
                showNewTeam = false
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

private data class LogbookChange(val teamId: String, val playerId: String?, val counter: LogbookCounter, val delta: Int) {
    fun count(team: LogbookTeam): Int? =
        if (playerId == null) team.count(counter) else team.players.firstOrNull { it.id == playerId }?.count(counter)

    fun adjust(value: Int): Int = (value.toLong() + delta).coerceIn(0, Int.MAX_VALUE.toLong()).toInt()
}

private class LogbookRemoval(val name: String, val player: Boolean = false, val delete: suspend () -> Unit)

@Composable
private fun LogbookTeamHeader(
    team: LogbookTeam?, teams: List<LogbookTeam>, avatar: String?, banner: String?,
    dark: Boolean, editable: Boolean, ready: Boolean, onBack: () -> Unit, onRooms: () -> Unit, onFavorite: () -> Unit,
    onSelect: (LogbookTeam) -> Unit, onAdd: () -> Unit, onSave: (String, String, String, () -> Unit) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    var editing by rememberSaveable(team?.id) { mutableStateOf(false) }
    var name by rememberSaveable(team?.id, team?.name) { mutableStateOf(team?.name.orEmpty()) }
    var game by rememberSaveable(team?.id, team?.game) { mutableStateOf(team?.game.orEmpty()) }
    var formation by rememberSaveable(team?.id, team?.formation) { mutableStateOf(team?.formation.orEmpty()) }
    val shape = RoundedCornerShape(30.dp)
    val bannerHeight = 146.dp
    val detailsInset = 22.dp
    val headerBorder = BorderStroke(1.dp, if (dark) colors.primary.copy(alpha = 0.15f) else Color(0xFFD8D8D8))
    Surface(
        Modifier.fillMaxWidth(),
        shape = shape,
        color = if (dark) colors.primary.copy(alpha = 0.07f).compositeOver(colors.background) else Color(0xFFF6F4FF),
        contentColor = colors.primary,
        border = headerBorder,
    ) {
        Column(Modifier.padding(start = 6.dp, end = 6.dp, top = 6.dp, bottom = 10.dp)) {
            Box(Modifier.fillMaxWidth().height(bannerHeight + 36.dp)) {
                Box(Modifier.fillMaxWidth().height(bannerHeight).clip(shape).background(colors.tertiary)) {
                    RemoteImage(banner, Modifier.matchParentSize(), ContentScale.Crop)
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 6.dp).height(36.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            Modifier.size(36.dp).clickable(role = Role.Button, onClick = onBack),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(painterResource(Res.drawable.huge_arrow_left_double), "Volver a Inicio", Modifier.size(20.dp), tint = colors.onTertiary)
                        }
                        Surface(shape = CircleShape, color = colors.surface, contentColor = colors.primary) {
                            Row(Modifier.height(30.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    Modifier.width(32.dp).fillMaxHeight().clickable(enabled = ready, role = Role.Button, onClick = onFavorite),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Icon(painterResource(Res.drawable.stats_star), "Abrir sala favorita", Modifier.size(14.dp))
                                }
                                Box(Modifier.height(13.dp).width(1.dp).background(colors.primary.copy(alpha = 0.25f)))
                                Box(
                                    Modifier.fillMaxHeight().clickable(enabled = ready, role = Role.Button, onClick = onRooms)
                                        .padding(horizontal = 10.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text("Salas", style = MaterialTheme.typography.labelLarge)
                                }
                            }
                        }
                    }
                }
                Row(
                    Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(start = detailsInset, end = 24.dp),
                    verticalAlignment = Alignment.Bottom,
                ) {
                    Surface(
                        Modifier.size(88.dp),
                        shape = CircleShape, color = colors.tertiary, border = BorderStroke(3.dp, colors.surface),
                    ) {
                        RemoteImage(avatar, Modifier.fillMaxSize(), ContentScale.Crop)
                    }
                    if (teams.isNotEmpty()) {
                        Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            LogbookSelect(
                                "Mi equipo", teams, { it.name }, editable && !editing,
                                flat = true, onSelect = onSelect,
                            )
                        }
                    }
                }
            }
            Column(Modifier.fillMaxWidth().padding(start = detailsInset, end = 8.dp, top = 12.dp)) {
                if (team != null) {
                    if (editing) {
                        LogbookNameField(name, 30, "Nombre del equipo", editable) { name = it }
                        LogbookSelect("Formación: $formation", formations, { it }, editable, compact = true) { formation = it }
                        LogbookSelect("Juego: $game", (games + team.game).distinct(), { it }, editable, compact = true) { game = it }
                        Row(Modifier.align(Alignment.End)) {
                            TextButton(onClick = {
                                name = team.name
                                game = team.game
                                formation = team.formation
                                editing = false
                            }) { Text("Cancelar") }
                            TextButton(onClick = {
                                onSave(name.trim(), game, formation) { editing = false }
                            }, enabled = editable && name.isNotBlank()) { Text("Guardar") }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(team.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("Formación: ${team.formation}", style = MaterialTheme.typography.bodyMedium, lineHeight = 18.sp)
                            Text("Juego: ${team.game}", style = MaterialTheme.typography.bodyMedium, lineHeight = 18.sp)
                        }
                    }
                } else if (ready) {
                    Text("Crea un equipo para registrar tu temporada.")
                }
                if (!editing) {
                    Row(
                        Modifier.align(Alignment.End),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        OutlinedIconButton(
                            onClick = onAdd, enabled = ready,
                            modifier = Modifier.size(32.dp).semantics { contentDescription = "Crear equipo" },
                            border = headerBorder,
                        ) {
                            val tint = LocalContentColor.current
                            Canvas(Modifier.size(16.dp)) {
                                val arm = 6.5.dp.toPx()
                                val stroke = 1.75.dp.toPx()
                                drawLine(tint, center - Offset(arm, 0f), center + Offset(arm, 0f), stroke, StrokeCap.Round)
                                drawLine(tint, center - Offset(0f, arm), center + Offset(0f, arm), stroke, StrokeCap.Round)
                            }
                        }
                        if (team != null) {
                            OutlinedIconButton(
                                onClick = { editing = true }, enabled = editable,
                                modifier = Modifier.size(32.dp),
                                border = headerBorder,
                            ) {
                                Icon(painterResource(Res.drawable.profile_pencil), "Editar equipo", Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

private enum class MatchMetric(val label: String, val title: String, val counter: LogbookCounter?) {
    Played("JUG", "Jugados", null),
    Won("GAN", "Ganados", LogbookCounter.Wins),
    Drawn("EMP", "Empatados", LogbookCounter.Draws),
    Lost("PER", "Perdidos", LogbookCounter.Losses);

    fun value(team: LogbookTeam): Long = counter?.let { team.count(it).toLong() } ?: team.played
}

@Composable
private fun LogbookTeamSummary(team: LogbookTeam, enabled: Boolean, onChange: (LogbookCounter, Int) -> Unit) {
    var metric by rememberSaveable(team.id) { mutableStateOf(MatchMetric.Played) }
    val value = metric.value(team)
    val counter = metric.counter
    LogbookCard(tinted = true, shape = RoundedCornerShape(30.dp)) {
        Column(Modifier.padding(end = 32.dp)) {
            Text("resumen de temporada", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("JUG suma los partidos ganados, empatados y perdidos.", style = MaterialTheme.typography.bodySmall)
        }
        SeasonProgress(metric.title, value, enabled, modifier = Modifier.align(Alignment.CenterHorizontally),
            onChange = counter?.let { selectedCounter -> { delta -> onChange(selectedCounter, delta) } })
        Row(
            Modifier.align(Alignment.CenterHorizontally).widthIn(max = 264.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MatchMetric.entries.forEach { candidate ->
                LogbookStat(candidate.label, candidate.value(team).toString(), Modifier.weight(1f), metric == candidate, tall = true) {
                    metric = candidate
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text("marcadores de goles", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text("GA incluye los goles de tus jugadores y los autogoles del rival.", style = MaterialTheme.typography.bodySmall)
        Row(
            Modifier.align(Alignment.CenterHorizontally).widthIn(max = 208.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically,
        ) {
            LogbookStat("GA", team.goalsFor.toString(), Modifier.weight(1f), filled = true, tall = true)
            VerticalCounter("GC", "Goles en contra", team.count(LogbookCounter.Conceded).toLong(), Modifier.weight(1f), enabled, tall = true) {
                onChange(LogbookCounter.Conceded, it)
            }
            val difference = if (team.difference > 0) "+${team.difference}" else team.difference.toString()
            LogbookStat("+/−", difference, Modifier.weight(1f), filled = true, tall = true)
        }
    }
}

@Composable
private fun SeasonProgress(
    title: String, value: Long, enabled: Boolean, modifier: Modifier = Modifier, onChange: ((Int) -> Unit)?,
) {
    val colors = MaterialTheme.colorScheme
    val start = value / 100 * 100
    val sweep = (value - start) * 1.8f
    Column(modifier.widthIn(max = 272.dp).fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            val radius = (maxWidth - 24.dp).coerceAtLeast(0.dp) / 2
            Box(Modifier.fillMaxWidth().height(radius + 16.dp)) {
                Canvas(Modifier.matchParentSize()) {
                    val stroke = 16.dp.toPx()
                    val r = radius.toPx()
                    val center = Offset(size.width / 2, size.height - stroke / 2)
                    val topLeft = Offset(center.x - r, center.y - r)
                    val arcSize = Size(r * 2, r * 2)
                    drawArc(colors.onSurface.copy(alpha = 0.13f), 180f, 180f, false, topLeft, arcSize, style = Stroke(stroke))
                    drawArc(colors.tertiary, 180f, sweep, false, topLeft, arcSize, style = Stroke(stroke))
                    val radians = (180 + sweep) * PI / 180
                    val marker = Offset(center.x + r * cos(radians).toFloat(), center.y + r * sin(radians).toFloat())
                    drawCircle(colors.surface, 11.dp.toPx(), marker)
                    drawCircle(colors.tertiary, 9.dp.toPx(), marker)
                }
                Column(Modifier.align(Alignment.BottomCenter).padding(bottom = 6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(title, style = MaterialTheme.typography.labelLarge)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (onChange != null) LogbookCounterButton("−", "Restar: $title", enabled && value > 0) { onChange(-1) }
                        Text(value.toString(), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                        if (onChange != null) LogbookCounterButton("+", "Sumar: $title", enabled && value < Int.MAX_VALUE) { onChange(1) }
                    }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(start.toString(), style = MaterialTheme.typography.labelSmall)
            Text((start + 100).toString(), style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun LogbookStat(
    label: String, value: String, modifier: Modifier = Modifier, active: Boolean = false,
    filled: Boolean = false, tall: Boolean = false, compact: Boolean = false, onClick: (() -> Unit)? = null,
) {
    val colors = MaterialTheme.colorScheme
    val action = if (onClick == null) Modifier else Modifier.clickable(role = Role.Button, onClick = onClick)
        .semantics { selected = active }
    Surface(
        modifier.then(action), shape = RoundedCornerShape(if (tall) 18.dp else if (compact) 9.dp else 12.dp),
        color = colors.primary.copy(alpha = if (filled) 0.10f else 0.04f),
        contentColor = colors.primary,
        border = BorderStroke(1.dp, if (active) colors.primary else colors.onSurface.copy(alpha = 0.18f)),
    ) {
        Column(
            Modifier.heightIn(min = if (tall) 70.dp else if (compact) 40.dp else 54.dp).padding(horizontal = 2.dp, vertical = 5.dp),
            verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Text(label, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun LogbookPlayers(
    team: LogbookTeam, editable: Boolean, countersEnabled: Boolean,
    onDelete: (LogbookPlayer) -> Unit,
    onAdd: (String, String, () -> Unit) -> Unit, onReorder: (List<String>) -> Unit,
    onChange: (String?, LogbookCounter, Int) -> Unit,
) {
    var draftOrder by remember(team.players.map { it.id }) { mutableStateOf<List<String>?>(null) }
    val playersById = team.players.associateBy { it.id }
    val top = team.players.maxByOrNull { it.count(LogbookCounter.Goals) }
    LogbookCard(tinted = true, shape = RoundedCornerShape(30.dp)) {
        Row(
            Modifier.fillMaxWidth().padding(end = 32.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            IconButton(
                enabled = editable && team.players.size > 1 && draftOrder == null,
                onClick = { draftOrder = team.players.map { it.id } },
                modifier = Modifier.size(40.dp),
                colors = IconButtonDefaults.iconButtonColors(contentColor = MaterialTheme.colorScheme.primary),
            ) {
                Icon(painterResource(Res.drawable.logbook_sort), "Ordenar jugadores", Modifier.size(21.dp))
            }
            Column(Modifier.weight(1f)) {
                Text("jugadores destacados", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(
                    top?.takeIf { it.count(LogbookCounter.Goals) > 0 }?.let {
                        "Máximo goleador: ${it.name} (${it.count(LogbookCounter.Goals)})."
                    } ?: "Los goles de la plantilla suman a GA.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }

        val order = draftOrder
        if (order != null) {
            Text("Arrastra desde los puntos para mover un jugador.", style = MaterialTheme.typography.bodySmall)
            order.forEachIndexed { index, id ->
                val player = playersById.getValue(id)
                key(id) {
                    LogbookSortRow(player, index, order.size) { destination ->
                        val current = draftOrder ?: return@LogbookSortRow
                        val from = current.indexOf(id)
                        if (from >= 0 && from != destination && destination in current.indices) {
                            draftOrder = current.toMutableList().apply { add(destination, removeAt(from)) }
                        }
                    }
                }
            }
            Row(Modifier.align(Alignment.End)) {
                TextButton(onClick = { draftOrder = null }) { Text("Cancelar") }
                TextButton(onClick = {
                    onReorder(order)
                    draftOrder = null
                }, enabled = editable && order != team.players.map { it.id }) { Text("Guardar orden") }
            }
        } else {
            LogbookNewPlayer(team.id, editable, onAdd)
            team.players.forEach { player ->
                key(player.id) {
                    LogbookPlayerRow(player, editable, countersEnabled, { onDelete(player) }) { counter, delta ->
                        onChange(player.id, counter, delta)
                    }
                }
            }
            LogbookRival(team.count(LogbookCounter.OwnGoals), countersEnabled) { delta ->
                onChange(null, LogbookCounter.OwnGoals, delta)
            }
        }
    }
}

@Composable
private fun LogbookSortRow(player: LogbookPlayer, index: Int, count: Int, move: (Int) -> Unit) {
    var origin by remember { mutableStateOf<Int?>(null) }
    var distance by remember { mutableStateOf(0f) }
    val currentIndex by rememberUpdatedState(index)
    val currentMove by rememberUpdatedState(move)
    val rowHeight = 52.dp
    val rowStep = with(LocalDensity.current) { (rowHeight + 6.dp).toPx() }
    val colors = MaterialTheme.colorScheme
    Surface(
        Modifier.fillMaxWidth().zIndex(if (origin == null) 0f else 1f).offset {
            val offset = origin?.let { distance - (index - it) * rowStep } ?: 0f
            IntOffset(0, offset.roundToInt())
        },
        shape = logbookShape, color = colors.surface, contentColor = colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = if (origin == null) 0.18f else 0.65f)),
        shadowElevation = if (origin == null) 0.dp else 3.dp,
    ) {
        Row(Modifier.height(rowHeight), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.width(48.dp).fillMaxHeight()
                    .semantics {
                        contentDescription = "Mover a ${player.name}"
                        customActions = buildList {
                            if (index > 0) add(CustomAccessibilityAction("Subir") { move(index - 1); true })
                            if (index < count - 1) add(CustomAccessibilityAction("Bajar") { move(index + 1); true })
                        }
                    }
                    .pointerInput(player.id, count, rowStep) {
                        detectVerticalDragGestures(
                            onDragStart = { origin = currentIndex; distance = 0f },
                            onDragEnd = { origin = null },
                            onDragCancel = { origin?.let(currentMove); origin = null },
                        ) { _, amount ->
                            val start = origin ?: return@detectVerticalDragGestures
                            distance = (distance + amount).coerceIn(-start * rowStep, (count - 1 - start) * rowStep)
                            currentMove(start + (distance / rowStep).roundToInt())
                        }
                    },
                contentAlignment = Alignment.Center,
            ) {
                Canvas(Modifier.size(18.dp)) {
                    for (column in 1..2) {
                        for (row in 1..3) {
                            drawCircle(colors.primary, radius = 1.5.dp.toPx(), center = Offset(size.width * column / 3, size.height * row / 4))
                        }
                    }
                }
            }
            Column(Modifier.weight(1f).padding(end = 10.dp)) {
                Text(player.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(player.position, style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun LogbookPlayerRow(
    player: LogbookPlayer,
    enabled: Boolean,
    countersEnabled: Boolean,
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
        Box {
            Row(
                Modifier.fillMaxWidth().heightIn(min = 52.dp)
                    .padding(start = 4.dp, end = 10.dp, top = 2.dp, bottom = if (expanded) 6.dp else 2.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    IconButton(onClick = { expanded = !expanded }, modifier = Modifier.size(34.dp)) {
                        Icon(
                            painterResource(Res.drawable.logbook_disclosure),
                            if (expanded) "Contraer ${player.name}" else "Desplegar ${player.name}",
                            Modifier.size(18.dp).graphicsLayer { rotationZ = if (expanded) 180f else 0f },
                        )
                    }
                    if (expanded) {
                        IconButton(onClick = onDelete, enabled = enabled, modifier = Modifier.size(34.dp)) {
                            Icon(painterResource(Res.drawable.logbook_trash), "Borrar ${player.name}", Modifier.size(16.dp))
                        }
                    }
                }
                Column(Modifier.weight(1f).clickable { expanded = !expanded }.padding(vertical = 6.dp)) {
                    Text(
                        player.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold,
                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                    Text(player.position, style = MaterialTheme.typography.labelSmall)
                }
                metrics.forEach { (label, description, counter) ->
                    if (expanded) {
                        VerticalCounter(label, description, player.count(counter).toLong(), Modifier.width(40.dp), countersEnabled, compact = true) {
                            onChange(counter, it)
                        }
                    } else {
                        Column(Modifier.widthIn(min = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(label, style = MaterialTheme.typography.labelSmall)
                            Text(player.count(counter).toString(), style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
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
    tall: Boolean = false,
    compact: Boolean = false,
    onChange: (Int) -> Unit,
) {
    val buttonSize = if (compact) 30.dp else 40.dp
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        LogbookCounterButton("+", "Sumar: $description", enabled && value < Int.MAX_VALUE, buttonSize) { onChange(1) }
        LogbookStat(label, value.toString(), Modifier.fillMaxWidth(), tall = tall, compact = compact)
        LogbookCounterButton("−", "Restar: $description", enabled && value > 0, buttonSize) { onChange(-1) }
    }
}

@Composable
private fun LogbookCounterButton(symbol: String, label: String, enabled: Boolean, size: Dp = 40.dp, onClick: () -> Unit) {
    IconButton(
        onClick = onClick, enabled = enabled,
        modifier = Modifier.size(size).semantics { contentDescription = label },
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
            Icon(painterResource(Res.drawable.huge_user_warning_02), null, Modifier.size(18.dp))
            Column(Modifier.weight(1f)) {
                Text("rival (autogol)", fontWeight = FontWeight.Bold)
                Text("Suma a GA", style = MaterialTheme.typography.bodySmall)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("GOL", style = MaterialTheme.typography.labelSmall)
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    RivalCounterButton("−", "Restar autogol del rival", enabled && value > 0) { onChange(-1) }
                    Text(value.toString(), fontWeight = FontWeight.Bold)
                    RivalCounterButton("+", "Sumar autogol del rival", enabled && value < Int.MAX_VALUE) { onChange(1) }
                }
            }
        }
    }
}

@Composable
private fun RivalCounterButton(symbol: String, label: String, enabled: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    OutlinedIconButton(
        onClick = onClick, enabled = enabled,
        modifier = Modifier.size(28.dp).semantics { contentDescription = label },
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.17f)),
        colors = IconButtonDefaults.outlinedIconButtonColors(containerColor = colors.surface),
    ) {
        Text(symbol, style = MaterialTheme.typography.titleMedium)
    }
}

@Composable
private fun LogbookNewPlayer(teamId: String, enabled: Boolean, onAdd: (String, String, () -> Unit) -> Unit) {
    var name by rememberSaveable(teamId) { mutableStateOf("") }
    var position by rememberSaveable(teamId) { mutableStateOf(positions.last()) }
    fun abbreviation(value: String) = when (value) {
        "Portero" -> "POR"
        "Defensa" -> "DEF"
        "Mediocampista" -> "MED"
        else -> "DEL"
    }
    val colors = MaterialTheme.colorScheme
    val border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.17f))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Surface(
            Modifier.weight(1f), shape = CircleShape,
            color = colors.surface, contentColor = colors.primary, border = border,
        ) {
            Row(
                Modifier.heightIn(min = 40.dp).padding(start = 12.dp, end = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                val label = "Nombre del jugador"
                val style = MaterialTheme.typography.bodyMedium
                BasicTextField(
                    value = name, onValueChange = { if (it.length <= 24) name = it },
                    modifier = Modifier.weight(1f).semantics { contentDescription = label },
                    enabled = enabled, singleLine = true, textStyle = style.copy(color = colors.primary),
                    cursorBrush = SolidColor(colors.primary),
                    decorationBox = { field ->
                        Box(contentAlignment = Alignment.CenterStart) {
                            if (name.isEmpty()) Text(label, style = style, color = colors.primary.copy(alpha = 0.75f), maxLines = 1)
                            field()
                        }
                    },
                )
                Box(Modifier.height(19.dp).width(1.dp).background(colors.primary.copy(alpha = 0.17f)))
                LogbookSelect(abbreviation(position), positions, ::abbreviation, enabled, flat = true) { position = it }
            }
        }
        OutlinedIconButton(
            onClick = { onAdd(name.trim(), position) { name = "" } },
            enabled = enabled && name.isNotBlank(), modifier = Modifier.size(40.dp),
            border = border,
            colors = IconButtonDefaults.outlinedIconButtonColors(
                containerColor = colors.surface,
                disabledContainerColor = colors.surface,
            ),
        ) { Text("+", Modifier.semantics { contentDescription = "Añadir jugador" }) }
    }
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
private fun LogbookNewTeamDialog(
    busy: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onSave: (String, String, String) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var game by remember { mutableStateOf(games.first()) }
    var formation by remember { mutableStateOf(formations.first()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuevo equipo") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                LogbookNameField(name, 30, "Nombre", !busy) { name = it }
                LogbookSelect(game, games, { it }, !busy, Modifier.fillMaxWidth()) { game = it }
                LogbookSelect(formation, formations, { it }, !busy, Modifier.fillMaxWidth()) { formation = it }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(name.trim(), game, formation) }, enabled = !busy && name.isNotBlank()) {
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
    compact: Boolean = false,
    flat: Boolean = false,
    onSelect: (T) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    val colors = MaterialTheme.colorScheme
    Box(modifier) {
        if (flat) {
            val tint = colors.primary.copy(alpha = if (enabled) 1f else 0.55f)
            Row(
                Modifier.clickable(enabled = enabled, role = Role.Button, onClick = { open = true })
                    .heightIn(min = 36.dp).padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp),
            ) {
                Text(selected, color = tint, style = MaterialTheme.typography.labelLarge, maxLines = 1)
                Canvas(Modifier.size(10.dp)) {
                    val tip = Offset(size.width / 2, size.height * 0.65f)
                    drawLine(tint, Offset(size.width * 0.18f, size.height * 0.35f), tip, 1.25.dp.toPx(), StrokeCap.Round)
                    drawLine(tint, tip, Offset(size.width * 0.82f, size.height * 0.35f), 1.25.dp.toPx(), StrokeCap.Round)
                }
            }
        } else {
            OutlinedButton(
                onClick = { open = true }, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = if (compact) 40.dp else 56.dp),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.16f)),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = colors.primary.copy(alpha = 0.06f), contentColor = colors.primary,
                ),
            ) {
                Text(selected, Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                Icon(painterResource(Res.drawable.huge_arrow_big_down_dash), null, Modifier.size(16.dp))
            }
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
internal fun LogbookCard(
    highlight: Boolean = false,
    tinted: Boolean = false,
    shape: RoundedCornerShape = logbookShape,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    val background = when {
        highlight -> colors.tertiary
        tinted -> colors.primary.copy(alpha = 0.07f).compositeOver(colors.background)
        else -> colors.surface
    }
    Surface(
        Modifier.fillMaxWidth(), shape = shape,
        color = background,
        contentColor = if (highlight) colors.onTertiary else colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.15f)),
        shadowElevation = if (tinted) 0.dp else 1.dp,
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp), content = content)
    }
}
