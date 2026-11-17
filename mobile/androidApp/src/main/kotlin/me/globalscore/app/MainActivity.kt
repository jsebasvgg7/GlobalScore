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
    private val openMatchesFromPush = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        openMatchesFromPush.value = intent.getStringExtra("push_destination") == "matches"

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
                openMatchesFromPush = openMatchesFromPush.value,
                onPushOpened = {
                    openMatchesFromPush.value = false
                    intent.removeExtra("push_destination")
                },
            )
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.getStringExtra("push_destination") == "matches") openMatchesFromPush.value = true
    }
}

@Preview
@Composable
fun AppAndroidPreview() {
    App()
}
