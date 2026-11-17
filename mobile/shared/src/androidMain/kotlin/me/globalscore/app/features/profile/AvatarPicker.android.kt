package me.globalscore.app.features.profile

import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
internal actual fun rememberAvatarPicker(onResult: (Result<AvatarPhoto>) -> Unit): () -> Unit {
    val resolver = LocalContext.current.contentResolver
    val scope = rememberCoroutineScope()
    val result = rememberUpdatedState(onResult)
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            scope.launch {
                val photo = withContext(Dispatchers.IO) {
                    runCatching {
                        val mime = resolver.getType(uri)?.lowercase()
                        val imageType = if (mime == null || mime == "application/octet-stream") {
                            resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                                if (cursor.moveToFirst()) avatarMimeType(cursor.getString(0)?.substringAfterLast('.')) else null
                            }
                        } else mime
                        val bytes = resolver.openInputStream(uri)?.use { input ->
                            val output = java.io.ByteArrayOutputStream()
                            val buffer = ByteArray(8192)
                            while (true) {
                                val size = input.read(buffer)
                                if (size < 0) break
                                require(output.size() + size <= MaxAvatarBytes) { "Selecciona una imagen de hasta 10 MB." }
                                output.write(buffer, 0, size)
                            }
                            output.toByteArray()
                        } ?: error("No se pudo leer la imagen.")
                        avatarPhoto(bytes, imageType)
                    }
                }
                result.value(photo)
            }
        }
    }
    return { picker.launch("image/*") }
}
