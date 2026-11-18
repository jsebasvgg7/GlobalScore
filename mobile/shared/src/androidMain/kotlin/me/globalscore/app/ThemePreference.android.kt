package me.globalscore.app

import android.app.UiModeManager
import android.os.Build
import androidx.activity.compose.LocalActivity
import androidx.compose.runtime.*
import androidx.core.view.WindowCompat
import androidx.compose.ui.platform.LocalContext

@Composable
internal actual fun rememberThemePreference(): MutableState<Boolean> {
    val context = LocalContext.current.applicationContext
    val preferences = remember(context) { context.getSharedPreferences("globalscore_preferences", 0) }
    val state = remember(preferences) { mutableStateOf(preferences.getBoolean("dark_theme", false)) }
    val dark = state.value
    LaunchedEffect(context, dark) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.getSystemService(UiModeManager::class.java)?.setApplicationNightMode(
                if (dark) UiModeManager.MODE_NIGHT_YES else UiModeManager.MODE_NIGHT_NO,
            )
        }
    }
    return remember(preferences, state) {
        object : MutableState<Boolean> {
            override var value: Boolean
                get() = state.value
                set(value) {
                    preferences.edit().putBoolean("dark_theme", value).apply()
                    state.value = value
                }
            override fun component1(): Boolean = value
            override fun component2(): (Boolean) -> Unit = { value = it }
        }
    }
}


@Composable
internal actual fun ApplyStatusBarTheme(dark: Boolean) {
    val window = LocalActivity.current?.window ?: return
    SideEffect {
        WindowCompat.getInsetsController(window, window.decorView).isAppearanceLightStatusBars = !dark
    }
}
