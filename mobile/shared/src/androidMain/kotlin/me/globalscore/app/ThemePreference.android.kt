package me.globalscore.app

import androidx.activity.compose.LocalActivity
import androidx.compose.runtime.*
import androidx.core.view.WindowCompat
import androidx.compose.ui.platform.LocalContext

@Composable
internal actual fun rememberThemePreference(): MutableState<Boolean> {
    val context = LocalContext.current.applicationContext
    val preferences = remember(context) { context.getSharedPreferences("globalscore_preferences", 0) }
    val state = remember(preferences) { mutableStateOf(preferences.getBoolean("dark_theme", false)) }
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
