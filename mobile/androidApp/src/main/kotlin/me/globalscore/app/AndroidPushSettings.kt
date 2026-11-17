package me.globalscore.app

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.PersistableBundle
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

@Composable
internal fun AndroidPushSettings(
    device: AndroidPushDevice,
    registration: PushDeviceRegistration,
    compact: Boolean,
) {
    val context = LocalContext.current
    val colors = MaterialTheme.colorScheme
    val debug = context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
    val scope = rememberCoroutineScope()
    val subscribed = device.registeredState(registration)
    val enabled = device.wantsNotifications(registration)
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    fun request(failureMessage: String, action: suspend () -> Unit) {
        if (busy) return
        busy = true
        message = null
        scope.launch {
            try {
                action()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                message = failureMessage
            } finally {
                busy = false
            }
        }
    }

    fun activate() {
        if (!device.allowed()) {
            message = "Permite las notificaciones de GlobalScore en los ajustes del teléfono."
            return
        }
        request("No se pudo registrar el dispositivo. Inténtalo de nuevo.") { device.activate(registration) }
    }

    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) activate()
        else message = "El permiso quedó desactivado. Puedes habilitarlo en los ajustes del teléfono."
    }

    fun toggle() {
        if (enabled) {
            request("No se pudo desactivar la suscripción. Inténtalo de nuevo.") {
                device.disable(registration)
            }
        } else if (Build.VERSION.SDK_INT >= 33 &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            permission.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            activate()
        }
    }

    if (compact) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = colors.primary.copy(alpha = 0.06f),
            border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.13f)),
        ) {
            Column(Modifier.padding(horizontal = 12.dp, vertical = 6.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Notificaciones push", color = colors.primary, style = MaterialTheme.typography.titleSmall)
                        Text(
                            when {
                                subscribed -> "Avisos activados en este teléfono"
                                enabled -> "Pendiente de volver a conectar"
                                else -> "Recibe avisos de jornadas y novedades"
                            },
                            color = colors.onSurfaceVariant,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    Switch(
                        checked = enabled,
                        onCheckedChange = { toggle() },
                        enabled = !busy,
                        modifier = Modifier.scale(0.8f).semantics { contentDescription = "Notificaciones push" },
                        colors = SwitchDefaults.colors(checkedTrackColor = colors.tertiary),
                    )
                }
                message?.let { Text(it, color = colors.primary, style = MaterialTheme.typography.bodySmall) }
            }
        }
        return
    }

    OutlinedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Notificaciones push", color = colors.primary, style = MaterialTheme.typography.titleMedium)
            Text(
                when {
                    subscribed -> "Este dispositivo está suscrito a los avisos de GlobalScore."
                    enabled -> "Pendiente de volver a conectar. Comprueba el permiso y tu conexión."
                    else -> "Activa las notificaciones para registrar este dispositivo."
                },
                color = colors.primary, style = MaterialTheme.typography.bodyMedium,
            )
            Button(
                onClick = ::toggle,
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = colors.tertiary, contentColor = colors.onTertiary),
            ) { Text(if (busy) "Actualizando…" else if (enabled) "Desactivar notificaciones" else "Activar notificaciones") }
            if (debug && subscribed) {
                TextButton(enabled = !busy, onClick = {
                    request("No se pudo copiar el token. Inténtalo de nuevo.") {
                        val clip = ClipData.newPlainText("Token de prueba de GlobalScore", device.token())
                        clip.description.extras = PersistableBundle().apply {
                            putBoolean("android.content.extra.IS_SENSITIVE", true)
                        }
                        (context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager).setPrimaryClip(clip)
                        message = "Token copiado. Pégalo en el envío de prueba de Firebase."
                    }
                }) { Text("Copiar token de prueba") }
            }
            TextButton(onClick = {
                val intent = if (Build.VERSION.SDK_INT >= 26) {
                    Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                } else {
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.fromParts("package", context.packageName, null))
                }
                context.startActivity(intent)
            }) { Text("Ajustes del teléfono") }
            message?.let { Text(it, color = colors.primary, style = MaterialTheme.typography.bodySmall) }
        }
    }
}
