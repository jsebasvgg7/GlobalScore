package me.globalscore.app.ui

import coil3.Bitmap

internal actual val supportsCrestTrimming = true

internal actual fun trimCrestBitmap(bitmap: Bitmap): Bitmap {
    if (!bitmap.hasAlpha()) return bitmap

    val width = bitmap.width
    val height = bitmap.height
    val pixels = IntArray(width * height)
    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
    val bounds = visibleCrestBounds(width, height) { x, y ->
        pixels[y * width + x] ushr 24 != 0
    } ?: return bitmap
    if (bounds.width == width && bounds.height == height) return bitmap

    return Bitmap.createBitmap(bitmap, bounds.left, bounds.top, bounds.width, bounds.height)
}
