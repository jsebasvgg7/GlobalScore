package me.globalscore.app.features.notes

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_notebook_01
import globalscore.shared.generated.resources.logbook_trash
import globalscore.shared.generated.resources.profile_save
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import me.globalscore.app.features.profile.AccountProgressHeader

private val noteColors = mapOf(
    "purple" to ("Morado" to Color(0xFF5B4FD8)),
    "green" to ("Verde" to Color(0xFF1D9E75)),
    "gold" to ("Dorado" to Color(0xFFC9A227)),
    "red" to ("Rojo" to Color(0xFFE24B4A)),
    "blue" to ("Azul" to Color(0xFF378ADD)),
    "gray" to ("Gris" to Color(0xFF8186A0)),
)

@Composable
internal fun NotesScreen(
    modifier: Modifier,
    database: SupabaseClient,
    userId: String,
    authId: String,
    bottomPadding: Dp,
    onBack: () -> Unit,
) {
    key(userId, authId) {
        val scope = rememberCoroutineScope()
        var repository by remember { mutableStateOf<NotesRepository?>(null) }
        var notes by remember { mutableStateOf(emptyList<Note>()) }
        var draft by remember { mutableStateOf<Note?>(null) }
        var query by remember { mutableStateOf("") }
        var busy by remember { mutableStateOf(true) }
        var error by remember { mutableStateOf<String?>(null) }
        var retry by remember { mutableIntStateOf(0) }
        var confirmDelete by remember { mutableStateOf(false) }

        LaunchedEffect(retry) {
            busy = true
            error = null
            try {
                val source = repository ?: NotesRepository(database, userId, createNotesCipher(authId))
                notes = source.list()
                repository = source
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                error = "No se pudieron cargar tus notas."
            } finally {
                busy = false
            }
        }

        fun write(message: String, action: suspend (NotesRepository) -> Unit) {
            val source = repository ?: return
            if (busy) return
            busy = true
            error = null
            scope.launch {
                try {
                    action(source)
                    draft = null
                } catch (cancelled: CancellationException) {
                    throw cancelled
                } catch (_: Exception) {
                    error = message
                } finally {
                    busy = false
                }
            }
        }

        Column(modifier.fillMaxWidth()) {
            val editing = draft
            val heading = when {
                editing == null -> "Mis notas"
                editing.id == null -> "Nueva nota"
                else -> "Editar nota"
            }
            AccountProgressHeader(heading) {
                if (!busy || editing == null) {
                    if (editing == null) onBack() else {
                        draft = null
                        error = null
                    }
                }
            }
            if (editing == null) {
                NotesToolbar(notes.size, repository != null && !busy) { draft = Note() }
                OutlinedTextField(
                    value = query, onValueChange = { query = it }, singleLine = true,
                    placeholder = { Text("Buscar en notas…") },
                    textStyle = MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                )
                error?.let {
                    Text(it, color = MaterialTheme.colorScheme.error)
                    TextButton(onClick = { retry++ }) { Text("Reintentar") }
                }
                if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
                val visible = notes.filter { it.title.contains(query, true) || it.content.contains(query, true) }
                LazyColumn(
                    Modifier.weight(1f).fillMaxWidth(),
                    contentPadding = PaddingValues(top = 10.dp, bottom = bottomPadding),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    if (!busy && error == null && visible.isEmpty()) {
                        item { Text(if (query.isBlank()) "Aún no tienes notas." else "No se encontraron notas.") }
                    }
                    val (pinned, others) = visible.partition { it.pinned }
                    for ((label, group) in listOf("Fijadas" to pinned, "Notas" to others)) {
                        if (group.isNotEmpty()) {
                            item {
                                val colors = MaterialTheme.colorScheme
                                Surface(Modifier.fillMaxWidth().padding(top = 6.dp), color = colors.surfaceVariant) {
                                    Text(
                                        label, Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                        color = colors.onSurfaceVariant,
                                        style = MaterialTheme.typography.labelMedium,
                                    )
                                }
                            }
                            items(group, key = { requireNotNull(it.id) }) { note ->
                                NoteRow(note) {
                                    error = null
                                    draft = note
                                }
                            }
                        }
                    }
                }
            } else {
                LazyColumn(
                    Modifier.weight(1f).fillMaxWidth(),
                    contentPadding = PaddingValues(top = 8.dp, bottom = bottomPadding),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    item {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.End),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            if (editing.readable) {
                                NoteColorPicker(editing.color, !busy) { draft = editing.copy(color = it) }
                                OutlinedButton(
                                    enabled = !busy,
                                    onClick = { draft = editing.copy(pinned = !editing.pinned) },
                                    shape = RoundedCornerShape(6.dp),
                                    contentPadding = PaddingValues(horizontal = 9.dp),
                                ) { Text(if (editing.pinned) "Desfijar" else "Fijar") }
                            }
                            if (editing.id != null) {
                                NoteAction(Res.drawable.logbook_trash, "Eliminar", !busy) { confirmDelete = true }
                            }
                            NoteAction(
                                Res.drawable.profile_save, "Guardar",
                                editing.readable && !busy && (editing.title.isNotBlank() || editing.content.isNotBlank()),
                            ) {
                                write("No se pudo guardar la nota. Inténtalo de nuevo.") { source ->
                                    val saved = source.save(editing)
                                    notes = (notes.filterNot { it.id == saved.id } + saved)
                                        .sortedWith(compareByDescending<Note> { it.pinned }.thenByDescending { it.updatedAt })
                                }
                            }
                        }
                        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    }
                    if (!editing.readable) {
                        item { Text("Esta nota no se puede descifrar en este dispositivo.") }
                    } else {
                        item {
                            val colors = MaterialTheme.colorScheme
                            Surface(
                                Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, colors.outlineVariant),
                                color = colors.surface,
                            ) {
                                Column {
                                    Spacer(Modifier.fillMaxWidth().height(4.dp)
                                        .background(noteColors[editing.color]?.second ?: colors.primary))
                                    NoteField(editing.title, "Título", !busy, singleLine = true) {
                                        draft = editing.copy(title = it)
                                    }
                                    HorizontalDivider(color = colors.outlineVariant)
                                    NoteField(editing.content, "Escribe tu nota…", !busy, singleLine = false) {
                                        draft = editing.copy(content = it)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (confirmDelete) {
            AlertDialog(
                onDismissRequest = { confirmDelete = false },
                title = { Text("Eliminar nota") },
                text = { Text("La nota se quitará de GlobalScore en todos tus dispositivos.") },
                confirmButton = {
                    TextButton(onClick = {
                        confirmDelete = false
                        val id = draft?.id ?: return@TextButton
                        write("No se pudo eliminar la nota. Inténtalo de nuevo.") { source ->
                            source.delete(id)
                            notes = notes.filterNot { it.id == id }
                        }
                    }) { Text("Eliminar") }
                },
                dismissButton = {
                    TextButton(onClick = { confirmDelete = false }) { Text("Cancelar") }
                },
            )
        }
    }
}

@Composable
private fun NotesToolbar(count: Int, enabled: Boolean, onCreate: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        color = colors.tertiary,
        contentColor = colors.onTertiary,
    ) {
        Row(
            Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Icon(painterResource(Res.drawable.huge_notebook_01), null, Modifier.size(22.dp))
            Text(
                if (count == 1) "1 nota" else "$count notas",
                Modifier.weight(1f),
                fontFamily = FontFamily.Monospace,
                style = MaterialTheme.typography.labelLarge,
            )
            FilledTonalButton(
                onClick = onCreate,
                enabled = enabled,
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = colors.onTertiary,
                    contentColor = colors.tertiary,
                ),
                contentPadding = PaddingValues(horizontal = 12.dp),
            ) { Text("+ Nueva nota") }
        }
    }
}

@Composable
private fun NoteAction(icon: DrawableResource, description: String, enabled: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        shape = RoundedCornerShape(6.dp),
        border = BorderStroke(1.dp, colors.outlineVariant),
    ) {
        IconButton(onClick = onClick, enabled = enabled, modifier = Modifier.size(44.dp)) {
            Icon(painterResource(icon), description, Modifier.size(20.dp))
        }
    }
}

@Composable
private fun NoteField(value: String, hint: String, enabled: Boolean, singleLine: Boolean, onChange: (String) -> Unit) {
    val colors = MaterialTheme.colorScheme
    val style = if (singleLine) {
        MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
    } else {
        MaterialTheme.typography.bodyMedium.copy(lineHeight = 23.sp)
    }
    BasicTextField(
        value = value,
        onValueChange = onChange,
        enabled = enabled,
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 12,
        textStyle = style.copy(color = colors.onSurface, fontFamily = FontFamily.Monospace),
        cursorBrush = SolidColor(colors.primary),
        modifier = Modifier.fillMaxWidth(),
        decorationBox = { inner ->
            Box(Modifier.fillMaxWidth().padding(14.dp)) {
                if (value.isEmpty()) Text(hint, color = colors.onSurfaceVariant, style = style)
                inner()
            }
        },
    )
}

@Composable
private fun NoteRow(note: Note, onClick: () -> Unit) {
    val accent = noteColors[note.color]?.second ?: MaterialTheme.colorScheme.primary
    Surface(
        Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(6.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Row(Modifier.height(IntrinsicSize.Min)) {
            Box(Modifier.fillMaxHeight().width(3.dp).background(accent))
            Column(Modifier.weight(1f).padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(note.title.ifBlank { "Sin título" }, fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace, color = MaterialTheme.colorScheme.primary,
                    maxLines = 1, overflow = TextOverflow.Ellipsis)
                if (note.content.isNotBlank()) {
                    Text(note.content, style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace, color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

@Composable
private fun NoteColorPicker(color: String, enabled: Boolean, onSelect: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        val accent = noteColors[color]?.second ?: MaterialTheme.colorScheme.primary
        OutlinedButton(
            onClick = { expanded = true },
            enabled = enabled,
            shape = RoundedCornerShape(6.dp),
            contentPadding = PaddingValues(horizontal = 8.dp),
        ) {
            Box(Modifier.size(12.dp).background(accent))
            Spacer(Modifier.width(5.dp))
            Text("Color")
        }
        DropdownMenu(expanded, onDismissRequest = { expanded = false }) {
            noteColors.forEach { (key, option) ->
                DropdownMenuItem(text = { Text(option.first) }, onClick = {
                    expanded = false
                    onSelect(key)
                })
            }
        }
    }
}
