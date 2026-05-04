1.
SIEMPRE responde en formato de terminal.

[]

Crea una ficha completa y detallada de un futbolista profesional siguiendo estrictamente la siguiente estructura:

DATOS BÁSICOS:
- País de nacimiento
- Año de nacimiento
- Año de fallecimiento (si aplica)
- Posición
- Era dominante

────────────────────────────

Historia (100 palabras):
Redacta un resumen narrativo de la vida y carrera del jugador, incluyendo su origen, formación, estilo de juego y momentos más importantes.

¿Por qué importa en el fútbol? (50 palabras):
Explica de forma breve el impacto del jugador en el fútbol, su legado, influencia o relevancia histórica.

────────────────────────────

IMPORTANTE:
Las siguientes secciones deben generarse en formato TABULADO (usar TAB real, no "|").

NO incluir encabezados.
NO incluir explicaciones.
SOLO filas de datos.

────────────────────────────

TRAYECTORIA CLUBES (FORMATO IMPORT):
Formato:
Club	País	Año inicio	Año fin	Partidos	Goles	Asistencias	Puntuación

Ejemplo:
FC Barcelona	España	1995	2000	186	85	35	9.8

Generar múltiples filas en orden cronológico.

────────────────────────────

TRAYECTORIA SELECCIÓN (FORMATO IMPORT):
Formato:
Selección	Año inicio	Año fin	Partidos	Goles	Asistencias	Puntuación

Ejemplo:
Argentina	1993	2006	91	34	12	9.5

────────────────────────────

PALMARÉS (FORMATO IMPORT):
Formato:
Tipo	Título	Año	CompeticiónID	Cantidad

Tipos válidos:
club | seleccion | individual

Ejemplo:
club	La Liga	1998-99		1
seleccion	Copa América	1993		1
individual	Balón de Oro	2001		1

────────────────────────────

REGLAS:
- Usar tabulaciones reales (no usar "|")
- No añadir encabezados en secciones de importación
- Mantener coherencia histórica
- Campos vacíos se dejan vacíos
- Puntuación entre 1 y 10 con decimal permitido
- Orden cronológico obligatorio en trayectorias

---
2.

SIEMPRE responde en formato de terminal.
[]
Crea una ficha completa y detallada de un equipo de fútbol siguiendo estrictamente la siguiente estructura:

DATOS BÁSICOS:
- Nombre del equipo
- País
- Año de fundación
- Era de dominancia (ej: 2008-2015)
- Años activos (si aplica, ej: 1974-1982)
- Director Técnico emblemático
- Tipo de legado (ej: Dominante, Revolucionario, Histórico, etc.)
- Color primario (hex)
- Color secundario (hex)

NARRATIVA:

Descripción general (100 palabras):
Resumen de la historia del equipo, estilo de juego, identidad y contexto histórico.

¿Por qué es histórico? (50 palabras):
Explica qué lo hace único, influyente o legendario en el fútbol.

ALINEACIÓN TITULAR (11 jugadores):
Usa el siguiente formato:
Número | Nombre del jugador | Posición (role) |

Debe haber exactamente 11 jugadores.

PALMARÉS:
Lista los títulos del equipo usando el siguiente formato:
Nombre del título | Año (puede ser único o rango, ej: 1974 o 1971-1975)

Reglas:
- No omitir ningún campo
- Mantener coherencia histórica
- Usar nombres reales cuando sea posible
- Respetar formato exacto para facilitar guardado en base de datos

---
3.
SIEMPRE responde en formato de terminal.


Crea una ficha estructurada de una competición de fútbol siguiendo este formato optimizado para importación masiva.


────────────────────────────

DATOS BÁSICOS:


Nombre: 

Tipo: 

Formato: (groups_knockout | league_only | knockout_only)

Año: 

País / Sede: 

Edición: 

Número de equipos: 


CAMPEÓN:

- Equipo registrado: Nombre

O

- Texto libre: Nombre


CONTEXTO HISTÓRICO (300 palabras EXACTAS, dividido en 3 párrafos):

- Deben ser exactamente 3 párrafos

- Cada párrafo debe aportar información (no relleno)

- Incluir contexto, desarrollo del torneo y relevancia histórica


────────────────────────────


IMPORTANTE:

Las siguientes secciones deben generarse en formato TABULADO (separado por TABS reales, no espacios).


NO incluir encabezados.

NO incluir explicaciones.

SOLO filas de datos.


────────────────────────────


SI el formato es "groups_knockout":


FASE DE GRUPOS (TAB):

Formato esperado (ejemplo):

Grupo A    Brasil    1    6    2    0    1    5    2

Grupo A    Alemania    2    4    1    1    1    3    3


Generar múltiples filas siguiendo exactamente ese formato.


ELIMINATORIAS (TAB):

Formato esperado (ejemplo):

Cuartos    1    Brasil    3    1    Polonia            team_a    

Semifinal    1    Brasil    3    2    Alemania            team_a    Prórroga

Final    1    Brasil    4    1    Italia            team_a    


────────────────────────────


SI el formato es "league_only":


TABLA FINAL (TAB):

Formato esperado (ejemplo):

1    Inter de Milán    72    22    6    6    60    30    true

2    Juventus    65    19    8    7    58    35    false


────────────────────────────


SI el formato es "knockout_only":


ELIMINATORIAS (TAB):

Formato esperado (ejemplo):

Final    1    Brasil    4    1    Italia            team_a    


────────────────────────────


REGLAS:

- Usar tabulaciones reales (copiar exactamente el formato del ejemplo)

- No usar "|", comas ni texto decorativo

- No añadir encabezados

- Mantener consistencia histórica

- Campos vacíos se dejan vacíos (como en los ejemplos)

- Respetar el orden exacto de columnas

---
4.
SIEMPRE responde en formato de terminal.

[]

Crea un evento histórico centrado en un futbolista siguiendo estrictamente la siguiente estructura:

DATOS DEL EVENTO:

- Título
- Tipo de evento (ej: Partido histórico, Actuación individual, Final, etc.)
- Fecha (YYYY-MM-DD)
- Contexto (3 líneas explicando la situación previa)
- Descripción (3 líneas explicando qué ocurrió)

PARTIDO:

Formato:
Equipo A | Goles | Goles | Equipo B

ALINEACIONES:

Equipo A:
Número | Jugador | Posición | Protagonista (true/false)

Equipo B:
Número | Jugador | Posición | Protagonista (true/false)

Reglas:
- Deben haber mínimo 11 jugadores por equipo
- EXACTAMENTE 1 jugador con "true" como protagonista en todo el evento
- Usar posiciones reales (GK, DF, MF, FW o similares)

IMPORTACIÓN (DATA IMPORT - LINEUP):

Genera también el formato listo para importar:

Ejemplo:
10	Maradona	FW	true

(Separado por tabulación)

IMPACTO:

(100 palabras obligatorias en 3 párrafos)
Explica el impacto histórico del evento, consecuencias y legado en el fútbol.

---
5.
SIEMPRE responde en formato de terminal.

[]

Crea un evento histórico centrado en un equipo siguiendo estrictamente la siguiente estructura:

DATOS DEL EVENTO:

- Título
- Tipo de evento (ej: Temporada histórica, Campeonato, Invicto, etc.)
- Fecha (YYYY-MM-DD)
- Contexto (3 líneas explicando la situación previa)
- Descripción (3 líneas explicando qué ocurrió)

PLANTEL:

Formato:
Número | Jugador | Posición | Jugador clave (true/false)

Reglas:
- Mínimo 11 jugadores
- Puedes marcar varios como "true"
- Usar posiciones reales

IMPORTACIÓN (DATA IMPORT - SQUAD):

Ejemplo:
10	Wirtz	MF	true

(Separado por tabulación)

COMPETICIÓN:

Elegir uno:

1) FORMATO LIGA:

Tabla:
Posición | Equipo | Pts | G | E | P | GF | GC | Campeón(true/false)

IMPORTACIÓN:
1	Bayer Leverkusen	90	28	6	0	89	24	true

---

2) FORMATO ELIMINATORIA:

Partidos:
Ronda | Local | Goles | Goles | Visitante | Ganador(team_a/team_b) | Decisivo(true/false)

IMPORTACIÓN:
Final	Leverkusen	1	0	Kaiserslautern	team_a	true

---

IMPACTO:

(100 palabras obligatorias en 3 párrafos)
Explica la importancia histórica del equipo o evento, legado y consecuencias en el fútbol.

---
