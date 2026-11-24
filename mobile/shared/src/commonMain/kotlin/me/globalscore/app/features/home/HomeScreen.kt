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
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.graphics.Brush
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
import androidx.compose.ui.unit.TextUnit
import coil3.compose.SubcomposeAsyncImage
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.delay
import kotlin.time.Clock
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
import me.globalscore.app.features.stats.StatsRange
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
import me.globalscore.app.ui.TeamCrest

private val Violet = Color(0xFF664AF8)
private val HomePurpleGradient = Brush.horizontalGradient(listOf(Violet, Color(0xFF4439B6)))
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
    loadingStartedAt: TimeMark,
    pushDestination: String?, onPushOpened: () -> Unit,
    syncPush: (suspend () -> Unit)?,
) {
    val repository = remember(database) { MatchRepository(database) }
    var dashboard by remember(authId) { mutableStateOf<MatchDashboard?>(null) }
    val scope = rememberCoroutineScope()
    val logbookWrites = remember(authId) { Mutex() }
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
    var screen by rememberSaveable(authId) { mutableStateOf("Inicio") }
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
    var statsRangeName by rememberSaveable(authId) { mutableStateOf(StatsRange.Global.name) }
    val statsRepository = remember(database) { StatsRepository(database) }
    val statsUserId = dashboard?.userId
    var statsData by remember(statsRepository, authId, statsUserId) { mutableStateOf<StatsData?>(null) }
    var statsUpdated by remember(statsRepository, authId, statsUserId) { mutableStateOf<TimeMark?>(null) }
    var statsFailed by remember(statsRepository, authId, statsUserId) { mutableStateOf(false) }
    var statsRetry by remember(authId, statsUserId) { mutableIntStateOf(0) }
    val lifecycleState by LocalLifecycleOwner.current.lifecycle.currentStateAsState()
    val preferenceUserId = dashboard?.userId
    var showProbabilities by remember(repository, authId, preferenceUserId) { mutableStateOf<Boolean?>(null) }
    var probabilityPreferenceBusy by remember(repository, authId, preferenceUserId) { mutableStateOf(false) }
    var probabilityPreferenceError by remember(repository, authId, preferenceUserId) { mutableStateOf<String?>(null) }
    fun refreshProbabilityPreference() {
        val userId = preferenceUserId ?: return
        if (probabilityPreferenceBusy) return
        probabilityPreferenceBusy = true
        probabilityPreferenceError = null
        scope.launch {
            try {
                showProbabilities = repository.loadProbabilityPreference(userId)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                probabilityPreferenceError = "No se pudo cargar la preferencia de probabilidades."
            } finally {
                probabilityPreferenceBusy = false
            }
        }
    }
    fun saveProbabilityPreference(show: Boolean) {
        val userId = preferenceUserId ?: return
        val previous = showProbabilities ?: return
        if (probabilityPreferenceBusy || show == previous) return
        probabilityPreferenceBusy = true
        probabilityPreferenceError = null
        showProbabilities = show
        scope.launch {
            try {
                repository.saveProbabilityPreference(userId, show)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                showProbabilities = previous
                probabilityPreferenceError = "No se pudo guardar la preferencia de probabilidades."
            } finally {
                probabilityPreferenceBusy = false
            }
        }
    }
    LaunchedEffect(repository, authId, preferenceUserId, screen, lifecycleState) {
        if (screen == "Partidos" && lifecycleState == Lifecycle.State.RESUMED) {
            refreshProbabilityPreference()
        }
    }
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
    LaunchedEffect(pushDestination) {
        val destination = when (pushDestination) {
            "home" -> "Inicio"
            "matches" -> "Partidos"
            "ranking" -> "Ranking"
            "stats" -> "Estadísticas"
            "leagues" -> "Ligas"
            "awards" -> "Premios"
            null -> return@LaunchedEffect
            else -> "Inicio"
        }
        if (destination == "Partidos") selectedMatch = null
        if (destination == "Ranking") hallOfFame = false
        screen = destination
        onPushOpened()
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
            TrophyLoading(dark, loadingStartedAt)
            return@MaterialTheme
        }
        val density = LocalDensity.current
        val keyboardVisible = WindowInsets.ime.getBottom(density) > 0
        val bottomInset = WindowInsets.safeDrawing.asPaddingValues().calculateBottomPadding()
        val navigationClearance = if (keyboardVisible) 12.dp else 86.dp + bottomInset
        Box(
            Modifier.fillMaxSize().background(palette.background)
                .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal))
                .imePadding(),
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
                            if (page !in listOf("Partidos", "Ligas", "Premios", "Perfil", "Notificaciones", "Historial de rankings", "Mis notas")) {
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
                                            dark = dark,
                                            monthlyRank = rankings?.monthly?.entries?.firstOrNull { it.id == data.userId }?.position,
                                            rankingLoaded = rankings != null,
                                            openMatches = openMatches,
                                            onSection = {
                                                if (it == "Ranking") {
                                                    monthlyRanking = true
                                                    hallOfFame = false
                                                }
                                                if (it == "Puntos") {
                                                    statsRangeName = StatsRange.Month.name
                                                    screen = "Estadísticas"
                                                } else {
                                                    screen = it
                                                }
                                            },
                                        )
                                        else -> MatchesScreen(
                                            modifier = Modifier.fillMaxSize(),
                                            dashboard = data,
                                            selectedMatch = selectedMatch,
                                            onBack = { screen = "Inicio" },
                                            autosave = autosave,
                                            bottomPadding = navigationClearance,
                                            probabilities = showProbabilities == true,
                                            probabilityToggleEnabled = showProbabilities != null && !probabilityPreferenceBusy,
                                            probabilityPreferenceError = probabilityPreferenceError,
                                            onRetryProbabilityPreference = ::refreshProbabilityPreference,
                                            onProbabilityChange = ::saveProbabilityPreference,
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
                                            onProfileSaved = { name, avatar, banner ->
                                                dashboard = dashboard?.copy(name = name, avatar = avatar, banner = banner)
                                            },
                                        )
                                    } else {
                                        StatsScreen(
                                            Modifier.weight(1f), navigationClearance,
                                            statsData, statsFailed, StatsRange.valueOf(statsRangeName),
                                            onRangeChange = { statsRangeName = it.name }, onRetry = { statsRetry++ },
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
                                        LogbookScreen(
                                            database, data.userId, data.avatar, data.banner, navigationClearance,
                                            scope, logbookWrites, dark = dark, onBack = { screen = "Inicio" },
                                        )
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
            if (!keyboardVisible) {
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
    dark: Boolean,
    monthlyRank: Int?,
    rankingLoaded: Boolean,
    openMatches: (String?) -> Unit,
    onSection: (String) -> Unit,
) {
    val matches = data.matches
    val nextMatch = matches.firstOrNull()
    val homeMatches = if (matches.size > 1) matches.drop(1) else matches
    Column(modifier.padding(bottom = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (nextMatch != null) {
            UpcomingMatchBanner(nextMatch) { openMatches(nextMatch.id) }
        } else {
            EmptyUpcomingBanner()
        }
        Tile(Modifier.fillMaxWidth(), onClick = { openMatches(null) }) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                HomeIcon(Res.drawable.huge_target_02, size = 25)
                Text("predicciones", fontWeight = FontWeight.Bold, fontSize = 23.sp)
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
        val featured = homeMatches.firstOrNull()
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val featuredTile = Modifier.weight(1.15f).height(169.dp)
            if (featured == null) {
                GhostMatchTile(featuredTile, featured = true)
            } else {
                Tile(featuredTile, highlighted = true, onClick = { openMatches(featured.id) }) {
                    val prediction = data.predictions[featured.id]
                    Box(Modifier.fillMaxSize()) {
                        Text(
                            featured.league, modifier = Modifier.align(Alignment.TopStart),
                            fontSize = 9.sp, lineHeight = 12.sp, letterSpacing = 0.7.sp,
                            color = LocalContentColor.current.copy(alpha = 0.82f),
                            maxLines = 1, overflow = TextOverflow.Ellipsis,
                        )
                        Row(
                            Modifier.fillMaxWidth().align(Alignment.Center).offset(y = 7.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            FeaturedTeam(featured.home, featured.homeLogo, Modifier.weight(1f))
                            Text(
                                prediction?.let { "${it.home}-${it.away}" } ?: "VS",
                                Modifier.widthIn(max = 48.dp),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold, textAlign = TextAlign.Center,
                                maxLines = 1, overflow = TextOverflow.Ellipsis,
                            )
                            FeaturedTeam(featured.away, featured.awayLogo, Modifier.weight(1f))
                        }
                        Row(
                            Modifier.fillMaxWidth().align(Alignment.BottomCenter).offset(y = 5.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(featured.date, Modifier.weight(1f),
                                fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(featured.time, fontWeight = FontWeight.Bold,
                                fontSize = 9.sp, maxLines = 1)
                        }
                    }
                }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                repeat(2) { index ->
                    val match = homeMatches.getOrNull(index + 1)
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
        val seasonBadgeBackground = if (dark) Color(0xFF684FFF).copy(alpha = 0.10f) else Pale
        Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val rankLabel = monthlyRank?.let { "#$it" } ?: if (rankingLoaded) "Sin puesto" else "—"
            SeasonCard(
                Modifier.weight(1f).fillMaxHeight().heightIn(min = 150.dp), Res.drawable.huge_medal_01,
                "Ranking", rankLabel, "mensual", true, onSection,
                valueFontSize = if (rankingLoaded && monthlyRank == null) 18.sp else 30.sp,
            )
            SeasonCard(
                Modifier.weight(1f).fillMaxHeight().heightIn(min = 150.dp), Res.drawable.huge_folder_01,
                "Puntos", data.monthlyPoints.toString(), "mensual", false, onSection,
                badgeBackground = seasonBadgeBackground,
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            SeasonCard(
                Modifier.weight(1f).heightIn(min = 118.dp), Res.drawable.huge_notebook_01,
                "Libreta", null, "personal", false, onSection,
                badgeBackground = seasonBadgeBackground,
            )
            SeasonCard(
                Modifier.weight(1f).heightIn(min = 118.dp), Res.drawable.season_note,
                "Mis notas", null, "personal", false, onSection,
                badgeBackground = seasonBadgeBackground,
            )
        }
    }
}

@Composable
private fun UpcomingMatchBanner(match: Match, onClick: () -> Unit) {
    MatchBanner(
        Modifier.clickable(onClickLabel = "Ver partido", onClick = onClick)
            .semantics { contentDescription = "Próximo partido: ${match.home} contra ${match.away}" },
    ) {
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(9.dp),
            ) {
                BannerCrest(match.home, match.homeLogo)
                Text("vs", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                BannerCrest(match.away, match.awayLogo)
            }
            Column(Modifier.weight(1f)) {
                Text(
                    "${match.home} vs ${match.away}",
                    fontSize = 15.sp, lineHeight = 18.sp, fontWeight = FontWeight.Bold,
                    maxLines = 2, overflow = TextOverflow.Ellipsis,
                )
                Text(
                    listOf(match.date, match.time).filter(String::isNotBlank).joinToString(" · "),
                    fontSize = 12.sp, lineHeight = 16.sp,
                )
                BannerDeadline(match)
            }
        }
    }
}

@Composable
private fun BannerCrest(name: String, logo: String?) {
    Box(
        Modifier.size(60.dp),
        contentAlignment = Alignment.Center,
    ) {
        TeamCrest(logo, Modifier.size(48.dp)) {
            Text(teamCode(name), fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun BannerDeadline(match: Match) {
    val deadline = remember(match.deadline) { match.deadlineInstant() } ?: return
    var milliseconds by remember(deadline) {
        mutableLongStateOf((deadline - Clock.System.now()).inWholeMilliseconds)
    }
    LaunchedEffect(deadline) {
        while (milliseconds > 0) {
            delay(1_000)
            milliseconds = (deadline - Clock.System.now()).inWholeMilliseconds
        }
    }
    val remaining = (milliseconds.coerceAtLeast(0) + 999) / 1_000
    val label = if (remaining <= 0) {
        "pronósticos cerrados"
    } else {
        val hours = (remaining / 3600).toString().padStart(2, '0')
        val minutes = (remaining / 60 % 60).toString().padStart(2, '0')
        val seconds = (remaining % 60).toString().padStart(2, '0')
        "cierra en $hours:$minutes:$seconds"
    }
    Text(label, fontSize = 12.sp, lineHeight = 16.sp, color = Color.White.copy(alpha = 0.9f))
}

@Composable
private fun EmptyUpcomingBanner() {
    MatchBanner {
        Column(Modifier.padding(top = 6.dp)) {
            Text("sin partidos pendientes", fontSize = 19.sp, lineHeight = 23.sp, fontWeight = FontWeight.Bold)
            Text("temporada al día", fontSize = 13.sp, lineHeight = 17.sp)
        }
    }
}

@Composable
private fun MatchBanner(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Box(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp))
            .background(HomePurpleGradient)
            .then(modifier),
    ) {
        Icon(
            painterResource(Res.drawable.huge_football),
            contentDescription = null,
            modifier = Modifier.align(Alignment.CenterEnd).offset(x = 24.dp).size(124.dp),
            tint = Color.White.copy(alpha = 0.15f),
        )
        CompositionLocalProvider(LocalContentColor provides Color.White) {
            Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                DatePill("próx. partido")
                content()
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
            if (featured) "sin partidos pendientes" else "nuevo partido",
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
    val tileBorder = if (highlighted) Modifier else Modifier.border(
        1.dp, palette.primary.copy(alpha = 0.13f), CardShape,
    )
    val tileBackground = if (highlighted) Modifier.background(HomePurpleGradient) else Modifier
    Surface(
        onClick = onClick,
        modifier = modifier.then(tileBorder),
        shape = CardShape,
        color = if (highlighted) palette.tertiary else palette.surface,
        contentColor = if (highlighted) palette.onTertiary else palette.primary,
        shadowElevation = 1.dp,
    ) {
        Column(tileBackground.padding(if (compact) 9.dp else 14.dp), content = content)
    }
}

@Composable
private fun FeaturedTeam(name: String, logo: String?, modifier: Modifier) {
    val code = teamCode(name)
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(
            Modifier.widthIn(max = 56.dp).fillMaxWidth().aspectRatio(1f),
            contentAlignment = Alignment.Center,
        ) {
            TeamCrest(logo, Modifier.size(44.dp)) {
                Text(code.take(1), fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
        Text(code, modifier = Modifier.offset(y = (-4).dp), fontSize = 10.sp, fontWeight = FontWeight.Bold)
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
        Modifier.background(Color.White.copy(alpha = 0.20f), CircleShape)
            .border(1.dp, Color.White.copy(alpha = 0.38f), CircleShape)
            .padding(horizontal = 11.dp, vertical = 3.dp),
        fontSize = 11.sp, lineHeight = 14.sp, fontWeight = FontWeight.Bold,
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
                    title.replaceFirstChar { it.lowercaseChar() }, fontWeight = FontWeight.Bold, fontSize = 17.sp, lineHeight = 20.sp,
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
    valueFontSize: TextUnit = 30.sp,
    badgeBackground: Color = Color.White.copy(alpha = 0.2f),
) {
    Tile(modifier, highlighted, onClick = { onSection(title) }) {
        Badge(icon, highlighted, background = badgeBackground)
        Text(title.replaceFirstChar { it.lowercaseChar() }, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        if (value != null) {
            Text(value, fontSize = valueFontSize, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.weight(1f))
        }
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
    background: Color,
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
