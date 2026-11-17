package me.globalscore.app

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import kotlinx.browser.document
import org.jetbrains.skiko.wasm.onWasmReady

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    onWasmReady {
        val container = document.getElementById("globalscore-app") ?: return@onWasmReady
        ComposeViewport(container) { App() }
    }
}
