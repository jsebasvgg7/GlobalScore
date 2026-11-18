package me.globalscore.app.features.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import coil3.compose.SubcomposeAsyncImage
import globalscore.shared.generated.resources.*
import me.globalscore.app.LocalPushInvitation
import me.globalscore.app.LocalPushSettings
import me.globalscore.app.features.home.RemoteImage
import me.globalscore.app.features.notes.NotesScreen
import me.globalscore.app.ui.SkeletonBlock
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import io.github.jan.supabase.SupabaseClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

internal val accountFields = linkedMapOf(
    "name" to "Nombre",
    "nationality" to "Nacionalidad",
    "favorite_team" to "Equipo favorito",
    "favorite_player" to "Jugador favorito",
    "bio" to "Biografía",
)

private enum class AccountPage(val label: String) {
    Main("Mi perfil"), Edit("Editar perfil"), Stats("Estadísticas"), Achievements("Logros"),
    Titles("Títulos"), History("Historial"), Championships("Campeonatos"), Settings("Ajustes"),
    Account("Mi cuenta"), Appearance("Apariencia"), Push("Notificaciones"),
    Privacy("Privacidad"), Data("Mis datos"), Info("Acerca de GlobalScore"),
    Notes("Mis notas"), Terms("Términos y condiciones"), PrivacyPolicy("Política de privacidad"),
}

@Composable
internal fun AccountScreen(
    modifier: Modifier,
    database: SupabaseClient,
    userId: String,
    authId: String,
    globalRank: Int?,
    bottomPadding: Dp,
    dark: Boolean,
    onTheme: () -> Unit,
    onNotifications: () -> Unit,
    onExit: () -> Unit,
    signingOut: Boolean,
    signOutError: String?,
    onSignOut: () -> Unit,
    onProfileSaved: (String, String?) -> Unit,
) {
    val repository = remember(database) { AccountRepository(database) }
    val publicRepository = remember(database) { PublicProfileRepository(database) }
    var page by rememberSaveable(userId) { mutableStateOf(AccountPage.Main.name) }
    var saved by rememberSaveable(userId) { mutableStateOf(false) }
    var revision by rememberSaveable(userId) { mutableIntStateOf(0) }
    var editOrigin by rememberSaveable(userId) { mutableStateOf(AccountPage.Main.name) }
    val menuScroll = rememberScrollState()
    val current = AccountPage.valueOf(page)
    val centeredHeader = current != AccountPage.Main
    val open: (AccountPage) -> Unit = { destination ->
        if (destination == AccountPage.Edit) editOrigin = current.name
        page = destination.name
    }
    val back = {
        when (current) {
            AccountPage.Main -> onExit()
            AccountPage.Edit -> open(AccountPage.valueOf(editOrigin))
            AccountPage.Account, AccountPage.Appearance, AccountPage.Push,
            AccountPage.Privacy, AccountPage.Data, AccountPage.Info -> open(AccountPage.Settings)
            AccountPage.Terms, AccountPage.PrivacyPolicy -> open(AccountPage.Info)
            else -> open(AccountPage.Main)
        }
    }

    if (current == AccountPage.Notes) {
        NotesScreen(modifier, database, userId, authId, bottomPadding) { open(AccountPage.Main) }
        return
    }

    Column(modifier.fillMaxWidth()) {
        if (current == AccountPage.Main) {
            ProfileHeader(dark, back, onTheme, onNotifications)
            ProfileLoad(
                "$userId:$revision",
                load = { repository.user(userId) },
                loading = { AccountHero(null) {} },
            ) { user ->
                AccountHero(user) { open(AccountPage.Edit) }
            }
        } else {
            AccountProgressHeader(current.label, back)
        }
        if (current == AccountPage.History) {
            AccountHistory(repository, userId, bottomPadding)
            return@Column
        }
        key(current) {
            val scroll = if (current == AccountPage.Main) menuScroll else rememberScrollState()
            Column(
                Modifier.fillMaxWidth().padding(top = if (centeredHeader) 12.dp else 0.dp)
                    .verticalScroll(scroll).padding(bottom = bottomPadding),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                when (current) {
                    AccountPage.Main -> {
                        val progress by profileSummary(userId, repository) {
                            val achievements = repository.progress(userId).achievements
                            achievements.size to repository.unlockedTitles(achievements).size
                        }
                        val championships by profileSummary(userId, publicRepository) {
                            publicRepository.titles(userId, monthly = true).size +
                                publicRepository.titles(userId, monthly = false).size
                        }
                        if (saved) Text("Perfil actualizado.", color = MaterialTheme.colorScheme.primary)
                        ProfileMenuSection("General")
                        ProfileMenuLink("modo oscuro", "apariencia de la app", Res.drawable.huge_sun_01, action = onTheme)
                        ProfileMenuLink("notificaciones", "centro de avisos e info.", Res.drawable.huge_notification_01, action = onNotifications)
                        ProfileMenuSection("Progreso")
                        ProfileMenuLink("estadísticas", "verificación de rendimiento", Res.drawable.huge_chart_bar_line) { open(AccountPage.Stats) }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            ProfileMenuLink("logros", progress?.first?.let { "$it items" }, Res.drawable.huge_medal_01, Modifier.weight(1f)) { open(AccountPage.Achievements) }
                            ProfileMenuLink("títulos", progress?.second?.let { "$it items" }, Res.drawable.huge_award_01, Modifier.weight(1f)) { open(AccountPage.Titles) }
                        }
                        ProfileMenuSection("Mi actividad")
                        ProfileMenuLink("historial", "tus pronósticos de partidos", Res.drawable.huge_folder_01) { open(AccountPage.History) }
                        ProfileMenuLink("mis notas", "Tus notas personales", Res.drawable.huge_notebook_01) { open(AccountPage.Notes) }
                        ProfileMenuLink("campeonatos", championships?.let(::profileCount), Res.drawable.hall_crown) { open(AccountPage.Championships) }
                        ProfileMenuSection("Cuenta")
                        ProfileMenuLink("editar perfil", "personalización del perfil", Res.drawable.profile_pencil) { open(AccountPage.Edit) }
                        ProfileMenuLink("ajustes", "cuenta y preferencias", Res.drawable.huge_user) { open(AccountPage.Settings) }
                    }
                    AccountPage.Edit -> ProfileLoad(userId, load = { repository.user(userId) }) { user ->
                        AccountEditor(repository, userId, authId, user) { name, avatar ->
                            onProfileSaved(name, avatar)
                            saved = true
                            revision++
                            open(AccountPage.valueOf(editOrigin))
                        }
                    }
                    AccountPage.Stats -> ProfileLoad(
                        userId, load = { publicRepository.user(userId) }, loading = { AccountStatsSkeleton() },
                    ) { user ->
                        AccountStatsPreview(user, globalRank)
                    }
                    AccountPage.Achievements -> ProfileLoad(
                        userId, load = { repository.progress(userId) }, loading = { AccountAchievementsSkeleton() },
                    ) { progress ->
                        AccountAchievements(progress)
                    }
                    AccountPage.Titles -> ProfileLoad(
                        userId, load = { repository.unlockedTitles(userId) }, loading = { AccountTitlesSkeleton() },
                    ) { titles ->
                        AccountTitles(titles)
                    }
                    AccountPage.Championships -> {
                        ProfileLoad(
                            userId, load = { publicRepository.user(userId) },
                            loading = { AccountChampionshipSummarySkeleton() },
                        ) { user ->
                            AccountChampionshipSummary(user)
                        }
                        ProfileLoad(
                            userId, load = { publicRepository.titles(userId, monthly = false) },
                            loading = { AccountChampionshipHistorySkeleton(1) },
                        ) { trophies ->
                            AccountChampionshipHistory(
                                "Trofeos globales", trophies, "edition_label",
                                Res.drawable.huge_champion, "Aún no tienes trofeos globales.",
                            )
                        }
                        ProfileLoad(
                            userId, load = { publicRepository.titles(userId, monthly = true) },
                            loading = { AccountChampionshipHistorySkeleton(3) },
                        ) { crowns ->
                            AccountChampionshipHistory(
                                "Historial de coronas", crowns.sortedByDescending { it.text("month_year") }, "month_year",
                                Res.drawable.hall_crown, "Aún no tienes coronas mensuales.",
                            )
                        }
                    }
                    AccountPage.Settings -> {
                        ProfileMenuSection("Cuenta y preferencias")
                        ProfileMenuLink("Mi cuenta", "Nombre, correo y perfil", Res.drawable.huge_user) { open(AccountPage.Account) }
                        ProfileMenuLink("Apariencia", "Tema y preferencias de pantalla", Res.drawable.huge_moon_02) { open(AccountPage.Appearance) }
                        ProfileMenuLink("Notificaciones", "Avisos y notificaciones push", Res.drawable.huge_notification_01) { open(AccountPage.Push) }

                        ProfileMenuSection("Privacidad e información")
                        ProfileMenuLink("Privacidad", "Visibilidad de tu actividad", Res.drawable.profile_shield) { open(AccountPage.Privacy) }
                        ProfileMenuLink("Mis datos", "Exportación y gestión de cuenta", Res.drawable.huge_folder_01) { open(AccountPage.Data) }
                        ProfileMenuLink("Acerca de GlobalScore", "Información de la app y documentos legales", Res.drawable.huge_notebook_01) { open(AccountPage.Info) }

                        ProfileMenuSection("Sesión")
                        ProfileMenuLink(
                            if (signingOut) "Cerrando sesión…" else "Cerrar sesión",
                            "Salir de GlobalScore en este dispositivo",
                            Res.drawable.huge_arrow_right_01,
                            action = onSignOut.takeUnless { signingOut },
                        )
                        signOutError?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    }
                    AccountPage.Account -> {
                        if (saved) Text("Perfil actualizado.", color = MaterialTheme.colorScheme.primary)
                        ProfileMenuSection("Información personal")
                        ProfileLoad(
                            "$userId:$revision", load = { repository.user(userId) },
                            loading = { repeat(2) { SkeletonBlock(Modifier.fillMaxWidth().height(58.dp), RoundedCornerShape(10.dp)) } },
                        ) { user ->
                            ProfileMenuLink("Nombre", user.text("name") ?: "—", Res.drawable.huge_user)
                            ProfileMenuLink("Correo", user.text("email") ?: "—", Res.drawable.huge_notification_01)
                        }
                        ProfileMenuLink("Editar perfil", "Personaliza tu perfil", Res.drawable.profile_pencil) { open(AccountPage.Edit) }
                    }
                    AccountPage.Appearance -> {
                        ProfileMenuSection("Tema")
                        ProfileMenuLink(
                            "Modo oscuro", "Usa el tema oscuro en este dispositivo", Res.drawable.huge_moon_02,
                            trailing = { Switch(checked = dark, onCheckedChange = { onTheme() }) },
                        )
                        ProfileMenuSection("Pantalla")
                        ProfileMenuLink("Tamaño del texto", "Próximamente", Res.drawable.huge_notebook_01)
                        ProfileMenuLink("Probabilidades", "Próximamente", Res.drawable.huge_chart_bar_line)
                    }
                    AccountPage.Push -> {
                        ProfileMenuLink("Centro de avisos", "Consulta los avisos de GlobalScore", Res.drawable.huge_notification_01, action = onNotifications)
                        val pushSettings = LocalPushSettings.current
                        if (pushSettings == null) {
                            ProfileMenuLink("Notificaciones push", "Próximamente", Res.drawable.huge_notification_01)
                        } else {
                            pushSettings(false)
                        }
                    }
                    AccountPage.Privacy -> {
                        ProfileMenuLink("Visibilidad del perfil", "Próximamente", Res.drawable.profile_shield)
                        ProfileMenuLink("Estadísticas y pronósticos", "Próximamente", Res.drawable.huge_chart_bar_line)
                    }
                    AccountPage.Data -> {
                        ProfileMenuLink("Exportar mis datos", "Próximamente", Res.drawable.huge_folder_01)
                        ProfileMenuLink("Restaurar preferencias", "Próximamente", Res.drawable.huge_notebook_01)
                        ProfileMenuSection("Gestión de cuenta")
                        ProfileMenuLink("Eliminar cuenta", "Próximamente", Res.drawable.huge_user)
                    }
                    AccountPage.Info -> {
                        ProfileMenuSection("Legal")
                        ProfileMenuLink("Términos y condiciones", "Reglas de uso", Res.drawable.huge_notebook_01) { open(AccountPage.Terms) }
                        ProfileMenuLink("Política de privacidad", "Cómo se usan tus datos", Res.drawable.profile_shield) { open(AccountPage.PrivacyPolicy) }
                    }
                    AccountPage.Notes -> Unit
                    AccountPage.Terms -> LegalDocument(termsSections)
                    AccountPage.PrivacyPolicy -> LegalDocument(privacySections)
                }
            }
        }
    }
}

@Composable
private fun <T> profileSummary(userId: String, repository: Any, load: suspend () -> T): State<T?> =
    produceState<T?>(null, userId, repository) {
        try {
            value = load()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            value = null
        }
    }

private fun profileCount(count: Int) = if (count == 1) "1 elemento" else "$count elementos"

@Composable
private fun ProfileHeader(dark: Boolean, onExit: () -> Unit, onTheme: () -> Unit, onNotifications: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(bottom = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        TextButton(onClick = onExit, contentPadding = PaddingValues(horizontal = 8.dp)) {
            Text("← Salir", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleLarge)
        }
        Spacer(Modifier.weight(1f))
        ProfileHeaderButton(if (dark) Res.drawable.huge_sun_01 else Res.drawable.hall_moon_filled, "Cambiar tema", onTheme)
        val showInvitation = LocalPushInvitation.current
        BadgedBox(badge = { if (showInvitation) Badge(containerColor = MaterialTheme.colorScheme.tertiary) }) {
            ProfileHeaderButton(
                Res.drawable.hall_bell_filled,
                if (showInvitation) "Notificaciones, puedes activar los avisos push" else "Notificaciones",
                onNotifications,
            )
        }
    }
}

@Composable
private fun ProfileHeaderButton(glyph: DrawableResource, label: String, action: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Box(
        Modifier.size(48.dp).shadow(2.dp, CircleShape).clip(CircleShape).background(colors.background)
            .clickable(onClick = action, role = Role.Button, onClickLabel = label),
        contentAlignment = Alignment.Center,
    ) {
        Icon(painterResource(glyph), label, Modifier.size(28.dp), tint = colors.primary)
    }
}

@Composable
private fun AccountHero(user: JsonObject?, onEdit: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val name = user?.text("name") ?: "Usuario"
    val shape = RoundedCornerShape(10.dp)
    Box(
        Modifier.fillMaxWidth().padding(bottom = 4.dp)
            .border(1.dp, colors.primary.copy(alpha = 0.14f), shape),
    ) {
        Box(
            Modifier.fillMaxWidth().height(100.dp).shadow(2.dp, shape).clip(shape)
                .background(Brush.verticalGradient(listOf(Color(0xFF381DD8), Color(0xFF664AF8)))),
        ) {
            RemoteImage(user?.text("equipped_banner_url"), Modifier.fillMaxSize(), ContentScale.Crop)
        }
        Row(
            Modifier.fillMaxWidth().padding(start = 20.dp, top = 80.dp, end = 6.dp, bottom = 8.dp),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Box(
                Modifier.size(76.dp).shadow(3.dp, CircleShape).clip(CircleShape)
                    .background(colors.tertiary).border(2.dp, Color.White, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                RemoteImage(user?.text("avatar_url"), Modifier.fillMaxSize(), ContentScale.Crop) {
                    if (user != null) {
                        Text(name.take(2).uppercase(), color = colors.onTertiary, fontWeight = FontWeight.Bold)
                    }
                }
            }
            if (user != null) {
                Column(Modifier.weight(1f).padding(bottom = 2.dp)) {
                    Text(name, color = colors.primary, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("temp. 26/27", color = colors.primary, style = MaterialTheme.typography.bodyMedium)
                }
                IconButton(onClick = onEdit) {
                    Icon(painterResource(Res.drawable.profile_pencil), "Editar perfil", Modifier.size(22.dp), tint = colors.primary)
                }
            }
        }
    }
}

@Composable
private fun ProfileMenuSection(label: String) {
    Text(
        label,
        Modifier.padding(start = 8.dp, top = 16.dp, bottom = 4.dp),
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.titleMedium,
    )
}

@Composable
private fun ProfileMenuLink(
    label: String,
    description: String?,
    glyph: DrawableResource,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
    action: (() -> Unit)? = null,
) {
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(10.dp)
    val card = modifier.fillMaxWidth().padding(end = 2.dp, bottom = 2.dp)
        .shadow(2.dp, shape, ambientColor = colors.primary, spotColor = colors.primary)
        .clip(shape).background(colors.surface)
    Row(
        card.then(if (action == null) Modifier else Modifier.clickable(role = Role.Button, onClick = action))
            .heightIn(min = 56.dp).padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(Modifier.size(40.dp).background(colors.tertiary, CircleShape), contentAlignment = Alignment.Center) {
            Icon(painterResource(glyph), null, Modifier.size(20.dp), tint = colors.onTertiary)
        }
        Column(Modifier.weight(1f)) {
            Text(label.replaceFirstChar { it.lowercaseChar() }, color = colors.primary, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            description?.let {
                Text(it, color = colors.primary.copy(alpha = 0.86f), style = MaterialTheme.typography.bodySmall)
            }
        }
        trailing?.invoke()
        if (action != null) Text("›", color = colors.primary, style = MaterialTheme.typography.titleLarge)
    }
}

private val profileGenders = listOf("Masculino", "Femenino", "Otro", "Prefiero no decir")

@Composable
private fun AccountEditor(
    repository: AccountRepository,
    userId: String,
    authId: String,
    user: JsonObject,
    onSaved: (String, String?) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var photo by remember { mutableStateOf<AvatarPhoto?>(null) }
    var uploadedUrl by rememberSaveable(userId) { mutableStateOf<String?>(null) }
    var gender by rememberSaveable(userId) { mutableStateOf(user.text("gender")) }
    var banner by rememberSaveable(userId) { mutableStateOf(user.text("equipped_banner_url")) }
    val currentAvatar = user.text("avatar_url")
    var removeAvatar by rememberSaveable(userId) { mutableStateOf(false) }
    val colors = MaterialTheme.colorScheme
    val shape = RoundedCornerShape(12.dp)
    val pickPhoto = rememberAvatarPicker { result ->
        if (!saving) {
            result.onSuccess {
                photo = it
                uploadedUrl = null
                removeAvatar = false
                error = null
            }.onFailure {
                error = (it as? IllegalArgumentException)?.message ?: "No se pudo leer la imagen."
            }
        }
    }
    val values = accountFields.keys.associateWith { field ->
        key(field) { rememberSaveable(userId) { mutableStateOf(user.text(field).orEmpty()) } }
    }
    val displayedName = values.getValue("name").value.ifBlank { user.text("name").orEmpty() }
    val avatarModel = if (removeAvatar) null else photo?.bytes ?: uploadedUrl ?: currentAvatar
    Column(
        Modifier.fillMaxWidth().padding(bottom = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        Box(Modifier.size(width = 136.dp, height = 114.dp)) {
            Box(
                Modifier.align(Alignment.TopCenter).size(106.dp).clip(shape)
                    .background(colors.tertiary).border(2.dp, colors.primary, shape),
                contentAlignment = Alignment.Center,
            ) {
                val initials: @Composable () -> Unit = {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(displayedName.take(2).uppercase(), color = colors.onTertiary, style = MaterialTheme.typography.headlineMedium)
                    }
                }
                if (avatarModel != null) {
                    SubcomposeAsyncImage(
                        model = avatarModel, contentDescription = "Foto de perfil",
                        modifier = Modifier.fillMaxSize().padding(2.dp).clip(RoundedCornerShape(10.dp)),
                        contentScale = ContentScale.Crop, loading = { initials() }, error = { initials() },
                    )
                } else {
                    initials()
                }
            }
            EditorPhotoButton(
                Res.drawable.stats_x, "Quitar foto", colors.error,
                Modifier.align(Alignment.BottomStart), enabled = !saving && avatarModel != null,
            ) {
                photo = null
                uploadedUrl = null
                removeAvatar = !currentAvatar.isNullOrBlank()
                error = null
            }
            EditorPhotoButton(
                Res.drawable.profile_upload, "Cambiar foto", colors.primary,
                Modifier.align(Alignment.BottomEnd), enabled = !saving, action = pickPhoto,
            )
        }
        Text(displayedName, color = colors.primary, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
    }

    val updateField: (String, String) -> Unit = { field, value ->
        values.getValue(field).value = value
        error = null
    }
    EditorTextField("Nombre", values.getValue("name").value, Res.drawable.huge_user, !saving) { updateField("name", it) }
    EditorTextField("Nacionalidad", values.getValue("nationality").value, Res.drawable.profile_flag, !saving) { updateField("nationality", it) }
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val paired = maxWidth >= 300.dp
        if (paired) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EditorTextField("Jugador fav.", values.getValue("favorite_player").value, Res.drawable.profile_heart, !saving, Modifier.weight(1f)) { updateField("favorite_player", it) }
                EditorTextField("Equipo fav.", values.getValue("favorite_team").value, Res.drawable.profile_shield, !saving, Modifier.weight(1f)) { updateField("favorite_team", it) }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                EditorTextField("Jugador favorito", values.getValue("favorite_player").value, Res.drawable.profile_heart, !saving) { updateField("favorite_player", it) }
                EditorTextField("Equipo favorito", values.getValue("favorite_team").value, Res.drawable.profile_shield, !saving) { updateField("favorite_team", it) }
            }
        }
    }
    EditorLabel("Género")
    var gendersExpanded by remember { mutableStateOf(false) }
    Box(Modifier.fillMaxWidth()) {
        Surface(
            onClick = { gendersExpanded = true },
            enabled = !saving,
            shape = shape,
            border = BorderStroke(1.dp, colors.primary.copy(alpha = 0.56f)),
            color = colors.surface,
            contentColor = colors.primary,
        ) {
            Row(
                Modifier.fillMaxWidth().heightIn(min = 56.dp).padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                EditorFieldIcon(Res.drawable.huge_user)
                Text(gender ?: "Seleccionar", Modifier.weight(1f))
                Text("⌄", style = MaterialTheme.typography.titleMedium)
            }
        }
        DropdownMenu(expanded = gendersExpanded, onDismissRequest = { gendersExpanded = false }) {
            (listOf(null) + profileGenders).forEach { option ->
                DropdownMenuItem(
                    text = { Text(option ?: "Sin especificar") },
                    onClick = {
                        gender = option
                        gendersExpanded = false
                        error = null
                    },
                )
            }
        }
    }
    EditorTextField(
        "Biografía", values.getValue("bio").value, Res.drawable.huge_notebook_01, !saving,
        multiline = true,
    ) { updateField("bio", it) }
    EditorLabel("Banner de perfil")
    ProfileLoad(userId, load = { repository.banners(userId) }) { banners ->
        BannerOption("Banner base", null, banner == null, !saving) { banner = null }
        banners.forEach { item ->
            val url = item.text("image_url") ?: return@forEach
            BannerOption(item.text("name") ?: "Banner", url, banner == url, !saving) { banner = url }
        }
        if (banners.isEmpty()) Text("Aún no tienes banners desbloqueados.")
    }
    error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
    Button(
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp).heightIn(min = 56.dp),
        shape = shape,
        colors = ButtonDefaults.buttonColors(containerColor = colors.tertiary, contentColor = colors.onTertiary),
        enabled = !saving && values.getValue("name").value.isNotBlank(),
        onClick = {
            saving = true
            error = null
            scope.launch {
                try {
                    val selectedPhoto = photo
                    if (selectedPhoto != null && uploadedUrl == null) {
                        uploadedUrl = repository.uploadAvatar(userId, selectedPhoto)
                    }
                    val changes = buildJsonObject {
                        values.forEach { (field, value) ->
                            val updated = value.value.trim()
                            if (updated != user.text(field).orEmpty()) put(field, updated)
                        }
                        if (gender != user.text("gender")) {
                            if (gender == null) put("gender", JsonNull) else put("gender", gender)
                        }
                        if (banner != user.text("equipped_banner_url")) {
                            if (banner == null) put("equipped_banner_url", JsonNull) else put("equipped_banner_url", banner)
                        }
                        if (removeAvatar) put("avatar_url", JsonNull)
                        else uploadedUrl?.let { put("avatar_url", it) }
                    }
                    val updated = if (changes.isEmpty()) user else repository.saveProfile(userId, authId, changes)
                    onSaved(updated.text("name").orEmpty(), updated.text("avatar_url"))
                } catch (cancelled: CancellationException) {
                    throw cancelled
                } catch (_: Exception) {
                    error = if (photo != null && uploadedUrl == null) "No se pudo subir la foto. Reintenta."
                    else "No se pudo guardar el perfil. Revisa los datos e inténtalo de nuevo."
                } finally {
                    saving = false
                }
            }
        },
    ) {
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Icon(painterResource(Res.drawable.profile_save), null, Modifier.align(Alignment.CenterStart).size(20.dp))
            Text(if (saving) "Guardando…" else "Guardar", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun EditorPhotoButton(
    icon: DrawableResource,
    label: String,
    tint: Color,
    modifier: Modifier,
    enabled: Boolean,
    action: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    IconButton(
        onClick = action, enabled = enabled, modifier = modifier.size(44.dp),
        colors = IconButtonDefaults.iconButtonColors(contentColor = tint, disabledContentColor = tint.copy(alpha = 0.38f)),
    ) {
        val shape = RoundedCornerShape(8.dp)
        Box(
            Modifier.size(34.dp).background(colors.surface, shape)
                .border(1.dp, tint.copy(alpha = if (enabled) 0.55f else 0.2f), shape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(painterResource(icon), label, Modifier.size(16.dp))
        }
    }
}

@Composable
private fun EditorLabel(label: String) {
    Text(label, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
}

@Composable
private fun EditorFieldIcon(icon: DrawableResource) {
    val colors = MaterialTheme.colorScheme
    Box(
        Modifier.size(32.dp).background(colors.tertiary, RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(painterResource(icon), null, Modifier.size(17.dp), tint = colors.onTertiary)
    }
}

@Composable
private fun EditorTextField(
    label: String,
    value: String,
    icon: DrawableResource,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    multiline: Boolean = false,
    onChange: (String) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        EditorLabel(label)
        Box(Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = value, onValueChange = onChange, enabled = enabled,
                singleLine = !multiline, minLines = if (multiline) 3 else 1,
                shape = RoundedCornerShape(12.dp),
                leadingIcon = {
                    if (multiline) Spacer(Modifier.size(32.dp)) else EditorFieldIcon(icon)
                },
                modifier = Modifier.fillMaxWidth().semantics { contentDescription = label },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = colors.primary, unfocusedTextColor = colors.primary,
                    unfocusedBorderColor = colors.primary.copy(alpha = 0.56f),
                ),
            )
            if (multiline) {
                Box(Modifier.align(Alignment.TopStart).padding(start = 8.dp, top = 10.dp)) {
                    EditorFieldIcon(icon)
                }
            }
        }
    }
}

@Composable
private fun BannerOption(label: String, url: String?, selected: Boolean, enabled: Boolean, select: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = select,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().semantics { this.selected = selected },
        shape = RoundedCornerShape(10.dp),
        color = colors.tertiary,
        border = BorderStroke(if (selected) 2.dp else 1.dp, colors.primary.copy(alpha = if (selected) 1f else 0.35f)),
    ) {
        Box(Modifier.fillMaxWidth().height(56.dp)) {
            Box(
                Modifier.fillMaxSize()
                    .background(Brush.horizontalGradient(listOf(Color(0xFF3A23CE), colors.tertiary))),
            ) {
                RemoteImage(url, Modifier.fillMaxSize(), ContentScale.Crop)
            }
            if (url != null) {
                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.55f)))))
            }
            Text(
                label, Modifier.align(Alignment.BottomStart).padding(10.dp),
                color = Color.White, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold,
            )
            if (selected) {
                Box(
                    Modifier.align(Alignment.TopEnd).padding(6.dp).size(22.dp).background(colors.tertiary, RoundedCornerShape(5.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(painterResource(Res.drawable.stats_check), null, Modifier.size(15.dp), tint = colors.onTertiary)
                }
            }
        }
    }
}
