package me.globalscore.app

import androidx.compose.runtime.*
import platform.Foundation.NSUserDefaults

@Composable
internal actual fun rememberThemePreference(): MutableState<Boolean> {
    val preferences = remember { NSUserDefaults.standardUserDefaults }
    val state = remember(preferences) { mutableStateOf(preferences.boolForKey("dark_theme")) }
    return remember(preferences, state) {
        object : MutableState<Boolean> {
            override var value: Boolean
                get() = state.value
                set(value) {
                    preferences.setBool(value, forKey = "dark_theme")
                    state.value = value
                }
            override fun component1(): Boolean = value
            override fun component2(): (Boolean) -> Unit = { value = it }
        }
    }
}


@Composable
internal actual fun ApplyStatusBarTheme(dark: Boolean) = Unit
