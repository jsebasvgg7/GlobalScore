package me.globalscore.app.features.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.stats_check
import kotlinx.coroutines.CancellationException
import me.globalscore.app.features.matches.teamCode
import me.globalscore.app.ui.SkeletonBlock
import org.jetbrains.compose.resources.painterResource

@Composable
internal fun ColumnScope.AccountHistory(repository: AccountRepository, userId: String, bottomPadding: Dp) {
    var filterName by rememberSaveable(userId) { mutableStateOf(HistoryFilter.All.name) }
    var expanded by remember { mutableStateOf(false) }
    val filter = HistoryFilter.valueOf(filterName)
    val colors = MaterialTheme.colorScheme
    key(userId, filter) {
        var entries by remember { mutableStateOf(emptyList<AccountPrediction>()) }
        var total by remember { mutableStateOf<Long?>(null) }
        var offset by remember { mutableLongStateOf(0L) }
        var hasMore by remember { mutableStateOf(false) }
        var loading by remember { mutableStateOf(true) }
        var failed by remember { mutableStateOf(false) }
        var request by remember { mutableIntStateOf(0) }
        val loadMore: () -> Unit = {
            loading = true
            failed = false
            request++
        }
        LaunchedEffect(repository, request) {
            try {
                val page = repository.history(userId, filter, offset)
                entries = (entries + page.entries).distinctBy { it.id }
                offset += page.entries.size
                total = page.total ?: total
                hasMore = page.entries.size == HistoryPageSize && (total?.let { offset < it } ?: true)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                failed = true
            } finally {
                loading = false
            }
        }
        Row(
            Modifier.fillMaxWidth().padding(top = 12.dp, bottom = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Pronósticos", Modifier.weight(1f), color = colors.primary, style = MaterialTheme.typography.titleMedium)
            Box {
                OutlinedButton(
                    onClick = { expanded = true },
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.24f)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Text(filter.label, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(6.dp))
                    Text("⌄")
                }
                DropdownMenu(
                    expanded = expanded, onDismissRequest = { expanded = false },
                    shape = RoundedCornerShape(12.dp),
                    containerColor = colors.surface,
                    border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.18f)),
                ) {
                    HistoryFilter.entries.forEach { option ->
                        val selected = option == filter
                        val itemShape = RoundedCornerShape(8.dp)
                        DropdownMenuItem(
                            modifier = Modifier.padding(horizontal = 6.dp).clip(itemShape)
                                .background(if (selected) colors.primary.copy(alpha = 0.12f) else colors.surface),
                            text = { Text(option.label, color = colors.primary, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal) },
                            trailingIcon = if (selected) {
                                {
                                    Icon(
                                        painterResource(Res.drawable.stats_check), "Filtro activo",
                                        Modifier.size(18.dp), tint = colors.primary,
                                    )
                                }
                            } else null,
                            onClick = {
                                filterName = option.name
                                expanded = false
                            },
                        )
                    }
                }
            }
            if (loading && offset == 0L) {
                SkeletonBlock(Modifier.size(width = 38.dp, height = 24.dp))
            } else {
                Text(
                    (total ?: entries.size.toLong()).toString(),
                    Modifier.background(colors.tertiary, RoundedCornerShape(6.dp)).padding(horizontal = 8.dp, vertical = 4.dp),
                    color = colors.onTertiary, style = MaterialTheme.typography.labelMedium,
                )
            }
        }
        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f, fill = false)) {
            val columns = if (maxWidth >= 300.dp) 2 else 1
            LazyVerticalGrid(
                columns = GridCells.Fixed(columns),
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(bottom = bottomPadding),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(entries, key = { it.id }) { prediction ->
                    AccountHistoryCard(prediction)
                }
                when {
                    loading -> items(if (entries.isEmpty()) columns * 4 else columns) {
                        SkeletonBlock(Modifier.fillMaxWidth().height(128.dp), RoundedCornerShape(12.dp))
                    }
                    failed -> item(span = { GridItemSpan(maxLineSpan) }) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                            Text("No se pudo cargar el historial.", color = colors.error)
                            TextButton(onClick = loadMore) { Text("Reintentar") }
                        }
                    }
                    entries.isEmpty() -> item(span = { GridItemSpan(maxLineSpan) }) {
                        Text("No hay pronósticos para este filtro.", color = colors.primary)
                    }
                    hasMore -> item(span = { GridItemSpan(maxLineSpan) }) {
                        Button(
                            onClick = loadMore,
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp).heightIn(min = 52.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.tertiary, contentColor = colors.onTertiary),
                        ) {
                            Text("Cargar más", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AccountHistoryCard(prediction: AccountPrediction) {
    val colors = MaterialTheme.colorScheme
    val match = prediction.match
    val failed = prediction.outcome == AccountOutcome.Wrong
    val ink = colors.primary.copy(alpha = if (failed) 0.75f else 1f)
    val detail = if (prediction.finished) "Real: ${prediction.result}" else match?.text("time").orEmpty()
    val status = if (prediction.points > 0 && prediction.finished) {
        "${prediction.outcome.label} +${prediction.points}"
    } else {
        prediction.outcome.label
    }
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = colors.surface,
        contentColor = ink,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.18f)),
        shadowElevation = 1.dp,
    ) {
        Column(
            Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    match?.text("league") ?: "Partido", Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall, maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Text(match?.text("date").orEmpty(), style = MaterialTheme.typography.labelSmall, maxLines = 1)
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                HistoryTeam(match?.text("home_team"))
                Text("vs", style = MaterialTheme.typography.labelSmall)
                HistoryTeam(match?.text("away_team"))
            }
            Text(prediction.prediction, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(detail.ifBlank { "—" }, style = MaterialTheme.typography.labelSmall, maxLines = 1)
            Box(
                Modifier.fillMaxWidth().background(
                    colors.primary.copy(alpha = if (failed) 0.06f else 0.12f), RoundedCornerShape(6.dp),
                ).padding(horizontal = 4.dp, vertical = 4.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(status, style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun HistoryTeam(name: String?) {
    Text(name?.let(::teamCode) ?: "—", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
}
