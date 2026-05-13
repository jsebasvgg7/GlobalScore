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
- [🖥️ Arquitectura Desktop vs Mobile](#️-arquitectura-desktop-vs-mobile)
- [📜 Sistema de Historia](#-sistema-de-historia)
- [Tech Stack](#️-tech-stack)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Arquitectura Feature-Based](#-arquitectura-feature-based)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Novedades en v1.4](#-novedades-en-v14)
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
- **Sistema de Notas**: Toma notas personales sobre predicciones y análisis
- **Historia Completa**: Registro detallado de competiciones, equipos y eventos históricos
- **Arquitectura Feature-Based**: Código organizado por dominio para máxima escalabilidad ⭐ NUEVO

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

📝 Sistema de Notas
├── Crea y gestiona notas privadas
├── Vincula notas a predicciones
├── Historial completo de análisis personal
└── Accesible desde página dedicada

📜 Historia
├── Competiciones históricas con resultados completos
├── Equipos históricos con estadísticas
├── Eventos y momentos destacados
├── Bracket de eliminatorias histórico en mobile ⭐ NUEVO
└── Navegación por secciones con sub-páginas dedicadas
```

### 📊 Estadísticas y Analytics

- **Dashboard Personal**: Métricas clave y progreso visual
- **Historial Completo**: Todas tus predicciones con resultados detallados
- **Análisis por Liga**: Rendimiento en cada competición
- **Campeonatos Mensuales**: Historial de títulos ganados mes a mes
- **Estadísticas Semanales**: Reset automático cada lunes con mini-ranking
- **Gráficas Interactivas**: Precisión por día de la semana
- **Hall of Fame**: Galería permanente de los mejores jugadores históricos
- **Análisis de Notas**: Seguimiento de tus análisis personales
- **Archivo Histórico**: Registro permanente de competiciones y eventos pasados

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
- **Style Switcher**: Personalización de temas y estilos en mobile
- **Historia navegable**: Secciones de historia con navegación interna propia
- **Welcome Screen de Historia**: Pantalla de bienvenida al módulo histórico ⭐ NUEVO
- **Bracket Mobile de Historia**: Vista de bracket de eliminatorias en mobile ⭐ NUEVO

---

## 🖥️ Arquitectura Desktop vs Mobile

GlobalScore implementa una **arquitectura adaptativa completa** que proporciona experiencias optimizadas tanto para desktop como para mobile. No es un simple responsive design, sino dos conjuntos de componentes especializados que se adaptan al contexto del usuario.

### 📱 Estrategia General

```
┌─────────────────────────────────────────────────────────┐
│          GlobalScore - Arquitectura Adaptativa          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  App Router (App.jsx)                                   │
│  └─ useMediaQuery Hook (detect: width < 768px)          │
│     ├─ Desktop View (width ≥ 768px)                     │
│     │  └─ Componentes Desktop + Paneles Laterales       │
│     │                                                   │
│     └─ Mobile View (width < 768px)                      │
│        └─ Componentes Mobile Optimizados                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 🖥️ DESKTOP - Experiencia Completa (≥768px)

La versión desktop está diseñada para usuarios en computadoras y tablets grandes. Maximiza la información visible y permite multi-tasking.

#### Layout Desktop Base

```
┌──────────────────────────────────────────────────────────────┐
│                     HEADER / NAVEGACIÓN                      │
│         (Logo, Búsqueda, Usuario, Notificaciones)            │
├──────────┬───────────────────────────────────┬───────────────┤
│          │                                   │               │
│ SIDEBAR  │          CONTENIDO PRINCIPAL      │  PANEL DERECHO│
│          │                                   │               │
│ - Logo   │        (Dashboard, Stats,         │  - Ranking    │
│ - Menú   │     Ranking, Admin, Historia)     │  - Hall Fame  │
│ - Stats  │                                   │ - Stats Rápido│
│ - User   │                                   |- Notifications│
│          │                                   │  - Historia   │
└──────────┴───────────────────────────────────┴───────────────┘
```

#### Componentes Desktop Principales

**Estructura de Navegación:**
- `Header.jsx` — Barra superior con logo, búsqueda, usuario
- `DashboardSidebar.jsx` — Sidebar izquierdo con navegación y stats
- `Footer.jsx` — Pie de página con enlaces

**Paneles Laterales Derechos:**
- `RightPanel.jsx` — Panel por defecto en Dashboard (Ranking top 5, Hall of Fame)
- `RankingRightPanel.jsx` — Panel en Ranking (estadísticas, progreso, logros próximos)
- `StatsRightPanel.jsx` — Panel en Stats (gráficos semanales, análisis, precisión)
- `EventsRightPanel.jsx` — Panel en Eventos (resumen de eventos recientes)
- `HistoryRightPanel.jsx` — Panel en Historia (navegación rápida, competiciones recientes)
- `TeamsRightPanel.jsx` — Panel de equipos históricos (equipos destacados, filtros rápidos)
- `RightNotesPanel.jsx` — Panel en Notas (últimas notas, filtros)
- `HallOfFamePanel.jsx` — Panel dedicado al Hall of Fame

**Páginas Desktop:**
- `DashboardPage.jsx`, `RankingPage.jsx`, `StatsPage.jsx`, `AdminPage.jsx`
- `WorldCupPage.jsx`, `NotesPage.jsx`, `NotificationsPage.jsx`
- `ProfileSettingsPage.jsx`, `HistoryPage.jsx`

#### Características Desktop Exclusivas

```
✅ Multi-panel display
   ├─ Sidebar + Contenido + Panel Derecho simultáneamente
   └─ Transiciones suaves entre secciones

✅ Interacciones avanzadas
   ├─ Hover effects en tarjetas
   ├─ Drag & drop en admin
   ├─ Modales amplios con múltiples tabs
   └─ Tooltips contextuales

✅ Información densa
   ├─ Tablas con 10+ columnas
   ├─ Gráficos grandes e interactivos
   ├─ Listados sin paginación (scroll)
   └─ Vista de cuadrícula flexible

✅ Productividad
   ├─ Atajos de teclado
   ├─ Búsqueda global
   ├─ Filtros avanzados
   └─ Exportación de datos
```

---

### 📱 MOBILE - Experiencia Optimizada (<768px)

La versión mobile está diseñada para usuarios en smartphones y tablets pequeños. Prioriza la usabilidad táctil y minimiza la navegación.

#### Layout Mobile Base

```
┌──────────────────────────────────┐
│      MOBILE HEADER               │
│ (Logo, Búsqueda, Menu Tres Rayas)│
├──────────────────────────────────┤
│                                  │
│                                  │
│      CONTENIDO PRINCIPAL         │
│      (Una columna, full-width)   │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│    BOTTOM NAVIGATION TABS        │
│ 🏠 Home |  Stat | 🏆 Ranking    │
│ 🌍 World | Perfil | ⚙️ Menú     │
└──────────────────────────────────┘
```

#### Componentes Mobile Principales

Cada feature tiene sus vistas mobile co-ubicadas en una subcarpeta `mobile/` dentro del propio feature:

- `MobileDashboard.jsx` — Cards apiladas, filtros simplificados, predicción inline
- `MobileRanking.jsx` — Podio comprimido, lista scrollable, búsqueda integrada
- `MobileStats.jsx` — Tabs horizontales, gráficos comprimidos, métricas en cards
- `MobileAdmin.jsx` — Tabs por sección, FAB flotante, swipe-to-delete
- `MobileProfileMain.jsx` — Hero comprimido, tabs de overview/historial/logros
- `MobileNotifications.jsx` — Toggle prominent, notificaciones por tipo
- `MobileNotes.jsx` — Crear nota rápida, lista ordenada por fecha, búsqueda
- `StyleSwitcher.jsx` — Toggle entre temas con persistencia

**Mobile de Historia (`features/history/components/mobile/`):**
- `HistoricalCompetitionsMobile.jsx` — Vista mobile de competiciones
- `HistoricalEventsMobile.jsx` — Vista mobile de eventos
- `HistoricalTeamsMobile.jsx` — Vista mobile de equipos
- `HistoryMenuMobile.jsx` — Menú de navegación mobile ⭐ NUEVO
- `KnockoutBracketMobile.jsx` — Bracket de eliminatorias en mobile ⭐ NUEVO
- `SectionHeaderMobile.jsx` — Header de sección reutilizable ⭐ NUEVO

#### Características Mobile Exclusivas

```
✅ Bottom Navigation
   ├─ 5-6 tabs siempre visibles
   ├─ Tap para navegar entre secciones
   └─ Activo/inactivo con indicador visual

✅ Interacciones táctiles
   ├─ Swipe horizontales para cambiar tabs
   ├─ Swipe left para opciones (editar, eliminar)
   ├─ Pull-to-refresh en listas
   ├─ Tap & hold para menú contextual
   └─ FAB (Floating Action Button) para crear

✅ Optimización visual
   ├─ Single column layout
   ├─ Texto más grande (16px base)
   ├─ Espaciado vertical aumentado (42px botones)
   ├─ Iconos grandes y claros
   └─ Colores de alto contraste

✅ Rendimiento
   ├─ Imágenes optimizadas (srcset)
   ├─ Lazy loading de componentes
   └─ No hay animaciones pesadas
```

---

### 🔄 Cambio Dinámico Desktop ↔ Mobile

```javascript
// En App.jsx - Hook para detectar cambios
const isMobile = useMediaQuery('(max-width: 768px)');

// El router redirige automáticamente:
return isMobile ? <MobileDashboard /> : <DashboardPage />
```

**Beneficios:** sin recargas de página, sin pérdida de scroll position, estado sincronizado, transición suave al rotar dispositivo.

---

### 🎨 Theming y Estilos

**Colores Base (Purple Theme):**
```css
Primary:     #8B5CF6 (Púrpura)
Secondary:   #EC4899 (Rosa)
Success:     #10B981 (Verde)
Warning:     #F59E0B (Ámbar)
Error:       #EF4444 (Rojo)
Background:  #F9FAFB (Gris muy claro)
Text:        #1F2937 (Gris oscuro)
```

---

### 📊 Comparativa Desktop vs Mobile

| Aspecto | Desktop | Mobile |
|---------|---------|--------|
| **Layout** | Sidebar + Contenido + Panel | Single Column |
| **Nav** | Sidebar + Header | Bottom Tabs + Header |
| **Información** | Multi-panel, densa | Secuencial, profunda |
| **Ancho Pantalla** | ≥768px | <768px |
| **Modales** | Ancho fijo (80vw) | Full-screen |
| **Tablas** | Múltiples columnas | Cards o tabs |
| **Interacción** | Click + Keyboard | Touch + Swipe |
| **Animaciones** | Complejas | Simples |

---

## 📜 Sistema de Historia

La sección de Historia es un módulo completo e independiente organizado como su propio feature (`src/features/history/`), con sub-páginas, navegación interna, hooks dedicados y capas de servicio propias.

### 🗂️ Estructura del Feature

```
src/features/history/
├── index.js
├── components/
│   ├── HistoricalCompetitionsPage.jsx
│   ├── HistoricalEventsPage.jsx
│   ├── HistoricalTeamsPage.jsx
│   ├── HistoryMenuDesktop.jsx        ⭐ NUEVO
│   ├── HistoryRightPanel.jsx
│   ├── HistorySectionNav.jsx
│   ├── HistoryWelcomeScreen.jsx      ⭐ NUEVO
│   ├── EventsRightPanel.jsx
│   ├── TeamsRightPanel.jsx
│   └── mobile/
│       ├── HistoricalCompetitionsMobile.jsx
│       ├── HistoricalEventsMobile.jsx
│       ├── HistoricalTeamsMobile.jsx
│       ├── HistoryMenuMobile.jsx     ⭐ NUEVO
│       ├── KnockoutBracketMobile.jsx ⭐ NUEVO
│       └── SectionHeaderMobile.jsx  ⭐ NUEVO
├── hooks/
│   ├── useHistoricalCompetitions.js
│   ├── useHistoricalEvents.js
│   ├── useHistoricalPlayers.js
│   └── useHistoricalTeams.js
├── page/
│   ├── HistoryPage.jsx
│   └── HistoryPage.css
├── services/
│   └── history.service.js           ⭐ NUEVO
├── styles/
│   ├── ActiveBadge.css              ⭐ NUEVO
│   ├── EventsRightPanel.css
│   ├── HistoricalCompetitionsPage.css
│   ├── HistoricalEventsPage.css
│   ├── HistoricalTeamsPage.css
│   ├── HistoryMenuDesktop.css       ⭐ NUEVO
│   ├── HistoryRightPanel.css
│   ├── HistorySectionNav.css
│   ├── HistoryWelcomeScreen.css     ⭐ NUEVO
│   ├── TeamsRightPanel.css
│   └── mobile/
│       ├── HistoricalCompetitionsPageMobile.css
│       ├── HistoricalTeamsMobile.css
│       ├── HistoryMenuMobile.css    ⭐ NUEVO
│       ├── HistoryPageMobile.css
│       ├── KnockoutBracketMobile.css ⭐ NUEVO
│       └── SectionHeaderMobile.css  ⭐ NUEVO
└── types/
    └── history.types.ts             ⭐ NUEVO
```

### 📋 Sub-páginas de Historia

**🏆 Competiciones Históricas** — registro completo de ligas, torneos y premios finalizados con campeón, goleador, asistidor, MVP, fechas y resultados de predicciones de usuarios.

**👥 Equipos Históricos** — galería y estadísticas de equipos participantes con logos, filtros por liga/región y panel lateral de detalle.

**📅 Eventos Históricos** — cronología de momentos y eventos significativos de la plataforma con filtros por fecha y categoría.

### 🧭 Navegación Interna

```
┌──────────────────────────────────────────────────────┐
│   📜 HISTORIA                                        │
│   [🏆 Competiciones] [👥 Equipos] [📅 Eventos]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│         Contenido de la sub-sección activa           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 🗃️ Flujo de Datos

```
Supabase (PostgreSQL)
    └── Tablas históricas (competitions, teams, events, players)
          └── history.service.js  (capa de acceso a datos)
                └── hooks/* (fetch + filtrado + estado)
                      └── Componentes (render + UI)
                            └── HistorySectionNav (navegación entre secciones)
```

---

## 🛡️ Panel de Administración

```
Admin Dashboard (Responsive: Desktop + Mobile)
├── 📋 Gestión de Partidos — Crear/Editar/Eliminar, logos automáticos
├── 🏆 Gestión de Ligas — Competiciones, deadlines, resultados finales
├── 🥇 Gestión de Premios Individuales
├── ⭐ Sistema de Logros — Crear logros, definir requisitos
├── 👑 Sistema de Títulos y Coronas
│   ├── AdminCrownModal.jsx — Modal dedicado para coronas
│   └── AdminCrownsSection.jsx — Sección de gestión de coronas
├── 🎖️ Gestión de Banners — Crear y asignar a usuarios
├── 📊 AdminStatsOverview — Vista general de stats
├── 🔧 AdminDiagnosticPanel — Diagnóstico y salud del sistema
└── 📜 DataImporter — Importación masiva de datos históricos
```

---

## 🔐 Autenticación Completa

- Registro de nuevos usuarios (`RegisterPage`)
- Login con email y contraseña
- Recuperación de contraseña (`ForgotPasswordPage`)
- Reset de contraseña via token (`ResetPasswordPage`)
- Rutas protegidas con `ProtectedRoute` y `RequireAuth`
- Servicios de auth encapsulados en `features/auth/services/auth.service.js` ⭐ NUEVO

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
  "stateManagement": "React Context API + Custom Hooks",
  "responsiveness": "CSS Media Queries + useMediaQuery Hook",
  "architecture": "Feature-Based (Domain-Driven)"
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

Ejecuta el script SQL en tu proyecto de Supabase (ver `schema.sql` en el repositorio), luego crea los siguientes buckets en Supabase Storage:

```
team-logos/     league-logos/     award-logos/     avatars/     banners/
```

### Edge Function de Push Notifications

```bash
supabase functions deploy send-match-notification
```

### GitHub Actions (reset semanal)

Añade en GitHub → Settings → Secrets:

```
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_service_role_key
```

El workflow `.github/workflows/weekly-reset.yml` ejecuta el reset cada lunes a las 00:00 UTC.

---

## 🏗️ Arquitectura Feature-Based

En **v1.4**, GlobalScore migró de una arquitectura organizada por tipo de archivo (`components/`, `hooks/`, `styles/`) a una **arquitectura feature-based** donde cada dominio de la aplicación es completamente autónomo.

### Principio General

```
src/features/
└── <feature>/
    ├── index.js          ← Exportaciones públicas del feature
    ├── components/       ← Componentes desktop
    │   └── mobile/       ← Variantes mobile co-ubicadas
    ├── hooks/            ← Lógica de estado y datos
    ├── page/             ← Página raíz + su CSS
    ├── services/         ← Acceso a datos (Supabase)
    ├── styles/           ← CSS del feature
    │   └── mobile/       ← CSS mobile del feature
    └── types/            ← TypeScript types (opcional)
```

### Beneficios

- **Cohesión**: todo lo de un feature vive junto; un solo lugar para buscar
- **Escalabilidad**: añadir un feature nuevo no toca otros módulos
- **Mantenibilidad**: borrar un feature es borrar una carpeta
- **Onboarding**: un desarrollador nuevo entiende el dominio sin rastrear carpetas globales

### Features Actuales

| Feature | Responsabilidad |
|---------|----------------|
| `admin` | Panel de administración completo |
| `auth` | Login, registro, rutas protegidas |
| `dashboard` | Feed de partidos, ligas y premios |
| `history` | Módulo de historia: competiciones, equipos, eventos |
| `notes` | Sistema de notas personales |
| `notifications` | Push notifications, centro de notificaciones |
| `profile` | Perfil público, estadísticas, logros |
| `ranking` | Tabla global, podio, Hall of Fame |
| `stats` | Estadísticas detalladas y gráficas |
| `worldcup` | Mundial 2026: grupos, bracket, premios |

---

## 📁 Estructura del Proyecto

```
globalscore/
│
├── public/
│   ├── .well-known/assetlinks.json   # Digital Asset Links (TWA/Android)
│   ├── manifest.json                 # Web App Manifest (PWA)
│   ├── sw.js                         # Service Worker
│   ├── offline.html                  # Página offline
│   └── pushNotifications.js          # Lógica de suscripción push
│
├── app/                              # Proyecto Android nativo (TWA)
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/.../twa/
│       │   ├── Application.java
│       │   ├── DelegationService.java
│       │   └── LauncherActivity.java
│       └── res/                      # Recursos Android
│
├── scripts/
│   └── generate-vapid-keys.cjs
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   └── features/                     ⭐ NUEVA ESTRUCTURA
│       │
│       ├── admin/
│       │   ├── index.js
│       │   ├── components/
│       │   │   ├── AdminAchievementsList.jsx
│       │   │   ├── AdminAchievementsModal.jsx
│       │   │   ├── AdminAssignBannerModal.jsx
│       │   │   ├── AdminAwardModal.jsx / AdminAwardsList.jsx
│       │   │   ├── AdminBannerModal.jsx / AdminBannersList.jsx
│       │   │   ├── AdminControls.jsx
│       │   │   ├── AdminCrownModal.jsx / AdminCrownsSection.jsx
│       │   │   ├── AdminDiagnosticPanel.jsx
│       │   │   ├── AdminLeagueModal.jsx / AdminLeaguesList.jsx
│       │   │   ├── AdminMatchesList.jsx
│       │   │   ├── AdminModal.jsx / AdminModalsContainer.jsx
│       │   │   ├── AdminNavigationTabs.jsx / AdminRightPanel.jsx
│       │   │   ├── AdminStatsOverview.jsx
│       │   │   ├── AdminTitlesList.jsx / AdminTitlesModal.jsx
│       │   │   ├── DataImporter.jsx
│       │   │   ├── FinishAwardModal.jsx / FinishLeagueModal.jsx / FinishMatchModal.jsx
│       │   │   └── mobile/
│       │   │       └── MobileAdmin.jsx
│       │   ├── hooks/
│       │   │   ├── useAdminAchievements.js / useAdminAwards.js
│       │   │   ├── useAdminBanners.js / useAdminCrowns.js
│       │   │   ├── useAdminData.js / useAdminHistorical.js
│       │   │   ├── useAdminLeagues.js / useAdminMatches.js
│       │   ├── page/
│       │   │   ├── AdminPage.jsx / AdminPage.css
│       │   ├── services/
│       │   │   └── admin.service.js
│       │   ├── styles/
│       │   │   ├── AdminBanners.css / AdminCrownModal.css
│       │   │   ├── AdminModal.css / AdminPanel.css
│       │   │   ├── AdminRightPanel.css / MobileAdmin.css
│       │   └── types/
│       │       └── admin.types.ts
│       │
│       ├── auth/
│       │   ├── components/
│       │   │   ├── ProtectedRoute.jsx / RequireAuth.jsx
│       │   ├── page/
│       │   │   ├── LoginPage.jsx / RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx / ResetPasswordPage.jsx
│       │   │   └── Auth.css
│       │   └── services/
│       │       └── auth.service.js
│       │
│       ├── dashboard/
│       │   ├── components/
│       │   │   ├── AwardCard.jsx / LeagueCard.jsx / MatchCard.jsx
│       │   │   ├── RightPanel.jsx
│       │   │   └── mobile/
│       │   │       ├── MobileDashboard.jsx / MobileCardsGlobal.jsx
│       │   ├── hooks/
│       │   │   ├── useAwards.js / useLeagues.js / useMatches.js
│       │   ├── page/
│       │   │   ├── DashboardPage.jsx / DashboardPage.css
│       │   ├── services/
│       │   │   └── dashboard.service.js
│       │   └── styles/
│       │       ├── AwardCard.css / LeagueCard.css / MatchCard.css
│       │       ├── MobileCardsGlobal.css / RightPanel.css
│       │
│       ├── history/                  ← (ver sección Historia arriba)
│       │
│       ├── notes/
│       │   ├── components/
│       │   │   ├── RightNotesPanel.jsx
│       │   │   └── mobile/MobileNotes.jsx
│       │   ├── hooks/useNotes.js
│       │   ├── page/NotesPage.jsx / NotesPage.css
│       │   ├── services/notes.service.js
│       │   └── styles/MobileNotes.css / RightNotesPanel.css
│       │
│       ├── notifications/
│       │   ├── components/
│       │   │   ├── PushNotificationsToggle.jsx
│       │   │   └── mobile/MobileNotifications.jsx
│       │   ├── hooks/usePushNotifications.js
│       │   ├── page/NotificationsPage.jsx / NotificationsPage.css
│       │   ├── services/notifications.service.js
│       │   └── styles/...
│       │
│       ├── profile/
│       │   ├── components/
│       │   │   ├── AchievementsTab.jsx / AvatarUpload.jsx
│       │   │   ├── EditTab.jsx / HistoryTab.jsx
│       │   │   ├── MonthlyChampionshipsTab.jsx / OverviewTab.jsx
│       │   │   ├── ProfileHero.jsx / ProfileTabs.jsx
│       │   │   ├── UserProfilePanel.jsx
│       │   │   └── mobile/MobileUserProfile.jsx
│       │   ├── hooks/
│       │   │   ├── useAchievements.js / useMonthlyChampionships.js
│       │   │   ├── usePredictionHistory.js / useProfileData.js
│       │   │   ├── useStreaks.js / useUserRanking.js
│       │   ├── page/ProfileSettingsPage.jsx
│       │   └── styles/...
│       │
│       ├── ranking/
│       │   ├── components/
│       │   │   ├── HallOfFame.jsx / HallOfFamePanel.jsx
│       │   │   ├── RankingRightPanel.jsx
│       │   │   └── mobile/MobileRanking.jsx
│       │   ├── page/RankingPage.jsx
│       │   └── styles/...
│       │
│       ├── stats/
│       │   ├── components/
│       │   │   ├── StatsRightPanel.jsx
│       │   │   └── mobile/MobileStats.jsx
│       │   ├── page/StatsPage.jsx
│       │   └── styles/...
│       │
│       └── worldcup/
│           ├── components/
│           │   ├── KnockoutMatchCard.jsx / KnockoutSection.jsx
│           │   ├── RightPanelWorld.jsx / WorldCupAwardCard.jsx
│           │   ├── WorldCupNavigationTabs.jsx
│           │   └── mobile/MobileWorldCup.jsx
│           ├── hooks/useKnockoutBracket.js / useWorldCup.js
│           ├── page/WorldCupPage.jsx
│           └── styles/...
│
├── supabase/
│   └── functions/send-match-notification/  # Edge Function (Deno)
│
├── .github/
│   └── workflows/weekly-reset.yml
│
├── twa-manifest.json
├── schema.sql
├── render.yaml
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.js
```

---

## ✨ Novedades en v1.4

### 🏗️ Migración a Arquitectura Feature-Based (Cambio Principal)

La reestructuración más grande del proyecto: `src/components/`, `src/hooks/`, y `src/styles/` fueron reemplazados por `src/features/`, donde cada dominio es completamente autónomo.

**Antes (por tipo):**
```
src/
├── components/ComAdmin/, ComHistory/, ComMobile/, ComPanels/...
├── hooks/HooksAdmin/, HooksHistory/, HooksProfile/...
└── styles/StylesAdmin/, StylesHistory/, StylesMobile/...
```

**Ahora (por feature/dominio):**
```
src/features/
├── admin/    (components + hooks + page + services + styles + types)
├── auth/     (components + page + services)
├── dashboard/(components + hooks + page + services + styles)
├── history/  (components + hooks + page + services + styles + types)
├── notes/    (components + hooks + page + services + styles)
└── ...
```

Cada feature tiene una capa de **servicio dedicada** (`*.service.js`) que encapsula el acceso a Supabase, separando la lógica de datos de la UI.

### 📜 Mejoras al Módulo de Historia

- **`HistoryMenuDesktop.jsx`** — Nuevo menú de navegación dedicado para desktop
- **`HistoryMenuMobile.jsx`** — Menú de navegación mobile específico para historia
- **`HistoryWelcomeScreen.jsx`** — Pantalla de bienvenida al módulo histórico
- **`KnockoutBracketMobile.jsx`** — Vista de bracket de eliminatorias adaptada a mobile
- **`SectionHeaderMobile.jsx`** — Componente de header de sección reutilizable en mobile
- **`history.service.js`** — Capa de servicio dedicada para todas las consultas históricas
- **`history.types.ts`** — Tipos TypeScript del dominio histórico
- **`ActiveBadge.css`** — Estilos para badge de sección activa en navegación

### 🔧 Capas de Servicio Nuevas

Cada feature ahora cuenta con un archivo `*.service.js` que centraliza el acceso a datos:

- `admin.service.js`
- `auth.service.js`
- `dashboard.service.js`
- `history.service.js`
- `notes.service.js`
- `notifications.service.js`

### 📦 TypeScript Types

Nuevos archivos de tipos para features con modelos de datos complejos:

- `admin.types.ts`
- `history.types.ts`

---

## 🗺️ Roadmap

### ✅ Completado (v1.0 — v1.4)

- [x] Sistema de autenticación completo
- [x] Predicciones de partidos con puntos
- [x] Predicciones de ligas y premios individuales
- [x] Sistema de logros, títulos y coronas
- [x] Banners de perfil personalizables
- [x] Avatar upload
- [x] Ranking global con podio y Hall of Fame
- [x] Campeonatos mensuales con historial
- [x] Panel de administración completo
- [x] Mundial 2026 (Fase de grupos + Eliminatorias)
- [x] **Responsive design + vistas móviles dedicadas** ⭐
- [x] Push Notifications vía VAPID/Web Push
- [x] Soporte offline con Service Worker
- [x] PWA completa
- [x] App Android compilada y firmada via TWA
- [x] GitHub Actions para reset semanal
- [x] Sistema de Notas Personales
- [x] StyleSwitcher en Mobile
- [x] Módulo de Historia completo
- [x] Sub-navegación interna de Historia
- [x] DataImporter para datos históricos
- [x] Paneles laterales especializados
- [x] **Migración a arquitectura feature-based** ⭐ NUEVO
- [x] **Capas de servicio por dominio** ⭐ NUEVO
- [x] **TypeScript types por feature** ⭐ NUEVO
- [x] **Bracket de eliminatorias histórico en mobile** ⭐ NUEVO
- [x] **Welcome screen del módulo de Historia** ⭐ NUEVO

### 🚧 En Progreso (v1.5)

- [ ] **Google Play Store**: Publicación oficial
- [ ] **Chat Global**: Comunidad integrada
- [ ] **Ligas Privadas**: Competencias entre grupos cerrados

### 📋 Planeado (v2.0)

- [ ] **Integración con APIs**: Resultados automáticos
- [ ] **Sistema de Monedas**: Economía virtual
- [ ] **Tienda**: Compra de avatares y temas
- [ ] **Torneos Personalizados**: Crea tus propias ligas
- [ ] **Predicciones en Vivo**: Durante el partido
- [ ] **Social Sharing**: Compartir predicciones en redes

### 🔮 Futuro (v3.0)

- [ ] **AI Predictions**: Asistente con IA
- [ ] **Analytics Avanzados**: ML para recomendaciones

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar GlobalScore:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Código

- ✅ Componentes en **PascalCase**
- ✅ Funciones y hooks en **camelCase**
- ✅ **Feature-based**: cada dominio en su propia carpeta bajo `src/features/`
- ✅ Cada feature expone sus exports públicos via `index.js`
- ✅ Componentes mobile co-ubicados en `components/mobile/` del feature
- ✅ CSS del feature en `styles/`, CSS mobile en `styles/mobile/`
- ✅ Acceso a datos solo a través de `services/*.service.js`
- ✅ CSS classes en **kebab-case**
- ✅ Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ Responsive: Siempre considerar Desktop Y Mobile

### Reportar Bugs

Usa el [issue tracker](https://github.com/jsebasvgg7/GlobalScore/issues) con:
- Descripción clara del bug
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible
- Device info (Desktop/Mobile, navegador, tamaño pantalla)

---

## 📞 Contacto

**Hermanos Vega** — Desarrolladores

- 📧 Email: [globalscore.oficial@gmail.com](mailto:globalscore.oficial@gmail.com)
- 🌐 Web: [https://globalscore.onrender.com/app](https://globalscore.onrender.com/app)

**Repositorio**: [https://github.com/jsebasvgg7/GlobalScore](https://github.com/jsebasvgg7/GlobalScore)

---

## 🫱🏼‍🫲🏼 Colaboradores

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

### 🙏 Agradecimientos Personales

- [Francisco Diaz](https://www.instagram.com/f_dixxz7)
- [Bryan Tuñon](https://www.instagram.com/bry4n._tdc)
- [Mahicol Hurtado](https://www.instagram.com/tmichael_27)

---

<div align="center">

### ⭐ Si te gusta el proyecto, dale una estrella en GitHub

**Zentryx & StarkSoft © 2026**

[⬆ Volver arriba](#-globalscore)

</div>