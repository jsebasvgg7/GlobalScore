package me.globalscore.app.features.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private const val requestsEmail = "globalscore.oficial@gmail.com"

internal val termsSections = listOf(
    "El servicio" to "GlobalScore permite registrar pronósticos deportivos, consultar resultados, participar en clasificaciones y organizar plantillas y salas en la Libreta Futbolera.",
    "Acceso gratuito" to "El acceso a GlobalScore es gratuito. La versión actual no incluye anuncios ni suscripciones de pago.",
    "Edad mínima" to "Debes tener 18 años o más para crear una cuenta en GlobalScore.",
    "Tu cuenta" to "Usa tu propia cuenta, protege tus credenciales y respeta a los demás participantes. Evita suplantar a otras personas, automatizar el envío de pronósticos o manipular resultados y clasificaciones.",
    "Pronósticos y puntos" to "Puedes guardar o editar pronósticos mientras estén abiertos. GlobalScore calcula los puntos a partir de los resultados registrados y las reglas de cada modalidad. Las probabilidades que aparecen en la app son orientativas.",
    "Perfil y salas" to "Comparte únicamente contenido que tengas derecho a publicar. Al compartir un código de sala, otras personas pueden usarlo para unirse y comparar resultados según la modalidad de la sala.",
    "Incumplimientos" to "Ante trampas, suplantación, manipulación de clasificaciones o abuso, GlobalScore puede suspender la cuenta o restringir temporalmente su participación en el ranking.",
    "Contacto" to "Para consultas sobre estas reglas, escribe a $requestsEmail.",
)

internal val privacySections = listOf(
    "Responsable del tratamiento" to
        "John Sebastian Vega Gonzalez\n" +
        "Urb. Sandalo, Turbaco, Bolívar, Colombia\n" +
        "johnsebastianveggonzalez@gmail.com\n" +
        "+57 301 410 2147",
    "Cuenta y perfil" to "GlobalScore trata tu correo y los datos necesarios para iniciar sesión. Si completas tu perfil, también guarda el nombre, la foto, el banner, la biografía y las preferencias que proporcionas.",
    "Actividad y visibilidad" to "Guardamos pronósticos, resultados, puntos, logros y actividad de la Libreta Futbolera para operar esas funciones. Otros participantes pueden consultar la información que aparece en las clasificaciones y en tu perfil público. Los participantes de una sala pueden comparar sus resultados.",
    "Servicios y notificaciones" to "GlobalScore usa Supabase para gestionar la sesión y almacenar los datos de la app. Si activas las notificaciones en Android, registramos un identificador de notificaciones del dispositivo para enviar avisos mediante Firebase Cloud Messaging. Puedes desactivarlas en Ajustes.",
    "Tus derechos" to "Puedes solicitar acceso, actualización o rectificación de tus datos, pedir prueba de la autorización e información sobre su uso y, cuando proceda, solicitar la supresión de los datos o revocar la autorización. También puedes presentar una queja ante la Superintendencia de Industria y Comercio conforme al procedimiento aplicable.",
    "Cómo enviar una solicitud" to "Escribe a $requestsEmail. Indica el correo asociado a tu cuenta, el derecho que quieres ejercer y los datos a los que se refiere tu solicitud. John Sebastian Vega Gonzalez atiende las consultas y los reclamos. Si hace falta verificar tu identidad, te contactaremos por el mismo canal.",
    "Conservación de los datos" to "El plazo de conservación depende de la finalidad de cada dato y de las obligaciones aplicables. Si cierras tu cuenta o solicitas la supresión de tus datos, revisaremos qué información puede eliminarse y cuál sigue siendo necesaria. Puedes consultar por el historial de pronósticos y clasificaciones a través de $requestsEmail.",
)

@Composable
internal fun LegalDocument(sections: List<Pair<String, String>>) {
    val colors = MaterialTheme.colorScheme
    val divider = colors.outlineVariant
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        color = colors.surface,
        border = BorderStroke(1.dp, divider),
    ) {
        Column {
            Text(
                "Vigente desde el 16 de noviembre de 2026",
                modifier = Modifier.fillMaxWidth()
                    .background(colors.primary.copy(alpha = 0.08f))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                color = colors.primary,
                style = MaterialTheme.typography.labelLarge,
            )
            sections.forEach { (title, body) ->
                HorizontalDivider(color = divider)
                Column(Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                    Text(
                        title,
                        modifier = Modifier.semantics { heading() },
                        color = colors.onSurface,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        body,
                        modifier = Modifier.padding(top = 6.dp),
                        color = colors.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp,
                    )
                }
            }
        }
    }
}
