package me.globalscore.app.ui

import coil3.Bitmap
import org.jetbrains.skia.IRect

internal actual val supportsCrestTrimming = true

internal actual fun trimCrestBitmap(bitmap: Bitmap): Bitmap {
    val width = bitmap.width
    val height = bitmap.height
    val bounds = visibleCrestBounds(width, height) { x, y ->
        bitmap.getAlphaf(x, y) > 0f
    } ?: return bitmap
    if (bounds.width == width && bounds.height == height) return bitmap

    val cropped = Bitmap()
    val subset = IRect.makeLTRB(bounds.left, bounds.top, bounds.right, bounds.bottom)
    if (bitmap.extractSubset(cropped, subset)) {
        return cropped
    }
    cropped.close()
    return bitmap
}
