# ⚽ GlobalScore

<div align="center">
  
  ![GlobalScore Banner](https://img.shields.io/badge/GlobalScore-Prediction%20Platform-8B5CF6?style=for-the-badge&logo=trophy&logoColor=white)
  
  **La plataforma definitiva para predicciones deportivas y competencias entre amigos**
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![Android](https://img.shields.io/badge/Android-TWA-3DDC84?style=flat&logo=android&logoColor=white)](https://developer.chrome.com/docs/android/trusted-web-activity/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  [🌐 Demo en vivo](https://globalscore.onrender.com/app) • [🐛 Reportar Bug](https://github.com/jsebasvgg7/GlobalScore/issues)

</div>

---

## 📖 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Tech Stack](#️-tech-stack)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Contacto](#-contacto)

---

## 🎯 Sobre el Proyecto

**GlobalScore** es una plataforma web moderna y gamificada que permite a los usuarios hacer predicciones sobre resultados deportivos, competir en rankings globales, y ganar puntos, logros y títulos. Diseñada para crear una experiencia social y competitiva entre amigos y comunidades de aficionados al fútbol.

Disponible como **PWA instalable** en Android e iOS, y como **app nativa en Google Play** mediante TWA (Trusted Web Activity) — con APK de producción ya compilado y firmado.

### 🎮 ¿Por qué GlobalScore?

- **Competencia Amistosa**: Compite con amigos y otros usuarios por el primer puesto
- **Sistema de Gamificación**: Logros, títulos, coronas, banners, niveles y rachas
- **Múltiples Modos**: Predice partidos, ligas completas, premios individuales y el Mundial 2026
- **Estadísticas Detalladas**: Sigue tu evolución con métricas avanzadas y campeonatos mensuales
- **Ranking Dinámico**: Podios visuales, Hall of Fame y tablas de posiciones en tiempo real
- **Push Notifications**: Recibe alertas de nuevos partidos en tiempo real via VAPID/Web Push
- **Instalable**: Funciona como app nativa en Android (TWA) e iOS vía PWA

---

## ✨ Características Principales

### 🏆 Sistema de Predicciones

<table>
<tr>
<td width="50%">

**⚽ Predicciones de Partidos**
- Predice marcadores exactos
- Sistema de puntos inteligente
  - 5 pts: Resultado exacto
  - 3 pts: Resultado acertado
  - 0 pts: Fallido
- Deadlines automáticos antes del partido

</td>
<td width="50%">

**🏅 Predicciones de Ligas**
- Predice campeón de liga
- Goleador y asistidor
- Jugador MVP
- Hasta 20 puntos por liga

</td>
</tr>
<tr>
<td width="50%">

**🥇 Premios Individuales**
- Balón de Oro
- Bota de Oro
- The Best FIFA
- 10 puntos por acierto

</td>
<td width="50%">

**🌍 Mundial 2026**
- Fase de grupos completa (12 grupos)
- Bracket de eliminatorias (48 equipos)
- Predicción de premios del torneo
- Tabla de mejores terceros automática

</td>
</tr>
</table>

### 🎮 Gamificación y Progresión

```
📊 Sistema de Niveles
├── Basado en puntos acumulados
├── 20 puntos por nivel
└── Barra de progreso visual

🏅 Logros Desbloqueables
├── 4 Categorías: Inicio, Progreso, Precisión, Racha
├── Requisitos personalizables por admin
└── Iconos y descripciones únicas

👑 Títulos y Coronas
├── Desbloqueables mediante logros
├── Novato → Pronosticador → Oráculo → Leyenda
└── Colores y efectos visuales exclusivos

🎖️ Banners de Perfil
├── Banners asignables por administrador
├── Personalización visual del perfil
└── Insignias de identidad únicas

🔥 Sistema de Rachas
├── Racha actual de aciertos
├── Mejor racha personal
└── Recompensas por consistencia

🏆 Campeonatos Mensuales
├── Registro histórico de campeones por mes
└── Tab dedicado en el perfil del usuario
```

### 📊 Estadísticas y Analytics

- **Dashboard Personal**: Métricas clave y progreso visual
- **Historial Completo**: Todas tus predicciones con resultados detallados
- **Análisis por Liga**: Rendimiento en cada competición
- **Campeonatos Mensuales**: Historial de títulos ganados mes a mes
- **Estadísticas Semanales**: Reset automático cada lunes con mini-ranking
- **Gráficas Interactivas**: Precisión por día de la semana
- **Hall of Fame**: Galería permanente de los mejores jugadores históricos

### 🔔 Notificaciones Push

```
Sistema de Push Notifications (VAPID/Web Push)
├── 🔔 Suscripción desde el perfil (toggle on/off)
├── 📲 Notificaciones nativas en Android e iOS
├── ⚡ Supabase Edge Function (Deno) como backend
│   ├── Encriptación AES-128-GCM extremo a extremo
│   ├── JWT ES256 para autenticación VAPID
│   └── Limpieza automática de suscripciones inválidas
├── 🔑 Generación de claves VAPID incluida
└── 📡 Disparo automático al crear un partido nuevo
```

### 🎨 Experiencia de Usuario

- **Diseño Purple Theme**: Paleta coherente y moderna
- **Responsive Design**: Móvil, tablet y desktop completamente optimizados
- **Vistas Mobile Dedicadas**: Componentes específicos para cada sección en móvil
- **Bottom Navigation**: Navegación móvil intuitiva
- **Avatar Upload**: Sube y personaliza tu foto de perfil
- **Perfil Público**: Visualiza el perfil de otros usuarios
- **Image Viewer**: Visor de imágenes integrado
- **Animaciones Sutiles**: Transiciones fluidas
- **Toast Notifications**: Feedback visual elegante
- **Offline Support**: Service Worker con página offline y sincronización pendiente
- **PWA Completa**: Instalable, Service Worker, manifest, íconos adaptativos

### 🛡️ Panel de Administración

```
Admin Dashboard
├── 📋 Gestión de Partidos
│   ├── Crear/Editar/Eliminar
│   ├── Logos automáticos de equipos
│   └── Finalizar con cálculo automático de puntos
├── 🏆 Gestión de Ligas
│   ├── Crear competiciones
│   ├── Definir deadlines
│   └── Registrar resultados finales
├── 🥇 Gestión de Premios Individuales
├── ⭐ Sistema de Logros
│   ├── Crear logros personalizados
│   └── Definir requisitos de desbloqueo
├── 👑 Sistema de Títulos y Coronas
│   ├── Crear títulos exclusivos
│   └── Vincular con logros
├── 🎖️ Gestión de Banners
│   ├── Crear y administrar banners
│   └── Asignar banners a usuarios específicos
├── 📊 Vista General de Stats (AdminStatsOverview)
└── 🔧 Panel de Diagnóstico (AdminDiagnosticPanel)
```

### 🔐 Autenticación Completa

- Registro de nuevos usuarios (`RegisterPage`)
- Login con email y contraseña
- Recuperación de contraseña (`ForgotPasswordPage`)
- Reset de contraseña via token (`ResetPasswordPage`)
- Rutas protegidas con `ProtectedRoute` y `RequireAuth`
- Configuración de perfil dedicada (`ProfileSettingsPage`)

---

## 🛠️ Tech Stack

### Frontend

```javascript
{
  "framework": "React 18.3.1",
  "buildTool": "Vite 5.4.11",
  "routing": "React Router DOM 7.0.1",
  "icons": "Lucide React 0.469.0",
  "styling": "Tailwind CSS + Custom CSS",
  "stateManagement": "React Context API + Custom Hooks"
}
```

### Backend & Database

```javascript
{
  "backend": "Supabase",
  "database": "PostgreSQL",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage (Logos, Avatares)",
  "security": "Row Level Security (RLS)",
  "edgeFunctions": "Deno (Push Notifications)"
}
```

### Infraestructura & Deploy

```javascript
{
  "hosting": "Render.com",
  "pwa": "Service Worker + Web App Manifest",
  "android": "TWA (Trusted Web Activity) — APK firmado",
  "pushNotifications": "VAPID / Web Push API",
  "ci": "Git push → auto deploy",
  "automation": "GitHub Actions (weekly stats reset)"
}
```

### Características Técnicas

- ⚡ **Vite**: Build ultrarrápido con HMR
- 🎣 **Custom Hooks Granulares**: Organizados por dominio (`HooksAdmin`, `HooksCards`, `HooksProfile`, `HooksOthers`, `HooksSettings`)
- 🎨 **Tailwind CSS + CSS Variables**: Theming dinámico y utilitarios
- 🖼️ **Lazy Loading**: Optimización de imágenes
- 📱 **PWA Completa**: Service Worker, manifest, íconos maskables, página offline, sincronización offline
- 🔔 **Push Notifications**: VAPID/Web Push con encriptación AES-128-GCM extremo a extremo
- 🔒 **Row Level Security**: Políticas de seguridad en Supabase
- 🤖 **TWA Android**: App nativa compilada y firmada para Google Play
- 🔄 **GitHub Actions**: Reset semanal automatizado de estadísticas (cron: lunes 00:00 UTC)
- 🛠️ **Scripts de diagnóstico**: Utilidades para mantener la base de datos

---

## 🚀 Instalación

### Prerrequisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/jsebasvgg7/GlobalScore.git
cd GlobalScore
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Para push notifications, genera tus claves VAPID:

```bash
node scripts/generate-vapid-keys.cjs
```

Luego configura en Supabase Edge Functions:

```env
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
VAPID_EMAIL=mailto:tu@email.com
```

### Paso 4: Ejecutar el proyecto

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

---

## ⚙️ Configuración

### Configuración de Supabase

#### 1. Crear las tablas

Ejecuta el script SQL en tu proyecto de Supabase (ver archivo `schema.sql` en el repositorio).

#### 2. Configurar Storage Buckets

Crea los siguientes buckets en Supabase Storage:

```
team-logos/
├── leagues/
│   ├── premier-league/
│   ├── la-liga/
│   ├── serie-a/
│   ├── bundesliga/
│   └── ligue-1/

league-logos/
├── inglaterra.png
├── espana.png
├── italia.png
└── ...

award-logos/
├── balondeor.png
├── botadeoro.png
└── ...

avatars/           ← Nuevo: fotos de perfil de usuarios
banners/           ← Nuevo: banners de perfil personalizados
```

#### 3. Configurar Edge Function de Push Notifications

Despliega la función en Supabase:

```bash
supabase functions deploy send-match-notification
```

La función se dispara automáticamente al insertar un nuevo partido en la base de datos y envía notificaciones push a todos los usuarios suscritos.

#### 4. Configurar GitHub Actions (reset semanal)

Añade los siguientes secrets en tu repositorio de GitHub:

```
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_service_role_key
```

El workflow `.github/workflows/weekly-reset.yml` ejecuta el reset cada lunes a las 00:00 UTC automáticamente.

#### 5. Configurar assetlinks.json (para TWA/Android)

El archivo `public/.well-known/assetlinks.json` ya está configurado para la verificación de Digital Asset Links con Google Play.

---

## 📁 Estructura del Proyecto

```
globalscore/
│
├── public/
│   ├── .well-known/
│   │   └── assetlinks.json         # Digital Asset Links (TWA/Android)
│   ├── manifest.json               # Web App Manifest (PWA)
│   ├── sw.js                       # Service Worker
│   ├── offline.html                # Página offline
│   └── pushNotifications.js        # Lógica de suscripción push
│
├── app/                            # Proyecto Android nativo (TWA)
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/.../twa/
│       │   ├── Application.java
│       │   ├── DelegationService.java
│       │   └── LauncherActivity.java
│       └── res/                    # Recursos Android (iconos, colores, strings)
│
├── scripts/
│   └── generate-vapid-keys.cjs     # Generador de claves VAPID
│
├── src/
│   ├── components/
│   │   ├── ComAdmin/               # Panel de administración (23 componentes)
│   │   ├── ComAuth/                # Rutas protegidas
│   │   ├── ComCards/               # Tarjetas (Match, League, Award)
│   │   ├── ComFeedback/            # Loaders, spinners, toasts
│   │   ├── ComLayout/              # Sidebar, header, footer
│   │   ├── ComMobile/              # Vistas móviles dedicadas
│   │   ├── ComNavigation/          # Tabs de navegación
│   │   ├── ComNotis/               # Toggle de push notifications
│   │   ├── ComOthers/              # HallOfFame, AchievementsSection, ImageViewer
│   │   ├── ComPanels/              # Paneles laterales (Ranking, Stats, World)
│   │   ├── ComProfile/             # Perfil completo (tabs, hero, historial, logros)
│   │   ├── ComPWA/                 # Botón de instalación PWA
│   │   └── ComWorldCup/            # Mundial 2026 (grupos, bracket, knockout)
│   │
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── HooksAdmin/             # useAdminMatches, useAdminLeagues, useAdminBanners, etc.
│   │   ├── HooksCards/             # useMatches, useLeagues, useAwards
│   │   ├── HooksOthers/            # useWorldCup, useKnockoutBracket, usePushNotifications
│   │   ├── HooksProfile/           # useProfileData, useAchievements, useStreaks,
│   │   │                           # usePredictionHistory, useMonthlyChampionships, useUserRanking
│   │   ├── HooksSettings/          # useSettings
│   │   ├── useDataLoader.js
│   │   └── usePWA.js
│   │
│   ├── pages/
│   │   ├── AdminPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ForgotPasswordPage.jsx  ← Nuevo
│   │   ├── LoginPage.jsx
│   │   ├── NotificationsPage.jsx   ← Nuevo
│   │   ├── ProfileSettingsPage.jsx ← Nuevo
│   │   ├── RankingPage.jsx
│   │   ├── RegisterPage.jsx        ← Nuevo
│   │   ├── ResetPasswordPage.jsx   ← Nuevo
│   │   ├── StatsPage.jsx
│   │   └── WorldCupPage.jsx
│   │
│   ├── services/
│   │   ├── offlineSync.js          # Sincronización offline
│   │   ├── pushManager.js          # Gestión de push notifications
│   │   └── pwaService.js           # Helpers de PWA
│   │
│   ├── scripts/                    # Utilidades de mantenimiento de BD
│   │   ├── diagnoseDatabase.js
│   │   ├── checkDatabaseFunctions.js
│   │   ├── reset-weekly.js
│   │   └── ...
│   │
│   ├── styles/                     # CSS organizado por dominio
│   │   ├── StylesAdmin/
│   │   ├── StylesCards/
│   │   ├── StylesFeedback/
│   │   ├── StylesLayout/
│   │   ├── StylesMobile/
│   │   ├── StylesNavigation/
│   │   ├── StylesOthers/
│   │   ├── StylesPages/
│   │   ├── StylesPanels/
│   │   ├── StylesProfile/
│   │   └── StylesPWA/
│   │
│   └── utils/
│       ├── adminFilters.js
│       ├── logoHelper.js
│       ├── matchUtils.js
│       ├── profileUtils.js
│       ├── registerServiceWorker.js
│       ├── storage.js
│       └── supabaseClient.js
│
├── supabase/
│   └── functions/
│       └── send-match-notification/ # Edge Function (Deno) para push
│
├── .github/
│   └── workflows/
│       └── weekly-reset.yml        # Automatización de reset semanal
│
├── twa-manifest.json               # Configuración TWA (Android)
├── schema.sql                      # Esquema base de datos
├── render.yaml                     # Configuración Render.com
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.js
```

---

## 🗺️ Roadmap

### ✅ Completado (v1.0 — v1.1)

- [x] Sistema de autenticación completo (registro, login, recuperación de contraseña)
- [x] Predicciones de partidos con puntos
- [x] Predicciones de ligas y premios individuales
- [x] Sistema de logros, títulos y coronas
- [x] Banners de perfil personalizables
- [x] Avatar upload
- [x] Ranking global con podio y Hall of Fame
- [x] Campeonatos mensuales con historial
- [x] Panel de administración completo
- [x] Panel de diagnóstico de base de datos
- [x] Mundial 2026 (Fase de grupos + Eliminatorias)
- [x] Responsive design + vistas móviles dedicadas
- [x] **Push Notifications** vía VAPID/Web Push (Edge Function Deno)
- [x] Soporte offline con Service Worker y sincronización pendiente
- [x] PWA completa (instalable, Service Worker, manifest)
- [x] App Android compilada y firmada via TWA
- [x] GitHub Actions para reset semanal automatizado
- [x] Digital Asset Links configurados

### 🚧 En Progreso (v1.2)

- [ ] **Google Play Store**: Publicación oficial de la app
- [ ] **Chat Global**: Comunidad integrada
- [ ] **Ligas Privadas**: Competencias entre grupos cerrados
- [ ] **Multidioma**: Español, Inglés, Portugués

### 📋 Planeado (v2.0)

- [ ] **Integración con APIs**: Resultados automáticos de partidos
- [ ] **Sistema de Monedas**: Economía virtual
- [ ] **Tienda**: Compra de avatares y temas
- [ ] **Torneos Personalizados**: Crea tus propias ligas
- [ ] **Predicciones en Vivo**: Durante el partido
- [ ] **Social Sharing**: Compartir predicciones en redes

### 🔮 Futuro (v3.0)

- [ ] **AI Predictions**: Asistente con IA para sugerencias
- [ ] **Analytics Avanzados**: ML para recomendaciones personalizadas

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar GlobalScore:

### Flujo de Contribución

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Código

- ✅ Componentes en **PascalCase**
- ✅ Funciones y hooks en **camelCase**
- ✅ Carpetas de componentes con prefijo `Com` (`ComAdmin/`, `ComProfile/`, etc.)
- ✅ Carpetas de hooks con prefijo `Hooks` (`HooksAdmin/`, `HooksProfile/`, etc.)
- ✅ CSS classes en **kebab-case**
- ✅ Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

### Reportar Bugs

Usa el [issue tracker](https://github.com/jsebasvgg7/GlobalScore/issues) con:
- Descripción clara del bug
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible

---

## 📞 Contacto

**Hermanos Vega** — Desarrolladores

- 📧 Email: [globalscore.oficial@gmail.com](mailto:globalscore.oficial@gmail.com)
- 🌐 Web: [https://globalscore.onrender.com/app](https://globalscore.onrender.com/app)
- 👤 Luis Vega — [@luisd__vg](https://www.instagram.com/luisd__vg)
- 👤 J.Sebas Vega — [@jsebas.vg](https://www.instagram.com/jsebas.vg)

**Repositorio**: [https://github.com/jsebasvgg7/GlobalScore](https://github.com/jsebasvgg7/GlobalScore)

---

## 🫱🏼‍🫲🏼 Colaborador

- [The Brainy](https://www.instagram.com/brainy_bh) — Diseño y feedback

---

## 🙏 Agradecimientos

- [React](https://reactjs.org/) — Framework frontend
- [Supabase](https://supabase.com/) — Backend as a Service + Edge Functions
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utilidades CSS
- [Lucide Icons](https://lucide.dev/) — Iconografía
- [Render](https://render.com/) — Hosting
- [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) — TWA para Android

## 🙏 Agradecimientos Personales

- [Francisco Diaz](https://www.instagram.com/f_dixxz7)
- [Bryan Tuñon](https://www.instagram.com/bry4n._tdc)
- [Mahicol Hurtado](https://www.instagram.com/tmichael_27)

---

<div align="center">

### ⭐ Si te gusta el proyecto, dale una estrella en GitHub

**Hecho con 💜 por Hermanos Vega**

[⬆ Volver arriba](#-globalscore)

</div>