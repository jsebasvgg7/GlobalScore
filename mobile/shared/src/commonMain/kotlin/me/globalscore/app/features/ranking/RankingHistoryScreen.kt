package me.globalscore.app.features.ranking

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_arrow_right_01
import org.jetbrains.compose.resources.painterResource
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import me.globalscore.app.ui.SkeletonBlock

private val monthNames = listOf(
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
)

@Composable
internal fun RankingHistoryScreen(
    modifier: Modifier,
    repository: RankingRepository,
    bottomPadding: Dp,
    onBack: () -> Unit,
) {
    var months by remember(repository) { mutableStateOf<List<ArchivedMonth>?>(null) }
    var failedMonths by remember(repository) { mutableStateOf(false) }
    var retryMonths by remember { mutableStateOf(0) }
    var selection by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(repository, retryMonths) {
        failedMonths = false
        try {
            months = repository.archivedMonths()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            failedMonths = true
        }
    }

    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        val available = months
        val current = available?.firstOrNull { it.key == selection } ?: available?.firstOrNull()
        HistoryHeader(current, available.orEmpty(), onBack) { selection = it.key }
        when {
            failedMonths -> ArchiveError("No se pudo cargar el historial.") { retryMonths++ }
            available == null -> ArchiveSkeleton()
            available.isEmpty() -> Text("Aún no hay rankings mensuales archivados.")
            current != null -> {
                key(current.year) {
                    LazyRow(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(7.dp, Alignment.CenterHorizontally),
                        contentPadding = PaddingValues(vertical = 2.dp),
                    ) {
                        items(available.orEmpty().filter { it.year == current.year }, key = { it.key }) { month ->
                            ArchiveMonthButton(month, current.key == month.key) { selection = month.key }
                        }
                    }
                }
                Text(
                    "${current.participants} participantes",
                    modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                )
                key(current.key) { ArchivedRows(repository, current, bottomPadding) }
            }
        }
    }
}

@Composable
private fun HistoryHeader(
    current: ArchivedMonth?,
    available: List<ArchivedMonth>,
    onBack: () -> Unit,
    onSelect: (ArchivedMonth) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(11.dp)
    val border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.14f))
    val container = colors.primary.copy(alpha = 0.09f)
    var yearsOpen by remember { mutableStateOf(false) }

    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Surface(
            onClick = onBack,
            modifier = Modifier.size(46.dp),
            shape = shape,
            color = container,
            contentColor = colors.primary,
            border = border,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(painterResource(Res.drawable.huge_arrow_right_01), "Volver", Modifier.size(16.dp).rotate(180f))
            }
        }
        Text(
            "Historial\nde rankings",
            modifier = Modifier.weight(1f).padding(horizontal = 6.dp),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = colors.primary,
            textAlign = TextAlign.Center,
        )
        Box(Modifier.size(46.dp)) {
            if (current != null) {
                val yearChoices = available.distinctBy { it.year }
                Surface(
                    onClick = { yearsOpen = true },
                    enabled = yearChoices.size > 1,
                    modifier = Modifier.fillMaxSize().semantics { stateDescription = current.year.toString() },
                    shape = shape,
                    color = container,
                    contentColor = colors.primary,
                    border = border,
                ) {
                    Column(Modifier.fillMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                        Text("año", fontSize = 10.sp, lineHeight = 11.sp, fontWeight = FontWeight.Bold)
                        Text(current.year.toString().takeLast(2), fontSize = 17.sp, lineHeight = 18.sp, fontWeight = FontWeight.Bold)
                    }
                }
                DropdownMenu(expanded = yearsOpen, onDismissRequest = { yearsOpen = false }) {
                    yearChoices.forEach { month ->
                        DropdownMenuItem(
                            text = { Text(month.year.toString()) },
                            onClick = { yearsOpen = false; if (current.year != month.year) onSelect(month) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ArchiveMonthButton(month: ArchivedMonth, active: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        selected = active,
        onClick = onClick,
        shape = RoundedCornerShape(10.dp),
        color = if (active) colors.tertiary else colors.surface,
        contentColor = if (active) colors.onTertiary else colors.primary,
        border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.12f)),
        shadowElevation = 1.dp,
    ) {
        Box(Modifier.sizeIn(minWidth = 44.dp, minHeight = 42.dp).padding(horizontal = 5.dp), contentAlignment = Alignment.Center) {
            Text(monthNames[month.month - 1].take(3), fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ArchivedRows(repository: RankingRepository, month: ArchivedMonth, bottomPadding: Dp) {
    var rows by remember(repository, month) { mutableStateOf<List<RankingEntry>?>(null) }
    var failed by remember(repository, month) { mutableStateOf(false) }
    var retry by remember { mutableStateOf(0) }
    LaunchedEffect(repository, month, retry) {
        failed = false
        try {
            rows = repository.archivedRanking(month)
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            failed = true
        }
    }

    val entries = rows
    when {
        failed -> ArchiveError("No se pudo cargar el ranking de este mes.") { retry++ }
        entries == null -> ArchiveSkeleton()
        entries.isEmpty() -> Text("Este mes no tiene posiciones archivadas.")
        else -> LazyColumn(
            contentPadding = PaddingValues(bottom = bottomPadding),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(entries, key = { it.id }) { RankingRow(it, archived = true) }
        }
    }
}

@Composable
private fun ArchiveError(message: String, retry: () -> Unit) {
    Text(message, color = MaterialTheme.colorScheme.error)
    TextButton(onClick = retry) { Text("Reintentar") }
}

@Composable
private fun ArchiveSkeleton() {
    Column(
        Modifier.fillMaxWidth().semantics { stateDescription = "Cargando ranking" },
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        repeat(3) {
            Row(
                Modifier.fillMaxWidth().height(58.dp).padding(horizontal = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                SkeletonBlock(Modifier.size(42.dp), shape = CircleShape)
                SkeletonBlock(Modifier.weight(1f).height(20.dp))
                SkeletonBlock(Modifier.size(40.dp, 24.dp))
            }
        }
    }
}
