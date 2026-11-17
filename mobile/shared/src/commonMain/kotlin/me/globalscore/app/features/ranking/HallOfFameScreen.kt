package me.globalscore.app.features.ranking

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import globalscore.shared.generated.resources.*
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.ui.SkeletonBlock

@Composable
internal fun HallOfFameScreen(database: SupabaseClient, bottomPadding: Dp, onOpenHistory: () -> Unit, onSelect: (String) -> Unit) {
    val repository = remember(database) { RankingRepository(database) }
    var monthly by rememberSaveable { mutableStateOf(true) }
    var refresh by remember { mutableStateOf(0) }
    var champions by remember(monthly) { mutableStateOf<List<Champion>?>(null) }
    var failed by remember(monthly) { mutableStateOf(false) }
    var expandedId by rememberSaveable(monthly) { mutableStateOf<String?>(null) }

    LaunchedEffect(repository, monthly, refresh) {
        failed = false
        try {
            champions = repository.loadChampions(monthly)
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (error: Exception) {
            logRankingError("Falló la carga del salón: ${error::class.simpleName}")
            failed = true
        }
    }

    val colors = MaterialTheme.colorScheme
    val rows = champions
    LazyColumn(
        contentPadding = PaddingValues(bottom = bottomPadding + 12.dp),
        verticalArrangement = Arrangement.spacedBy(9.dp),
    ) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HallSummary(Modifier.weight(1f), rows?.size, "campeones", failed)
                HallSummary(Modifier.weight(1f), rows?.sumOf { it.titles }, if (monthly) "coronas" else "trofeos", failed)
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    if (monthly) "Campeones del mes" else "Campeones del global",
                    Modifier.weight(1f),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    RankingSelector("Campeones mensuales", monthly, RankingIcon.Calendar) { monthly = true }
                    RankingSelector("Campeones globales", !monthly, RankingIcon.Globe) { monthly = false }
                }
            }
        }
        when {
            failed -> item {
                Text("No se pudo cargar el Salón de la Fama.", color = MaterialTheme.colorScheme.error)
                TextButton(onClick = { refresh++ }) { Text("Reintentar") }
            }
            rows == null -> {
                item { HallChampionSkeleton(featured = true) }
                items(2) { HallChampionSkeleton(featured = false) }
                item {
                    Text(
                        "Hitos del salón",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary,
                    )
                    Spacer(Modifier.height(8.dp))
                    HallBento(
                        first = { SkeletonBlock(it) },
                        streak = { SkeletonBlock(it) },
                        points = { SkeletonBlock(it) },
                    )
                }
            }
            rows.isEmpty() -> item { Text("Aún no hay campeones en este historial.", color = colors.primary) }
            else -> {
                itemsIndexed(rows, key = { _, champion -> champion.id }) { index, champion ->
                    ChampionCard(champion, index, monthly, expandedId == champion.id, onSelect = { onSelect(champion.id) }) {
                        expandedId = if (expandedId == champion.id) null else champion.id
                    }
                }
                item { HallMilestones(rows) }
            }
        }
        if (monthly) {
            item {
                Button(onClick = onOpenHistory, modifier = Modifier.fillMaxWidth()) {
                    Text("Historial de rankings", Modifier.weight(1f))
                    Icon(painterResource(Res.drawable.huge_arrow_right_01), null, Modifier.size(16.dp))
                }
            }
        }
    }
}

@Composable
private fun HallSummary(modifier: Modifier, count: Int?, label: String, failed: Boolean) {
    HallSurface(modifier) {
        if (count != null || failed) {
            HallMetric(count?.toString() ?: "—", label, Modifier.fillMaxWidth().padding(vertical = 6.dp), large = true)
        } else {
            Column(
                Modifier.fillMaxWidth().padding(vertical = 6.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(Modifier.height(24.dp), contentAlignment = Alignment.Center) {
                    SkeletonBlock(Modifier.size(26.dp, 16.dp))
                }
                Text(label, fontSize = 14.sp, lineHeight = 15.sp)
            }
        }
    }
}

@Composable
private fun ChampionCard(
    champion: Champion,
    index: Int,
    monthly: Boolean,
    expanded: Boolean,
    onSelect: () -> Unit,
    onToggle: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    val leader = index == 0
    val showDetails = leader || expanded
    val label = if (monthly) "coronas" else "trofeos"
    val glyph = if (monthly) Res.drawable.hall_crown else Res.drawable.huge_champion
    HallSurface(Modifier.fillMaxWidth()) {
        Column {
            if (showDetails) {
                Box(
                    Modifier.fillMaxWidth().height(78.dp).background(colors.tertiary),
                    contentAlignment = Alignment.BottomStart,
                ) {
                    RemoteImage(champion.banner, Modifier.matchParentSize(), ContentScale.Crop)
                    Box(Modifier.padding(start = 10.dp, bottom = 6.dp).clickable(onClick = onSelect)) {
                        RankedAvatar(champion.name, champion.avatar, index + 1, 42.dp, compactBadge = true, whiteRing = true)
                    }
                    if (!leader) {
                        ChampionToggle(
                            expanded = true,
                            onToggle = onToggle,
                            modifier = Modifier.align(Alignment.TopEnd).padding(4.dp),
                        )
                    }
                }
            } else {
                Row(
                    Modifier.fillMaxWidth().padding(start = 10.dp, end = 4.dp, top = 8.dp, bottom = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(Modifier.clickable(onClick = onSelect)) {
                        RankedAvatar(champion.name, champion.avatar, index + 1, 40.dp, compactBadge = true)
                    }
                    ChampionIdentity(champion, glyph, onSelect, Modifier.weight(1f).padding(start = 8.dp))
                    ChampionToggle(expanded = false, onToggle = onToggle)
                }
            }
            if (showDetails) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 9.dp, vertical = 11.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    ChampionIdentity(champion, glyph, onSelect, Modifier.weight(1.25f))
                    HallMetric(champion.titles.toString(), label, Modifier.weight(1f))
                    HallMetric(champion.bestPoints.toString(), "pts máx.", Modifier.weight(1f))
                    HallMetric(champion.firstEdition ?: "—", "edición", Modifier.weight(1.15f))
                }
            }
        }
    }
}

@Composable
private fun ChampionToggle(expanded: Boolean, onToggle: () -> Unit, modifier: Modifier = Modifier) {
    val colors = MaterialTheme.colorScheme
    Box(
        modifier.size(44.dp)
            .clickable(role = Role.Button, onClick = onToggle)
            .semantics { contentDescription = if (expanded) "Cerrar tarjeta" else "Abrir tarjeta" },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.size(16.dp)) {
            val edge = size.height * if (expanded) 0.65f else 0.35f
            val tip = size.height - edge
            val chevron = Path().apply {
                moveTo(size.width * 0.2f, edge)
                lineTo(size.width * 0.5f, tip)
                lineTo(size.width * 0.8f, edge)
            }
            val stroke = Stroke(width = 1.6.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
            if (expanded) {
                drawPath(chevron, Color.White, style = Stroke(3.6.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
            }
            drawPath(chevron, if (expanded) colors.tertiary else colors.primary, style = stroke)
        }
    }
}

@Composable
private fun HallChampionSkeleton(featured: Boolean) {
    HallSurface(Modifier.fillMaxWidth()) {
        Column {
            if (featured) {
                Box(Modifier.fillMaxWidth().height(78.dp)) {
                    SkeletonBlock(Modifier.matchParentSize())
                    SkeletonBlock(
                        Modifier.align(Alignment.BottomStart).padding(start = 10.dp, bottom = 8.dp).size(42.dp),
                        shape = CircleShape,
                    )
                }
            }
            Row(
                Modifier.fillMaxWidth().height(if (featured) 58.dp else 66.dp).padding(horizontal = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (!featured) SkeletonBlock(Modifier.size(40.dp), shape = CircleShape)
                SkeletonBlock(Modifier.weight(1.25f).height(18.dp))
                if (featured) {
                    repeat(3) { SkeletonBlock(Modifier.weight(1f).height(24.dp)) }
                }
            }
        }
    }
}

@Composable
private fun ChampionIdentity(champion: Champion, glyph: DrawableResource, onSelect: () -> Unit, modifier: Modifier) {
    Column(modifier.clickable(onClick = onSelect)) {
        Text(champion.name, fontSize = 15.sp, lineHeight = 17.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(painterResource(glyph), "Títulos", Modifier.size(14.dp))
            Text(champion.titles.toString(), fontSize = 12.sp, lineHeight = 14.sp)
        }
    }
}

@Composable
private fun HallMilestones(champions: List<Champion>) {
    val first = champions.filter { it.firstEdition != null }.minByOrNull { it.firstEdition.orEmpty() }
    val streak = champions.maxByOrNull { it.bestStreak }?.takeIf { it.bestStreak > 0 }
    val scorer = champions.maxByOrNull { it.bestPoints }
    Text("Hitos del salón", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
    Spacer(Modifier.height(8.dp))
    HallBento(
        first = { modifier ->
            MilestoneTile(modifier, first?.firstEdition ?: "—", "1.er campeón", first?.name, Res.drawable.hall_crown, highlighted = true)
        },
        streak = { modifier ->
            MilestoneTile(modifier, streak?.bestStreak?.toString() ?: "—", "Mejor racha", streak?.name, Res.drawable.hall_flame)
        },
        points = { modifier ->
            MilestoneTile(modifier, scorer?.bestPoints?.toString() ?: "—", "Máx. puntos", scorer?.name, Res.drawable.huge_target_02)
        },
    )
}

@Composable
private fun HallBento(
    first: @Composable (Modifier) -> Unit,
    streak: @Composable (Modifier) -> Unit,
    points: @Composable (Modifier) -> Unit,
) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val side = (maxWidth - 8.dp) * 0.44f
        Row(Modifier.heightIn(min = side).height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            first(Modifier.width(side).fillMaxHeight())
            Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                streak(Modifier.fillMaxWidth().weight(1f))
                points(Modifier.fillMaxWidth().weight(1f))
            }
        }
    }
}

@Composable
private fun MilestoneTile(
    modifier: Modifier,
    value: String,
    label: String,
    name: String?,
    glyph: DrawableResource,
    highlighted: Boolean = false,
) {
    HallSurface(modifier, highlighted) {
        if (highlighted) {
            Column(
                Modifier.fillMaxSize().padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterVertically),
            ) {
                Icon(painterResource(glyph), null, Modifier.size(23.dp))
                MilestoneText(value, label, name, large = true)
            }
        } else {
            Row(
                Modifier.fillMaxSize().padding(start = 12.dp, end = 7.dp, top = 5.dp, bottom = 5.dp),
                horizontalArrangement = Arrangement.spacedBy(9.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(painterResource(glyph), null, Modifier.size(19.dp))
                VerticalDivider(Modifier.height(28.dp), color = MaterialTheme.colorScheme.primary.copy(alpha = 0.20f))
                Column(Modifier.weight(1f)) { MilestoneText(value, label, name, large = false) }
            }
        }
    }
}

@Composable
private fun MilestoneText(value: String, label: String, name: String?, large: Boolean) {
    val numberSize = if (large) 22.sp else 18.sp
    Text(value, fontSize = numberSize, lineHeight = numberSize, fontWeight = FontWeight.Bold)
    Text(label, fontSize = 12.sp, lineHeight = 13.sp)
    name?.let { Text(it, fontSize = 11.sp, lineHeight = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis) }
}

@Composable
private fun HallMetric(value: String, label: String, modifier: Modifier, large: Boolean = false) {
    val numberSize = if (large) 24.sp else 15.sp
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = numberSize, lineHeight = numberSize, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(label, fontSize = if (large) 14.sp else 11.sp, lineHeight = if (large) 15.sp else 12.sp, textAlign = TextAlign.Center)
    }
}

@Composable
private fun HallSurface(modifier: Modifier, highlighted: Boolean = false, content: @Composable () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier,
        shape = RoundedCornerShape(12.dp),
        color = if (highlighted) colors.tertiary else colors.surface,
        contentColor = if (highlighted) colors.onTertiary else colors.primary,
        shadowElevation = 2.dp,
        content = content,
    )
}
