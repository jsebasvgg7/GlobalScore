package me.globalscore.app.features.notes

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

// Keep the same PBKDF2 and AES-CBC format as the existing web notes.
internal const val NotesSalt = "GlobalScore_Notes_v1"
internal const val NotesIterations = 100_000

internal expect suspend fun createNotesCipher(authId: String): NotesCipher

internal interface NotesCipher {
    suspend fun encrypt(text: String): String
    suspend fun decrypt(text: String): String
}

private fun JsonObject.noteText(field: String): String =
    (get(field) as? JsonPrimitive)?.contentOrNull.orEmpty()

internal data class Note(
    val id: String? = null,
    val title: String = "",
    val content: String = "",
    val color: String = "purple",
    val pinned: Boolean = false,
    val updatedAt: String = "",
    val readable: Boolean = true,
)

internal class NotesRepository(
    private val database: SupabaseClient,
    private val userId: String,
    private val cipher: NotesCipher,
) {
    suspend fun list(): List<Note> = database.from("notes").select {
        filter { eq("user_id", userId) }
        order("is_pinned", Order.DESCENDING)
        order("updated_at", Order.DESCENDING)
    }.decodeList<JsonObject>().map { row ->
        val note = Note(
            id = row.noteText("id").also { require(it.isNotEmpty()) },
            color = row.noteText("color").ifBlank { "purple" },
            pinned = (row["is_pinned"] as? JsonPrimitive)?.booleanOrNull == true,
            updatedAt = row.noteText("updated_at"),
        )
        try {
            note.copy(title = cipher.decrypt(row.noteText("title_enc")), content = cipher.decrypt(row.noteText("content_enc")))
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            note.copy(title = "Nota ilegible", readable = false)
        }
    }

    suspend fun save(note: Note): Note {
        val title = cipher.encrypt(note.title)
        val content = cipher.encrypt(note.content)
        val fields = buildJsonObject {
            put("title_enc", title)
            put("content_enc", content)
            put("color", note.color)
            put("is_pinned", note.pinned)
            if (note.id == null) put("user_id", userId)
        }
        val table = database.from("notes")
        val response = if (note.id == null) {
            table.insert(fields) { select() }
        } else {
            table.update(fields) {
                filter {
                    eq("user_id", userId)
                    eq("id", note.id)
                }
                select()
            }
        }
        val saved = response.decodeList<JsonObject>().single()
        return note.copy(id = saved.noteText("id").also { require(it.isNotEmpty()) }, updatedAt = saved.noteText("updated_at"))
    }

    suspend fun delete(id: String) {
        database.from("notes").delete {
            filter {
                eq("user_id", userId)
                eq("id", id)
            }
            select()
        }.decodeList<JsonObject>().single()
    }
}
