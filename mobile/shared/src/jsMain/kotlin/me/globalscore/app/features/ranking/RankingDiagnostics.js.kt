package me.globalscore.app.features.ranking

internal actual fun logRankingError(message: String) {
    console.warn("GlobalScore Ranking: $message")
}
