package me.globalscore.app.features.home

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.loading_objects
import globalscore.shared.generated.resources.loading_objects_dark
import org.jetbrains.compose.resources.imageResource
import kotlin.math.roundToInt
import kotlin.time.TimeMark

private const val FrameSize = 128
private const val AtlasColumns = 8
private const val FramesPerObject = 24
internal const val LoadingFrameCount = FramesPerObject * 4
private const val CycleMillis = 4_800

@Composable
internal fun TrophyLoading(
    dark: Boolean,
    loadingStartedAt: TimeMark,
    stillFrame: Int? = null,
) {
    val framePosition = if (stillFrame == null) loadingFramePosition() else null
    val initialFrame = remember(loadingStartedAt) {
        val elapsedMillis = loadingStartedAt.elapsedNow().inWholeMilliseconds % CycleMillis
        elapsedMillis * LoadingFrameCount / CycleMillis
    }
    val atlas = imageResource(if (dark) Res.drawable.loading_objects_dark else Res.drawable.loading_objects)

    val color = if (dark) Color(0xFFB9AAFF) else Color(0xFF664AF8)
    val background = if (dark) Color(0xFF151024) else Color.White
    Box(
        Modifier.fillMaxSize().background(background).padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.semantics(mergeDescendants = true) {
                progressBarRangeInfo = ProgressBarRangeInfo.Indeterminate
            },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Canvas(Modifier.size(104.dp)) {
                val frame = stillFrame?.coerceIn(0, LoadingFrameCount - 1)
                    ?: ((initialFrame + checkNotNull(framePosition).value.toInt()) % LoadingFrameCount).toInt()
                val objectFrame = frame % FramesPerObject
                val edge = minOf(objectFrame, FramesPerObject - 1 - objectFrame)
                drawImage(
                    image = atlas,
                    srcOffset = IntOffset(frame % AtlasColumns * FrameSize, frame / AtlasColumns * FrameSize),
                    srcSize = IntSize(FrameSize, FrameSize),
                    dstSize = IntSize(size.width.roundToInt(), size.height.roundToInt()),
                    alpha = 0.3f + 0.7f * (edge / 3f).coerceAtMost(1f),
                )
            }
            Text(
                "Cargando GlobalScore…",
                color = color,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun loadingFramePosition(): State<Float> {
    val animation = rememberInfiniteTransition(label = "Objetos de GlobalScore")
    return animation.animateFloat(
        initialValue = 0f,
        targetValue = LoadingFrameCount.toFloat(),
        animationSpec = infiniteRepeatable(tween(CycleMillis, easing = LinearEasing)),
        label = "Giro de los objetos",
    )
}
