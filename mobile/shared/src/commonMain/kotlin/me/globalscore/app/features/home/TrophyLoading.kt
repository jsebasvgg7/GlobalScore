package me.globalscore.app.features.home

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.ui.graphics.Color
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import globalscore.shared.generated.resources.Res
import globalscore.shared.generated.resources.huge_champion
import androidx.compose.ui.graphics.ColorFilter
import org.jetbrains.compose.resources.painterResource

@Composable
internal fun TrophyLoading() {
    val animation = rememberInfiniteTransition(label = "Copa de GlobalScore")
    val reveal by animation.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1300, easing = LinearEasing)),
        label = "Revelar copa",
    )
    val trophy = painterResource(Res.drawable.huge_champion)
    val color = Color(0xFF664AF8)
    Box(
        Modifier.fillMaxSize().background(Color.White),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.size(82.dp).semantics { contentDescription = "Cargando GlobalScore" }) {
            val visible = (reveal / 0.76f).coerceIn(0f, 1f)
            clipRect(top = size.height * (1f - visible)) {
                with(trophy) { draw(size, colorFilter = ColorFilter.tint(color)) }
            }
        }
    }
}
