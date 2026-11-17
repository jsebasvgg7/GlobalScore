package me.globalscore.app.features.profile

import androidx.compose.runtime.Composable

internal const val MaxAvatarBytes = 10 * 1024 * 1024

internal class AvatarPhoto(val bytes: ByteArray, val mimeType: String, val extension: String)

internal fun avatarMimeType(extension: String?): String? = when (extension?.lowercase()) {
    "jpg", "jpeg" -> "image/jpeg"
    "png" -> "image/png"
    "webp" -> "image/webp"
    "gif" -> "image/gif"
    "heic" -> "image/heic"
    "heif" -> "image/heif"
    "avif" -> "image/avif"
    "bmp" -> "image/bmp"
    else -> null
}

internal fun avatarPhoto(bytes: ByteArray, mimeType: String?): AvatarPhoto {
    require(bytes.isNotEmpty() && bytes.size <= MaxAvatarBytes) { "Selecciona una imagen de hasta 10 MB." }
    val extension = when (mimeType) {
        "image/jpeg" -> "jpg"
        "image/png", "image/webp", "image/gif", "image/heic", "image/heif", "image/avif", "image/bmp" ->
            mimeType.substringAfter('/')
        else -> throw IllegalArgumentException("El formato de esta imagen no es compatible.")
    }
    return AvatarPhoto(bytes, checkNotNull(mimeType), extension)
}

@Composable
internal expect fun rememberAvatarPicker(onResult: (Result<AvatarPhoto>) -> Unit): () -> Unit
