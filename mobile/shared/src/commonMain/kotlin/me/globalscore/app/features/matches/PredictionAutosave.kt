package me.globalscore.app.features.matches

import androidx.compose.runtime.mutableStateMapOf
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

internal data class PredictionDraft(
    val home: Int? = null,
    val away: Int? = null,
    val advancing: String? = null,
) {
    fun complete(): Prediction? = if (home != null && away != null) Prediction(home, away, advancing) else null
}

internal class PredictionAutosave(
    private val scope: CoroutineScope,
    private val save: suspend (Match, Prediction) -> Unit,
) {
    val drafts = mutableStateMapOf<String, PredictionDraft>()
    val pending = mutableStateMapOf<String, Boolean>()
    val errors = mutableStateMapOf<String, Boolean>()
    private val revisions = mutableMapOf<String, Int>()

    fun update(match: Match, draft: PredictionDraft) {
        val id = match.id
        drafts[id] = draft
        errors.remove(id)
        revisions[id] = (revisions[id] ?: 0) + 1
        if (draft.complete() == null || pending[id] == true) return
        pending[id] = true
        scope.launch {
            try {
                while (true) {
                    val revision = revisions[id]
                    delay(600)
                    if (revision != revisions[id]) continue
                    val prediction = drafts[id]?.complete() ?: break
                    try {
                        save(match, prediction)
                        if (revision == revisions[id]) drafts.remove(id)
                    } catch (cancelled: CancellationException) {
                        throw cancelled
                    } catch (_: Exception) {
                        if (revision == revisions[id]) errors[id] = true
                    }
                    if (revision == revisions[id]) break
                }
            } finally {
                pending.remove(id)
            }
        }
    }
}
