package me.globalscore.app.features.auth

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.foundation.text.LocalAutofillHighlightBrush
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.*
import org.jetbrains.compose.resources.Font
import org.jetbrains.compose.resources.painterResource
import io.github.jan.supabase.postgrest.from
import kotlinx.serialization.json.*
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.exception.AuthErrorCode
import io.github.jan.supabase.auth.exception.AuthRestException
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.status.SessionStatus
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.exceptions.HttpRequestException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import me.globalscore.app.LocalPushInvitation
import me.globalscore.app.LocalPushSettings
import me.globalscore.app.NativePushSupport
import me.globalscore.app.PushDeviceRegistration
import me.globalscore.app.core.supabase.SUPABASE_PUBLIC_KEY
import me.globalscore.app.features.home.HomeScreen
import me.globalscore.app.features.home.TrophyLoading
import kotlin.time.TimeSource
import me.globalscore.app.features.profile.LegalDocument
import me.globalscore.app.features.profile.termsSections
import me.globalscore.app.core.supabase.SUPABASE_URL

private val supabase by lazy {
    if (SUPABASE_URL.isBlank() || SUPABASE_PUBLIC_KEY.isBlank()) {
        null
    } else {
        createSupabaseClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY) {
            install(Auth)
            install(Postgrest)
            install(Storage)
        }
    }
}

private const val TermsVersion = "2026-11-16"

private enum class AuthPage { Welcome, Login, Register, Recovery }


@Composable
internal fun AuthScreen(
    dark: Boolean,
    onToggleTheme: () -> Unit,
    pushSupport: NativePushSupport?,
    pushDestination: String?,
    onPushOpened: () -> Unit,
) {
    val database = supabase
    val client = database?.auth
    val status = client?.sessionStatus?.collectAsState()?.value
    val restoringSession = status == SessionStatus.Initializing || status is SessionStatus.Authenticated
    val loadingStartedAt = remember(restoringSession) { TimeSource.Monotonic.markNow() }
    val scope = rememberCoroutineScope()
    val authenticatedScreens = rememberSaveableStateHolder()
    var retainedAccountId by rememberSaveable { mutableStateOf<String?>(null) }
    val authenticatedAccountId = (status as? SessionStatus.Authenticated)?.session?.user?.id
    LaunchedEffect(status, authenticatedAccountId) {
        if (status is SessionStatus.NotAuthenticated || (
                authenticatedAccountId != null && retainedAccountId != authenticatedAccountId
            )
        ) {
            retainedAccountId?.let(authenticatedScreens::removeState)
            retainedAccountId = authenticatedAccountId
        }
    }
    val focus = LocalFocusManager.current
    var page by rememberSaveable { mutableStateOf(AuthPage.Welcome) }
    var email by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("") }
    var adultConfirmed by rememberSaveable { mutableStateOf(false) }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var notice by rememberSaveable { mutableStateOf<String?>(null) }

    fun navigate(destination: AuthPage) {
        page = destination
        adultConfirmed = false
        password = ""
        showPassword = false
        error = null
        notice = null
    }

    fun submit(failureMessage: (Exception) -> String, action: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                action()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (failure: Exception) {
                error = failureMessage(failure)
            } finally {
                busy = false
            }
        }
    }

    if (status is SessionStatus.Authenticated && database != null && client != null) {
        val user = status.session.user
        if (user != null &&
            (user.userMetadata?.get("terms_version") as? JsonPrimitive)?.contentOrNull != TermsVersion
        ) {
            var accepted by remember(user.id) { mutableStateOf(false) }
            AlertDialog(
                onDismissRequest = {},
                title = { Text("Términos y condiciones") },
                text = {
                    Column(Modifier.heightIn(max = 360.dp).verticalScroll(rememberScrollState())) {
                        LegalDocument(termsSections)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(accepted, { accepted = it }, enabled = !busy)
                            Text("Acepto los términos y condiciones")
                        }
                        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    }
                },
                confirmButton = {
                    TextButton(enabled = accepted && !busy, onClick = {
                        submit({ "No se pudo guardar la aceptación. Inténtalo de nuevo." }) {
                            client.updateUser { data { put("terms_version", TermsVersion) } }
                        }
                    }) { Text("Confirmar") }
                },
                dismissButton = {
                    TextButton(enabled = !busy, onClick = {
                        submit({ "No se pudo cerrar la sesión." }) {
                            client.signOut()
                            navigate(AuthPage.Login)
                        }
                    }) { Text("Cerrar sesión") }
                },
            )
            return
        }
        var profileReady by rememberSaveable(user?.id) { mutableStateOf(false) }
        var profileFailed by remember(user?.id) { mutableStateOf(false) }
        var retry by remember(user?.id) { mutableStateOf(0) }
        LaunchedEffect(user?.id, retry) {
            profileFailed = false
            try {
                val account = requireNotNull(user)
                val existing = database.from("users").select {
                    filter { eq("auth_id", account.id) }
                    limit(1)
                }.decodeList<JsonObject>()
                if (existing.isEmpty()) {
                    val metadataName = (account.userMetadata?.get("name") as? JsonPrimitive)?.contentOrNull
                    database.from("users").upsert(buildJsonObject {
                        put("auth_id", account.id)
                        put("email", account.email)
                        put("name", metadataName ?: account.email?.substringBefore('@') ?: "Usuario")
                        for (field in listOf("points", "predictions", "correct", "monthly_points",
                            "monthly_predictions", "monthly_correct", "current_streak", "best_streak",
                            "monthly_championships")) put(field, 0)
                        put("level", 1)
                    }) {
                        onConflict = "auth_id"
                        ignoreDuplicates = true
                    }
                }
                profileReady = true
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                profileFailed = true
            }
        }
        val registration = remember(database, user?.id) {
            user?.id?.let { PushDeviceRegistration(database, it) }
        }
        suspend fun signOut() {
            if (registration != null) pushSupport?.pause?.invoke(registration)
            client.signOut()
            onPushOpened()
            navigate(AuthPage.Login)
        }
        if (profileReady) {
            val settings: (@Composable (Boolean) -> Unit)? = if (registration != null && pushSupport != null) {
                { compact -> pushSupport.settings(registration, compact) }
            } else null
            val showInvitation = if (registration != null && pushSupport != null) {
                pushSupport.showInvitation(registration)
            } else false
            CompositionLocalProvider(
                LocalPushSettings provides settings,
                LocalPushInvitation provides showInvitation,
            ) {
                authenticatedScreens.SaveableStateProvider(user?.id.orEmpty()) {
                    HomeScreen(
                        database = database, authId = user?.id.orEmpty(), signingOut = busy, signOutError = error,
                        dark = dark, onToggleTheme = onToggleTheme,
                        loadingStartedAt = loadingStartedAt,
                        onSignOut = { submit({ "No se pudo cerrar la sesión. Inténtalo de nuevo." }) { signOut() } },
                        pushDestination = pushDestination,
                        onPushOpened = onPushOpened,
                        syncPush = if (registration != null && pushSupport != null) {
                            { pushSupport.sync(registration) }
                        } else null,
                    )
                }
            }
        } else if (profileFailed) {
            Box(Modifier.fillMaxSize().safeContentPadding(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("No se pudo cargar tu perfil.")
                    TextButton(onClick = { retry++ }) { Text("Reintentar") }
                    TextButton(enabled = !busy, onClick = {
                        submit({ "No se pudo cerrar la sesión." }) { signOut() }
                    }) { Text("Cerrar sesión") }
                    error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                }
            }
        } else {
            TrophyLoading(dark, loadingStartedAt)
        }
        return
    }

    if (status is SessionStatus.RefreshFailure && client != null) {
        Box(
            Modifier.fillMaxSize().background(Color.White).safeContentPadding().padding(24.dp),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("No se pudo renovar tu sesión. Comprueba la conexión e inténtalo de nuevo.")
                TextButton(enabled = !busy, onClick = {
                    submit({ "No se pudo recuperar la sesión." }) { client.loadFromStorage() }
                }) { Text("Reintentar") }
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        }
        return
    }

    if (status == SessionStatus.Initializing) {
        TrophyLoading(dark, loadingStartedAt)
        return
    }

    val font = FontFamily(Font(Res.font.elms_regular), Font(Res.font.elms_bold, FontWeight.Bold))
    val typography = Typography().let {
        it.copy(
            bodyLarge = it.bodyLarge.copy(fontFamily = font),
            bodyMedium = it.bodyMedium.copy(fontFamily = font),
            labelLarge = it.labelLarge.copy(fontFamily = font),
            headlineMedium = it.headlineMedium.copy(fontFamily = font, fontWeight = FontWeight.Bold),
            titleLarge = it.titleLarge.copy(fontFamily = font, fontWeight = FontWeight.Bold),
        )
    }
    val palette = if (dark) darkColorScheme(
        primary = Color(0xFFB9AAFF), background = Color(0xFF151024), surface = Color(0xFF201A34),
        onSurface = Color(0xFFEDE7FF), onSurfaceVariant = Color(0xFFD5CAE9), outline = Color(0xFF827496),
    ) else lightColorScheme(
        primary = Color(0xFF664AF8), background = Color.White, surface = Color.White,
        onSurface = Color(0xFF252525), onSurfaceVariant = Color(0xFF636363), outline = Color(0xFFD5D3DA),
    )
    MaterialTheme(colorScheme = palette, typography = typography) {
        Surface(Modifier.fillMaxSize()) {
            Crossfade(page) { current ->
                BoxWithConstraints(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.TopCenter,
                ) {
                    val contentWidth = minOf(maxWidth * 0.79f, 444.dp)
                    if (current == AuthPage.Welcome) {
                        WelcomeScreen(
                            contentWidth = contentWidth,
                            onLogin = { navigate(AuthPage.Login) },
                            onRegister = { navigate(AuthPage.Register) },
                        )
                    } else key(current) {
                        BoxWithConstraints(
                            Modifier.fillMaxSize().safeContentPadding().imePadding(),
                            contentAlignment = Alignment.TopCenter,
                        ) {
                            val viewport = maxHeight
                            val login = current == AuthPage.Login
                            val compactLogin = login && viewport < 650.dp
                            Column(
                                Modifier.padding(horizontal = 8.dp)
                                    .widthIn(max = contentWidth)
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()).heightIn(min = viewport)
                                    .padding(vertical = 8.dp),
                                verticalArrangement = Arrangement.spacedBy(if (compactLogin) 3.dp else 5.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                val register = current == AuthPage.Register
                                val recovery = current == AuthPage.Recovery
                                val locked = busy
                                AuthBrand(Modifier.align(Alignment.Start))
                                if (register || recovery) Spacer(Modifier.weight(1f))
                                else Spacer(Modifier.height(if (compactLogin) 4.dp else 8.dp))
                                AuthHeading(
                                    when {
                                        register -> "Únete a\nGlobalScore"
                                        recovery -> "Recupera tu\ncontraseña"
                                        else -> "Iniciar\nsesión"
                                    },
                                    when {
                                        register -> "REGÍSTRATE GRATIS"
                                        recovery -> "TE ENVIAMOS UN ENLACE DE RECUPERACIÓN"
                                        else -> "ACCEDE A TU CUENTA"
                                    },
                                )
                                if (!register) {
                                    val illustrationHeight = when {
                                        recovery -> 170.dp
                                        compactLogin -> (viewport * 0.23f).coerceIn(72.dp, 150.dp)
                                        else -> (viewport * 0.27f).coerceIn(125.dp, 202.dp)
                                    }
                                    Image(
                                        painterResource(if (recovery) Res.drawable.auth_sobre else Res.drawable.auth_login_illustration),
                                        null, Modifier.fillMaxWidth().height(illustrationHeight),
                                    )
                                }
                                Box(Modifier.fillMaxWidth().height(10.dp), contentAlignment = Alignment.Center) {
                                    HorizontalDivider(color = Color(0xFFF4F2F8))
                                    Spacer(Modifier.size(4.dp).background(Color(0xFFB5A5FF)))
                                }
                                if (register) AuthField(name, { name = it }, "Nombre", "Tu nombre", !locked)
                                AuthField(email, { email = it }, if (recovery) "Correo registrado" else "Correo",
                                    "usuario@gmail.com", !locked, keyboard = KeyboardType.Email)
                                if (!recovery) {
                                    AuthField(password, { password = it }, "Contraseña", "••••••••", !locked,
                                        keyboard = KeyboardType.Password, mask = !showPassword,
                                        trailing = {
                                            IconButton(
                                                onClick = { showPassword = !showPassword },
                                                modifier = Modifier.size(42.dp).semantics {
                                                    contentDescription = if (showPassword) "Ocultar contraseña" else "Mostrar contraseña"
                                                },
                                            ) {
                                                AuthInputIcon("eye", hidden = !showPassword)
                                            }
                                        })
                                }
                                if (register && password.isNotEmpty()) PasswordStrength(password)
                                if (register) {
                                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                        Checkbox(adultConfirmed, { adultConfirmed = it }, enabled = !locked)
                                        Text("Confirmo que tengo 18 años o más")
                                    }
                                }
                                if (current == AuthPage.Login) {
                                    TextButton(
                                        enabled = !locked, onClick = { navigate(AuthPage.Recovery) },
                                        modifier = Modifier.align(Alignment.End),
                                    ) {
                                        Text("¿Olvidaste tu contraseña?")
                                    }
                                }
                                AuthButton(
                                    when {
                                        busy -> "Procesando…"
                                        register -> "Crear cuenta"
                                        recovery -> "Enviar enlace"
                                        else -> "Inicia sesión"
                                    },
                                    enabled = client != null && !locked &&
                                        email.isNotBlank() && (recovery || password.isNotEmpty()) &&
                                        (!register || (adultConfirmed && name.isNotBlank() && password.length >= 6)),
                                    modifier = Modifier.padding(top = if (register) 12.dp else 0.dp),
                                ) {
                                    if (client != null && !busy && current == page) {
                                        notice = null
                                        focus.clearFocus()
                                        val address = email.trim().lowercase()
                                        val secret = password
                                        val displayName = name.trim()
                                        submit(::signInErrorMessage) {
                                            when (current) {
                                                AuthPage.Register -> {
                                                    if (!adultConfirmed) return@submit
                                                    client.signUpWith(Email, redirectUrl = "https://globalscore.me/") {
                                                        this.email = address
                                                        this.password = secret
                                                        data = buildJsonObject {
                                                            put("adult_confirmed", true)
                                                            put("name", displayName)
                                                            put("display_name", displayName)
                                                        }
                                                    }
                                                    navigate(AuthPage.Login)
                                                    notice = "Revisa tu correo para confirmar la cuenta."
                                                }
                                                AuthPage.Recovery -> {
                                                    client.resetPasswordForEmail(
                                                        address, redirectUrl = "https://globalscore.me/reset-password",
                                                    )
                                                    notice = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
                                                }
                                                else -> {
                                                    client.signInWith(Email) {
                                                        this.email = address
                                                        this.password = secret
                                                    }
                                                    password = ""
                                                }
                                            }
                                        }
                                    }
                                }
                                if (client == null) {
                                    Text("Falta configurar el acceso a GlobalScore.", color = palette.error)
                                }
                                notice?.let { Text(it, textAlign = TextAlign.Center) }
                                error?.let { Text(it, color = palette.error, textAlign = TextAlign.Center) }
                                if (register || recovery) Spacer(Modifier.weight(1f))
                                Row(
                                    Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Text(if (register) "¿Ya tienes cuenta?" else if (recovery) "¿La recuerdas?" else "¿Sin cuenta?",
                                        color = palette.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                                    TextButton(
                                        enabled = !busy,
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 8.dp),
                                        onClick = {
                                            navigate(if (current == AuthPage.Login) AuthPage.Register else AuthPage.Login)
                                        },
                                    ) {
                                        Text(if (current == AuthPage.Login) "Regístrate" else "Inicia sesión",
                                            maxLines = 1, softWrap = false,
                                            textDecoration = androidx.compose.ui.text.style.TextDecoration.Underline)
                                    }
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
private fun WelcomeScreen(contentWidth: Dp, onLogin: () -> Unit, onRegister: () -> Unit) {
    val violet = Color(0xFF664AF8)
    val ink = Color(0xFF292929)
    val muted = Color(0xFF626262)
    BoxWithConstraints(
        Modifier.fillMaxSize().background(Color.White).safeContentPadding(),
        contentAlignment = Alignment.TopCenter,
    ) {
        val viewport = maxHeight
        Column(
            Modifier.padding(horizontal = 8.dp).widthIn(max = contentWidth)
                .fillMaxWidth().verticalScroll(rememberScrollState())
                .padding(bottom = 44.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(8.dp))
            Row(
                Modifier.fillMaxWidth().heightIn(min = 28.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("¡Bienvenido!", color = violet, fontSize = 17.sp)
                Icon(painterResource(Res.drawable.huge_champion), null, Modifier.size(27.dp), tint = violet)
            }
            Spacer(Modifier.height(viewport * 0.115f))
            Image(
                painterResource(Res.drawable.auth_welcome_illustration), null,
                Modifier.fillMaxWidth(0.86f).height(viewport * 0.36f),
                contentScale = ContentScale.Fit,
            )
            Spacer(Modifier.height(viewport * 0.11f - 10.dp))
            Text(
                "GlobalScore", style = MaterialTheme.typography.headlineMedium,
                color = ink, fontSize = 32.sp, lineHeight = 38.sp, textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(14.dp))
            Text(
                "Predice tus partidos favoritos,\ncompite y escala en el ranking.",
                color = muted, fontSize = 16.sp, lineHeight = 21.sp, textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(viewport * 0.05f))
            Column(Modifier.fillMaxWidth()) {
                Box(Modifier.fillMaxWidth()) {
                    Surface(
                        onClick = onLogin,
                        modifier = Modifier.fillMaxWidth(),
                        shape = CircleShape,
                        color = violet,
                        contentColor = Color.White,
                        shadowElevation = 2.dp,
                    ) {
                        Box(Modifier.heightIn(min = 44.dp).padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
                            Text("Inicia sesión", fontSize = 16.sp, textAlign = TextAlign.Center)
                        }
                    }
                    Canvas(Modifier.align(Alignment.TopEnd).offset(x = 10.dp, y = (-20).dp).size(23.dp).rotate(23f)) {
                        val w = size.width
                        val h = size.height
                        val crown = Path().apply {
                            moveTo(w * 0.12f, h * 0.66f)
                            lineTo(w * 0.05f, h * 0.19f)
                            lineTo(w * 0.35f, h * 0.43f)
                            lineTo(w * 0.50f, h * 0.08f)
                            lineTo(w * 0.65f, h * 0.43f)
                            lineTo(w * 0.95f, h * 0.19f)
                            lineTo(w * 0.88f, h * 0.66f)
                            close()
                        }
                        drawPath(crown, violet, style = Stroke(1.3.dp.toPx()))
                        drawLine(violet, androidx.compose.ui.geometry.Offset(w * 0.17f, h * 0.82f),
                            androidx.compose.ui.geometry.Offset(w * 0.83f, h * 0.82f), 1.3.dp.toPx())
                    }
                }
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 5.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    HorizontalDivider(Modifier.weight(1f), color = Color(0xFFDCDCDC))
                    Text("ó", color = muted, fontSize = 16.sp)
                    HorizontalDivider(Modifier.weight(1f), color = Color(0xFFDCDCDC))
                }
                Surface(
                    onClick = onRegister,
                    modifier = Modifier.fillMaxWidth(),
                    shape = CircleShape,
                    color = Color.White,
                    contentColor = Color.Black,
                    border = BorderStroke(1.dp, Color(0xFFD5D3DA)),
                    shadowElevation = 2.dp,
                ) {
                    Box(Modifier.heightIn(min = 44.dp).padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
                        Text("Crear cuenta", fontSize = 16.sp, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}

@Composable
private fun AuthBrand(modifier: Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Image(painterResource(Res.drawable.globalscore_brand), null, Modifier.size(30.dp))
        Text("GLOBALSCORE", style = MaterialTheme.typography.titleLarge,
            color = Color.Black, fontSize = 17.sp, lineHeight = 20.sp)
    }
}

@Composable
private fun AuthHeading(title: String, detail: String) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(7.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontSize = 35.sp, lineHeight = 36.sp)
        Text("·  $detail  ·", color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun AuthButton(text: String, enabled: Boolean, modifier: Modifier, onClick: () -> Unit) {
    Button(onClick = onClick, enabled = enabled, modifier = modifier.fillMaxWidth().heightIn(min = 44.dp),
        shape = CircleShape, elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)) {
        Text(text, fontSize = 16.sp)
    }
}

@Composable
private fun AuthField(
    value: String, change: (String) -> Unit, label: String, placeholder: String, enabled: Boolean,
    keyboard: KeyboardType = KeyboardType.Text, mask: Boolean = false,
    trailing: (@Composable () -> Unit)? = null,
) {
    val colors = MaterialTheme.colorScheme
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, color = colors.onSurfaceVariant, fontSize = 16.sp)
        CompositionLocalProvider(LocalAutofillHighlightBrush provides SolidColor(Color.Transparent)) {
            BasicTextField(
                value = value, onValueChange = change, enabled = enabled, singleLine = true,
                modifier = Modifier.fillMaxWidth().semantics { contentDescription = label },
                textStyle = MaterialTheme.typography.bodyLarge.copy(color = colors.onSurface),
                keyboardOptions = KeyboardOptions(keyboardType = keyboard),
                visualTransformation = if (mask) PasswordVisualTransformation() else VisualTransformation.None,
                decorationBox = { input ->
                    Surface(
                        shape = CircleShape, color = Color.White, shadowElevation = 2.dp,
                        border = BorderStroke(1.dp, colors.outline),
                    ) {
                        Row(
                            Modifier.fillMaxWidth().heightIn(min = 44.dp).padding(start = 16.dp, end = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            when (keyboard) {
                                KeyboardType.Email -> AuthInputIcon("mail")
                                KeyboardType.Password -> AuthInputIcon("lock")
                                else -> Icon(painterResource(Res.drawable.huge_user), null,
                                    Modifier.size(20.dp), tint = colors.onSurfaceVariant)
                            }
                            Box(Modifier.weight(1f)) {
                                if (value.isEmpty()) Text(placeholder, color = Color(0xFF767676))
                                input()
                            }
                            trailing?.invoke()
                        }
                    }
                },
            )
        }
    }
}

@Composable
private fun PasswordStrength(password: String) {
    val score = listOf(
        password.length >= 6,
        password.length >= 8,
        password.any(Char::isDigit) && password.any(Char::isLetter),
        password.any { !it.isLetterOrDigit() },
    ).count { it }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        repeat(4) { index ->
            Spacer(Modifier.weight(1f).height(4.dp).background(
                if (index < score) Color(0xFF6DBF65) else Color(0xFFECE9F1), CircleShape,
            ))
        }
    }
    Text("Tus datos están seguros", Modifier.fillMaxWidth(), textAlign = TextAlign.End,
        color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
}

@Composable
private fun AuthInputIcon(kind: String, hidden: Boolean = false) {
    val tint = MaterialTheme.colorScheme.onSurfaceVariant
    Canvas(Modifier.size(20.dp)) {
        val w = size.width
        val h = size.height
        val stroke = Stroke(width = 1.5.dp.toPx())
        when (kind) {
            "mail" -> {
                drawRoundRect(tint, Offset(w * 0.06f, h * 0.17f), Size(w * 0.88f, h * 0.66f),
                    CornerRadius(w * 0.13f), style = stroke)
                drawPath(Path().apply {
                    moveTo(w * 0.10f, h * 0.26f)
                    lineTo(w * 0.50f, h * 0.54f)
                    lineTo(w * 0.90f, h * 0.26f)
                }, tint, style = stroke)
            }
            "lock" -> {
                drawArc(tint, 180f, 180f, false, Offset(w * 0.26f, h * 0.06f),
                    Size(w * 0.48f, h * 0.60f), style = stroke)
                drawRoundRect(tint, Offset(w * 0.16f, h * 0.40f), Size(w * 0.68f, h * 0.50f),
                    CornerRadius(w * 0.12f), style = stroke)
                drawCircle(tint, w * 0.055f, Offset(w * 0.5f, h * 0.65f))
            }
            else -> {
                drawOval(tint, Offset(w * 0.05f, h * 0.24f), Size(w * 0.90f, h * 0.52f), style = stroke)
                drawCircle(tint, w * 0.13f, center, style = stroke)
                if (hidden) drawLine(tint, Offset(w * 0.10f, h * 0.10f), Offset(w * 0.90f, h * 0.90f), stroke.width)
            }
        }
    }
}

private fun signInErrorMessage(failure: Exception): String = when (failure) {
    is HttpRequestException -> "No se pudo conectar con GlobalScore. Revisa tu conexión e inténtalo de nuevo."
    is AuthRestException -> when (failure.errorCode) {
        AuthErrorCode.InvalidCredentials -> "Correo o contraseña incorrectos."
        AuthErrorCode.EmailNotConfirmed -> "Confirma tu correo antes de iniciar sesión."
        AuthErrorCode.CaptchaFailed -> "Supabase Auth todavía requiere CAPTCHA. Contacta con el administrador de GlobalScore."
        AuthErrorCode.OverRequestRateLimit -> "Demasiados intentos. Espera un momento y vuelve a intentarlo."
        else -> "Supabase rechazó la solicitud (${failure.errorCode})."
    }
    else -> "No se pudo completar la solicitud. Inténtalo de nuevo."
}
