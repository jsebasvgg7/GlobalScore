package me.globalscore.app.features.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlin.math.roundToInt
import kotlin.time.TimeSource

@Preview(name = "GlobalScore · carga aislada", widthDp = 390, heightDp = 740)
@Composable
private fun TrophyLoadingPreview() {
    var dark by remember { mutableStateOf(false) }
    var manual by remember { mutableStateOf(false) }
    var frame by remember { mutableIntStateOf(0) }
    val startedAt = remember(manual) { TimeSource.Monotonic.markNow() }

    MaterialTheme {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.weight(1f)) {
                TrophyLoading(
                    dark = dark,
                    loadingStartedAt = startedAt,
                    stillFrame = frame.takeIf { manual },
                )
            }
            Surface {
                Column(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        TextButton(onClick = { manual = !manual }) {
                            Text(if (manual) "Reproducir" else "Por fotograma")
                        }
                        TextButton(onClick = { dark = !dark }) { Text(if (dark) "Oscuro" else "Claro") }
                    }
                    if (manual) {
                        Text("Fotograma ${frame + 1} de $LoadingFrameCount")
                        Slider(
                            value = frame.toFloat(),
                            onValueChange = { frame = it.roundToInt() },
                            valueRange = 0f..(LoadingFrameCount - 1).toFloat(),
                        )
                    }
                }
            }
        }
    }
}
