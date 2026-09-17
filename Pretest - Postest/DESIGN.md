---
name: Pretest / Postest — Estrategias Metodológicas Activas
description: Mismo sistema visual "el colegio con color" del proyecto hermano (CEPE) — tarjetas blancas sobre degradado índigo/violeta, un color de identidad por área del conocimiento — adaptado a preguntas de cuestionario en vez de un roster de inscripción.
colors:
  bg: "#f5f7ff"
  surface: "#ffffff"
  surface-muted: "#f1f3fb"
  surface-band: "#eef1fc"
  ink: "#0f172a"
  ink-secondary: "#475569"
  ink-tertiary: "#64748b"
  primary: "#4f46e5"
  primary-dark: "#4338ca"
  secondary: "#7c3aed"
  success: "#16a34a"
  error: "#dc2626"
  warning: "#d97706"
  area-indigo: "#4f46e5"
  area-violeta: "#9333ea"
  area-verde: "#059669"
  area-ambar: "#d97706"
  area-rosa: "#db2777"
  pre: "#64748b"
  post: "#4f46e5"
typography:
  body:
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  heading:
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.01em"
rounded:
  sm: "10px"
  md: "16px"
  lg: "22px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  chip-unmarcado:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
  chip-marcado:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  radio-card:
    backgroundColor: "{colors.surface-muted}"
    borderColor: "transparent"
    rounded: "{rounded.md}"
  radio-card-marcado:
    backgroundColor: "#ffffff"
    borderColor: "{colors.primary}"
    rounded: "{rounded.md}"
---

# Design System: Pretest / Postest — Estrategias Metodológicas Activas

## Overview

**Decisión de herencia, no de invención.** Este proyecto vive en el mismo monorepo que
"Taller de capacitación Manizales - CEPE", sirve a la misma organización (Comité de
Cafeteros de Caldas / Alianza Educación Rural) y a la misma audiencia (docentes de
instituciones rurales de Manizales, algunos compartidos entre ambos talleres). En vez de
correr una exploración de mundo visual desde cero, este DESIGN.md **hereda tal cual** la
paleta, tipografía, geometría y componentes de firma de esa app hermana — la misma
decisión de "el colegio con color" que ya fue construida, probada, y validada
explícitamente por el usuario ahí ("muy plano, muy simple, quiero algo más dinámico, más
colores"), que es exactamente lo que este proyecto también pidió ("que el formulario sea
muy dinámico"). Reinventar un mundo distinto para dos productos hermanos del mismo
programa habría fragmentado la identidad sin ninguna razón de producto.

Lo que sí es nuevo aquí (no existe en el hermano): preguntas de opción única
(radio-cards), una landing de elección Pretest/Postest, un modal de recuperación de datos
del docente, y un panel de evolución con gráficos comparativos pre/post.

**Key Characteristics (heredadas):**
- Plus Jakarta Sans, autoalojada, única familia para todo.
- CTA primario en degradado índigo→violeta, radio píldora, sombra teñida del mismo color.
- Selección de institución: `<select>` nativo estilizado.
- Selección de áreas: chips de color, uno por área (componente `Casilla`, copiado tal
  cual del hermano).
- Confirmación de envío: modal, no una sección en línea.
- Curva de entrada `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), sin rebote/resorte.

## Colors

Estrategia heredada: **Full palette** — índigo/violeta como marca, 5 colores de
identidad para las áreas del conocimiento, más dos tonos reservados para el panel de
evolución (`pre`/`post`).

### Colores de área
Mapeados por área real, no por posición en la lista, para que un docente que aparece en
ambos productos del programa vea siempre el mismo color para la misma área:
- **Índigo** (`#4f46e5`) — Matemáticas
- **Violeta** (`#9333ea`) — Lenguaje
- **Ámbar** (`#d97706`) — Sociales
- **Verde** (`#059669`) — Ciencias Naturales
- **Rosa** (`#db2777`) — Líder La Universidad en el Campo

Wash al 9-10% para sin marcar, sólido para marcado — igual que el hermano, mismo
componente `Casilla.jsx`.

### Panel de evolución (nuevo)
- **`--pre` (slate `#64748b`):** serie "Antes del taller" en `EvolucionAgregada` — tono
  neutro, deliberadamente no saturado, porque el pretest no es un logro que celebrar.
- **`--post` (índigo `#4f46e5`, el mismo primario de marca):** serie "Después del taller"
  — usar el color de marca para el resultado logrado es la única extensión semántica
  nueva de esta paleta.
- Nunca usar rojo/verde semántico (`--error`/`--success`) para esta comparación — no es
  un veredicto de aprobado/reprobado, es una fotografía de antes/después.

### Neutral / Named Rules
Heredados sin cambios del hermano: **The Card-Is-White Rule** (tarjeta = blanco + borde
real; controles internos = `--surface-muted`, nunca al revés) y **The One Color, One
Meaning Rule** (rojo solo error, verde solo estados de éxito reales — nunca decorativo).

## Typography

Heredada sin cambios: Plus Jakarta Sans única familia, jerarquía por peso/tamaño
(heading 800, subtítulo 600, body 400, label de campo 700 sentence-case).

## Layout

- **Landing (`/`):** una tarjeta centrada, dos botones grandes ("Antes del taller" /
  "Después del taller"), sin formulario visible — es una bifurcación, no una página de
  contenido.
- **Formularios (`/pretest`, `/postest`):** mismo contenedor `.hoja` de 760px, blanco,
  radio 22px, sombra teñida de índigo, que el hermano. Todas las preguntas están visibles
  desde el inicio (el docente puede volver atrás y cambiar una respuesta sin fricción,
  algo valioso en conectividad inestable donde recargar la página sería costoso), pero
  cada pregunta entra con la misma animación `--ease-out` que el resto del sistema, y un
  indicador de progreso ("3 de 6 respondidas") en la cabecera se actualiza en vivo — esto
  es lo que responde a "muy dinámico" sin el riesgo de un wizard paginado que le esconda
  al docente cuánto falta o le impida corregir algo ya contestado.
- **Admin (`/admin`):** contenedor de 1120px como el hermano, con una sección adicional
  (`Evolución`) debajo de las de Pretest/Postest.

## Components

### Radio-card de opción única (nuevo — `PreguntaOpcionUnica`)
Cada opción (a-d) es una tarjeta de ancho completo, no un `<input type="radio">` desnudo:
fondo `--surface-muted` en reposo, radio `--rounded.md`; al marcar, fondo blanco + borde
2px `--primary` + un check circular a la derecha que entra con `transform: scale()` +
`opacity` (nunca resorte). Mismo lenguaje de "marcado invierte a fondo sólido/borde
visible" que el chip de área, aplicado a una lista de opción única en vez de multi-select.

### Checklist (reutiliza `Casilla` tal cual)
Los checklists de p4/q3/q4 usan el mismo componente de chip de área del hermano,
parametrizado con un color neutro de marca (índigo) en vez de un color por opción — aquí
las opciones no tienen identidad propia como las áreas, así que un solo color de marca
para todo el checklist evita inventar 7-8 colores sin sentido semántico. La opción
"Otro/Otra" revela su input de texto con la misma transición de altura suave que ya usa
el hermano para errores de campo.

### Pregunta abierta (nuevo — `PreguntaAbierta`)
`<textarea>` con label 700 sentence-case, fondo `--surface-muted`, borde real, foco con
anillo de índigo — mismo tratamiento que cualquier input del hermano. Sin contador de
caracteres ni asterisco de obligatorio (son opcionales).

### Modal de recuperación de docente (nuevo — `SelectorDocentePretest`, dentro de `Modal`)
Reutiliza `Modal.jsx`/`Modal.css` tal cual (blur, panel centrado/bottom-sheet, cierre por
Escape/backdrop/✕). Contenido: lista de tarjetas clicables, una por docente candidato,
cada una con el nombre en peso 700 y sus chips de área (mismo componente `Casilla`, modo
solo-lectura) debajo en línea — así el docente reconoce su propio registro por color antes
de leer el texto. Botón secundario fijo al final de la lista: "No estoy en la lista /
continuar manualmente".

### Panel de evolución (nuevo — `EvolucionAgregada`, Recharts)
Gráfico de barras agrupadas (Recharts `BarChart`), una barra `--pre` y una `--post` por
institución más una barra "Global" al final, mismo radio de esquina superior (`4px`) que
el resto del sistema usa en controles pequeños, tooltip con fondo blanco + sombra teñida
de índigo (no la sombra gris default de Recharts), grid solo horizontal en
`--surface-band`. Fuera de esta vista, ningún otro indicador del panel usa una librería de
gráficos — los de una sola métrica siguen el patrón de barra CSS por `--pct` del hermano.

## Do's and Don'ts

### Do
- **Do** mantener el color de un área idéntico entre este producto y el hermano — un
  docente que participa en ambos talleres lo reconoce igual.
- **Do** usar `transform`/`opacity` para toda animación de estado, `--ease-out` para toda
  entrada — nunca resorte/rebote.
- **Do** revelar la siguiente pregunta con una transición real cuando se completa la
  anterior, para sostener "muy dinámico" sin fragmentar el formulario en pasos separados.

### Don't
- **Don't** usar rojo/verde semántico en el panel de evolución — no es un
  aprobado/reprobado.
- **Don't** exponer, ni siquiera en el código fuente del bundle del panel, cuál opción de
  cada pregunta es la "alineada" — esa clave vive solo en el backend.
- **Don't** inventar un segundo lenguaje visual para el checklist o el radio-card; ambos
  heredan la lógica de "marcado invierte a sólido/borde visible" del chip de área ya
  validado en el hermano.
