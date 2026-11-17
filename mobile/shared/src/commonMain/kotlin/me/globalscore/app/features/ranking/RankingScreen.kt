package me.globalscore.app.features.ranking

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import io.github.jan.supabase.SupabaseClient
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.hall_crown
import globalscore.shared.generated.resources.huge_target_02
import globalscore.shared.generated.resources.huge_notebook_01
import org.jetbrains.compose.resources.painterResource
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.features.profile.PublicProfileDialog
import me.globalscore.app.ui.SkeletonBlock

@Composable
internal fun RankingScreen(
    modifier: Modifier,
    table: RankingTable?,
    monthly: Boolean,
    onPeriodChange: (Boolean) -> Unit,
    failed: Boolean,
    onRetry: () -> Unit,
    bottomPadding: Dp,
    database: SupabaseClient,
    hallOfFame: Boolean,
    onHallOfFame: () -> Unit,
    onOpenHistory: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    var selectedUserId by rememberSaveable { mutableStateOf<String?>(null) }
    selectedUserId?.let { id ->
        val rankingLabel = if (hallOfFame) null else table?.let { currentTable ->
            currentTable.entries.firstOrNull { it.id == id }?.let { entry ->
                val period = if (monthly) "mensual" else "global"
                "#${entry.position} de ${currentTable.registered} · $period"
            }
        }
        PublicProfileDialog(
            database = database,
            userId = id,
            rankingLabel = rankingLabel,
            onClose = { selectedUserId = null },
        )
    }
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                if (hallOfFame) "Hall of Fame" else "Ranking",
                Modifier.weight(1f).padding(end = 8.dp),
                style = MaterialTheme.typography.headlineSmall,
                color = colors.primary,
                fontWeight = FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                RankingSelector("Global", !hallOfFame && !monthly, RankingIcon.Globe) { onPeriodChange(false) }
                RankingSelector("Mensual", !hallOfFame && monthly, RankingIcon.Calendar) { onPeriodChange(true) }
                RankingSelector("Hall of Fame", hallOfFame, RankingIcon.Crown, onHallOfFame)
            }
        }
        if (hallOfFame) {
            HallOfFameScreen(database, bottomPadding, onOpenHistory) { selectedUserId = it }
            return
        }

        if (failed) {
            Text("No se pudo actualizar la clasificación.", color = colors.primary)
            TextButton(onClick = onRetry) { Text("Reintentar") }
        }
        if (table == null) {
            if (!failed) RankingSkeleton(bottomPadding)
            return
        }

        key(monthly) {
            LazyColumn(
                state = rememberLazyListState(),
                contentPadding = PaddingValues(bottom = bottomPadding),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (table.entries.isNotEmpty()) {
                    item { RankingPodium(table.entries.take(3)) { selectedUserId = it } }
                }
                item {
                    Column(Modifier.padding(horizontal = 8.dp, vertical = 6.dp)) {
                        Text("Clasificación", fontWeight = FontWeight.Bold, fontSize = 19.sp, color = colors.primary)
                        Text("${table.participants}/${table.registered} participantes", color = colors.primary)
                    }
                }
                if (table.entries.isEmpty()) {
                    item { Text("Aún no hay jugadores con puntos en este período.", color = colors.primary) }
                }
                items(table.entries.drop(3), key = { it.id }) { entry -> RankingRow(entry) { selectedUserId = entry.id } }
            }
        }
    }
}

@Composable
private fun RankingSkeleton(bottomPadding: Dp) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(bottom = bottomPadding),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Row(
                Modifier.fillMaxWidth().padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                listOf(88.dp, 124.dp, 68.dp).forEach { towerHeight ->
                    Column(
                        Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        SkeletonBlock(Modifier.size(64.dp), CircleShape)
                        SkeletonBlock(Modifier.fillMaxWidth(0.62f).height(14.dp))
                        SkeletonBlock(Modifier.width(40.dp).height(11.dp))
                        SkeletonBlock(Modifier.fillMaxWidth().height(towerHeight), RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                    }
                }
            }
        }
        item { SkeletonBlock(Modifier.padding(start = 8.dp, bottom = 6.dp).width(126.dp).height(20.dp)) }
        items(4) {
            SkeletonBlock(Modifier.fillMaxWidth().height(68.dp), RoundedCornerShape(12.dp))
        }
    }
}

@Composable
private fun RankingPodium(entries: List<RankingEntry>, onSelect: (String) -> Unit) {
    val colors = MaterialTheme.colorScheme
    val positions = when (entries.size) {
        1 -> listOf(0)
        2 -> listOf(1, 0)
        else -> listOf(1, 0, 2)
    }
    Row(
        Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.Bottom,
    ) {
        positions.forEach { index ->
            val entry = entries[index]
            Column(
                Modifier.weight(1f, fill = entries.size > 1).clickable { onSelect(entry.id) },
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                RankedAvatar(entry.name, entry.avatar, entry.position, 64.dp, compactBadge = true, podiumBadge = true)
                Text(entry.name, Modifier.padding(horizontal = 3.dp), fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis, color = colors.primary)
                Text("${entry.stats.points} pts", fontSize = 13.sp, color = colors.primary)
                Spacer(Modifier.height(8.dp))
                PodiumTower(entry.position, if (entries.size == 1) Modifier.widthIn(max = 116.dp) else Modifier)
            }
        }
    }
}

@Composable
private fun PodiumTower(position: Int, modifier: Modifier) {
    val colors = MaterialTheme.colorScheme
    val height = when (position) {
        1 -> 124.dp
        2 -> 88.dp
        else -> 68.dp
    }
    Box(modifier.fillMaxWidth().height(height), contentAlignment = Alignment.Center) {
        Canvas(Modifier.matchParentSize()) {
            val stroke = 1.dp.toPx()
            val left = stroke / 2
            val right = size.width - left
            val roofHeight = if (position == 3) 17.dp.toPx() else 21.dp.toPx()
            val bevel = size.width * 0.19f
            val outline = Path().apply {
                moveTo(left, size.height)
                if (position != 3) lineTo(left, roofHeight)
                lineTo(if (position == 3) left else left + bevel, left)
                lineTo(if (position == 2) right else right - bevel, left)
                if (position != 2) lineTo(right, roofHeight)
                lineTo(right, size.height)
            }
            drawPath(outline, Brush.verticalGradient(listOf(colors.surface, colors.primary.copy(alpha = 0.09f))))
            drawPath(outline, colors.primary, style = Stroke(stroke))
            drawLine(colors.primary.copy(alpha = 0.55f), Offset(left, roofHeight), Offset(right, roofHeight), stroke)
        }
        Text(
            position.toString(),
            Modifier.padding(top = 14.dp),
            color = colors.primary,
            fontSize = if (position == 1) 48.sp else 36.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun RankingRow(entry: RankingEntry, onSelect: () -> Unit) {
    RankingRow(entry, archived = false, onSelect = onSelect)
}

@Composable
internal fun RankingRow(entry: RankingEntry, archived: Boolean, onSelect: (() -> Unit)? = null) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = colors.surface,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
        shadowElevation = 1.dp,
    ) {
        val rowModifier = if (onSelect == null) Modifier else Modifier.clickable(onClick = onSelect)
        Row(
            rowModifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            RankedAvatar(entry.name, entry.avatar, entry.position, 42.dp, compactBadge = true)
            Column(Modifier.weight(1f)) {
                Text(entry.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis, color = colors.primary)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(
                        painterResource(Res.drawable.huge_target_02),
                        contentDescription = "Aciertos",
                        modifier = Modifier.size(13.dp),
                        tint = colors.primary,
                    )
                    val stats = entry.stats
                    val predictions = if (archived) " · ${stats.predictions}" else ""
                    Text(
                        "${stats.correct} · ${stats.accuracy}%$predictions",
                        modifier = Modifier.weight(1f, fill = false),
                        fontSize = 12.sp, color = colors.primary, maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                    if (archived) {
                        Icon(
                            painterResource(Res.drawable.huge_notebook_01),
                            contentDescription = "${stats.predictions} pronósticos",
                            modifier = Modifier.size(13.dp),
                            tint = colors.primary,
                        )
                    }
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(entry.stats.points.toString(), fontWeight = FontWeight.Bold, fontSize = 24.sp, lineHeight = 24.sp, color = colors.primary)
                Text("pts", fontSize = 12.sp, lineHeight = 13.sp, color = colors.primary)
            }
        }
    }
}

@Composable
internal fun RankedAvatar(name: String, avatar: String?, position: Int, size: Dp, compactBadge: Boolean = false, podiumBadge: Boolean = false, whiteRing: Boolean = false) {
    val colors = MaterialTheme.colorScheme
    val ring = when {
        podiumBadge -> colors.primary
        whiteRing -> Color.White
        else -> null
    }
    val showCrown = podiumBadge && position == 1
    Box(Modifier.padding(bottom = if (compactBadge) 10.dp else 5.dp), contentAlignment = Alignment.BottomCenter) {
        Box(
            Modifier.padding(top = if (showCrown) 18.dp else 0.dp).size(size)
                .then(if (ring != null) Modifier.background(ring, CircleShape).padding(2.dp) else Modifier)
                .background(colors.tertiary, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            RemoteImage(avatar, Modifier.fillMaxSize().clip(CircleShape), ContentScale.Crop) {
                Text(name.take(2).uppercase(), color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
        if (showCrown) {
            Icon(
                painterResource(Res.drawable.hall_crown), "Primer puesto",
                Modifier.align(Alignment.TopCenter).size(16.dp), tint = colors.primary,
            )
        }
        Surface(
            Modifier.offset(y = if (compactBadge) 10.dp else 5.dp),
            shape = RoundedCornerShape(4.dp),
            shadowElevation = 1.dp,
        ) {
            if (compactBadge) {
                Text(
                    "#$position", Modifier.padding(horizontal = 3.dp), color = colors.primary,
                    fontSize = if (podiumBadge) 11.sp else 10.sp,
                    lineHeight = if (podiumBadge) 13.sp else 12.sp,
                    maxLines = 1, fontWeight = FontWeight.Bold,
                )
            } else {
                Text("#$position", Modifier.padding(horizontal = 4.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

internal enum class RankingIcon { Globe, Calendar, Crown, Book }

@Composable
internal fun RankingSelector(label: String, selected: Boolean, icon: RankingIcon, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(10.dp)
    FilledIconToggleButton(
        checked = selected,
        onCheckedChange = { onClick() },
        modifier = Modifier.size(42.dp)
            .background(colors.primary.copy(alpha = 0.13f), shape)
            .padding(bottom = 2.dp),
        shape = shape,
        colors = IconButtonDefaults.filledIconToggleButtonColors(
            containerColor = colors.surface,
            contentColor = colors.primary,
            checkedContainerColor = colors.tertiary,
            checkedContentColor = Color.White,
        ),
    ) {
        val tint = LocalContentColor.current
        Canvas(Modifier.size(21.dp).semantics { contentDescription = label }) {
            val u = size.width / 24f
            val stroke = Stroke(1.7f * u)
            when (icon) {
                RankingIcon.Globe -> {
                    drawCircle(tint, radius = 9 * u, style = stroke)
                    drawOval(tint, Offset(8 * u, 3 * u), Size(8 * u, 18 * u), style = stroke)
                    drawLine(tint, Offset(3 * u, 12 * u), Offset(21 * u, 12 * u), stroke.width)
                }
                RankingIcon.Calendar -> {
                    drawRect(tint, Offset(4 * u, 6 * u), Size(16 * u, 15 * u), style = stroke)
                    drawLine(tint, Offset(4 * u, 10 * u), Offset(20 * u, 10 * u), stroke.width)
                    drawLine(tint, Offset(8 * u, 3 * u), Offset(8 * u, 8 * u), stroke.width)
                    drawLine(tint, Offset(16 * u, 3 * u), Offset(16 * u, 8 * u), stroke.width)
                }
                RankingIcon.Book -> {
                    val book = Path().apply {
                        moveTo(12 * u, 6 * u)
                        quadraticTo(8 * u, 3 * u, 3 * u, 5 * u)
                        lineTo(3 * u, 19 * u)
                        quadraticTo(8 * u, 17 * u, 12 * u, 20 * u)
                        quadraticTo(16 * u, 17 * u, 21 * u, 19 * u)
                        lineTo(21 * u, 5 * u)
                        quadraticTo(16 * u, 3 * u, 12 * u, 6 * u)
                        close()
                    }
                    drawPath(book, tint, style = stroke)
                    drawLine(tint, Offset(12 * u, 6 * u), Offset(12 * u, 20 * u), stroke.width)
                }
                RankingIcon.Crown -> {
                    val crown = Path().apply {
                        moveTo(3 * u, 6 * u)
                        lineTo(8 * u, 10 * u)
                        lineTo(12 * u, 4 * u)
                        lineTo(16 * u, 10 * u)
                        lineTo(21 * u, 6 * u)
                        lineTo(18 * u, 17 * u)
                        lineTo(6 * u, 17 * u)
                        close()
                    }
                    drawPath(crown, tint, style = stroke)
                    drawLine(tint, Offset(6 * u, 21 * u), Offset(18 * u, 21 * u), stroke.width)
                }
            }
        }
    }
}
