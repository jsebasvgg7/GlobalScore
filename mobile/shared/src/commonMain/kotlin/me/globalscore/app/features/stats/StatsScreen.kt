package me.globalscore.app.features.stats

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.*
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.features.ranking.RankingIcon
import me.globalscore.app.features.ranking.RankingSelector
import me.globalscore.app.ui.SkeletonBlock
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import kotlin.time.Clock

private val statsShape = RoundedCornerShape(10.dp)
private val weekdays = listOf("dom", "lun", "mar", "mié", "jue", "vie", "sáb")

@Composable
internal fun StatsScreen(
    modifier: Modifier,
    userId: String,
    bottomPadding: Dp,
    data: StatsData?,
    failed: Boolean,
    onRetry: () -> Unit,
    onOpenSpecial: (String) -> Unit,
) {
    var rangeName by rememberSaveable(userId) { mutableStateOf(StatsRange.Global.name) }
    val range = StatsRange.valueOf(rangeName)
    val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    val colors = MaterialTheme.colorScheme

    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            Text("Estadísticas", Modifier.weight(1f), color = colors.primary, fontSize = 22.sp)
            RankingSelector("Global", range == StatsRange.Global, RankingIcon.Globe) { rangeName = StatsRange.Global.name }
            RankingSelector("Mes", range == StatsRange.Month, RankingIcon.Calendar) { rangeName = StatsRange.Month.name }
            RankingSelector("Histórico", range == StatsRange.All, RankingIcon.Book) { rangeName = StatsRange.All.name }
        }
        if (failed) {
            Text(
                if (data == null) "No se pudieron cargar las estadísticas."
                else "No se pudieron actualizar las estadísticas. Se muestran los últimos datos.",
                color = colors.error,
            )
            TextButton(onClick = onRetry) { Text("Reintentar") }
        }
        if (data == null) {
            if (!failed) StatsSkeleton(bottomPadding)
        } else {
            val report = remember(data, range, today) { data.report(range, today) }
            val (pointsLabel, predictionsLabel) = when (range) {
                StatsRange.Global -> "puntos globales" to "predicciones globales"
                StatsRange.Month -> "puntos del mes" to "predicciones del mes"
                StatsRange.All -> "puntos históricos" to "predicciones históricas"
            }
            Column(
                Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(bottom = bottomPadding),
                verticalArrangement = Arrangement.spacedBy(9.dp),
            ) {
                Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AccuracyTile(report.accuracy, Modifier.weight(0.75f).fillMaxHeight())
                    Column(Modifier.weight(2f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        StatStrip(report.points, pointsLabel, Res.drawable.huge_folder_01, Modifier.fillMaxWidth(), enlarged = true)
                        StatStrip(report.total, predictionsLabel,
                            Res.drawable.huge_target_02, Modifier.fillMaxWidth(), enlarged = true)
                    }
                }
                StatsHeading("Desglose de puntos")
                Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Breakdown("Exactos", report.exact, "${percentage(report.exact, report.total)}% exactitud",
                        Res.drawable.stats_star, Modifier.weight(1f).fillMaxHeight())
                    Breakdown("Correctos", report.correct, "3 pts c/p", Res.drawable.stats_check, Modifier.weight(1f).fillMaxHeight())
                    Breakdown("Errados", report.wrong, "0 pts c/p", Res.drawable.stats_x, Modifier.weight(1f).fillMaxHeight())
                }
                StatsHeading("Racha")
                Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                    StatStrip(report.currentStreak, "racha actual", Res.drawable.hall_flame, Modifier.weight(1f).fillMaxHeight())
                    StatStrip(report.bestStreak, "mejor racha", Res.drawable.hall_flame, Modifier.weight(1f).fillMaxHeight())
                }
                StatsHeading("Rendimiento por día")
                DayPerformance(report.days)
                StatsHeading("Rendimiento por liga")
                LeaguePerformance(report.leagues)
                StatsHeading("Pronósticos especiales")
                StatStrip(report.leagueCount, "ligas predichas", Res.drawable.huge_champion, Modifier.fillMaxWidth()) { onOpenSpecial("Ligas") }
                StatStrip(report.awardCount, "premios predichos", Res.drawable.huge_medal_01, Modifier.fillMaxWidth()) { onOpenSpecial("Premios") }
            }
        }
    }
}

@Composable
private fun StatsSkeleton(bottomPadding: Dp) {
    Column(
        Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(bottom = bottomPadding)
            .semantics { stateDescription = "Cargando estadísticas" },
        verticalArrangement = Arrangement.spacedBy(9.dp),
    ) {
        Row(Modifier.fillMaxWidth().height(106.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SkeletonBlock(Modifier.weight(0.75f).fillMaxHeight(), statsShape)
            Column(Modifier.weight(2f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                repeat(2) { SkeletonBlock(Modifier.fillMaxWidth().weight(1f), statsShape) }
            }
        }
        StatsHeading("Desglose de puntos")
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(3) { SkeletonBlock(Modifier.weight(1f).height(110.dp), statsShape) }
        }
        StatsHeading("Racha")
        Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            repeat(2) { SkeletonBlock(Modifier.weight(1f).height(46.dp), statsShape) }
        }
        StatsHeading("Rendimiento por día")
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            repeat(7) { SkeletonBlock(Modifier.weight(1f).height(94.dp), RoundedCornerShape(4.dp)) }
        }
        StatsHeading("Rendimiento por liga")
        SkeletonBlock(Modifier.fillMaxWidth().height(142.dp), statsShape)
        StatsHeading("Pronósticos especiales")
        repeat(2) { SkeletonBlock(Modifier.fillMaxWidth().height(46.dp), statsShape) }
    }
}

@Composable
private fun AccuracyTile(percent: Int, modifier: Modifier) {
    val colors = MaterialTheme.colorScheme
    StatsCard(modifier, strongBorder = true) {
        Box(Modifier.fillMaxSize().clip(statsShape), contentAlignment = Alignment.Center) {
            Box(
                Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                    .fillMaxHeight(percent.coerceIn(0, 100) / 100f)
                    .background(colors.primary.copy(alpha = 0.10f)),
            )
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("$percent%", fontWeight = FontWeight.Bold, fontSize = 26.sp, lineHeight = 27.sp)
                Text("precisión", fontSize = 15.sp, lineHeight = 17.sp)
            }
        }
    }
}

@Composable
private fun StatStrip(
    value: Int,
    label: String,
    glyph: DrawableResource,
    modifier: Modifier,
    enlarged: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val content: @Composable () -> Unit = {
        Row(Modifier.fillMaxWidth().heightIn(min = 46.dp).padding(horizontal = 7.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            StatsIcon(glyph, 32.dp, filled = true)
            Column(Modifier.weight(1f)) {
                Text(value.toString(), fontSize = if (enlarged) 20.sp else 18.sp, lineHeight = if (enlarged) 21.sp else 19.sp, fontWeight = FontWeight.Bold)
                Text(label, fontSize = if (enlarged) 15.sp else 13.sp, lineHeight = if (enlarged) 17.sp else 15.sp)
            }
            if (onClick != null) Icon(painterResource(Res.drawable.huge_arrow_right_01), null, Modifier.size(15.dp))
        }
    }
    val colors = MaterialTheme.colorScheme
    if (onClick == null) StatsCard(modifier, content = content)
    else Surface(onClick = onClick, modifier = modifier, shape = statsShape, color = colors.surface,
        contentColor = colors.primary, border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
        shadowElevation = 1.dp, content = content)
}

@Composable
private fun Breakdown(label: String, value: Int, detail: String, glyph: DrawableResource, modifier: Modifier) {
    StatsCard(modifier) {
        Column(Modifier.padding(horizontal = 6.dp, vertical = 7.dp)) {
            StatsIcon(glyph, 28.dp)
            Spacer(Modifier.height(8.dp))
            Text(label, fontWeight = FontWeight.Bold, fontSize = 15.sp, lineHeight = 17.sp)
            Spacer(Modifier.height(1.dp))
            Text(value.toString(), fontWeight = FontWeight.Bold, fontSize = 26.sp, lineHeight = 27.sp)
            Text(detail, fontSize = 12.sp, lineHeight = 14.sp)
        }
    }
}

@Composable
private fun DayPerformance(days: List<DayAccuracy>) {
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(4.dp)
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        days.forEachIndexed { index, day ->
            val percent = percentage(day.correct, day.total)
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(if (day.total == 0) "—" else "$percent%", color = colors.primary, fontSize = 11.sp, maxLines = 1)
                Surface(Modifier.fillMaxWidth().height(94.dp), shape = shape, color = colors.surface,
                    border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.35f))) {
                    Box(Modifier.fillMaxSize()) {
                        Box(Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                            .fillMaxHeight(percent.coerceIn(0, 100) / 100f).background(colors.tertiary))
                    }
                }
                Text(weekdays[index], color = colors.primary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun LeaguePerformance(leagues: List<LeagueAccuracy>) {
    val colors = MaterialTheme.colorScheme
    StatsCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(9.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("competición", fontSize = 13.sp)
                Text("% de aciertos", fontSize = 13.sp)
            }
            if (leagues.isEmpty()) {
                Text("Sin partidos finalizados en este rango.", fontSize = 13.sp)
            } else {
                val low = (leagues.minOf { it.accuracy } - 12).coerceAtLeast(0)
                val high = (leagues.maxOf { it.accuracy } + 12).coerceAtMost(100)
                val span = (high - low).coerceAtLeast(1)
                Canvas(Modifier.fillMaxWidth().height(75.dp)) {
                    repeat(5) { index ->
                        val y = size.height * index / 4
                        drawLine(colors.primary.copy(alpha = 0.13f), Offset(0f, y), Offset(size.width, y))
                    }
                    val points = leagues.mapIndexed { index, league ->
                        Offset(size.width * (index + 0.5f) / leagues.size,
                            size.height * (0.90f - 0.80f * (league.accuracy - low) / span))
                    }
                    points.zipWithNext().forEach { (start, end) -> drawLine(colors.primary, start, end, 1.dp.toPx()) }
                    val peak = leagues.indices.maxBy { leagues[it].accuracy }
                    drawCircle(colors.primary, radius = 3.dp.toPx(), center = points[peak])
                }
                Row(Modifier.fillMaxWidth()) {
                    leagues.forEach { league ->
                        Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(Modifier.size(24.dp).background(colors.tertiary, CircleShape), contentAlignment = Alignment.Center) {
                                RemoteImage(league.logo, Modifier.size(16.dp)) {
                                    Text(league.name.take(2).uppercase(), color = colors.onTertiary, fontSize = 9.sp)
                                }
                            }
                            Text("${league.accuracy}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatsIcon(glyph: DrawableResource, size: Dp, filled: Boolean = false) {
    val colors = MaterialTheme.colorScheme
    Box(
        Modifier.size(size).background(if (filled) colors.tertiary else colors.primary.copy(alpha = 0.10f), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Icon(painterResource(glyph), null, Modifier.size(size * 0.5f), tint = if (filled) colors.onTertiary else colors.primary)
    }
}

@Composable
private fun StatsHeading(label: String) {
    Text(label, Modifier.padding(top = 4.dp), color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
}

@Composable
private fun StatsCard(modifier: Modifier, strongBorder: Boolean = false, content: @Composable () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(modifier, shape = statsShape, color = colors.surface, contentColor = colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = if (strongBorder) 0.60f else 0.12f)),
        shadowElevation = 1.dp, content = content)
}
