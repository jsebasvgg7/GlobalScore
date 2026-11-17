package me.globalscore.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp

@Composable
internal fun SkeletonBlock(modifier: Modifier, shape: Shape = RoundedCornerShape(6.dp)) {
    Box(modifier.background(MaterialTheme.colorScheme.primary.copy(alpha = 0.14f), shape))
}
