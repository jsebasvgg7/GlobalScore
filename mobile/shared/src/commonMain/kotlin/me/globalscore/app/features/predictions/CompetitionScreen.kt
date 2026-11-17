package me.globalscore.app.features.predictions

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.*
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.features.matches.MatchToolbarButton
import me.globalscore.app.features.matches.RetroLabel
import me.globalscore.app.features.matches.RetroFilter
import org.jetbrains.compose.resources.painterResource

private enum class CompetitionFilter(val label: String) {
    Open("Abiertos"), Expired("Expirados"), All("Todos"),
}

@Composable
internal fun CompetitionScreen(
    database: SupabaseClient,
    userId: String,
    kind: CompetitionKind,
    bottomPadding: Dp,
    onBack: () -> Unit,
) {
    val repository = remember(database, kind) { SpecialPredictions(database, kind) }
    var competitions by remember(repository, userId) { mutableStateOf<List<Competition>?>(null) }
    var error by remember { mutableStateOf(false) }
    var retry by remember { mutableStateOf(0) }
    var filter by rememberSaveable { mutableStateOf(CompetitionFilter.All) }
    var deadlineTick by remember { mutableStateOf(0) }
    val scope = rememberCoroutineScope()
    val saving = remember(repository, userId) { mutableStateMapOf<String, Boolean>() }
    val failures = remember(repository, userId) { mutableStateMapOf<String, Boolean>() }
    LaunchedEffect(repository, userId, retry) {
        error = false
        try {
            competitions = repository.load(userId)
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            error = true
        }
    }
    LaunchedEffect(Unit) {
        while (true) {
            delay(15_000)
            deadlineTick++
        }
    }

    val data = competitions
    val entries = remember(data, deadlineTick) {
        data.orEmpty().map { it to it.expired() }
            .sortedBy { (competition, expired) -> competition.finished || expired }
    }
    val activeCount = entries.count { (competition, expired) -> !competition.finished && !expired }
    val visible = entries.filter { (competition, expired) ->
        when (filter) {
            CompetitionFilter.Open -> !competition.finished && !expired
            CompetitionFilter.Expired -> competition.finished || expired
            CompetitionFilter.All -> true
        }
    }

    Column(
        Modifier.fillMaxSize().imePadding(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Box(Modifier.fillMaxWidth().heightIn(min = 42.dp)) {
            Box(Modifier.align(Alignment.CenterStart)) {
                MatchToolbarButton("Volver", onBack) {
                    Icon(painterResource(Res.drawable.huge_arrow_right_01), null,
                        Modifier.size(22.dp).scale(scaleX = -1f, scaleY = 1f))
                }
            }
            Row(
                Modifier.align(Alignment.Center),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(kind.title.lowercase(), color = MaterialTheme.colorScheme.primary,
                    fontSize = 26.sp, fontWeight = FontWeight.Bold)
                if (kind == CompetitionKind.League && data != null) {
                    Box(Modifier.semantics { stateDescription = "$activeCount ligas activas" }) {
                        RetroLabel(activeCount.toString())
                    }
                }
            }
            val primary = MaterialTheme.colorScheme.primary
            Box(
                Modifier.align(Alignment.CenterEnd).size(42.dp)
                    .background(primary.copy(alpha = 0.10f), RoundedCornerShape(10.dp))
                    .border(1.dp, primary.copy(alpha = 0.14f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(painterResource(Res.drawable.huge_champion), null, Modifier.size(22.dp), tint = primary)
            }
        }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
        ) {
            CompetitionFilter.entries.forEach { option ->
                RetroFilter(option.label, filter == option) { filter = option }
            }
        }
        when {
            error -> {
                Text("No se pudieron cargar los datos.")
                TextButton(onClick = { retry++ }) { Text("Reintentar") }
            }
            data == null -> LinearProgressIndicator(Modifier.fillMaxWidth())
            visible.isEmpty() -> Text(if (data.isEmpty()) "Todavía no hay ${kind.title.lowercase()}." else "No hay elementos en este filtro.")
            else -> LazyColumn(
                Modifier.weight(1f),
                contentPadding = PaddingValues(top = 6.dp, bottom = bottomPadding + 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(visible, key = { it.first.id }) { (competition, expired) ->
                    CompetitionCard(
                        kind, competition,
                        expired = expired,
                        saving = saving[competition.id] == true,
                        failed = failures[competition.id] == true,
                        onSave = { values ->
                            if (saving[competition.id] != true) {
                                saving[competition.id] = true
                                failures.remove(competition.id)
                                scope.launch {
                                    try {
                                        repository.save(userId, competition, values)
                                        competitions = competitions?.map {
                                            if (it.id == competition.id) it.copy(prediction = values) else it
                                        }
                                    } catch (cancelled: CancellationException) {
                                        throw cancelled
                                    } catch (_: Exception) {
                                        failures[competition.id] = true
                                    } finally {
                                        saving.remove(competition.id)
                                    }
                                }
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun CompetitionCard(
    kind: CompetitionKind, competition: Competition, expired: Boolean,
    saving: Boolean, failed: Boolean, onSave: (List<String>) -> Unit,
) {
    var draft by rememberSaveable(competition.id, competition.prediction) {
        mutableStateOf(ArrayList(competition.prediction ?: List(kind.fields.size) { "" }))
    }
    var expanded by rememberSaveable(competition.id) { mutableStateOf(false) }
    val values = draft.map(String::trim)
    val changed = values != competition.prediction
    val editable = !competition.finished && !expired
    val colors = MaterialTheme.colorScheme
    val isExpired = expired && !competition.finished
    val stateColor = if (isExpired) colors.error else colors.primary
    val state = when {
        competition.finished -> "finalizado"
        expired -> "expirado"
        saving -> "guardando"
        competition.prediction != null && !changed -> "guardado"
        else -> "pendiente"
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.16f)),
        color = colors.surface, shadowElevation = 2.dp,
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                Modifier.fillMaxWidth().heightIn(min = 44.dp)
                    .clickable(role = Role.Button) { expanded = !expanded }
                    .semantics { stateDescription = if (expanded) "Abierto" else "Recogido" },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                val fallback = if (kind == CompetitionKind.League) Res.drawable.huge_champion else Res.drawable.huge_medal_01
                Box(
                    Modifier.size(28.dp)
                        .border(1.dp, colors.primary.copy(alpha = 0.22f), RoundedCornerShape(6.dp))
                        .padding(3.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    RemoteImage(competition.logo, Modifier.fillMaxSize()) {
                        Icon(painterResource(fallback), null, Modifier.size(22.dp), tint = colors.primary)
                    }
                }
                Column(Modifier.weight(1f)) {
                    Text(competition.name, color = colors.primary, fontWeight = FontWeight.Bold,
                        fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    competition.season?.takeIf(String::isNotBlank)?.let { Text(it, fontSize = 12.sp) }
                }
                RetroLabel(state, stateColor)
                Icon(
                    painterResource(Res.drawable.huge_arrow_right_01), null,
                    Modifier.size(16.dp).rotate(if (expanded) -90f else 90f), tint = colors.primary,
                )
            }
            AnimatedVisibility(visible = expanded) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    HorizontalDivider(color = colors.primary.copy(alpha = 0.22f))
                    if (kind == CompetitionKind.League) {
                        PredictionInput(kind, competition, draft, 0, editable && !saving) { draft = it }
                        BoxWithConstraints {
                            if (maxWidth >= 280.dp) {
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    PredictionInput(kind, competition, draft, 1, editable && !saving, Modifier.weight(1f)) { draft = it }
                                    PredictionInput(kind, competition, draft, 2, editable && !saving, Modifier.weight(1f)) { draft = it }
                                }
                            } else {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    PredictionInput(kind, competition, draft, 1, editable && !saving) { draft = it }
                                    PredictionInput(kind, competition, draft, 2, editable && !saving) { draft = it }
                                }
                            }
                        }
                        PredictionInput(kind, competition, draft, 3, editable && !saving) { draft = it }
                    } else {
                        PredictionInput(kind, competition, draft, 0, editable && !saving) { draft = it }
                        competition.category?.takeIf(String::isNotBlank)?.let { RetroLabel(it) }
                    }
                    HorizontalDivider(color = colors.primary.copy(alpha = 0.22f))
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        val points = competition.points
                        val footer = when {
                            competition.finished && points != null -> if (points > 0) "+$points pts" else "Sin puntos esta vez"
                            expired && !competition.finished -> "Plazo expirado"
                            competition.deadline != null && !competition.finished -> competition.deadline.take(16).replace('T', ' ')
                            else -> ""
                        }
                        if (footer.isNotBlank()) Text(footer, color = stateColor, textAlign = TextAlign.Center, fontSize = 11.sp)
                        if (editable && (changed || saving)) {
                            Button(
                                onClick = { onSave(values) },
                                enabled = !saving && values.all(String::isNotBlank),
                                colors = ButtonDefaults.buttonColors(containerColor = colors.tertiary, contentColor = colors.onTertiary),
                            ) {
                                Text(if (saving) "Guardando…" else if (competition.prediction == null) "Guardar" else "Actualizar")
                            }
                        }
                    }
                    if (failed) Text("No se pudo guardar. Revisa la conexión y el plazo.", Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center, color = colors.error, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
private fun PredictionInput(
    kind: CompetitionKind, competition: Competition, draft: ArrayList<String>, index: Int,
    enabled: Boolean, modifier: Modifier = Modifier, onChange: (ArrayList<String>) -> Unit,
) {
    Column(modifier) {
        OutlinedTextField(
            value = draft[index],
            onValueChange = { value -> onChange(ArrayList(draft).apply { set(index, value) }) },
            modifier = Modifier.fillMaxWidth(),
            readOnly = !enabled,
            singleLine = true,
            label = { Text(kind.fields[index].label, style = MaterialTheme.typography.bodyMedium) },
            shape = RoundedCornerShape(10.dp),
        )
        if (competition.finished) {
            competition.results[index]?.takeIf(String::isNotBlank)?.let { official ->
                val correct = competition.prediction?.get(index)?.equals(official, ignoreCase = true) == true
                Text(
                    if (correct) "Resultado: $official · Acierto" else "Resultado: $official",
                    Modifier.padding(top = 4.dp), fontSize = 12.sp,
                )
            }
        }
    }
}
