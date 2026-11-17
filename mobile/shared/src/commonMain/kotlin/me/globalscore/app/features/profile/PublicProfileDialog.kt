package me.globalscore.app.features.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil3.compose.SubcomposeAsyncImage
import globalscore.shared.generated.resources.*
import io.github.jan.supabase.SupabaseClient
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.JsonObject
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.features.ranking.RankingStats
import me.globalscore.app.ui.SkeletonBlock

private enum class ProfileTab(val label: String, val icon: DrawableResource) {
    Stats("Estadísticas", Res.drawable.huge_chart_bar_line),
    Titles("Campeonatos", Res.drawable.huge_champion),
    Achievements("Logros", Res.drawable.huge_medal_01),
    Albums("Álbumes", Res.drawable.huge_folder_01),
}

@Composable
internal fun PublicProfileDialog(
    database: SupabaseClient,
    userId: String,
    rankingLabel: String?,
    onClose: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        BoxWithConstraints(
            Modifier.fillMaxSize().safeDrawingPadding().padding(horizontal = 16.dp),
            contentAlignment = Alignment.Center,
        ) {
            Surface(
                Modifier.widthIn(max = 540.dp).fillMaxWidth().height(maxHeight * 0.92f),
                shape = RoundedCornerShape(12.dp),
                color = colors.surface,
                contentColor = colors.primary,
                border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
            ) {
                Column {
                    Row(
                        Modifier.fillMaxWidth().background(colors.tertiary)
                            .padding(start = 16.dp, end = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("info del perfil", Modifier.weight(1f), color = Color.White, style = MaterialTheme.typography.titleLarge)
                        IconButton(onClick = onClose) {
                            Box(
                                Modifier.size(36.dp).background(Color.White.copy(alpha = 0.22f), CircleShape),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(painterResource(Res.drawable.stats_x), "Cerrar", Modifier.size(16.dp), tint = Color.White)
                            }
                        }
                    }
                    ProfileContent(database, userId, rankingLabel)
                }
            }
        }
    }
}

@Composable
private fun ProfileContent(database: SupabaseClient, userId: String, rankingLabel: String?) {
    val repository = remember(database) { PublicProfileRepository(database) }
    var selectedTab by rememberSaveable(userId) { mutableStateOf(ProfileTab.Stats.name) }
    val tab = ProfileTab.valueOf(selectedTab)
    ProfileLoad(userId, load = { repository.user(userId) }, loading = { PublicProfileSkeleton(tab) }) { user ->
        Column(
            Modifier.fillMaxWidth().padding(bottom = 8.dp)
                .verticalScroll(rememberScrollState()).padding(bottom = 8.dp),
        ) {
            PublicProfileHero(user, rankingLabel)
            Column(Modifier.padding(horizontal = 14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                user.text("bio")?.trim()?.takeIf { it.isNotEmpty() }?.let { bio ->
                    Text(
                        bio, Modifier.padding(horizontal = 10.dp),
                        color = MaterialTheme.colorScheme.primary,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                if (tab == ProfileTab.Stats) PublicLevelProgress(user)
                PublicMonthlySummary(user)
                PublicProfileTabs(tab) { selectedTab = it.name }
                key(tab) {
                    when (tab) {
                        ProfileTab.Stats -> PublicStatistics(user)
                        ProfileTab.Titles -> ProfileLoad(
                            userId,
                            load = { repository.titles(userId, true) to repository.titles(userId, false) },
                            loading = { PublicProfileTabSkeleton(tab) },
                        ) { (crowns, trophies) ->
                            PublicChampionships("trofeos · global", trophies, "edition_label", Res.drawable.huge_champion, "sin trofeos aún")
                            PublicChampionships("coronas · mensual", crowns, "month_year", Res.drawable.hall_crown, "sin coronas aún")
                        }
                        ProfileTab.Achievements -> ProfileLoad(
                            userId, load = repository::achievements, loading = { PublicProfileTabSkeleton(tab) },
                        ) {
                            ProfileAchievements(user, it)
                        }
                        ProfileTab.Albums -> ProfileLoad(
                            userId, load = { repository.albums(userId) }, loading = { PublicProfileTabSkeleton(tab) },
                        ) { completed ->
                            ProfileHeading("álbumes legendarios · ${completed.size}/${legendaryAlbums.size}")
                            legendaryAlbums.forEach { (id, name) ->
                                ProfileCard {
                                    ProfileDetailRow(
                                        Res.drawable.huge_folder_01, name,
                                        if (id in completed) "Completo" else "Pendiente",
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PublicProfileSkeleton(tab: ProfileTab) {
    val shape = RoundedCornerShape(10.dp)
    Column(Modifier.fillMaxWidth().padding(bottom = 8.dp).verticalScroll(rememberScrollState())) {
        Box(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
            SkeletonBlock(Modifier.fillMaxWidth().height(80.dp), shape)
            Row(
                Modifier.fillMaxWidth().padding(start = 20.dp, end = 14.dp, top = 60.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                SkeletonBlock(Modifier.size(68.dp), CircleShape)
                Column(Modifier.padding(top = 24.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    SkeletonBlock(Modifier.width(110.dp).height(18.dp))
                    SkeletonBlock(Modifier.width(64.dp).height(11.dp))
                }
            }
        }
        Column(Modifier.padding(horizontal = 14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (tab == ProfileTab.Stats) SkeletonBlock(Modifier.fillMaxWidth().height(56.dp), shape)
            SkeletonBlock(Modifier.width(78.dp).height(15.dp))
            SkeletonBlock(Modifier.fillMaxWidth().height(52.dp), shape)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                repeat(ProfileTab.entries.size) {
                    SkeletonBlock(Modifier.weight(1f).height(44.dp), shape)
                }
            }
            PublicProfileTabSkeleton(tab)
        }
    }
}

@Composable
private fun PublicProfileTabSkeleton(tab: ProfileTab) {
    val shape = RoundedCornerShape(10.dp)
    when (tab) {
        ProfileTab.Stats -> {
            SkeletonBlock(Modifier.width(55.dp).height(15.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                repeat(2) { SkeletonBlock(Modifier.weight(1f).height(54.dp), shape) }
            }
            SkeletonBlock(Modifier.width(94.dp).height(15.dp))
            repeat(3) { SkeletonBlock(Modifier.fillMaxWidth().height(26.dp), shape) }
        }
        ProfileTab.Titles -> repeat(2) {
            SkeletonBlock(Modifier.width(114.dp).height(15.dp))
            SkeletonBlock(Modifier.fillMaxWidth().height(54.dp), shape)
        }
        ProfileTab.Achievements -> {
            SkeletonBlock(Modifier.width(84.dp).height(26.dp))
            SkeletonBlock(Modifier.fillMaxWidth().height(4.dp))
            SkeletonBlock(Modifier.width(90.dp).height(15.dp))
            repeat(3) { SkeletonBlock(Modifier.fillMaxWidth().height(30.dp), shape) }
        }
        ProfileTab.Albums -> {
            SkeletonBlock(Modifier.width(144.dp).height(15.dp))
            repeat(3) { SkeletonBlock(Modifier.fillMaxWidth().height(46.dp), shape) }
        }
    }
}

@Composable
private fun PublicProfileHero(user: JsonObject, rankingLabel: String?) {
    val colors = MaterialTheme.colorScheme
    val name = user.text("name").orEmpty().ifBlank { "Jugador" }
    val crowns = user.count("monthly_championships")
    val avatar = user.text("avatar_url")?.takeIf { it.isNotBlank() }
    var showAvatar by rememberSaveable(avatar) { mutableStateOf(false) }
    Box(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
        Box(
            Modifier.fillMaxWidth().height(80.dp).clip(RoundedCornerShape(bottomStart = 10.dp, bottomEnd = 10.dp))
                .background(Brush.verticalGradient(listOf(Color(0xFF381DD8), colors.tertiary))),
        ) {
            RemoteImage(user.text("equipped_banner_url"), Modifier.fillMaxSize(), ContentScale.Crop)
        }
        Row(
            Modifier.fillMaxWidth().padding(start = 20.dp, end = 14.dp, top = 60.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Box(contentAlignment = Alignment.BottomCenter) {
                Box(
                    Modifier.padding(bottom = 8.dp).size(68.dp).clip(CircleShape).background(colors.tertiary)
                        .then(
                            if (avatar == null) Modifier else Modifier.clickable(
                                onClickLabel = "Ampliar foto de $name", role = Role.Button,
                                onClick = { showAvatar = true },
                            ),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    RemoteImage(avatar, Modifier.fillMaxSize(), ContentScale.Crop) {
                        Text(name.take(2).uppercase(), color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
                Surface(
                    shape = RoundedCornerShape(5.dp), color = colors.surface, contentColor = colors.primary,
                    border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
                ) {
                    Text("n.${user.count("level").coerceAtLeast(1)}", Modifier.padding(horizontal = 4.dp), fontWeight = FontWeight.Bold)
                }
            }
            Column(Modifier.weight(1f).padding(top = 24.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        name, Modifier.weight(1f, fill = false), color = colors.primary,
                        style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold,
                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                    if (crowns > 0) {
                        Row(
                            Modifier.background(colors.tertiary, RoundedCornerShape(5.dp)).padding(horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp),
                        ) {
                            Icon(painterResource(Res.drawable.hall_crown), "Coronas mensuales", Modifier.size(14.dp), tint = Color.White)
                            Text(crowns.toString(), color = Color.White, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
                rankingLabel?.let { Text(it, color = colors.primary, style = MaterialTheme.typography.bodySmall) }
            }
        }
    }
    if (showAvatar && avatar != null) {
        PublicAvatarViewer(avatar, name, onClose = { showAvatar = false })
    }
}

@Composable
private fun PublicAvatarViewer(url: String, name: String, onClose: () -> Unit) {
    var dragOffset by remember { mutableFloatStateOf(0f) }
    val dismissDistance = with(LocalDensity.current) { 100.dp.toPx() }
    val closeViewer by rememberUpdatedState(onClose)
    val opacity = (1f - dragOffset / (3 * dismissDistance)).coerceIn(0f, 1f)
    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Box(
                Modifier.matchParentSize()
                    .background(Color.Black.copy(alpha = 0.95f * opacity))
                    .clickable(onClickLabel = "Cerrar visor", onClick = onClose),
            )
            SubcomposeAsyncImage(
                model = url,
                contentDescription = "Foto de perfil de $name",
                contentScale = ContentScale.Fit,
                modifier = Modifier.padding(horizontal = 16.dp).widthIn(max = 600.dp).fillMaxWidth()
                    .heightIn(max = maxHeight * 0.78f)
                    .graphicsLayer {
                        translationY = dragOffset
                        alpha = opacity
                    }
                    .pointerInput(Unit) { detectTapGestures(onTap = {}) }
                    .pointerInput(dismissDistance) {
                        detectVerticalDragGestures(
                            onDragEnd = {
                                if (dragOffset >= dismissDistance) closeViewer() else dragOffset = 0f
                            },
                            onDragCancel = { dragOffset = 0f },
                            onVerticalDrag = { change, distance ->
                                change.consume()
                                dragOffset = (dragOffset + distance).coerceAtLeast(0f)
                            },
                        )
                    },
                loading = {
                    Box(Modifier.height(96.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(32.dp))
                    }
                },
                error = {
                    Box(Modifier.height(96.dp), contentAlignment = Alignment.Center) {
                        Text("No se pudo cargar la foto.", color = Color.White)
                    }
                },
            )
            IconButton(
                onClick = onClose,
                modifier = Modifier.align(Alignment.TopEnd)
                    .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.End))
                    .padding(12.dp).background(Color.White.copy(alpha = 0.16f), CircleShape),
            ) {
                Icon(painterResource(Res.drawable.stats_x), "Cerrar foto", Modifier.size(24.dp), tint = Color.White)
            }
        }
    }
}

@Composable
private fun PublicLevelProgress(user: JsonObject) {
    val level = user.count("level").coerceAtLeast(1)
    val points = user.count("season_points").coerceAtLeast(0)
    val pointsIntoLevel = (points - (level - 1L) * 20).coerceIn(0L, 20L)
    val colors = MaterialTheme.colorScheme
    ProfileCard {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("nivel $level", style = MaterialTheme.typography.labelSmall)
                Text("$points pts", style = MaterialTheme.typography.labelSmall)
            }
            LinearProgressIndicator(
                progress = { pointsIntoLevel / 20f }, modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                color = colors.tertiary, trackColor = colors.primary.copy(alpha = 0.12f),
            )
            Text("prox. nivel a ${20L - pointsIntoLevel} pts", Modifier.align(Alignment.End), style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun PublicMonthlySummary(user: JsonObject) {
    val stats = RankingStats(user.count("monthly_points"), user.count("monthly_correct"), user.count("monthly_predictions"))
    ProfileHeading("mensual")
    ProfileCard {
        Row(Modifier.fillMaxWidth()) {
            ProfileMetric(stats.points.toString(), "pts", Modifier.weight(1f))
            ProfileMetric(stats.correct.toString(), "correctos", Modifier.weight(1f))
            ProfileMetric("${stats.accuracy}%", "prec.", Modifier.weight(1f))
            ProfileMetric(user.count("current_streak").toString(), "racha", Modifier.weight(1f))
        }
    }
}

@Composable
private fun PublicProfileTabs(tab: ProfileTab, onSelect: (ProfileTab) -> Unit) {
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(10.dp)
    Row(Modifier.fillMaxWidth().selectableGroup(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ProfileTab.entries.forEach { option ->
            val selected = tab == option
            Surface(
                Modifier.weight(1f).height(44.dp), shape = shape,
                color = if (selected) colors.tertiary else colors.surface,
                border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
                shadowElevation = 1.dp,
            ) {
                Box(
                    Modifier.selectable(selected = selected, role = Role.Tab, onClick = { onSelect(option) }),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        painterResource(option.icon), option.label, Modifier.size(19.dp),
                        tint = if (selected) Color.White else colors.primary,
                    )
                }
            }
        }
    }
}

@Composable
private fun PublicStatistics(user: JsonObject) {
    ProfileHeading("racha")
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ProfileCard(Modifier.weight(1f)) {
            ProfileDetailRow(Res.drawable.hall_flame, user.count("current_streak").toString(), subtitle = "actual", highlighted = true)
        }
        ProfileCard(Modifier.weight(1f)) {
            ProfileDetailRow(Res.drawable.hall_flame, user.count("best_streak").toString(), subtitle = "mejor", highlighted = true)
        }
    }
    val periods = listOf(
        Triple("", "totales", Res.drawable.huge_notebook_01),
        Triple("season_", "temp.", Res.drawable.huge_football),
        Triple("monthly_", "mensuales", Res.drawable.huge_chart_bar_line),
    )
    listOf("predictions" to "predicciones", "points" to "puntos", "correct" to "aciertos").forEach { (field, label) ->
        Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
            ProfileHeading(label)
            periods.forEach { (prefix, period, icon) ->
                val metric = if (field == "predictions") "pred." else label
                ProfileDetailRow(icon, "$metric $period", user.count(prefix + field).toString())
            }
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
        ProfileHeading("precisión")
        periods.forEach { (prefix, period, icon) ->
            val stats = RankingStats(correct = user.count(prefix + "correct"), predictions = user.count(prefix + "predictions"))
            val label = when (period) {
                "totales" -> "prec. total"
                "mensuales" -> "prec. mensual"
                else -> "prec. temp."
            }
            ProfileDetailRow(icon, label, "${stats.accuracy}%")
        }
    }
}

@Composable
private fun PublicChampionships(
    label: String,
    entries: List<JsonObject>,
    edition: String,
    icon: DrawableResource,
    emptyLabel: String,
) {
    ProfileHeading(label)
    if (entries.isEmpty()) {
        ProfileCard { ProfileDetailRow(icon, "0", subtitle = emptyLabel) }
    }
    entries.forEach { entry ->
        ProfileCard {
            ProfileDetailRow(
                icon, entry.text(edition) ?: "—", subtitle = "${entry.count("points")} pts", highlighted = true,
            )
        }
    }
}

@Composable
private fun ProfileHeading(label: String) {
    Text(label, Modifier.padding(start = 10.dp), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleMedium)
}

@Composable
private fun ProfileCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp),
        color = colors.surface, contentColor = colors.primary,
        shadowElevation = 1.dp, border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
    ) {
        Box(Modifier.padding(horizontal = 8.dp, vertical = 7.dp)) { content() }
    }
}

@Composable
private fun ProfileDetailRow(
    icon: DrawableResource,
    label: String,
    value: String? = null,
    subtitle: String? = null,
    highlighted: Boolean = false,
) {
    val colors = MaterialTheme.colorScheme
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 3.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(9.dp),
    ) {
        Box(
            Modifier.size(if (highlighted) 38.dp else 26.dp)
                .background(
                    if (highlighted) colors.tertiary else colors.primary.copy(alpha = 0.12f),
                    if (highlighted) CircleShape else RoundedCornerShape(5.dp),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(painterResource(icon), null, Modifier.size(if (highlighted) 19.dp else 14.dp), tint = if (highlighted) Color.White else colors.primary)
        }
        Column(Modifier.weight(1f)) {
            Text(
                label, color = colors.primary, fontWeight = FontWeight.Bold,
                style = if (highlighted) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            )
            subtitle?.let { Text(it, color = colors.primary, style = MaterialTheme.typography.bodySmall) }
        }
        value?.let { Text(it, color = colors.primary, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium) }
    }
}

@Composable
internal fun <T : Any> ProfileLoad(
    id: String,
    load: suspend () -> T,
    loading: @Composable () -> Unit = {
        Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    },
    content: @Composable (T) -> Unit,
) {
    var retry by remember(id) { mutableStateOf(0) }
    var result by remember(id, retry) { mutableStateOf<T?>(null) }
    var failed by remember(id, retry) { mutableStateOf(false) }
    LaunchedEffect(id, retry) {
        try {
            result = load()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            failed = true
        }
    }
    val value = result
    when {
        value != null -> content(value)
        failed -> Column(Modifier.padding(12.dp)) {
            Text("No se pudieron cargar estos datos.", color = MaterialTheme.colorScheme.error)
            TextButton(onClick = { retry++ }) { Text("Reintentar") }
        }
        else -> loading()
    }
}

@Composable
private fun ProfileAchievements(user: JsonObject, all: List<JsonObject>) {
    val unlocked = all.filter { achievement ->
        val field = when (val type = achievement.text("requirement_type")) {
            "predictions", "correct", "points", "monthly_championships" -> type
            "streak" -> "best_streak"
            else -> return@filter false
        }
        user.count(field) >= achievement.count("requirement_value")
    }
    val colors = MaterialTheme.colorScheme
    Column(Modifier.fillMaxWidth().padding(horizontal = 10.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text("${unlocked.size}/${all.size}", color = colors.primary, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text("logros desbloqueados", color = colors.primary, style = MaterialTheme.typography.bodySmall)
        if (all.isNotEmpty()) {
            LinearProgressIndicator(
                progress = { unlocked.size.toFloat() / all.size },
                modifier = Modifier.fillMaxWidth().height(4.dp).clip(CircleShape),
                color = colors.tertiary, trackColor = colors.primary.copy(alpha = 0.12f),
            )
        }
    }
    val categories = mapOf(
        "predictions" to ("predicciones" to Res.drawable.huge_target_02),
        "correct" to ("aciertos" to Res.drawable.stats_check),
        "accuracy" to ("aciertos" to Res.drawable.stats_check),
        "streak" to ("rachas" to Res.drawable.hall_flame),
        "points" to ("puntos" to Res.drawable.huge_chart_bar_line),
        "special" to ("especiales" to Res.drawable.stats_star),
    )
    unlocked.groupBy { achievement ->
        val category = achievement.text("category") ?: "special"
        categories[category] ?: (category to Res.drawable.stats_star)
    }.forEach { (group, achievements) ->
        val (label, icon) = group
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            ProfileHeading(label)
            achievements.forEach {
                ProfileDetailRow(icon, it.text("name").orEmpty(), subtitle = it.text("description"))
            }
        }
    }
}

@Composable
private fun ProfileMetric(value: String, label: String, modifier: Modifier = Modifier) {
    val color = MaterialTheme.colorScheme.primary
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = color, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, color = color, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
internal fun ProfileLine(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(label, Modifier.weight(1f))
        Text(value)
    }
}
