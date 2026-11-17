package me.globalscore.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import kotlinx.browser.document
import kotlinx.browser.window

private const val DarkThemeKey = "globalscore.native.dark_theme"

@Composable
internal actual fun rememberThemePreference(): MutableState<Boolean> {
    val state = remember {
        mutableStateOf(runCatching { window.localStorage.getItem(DarkThemeKey) == "true" }.getOrDefault(false))
    }
    val dark = state.value
    LaunchedEffect(dark) {
        runCatching { window.localStorage.setItem(DarkThemeKey, dark.toString()) }
    }
    return state
}

@Composable
internal actual fun ApplyStatusBarTheme(dark: Boolean) {
    SideEffect {
        document.documentElement?.setAttribute("data-theme", if (dark) "dark" else "light")
        document.querySelector("meta[name=theme-color]")
            ?.setAttribute("content", if (dark) "#141323" else "#ffffff")
    }
}
