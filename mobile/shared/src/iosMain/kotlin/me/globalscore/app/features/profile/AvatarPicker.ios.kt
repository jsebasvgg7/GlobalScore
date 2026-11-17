package me.globalscore.app.features.profile

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.uikit.LocalUIViewController
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import platform.Foundation.NSFileHandle
import platform.Foundation.NSURL
import platform.UIKit.UIDocumentPickerDelegateProtocol
import platform.UIKit.UIDocumentPickerModeImport
import platform.UIKit.UIDocumentPickerViewController
import platform.darwin.NSObject
import platform.posix.memcpy

@OptIn(ExperimentalForeignApi::class)
@Composable
internal actual fun rememberAvatarPicker(onResult: (Result<AvatarPhoto>) -> Unit): () -> Unit {
    val controller = LocalUIViewController.current
    val result = rememberUpdatedState(onResult)
    val delegate = remember {
        object : NSObject(), UIDocumentPickerDelegateProtocol {
            override fun documentPicker(controller: UIDocumentPickerViewController, didPickDocumentsAtURLs: List<*>) {
                val url = didPickDocumentsAtURLs.firstOrNull() as? NSURL ?: return
                result.value(runCatching {
                    val scoped = url.startAccessingSecurityScopedResource()
                    try {
                        val path = url.path ?: error("No se pudo leer la imagen.")
                        val file = NSFileHandle.fileHandleForReadingAtPath(path) ?: error("No se pudo leer la imagen.")
                        val data = try {
                            file.readDataOfLength((MaxAvatarBytes + 1).toULong())
                        } finally {
                            file.closeFile()
                        }
                        require(data.length in 1uL..MaxAvatarBytes.toULong()) { "Selecciona una imagen de hasta 10 MB." }
                        val bytes = ByteArray(data.length.toInt())
                        bytes.usePinned { memcpy(it.addressOf(0), data.bytes, data.length) }
                        avatarPhoto(bytes, avatarMimeType(url.pathExtension))
                    } finally {
                        if (scoped) url.stopAccessingSecurityScopedResource()
                    }
                })
            }
        }
    }
    return {
        val picker = UIDocumentPickerViewController(listOf("public.image"), UIDocumentPickerModeImport)
        picker.delegate = delegate
        controller.presentViewController(picker, animated = true, completion = null)
    }
}
