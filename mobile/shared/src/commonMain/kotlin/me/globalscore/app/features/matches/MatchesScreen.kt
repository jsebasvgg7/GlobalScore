package me.globalscore.app.features.matches

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.compositeOver
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.TimeZone
import kotlinx.datetime.plus
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Clock
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_arrow_right_01
import globalscore.shared.generated.resources.match_swords
import globalscore.shared.generated.resources.stats_check
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import me.globalscore.app.features.home.RemoteImage
import org.jetbrains.compose.resources.painterResource

@Composable
internal fun MatchesScreen(
    modifier: Modifier,
    dashboard: MatchDashboard,
    selectedMatch: String?,
    onBack: () -> Unit,
    autosave: PredictionAutosave,
    bottomPadding: Dp,
    probabilities: Boolean,
    probabilityToggleEnabled: Boolean,
    probabilityPreferenceError: String?,
    onRetryProbabilityPreference: () -> Unit,
    onProbabilityChange: (Boolean) -> Unit,
) {
    var farthestFirst by rememberSaveable { mutableStateOf(false) }
    var league by rememberSaveable { mutableStateOf<String?>(null) }
    var filterOpen by remember { mutableStateOf(false) }
    var deadlineTick by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(15_000)
            deadlineTick++
        }
    }
    val leagues = remember(dashboard.matches) { dashboard.matches.map(Match::league).distinct().sorted() }
    val visible = dashboard.matches.filter { league == null || it.league == league }
    val ordered = if (farthestFirst) visible.asReversed() else visible
    val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    val tomorrow = today.plus(DatePeriod(days = 1))
    val featured = ordered.firstOrNull { it.id == selectedMatch }
    val groups = ordered.filterNot { it.id == featured?.id }.groupBy(Match::date)

    val primary = MaterialTheme.colorScheme.primary
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            MatchToolbarButton(label = "Volver", onClick = onBack) {
                Icon(
                    painterResource(Res.drawable.huge_arrow_right_01),
                    contentDescription = null,
                    modifier = Modifier.size(22.dp).scale(scaleX = -1f, scaleY = 1f),
                )
            }
            Row(
                Modifier.weight(1f).padding(horizontal = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Partidos", fontSize = 26.sp, lineHeight = 30.sp, fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary, maxLines = 1)
                RetroLabel(ordered.size.toString())
            }
            Box {
                MatchToolbarButton(label = "Filtrar por liga", onClick = { filterOpen = true }) {
                    LeagueFilterIcon()
                }
                DropdownMenu(expanded = filterOpen, onDismissRequest = { filterOpen = false }) {
                    (listOf<String?>(null) + leagues).forEach { option ->
                        DropdownMenuItem(
                            text = {
                                Text(option ?: "Todas las ligas",
                                    fontWeight = if (league == option) FontWeight.Bold else FontWeight.Normal)
                            },
                            onClick = {
                                league = option
                                filterOpen = false
                            },
                        )
                    }
                }
            }
        }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
        ) {
            RetroFilter("más próximos", !farthestFirst) { farthestFirst = false }
            RetroFilter("más lejanos", farthestFirst) { farthestFirst = true }
        }
        league?.let {
            Text(it, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium)
        }
        Surface(
            shape = ControlShape,
            color = primary.copy(alpha = 0.06f),
            border = BorderStroke(1.dp, primary.copy(alpha = 0.12f)),
        ) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 3.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier.size(16.dp).border(1.dp, primary, PillShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("!", color = primary, fontSize = 11.sp, lineHeight = 12.sp, fontWeight = FontWeight.Bold)
                }
                Text(
                    "Los porcentajes orientan, no garantizan el resultado.",
                    Modifier.weight(1f),
                    color = primary, fontSize = 11.sp, lineHeight = 13.sp,
                    maxLines = 2, overflow = TextOverflow.Ellipsis,
                )
                Text("%", color = primary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                ProbabilityToggle(probabilities, probabilityToggleEnabled, onProbabilityChange)
            }
        }
        probabilityPreferenceError?.let { message ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(message, Modifier.weight(1f), color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                if (!probabilityToggleEnabled) {
                    TextButton(onClick = onRetryProbabilityPreference) { Text("Reintentar") }
                }
            }
        }
        if (ordered.isEmpty()) {
            Box(
                Modifier.weight(1f).fillMaxWidth().padding(bottom = bottomPadding),
                contentAlignment = Alignment.Center,
            ) {
                EmptyMatches(filteredByLeague = league != null)
            }
            return@Column
        }
        LazyColumn(
            Modifier.weight(1f),
            contentPadding = PaddingValues(bottom = bottomPadding + 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (featured != null) {
                item("featured-${featured.id}") {
                    MatchCard(featured, dashboard.predictions[featured.id], probabilities, true,
                        remember(featured, deadlineTick) { featured.isClosed() }, autosave)
                }
            }
            groups.forEach { (date, matches) ->
                item("date-$date") {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        HorizontalDivider(Modifier.weight(1f))
                        RetroLabel(when (date) { today.toString() -> "hoy"; tomorrow.toString() -> "mañana"; else -> date })
                        HorizontalDivider(Modifier.weight(1f))
                    }
                }
                items(matches, key = { it.id }) { match ->
                    MatchCard(match, dashboard.predictions[match.id], probabilities, false,
                        remember(match, deadlineTick) { match.isClosed() }, autosave)
                }
            }
        }
    }
}

@Composable
private fun EmptyMatches(filteredByLeague: Boolean) {
    val primary = MaterialTheme.colorScheme.primary
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Canvas(Modifier.size(width = 96.dp, height = 72.dp)) {
            val line = 1.5.dp.toPx()
            val markings = primary.copy(alpha = 0.55f)
            drawRect(primary.copy(alpha = 0.05f))
            drawRect(
                markings, Offset(line, line),
                Size(size.width - line * 2, size.height - line * 2),
                style = Stroke(line),
            )
            drawLine(markings, Offset(center.x, line), Offset(center.x, size.height - line), line)
            drawCircle(markings, size.height * 0.16f, style = Stroke(line))
            val areaWidth = size.width * 0.16f
            val areaHeight = size.height * 0.46f
            val areaTop = center.y - areaHeight / 2
            drawRect(markings, Offset(line, areaTop), Size(areaWidth, areaHeight), style = Stroke(line))
            drawRect(
                markings, Offset(size.width - line - areaWidth, areaTop),
                Size(areaWidth, areaHeight), style = Stroke(line),
            )
        }
        Text(
            if (filteredByLeague) "No hay partidos en esta liga" else "No hay partidos disponibles",
            color = primary,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun MatchCard(
    match: Match,
    saved: Prediction?,
    probabilities: Boolean,
    highlighted: Boolean,
    closed: Boolean,
    autosave: PredictionAutosave,
) {
    val draft = autosave.drafts[match.id] ?: PredictionDraft(saved?.home, saved?.away, saved?.advancing)
    val saving = autosave.pending[match.id] == true
    val failed = autosave.errors[match.id] == true
    val colors = MaterialTheme.colorScheme
    val canEdit = !closed
    var showKnockoutHelp by remember(match.id) { mutableStateOf(false) }
    fun update(value: PredictionDraft) = autosave.update(match, value)
    val showProbabilities = probabilities && match.homeProbability != null &&
        match.drawProbability != null && match.awayProbability != null

    if (match.knockout && showKnockoutHelp) {
        AlertDialog(
            onDismissRequest = { showKnockoutHelp = false },
            title = { Text("Partido de eliminatoria") },
            text = {
                Text("Pronostica el marcador y toca el escudo del equipo que crees que avanzará. El check morado indica tu elección.")
            },
            confirmButton = {
                TextButton(onClick = { showKnockoutHelp = false }) { Text("Entendido") }
            },
        )
    }

    Surface(
        shape = CardShape,
        shadowElevation = 2.dp,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = if (highlighted) 0.55f else 0.16f)),
        color = colors.surface,
        contentColor = colors.onSurface,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(start = 12.dp, end = 12.dp, top = 12.dp, bottom = 6.dp),
            verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(
                    Modifier.size(26.dp)
                        .border(1.dp, colors.primary.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
                        .padding(3.dp),
                ) {
                    RemoteImage(match.leagueLogo, Modifier.fillMaxSize())
                }
                Text(
                    match.league, Modifier.weight(1f), fontWeight = FontWeight.Bold,
                    color = colors.primary, fontSize = 14.sp, letterSpacing = 0.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                if (match.knockout) {
                    Row(
                        Modifier.clip(PillShape)
                            .background(colors.primary.copy(alpha = 0.10f))
                            .clickable(role = Role.Button, onClickLabel = "Ver cómo funciona la eliminatoria") {
                                showKnockoutHelp = true
                            }
                            .padding(horizontal = 6.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp),
                    ) {
                        KnockoutSwords(size = 12.dp)
                        Text("KO", color = colors.primary, fontSize = 10.sp, lineHeight = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
                RetroLabel(when {
                    closed -> "cerrado"
                    saving -> "guardando"
                    failed -> "error"
                    saved != null -> "guardado"
                    else -> "pendiente"
                })
            }
            HorizontalDivider(color = colors.primary.copy(alpha = 0.22f))
            fun advancingAction(side: String): (() -> Unit)? = if (match.knockout) {
                { update(draft.copy(advancing = side.takeUnless { draft.advancing == it })) }
            } else null
            ScoreRow(match.home, match.homeLogo, match.homeProbability.takeIf { showProbabilities },
                match.awayProbability, draft.home, canEdit, Modifier.padding(top = 4.dp),
                draft.advancing == "home", advancingAction("home")) { update(draft.copy(home = it)) }
            Row(verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                HorizontalDivider(Modifier.weight(1f), color = colors.primary.copy(alpha = 0.22f))
                when {
                    showProbabilities -> RetroLabel("= ${match.drawProbability}%")
                    match.knockout -> KnockoutSwords()
                    else -> RetroLabel("VS")
                }
                HorizontalDivider(Modifier.weight(1f), color = colors.primary.copy(alpha = 0.22f))
            }
            ScoreRow(match.away, match.awayLogo, match.awayProbability.takeIf { showProbabilities },
                match.homeProbability, draft.away, canEdit, Modifier.padding(bottom = 4.dp),
                draft.advancing == "away", advancingAction("away")) { update(draft.copy(away = it)) }
            HorizontalDivider(color = colors.primary.copy(alpha = 0.22f))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Text(match.time, fontSize = 11.sp, lineHeight = 14.sp)
                Text("|", color = colors.primary, fontSize = 11.sp, lineHeight = 14.sp)
                Text(match.date, fontSize = 11.sp, lineHeight = 14.sp)
            }
            if (failed && !closed) {
                TextButton(onClick = { update(draft) }) { Text("Reintentar guardado") }
            }
        }
    }
}

private val CardShape = RoundedCornerShape(18.dp)
private val ControlShape = RoundedCornerShape(10.dp)
private val PillShape = RoundedCornerShape(50)

@Composable
internal fun RetroLabel(text: String, primary: Color = MaterialTheme.colorScheme.primary) {
    Text(
        text,
        Modifier.background(primary.copy(alpha = 0.10f), PillShape)
            .padding(horizontal = 8.dp, vertical = 3.dp),
        color = primary, fontSize = 12.sp, lineHeight = 15.sp, fontWeight = FontWeight.Bold,
    )
}

@Composable
internal fun RetroFilter(label: String, selected: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = onClick, shape = PillShape, border = BorderStroke(1.dp, colors.primary),
        color = if (selected) colors.tertiary else colors.surface,
        contentColor = if (selected) colors.onTertiary else colors.primary,
    ) {
        Text(label, Modifier.padding(horizontal = 18.dp, vertical = 4.dp),
            fontSize = 13.sp, lineHeight = 17.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun KnockoutSwords(size: Dp = 14.dp) {
    Icon(painterResource(Res.drawable.match_swords), null, Modifier.size(size), tint = MaterialTheme.colorScheme.primary)
}

@Composable
private fun MatchLogo(name: String, url: String?, selected: Boolean, enabled: Boolean, onAdvancing: (() -> Unit)?) {
    val colors = MaterialTheme.colorScheme
    val interaction = if (onAdvancing != null) {
        Modifier.toggleable(selected, enabled = enabled, role = Role.Checkbox, onValueChange = { onAdvancing() })
            .semantics { contentDescription = "$name avanza" }
    } else Modifier
    val hitSize = if (onAdvancing != null) 44.dp else 38.dp
    Box(Modifier.size(hitSize).then(interaction), contentAlignment = Alignment.Center) {
        Box(
            Modifier.size(38.dp)
                .then(if (selected) Modifier.border(2.dp, colors.primary, CircleShape).padding(3.dp) else Modifier),
        ) {
            RemoteImage(url, Modifier.fillMaxSize()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(teamCode(name), color = colors.primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        if (selected) {
            Box(
                Modifier.align(Alignment.TopEnd).size(15.dp).background(colors.primary, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(painterResource(Res.drawable.stats_check), null, Modifier.size(10.dp),
                    tint = colors.surface)
            }
        }
    }
}

@Composable
private fun ScoreRow(
    name: String, logo: String?, probability: Int?, opponentProbability: Int?, score: Int?,
    enabled: Boolean, modifier: Modifier, advancing: Boolean, onAdvancing: (() -> Unit)?,
    onScore: (Int) -> Unit,
) {
    val primary = MaterialTheme.colorScheme.primary
    Row(
        modifier.fillMaxWidth().heightIn(min = 40.dp), verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        MatchLogo(name, logo, onAdvancing != null && advancing, enabled, onAdvancing)
        val showProbability = probability != null && opponentProbability != null
        val codeStyle = MaterialTheme.typography.bodyLarge.copy(
            fontSize = 15.sp, lineHeight = 17.sp, fontWeight = FontWeight.Bold,
        )
        Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
            Column(
                if (showProbability) Modifier
                else Modifier.alpha(0f).clearAndSetSemantics {},
            ) {
                Text(teamCode(name), color = primary, style = codeStyle, maxLines = 1)
                val (trend, color) = when {
                    probability == null || opponentProbability == null -> "" to primary
                    probability > opponentProbability -> "↗" to Color(0xFF13815B)
                    probability < opponentProbability -> "↘" to Color(0xFFC14848)
                    else -> "=" to primary
                }
                Text("$trend ${probability ?: 0}%", color = color, fontSize = 11.sp, lineHeight = 12.sp, maxLines = 1)
            }
            if (!showProbability) {
                Text(teamCode(name), color = primary, style = codeStyle, maxLines = 1)
            }
        }
        RetroScoreButton("−", "Restar gol a $name", enabled && (score ?: 0) > 0, false) {
            onScore((score ?: 0) - 1)
        }
        Surface(
            modifier = Modifier.size(44.dp, 36.dp),
            shape = ControlShape,
            color = primary.copy(alpha = 0.10f).compositeOver(MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, primary.copy(alpha = 0.35f)),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    score?.toString() ?: "—", color = primary, textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyLarge.copy(background = Color.Transparent),
                    fontWeight = FontWeight.Bold, fontSize = 19.sp, lineHeight = 21.sp,
                )
            }
        }
        RetroScoreButton("+", "Sumar gol a $name", enabled && score != Int.MAX_VALUE, true) {
            onScore(score?.plus(1) ?: 0)
        }
    }
}

@Composable
internal fun RetroScoreButton(glyph: String, label: String, enabled: Boolean, filled: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val edge = colors.primary.copy(alpha = if (enabled) 0.55f else 0.18f)
    val raised = filled && enabled
    val interactions = remember { MutableInteractionSource() }
    var pressed by remember { mutableStateOf(false) }
    LaunchedEffect(interactions, enabled) {
        pressed = false
        if (!enabled) return@LaunchedEffect
        interactions.interactions.collectLatest { interaction ->
            when (interaction) {
                is PressInteraction.Press -> pressed = true
                is PressInteraction.Release -> {
                    // Keep a quick tap visible even inside the scrolling match list.
                    delay(65)
                    pressed = false
                }
                is PressInteraction.Cancel -> pressed = false
                else -> Unit
            }
        }
    }
    val pressScale by animateFloatAsState(
        targetValue = if (enabled && pressed) 0.96f else 1f,
        animationSpec = tween(if (pressed) 65 else 125),
        label = "Pulsación del marcador",
    )
    Box(
        Modifier.size(36.dp)
            .clickable(
                interactionSource = interactions,
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = onClick,
            )
            .semantics { contentDescription = label },
    ) {
        Surface(
            modifier = Modifier.fillMaxSize().graphicsLayer {
                scaleX = pressScale
                scaleY = pressScale
            },
            shadowElevation = if (enabled) 1.dp else 0.dp,
            shape = ControlShape, border = BorderStroke(1.dp, edge),
            color = if (raised) Color.Black.copy(alpha = 0.22f).compositeOver(colors.tertiary) else colors.surface,
            contentColor = if (raised) colors.onTertiary else edge,
        ) {
            val face = if (raised) colors.tertiary else colors.surface
            val faceModifier = if (raised) Modifier.padding(bottom = 3.dp) else Modifier
            Box(
                Modifier.fillMaxSize().then(faceModifier).background(
                    Brush.verticalGradient(listOf(face, if (raised) face else edge.copy(alpha = 0.09f))),
                    ControlShape,
                ),
                contentAlignment = Alignment.Center,
            ) {
                Text(glyph, Modifier.offset(y = if (raised) 0.dp else (-1).dp), fontSize = 18.sp,
                    lineHeight = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun ProbabilityToggle(checked: Boolean, enabled: Boolean, onCheckedChange: (Boolean) -> Unit) {
    val colors = MaterialTheme.colorScheme
    Box(
        Modifier.size(44.dp, 36.dp)
            .toggleable(value = checked, enabled = enabled, role = Role.Switch, onValueChange = onCheckedChange)
            .semantics { contentDescription = "Mostrar probabilidades" },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            Modifier.size(38.dp, 20.dp)
                .background(if (checked) colors.tertiary else colors.surface, PillShape)
                .border(1.dp, colors.primary.copy(alpha = if (checked) 1f else 0.36f), PillShape)
                .padding(2.dp),
            contentAlignment = if (checked) Alignment.CenterEnd else Alignment.CenterStart,
        ) {
            Spacer(Modifier.size(16.dp).background(
                if (checked) colors.onTertiary else colors.primary.copy(alpha = 0.6f), PillShape,
            ))
        }
    }
}

@Composable
internal fun MatchToolbarButton(label: String, onClick: () -> Unit, icon: @Composable () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = onClick,
        modifier = Modifier.size(42.dp).semantics { contentDescription = label },
        shape = ControlShape,
        color = colors.surface,
        contentColor = colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.14f)),
        shadowElevation = 1.dp,
    ) {
        Box(
            Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(
                colors.primary.copy(alpha = 0.06f), colors.primary.copy(alpha = 0.13f),
            ))),
            contentAlignment = Alignment.Center,
        ) {
            icon()
        }
    }
}

@Composable
private fun LeagueFilterIcon() {
    val color = MaterialTheme.colorScheme.primary
    Canvas(Modifier.size(22.dp)) {
        val width = size.width
        val height = size.height
        listOf(0.30f, 0.67f, 0.46f).forEachIndexed { index, position ->
            val y = height * (0.22f + index * 0.28f)
            val x = width * position
            drawLine(color, Offset(width * 0.08f, y), Offset(width * 0.92f, y), 1.5.dp.toPx())
            drawLine(color, Offset(x, y - height * 0.12f), Offset(x, y + height * 0.12f), 2.dp.toPx())
        }
    }
}
