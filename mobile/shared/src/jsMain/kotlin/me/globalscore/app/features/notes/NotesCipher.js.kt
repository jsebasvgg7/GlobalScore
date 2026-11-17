package me.globalscore.app.features.notes

import kotlin.js.Promise
import kotlinx.coroutines.await

internal actual suspend fun createNotesCipher(authId: String): NotesCipher {
    val key = deriveBrowserNotesKey(authId, NotesSalt, NotesIterations).await()
    return object : NotesCipher {
        override suspend fun encrypt(text: String): String =
            if (text.isEmpty()) "" else encryptBrowserNote(text, key).await()

        override suspend fun decrypt(text: String): String =
            if (text.isEmpty()) "" else decryptBrowserNote(text, key).await()
    }
}

private fun deriveBrowserNotesKey(authId: String, salt: String, iterations: Int): Promise<dynamic> = js("""
    (function () {
        var encoder = new TextEncoder();
        var subtle = globalThis.crypto.subtle;
        return subtle.importKey('raw', encoder.encode(authId), 'PBKDF2', false, ['deriveKey'])
            .then(function (material) {
                return subtle.deriveKey(
                    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: iterations, hash: 'SHA-256' },
                    material, { name: 'AES-CBC', length: 256 }, false, ['encrypt', 'decrypt']
                );
            });
    })()
""")

private fun encryptBrowserNote(text: String, key: dynamic): Promise<String> = js("""
    (function () {
        var iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
        function encode(bytes) {
            return btoa(Array.from(bytes, function (byte) { return String.fromCharCode(byte); }).join(''));
        }
        return globalThis.crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: iv }, key, new TextEncoder().encode(text)
        ).then(function (encrypted) {
            return encode(iv) + '.' + encode(new Uint8Array(encrypted));
        });
    })()
""")

private fun decryptBrowserNote(text: String, key: dynamic): Promise<String> = js("""
    (function () {
        var pieces = text.split('.');
        if (pieces.length !== 2) throw new Error('Invalid encrypted note');
        function decode(value) {
            return Uint8Array.from(atob(value), function (char) { return char.charCodeAt(0); });
        }
        return globalThis.crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: decode(pieces[0]) }, key, decode(pieces[1])
        ).then(function (decrypted) {
            return new TextDecoder().decode(decrypted);
        });
    })()
""")
