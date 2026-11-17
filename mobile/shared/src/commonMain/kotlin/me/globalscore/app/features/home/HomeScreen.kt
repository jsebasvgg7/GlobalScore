package me.globalscore.app.features.home

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.currentStateAsState
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import globalscore.shared.generated.resources.*
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.Font
import org.jetbrains.compose.resources.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.SubcomposeAsyncImage
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlin.time.TimeMark
import kotlin.time.TimeSource
import kotlin.time.Duration.Companion.seconds
import me.globalscore.app.LocalPushInvitation
import me.globalscore.app.features.logbook.LogbookScreen
import me.globalscore.app.features.matches.Match
import me.globalscore.app.features.matches.MatchDashboard
import me.globalscore.app.features.matches.MatchRepository
import me.globalscore.app.features.matches.PredictionAutosave
import me.globalscore.app.features.matches.MatchesScreen
import me.globalscore.app.features.matches.teamCode
import me.globalscore.app.features.predictions.CompetitionKind
import me.globalscore.app.features.predictions.CompetitionScreen
import me.globalscore.app.features.stats.StatsScreen
import me.globalscore.app.features.stats.StatsData
import me.globalscore.app.features.stats.StatsRepository
import me.globalscore.app.features.notes.NotesScreen
import me.globalscore.app.features.profile.AccountProgressHeader
import me.globalscore.app.features.profile.AccountScreen
import me.globalscore.app.features.notifications.NotificationsScreen
import me.globalscore.app.features.ranking.RankingRepository
import me.globalscore.app.features.ranking.RankingScreen
import me.globalscore.app.features.ranking.RankingHistoryScreen
import me.globalscore.app.features.ranking.Rankings
import me.globalscore.app.features.ranking.logRankingError

private val Violet = Color(0xFF664AF8)
private val Pale = Color(0xFFEFEAFF)
private val Ink = Color(0xFFB9AAFF)
private val CardShape = RoundedCornerShape(13.dp)
private val FloatingNavHeight = 58.dp

private val tabs = listOf(
    "Inicio" to Res.drawable.huge_champion,
    "Ranking" to Res.drawable.huge_medal_01,
    "Estadísticas" to Res.drawable.huge_chart_bar_line,
    "Perfil" to Res.drawable.huge_user,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun HomeScreen(
    database: SupabaseClient, authId: String, signingOut: Boolean,
    signOutError: String?, onSignOut: () -> Unit,
    dark: Boolean, onToggleTheme: () -> Unit,
    openMatchesFromPush: Boolean, onPushOpened: () -> Unit,
    syncPush: (suspend () -> Unit)?,
) {
    val repository = remember(database) { MatchRepository(database) }
    var dashboard by remember(authId) { mutableStateOf<MatchDashboard?>(null) }
    val scope = rememberCoroutineScope()
    var predictionWrites by remember(repository, authId) { mutableLongStateOf(0L) }
    val autosave = remember(repository, authId, scope) {
        PredictionAutosave(scope) { match, prediction ->
            val current = checkNotNull(dashboard)
            if (current.predictions[match.id] != prediction) {
                repository.save(current.userId, match, prediction)
                predictionWrites++
                dashboard = dashboard?.let { latest ->
                    latest.copy(predictions = latest.predictions + (match.id to prediction))
                }
            }
        }
    }
    var loadFailed by remember(authId) { mutableStateOf(false) }
    var dashboardLoading by remember(repository, authId) { mutableStateOf(false) }
    var dashboardUpdated by remember(repository, authId) { mutableStateOf<TimeMark?>(null) }
    fun refreshDashboard(force: Boolean = false) {
        if (dashboardLoading || (!force && dashboardUpdated?.elapsedNow()?.let { it < 30.seconds } == true)) return
        dashboardLoading = true
        loadFailed = false
        scope.launch {
            try {
                val writesAtStart = predictionWrites
                val updated = repository.load(authId)
                val latest = dashboard
                // A save that completes during this read is newer than the returned predictions.
                dashboard = if (latest != null && predictionWrites != writesAtStart) {
                    updated.copy(predictions = latest.predictions)
                } else updated
                if (predictionWrites == writesAtStart) dashboardUpdated = TimeSource.Monotonic.markNow()
                else dashboardUpdated = null
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                dashboardUpdated = null
                loadFailed = true
            } finally {
                dashboardLoading = false
            }
        }
    }
    var screen by rememberSaveable { mutableStateOf("Inicio") }
    var profileOrigin by rememberSaveable(authId) { mutableStateOf("Inicio") }
    var notificationsOrigin by rememberSaveable(authId) { mutableStateOf("Inicio") }
    val openProfile: () -> Unit = {
        if (screen != "Perfil") {
            if (screen != "Notificaciones" || notificationsOrigin != "Perfil") profileOrigin = screen
            screen = "Perfil"
        }
    }
    val openNotifications: () -> Unit = {
        if (screen != "Notificaciones") {
            notificationsOrigin = screen
            screen = "Notificaciones"
        }
    }
    val rankingRepository = remember(database) { RankingRepository(database) }
    var rankings by remember(rankingRepository, authId) { mutableStateOf<Rankings?>(null) }
    var rankingFailed by remember(rankingRepository, authId) { mutableStateOf(false) }
    var rankingLoading by remember(rankingRepository, authId) { mutableStateOf(false) }
    var rankingUpdated by remember(rankingRepository, authId) { mutableStateOf<TimeMark?>(null) }
    var monthlyRanking by rememberSaveable(authId) { mutableStateOf(false) }
    var hallOfFame by rememberSaveable(authId) { mutableStateOf(false) }
    fun refreshRanking(force: Boolean = false) {
        if (rankingLoading || (!force && rankingUpdated?.elapsedNow()?.let { it < 30.seconds } == true)) return
        rankingLoading = true
        rankingFailed = false
        scope.launch {
            try {
                rankings = rankingRepository.load()
                rankingUpdated = TimeSource.Monotonic.markNow()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                val detail = error.message.orEmpty().lineSequence().first().take(300)
                logRankingError("Falló la carga del ranking: ${error::class.simpleName}: $detail")
                rankingUpdated = null
                rankingFailed = true
            } finally {
                rankingLoading = false
            }
        }
    }
    val statsRepository = remember(database) { StatsRepository(database) }
    val statsUserId = dashboard?.userId
    var statsData by remember(statsRepository, authId, statsUserId) { mutableStateOf<StatsData?>(null) }
    var statsUpdated by remember(statsRepository, authId, statsUserId) { mutableStateOf<TimeMark?>(null) }
    var statsFailed by remember(statsRepository, authId, statsUserId) { mutableStateOf(false) }
    var statsRetry by remember(authId, statsUserId) { mutableIntStateOf(0) }
    val lifecycleState by LocalLifecycleOwner.current.lifecycle.currentStateAsState()
    LaunchedEffect(repository, authId, screen, lifecycleState, hallOfFame) {
        if (lifecycleState != Lifecycle.State.RESUMED) return@LaunchedEffect
        if (dashboard == null || screen == "Inicio" || screen == "Partidos") refreshDashboard()
        if (screen == "Inicio" || screen == "Perfil" || (screen == "Ranking" && !hallOfFame)) refreshRanking()
    }
    LaunchedEffect(statsRepository, authId, statsUserId, screen, lifecycleState, statsRetry) {
        if (screen != "Estadísticas" || lifecycleState != Lifecycle.State.RESUMED || statsUserId == null) return@LaunchedEffect
        if (statsUpdated?.elapsedNow()?.let { it < 30.seconds } == true) {
            println("GlobalScore Stats: sesión en memoria, sin consulta")
            return@LaunchedEffect
        }
        val started = TimeSource.Monotonic.markNow()
        val firstLoad = statsData == null
        statsFailed = false
        try {
            statsData = statsRepository.load(statsUserId)
            statsUpdated = TimeSource.Monotonic.markNow()
            val mode = if (firstLoad) "primera carga" else "actualización"
            println("GlobalScore Stats: $mode en ${started.elapsedNow().inWholeMilliseconds} ms")
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            statsFailed = true
        }
    }
    var selectedMatch by rememberSaveable { mutableStateOf<String?>(null) }
    LaunchedEffect(openMatchesFromPush) {
        if (openMatchesFromPush) {
            selectedMatch = null
            screen = "Partidos"
            onPushOpened()
        }
    }
    LaunchedEffect(authId, lifecycleState, signingOut) {
        if (!signingOut && lifecycleState == Lifecycle.State.RESUMED) syncPush?.invoke()
    }
    val homeScroll = rememberScrollState()
    val openMatches: (String?) -> Unit = {
        selectedMatch = it
        screen = "Partidos"
    }
    val screenState = rememberSaveableStateHolder()
    val palette = if (dark) darkColorScheme(
        primary = Ink, surface = Color(0xFF201A34), background = Color(0xFF151024),
        onSurface = Color(0xFFEDE7FF), tertiary = Color(0xFF8061DB), onTertiary = Color.White,
    ) else lightColorScheme(primary = Violet, surface = Color.White, background = Color.White, onSurface = Violet, tertiary = Violet, onTertiary = Color.White)

    val font = FontFamily(
        Font(Res.font.elms_regular, FontWeight.Normal),
        Font(Res.font.elms_bold, FontWeight.Bold),
    )
    val defaults = Typography()
    val typography = defaults.copy(
        labelSmall = defaults.labelSmall.copy(fontFamily = font),
        labelMedium = defaults.labelMedium.copy(fontFamily = font),
        bodySmall = defaults.bodySmall.copy(fontFamily = font),
        titleSmall = defaults.titleSmall.copy(fontFamily = font),
        titleMedium = defaults.titleMedium.copy(fontFamily = font),
        titleLarge = defaults.titleLarge.copy(fontFamily = font),
        headlineLarge = defaults.headlineLarge.copy(fontFamily = font),
        displaySmall = defaults.displaySmall.copy(fontFamily = font),
        displayMedium = defaults.displayMedium.copy(fontFamily = font),
        displayLarge = defaults.displayLarge.copy(fontFamily = font),
        bodyLarge = defaults.bodyLarge.copy(fontFamily = font),
        bodyMedium = defaults.bodyMedium.copy(fontFamily = font),
        labelLarge = defaults.labelLarge.copy(fontFamily = font),
        headlineMedium = defaults.headlineMedium.copy(fontFamily = font),
        headlineSmall = defaults.headlineSmall.copy(fontFamily = font),
    )

    MaterialTheme(colorScheme = palette, typography = typography) {
        if (dashboard == null && !loadFailed) {
            TrophyLoading()
            return@MaterialTheme
        }
        val bottomInset = WindowInsets.safeDrawing.asPaddingValues().calculateBottomPadding()
        val navigationClearance = 86.dp + bottomInset
        Box(
            Modifier.fillMaxSize().background(palette.background)
                .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal)),
        ) {
            AnimatedContent(
                targetState = screen,
                modifier = Modifier.fillMaxSize(),
                transitionSpec = {
                    (fadeIn(tween(210)) + slideInHorizontally(tween(240)) { width -> width / 18 })
                        .togetherWith(fadeOut(tween(130)))
                },
                label = "Cambio de pantalla",
            ) { page ->
                screenState.SaveableStateProvider(page) {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
                        Column(Modifier.widthIn(max = 560.dp).fillMaxSize().padding(horizontal = 20.dp)) {
                            val data = dashboard
                            if (page !in listOf("Partidos", "Ligas", "Premios", "Perfil", "Notificaciones", "Historial de rankings", "Libreta", "Mis notas")) {
                                HomeHeader(data?.name ?: "GlobalScore", data?.avatar, dark,
                                    onTheme = onToggleTheme, onNotifications = openNotifications,
                                    onProfile = openProfile)
                            }
                            Spacer(Modifier.height(8.dp))
                            if (data != null && (page == "Inicio" || page == "Partidos") && loadFailed) {
                                Text("No se pudo actualizar. Se muestran los últimos datos.", color = palette.error)
                            }
                            when (page) {
                                "Inicio", "Partidos" -> PullToRefreshBox(
                                    isRefreshing = dashboardLoading || (page == "Inicio" && rankingLoading),
                                    onRefresh = {
                                        refreshDashboard(force = true)
                                        if (page == "Inicio") refreshRanking(force = true)
                                    },
                                    modifier = Modifier.weight(1f).fillMaxWidth(),
                                ) {
                                    when {
                                        loadFailed && data == null -> Column {
                                            Text("No se pudieron cargar los datos de GlobalScore.")
                                            TextButton(onClick = { refreshDashboard(force = true) }) { Text("Reintentar") }
                                        }
                                        data == null -> Unit
                                        page == "Inicio" -> HomeContent(
                                            Modifier.fillMaxSize().verticalScroll(homeScroll).padding(bottom = navigationClearance),
                                            data,
                                            monthlyRank = rankings?.monthly?.entries?.firstOrNull { it.id == data.userId }?.position,
                                            rankingLoaded = rankings != null,
                                            openMatches = openMatches,
                                            onSection = {
                                                if (it == "Ranking") {
                                                    monthlyRanking = true
                                                    hallOfFame = false
                                                }
                                                screen = it
                                            },
                                        )
                                        else -> MatchesScreen(
                                            modifier = Modifier.fillMaxSize(),
                                            dashboard = data,
                                            selectedMatch = selectedMatch,
                                            onBack = { screen = "Inicio" },
                                            autosave = autosave,
                                            bottomPadding = navigationClearance,
                                        )
                                    }
                                }
                                "Ranking" -> PullToRefreshBox(
                                    isRefreshing = !hallOfFame && rankingLoading,
                                    onRefresh = { if (!hallOfFame) refreshRanking(force = true) },
                                    modifier = Modifier.weight(1f).fillMaxWidth(),
                                ) {
                                    RankingScreen(
                                        modifier = Modifier.fillMaxSize(),
                                        table = rankings?.let { if (monthlyRanking) it.monthly else it.global },
                                        monthly = monthlyRanking,
                                        onPeriodChange = {
                                            monthlyRanking = it
                                            hallOfFame = false
                                        },
                                        failed = rankingFailed,
                                        onRetry = { refreshRanking(force = true) },
                                        bottomPadding = navigationClearance,
                                        database = database,
                                        hallOfFame = hallOfFame,
                                        onHallOfFame = { hallOfFame = true },
                                        onOpenHistory = { screen = "Historial de rankings" },
                                    )
                                }
                                "Historial de rankings" -> RankingHistoryScreen(
                                    modifier = Modifier.weight(1f),
                                    repository = rankingRepository,
                                    bottomPadding = navigationClearance,
                                    onBack = { screen = "Ranking" },
                                )
                                "Ligas", "Premios" -> {
                                    if (data != null) {
                                        CompetitionScreen(
                                            database = database,
                                            userId = data.userId,
                                            kind = if (page == "Ligas") CompetitionKind.League else CompetitionKind.Award,
                                            bottomPadding = navigationClearance,
                                            onBack = { screen = "Inicio" },
                                        )
                                    } else {
                                        Text("No se pudieron cargar los datos de GlobalScore.")
                                        TextButton(onClick = { refreshDashboard(force = true) }) { Text("Reintentar") }
                                    }
                                }
                                "Perfil", "Estadísticas" -> {
                                    if (data == null) {
                                        Text(if (page == "Perfil") "No se pudo cargar el perfil de GlobalScore." else "No se pudieron cargar las estadísticas.")
                                        TextButton(onClick = { refreshDashboard(force = true) }) { Text("Reintentar") }
                                        if (page == "Perfil") {
                                            Button(onClick = onSignOut, enabled = !signingOut) { Text("Cerrar sesión") }
                                            signOutError?.let { Text(it, color = palette.error) }
                                        }
                                    } else if (page == "Perfil") {
                                        AccountScreen(
                                            modifier = Modifier.weight(1f),
                                            database = database,
                                            userId = data.userId,
                                            authId = authId,
                                            globalRank = rankings?.global?.entries?.firstOrNull { it.id == data.userId }?.position,
                                            bottomPadding = navigationClearance,
                                            dark = dark,
                                            onTheme = onToggleTheme,
                                            onNotifications = openNotifications,
                                            onExit = { screen = profileOrigin },
                                            signingOut = signingOut,
                                            signOutError = signOutError,
                                            onSignOut = onSignOut,
                                            onProfileSaved = { name, avatar ->
                                                dashboard = dashboard?.copy(name = name, avatar = avatar)
                                            },
                                        )
                                    } else {
                                        StatsScreen(
                                            Modifier.weight(1f), data.userId, navigationClearance,
                                            statsData, statsFailed, onRetry = { statsRetry++ },
                                        ) { screen = it }
                                    }
                                }
                                "Mis notas" -> {
                                    if (data != null) {
                                        NotesScreen(Modifier.weight(1f), database, data.userId, authId, navigationClearance) {
                                            screen = "Inicio"
                                        }
                                    } else {
                                        AccountProgressHeader("Mis notas") { screen = "Inicio" }
                                        Text("No se pudo cargar tu cuenta.")
                                        TextButton(onClick = { refreshDashboard(force = true) }) { Text("Reintentar") }
                                    }
                                }
                                "Libreta" -> {
                                    if (data != null) {
                                        LogbookScreen(database, data.userId, navigationClearance, onBack = { screen = "Inicio" })
                                    } else {
                                        AccountProgressHeader("Mi Libreta Futbolera") { screen = "Inicio" }
                                        Text("No se pudo cargar tu cuenta para abrir la libreta.")
                                        TextButton(onClick = { refreshDashboard(force = true) }) { Text("Reintentar") }
                                    }
                                }
                                "Notificaciones" -> {
                                    NotificationsScreen(
                                        modifier = Modifier.weight(1f),
                                        database = database,
                                        bottomPadding = navigationClearance,
                                        onBack = { screen = notificationsOrigin },
                                        openMatch = { matchId ->
                                            if (data?.matches?.none { it.id == matchId } != false) refreshDashboard(force = true)
                                            openMatches(matchId)
                                        },
                                    )
                                }
                                else -> Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                    Text(page, style = MaterialTheme.typography.headlineMedium, color = palette.primary)
                                    Text("Disponible próximamente.", color = palette.onSurface)
                                    TextButton(onClick = { screen = "Inicio" }) { Text("Volver al inicio") }
                                }
                            }
                        }
                    }
                }
            }
            NavigationBar(
                if (screen == "Historial de rankings") "Ranking" else screen,
                onTab = {
                    if (it == "Perfil") openProfile() else screen = it
                },
                onBall = { openMatches(null) },
                modifier = Modifier.align(Alignment.BottomCenter),
            )
        }
    }
}

@Composable
private fun HomeHeader(
    name: String, avatar: String?, dark: Boolean,
    onTheme: () -> Unit, onNotifications: () -> Unit, onProfile: () -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 7.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(44.dp).shadow(1.dp, CircleShape).clip(CircleShape)
                .background(MaterialTheme.colorScheme.tertiary)
                .clickable(onClickLabel = "Abrir mi perfil", onClick = onProfile)
                .semantics { contentDescription = "Mi perfil" },
            contentAlignment = Alignment.Center,
        ) {
            RemoteImage(avatar, Modifier.fillMaxSize().clip(CircleShape), ContentScale.Crop) {
                Text(name.take(2).uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
        Column(Modifier.weight(1f).padding(start = 10.dp)) {
            Text(name, maxLines = 1, color = MaterialTheme.colorScheme.primary, fontSize = 19.sp, lineHeight = 21.sp, fontWeight = FontWeight.Bold)
            Text("temp. 26/27", color = MaterialTheme.colorScheme.primary, fontSize = 14.sp, lineHeight = 15.sp)
        }
        RoundAction(if (dark) Res.drawable.huge_sun_01 else Res.drawable.hall_moon_filled, "Cambiar tema", raised = true, onClick = onTheme)
        Spacer(Modifier.width(7.dp))
        val showInvitation = LocalPushInvitation.current
        BadgedBox(badge = { if (showInvitation) Badge(containerColor = MaterialTheme.colorScheme.tertiary) }) {
            RoundAction(
                Res.drawable.hall_bell_filled,
                if (showInvitation) "Notificaciones, puedes activar los avisos push" else "Notificaciones",
                raised = true,
                onClick = onNotifications,
            )
        }
    }
}

@Composable
private fun NavigationBar(screen: String, onTab: (String) -> Unit, onBall: () -> Unit, modifier: Modifier) {
    val colors = MaterialTheme.colorScheme
    Row(
        modifier = modifier.widthIn(max = 560.dp).fillMaxWidth()
            .padding(bottom = WindowInsets.safeDrawing.asPaddingValues().calculateBottomPadding())
            .padding(horizontal = 20.dp, vertical = 9.dp),
        horizontalArrangement = Arrangement.spacedBy(7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            Modifier.weight(1f).height(FloatingNavHeight).shadow(3.dp, CircleShape)
                .background(colors.surface, CircleShape)
                .border(1.dp, colors.primary.copy(alpha = 0.13f), CircleShape)
                .padding(horizontal = 3.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            tabs.forEach { (label, icon) ->
                RoundAction(icon, label, selected = screen == label) { onTab(label) }
            }
        }
        RoundAction(Res.drawable.huge_football, "Partidos para predecir", filled = true, onClick = onBall)
    }
}

@Composable
private fun RoundAction(
    glyph: DrawableResource,
    label: String,
    selected: Boolean = false,
    filled: Boolean = false,
    raised: Boolean = false,
    onClick: () -> Unit,
) {
    val background = when {
        filled -> MaterialTheme.colorScheme.tertiary
        else -> MaterialTheme.colorScheme.surface
    }
    Surface(
        onClick = onClick,
        modifier = Modifier.size(if (filled) FloatingNavHeight else 44.dp)
            .semantics { contentDescription = label },
        shape = CircleShape,
        border = if (filled || raised) BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.24f)) else null,
        color = background,
        shadowElevation = if (filled || raised) 3.dp else 0.dp,
    ) {
        Box(
            Modifier.then(if (selected) Modifier.size(36.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), CircleShape) else Modifier),
            contentAlignment = Alignment.Center,
        ) {
            HomeIcon(glyph, if (filled) MaterialTheme.colorScheme.onTertiary else MaterialTheme.colorScheme.primary, if (filled) 30 else 25)

        }
    }
}

@Composable
private fun HomeContent(
    modifier: Modifier,
    data: MatchDashboard,
    monthlyRank: Int?,
    rankingLoaded: Boolean,
    openMatches: (String?) -> Unit,
    onSection: (String) -> Unit,
) {
    val matches = data.matches
    val featured = matches.firstOrNull()
    Column(modifier.padding(bottom = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (featured != null) {
            UpcomingMatchBanner(featured) { openMatches(featured.id) }
        } else {
            EmptyUpcomingBanner()
        }
        Tile(Modifier.fillMaxWidth(), onClick = { openMatches(null) }) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                HomeIcon(Res.drawable.huge_target_02, size = 25)
                Text("Predicciones", fontWeight = FontWeight.Bold, fontSize = 23.sp)
            }
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("${data.predictions.size}/${matches.size}", fontSize = 35.sp, fontWeight = FontWeight.Bold)
                    Text("completadas", fontSize = 16.sp)
                }
                HomeIcon(Res.drawable.huge_arrow_right_01, size = 26)
            }
        }
        SectionTitle("Partidos")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val featuredTile = Modifier.weight(1.15f).height(169.dp)
            if (featured == null) {
                GhostMatchTile(featuredTile, featured = true)
            } else {
                Tile(featuredTile, highlighted = true, onClick = { openMatches(featured.id) }) {
                    val prediction = data.predictions[featured.id]
                    Text(
                        featured.league, fontSize = 12.sp, fontWeight = FontWeight.Bold,
                        maxLines = 1, overflow = TextOverflow.Ellipsis,
                    )
                    Row(
                        Modifier.fillMaxWidth().weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Team(featured.home, featured.homeLogo, compact = true)
                        Text(
                            prediction?.let { "${it.home}-${it.away}" } ?: "VS",
                            Modifier.weight(1f),
                            fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center,
                            maxLines = 1, overflow = TextOverflow.Ellipsis,
                        )
                        Team(featured.away, featured.awayLogo, compact = true)
                    }
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(featured.date, Modifier.weight(1f), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Text(featured.time, fontSize = 10.sp, maxLines = 1)
                    }
                }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                repeat(2) { index ->
                    val match = matches.getOrNull(index + 1)
                    val tile = Modifier.fillMaxWidth().height(81.dp)
                    if (match == null) {
                        GhostMatchTile(tile)
                    } else {
                        Tile(tile, onClick = { openMatches(match.id) }, compact = true) {
                            Column(
                                Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Text(match.league, fontSize = 12.sp, lineHeight = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("${teamCode(match.home)} vs ${teamCode(match.away)}", fontSize = 16.sp, lineHeight = 20.sp, fontWeight = FontWeight.Bold)
                                Text(match.time, fontSize = 11.sp, lineHeight = 14.sp)
                            }
                        }
                    }
                }
            }
        }

        SectionTitle("Más predicciones")
        Shortcut(Res.drawable.huge_champion, "Ligas", "Predice los ganadores de las competiciones", onSection)
        Shortcut(Res.drawable.huge_medal_01, "Premios", "Predice los ganadores de los premios", onSection)

        SectionTitle("Mi temporada")
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val rankLabel = monthlyRank?.let { "#$it" } ?: if (rankingLoaded) "Sin puesto" else "—"
            SeasonCard(Modifier.weight(1f).heightIn(min = 150.dp), Res.drawable.huge_medal_01, "Ranking", rankLabel, "mensual", true, onSection)
            SeasonCard(Modifier.weight(1f).heightIn(min = 150.dp), Res.drawable.huge_folder_01, "Puntos", data.monthlyPoints.toString(), "mensual", false, onSection)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            SeasonCard(Modifier.weight(1f).heightIn(min = 118.dp), Res.drawable.huge_notebook_01, "Libreta", null, "personal", false, onSection)
            SeasonCard(Modifier.weight(1f).heightIn(min = 118.dp), Res.drawable.huge_folder_01, "Mis notas", null, "personal", false, onSection)
        }
    }
}

@Composable
private fun UpcomingMatchBanner(match: Match, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Tile(
        Modifier.fillMaxWidth().semantics { contentDescription = "Próximo partido: ${match.home} contra ${match.away}" },
        highlighted = true,
        onClick = onClick,
    ) {
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Próximo partido", Modifier.weight(1f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                HomeIcon(Res.drawable.home_calendar, size = 13)
                Text(match.date, fontSize = 11.sp, maxLines = 1)
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                Team(match.home, match.homeLogo, featured = true)
            }
            Column(Modifier.weight(2f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("VS", fontSize = 10.sp, lineHeight = 12.sp, color = colors.onTertiary.copy(alpha = 0.82f))
                Text(match.time, fontSize = 28.sp, lineHeight = 32.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(
                    match.league,
                    Modifier.offset(y = 4.dp)
                        .border(1.dp, colors.onTertiary.copy(alpha = 0.7f), CircleShape).padding(horizontal = 7.dp),
                    fontSize = 10.sp, lineHeight = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
            }
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                Team(match.away, match.awayLogo, featured = true)
            }
        }
        Spacer(Modifier.height(12.dp))
        Box(Modifier.fillMaxWidth()) {
            Box(Modifier.align(Alignment.CenterStart)) {
                HomeIcon(Res.drawable.huge_champion, tint = Color.White, size = 16)
            }
            Text(
                "›", Modifier.align(Alignment.CenterEnd)
                    .background(colors.onTertiary, RoundedCornerShape(6.dp)).widthIn(min = 26.dp),
                color = colors.tertiary, fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun EmptyUpcomingBanner() {
    val colors = MaterialTheme.colorScheme
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = CardShape,
        color = colors.tertiary,
        contentColor = colors.onTertiary,
        shadowElevation = 1.dp,
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            DatePill("Próx. partido")
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                HomeIcon(Res.drawable.huge_football, size = 30)
                Column(Modifier.weight(1f)) {
                    Text("Sin partidos pendientes", fontSize = 19.sp, fontWeight = FontWeight.Bold)
                    Text("Temporada al día", fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
private fun GhostMatchTile(modifier: Modifier, featured: Boolean = false) {
    val colors = MaterialTheme.colorScheme
    val outline = colors.primary.copy(alpha = 0.35f)
    Column(
        modifier.background(colors.primary.copy(alpha = 0.04f), CardShape)
            .drawBehind {
                val strokeWidth = 1.dp.toPx()
                drawRoundRect(
                    color = outline,
                    topLeft = Offset(strokeWidth / 2, strokeWidth / 2),
                    size = Size(size.width - strokeWidth, size.height - strokeWidth),
                    cornerRadius = CornerRadius(13.dp.toPx()),
                    style = Stroke(
                        width = strokeWidth,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(5.dp.toPx(), 4.dp.toPx())),
                    ),
                )
            }
            .padding(if (featured) 14.dp else 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp, Alignment.CenterVertically),
    ) {
        if (featured) HomeIcon(Res.drawable.huge_football, tint = colors.primary, size = 25)
        Text(
            if (featured) "Sin partidos pendientes" else "Nuevo partido",
            color = colors.primary,
            fontWeight = FontWeight.Bold,
            fontSize = if (featured) 16.sp else 13.sp,
            lineHeight = if (featured) 19.sp else 15.sp,
            textAlign = TextAlign.Center,
        )
        Text(
            if (featured) "Temporada al día" else "Aún sin confirmar",
            color = colors.primary,
            fontSize = 11.sp,
            lineHeight = 13.sp,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun Tile(
    modifier: Modifier,
    highlighted: Boolean = false,
    compact: Boolean = false,
    onClick: () -> Unit,
    content: @Composable ColumnScope.() -> Unit,
) {
    val palette = MaterialTheme.colorScheme
    Surface(
        onClick = onClick,
        modifier = modifier.border(1.dp, if (highlighted) palette.tertiary else palette.primary.copy(alpha = 0.13f), CardShape),
        shape = CardShape,
        color = if (highlighted) palette.tertiary else palette.surface,
        contentColor = if (highlighted) palette.onTertiary else palette.primary,
        shadowElevation = 1.dp,
    ) {
        Column(Modifier.padding(if (compact) 9.dp else 14.dp), content = content)
    }
}

@Composable
private fun Team(name: String, logo: String?, compact: Boolean = false, featured: Boolean = false) {
    val code = teamCode(name)
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.size(if (compact) 38.dp else 48.dp).background(Color.White.copy(alpha = 0.18f), CircleShape)
                .then(if (featured) Modifier.border(1.dp, Color.White, CircleShape) else Modifier),
            contentAlignment = Alignment.Center,
        ) {
            RemoteImage(logo, Modifier.fillMaxSize().padding(3.dp)) {
                Text(code.take(1), fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
        Text(code, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
internal fun RemoteImage(
    url: String?, modifier: Modifier, scale: ContentScale = ContentScale.Fit,
    fallback: @Composable () -> Unit = {},
) {
    if (!url.isNullOrBlank()) {
        SubcomposeAsyncImage(
            model = url, contentDescription = null, modifier = modifier, contentScale = scale,
            loading = { fallback() }, error = { fallback() },
        )
    } else {
        fallback()
    }
}

@Composable
private fun DatePill(date: String) {
    Text(
        date,
        Modifier.border(1.dp, Color.White.copy(alpha = 0.7f), CircleShape).padding(horizontal = 8.dp),
        fontSize = 11.sp,
    )
}

@Composable
private fun SectionTitle(text: String) {
    Text(text, Modifier.padding(start = 9.dp, top = 6.dp), color = MaterialTheme.colorScheme.primary, fontSize = 18.sp)
}

@Composable
private fun Shortcut(icon: DrawableResource, title: String, detail: String, onSection: (String) -> Unit) {
    val palette = MaterialTheme.colorScheme
    Surface(
        onClick = { onSection(title) },
        modifier = Modifier.fillMaxWidth(),
        shape = CardShape,
        color = palette.surface,
        contentColor = palette.primary,
        border = BorderStroke(1.dp, palette.primary.copy(alpha = 0.13f)),
        shadowElevation = 1.dp,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Badge(icon, highlighted = true, background = MaterialTheme.colorScheme.tertiary)
            Column(Modifier.weight(1f)) {
                Text(
                    title, fontWeight = FontWeight.Bold, fontSize = 17.sp, lineHeight = 20.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
                Text(
                    detail, fontSize = 12.sp, lineHeight = 15.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                )
            }
            HomeIcon(Res.drawable.huge_arrow_right_01, size = 19)
        }
    }
}

@Composable
private fun SeasonCard(
    modifier: Modifier, icon: DrawableResource, title: String, value: String?, subtitle: String,
    highlighted: Boolean, onSection: (String) -> Unit,
) {
    Tile(modifier, highlighted, onClick = { onSection(title) }) {
        Badge(icon, highlighted)
        Text(title, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        if (value != null) Text(value, fontSize = 30.sp, fontWeight = FontWeight.Bold)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(subtitle, fontSize = 13.sp)
            HomeIcon(Res.drawable.huge_arrow_right_01, size = 16)
        }
    }
}

@Composable
private fun Badge(
    glyph: DrawableResource,
    highlighted: Boolean,
    background: Color = if (highlighted) Color.White.copy(alpha = 0.2f) else Pale,
) {
    Box(
        Modifier.size(37.dp).background(background, CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        HomeIcon(glyph, if (highlighted) MaterialTheme.colorScheme.onTertiary else MaterialTheme.colorScheme.primary, 22)
    }
}

@Composable
private fun HomeIcon(resource: DrawableResource, tint: Color = LocalContentColor.current, size: Int) {
    Icon(
        painter = painterResource(resource),
        contentDescription = null,
        modifier = Modifier.size(size.dp),
        tint = tint,
    )
}
