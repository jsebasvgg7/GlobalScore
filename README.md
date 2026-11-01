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
- [📒 GlobalAlbums](#-globalalbums)
- [📓 Libreta Fútbolera](#-libreta-fútbolera)
- [⚔️ Salas 1 vs 1](#️-salas-1-vs-1)
- [Tech Stack](#️-tech-stack)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Arquitectura Feature-Based](#-arquitectura-feature-based)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Novedades en v1.6](#-novedades-en-v16)
- [Novedades en v1.5](#-novedades-en-v15)
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
- **GlobalAlbums**: Sistema de figuritas coleccionables vinculado a las predicciones
- **Libreta Fútbolera**: Libreta personal de tus partidos de FIFA, EA FC, PES, eFootball y DLS ⭐ NUEVO
- **Salas 1 vs 1**: Enfrenta tu equipo de la Libreta contra el de un amigo con un código ⭐ NUEVO
- **Arquitectura Feature-Based**: Código organizado por dominio para máxima escalabilidad

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

📒 GlobalAlbums
├── Sobres generados por resultados exactos (5 pts)
├── 4 figuritas por sobre (jugador, equipo, copa, evento)
├── Sistema de rareza en 5 niveles (1★ al GOAT 5★)
├── 13 álbumes coleccionables en 3 categorías
├── Boost automático cada 10 sobres abiertos
└── Animación de apertura de sobre con flip de cartas

📓 Libreta Fútbolera  ⭐ NUEVO
├── Equipos propios con partidos ganados, empatados y perdidos
├── Goles, asistencias y MVP por jugador
├── Resumen de temporada con goleador del equipo
└── Salas 1 vs 1 para comparar tu equipo con el de un amigo

📜 Historia
├── Competiciones históricas con resultados completos
├── Equipos históricos con estadísticas
├── Eventos y momentos destacados
├── Bracket de eliminatorias histórico en mobile
└── Navegación por secciones con sub-páginas dedicadas
```

### 📒 GlobalAlbums

```
Sistema de Colección de Figuritas
├── 🎯 Mecánica Central
│   ├── Solo los resultados exactos (5 pts) generan sobres
│   ├── Cada sobre = 4 figuritas (1 por categoría de Historia)
│   └── Sobres acumulables — abre cuando quieras
│
├── ⭐ Sistema de Rareza (Jugadores)
│   ├── 1★ Actuales Relevantes   — ~55% drop rate
│   ├── 2★ Momentos Puntuales    — ~25% drop rate
│   ├── 3★ Culto y Distinción    — ~12% drop rate
│   ├── 4★ Leyendas              — ~7.5% drop rate
│   └── 5★ GOAT (solo 10)        — ~0.5% drop rate
│
├── 📚 13 Álbumes en 3 Categorías
│   ├── Legendarios (LEG I → LEG V) — progresivos, requieren requisitos de estrellas
│   ├── Estrellas (EST I → GOAT)    — 5 álbumes por nivel de rareza de jugadores
│   └── Culto (Equipos, Copas, Eventos) — 3 álbumes temáticos históricos
│
├── ⚡ Sistema de Boost
│   ├── Activo cada 10 sobres abiertos
│   ├── 3 sobres con probabilidades mejoradas
│   └── Indicado visualmente en la barra de progreso
│
├── 🃏 Diseño de Cartas
│   ├── Foil shimmer overlay en hover
│   ├── Anillo foil animado por rareza
│   ├── Marco normal / plata / oro / legendario según copias
│   └── Efecto GOAT exclusivo con halo y partículas
│
└── 📦 Pack Opening Modal
    ├── Animación de sobre con flap que se desprende
    ├── 4 cartas con flip individual al tocar
    ├── Partículas de burst en carta GOAT
    └── Vista adaptada desktop (split) y mobile (pantalla completa)
```

### 📊 Estadísticas y Analytics

- **Dashboard Personal**: Métricas clave y progreso visual
- **Historial Completo**: Todas tus predicciones con resultados detallados
- **Análisis por Liga**: Rendimiento en cada competición
- **Campeonatos Mensuales**: Historial de títulos ganados mes a mes
- **Ranking Mensual y de Temporada**: Snapshots del top 100 de cada mes y reinicio de temporada
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
- `ProfileSettingsPage.jsx`, `HistoryPage.jsx`, `AlbumsPage.jsx`
- `LogbookDesktop.jsx`, `RoomsPage.jsx`, `RoomPage.jsx`

#### Características Desktop Exclusivas

```
✅ Multi-panel display
   ├─ Sidebar + Contenido + Panel Derecho simultáneamente
   └─ Transiciones suaves entre secciones

✅ Interacciones avanzadas
   ├─ Hover effects en tarjetas y libros 3D
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

- `MobileDashboard.jsx` — Cards apiladas, filtros simplificados, predicción inline
- `MobileRanking.jsx` — Podio comprimido, lista scrollable, búsqueda integrada
- `MobileStats.jsx` — Tabs horizontales, gráficos comprimidos, métricas en cards
- `MobileAdmin.jsx` — Tabs por sección, FAB flotante, swipe-to-delete
- `MobileProfileMain.jsx` — Hero comprimido, tabs de overview/historial/logros
- `MobileNotifications.jsx` — Toggle prominent, notificaciones por tipo
- `MobileNotes.jsx` — Crear nota rápida, lista ordenada por fecha, búsqueda
- `AlbumsPageMobile.jsx` — Header compacto, section nav, álbumes optimizados para touch
- `LogbookPage.jsx` — Libreta con tarjetas de jugador, contadores verticales y botón dividido de salas ⭐ NUEVO

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
```

---

## 📒 GlobalAlbums

GlobalAlbums es el sistema de colección de figuritas integrado en GlobalScore. Convierte cada predicción exacta en una recompensa tangible — un sobre con 4 cartas coleccionables extraídas directamente del módulo de Historia.

### 🗂️ Estructura del Feature

```
src/features/albums/
├── index.js
├── components/
│   ├── AlbumBookEntry.jsx         ← Botón flotante libro en Dashboard
│   ├── AlbumCard.jsx              ← Carta individual con foil y rareza
│   ├── AlbumProgressBar.jsx       ← Barra progreso hacia siguiente sobre
│   ├── AlbumsSectionNav.jsx       ← Navegación entre las 3 secciones
│   ├── CultAlbumsSection.jsx      ← Álbumes temáticos (Equipos/Copas/Eventos)
│   ├── LegendaryAlbumsSection.jsx ← Álbumes legendarios LEG I→V progresivos
│   ├── PackOpeningModal.jsx       ← Modal apertura de sobre con animaciones
│   ├── StarCollectionSection.jsx  ← Álbumes por nivel de rareza de jugadores
│   └── mobile/
│       └── AlbumsPageMobile.jsx   ← Vista mobile completa
├── hooks/
│   ├── useAlbumCards.js
│   ├── useAlbumCollection.js
│   ├── useAlbumDefinitions.js
│   ├── useAlbumPacks.js
│   ├── useAlbumProgress.js
│   └── usePackOpening.js
├── motion/
│   └── variants.js                ← Variantes Framer Motion del feature
├── page/
│   ├── AlbumsPage.jsx
│   └── AlbumsPage.css
├── services/
│   └── albums.service.js          ← Lógica de drop rates, apertura, progreso
├── styles/
│   ├── AlbumBookEntry.css
│   ├── AlbumCard.css
│   ├── AlbumProgressBar.css
│   ├── AlbumsSectionNav.css
│   ├── CultAlbumsSection.css
│   ├── LegendaryAlbumsSection.css
│   ├── PackOpeningModal.css
│   ├── StarCollectionSection.css
│   └── mobile/
│       ├── AlbumProgressBar.mobile.css
│       ├── AlbumsPageMobile.css
│       ├── AlbumsSectionNav.mobile.css
│       ├── CultAlbumsSection.mobile.css
│       ├── LegendaryAlbumsSection.mobile.css
│       ├── PackOpeningModal.mobile.css
│       └── StarCollectionSection.mobile.css
└── types/
    └── albums.types.ts
```

### 📋 Las Tres Secciones de Álbumes

**👑 Legendarios (LEG I → LEG V)** — 5 álbumes progresivos desbloqueables en cadena. Cada álbum requiere 30 jugadores únicos con requisitos crecientes de rareza. Solo se desbloquea el siguiente al completar el anterior. El álbum final (LEG V) exige 5 cartas GOAT — el reto más difícil del sistema.

| Álbum | Requisito clave | Rareza |
|---|---|---|
| LEG I — Foundations | 5× ⭐⭐⭐⭐ | FUNDACIÓN |
| LEG II — Rising Legends | 5× ⭐⭐⭐ + 5× ⭐⭐⭐⭐ | LEYENDA+ |
| LEG III — Historical Depth | 5× ⭐⭐ + 5× ⭐⭐⭐ + 5× ⭐⭐⭐⭐ | ÉLITE |
| LEG IV — Elite Construction | anterior + 1× ⭐⭐⭐⭐⭐ | GOAT |
| LEG V — The Immortals | anterior + 5× ⭐⭐⭐⭐⭐ | INMORTAL |

**⭐ Estrellas (EST I → GOAT)** — 5 álbumes independientes, uno por cada nivel de rareza de jugadores. Sin requisitos de desbloqueo — cualquier carta del nivel correspondiente contribuye directamente.

**📒 Culto (Equipos / Copas / Eventos)** — 3 álbumes que recogen los elementos no-jugadores del sistema: equipos históricos, competiciones y eventos. Se completan automáticamente a medida que se consiguen cartas de Historia.

### ⚡ Mecánica de Boost

Cada 10 sobres abiertos se activa un **Boost** de 3 sobres. Durante el boost, las probabilidades de rareza alta aumentan significativamente:

| Rareza | Base | Boost activo |
|---|---|---|
| ⭐ (1 estrella) | 55% | 40.3% |
| ⭐⭐ (2 estrellas) | 25% | 25% |
| ⭐⭐⭐ (3 estrellas) | 12% | 19% |
| ⭐⭐⭐⭐ (4 estrellas) | 7.5% | 14.5% |
| ⭐⭐⭐⭐⭐ GOAT | 0.5% | 1.2% |

### 🎨 Sistema de Marcos

Las copias múltiples de una misma carta mejoran su marco visual:

| Copias | Marco |
|---|---|
| 1-2 | Normal |
| 3-4 | Plata |
| 5-9 | Oro |
| 10+ | Legendario (animación pulsante) |

### 🗃️ Flujo de Datos

```
Supabase (PostgreSQL)
    └── Tablas de álbumes (album_cards, album_packs, album_collection, album_progress)
          └── albums.service.js  (drop rates, apertura de sobre, sync de progreso)
                └── hooks/* (fetch + estado + refresh)
                      └── Componentes (render + animaciones)
                            └── AlbumBookEntry (entrada desde Dashboard)
```

### 🔗 Integración con el Dashboard

El feature se integra en el Dashboard mediante `AlbumBookEntry.jsx` — un libro SVG flotante en la esquina superior del panel de partidos (desktop) y un botón en el header mobile. Muestra un badge rojo cuando hay sobres disponibles. En el tab de Álbumes del `MobileDashboard`, hay un panel resumen con: barra de progreso, contador de sobres, cartas totales, álbumes legendarios completados y GOATs conseguidos.

---

## 📓 Libreta Fútbolera

La Libreta es el cuaderno personal para llevar las estadísticas de tus partidos de videojuego de fútbol. Cada usuario crea sus propios equipos y solo él puede verlos y editarlos.

### 🗂️ Qué incluye

```
Libreta Fútbolera
├── 🏟️ Equipos
│   ├── Nombre, juego (FIFA, EA FC, PES, eFootball, DLS, Otro) y formación
│   ├── 8 formaciones: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-1-4-1, 3-4-3, 4-5-1
│   └── Varios equipos por usuario, con selector de equipo activo
│
├── 📊 Marcador del equipo
│   ├── Ganados, empatados y perdidos
│   ├── Goles en contra y autogoles del rival
│   └── Goles archivados al borrar un jugador
│
├── 👤 Jugadores
│   ├── Posición: Portero, Defensa, Mediocampista o Delantero
│   └── Goles, asistencias y MVP con contadores verticales
│
├── 📈 Resumen de temporada
│   └── Partidos jugados, goles a favor, diferencia de gol y goleador
│
└── 🔁 Migración
    └── Importa una sola vez la libreta vieja guardada en el navegador
```

### 🧭 Rutas

| Ruta | Pantalla |
|---|---|
| `/libreta` | Libreta del usuario (desktop y mobile) |
| `/libreta/salas` | Crear sala, unirse con código y lista de salas |
| `/libreta/salas/:roomId` | Una sala en particular |

### 🖥️ Desktop y Mobile

- **Desktop**: `LogbookDesktop.jsx` con campo de juego (`FormationPitch`), filas de jugadores, bloques de stats y estilo crema propio con modo oscuro.
- **Mobile**: `LogbookPage.jsx` con tarjetas de jugador, contadores verticales y la misma gama de colores en modo oscuro.
- **Dashboard mobile**: la pestaña "Libreta" del panel inferior muestra el resumen del equipo y la tarjeta de la sala en curso.

### 🗃️ Estructura del Feature

```
src/features/logbook/
├── index.js
├── components/
│   ├── AddPlayerForm.jsx · LogbookPanel.jsx · PlayerCard.jsx · RivalCard.jsx
│   ├── SeasonSummary.jsx · TeamForm.jsx · TeamSelector.jsx · VerticalCounter.jsx
│   ├── desktop/   (FormationPitch, PlayerRow, StatBlock, Stepper)
│   └── room/      (RoomTable, RoomWaiting, RoomCreateForm, RoomJoinForm, RoomList,
│                   RoomResult, RoomPanelCard, RoomPinButton, RoomSplitButton)
├── hooks/
│   ├── useLogbook.js · useLogbookSummary.js · useIsMobile.js
│   └── useRoom.js · useCurrentRoom.js
├── page/
│   ├── LogbookPage.jsx · LogbookDesktop.jsx · LogbookPage.css
│   └── RoomsPage.jsx · RoomPage.jsx
├── services/
│   ├── logbook.service.js   ← Equipos y jugadores (Supabase)
│   └── room.service.js      ← Llamadas a las funciones SQL de las salas
├── styles/                  ← CSS del feature (libreta y salas)
└── utils/
    ├── logbook.utils.js     ← Juegos, formaciones, posiciones y stats del equipo
    └── room.utils.js        ← Comparación de equipos y mensajes de error
```

### 🔐 Seguridad

Las tablas `libreta_teams` y `libreta_players` solo las lee y escribe el dueño (política `owner_all`). Nadie más puede ver tus equipos, salvo el rival dentro de una sala y solo a través de una función SQL.

---

## ⚔️ Salas 1 vs 1

Dos usuarios, cada uno con un equipo de su Libreta, se enfrentan en una **sala**. Se comparan las stats de ambos equipos y cada stat ganada da 1 punto. Gana quien sume más puntos.

### 🔄 Flujo

```
1. Creas la sala con uno de tus equipos y eliges el modo
2. Recibes un código corto de 6 caracteres para compartir
3. Tu rival entra con el código y elige su equipo
4. Se muestra la tabla de posiciones con los puntos de cada lado
5. Cualquiera de los dos finaliza la sala
6. La sala queda congelada y pasa al historial
```

### 🎛️ Modos de sala

| Modo | Qué pasa |
|---|---|
| Historial | Entra cualquier equipo con sus stats de siempre |
| Desde 0 | Solo entran equipos sin stats. Si el tuyo ya tiene, creas otro con "+ Equipo" |

### 🏁 Puntuación

Son 9 stats que puntúan. Si una stat empata, nadie suma el punto. Partidos jugados y empates solo se muestran como información.

| Stat | Gana | Desempate |
|---|---|---|
| Partidos ganados | Más | — |
| Partidos perdidos | Menos | — |
| % de victorias | Más | — |
| Goles a favor | Más | — |
| Goles en contra | Menos | — |
| Diferencia de gol | Más | — |
| Goleador | Más goles | Más asistencias |
| Asistidor | Más asistencias | Más goles |
| MVP | Más MVP | Más goles |

### 📌 Reglas

- Máximo 2 miembros por sala.
- Un equipo solo puede estar en una sala en curso a la vez.
- Cualquiera de los dos puede finalizar la sala. Si hay empate total, no hay ganador.
- Al finalizar se guarda una foto de ambos equipos y los puntos finales: después no cambia aunque edites o borres tu equipo.
- Si borras un equipo que está en una sala en curso, la sala se cancela.
- **Sala favorita**: puedes marcar con una estrella una sola sala en curso. La marca se guarda en el servidor, te sigue entre dispositivos y se quita sola al finalizar o cancelar la sala.
- El botón dividido "Salas" abre la sala con estrella (o la más reciente en curso) y el "+" abre siempre la pantalla de salas.
- Sin tiempo real: la sala se actualiza al abrirla y con el botón "Actualizar".

### 🧠 Dónde vive la lógica

Todas las validaciones y escrituras están en funciones SQL de Supabase. El cliente solo tiene permiso de lectura sobre `libreta_rooms` y `libreta_room_members`.

| Función SQL | Qué hace |
|---|---|
| `libreta_room_create` | Crea la sala y su código |
| `libreta_room_join` | Une al rival y activa la sala |
| `libreta_room_get` | Lee la sala con las stats de ambos equipos |
| `libreta_room_list` | Lista tus salas con marcador y estrella |
| `libreta_room_finish` | Calcula el ganador y congela la sala |
| `libreta_room_cancel` | Cancela una sala en curso |
| `libreta_room_pin` | Marca o quita la estrella |

> ⚠️ La comparación de stats existe en dos lugares: `compareTeams` en `room.utils.js` y `libreta_compare_points` en SQL. Si cambias una regla de puntuación, cámbiala en los dos.

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
- Servicios de auth encapsulados en `features/auth/services/auth.service.js`

---

## 🛠️ Tech Stack

### Frontend

```javascript
{
  "framework": "React 18.3.1",
  "buildTool": "Vite 5.4.11",
  "routing": "React Router DOM 6",
  "icons": "Lucide React 0.555",
  "styling": "Tailwind CSS + Custom CSS",
  "stateManagement": "React Context API + Custom Hooks",
  "responsiveness": "CSS Media Queries + useMediaQuery Hook",
  "architecture": "Feature-Based (Domain-Driven)",
  "animations": "Framer Motion 12 (albums feature)"
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
  "edgeFunctions": "Deno (Push Notifications)",
  "triggers": "PostgreSQL Triggers (album_cards auto-sync, sala favorita, cancelación de salas)",
  "rpc": "Funciones SQL SECURITY DEFINER (campeonatos, sobres, Salas 1 vs 1)"
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
  "automation": "GitHub Actions (registro de deployment)"
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

El esquema `public` vive en Supabase. Para obtener una copia actualizada, expórtala con:

```bash
pg_dump --schema-only --schema=public --no-owner --no-privileges "$SUPABASE_DB_URL" > schema_completo.sql
```

Ejecuta ese esquema en tu propio proyecto de Supabase y luego crea los buckets en Supabase Storage:

```
banners/     historical/     world-cup-logos/     profiles/
```

### Schema de GlobalAlbums

Tablas de GlobalAlbums:

```
album_cards         ← Cartas del sistema (sync automático con Historia via triggers)
album_packs         ← Sobres disponibles y estado de boost por usuario
album_collection    ← Cartas obtenidas por cada usuario con copias y frame_level
album_definitions   ← Definición de los 13 álbumes (legendary/stars/cult)
album_progress      ← Progreso de cada usuario en cada álbum
album_pack_history  ← Historial de sobres abiertos
```

### Edge Function de Push Notifications

```bash
supabase functions deploy send-match-notification
```

---

## 🏗️ Arquitectura Feature-Based

GlobalScore utiliza una **arquitectura feature-based** donde cada dominio de la aplicación es completamente autónomo.

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

### Features Actuales

| Feature | Responsabilidad |
|---------|----------------|
| `admin` | Panel de administración completo |
| `albums` | Sistema de figuritas GlobalAlbums |
| `auth` | Login, registro, rutas protegidas |
| `dashboard` | Feed de partidos, ligas y premios |
| `history` | Módulo de historia: competiciones, equipos, eventos |
| `logbook` | Libreta Fútbolera y Salas 1 vs 1 ⭐ NUEVO |
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
│   ├── .well-known/assetlinks.json
│   ├── manifest.json
│   ├── sw.js
│   ├── offline.html
│   └── pushNotifications.js
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── context/
│   │   └── ThemeContext.jsx
│   │
│   └── features/
│       ├── admin/
│       ├── albums/           ← Feature GlobalAlbums
│       │   ├── components/   (AlbumBookEntry, AlbumCard, PackOpeningModal...)
│       │   ├── hooks/        (useAlbumPacks, useAlbumCollection, usePackOpening...)
│       │   ├── motion/       (variants.js — Framer Motion)
│       │   ├── page/         (AlbumsPage.jsx)
│       │   ├── services/     (albums.service.js — drop rates, apertura, sync)
│       │   ├── styles/       (CSS desktop + mobile/)
│       │   └── types/        (albums.types.ts)
│       ├── auth/
│       ├── dashboard/
│       ├── history/
│       ├── logbook/          ← Libreta Fútbolera y Salas 1 vs 1 ⭐ NUEVO
│       │   ├── components/   (equipos, jugadores, desktop/, room/)
│       │   ├── hooks/        (useLogbook, useRoom, useCurrentRoom...)
│       │   ├── page/         (LogbookPage, LogbookDesktop, RoomsPage, RoomPage)
│       │   ├── services/     (logbook.service.js, room.service.js)
│       │   ├── styles/       (CSS de libreta y salas)
│       │   └── utils/        (logbook.utils.js, room.utils.js)
│       ├── notes/
│       ├── notifications/
│       ├── profile/
│       ├── ranking/
│       ├── stats/
│       └── worldcup/
│
├── supabase/
│   └── functions/send-match-notification/
│
├── .github/
│   └── workflows/            (deploy.yml, weekly-reset.yml)
│
├── twa-manifest.json
├── render.yaml
└── vite.config.js
```

---

## ✨ Novedades en v1.6

### 📓 Libreta Fútbolera y ⚔️ Salas 1 vs 1

**Libreta:**
- Equipos y jugadores propios en Supabase, con migración única desde la libreta vieja del navegador
- Vista desktop con campo de formación y vista mobile con contadores verticales
- Resumen de temporada y pestaña "Libreta" en el dashboard mobile

**Salas 1 vs 1:**
- Sala con código corto de 6 caracteres y modos Historial / Desde 0
- Tabla de posiciones con 9 stats que puntúan y tonos de ganador, perdedor y empate
- Finalizar sala con foto congelada de ambos equipos, modo espectador e historial
- Sala favorita con estrella y botón dividido "Salas" + "+"
- Mensajes de error siempre en español y cancelación automática si se borra un equipo

**Base de datos:**
- Tablas `libreta_rooms` y `libreta_room_members` con RLS de solo lectura para los miembros
- Funciones `libreta_room_create`, `join`, `get`, `list`, `finish`, `cancel` y `pin`
- Triggers que cancelan la sala si se borra un equipo y quitan la estrella al terminarla

---

## ✨ Novedades en v1.5

### 📒 GlobalAlbums — Feature Principal

El feature más ambicioso de GlobalScore: un sistema completo de figuritas coleccionables que convierte las predicciones exactas en recompensas visuales y gamificadas.

**Componentes nuevos:**
- `AlbumBookEntry.jsx` — Libro SVG flotante como punto de entrada desde Dashboard
- `AlbumCard.jsx` — Carta con sistema de rareza, foil shimmer y marcos dinámicos
- `AlbumProgressBar.jsx` — Barra hacia el siguiente sobre con indicador de boost
- `AlbumsSectionNav.jsx` — Navegación entre Legendarios / Estrellas / Culto
- `LegendaryAlbumsSection.jsx` — 5 álbumes legendarios progresivos con sistema de slots por rareza
- `StarCollectionSection.jsx` — 5 álbumes por nivel de significancia de jugadores
- `CultAlbumsSection.jsx` — 3 álbumes temáticos de Historia (Equipos, Copas, Eventos)
- `PackOpeningModal.jsx` — Modal completo de apertura con animación de sobre y flip de cartas
- `AlbumsPageMobile.jsx` — Vista mobile con header compacto, section nav y scroll optimizado

**Lógica nueva:**
- `albums.service.js` — Drop rates diferenciados, boost automático, sync de progreso, apertura de sobre
- `useAlbumPacks.js` — Estado de sobres y barra de progreso
- `useAlbumCollection.js` — Colección del usuario con helpers por tipo y nivel
- `usePackOpening.js` — Máquina de estados para la animación de apertura
- `useAlbumProgress.js` — Progreso por álbum con conteo de legendarios completados
- `computeAndSyncAlbumProgress()` — Algoritmo que asigna slots progresivos sin reutilizar cartas entre álbumes

**Integración en Dashboard:**
- `AlbumBookEntry` importado en `DashboardPage.jsx` (desktop, libro flotante)
- Panel "Álbumes" en `MobileDashboard.jsx` como tercer tab de la sección inferior
- `AlbumsPanel` muestra barra de progreso, grid 2×2 de stats y CTA de acceso rápido

### 🗄️ Base de Datos

6 tablas nuevas en PostgreSQL con RLS completo y triggers automáticos para sincronización de cartas con Historia al publicar jugadores, equipos, competiciones o eventos.

---

## 🗺️ Roadmap

### ✅ Completado (v1.0 — v1.5)

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
- [x] Responsive design + vistas móviles dedicadas
- [x] Push Notifications vía VAPID/Web Push
- [x] Soporte offline con Service Worker
- [x] PWA completa
- [x] App Android compilada y firmada via TWA
- [x] GitHub Actions para el registro de deployments
- [x] Sistema de Notas Personales
- [x] Módulo de Historia completo
- [x] Migración a arquitectura feature-based
- [x] Capas de servicio por dominio
- [x] **GlobalAlbums — sistema completo de figuritas coleccionables** ⭐ NUEVO
- [x] **13 álbumes en 3 categorías (Legendarios, Estrellas, Culto)** ⭐ NUEVO
- [x] **Pack Opening Modal con animaciones Framer Motion** ⭐ NUEVO
- [x] **Sistema de boost cada 10 sobres** ⭐ NUEVO
- [x] **Integración Albums en Dashboard desktop y mobile** ⭐ NUEVO
- [x] **Libreta Fútbolera con equipos, jugadores y resumen de temporada** ⭐ NUEVO
- [x] **Salas 1 vs 1 con código, modo Desde 0 y sala favorita** ⭐ NUEVO

### 🚧 En Progreso (v1.6)

- [ ] **Google Play Store**: Publicación oficial
- [ ] **Indicador de álbumes en perfil público**
- [ ] **Chat Global**: Comunidad integrada
- [ ] **Libreta en el teléfono**: Mejor tabla de salas en 360 px y acciones al alcance del pulgar
- [ ] **Modo rápido de la Libreta**: Actualizar stats sin salir del juego

### 📋 Planeado (v2.0)

- [ ] **Integración con APIs**: Resultados automáticos
- [ ] **Sistema de Monedas**: Economía virtual
- [ ] **Tienda**: Compra de avatares y temas
- [ ] **Torneos Personalizados**: Crea tus propias ligas
- [ ] **Predicciones en Vivo**: Durante el partido
- [ ] **Social Sharing**: Compartir predicciones en redes
- [ ] **Notificación con botones**: Sumar stats de la Libreta desde la notificación
- [ ] **App nativa**: Android e iOS con Kotlin Multiplatform, widgets y notificaciones nativas

---

## 🤝 Contribuir

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

---

## 📞 Contacto

**Hermanos Vega Gonzalez** — Desarrollador & Diseñador

- 📧 Email: [globalscore.oficial@gmail.com](mailto:globalscore.oficial@gmail.com)
- 🌐 Web: [https://globalscore.me/app](https://globalscore.me/app)

**Repositorio**: [https://github.com/jsebasvgg7/GlobalScore](https://github.com/jsebasvgg7/GlobalScore)

---

## 🫱🏼‍🫲🏼 Colaboradores

- [The Brainy](https://www.instagram.com/brainy_bh) — feedback

---

## 🙏 Agradecimientos

- [React](https://reactjs.org/) — Framework frontend
- [Supabase](https://supabase.com/) — Backend as a Service + Edge Functions
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Utilidades CSS
- [Lucide Icons](https://lucide.dev/) — Iconografía
- [Framer Motion](https://www.framer.com/motion/) — Animaciones (GlobalAlbums)
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
