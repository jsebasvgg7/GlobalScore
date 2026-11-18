package me.globalscore.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    private val pushDestination = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        pushDestination.value = intent.getStringExtra("push_destination")

        val device = AndroidPushDevice(this)
        val support = NativePushSupport(
            settings = { registration, compact -> AndroidPushSettings(device, registration, compact) },
            showInvitation = { !device.wantsNotifications(it) },
            pause = device::pause,
            sync = device::sync,
        )
        setContent {
            AppWithPushSettings(
                support,
                pushDestination = pushDestination.value,
                onPushOpened = {
                    pushDestination.value = null
                    intent.removeExtra("push_destination")
                },
            )
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        pushDestination.value = intent.getStringExtra("push_destination")
    }
}

@Preview
@Composable
fun AppAndroidPreview() {
    App()
}
