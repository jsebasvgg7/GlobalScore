package me.globalscore.app.features.ranking

import android.util.Log

internal actual fun logRankingError(message: String) {
    Log.e("GlobalScoreRanking", message)
}
