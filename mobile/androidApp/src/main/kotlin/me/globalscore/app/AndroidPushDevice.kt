package me.globalscore.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.produceState
import com.google.firebase.messaging.FirebaseMessaging
import java.io.File
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

internal class AndroidPushDevice(context: Context) {
    private val app = context.applicationContext
    private val settings = app.getSharedPreferences("globalscore_push_preferences", Context.MODE_PRIVATE)
    private val manager = app.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val channelId = app.getString(R.string.push_channel_id)
    private val installationId by lazy {
        val file = File(app.noBackupFilesDir, "push-installation-id")
        if (file.exists()) file.readText() else UUID.randomUUID().toString().also(file::writeText)
    }
    private val lock = Mutex()

    private fun requested(device: PushDeviceRegistration) = "requested:$installationId:${device.authUserId}"
    private fun registered(device: PushDeviceRegistration) = "registered:$installationId:${device.authUserId}"

    @Composable
    fun registeredState(device: PushDeviceRegistration): Boolean = preference(registered(device))

    @Composable
    fun wantsNotifications(device: PushDeviceRegistration): Boolean = preference(requested(device))

    @Composable
    private fun preference(preferenceKey: String): Boolean = key(preferenceKey) {
        produceState(settings.getBoolean(preferenceKey, false)) {
            val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, changed ->
                if (changed == preferenceKey) value = settings.getBoolean(preferenceKey, false)
            }
            settings.registerOnSharedPreferenceChangeListener(listener)
            value = settings.getBoolean(preferenceKey, false)
            awaitDispose { settings.unregisterOnSharedPreferenceChangeListener(listener) }
        }.value
    }

    fun allowed(): Boolean = manager.areNotificationsEnabled() &&
        (Build.VERSION.SDK_INT < 26 || manager.getNotificationChannel(channelId)?.importance != NotificationManager.IMPORTANCE_NONE)

    suspend fun activate(device: PushDeviceRegistration): Unit = lock.withLock {
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(
                NotificationChannel(channelId, app.getString(R.string.push_channel_name), NotificationManager.IMPORTANCE_DEFAULT),
            )
        }
        check(allowed())
        val token = token()
        settings.edit().putBoolean(requested(device), true).apply()
        device.register(installationId, token)
        settings.edit().putBoolean(registered(device), true).remove("activated").apply()
    }

    suspend fun pause(device: PushDeviceRegistration) = disconnect(device, keepPreference = true)

    suspend fun disable(device: PushDeviceRegistration) = disconnect(device, keepPreference = false)

    private suspend fun disconnect(device: PushDeviceRegistration, keepPreference: Boolean): Unit = lock.withLock {
        if (settings.getBoolean(requested(device), false)) {
            device.unregister(installationId)
            val edit = settings.edit().remove(registered(device))
            if (!keepPreference) edit.remove(requested(device))
            edit.apply()
        }
    }

    suspend fun sync(device: PushDeviceRegistration) {
        try {
            lock.withLock {
                if (!settings.getBoolean(requested(device), false)) return@withLock
                if (allowed()) {
                    device.register(installationId, token())
                    settings.edit().putBoolean(registered(device), true).apply()
                } else {
                    device.unregister(installationId)
                    settings.edit().remove(registered(device)).apply()
                }
            }
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            // An unavailable network must not prevent opening the app.
        }
    }

    suspend fun token(): String = suspendCancellableCoroutine { continuation ->
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful && !task.result.isNullOrBlank()) continuation.resume(task.result)
            else continuation.resumeWithException(IllegalStateException("Firebase token unavailable", task.exception))
        }
    }
}
