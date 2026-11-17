package me.globalscore.app.features.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.*
import kotlinx.serialization.json.JsonObject
import me.globalscore.app.features.ranking.RankingStats
import me.globalscore.app.ui.SkeletonBlock
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource

@Composable
internal fun AccountStatsPreview(user: JsonObject, globalRank: Int?) {
    val level = user.count("level").coerceAtLeast(1)
    val stats = RankingStats(user.count("season_points"), user.count("season_correct"), user.count("season_predictions"))
    val xp = (stats.points - (level - 1L) * 20).coerceIn(0L, 20L)
    ProgressCard {
        Row(
            Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Column {
                Text("Nivel", style = MaterialTheme.typography.labelMedium)
                Text(level.toString(), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("$xp/20 XP", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                ProgressTrack(xp / 20f)
                Text("${20L - xp} pts para el siguiente nivel", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
    SeasonMetric("Puntos de temporada", stats.points.toString(), Res.drawable.huge_chart_bar_line, featured = true)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        SeasonMetric("Precisión", "${stats.accuracy}%", Res.drawable.huge_target_02, Modifier.weight(1f))
        SeasonMetric("Pronósticos", stats.predictions.toString(), Res.drawable.huge_football, Modifier.weight(1f))
    }
    SeasonMetric("Puesto global", globalRank?.let { "#$it" } ?: "—", Res.drawable.huge_ranking)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        SeasonMetric("Coronas", user.count("monthly_championships").toString(), Res.drawable.hall_crown, Modifier.weight(1f))
        SeasonMetric("Trofeos", user.count("global_championships").toString(), Res.drawable.huge_champion, Modifier.weight(1f))
    }
}

@Composable
private fun SeasonMetric(
    label: String,
    value: String,
    icon: DrawableResource,
    modifier: Modifier = Modifier,
    featured: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme
    val ink = if (featured) colors.onTertiary else colors.primary
    ProgressCard(modifier, filled = featured) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(painterResource(icon), null, Modifier.size(17.dp), tint = ink)
                Text(label, Modifier.weight(1f), style = MaterialTheme.typography.labelMedium, color = ink)
            }
            Text(
                value, fontWeight = FontWeight.Bold, color = ink,
                style = if (featured) MaterialTheme.typography.displaySmall else MaterialTheme.typography.headlineSmall,
            )
        }
    }
}

@Composable
internal fun AccountAchievements(progress: AccountProgress) {
    val colors = MaterialTheme.colorScheme
    val unlockedIds = progress.achievements.mapNotNull { it.text("id") }.toSet()
    ProgressCard {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text("${unlockedIds.size}/${progress.catalog.size}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text("Logros desbloqueados", style = MaterialTheme.typography.bodySmall)
            if (progress.catalog.isNotEmpty()) ProgressTrack(unlockedIds.size.toFloat() / progress.catalog.size)
        }
    }
    if (progress.catalog.isEmpty()) {
        Text("Aún no hay logros disponibles.", color = colors.primary)
    }
    val groups = progress.catalog.groupBy { achievement ->
        when ((achievement.text("category") ?: achievement.text("requirement_type"))?.lowercase()) {
            "predictions" -> "Pronósticos" to Res.drawable.huge_target_02
            "correct", "accuracy" -> "Aciertos" to Res.drawable.stats_check
            "streak", "streaks" -> "Rachas" to Res.drawable.hall_flame
            "points" -> "Puntos" to Res.drawable.huge_chart_bar_line
            else -> "Especiales" to Res.drawable.stats_star
        }
    }
    val categoryOrder = listOf("Pronósticos", "Aciertos", "Rachas", "Puntos", "Especiales")
    groups.entries.sortedBy { categoryOrder.indexOf(it.key.first) }.forEach { (group, achievements) ->
        val (label, icon) = group
        Text(label, Modifier.padding(top = 8.dp), color = colors.primary, style = MaterialTheme.typography.titleMedium)
        achievements.forEach { achievement ->
            val unlocked = achievement.text("id") in unlockedIds
            ProgressCard {
                RewardRow(
                    achievement, icon, colors.primary,
                    badge = if (unlocked) null else "Bloqueado",
                    muted = !unlocked,
                )
            }
        }
    }
}

@Composable
internal fun AccountTitles(titles: List<JsonObject>) {
    val colors = MaterialTheme.colorScheme
    val equipped = titles.firstOrNull()
    if (equipped != null) {
        val accent = titleAccent(equipped, colors.primary)
        ProgressCard(accent = accent) {
            RewardRow(equipped, Res.drawable.stats_star, accent, badge = "Equipado")
        }
    }
    Text("Títulos desbloqueados · ${titles.size}", color = colors.primary, style = MaterialTheme.typography.titleMedium)
    if (titles.isEmpty()) Text("Aún no tienes títulos.", color = colors.primary)
    titles.asReversed().forEach { title ->
        val accent = titleAccent(title, colors.primary)
        ProgressCard(accent = accent) {
            RewardRow(title, Res.drawable.hall_crown, accent)
        }
    }
}

private fun titleAccent(title: JsonObject, fallback: Color): Color =
    title.text("color")?.trim()?.removePrefix("#")
        ?.takeIf { it.length == 6 }?.toLongOrNull(16)
        ?.takeIf { it in 0..0xFFFFFF }?.let { Color(0xFF000000L or it) } ?: fallback

@Composable
private fun RewardRow(
    item: JsonObject,
    icon: DrawableResource,
    accent: Color,
    badge: String? = null,
    muted: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme
    val ink = colors.primary.copy(alpha = if (muted) 0.76f else 1f)
    Row(
        Modifier.fillMaxWidth().padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            Modifier.size(34.dp).background(accent.copy(alpha = if (muted) 0.08f else 0.16f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(painterResource(icon), null, Modifier.size(18.dp), tint = if (muted) ink else accent)
        }
        Column(Modifier.weight(1f)) {
            Text(item.text("name").orEmpty(), color = ink, fontWeight = FontWeight.Bold)
            item.text("description")?.takeIf { it.isNotBlank() }?.let {
                Text(it, color = ink, style = MaterialTheme.typography.bodySmall)
            }
        }
        badge?.let {
            Text(
                it, Modifier.background(colors.primary.copy(alpha = 0.09f), CircleShape).padding(horizontal = 6.dp, vertical = 3.dp),
                color = ink, style = MaterialTheme.typography.labelSmall,
            )
        }
    }
}

@Composable
private fun ProgressTrack(progress: Float) {
    val colors = MaterialTheme.colorScheme
    LinearProgressIndicator(
        progress = { progress }, modifier = Modifier.fillMaxWidth().height(6.dp),
        color = colors.tertiary, trackColor = colors.primary.copy(alpha = 0.12f),
    )
}

@Composable
private fun ProgressCard(
    modifier: Modifier = Modifier,
    filled: Boolean = false,
    accent: Color = MaterialTheme.colorScheme.primary,
    content: @Composable () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier = modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp),
        color = if (filled) colors.tertiary else colors.surface,
        contentColor = if (filled) colors.onTertiary else colors.primary,
        border = BorderStroke(1.dp, accent.copy(alpha = 0.22f)),
        shadowElevation = 1.dp,
        content = content,
    )
}

@Composable
internal fun AccountProgressHeader(title: String, onBack: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    Box(Modifier.fillMaxWidth().heightIn(min = 48.dp), contentAlignment = Alignment.Center) {
        IconButton(onClick = onBack, modifier = Modifier.align(Alignment.CenterStart)) {
            Icon(
                painterResource(Res.drawable.huge_arrow_right_01), "Volver",
                Modifier.size(22.dp).graphicsLayer { scaleX = if (rtl) 1f else -1f },
                tint = colors.primary,
            )
        }
        Text(
            title, Modifier.fillMaxWidth().padding(horizontal = 48.dp, vertical = 6.dp),
            textAlign = TextAlign.Center,
            color = colors.primary, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
internal fun AccountStatsSkeleton() {
    val shape = RoundedCornerShape(12.dp)
    SkeletonBlock(Modifier.fillMaxWidth().height(84.dp), shape)
    SkeletonBlock(Modifier.fillMaxWidth().height(92.dp), shape)
    repeat(2) {
        if (it == 1) SkeletonBlock(Modifier.fillMaxWidth().height(78.dp), shape)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(2) { SkeletonBlock(Modifier.weight(1f).height(78.dp), shape) }
        }
    }
}

@Composable
internal fun AccountAchievementsSkeleton() {
    AccountRewardSkeleton(94.dp, 5)
}

@Composable
internal fun AccountTitlesSkeleton() {
    AccountRewardSkeleton(68.dp, 4)
}

@Composable
private fun AccountRewardSkeleton(headerHeight: Dp, rows: Int) {
    val shape = RoundedCornerShape(12.dp)
    SkeletonBlock(Modifier.fillMaxWidth().height(headerHeight), shape)
    SkeletonBlock(Modifier.width(120.dp).height(18.dp))
    repeat(rows) { SkeletonBlock(Modifier.fillMaxWidth().height(58.dp), shape) }
}

@Composable
internal fun AccountChampionshipSummary(user: JsonObject) {
    val colors = MaterialTheme.colorScheme
    ProgressCard {
        Column(
            Modifier.fillMaxWidth().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Box(
                Modifier.size(48.dp).background(colors.primary.copy(alpha = 0.12f), CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(painterResource(Res.drawable.hall_crown), null, Modifier.size(28.dp), tint = colors.primary)
            }
            Text(user.count("monthly_championships").toString(), style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Bold)
            Text("Campeonatos mensuales ganados", style = MaterialTheme.typography.labelLarge)
        }
    }
    ProgressCard(filled = true) {
        Row(
            Modifier.fillMaxWidth().padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            listOf(
                "Puntos del mes" to "monthly_points",
                "Pronósticos" to "monthly_predictions",
                "Aciertos" to "monthly_correct",
            ).forEach { (label, field) ->
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(user.count(field).toString(), style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text(label, style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

@Composable
internal fun AccountChampionshipHistory(
    label: String,
    entries: List<JsonObject>,
    editionField: String,
    icon: DrawableResource,
    emptyLabel: String,
) {
    val colors = MaterialTheme.colorScheme
    Text(label, Modifier.padding(top = 8.dp), color = colors.primary, style = MaterialTheme.typography.titleMedium)
    if (entries.isEmpty()) {
        ProgressCard {
            Text(emptyLabel, Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium)
        }
    }
    entries.forEachIndexed { index, entry ->
        ProgressCard {
            Row(
                Modifier.fillMaxWidth().padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "#${index + 1}",
                    Modifier.background(colors.primary.copy(alpha = 0.12f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 7.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                )
                Column(Modifier.weight(1f)) {
                    Text(entry.text(editionField) ?: "—", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    Text("${entry.count("points")} pts", style = MaterialTheme.typography.bodySmall)
                }
                Icon(painterResource(icon), null, Modifier.size(19.dp), tint = colors.primary)
            }
        }
    }
}

@Composable
internal fun AccountChampionshipSummarySkeleton() {
    val shape = RoundedCornerShape(12.dp)
    SkeletonBlock(Modifier.fillMaxWidth().height(152.dp), shape)
    SkeletonBlock(Modifier.fillMaxWidth().height(62.dp), shape)
}

@Composable
internal fun AccountChampionshipHistorySkeleton(rows: Int) {
    SkeletonBlock(Modifier.padding(top = 8.dp).width(132.dp).height(18.dp))
    repeat(rows) {
        SkeletonBlock(Modifier.fillMaxWidth().height(58.dp), RoundedCornerShape(12.dp))
    }
}
