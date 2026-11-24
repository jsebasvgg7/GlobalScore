package me.globalscore.app.ui

import androidx.compose.ui.unit.IntRect
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class TeamCrestTest {
    @Test
    fun trimsUnevenPaddingAndKeepsDetachedDetails() {
        val bounds = visibleCrestBounds(12, 10) { x, y ->
            (x in 3..7 && y in 4..8) || (x == 5 && y == 1)
        }

        assertEquals(IntRect(3, 1, 8, 9), bounds)
    }

    @Test
    fun keepsFullBoundsWhenArtworkReachesTheEdges() {
        assertEquals(IntRect(0, 0, 4, 2), visibleCrestBounds(4, 2) { _, _ -> true })
    }

    @Test
    fun returnsNoBoundsForAnEmptyImage() {
        assertNull(visibleCrestBounds(4, 2) { _, _ -> false })
    }
}
