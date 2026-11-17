package me.globalscore.app

actual fun getPlatform(): Platform = object : Platform {
    override val name = "Web"
}
