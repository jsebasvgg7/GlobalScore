import java.util.Base64
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
}

val webEnv = providers.fileContents(rootProject.layout.projectDirectory.file("../.env")).asText
val publicSupabaseConfig = webEnv.orElse("").map { contents ->
    contents.lineSequence()
        .map { it.split('=', limit = 2) }
        .filter { it.size == 2 && it[0].trim() in setOf("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY") }
        .associate { it[0].trim() to it[1].trim().trim('"', '\'') }
}
val supabaseUrl = providers.environmentVariable("VITE_SUPABASE_URL")
    .orElse(publicSupabaseConfig.map { it["VITE_SUPABASE_URL"].orEmpty() })
val supabaseKey = providers.environmentVariable("VITE_SUPABASE_ANON_KEY")
    .orElse(publicSupabaseConfig.map { it["VITE_SUPABASE_ANON_KEY"].orEmpty() })

abstract class GenerateSupabaseConfig : DefaultTask() {
    @get:Input
    abstract val projectUrl: Property<String>

    @get:Input
    abstract val publicKey: Property<String>

    @get:OutputDirectory
    abstract val outputDirectory: DirectoryProperty

    @TaskAction
    fun generate() {
        val url = projectUrl.get()
        val key = publicKey.get()
        require(url.isEmpty() || url.matches(Regex("https://[A-Za-z0-9.-]+/?"))) {
            "VITE_SUPABASE_URL debe ser una URL HTTPS."
        }
        require(key.isEmpty() || key.matches(Regex("sb_publishable_[A-Za-z0-9_-]+")) ||
            (key.matches(Regex("[A-Za-z0-9_-]+[.][A-Za-z0-9_-]+[.][A-Za-z0-9_-]+")) &&
                Regex(""""role"\s*:\s*"anon"""").containsMatchIn(
                    Base64.getUrlDecoder().decode(key.split('.')[1]).decodeToString()
                ))
        ) {
            "VITE_SUPABASE_ANON_KEY debe ser una clave pública de Supabase."
        }
        outputDirectory.get().file("SupabaseConfig.kt").asFile.apply {
            parentFile.mkdirs()
            writeText(
                """
                package me.globalscore.app.core.supabase

                internal const val SUPABASE_URL = "$url"
                internal const val SUPABASE_PUBLIC_KEY = "$key"
                """.trimIndent()
            )
        }
    }
}

val generateSupabaseConfig by tasks.registering(GenerateSupabaseConfig::class) {
    projectUrl.set(supabaseUrl)
    publicKey.set(supabaseKey)
    outputDirectory.set(layout.buildDirectory.dir("generated/supabase"))
}

kotlin {
    js {
        browser {
            commonWebpackConfig {
                outputFileName = "globalscore-native.js"
            }
        }
        binaries.executable()
    }
    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"
            isStatic = true
        }
    }
    android {
       namespace = "me.globalscore.app.shared"
       compileSdk = libs.versions.android.compileSdk.get().toInt()
       minSdk = libs.versions.android.minSdk.get().toInt()
       compilerOptions {
           jvmTarget = JvmTarget.JVM_11
       }
       androidResources {
           enable = true
       }
       withHostTest {
           isIncludeAndroidResources = true
       }
       withDeviceTestBuilder {
           sourceSetTreeName = "test"
       }.configure {
           instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
    }
    sourceSets {
        commonMain {
            kotlin.srcDir(generateSupabaseConfig)
        }
        jsMain.dependencies {
            implementation(libs.ktor.js)
        }
        iosMain.dependencies {
            implementation(libs.ktor.darwin)
        }
        androidMain.dependencies {
            implementation(libs.ktor.okhttp)
            implementation(libs.androidx.activity.compose)
            implementation(libs.compose.uiToolingPreview)
            implementation(libs.compose.uiTooling)
        }
        commonMain.dependencies {
            implementation(libs.supabase.auth)
            implementation(libs.supabase.postgrest)
            implementation(libs.supabase.storage)
            implementation(libs.datetime)
            implementation(libs.coil.compose)
            implementation(libs.coil.network)
            implementation(libs.coil.svg)
            implementation(libs.compose.runtime)
            implementation(libs.compose.foundation)
            implementation(libs.compose.material3)
            implementation(libs.compose.ui)
            implementation(libs.compose.components.resources)
            implementation(libs.compose.uiToolingPreview)
            implementation(libs.androidx.lifecycle.viewmodelCompose)
            implementation(libs.androidx.lifecycle.runtimeCompose)
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
        getByName("androidDeviceTest").dependencies {
            implementation(libs.androidx.testRunner)
        }
    }
}

dependencies {
    androidRuntimeClasspath(libs.compose.uiTooling)
}