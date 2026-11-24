package me.globalscore.app.ui

import me.globalscore.app.core.supabase.SUPABASE_URL

internal fun resolveLeagueLogoUrl(leagueName: String, darkTheme: Boolean, savedUrl: String?): String? {
    val slug = when (leagueName) {
        "Champions League" -> "champions"
        "Europa League" -> "europa"
        "Conference League" -> "conference"
        else -> return savedUrl
    }
    if (SUPABASE_URL.isBlank()) return savedUrl

    val variant = if (darkTheme) "light" else "dark"
    val storageUrl = SUPABASE_URL.trimEnd('/') + "/storage/v1/object/public/league-logos"
    return "$storageUrl/${slug}_$variant.png"
}
