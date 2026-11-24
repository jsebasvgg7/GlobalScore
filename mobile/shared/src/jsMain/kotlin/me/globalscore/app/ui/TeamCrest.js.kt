package me.globalscore.app.ui

import coil3.Bitmap

internal actual val supportsCrestTrimming = false

internal actual fun trimCrestBitmap(bitmap: Bitmap): Bitmap = bitmap
