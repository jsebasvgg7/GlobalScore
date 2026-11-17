package me.globalscore.app.features.notes

import android.util.Base64
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.Mac
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal actual suspend fun createNotesCipher(authId: String): NotesCipher = withContext(Dispatchers.Default) {
    val mac = Mac.getInstance("HmacSHA256").apply {
        init(SecretKeySpec(authId.encodeToByteArray(), "HmacSHA256"))
    }
    // A 256-bit key needs exactly one PBKDF2 block with SHA-256.
    var block = mac.doFinal(NotesSalt.encodeToByteArray() + byteArrayOf(0, 0, 0, 1))
    val derived = block.copyOf()
    repeat(NotesIterations - 1) {
        block = mac.doFinal(block)
        for (index in derived.indices) {
            derived[index] = (derived[index].toInt() xor block[index].toInt()).toByte()
        }
    }
    val key = SecretKeySpec(derived, "AES")
    object : NotesCipher {
        override suspend fun encrypt(text: String): String {
            if (text.isEmpty()) return ""
            val iv = ByteArray(16).also { SecureRandom().nextBytes(it) }
            val encrypted = transform(Cipher.ENCRYPT_MODE, iv, text.encodeToByteArray())
            return Base64.encodeToString(iv, Base64.NO_WRAP) + "." + Base64.encodeToString(encrypted, Base64.NO_WRAP)
        }

        override suspend fun decrypt(text: String): String {
            if (text.isEmpty()) return ""
            val pieces = text.split('.')
            require(pieces.size == 2)
            return transform(Cipher.DECRYPT_MODE, Base64.decode(pieces[0], Base64.DEFAULT),
                Base64.decode(pieces[1], Base64.DEFAULT)).decodeToString()
        }

        private fun transform(mode: Int, iv: ByteArray, input: ByteArray): ByteArray =
            Cipher.getInstance("AES/CBC/PKCS5Padding").run {
                init(mode, key, IvParameterSpec(iv))
                doFinal(input)
            }
    }
}
