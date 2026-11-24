package me.globalscore.app.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.IntRect
import coil3.Bitmap
import coil3.compose.LocalPlatformContext
import coil3.compose.SubcomposeAsyncImage
import coil3.request.ImageRequest
import coil3.request.transformations
import coil3.size.Size
import coil3.transform.Transformation

@Composable
internal fun TeamCrest(url: String?, modifier: Modifier, fallback: @Composable () -> Unit) {
    if (url.isNullOrBlank()) {
        fallback()
        return
    }

    val context = LocalPlatformContext.current
    val request = remember(context, url) {
        ImageRequest.Builder(context)
            .data(url)
            .apply {
                if (supportsCrestTrimming) {
                    size(192)
                    transformations(TrimTransparentCrest)
                }
            }
            .build()
    }
    SubcomposeAsyncImage(
        model = request,
        contentDescription = null,
        modifier = modifier,
        contentScale = ContentScale.Fit,
        loading = { fallback() },
        error = { fallback() },
    )
}

private object TrimTransparentCrest : Transformation() {
    override val cacheKey = "team-crest-trim-alpha-v1"

    override suspend fun transform(input: Bitmap, size: Size): Bitmap = trimCrestBitmap(input)
}

internal expect val supportsCrestTrimming: Boolean
internal expect fun trimCrestBitmap(bitmap: Bitmap): Bitmap

internal inline fun visibleCrestBounds(width: Int, height: Int, isVisible: (Int, Int) -> Boolean): IntRect? {
    var left = width
    var top = height
    var right = 0
    var bottom = 0
    for (y in 0 until height) {
        for (x in 0 until width) {
            if (isVisible(x, y)) {
                left = minOf(left, x)
                top = minOf(top, y)
                right = maxOf(right, x + 1)
                bottom = y + 1
            }
        }
    }
    return if (left < right && top < bottom) IntRect(left, top, right, bottom) else null
}
