@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class, ExperimentalUnsignedTypes::class)

package me.globalscore.app.features.notes

import kotlin.io.encoding.Base64
import kotlinx.cinterop.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import platform.CoreCrypto.*
import platform.Security.SecRandomCopyBytes
import platform.Security.kSecRandomDefault

internal actual suspend fun createNotesCipher(authId: String): NotesCipher = withContext(Dispatchers.Default) {
    val salt = NotesSalt.encodeToByteArray().asUByteArray()
    val key = UByteArray(32)
    val status = salt.usePinned { saltPin ->
        key.usePinned { keyPin ->
            CCKeyDerivationPBKDF(
                kCCPBKDF2, authId, authId.encodeToByteArray().size.toULong(),
                saltPin.addressOf(0), salt.size.toULong(), kCCPRFHmacAlgSHA256,
                NotesIterations.toUInt(), keyPin.addressOf(0), key.size.toULong(),
            )
        }
    }
    check(status == kCCSuccess)
    object : NotesCipher {
        override suspend fun encrypt(text: String): String {
            if (text.isEmpty()) return ""
            val iv = ByteArray(16)
            check(iv.usePinned { SecRandomCopyBytes(kSecRandomDefault, iv.size.toULong(), it.addressOf(0)) } == 0)
            val encrypted = transform(kCCEncrypt, iv, text.encodeToByteArray())
            return Base64.encode(iv) + "." + Base64.encode(encrypted)
        }

        override suspend fun decrypt(text: String): String {
            if (text.isEmpty()) return ""
            val pieces = text.split('.')
            require(pieces.size == 2)
            return transform(kCCDecrypt, Base64.decode(pieces[0]), Base64.decode(pieces[1])).decodeToString()
        }

        private fun transform(operation: UInt, iv: ByteArray, input: ByteArray): ByteArray = memScoped {
            require(iv.size == 16 && input.isNotEmpty())
            val output = ByteArray(input.size + 16)
            val written = alloc<ULongVar>()
            val result = key.usePinned { keyPin ->
                iv.usePinned { ivPin ->
                    input.usePinned { inputPin ->
                        output.usePinned { outputPin ->
                            CCCrypt(
                                operation, kCCAlgorithmAES, kCCOptionPKCS7Padding,
                                keyPin.addressOf(0), key.size.toULong(), ivPin.addressOf(0),
                                inputPin.addressOf(0), input.size.toULong(),
                                outputPin.addressOf(0), output.size.toULong(), written.ptr,
                            )
                        }
                    }
                }
            }
            check(result == kCCSuccess)
            output.copyOf(written.value.toInt())
        }
    }
}
