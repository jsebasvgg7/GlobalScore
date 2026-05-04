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
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Novedades en v1.3](#-novedades-en-v13)
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
- **Historia Completa**: Registro detallado de competiciones, equipos y eventos históricos ⭐ NUEVO

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

📜 Historia (NUEVO)
├── Competiciones históricas con resultados completos
├── Equipos históricos con estadísticas
├── Eventos y momentos destacados
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
- **Archivo Histórico**: Registro permanente de competiciones y eventos pasados ⭐ NUEVO

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
- **Historia navegable**: Secciones de historia con navegación interna propia ⭐ NUEVO

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
- `Header.jsx` - Barra superior con logo, búsqueda, usuario
- `DashboardSidebar.jsx` - Sidebar izquierdo con navegación y stats
- `Footer.jsx` - Pie de página con enlaces

**Paneles Laterales Derechos (ComPanels/):**
- `RightPanel.jsx` - Panel por defecto en Dashboard
  - Muestra: Ranking top 5, Hall of Fame, puntos destacados
  
- `RankingRightPanel.jsx` - Panel en página de Ranking
  - Muestra: Estadísticas de usuario, progreso, logros próximos
  
- `StatsRightPanel.jsx` - Panel en página de Stats
  - Muestra: Gráficos semanales, análisis, precisión

- `EventsRightPanel.jsx` - Panel en página de Eventos ⭐ NUEVO
  - Muestra: Resumen de eventos recientes y destacados
  
- `HistoryRightPanel.jsx` - Panel en página de Historia ⭐ NUEVO
  - Muestra: Navegación rápida, competiciones recientes, estadísticas históricas

- `TeamsRightPanel.jsx` - Panel de equipos históricos ⭐ NUEVO
  - Muestra: Equipos más destacados, filtros rápidos

- `RightNotesPanel.jsx` - Panel en página de Notas
  - Muestra: Últimas notas, análisis, filtros
  
- `HallOfFamePanel.jsx` - Panel dedicado al Hall of Fame
  - Muestra: Ranking histórico, badges, logros

**Tarjetas y Elementos (ComCards/):**
- `MatchCard.jsx` - Tarjeta de partido con predicción
- `LeagueCard.jsx` - Tarjeta de liga con pronóstico
- `AwardCard.jsx` - Tarjeta de premios individuales
- `KnockoutMatchCard.jsx` - Tarjeta de playoff en el Mundial

**Páginas Desktop:**
- `DashboardPage.jsx` - Inicio con últimos partidos
- `RankingPage.jsx` - Ranking global con paneles
- `StatsPage.jsx` - Estadísticas detalladas
- `AdminPage.jsx` - Panel de administración completo
- `WorldCupPage.jsx` - Mundial 2026 con bracket visual
- `NotesPage.jsx` - Gestión de notas personales
- `NotificationsPage.jsx` - Centro de notificaciones
- `ProfileSettingsPage.jsx` - Configuración de perfil
- `HistoryPage.jsx` - Página de Historia con sub-navegación ⭐ NUEVO

**Paneles Laterales Especializados:**
- Perfil de usuario expandido en modal
- Historial de predicciones con filtros
- Logros y coronas desbloqueables
- Banners y personalización

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

#### Componentes Mobile Principales (ComMobile/)

**Navegación y Layout:**
- `MobileHeader.jsx` - Header adaptado con menú toggle
- `NavigationTabs.jsx` - Bottom navigation con 5-6 tabs principales
- `MobileSubPage.jsx` - Wrapper para sub-páginas

**Vistas Especializadas por Página:**

1. **MobileDashboard.jsx** - Dashboard móvil
   - Cards de partidos apiladas verticalmente
   - Filtros simplificados (Liga, Estado)
   - Predicción inline rápida
   - Últimas predicciones en accordion

2. **MobileRanking.jsx** - Ranking móvil
   - Podio comprimido (3 posiciones destacadas)
   - Lista scrollable de posiciones 4-N
   - Búsqueda de usuario integrada
   - Avatar del usuario actual sticky en top

3. **MobileStats.jsx** - Estadísticas móvil
   - Tabs horizontales (Resumen, Por Liga, Semanal)
   - Gráficos comprimidos pero legibles
   - Metricas principales en cards
   - Scroll horizontal para tablas

4. **MobileAdmin.jsx** - Admin móvil
   - Tabs de navegación: Partidos, Ligas, Premios, Logros, Banners, Coronas
   - Cada tab tiene lista + modal para crear/editar
   - Botón FAB flotante para crear nuevos items
   - Swipe left para eliminar (con confirmación)

5. **MobileProfileMain.jsx** - Perfil móvil
   - Hero comprimido (avatar, nivel, título)
   - Tabs: Overview, Historial, Logros, Campeonatos
   - Cada tab con contenido adaptado
   - Avatar upload en modal

6. **MobileNotifications.jsx** - Notificaciones móvil
   - Toggle de push notifications prominent
   - Lista de notificaciones recientes
   - Notificaciones by type (Partidos, Sistema, Logros)

7. **MobileNotes.jsx** - Notas móvil
   - Crear nota rápida (textarea + botón)
   - Lista de notas ordenadas por fecha
   - Cada nota: preview + opciones (editar, eliminar)
   - Búsqueda de notas por contenido

8. **StyleSwitcher.jsx** - Selector de estilos
   - Toggle entre temas disponibles
   - Colores adaptativos
   - Persistencia en localStorage

**Tarjetas Mobile:**
- `MobileCardsGlobal.jsx` - Envoltorio adaptativo para MatchCard, LeagueCard, etc.
  - Reduce padding/margen en mobile
  - Oculta información secundaria
  - Acciones en dropdown menú

#### Características Mobile Exclusivas

```
✅ Bottom Navigation
   ├─ 5-6 tabs siempre visibles
   ├─ Tap para navegar entre secciones
   ├─ Activo/inactivo con indicador visual
   └─ Atajos a las 5 páginas principales

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

✅ Menos información, más profundidad
   ├─ Listados cortos con paginación/lazy-load
   ├─ Modales a full-screen
   ├─ Accordion para agrupar contenido
   ├─ Tabs horizontales comprimidas
   └─ Ocultar información secundaria

✅ Rendimiento
   ├─ Imágenes optimizadas (srcset)
   ├─ Lazy loading de componentes
   ├─ CSS-in-JS minimizado
   └─ No hay animaciones pesadas
```

---

### 🔄 Cambio Dinámico Desktop ↔ Mobile

El cambio entre desktop y mobile es **completamente transparente** para el usuario:

```javascript
// En App.jsx - Hook para detectar cambios
const isMobile = useMediaQuery('(max-width: 768px)');

// El router redirige automáticamente:
return isMobile ? <MobileDashboard /> : <DashboardPage />
```

**Beneficios:**
- ✅ Sin recargas de página
- ✅ Sin pérdida de scroll position
- ✅ Estado sincronizado entre vistas
- ✅ Transición suave al rotar dispositivo

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

**Responsividad CSS:**
```css
/* Desktop (≥768px) */
@media (min-width: 768px) {
  .sidebar { display: block; width: 250px; }
  .right-panel { display: block; width: 300px; }
  .main-content { flex: 1; }
}

/* Mobile (<768px) */
@media (max-width: 767px) {
  .sidebar { display: none; }
  .right-panel { display: none; }
  .main-content { width: 100%; }
  .nav-tabs { position: fixed; bottom: 0; }
}
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
| **Scroll** | Vertical principal | Vertical + Horizontal |
| **Animaciones** | Complejas | Simples |
| **Imágenes** | Tamaño completo | Optimizadas, srcset |

---

## 📜 Sistema de Historia

La sección de Historia es un módulo completo e independiente que actúa como un **archivo permanente** de todo lo que ha ocurrido en la plataforma. Tiene su propio sistema de navegación interna y sub-páginas dedicadas, tanto en desktop como en mobile.

### 🗂️ Estructura General

```
HistoryPage.jsx  (página raíz — desktop)
└── HistorySectionNav.jsx  (barra de navegación interna)
    ├── HistoricalCompetitionsPage.jsx  → Competiciones
    ├── HistoricalTeamsPage.jsx         → Equipos
    └── HistoricalEventsPage.jsx        → Eventos
```

### 📋 Sub-páginas de Historia

#### 🏆 Competiciones Históricas (`HistoricalCompetitionsPage`)
Muestra el registro completo de competiciones pasadas: ligas, torneos y premios finalizados. Cada competición incluye:
- Campeón, goleador, asistidor y MVP registrados
- Fecha de inicio y cierre
- Resultados finales de predicciones de los usuarios
- Filtros por temporada y tipo de competición

#### 👥 Equipos Históricos (`HistoricalTeamsPage`)
Galería y estadísticas de los equipos que han participado en las competiciones:
- Información de cada equipo con logo
- Estadísticas históricas de participación
- Filtros por liga o región
- Panel lateral con detalle al seleccionar un equipo

#### 📅 Eventos Históricos (`HistoricalEventsPage`)
Cronología de momentos y eventos significativos de la plataforma:
- Registro de partidos y resultados destacados
- Momentos especiales (primeros goles, récords, etc.)
- Filtros por fecha y categoría
- Vista de línea de tiempo o cuadrícula

### 🧭 Navegación Interna (`HistorySectionNav`)

La sección de Historia tiene su **propia barra de navegación** independiente del Header principal, lo que permite al usuario moverse entre sub-secciones sin perder el contexto:

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

### 🪝 Hooks de Historia (`HooksHistory/`)

Cada sub-página de historia tiene su propio hook dedicado con lógica de carga, filtrado y paginación:

| Hook | Responsabilidad |
|------|----------------|
| `useHistoricalCompetitions.js` | Carga y filtra competiciones pasadas |
| `useHistoricalTeams.js` | Obtiene equipos y sus estadísticas históricas |
| `useHistoricalEvents.js` | Gestiona eventos y momentos destacados |
| `useHistoricalPlayers.js` | Jugadores y estadísticas a lo largo del tiempo |

### 📱 Historia en Mobile

La sección de Historia también cuenta con vistas mobile dedicadas y sus propios archivos de estilos:

```
StylesMobile/
├── HistoricalCompetitionsPageMobile.css
├── HistoricalEventsPageMobile.css
├── HistoricalTeamsPageMobile.css
└── HistoryPageMobile.css

StylesHistory/
├── HistoricalCompetitionsPage.css
├── HistoricalEventsPage.css
├── HistoricalTeamsPage.css
└── HistorySectionNav.css
```

### 🎴 Componentes de Apoyo

- **`HistoryTriggerCard.jsx`** (`ComOthers/`) — Tarjeta/botón que aparece en el Dashboard para invitar al usuario a explorar la sección de Historia. Muestra un resumen atractivo con el último evento o competición registrada.
- **`HistoryPanel.jsx`** (`ComOthers/`) — Panel compacto reutilizable que muestra un resumen del historial en contextos externos (ej. sidebar del perfil).
- **`HistoryRightPanel.jsx`** (`ComPanels/`) — Panel derecho exclusivo de la página de Historia en desktop, con accesos rápidos y estadísticas resumidas.
- **`DataImporter.jsx`** (`ComOthers/`) — Herramienta de administración para importar datos históricos masivamente (partidos, equipos, eventos) desde archivos externos.

### 🗃️ Flujo de Datos

```
Supabase (PostgreSQL)
    └── Tablas históricas (competitions, teams, events, players)
          └── HooksHistory/* (fetch + filtrado)
                └── Sub-páginas (render + UI)
                      └── HistorySectionNav (navegación entre secciones)
```

---

## 🛡️ Panel de Administración

```
Admin Dashboard (Responsive: Desktop + Mobile)
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
│   ├── AdminCrownModal.jsx — Modal dedicado para coronas (NUEVO)
│   ├── AdminCrownsSection.jsx — Sección de gestión de coronas (NUEVO)
│   └── Vincular con logros
├── 🎖️ Gestión de Banners
│   ├── Crear y administrar banners
│   └── Asignar banners a usuarios específicos
├── 📊 Vista General de Stats (AdminStatsOverview)
└── 🔧 Panel de Diagnóstico (AdminDiagnosticPanel)
```

**Componentes Admin:**
- `AdminControls.jsx` - Controles principales
- `AdminNavigationTabs.jsx` - Navegación entre secciones
- `AdminRightPanel.jsx` - Panel de opciones avanzadas
- `AdminModalsContainer.jsx` - Contenedor centralizado de modales
- `AdminCrownModal.jsx` - Modal para gestión de coronas ⭐ NUEVO
- `AdminCrownsSection.jsx` - Sección dedicada a coronas ⭐ NUEVO
- `AdminDiagnosticPanel.jsx` - Diagnóstico y salud del sistema

---

## 🔐 Autenticación Completa

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
  "stateManagement": "React Context API + Custom Hooks",
  "responsiveness": "CSS Media Queries + useMediaQuery Hook"
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
- 🎣 **Custom Hooks Granulares**: Organizados por dominio (`HooksAdmin`, `HooksCards`, `HooksHistory`, `HooksProfile`, `HooksNotes`, `HooksOthers`, `HooksSettings`)
- 🎨 **Tailwind CSS + CSS Variables**: Theming dinámico y utilitarios
- 🖼️ **Lazy Loading**: Optimización de imágenes
- 📱 **PWA Completa**: Service Worker, manifest, íconos maskables, página offline, sincronización offline
- 🔔 **Push Notifications**: VAPID/Web Push con encriptación AES-128-GCM extremo a extremo
- 🔒 **Row Level Security**: Políticas de seguridad en Supabase
- 🤖 **TWA Android**: App nativa compilada y firmada para Google Play
- 🔄 **GitHub Actions**: Reset semanal automatizado de estadísticas (cron: lunes 00:00 UTC)
- 🛠️ **Scripts de diagnóstico**: Utilidades para mantener la base de datos
- 📜 **Módulo de Historia**: Sistema completo de archivo histórico con sub-navegación

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

avatars/           ← Fotos de perfil de usuarios
banners/           ← Banners de perfil personalizados
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
│   ├── generate-vapid-keys.cjs     # Generador de claves VAPID
│   ├── diagnoseDatabase.js         # Diagnóstico de BD
│   ├── checkDatabaseFunctions.js   # Verificación de funciones
│   ├── reset-weekly.js             # Reset semanal de stats
│   ├── listLeagues.js              # Listar ligas
│   ├── listTeams.js                # Listar equipos
│   ├── updateLeagueLogos.js        # Actualizar logos
│   └── ... (más scripts de utilidad)
│
├── src/
│   ├── components/
│   │   ├── ComAdmin/               # Panel de administración (24 componentes)
│   │   │   ├── AdminAchievementsList.jsx
│   │   │   ├── AdminAchievementsModal.jsx
│   │   │   ├── AdminAssignBannerModal.jsx
│   │   │   ├── AdminAwardModal.jsx
│   │   │   ├── AdminAwardsList.jsx
│   │   │   ├── AdminBannerModal.jsx
│   │   │   ├── AdminBannersList.jsx
│   │   │   ├── AdminControls.jsx
│   │   │   ├── AdminCrownModal.jsx         # NUEVO
│   │   │   ├── AdminCrownsSection.jsx      # NUEVO
│   │   │   ├── AdminDiagnosticPanel.jsx
│   │   │   ├── AdminLeagueModal.jsx
│   │   │   ├── AdminLeaguesList.jsx
│   │   │   ├── AdminMatchesList.jsx
│   │   │   ├── AdminModal.jsx
│   │   │   ├── AdminModalsContainer.jsx
│   │   │   ├── AdminNavigationTabs.jsx
│   │   │   ├── AdminRightPanel.jsx
│   │   │   ├── AdminStatsOverview.jsx
│   │   │   ├── AdminTitlesList.jsx
│   │   │   ├── AdminTitlesModal.jsx
│   │   │   ├── FinishAwardModal.jsx
│   │   │   ├── FinishLeagueModal.jsx
│   │   │   └── FinishMatchModal.jsx
│   │   │
│   │   ├── ComAuth/                # Rutas protegidas
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RequireAuth.jsx
│   │   │
│   │   ├── ComCards/               # Tarjetas reutilizables
│   │   │   ├── AwardCard.jsx
│   │   │   ├── LeagueCard.jsx
│   │   │   ├── MatchCard.jsx
│   │   │   └── MobileCardsGlobal.jsx
│   │   │
│   │   ├── ComFeedback/            # Loaders, spinners, toasts
│   │   │   ├── GlobalLoader.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LoadingStates.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── ComHistory/             # Sección de Historia (NUEVO)
│   │   │   ├── HistoricalCompetitionsPage.jsx
│   │   │   ├── HistoricalEventsPage.jsx
│   │   │   ├── HistoricalTeamsPage.jsx
│   │   │   └── HistorySectionNav.jsx
│   │   │
│   │   ├── ComLayout/              # Layout base
│   │   │   ├── DashboardSidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── MobileHeader.jsx
│   │   │
│   │   ├── ComMobile/              # Vistas móviles (9 componentes)
│   │   │   ├── MobileAdmin.jsx
│   │   │   ├── MobileDashboard.jsx
│   │   │   ├── MobileNotes.jsx
│   │   │   ├── MobileNotifications.jsx
│   │   │   ├── MobileProfileMain.jsx
│   │   │   ├── MobileRanking.jsx
│   │   │   ├── MobileStats.jsx
│   │   │   ├── MobileSubPage.jsx
│   │   │   └── StyleSwitcher.jsx
│   │   │
│   │   ├── ComNavigation/          # Navegación
│   │   │   └── NavigationTabs.jsx
│   │   │
│   │   ├── ComNotis/               # Push notifications
│   │   │   └── PushNotificationsToggle.jsx
│   │   │
│   │   ├── ComOthers/              # Componentes especiales
│   │   │   ├── AchievementsSection.jsx
│   │   │   ├── DataImporter.jsx           # NUEVO
│   │   │   ├── HallOfFame.jsx
│   │   │   ├── HistoryPanel.jsx           # NUEVO
│   │   │   ├── HistoryTriggerCard.jsx     # NUEVO
│   │   │   └── ImageViewer.jsx
│   │   │
│   │   ├── ComPanels/              # Paneles laterales derechos
│   │   │   ├── EventsRightPanel.jsx       # NUEVO
│   │   │   ├── HallOfFamePanel.jsx
│   │   │   ├── HistoryRightPanel.jsx      # NUEVO
│   │   │   ├── RankingRightPanel.jsx
│   │   │   ├── RightNotesPanel.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   ├── StatsRightPanel.jsx
│   │   │   └── TeamsRightPanel.jsx        # NUEVO
│   │   │
│   │   ├── ComProfile/             # Perfil completo (10 componentes)
│   │   │   ├── AchievementsTab.jsx
│   │   │   ├── AvatarUpload.jsx
│   │   │   ├── EditTab.jsx
│   │   │   ├── HistoryTab.jsx
│   │   │   ├── MobileUserProfile.jsx
│   │   │   ├── MonthlyChampionshipsTab.jsx
│   │   │   ├── OverviewTab.jsx
│   │   │   ├── ProfileHero.jsx
│   │   │   ├── ProfileTabs.jsx
│   │   │   └── UserProfilePanel.jsx
│   │   │
│   │   ├── ComPWA/                 # PWA
│   │   │   └── InstallPWAButton.jsx
│   │   │
│   │   └── ComWorldCup/            # Mundial 2026
│   │       ├── KnockoutMatchCard.jsx
│   │       ├── KnockoutSection.jsx
│   │       ├── RightPanelWorld.jsx
│   │       ├── WorldCupAwardCard.jsx
│   │       └── WorldCupNavigationTabs.jsx
│   │
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useDataLoader.js
│   │   ├── usePWA.js
│   │   ├── HooksAdmin/             # Hooks de admin (8 hooks)
│   │   │   ├── index.js
│   │   │   ├── useAdminAchievements.js
│   │   │   ├── useAdminAwards.js
│   │   │   ├── useAdminBanners.js
│   │   │   ├── useAdminCrowns.js
│   │   │   ├── useAdminData.js
│   │   │   ├── useAdminHistorical.js      # NUEVO
│   │   │   ├── useAdminLeagues.js
│   │   │   └── useAdminMatches.js
│   │   ├── HooksCards/             # Hooks de tarjetas
│   │   │   ├── useAwards.js
│   │   │   ├── useLeagues.js
│   │   │   └── useMatches.js
│   │   ├── HooksHistory/           # Hooks de Historia (NUEVO — 4 hooks)
│   │   │   ├── useHistoricalCompetitions.js
│   │   │   ├── useHistoricalEvents.js
│   │   │   ├── useHistoricalPlayers.js
│   │   │   └── useHistoricalTeams.js
│   │   ├── HooksNotes/             # Hooks de notas
│   │   │   └── useNotes.js
│   │   ├── HooksOthers/            # Hooks especiales
│   │   │   ├── useKnockoutBracket.js
│   │   │   ├── usePushNotifications.js
│   │   │   └── useWorldCup.js
│   │   ├── HooksProfile/           # Hooks de perfil (6 hooks)
│   │   │   ├── useAchievements.js
│   │   │   ├── useMonthlyChampionships.js
│   │   │   ├── usePredictionHistory.js
│   │   │   ├── useProfileData.js
│   │   │   ├── useStreaks.js
│   │   │   └── useUserRanking.js
│   │   └── HooksSettings/          # Hooks de configuración
│   │       ├── index.js
│   │       └── useSettings.js
│   │
│   ├── pages/
│   │   ├── AdminPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── HistoryPage.jsx             # NUEVO — Página de Historia
│   │   ├── LoginPage.jsx
│   │   ├── NotesPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── ProfileSettingsPage.jsx
│   │   ├── RankingPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── StatsPage.jsx
│   │   └── WorldCupPage.jsx
│   │
│   ├── scripts/                    # Scripts utilitarios de BD
│   │   ├── checkDatabaseFunctions.js
│   │   ├── diagnoseDatabase.js
│   │   ├── listLeagues.js
│   │   ├── listTeams.js
│   │   ├── reset-weekly.js
│   │   ├── updateLeagueLogos.js
│   │   ├── updateLeagueLogosWithServiceRole.js
│   │   ├── updateLogosImproved.js
│   │   ├── updateLogosWithServiceRole.js
│   │   └── updateLogoUrls.js
│   │
│   ├── services/
│   │   ├── offlineSync.js          # Sincronización offline
│   │   ├── pushManager.js          # Gestión de push notifications
│   │   └── pwaService.js           # Helpers de PWA
│   │
│   ├── styles/
│   │   ├── layout.css              # Estilos generales
│   │   ├── StylesAdmin/            # Estilos admin
│   │   │   ├── AdminBanners.css
│   │   │   ├── AdminCrownModal.css
│   │   │   ├── AdminModal.css
│   │   │   ├── AdminPage.css
│   │   │   ├── AdminPanel.css
│   │   │   └── AdminRightPanel.css
│   │   ├── StylesCards/            # Estilos de tarjetas
│   │   │   ├── AwardCard.css
│   │   │   ├── KnockoutMatchCard.css
│   │   │   ├── LeagueCard.css
│   │   │   ├── MatchCard.css
│   │   │   └── MobileCardsGlobal.css
│   │   ├── StylesFeedback/         # Estilos de feedback
│   │   │   ├── GlobalLoader.css
│   │   │   ├── LoadingSpinner.css
│   │   │   ├── LoadingStates.css
│   │   │   └── Toast.css
│   │   ├── StylesHistory/          # Estilos de Historia (NUEVO)
│   │   │   ├── HistoricalCompetitionsPage.css
│   │   │   ├── HistoricalEventsPage.css
│   │   │   ├── HistoricalTeamsPage.css
│   │   │   └── HistorySectionNav.css
│   │   ├── StylesLayout/           # Estilos de layout
│   │   │   ├── DashboardSidebar.css
│   │   │   ├── Footer.css
│   │   │   ├── Header.css
│   │   │   ├── MobileHeader.css
│   │   │   └── RankingSidebar.css
│   │   ├── StylesMobile/           # Estilos móviles
│   │   │   ├── HeaderMobile.css
│   │   │   ├── HistoricalCompetitionsPageMobile.css  # NUEVO
│   │   │   ├── HistoricalEventsPageMobile.css        # NUEVO
│   │   │   ├── HistoricalTeamsPageMobile.css         # NUEVO
│   │   │   ├── HistoryPageMobile.css                 # NUEVO
│   │   │   ├── MobileAdmin.css
│   │   │   ├── MobileDashboard.css
│   │   │   ├── MobileNotes.css
│   │   │   ├── MobileNotifications.css
│   │   │   ├── MobileProfileMain.css
│   │   │   ├── MobileRanking.css
│   │   │   ├── MobileStats.css
│   │   │   ├── MobileSubPage.css
│   │   │   ├── MobileWorldCup.css
│   │   │   └── StyleSwitcher.css
│   │   ├── StylesNavigation/       # Estilos navegación
│   │   │   └── NavigationTabs.css
│   │   ├── StylesOthers/           # Estilos especiales
│   │   │   ├── HistoryPanel.css
│   │   │   ├── HistoryTriggerCard.css
│   │   │   ├── ImageViewer.css
│   │   │   └── KnockoutSection.css
│   │   ├── StylesPages/            # Estilos de páginas
│   │   │   ├── Auth.css
│   │   │   ├── DashboardPage.css
│   │   │   ├── HallOfFame.css
│   │   │   ├── HistoryPage.css     # NUEVO
│   │   │   ├── NotesPage.css
│   │   │   ├── NotificationsPage.css
│   │   │   ├── ProfileSettingsPage.css
│   │   │   ├── RankingPage.css
│   │   │   ├── StatsPage.css
│   │   │   └── WorldCupPage.css
│   │   ├── StylesPanels/           # Estilos paneles
│   │   │   ├── EventsRightPanel.css      # NUEVO
│   │   │   ├── HallOfFamePanel.css
│   │   │   ├── HistoryRightPanel.css     # NUEVO
│   │   │   ├── RankingRightPanel.css
│   │   │   ├── RightNotesPanel.css
│   │   │   ├── RightPanel.css
│   │   │   ├── RightPanelWorld.css
│   │   │   ├── StatsRightPanel.css
│   │   │   └── TeamsRightPanel.css       # NUEVO
│   │   ├── StylesProfile/          # Estilos perfil
│   │   │   ├── MobileUserProfile.css
│   │   │   ├── ProfileBase.css
│   │   │   ├── ProfileEdit.css
│   │   │   ├── ProfileHero.css
│   │   │   ├── ProfileHistory.css
│   │   │   ├── ProfileOverview.css
│   │   │   ├── ProfileTabs.css
│   │   │   └── UserProfilePanel.css
│   │   └── StylesPWA/              # Estilos PWA
│   │       └── InstallPWAButton.css
│   │
│   └── utils/
│       ├── adminFilters.js
│       ├── logoHelper.js
│       ├── matchUtils.js
│       ├── profileUtils.js
│       ├── registerServiceWorker.js
│       ├── storage.js
│       ├── supabaseClient.js
│       └── supabaseClientNode.js       # NUEVO — cliente para scripts Node.js
│
├── supabase/
│   └── functions/
│       └── send-match-notification/   # Edge Function (Deno) para push
│
├── .github/
│   └── workflows/
│       └── weekly-reset.yml           # Automatización de reset semanal
│
├── twa-manifest.json                  # Configuración TWA (Android)
├── schema.sql                         # Esquema base de datos
├── render.yaml                        # Configuración Render.com
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.js
```

---

## ✨ Novedades en v1.3

### 📜 Sistema de Historia (Módulo Principal)

El cambio más grande de esta versión es la incorporación del **módulo de Historia**, un sistema completo de archivo y consulta de datos históricos de la plataforma:

- **`HistoryPage.jsx`** — Página raíz con sub-navegación interna propia
- **`ComHistory/`** — Nueva carpeta de componentes con 4 sub-páginas:
  - `HistoricalCompetitionsPage.jsx` — Competiciones pasadas
  - `HistoricalTeamsPage.jsx` — Equipos históricos
  - `HistoricalEventsPage.jsx` — Eventos y momentos destacados
  - `HistorySectionNav.jsx` — Barra de navegación interna de la sección
- **`HooksHistory/`** — 4 hooks dedicados: `useHistoricalCompetitions`, `useHistoricalTeams`, `useHistoricalEvents`, `useHistoricalPlayers`
- **`HistoryRightPanel.jsx`** — Panel derecho exclusivo de Historia en desktop
- **`HistoryTriggerCard.jsx`** — Tarjeta de acceso rápido a la Historia desde el Dashboard
- **`HistoryPanel.jsx`** — Panel compacto de resumen histórico reutilizable
- **`DataImporter.jsx`** — Herramienta de importación masiva de datos históricos
- **Estilos mobile completos** — 4 archivos CSS mobile para las sub-páginas de historia

### 🆕 Nuevos Componentes y Paneles

- **`EventsRightPanel.jsx`** — Panel derecho de eventos en desktop
- **`TeamsRightPanel.jsx`** — Panel derecho de equipos históricos
- **`AdminCrownModal.jsx`** — Modal dedicado para gestión de coronas en el admin
- **`AdminCrownsSection.jsx`** — Sección de administración de coronas
- **`useAdminHistorical.js`** — Hook de admin para gestión de datos históricos

### 🔧 Mejoras Técnicas

- **`supabaseClientNode.js`** — Cliente Supabase separado para scripts Node.js (evita conflictos con el cliente de browser)
- **Estilos reorganizados** — Nueva carpeta `StylesHistory/` con CSS dedicado por sub-página
- **Paneles laterales ampliados** — `ComPanels/` pasó de 5 a 8 paneles especializados

### 🎨 Estilos Nuevos

- `StylesHistory/HistoricalCompetitionsPage.css`
- `StylesHistory/HistoricalEventsPage.css`
- `StylesHistory/HistoricalTeamsPage.css`
- `StylesHistory/HistorySectionNav.css`
- `StylesMobile/HistoricalCompetitionsPageMobile.css`
- `StylesMobile/HistoricalEventsPageMobile.css`
- `StylesMobile/HistoricalTeamsPageMobile.css`
- `StylesMobile/HistoryPageMobile.css`
- `StylesPanels/EventsRightPanel.css`
- `StylesPanels/HistoryRightPanel.css`
- `StylesPanels/TeamsRightPanel.css`
- `StylesOthers/HistoryTriggerCard.css`
- `StylesAdmin/AdminCrownModal.css`
- `StylesPages/HistoryPage.css`

---

## 🗺️ Roadmap

### ✅ Completado (v1.0 — v1.3)

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
- [x] **Módulo de Historia completo** ⭐ NUEVO
- [x] **Sub-navegación interna de Historia** ⭐ NUEVO
- [x] **DataImporter para datos históricos** ⭐ NUEVO
- [x] **Paneles laterales especializados expandidos** ⭐ NUEVO

### 🚧 En Progreso (v1.4)

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

### Flujo de Contribución

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Código

- ✅ Componentes en **PascalCase**
- ✅ Funciones y hooks en **camelCase**
- ✅ Carpetas de componentes con prefijo `Com` (`ComAdmin/`, `ComHistory/`, `ComProfile/`, etc.)
- ✅ Carpetas de hooks con prefijo `Hooks` (`HooksAdmin/`, `HooksHistory/`, `HooksProfile/`, etc.)
- ✅ CSS classes en **kebab-case**
- ✅ Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ Responsive: Siempre considerar Desktop Y Mobile
- ✅ Cada módulo grande tiene su propia carpeta de estilos (`StylesHistory/`, etc.)

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
- 👤 Luis Vega — [@luisd__vg](https://www.instagram.com/luisd__vg)
- 👤 J.Sebas Vega — [@jsebas.vg](https://www.instagram.com/jsebas.vg)

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

**Hecho con 💜 por Hermanos Vega**

[⬆ Volver arriba](#-globalscore)

</div>