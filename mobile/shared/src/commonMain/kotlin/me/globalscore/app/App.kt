package me.globalscore.app

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import me.globalscore.app.features.auth.AuthScreen

@Composable
internal expect fun rememberThemePreference(): MutableState<Boolean>

@Composable
internal expect fun ApplyStatusBarTheme(dark: Boolean)

class NativePushSupport(
    val settings: @Composable (PushDeviceRegistration, Boolean) -> Unit,
    val showInvitation: @Composable (PushDeviceRegistration) -> Boolean,
    val pause: suspend (PushDeviceRegistration) -> Unit,
    val sync: suspend (PushDeviceRegistration) -> Unit,
)

internal val LocalPushSettings = staticCompositionLocalOf<(@Composable (Boolean) -> Unit)?> { null }
internal val LocalPushInvitation = compositionLocalOf { false }

@Composable
fun App() = AppWithPushSettings(null)

@Composable
fun AppWithPushSettings(
    pushSupport: NativePushSupport?,
    pushDestination: String? = null,
    onPushOpened: () -> Unit = {},
) {
    var dark by rememberThemePreference()
    ApplyStatusBarTheme(dark)
    MaterialTheme {
        AuthScreen(
            dark = dark, onToggleTheme = { dark = !dark }, pushSupport = pushSupport,
            pushDestination = pushDestination, onPushOpened = onPushOpened,
        )
    }
}
