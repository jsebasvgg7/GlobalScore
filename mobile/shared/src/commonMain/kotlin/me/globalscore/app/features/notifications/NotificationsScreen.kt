package me.globalscore.app.features.notifications

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.*
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.JsonObject
import me.globalscore.app.LocalPushSettings
import me.globalscore.app.features.matches.teamCode
import me.globalscore.app.features.profile.AccountProgressHeader
import me.globalscore.app.features.profile.text
import me.globalscore.app.ui.SkeletonBlock
import org.jetbrains.compose.resources.painterResource
import kotlin.time.Clock
import kotlin.time.Duration.Companion.days

@Composable
internal fun NotificationsScreen(
    modifier: Modifier,
    database: SupabaseClient,
    bottomPadding: Dp,
    onBack: () -> Unit,
    openMatch: (String) -> Unit,
) {
    var retry by remember { mutableIntStateOf(0) }
    var notifications by remember(database, retry) { mutableStateOf<List<JsonObject>?>(null) }
    var failed by remember(database, retry) { mutableStateOf(false) }
    LaunchedEffect(database, retry) {
        try {
            val since = (Clock.System.now() - 7.days).toString()
            notifications = buildList {
                val pageSize = 100
                var start = 0L
                do {
                    val page = database.from("matches").select(
                        Columns.list("id", "home_team", "away_team", "league", "date", "time", "status", "result_home", "result_away"),
                    ) {
                        filter { gte("created_at", since) }
                        order("created_at", Order.DESCENDING)
                        order("id", Order.ASCENDING)
                        range(start, start + pageSize - 1)
                    }.decodeList<JsonObject>()
                    addAll(page)
                    start += page.size
                } while (page.size == pageSize)
            }
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            failed = true
        }
    }
    var filterName by rememberSaveable { mutableStateOf(NoticeFilter.All.name) }
    val filter = NoticeFilter.valueOf(filterName)
    val rows = notifications
    val colors = MaterialTheme.colorScheme
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AccountProgressHeader("Notificaciones", onBack)
        LocalPushSettings.current?.invoke(true)
        when {
            failed -> {
                Text("No se pudieron cargar las notificaciones.", color = colors.error)
                TextButton(onClick = { retry++ }) { Text("Reintentar") }
            }
            rows == null -> NotificationsSkeleton()
            else -> {
                val fresh = remember(rows) { rows.count { it.text("status") == "pending" } }
                val finished = remember(rows) { rows.count { it.text("status") == "finished" } }
                val visible = remember(rows, filter) {
                    rows.filter { filter.status == null || it.text("status") == filter.status }
                }
                NoticeFilters(filter, listOf(rows.size, fresh, finished)) { filterName = it.name }
                key(filter) {
                    if (visible.isEmpty()) {
                        Text(
                            if (rows.isEmpty()) "No hay avisos en los últimos siete días."
                            else "No hay avisos para este filtro.",
                            color = colors.primary,
                        )
                    } else {
                        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f)) {
                            val showMosaic = maxWidth >= 300.dp && visible.size >= 4
                            LazyColumn(
                                state = rememberLazyListState(),
                                contentPadding = PaddingValues(bottom = bottomPadding),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                item {
                                    NoticeCard(visible.first(), openMatch, featured = true)
                                }
                                if (showMosaic) {
                                    item {
                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            NoticeCard(
                                                visible[1], openMatch, Modifier.weight(1.15f).height(174.dp),
                                                stacked = true,
                                            )
                                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                                NoticeCard(visible[2], openMatch, Modifier.height(83.dp), stacked = true)
                                                NoticeCard(visible[3], openMatch, Modifier.height(83.dp), stacked = true)
                                            }
                                        }
                                    }
                                }
                                items(visible.drop(if (showMosaic) 4 else 1), key = { requireNotNull(it.text("id")) }) { row ->
                                    NoticeCard(row, openMatch)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private enum class NoticeFilter(val label: String, val status: String? = null) {
    All("Todas"), New("Nuevas", "pending"), Finished("Finalizadas", "finished"),
}

private val NoticeShape = RoundedCornerShape(12.dp)

@Composable
private fun NoticeFilters(filter: NoticeFilter, counts: List<Int>, onSelect: (NoticeFilter) -> Unit) {
    val colors = MaterialTheme.colorScheme
    Row(
        Modifier.fillMaxWidth().selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(5.dp),
    ) {
        NoticeFilter.entries.forEachIndexed { index, option ->
            val selected = filter == option
            Surface(
                Modifier.weight(1f),
                color = if (selected) colors.tertiary else colors.surface,
                contentColor = if (selected) colors.onTertiary else colors.primary,
                shape = NoticeShape,
                border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.15f)),
            ) {
                Column(
                    Modifier.selectable(selected = selected, role = Role.Tab, onClick = { onSelect(option) })
                        .heightIn(min = 48.dp).padding(horizontal = 3.dp, vertical = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Text(option.label, style = MaterialTheme.typography.labelMedium, textAlign = TextAlign.Center)
                    Text(counts[index].toString(), style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun NoticeCard(
    row: JsonObject,
    openMatch: (String) -> Unit,
    modifier: Modifier = Modifier,
    featured: Boolean = false,
    stacked: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme
    val id = row.text("id")
    val status = row.text("status")
    val finished = status == "finished"
    val pending = status == "pending"
    val ink = if (featured) colors.onTertiary else colors.primary
    val home = row.text("home_team")?.let(::teamCode).orEmpty()
    val away = row.text("away_team")?.let(::teamCode).orEmpty()
    val metadata = listOfNotNull(row.text("league"), row.text("date"), row.text("time")?.take(5)).joinToString(" · ")
    val resultHome = row.text("result_home")
    val resultAway = row.text("result_away")
    val score = if (finished && resultHome != null && resultAway != null) "$resultHome – $resultAway" else null
    val badge = when {
        pending -> "Nuevo"
        finished -> "Final"
        else -> "Partido"
    }
    Surface(
        modifier.fillMaxWidth(),
        color = if (featured) colors.tertiary else colors.surface,
        contentColor = ink,
        shape = NoticeShape,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.15f)),
        shadowElevation = 1.dp,
    ) {
        val action = if (pending && id != null) {
            Modifier.clip(NoticeShape).clickable(role = Role.Button, onClickLabel = "Ver partido") { openMatch(id) }
        } else Modifier
        if (featured || stacked) {
            Column(
                action.then(if (stacked) Modifier.fillMaxHeight() else Modifier.heightIn(min = 116.dp))
                    .padding(if (stacked) 8.dp else 12.dp),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    NoticeIcon(finished, ink)
                    NoticeBadge(score?.let { "$badge · $it" } ?: badge, ink)
                }
                Column {
                    NoticeMatchText(home, away, metadata, featured)
                }
            }
        } else {
            Row(
                action.padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                NoticeIcon(finished, ink)
                Column(Modifier.weight(1f)) { NoticeMatchText(home, away, metadata, featured = false) }
                Column(horizontalAlignment = Alignment.End) {
                    NoticeBadge(badge, ink)
                    score?.let { Text(it, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold) }
                }
            }
        }
    }
}

@Composable
private fun NoticeMatchText(home: String, away: String, metadata: String, featured: Boolean) {
    Text(
        "$home vs $away",
        style = if (featured) MaterialTheme.typography.titleLarge else MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis,
    )
    Text(metadata, style = MaterialTheme.typography.labelSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
}

@Composable
private fun NoticeIcon(finished: Boolean, ink: Color) {
    Box(
        Modifier.size(26.dp).background(ink.copy(alpha = 0.13f), RoundedCornerShape(7.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            painterResource(if (finished) Res.drawable.stats_check else Res.drawable.huge_champion),
            null, Modifier.size(15.dp), tint = ink,
        )
    }
}

@Composable
private fun NoticeBadge(label: String, ink: Color) {
    Text(
        label, Modifier.background(ink.copy(alpha = 0.13f), RoundedCornerShape(6.dp)).padding(horizontal = 6.dp, vertical = 2.dp),
        style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, maxLines = 1,
    )
}

@Composable
private fun NotificationsSkeleton() {
    Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        repeat(3) { SkeletonBlock(Modifier.weight(1f).height(48.dp), NoticeShape) }
    }
    SkeletonBlock(Modifier.fillMaxWidth().height(116.dp), NoticeShape)
    repeat(3) { SkeletonBlock(Modifier.fillMaxWidth().height(62.dp), NoticeShape) }
}
