package me.globalscore.app.features.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.HTMLInputElement
import org.w3c.files.FileReader

@Composable
internal actual fun rememberAvatarPicker(onResult: (Result<AvatarPhoto>) -> Unit): () -> Unit {
    val result = rememberUpdatedState(onResult)
    val input = remember {
        (document.createElement("input") as HTMLInputElement).apply {
            type = "file"
            accept = "image/*"
            hidden = true
        }
    }

    DisposableEffect(input) {
        var reader: FileReader? = null
        input.onchange = {
            val file = input.files?.item(0)
            input.value = ""
            if (file != null) {
                reader?.abort()
                val size = file.size.toDouble()
                if (size <= 0.0 || size > MaxAvatarBytes.toDouble()) {
                    result.value(Result.failure(IllegalArgumentException("Selecciona una imagen de hasta 10 MB.")))
                } else {
                    val mimeType = file.type.takeIf { it.isNotBlank() }
                        ?: avatarMimeType(file.name.substringAfterLast('.', ""))
                    val current = FileReader()
                    reader = current
                    current.onload = {
                        result.value(runCatching {
                            val encoded = (current.result as String).substringAfter(',')
                            val bytes = window.atob(encoded)
                            avatarPhoto(ByteArray(bytes.length) { bytes[it].code.toByte() }, mimeType)
                        })
                        Unit
                    }
                    current.onerror = {
                        result.value(Result.failure(IllegalStateException("No se pudo leer la imagen.")))
                        Unit
                    }
                    current.readAsDataURL(file)
                }
            }
            Unit
        }
        document.body?.appendChild(input)

        onDispose {
            input.onchange = null
            reader?.abort()
            input.parentNode?.removeChild(input)
        }
    }

    return remember(input) { { input.click() } }
}
