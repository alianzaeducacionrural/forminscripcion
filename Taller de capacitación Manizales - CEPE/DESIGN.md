---
name: Inscripción de docentes — Metodologías Activas
description: Formulario dinámico y colorido — cada área del conocimiento con su propio color de identidad, tarjetas blancas con degradado índigo/violeta.
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
---

# Design System: Inscripción de docentes — Metodologías Activas

## Overview

**Creative North Star: "El colegio con color"**

Segunda dirección visual del proyecto — la primera ("el formulario oficial de rectoría",
ledger gris/mono) fue construida, probada, y **rechazada explícitamente** por el usuario
tras verla en uso real: "muy plano, muy simple, quiero algo más dinámico, más colores".
Esta versión reemplaza ese mundo por completo: tarjetas blancas limpias sobre un fondo
azul-violeta muy claro con degradado radial, un acento índigo→violeta para toda acción
primaria, y — la decisión más específica — **cada una de las 5 áreas del conocimiento
tiene su propio color de identidad**, así que la lista de áreas de un docente se lee de
un vistazo por color, no solo por texto.

Rechazos confirmados durante la construcción de esta segunda versión:
- Easing tipo resorte/rebote (`cubic-bezier(0.34, 1.56, 0.64, 1)` y keyframes con
  overshoot) — el detector de patrones de IA lo marca como "dated and tacky"; se
  reemplazó por una curva de desaceleración exponencial en toda entrada animada.
  Los usos previos y su reemplazo están documentados en el token `--ease-out`.
- Fondo de tarjeta y campos del mismo tono lavanda — el usuario reportó que la fila de
  docente, sus inputs y los chips sin marcar "casi no se diferencian". Se corrigió
  invirtiendo la jerarquía: tarjeta = blanco puro + borde, campos internos = gris claro
  con borde real (no transparente), chips = borde de su propio color siempre visible,
  marcado o no.

**Key Characteristics:**
- Una sola familia (Plus Jakarta Sans, autoalojada) para todo — sin fuente monoespaciada,
  sin registro "de máquina de escribir".
- Botones y CTA primario en degradado índigo→violeta, radio píldora, sombra teñida del
  mismo color (nunca gris).
- Selección de institución: `<select>` nativo estilizado — no una rejilla de opciones.
- Selección de áreas: chips de color, uno por área, alternables con transform+opacity
  (nunca animando `width`).
- Confirmación de envío: modal (no una sección en línea), con botón de cerrar visible.

## Colors

Estrategia "Full palette": índigo/violeta como marca, más 5 colores de identidad para las
áreas del conocimiento — deliberadamente más saturados que un sistema Restrained, porque
el usuario pidió explícitamente más color.

### Primary
- **Índigo** (`#4f46e5`): toda acción primaria — botón "Inscribir docentes", "Confirmar y
  enviar", foco de campos, folio, barra de cobertura y de volumen, insignia del sello.
- **Violeta** (`#7c3aed`): pareja del degradado primario (`linear-gradient(135deg, índigo,
  violeta)`); nunca se usa sola fuera del degradado.

### Colores de área (Full palette, con propósito — no decoración suelta)
- **Índigo** — Matemáticas
- **Violeta** (`#9333ea`, distinto del secundario de marca) — Lenguaje
- **Verde** (`#059669`) — Ciencias Naturales
- **Ámbar** (`#d97706`) — Ciencias Sociales
- **Rosa** (`#db2777`) — Docente líder La Universidad en el Campo

Cada color tiene una versión "wash" (fondo al 9-10% de opacidad) para el estado sin
marcar y el color sólido para el estado marcado. Se repiten exactamente en tres lugares:
el chip del formulario, la etiqueta de la tabla del admin, y el chip del desglose "por
área" — un área siempre es el mismo color en todo el producto.

### Neutral
- **Fondo** (`#f5f7ff`): página, con degradado radial índigo/violeta muy sutil.
- **Superficie** (`#ffffff`): tarjetas, filas de docente — blanco puro para que los
  campos y chips de color tengan de qué destacar.
- **Superficie apagada** (`#f1f3fb`): inputs, selects, filas alternas de tabla —
  siempre un nivel más oscuro que la tarjeta que la contiene, nunca el mismo tono.

### Named Rules
**The Card-Is-White Rule.** Toda tarjeta o fila contenedora es blanco puro con borde
real (`--border`); los campos y controles dentro de ella usan `--surface-muted`. Nunca al
revés — fue exactamente el error que hizo que los inputs "se perdieran" en la primera
iteración de esta paleta.

**The One Color, One Meaning Rule.** El sello de confirmación exitosa usa índigo, no
rojo ni verde — el rojo es exclusivo de error, el verde exclusivo de "cobertura
completa". Ningún color de área se reutiliza como semántico.

## Typography

**Familia única:** Plus Jakarta Sans (autoalojada vía `@fontsource`, pesos 400/500/600/
700/800) — headings y cuerpo comparten familia; la jerarquía viene de peso y tamaño, no
de un segundo tipo de letra.

### Hierarchy
- **Heading** (800, `-0.01em` tracking): títulos de página y de sección.
- **Subtítulo** (600, `--text-sm`, `--ink-tertiary`): contexto inmediatamente debajo del
  heading — nunca un kicker encima.
- **Body** (400, 1rem, line-height 1.55): texto corrido.
- **Label de campo** (700, `--text-sm`, sentence case): etiquetas de formulario — ya no
  van en mayúscula/mono como en la primera versión.

## Layout

Contenedor único (`.hoja`), 760px en el formulario / 1120px en el admin, blanco, radio
22px, `overflow: hidden`, flotando sobre el fondo con `box-shadow` teñida de índigo
(nunca gris). Responsive estructural: el select de institución y las filas de docente se
apilan solas por ser ya de ancho completo; la tabla del admin pasa a tarjetas por debajo
de 780px; los chips de área hacen wrap libremente.

## Elevation & Depth

Sombras siempre teñidas del color del elemento que las proyecta (`--shadow-btn` en
índigo, `--shadow-card` en índigo tenue) — nunca `rgba(0,0,0,...)` plano. El botón
primario y el sello de éxito llevan la sombra más marcada del sistema; todo lo demás usa
`--shadow-sm`.

### Named Rules
**The Tinted Shadow Rule.** Ninguna sombra es gris neutro; toma el matiz del elemento
que la proyecta.

## Shapes

Radio píldora (`999px`) en botones, chips, selects, folio y barras de progreso — es el
lenguaje de forma dominante del sistema, reforzando el registro "app", no "documento".
Tarjetas y modal en 16-22px. Nada en ángulo recto salvo la tabla del admin.

## Components

### Botones
- **Primario:** degradado índigo→violeta, texto blanco, radio píldora, sombra teñida;
  hover levanta 1px y intensifica la sombra; activo escala a 0.97.
- **Secundario:** fondo `--surface-muted`, sin borde; hover pasa a wash de índigo.
- **Agregar (+):** borde punteado, transparente; hover llena con wash de índigo.

### Chip de área (componente de firma)
Botón píldora con borde de su propio color siempre visible (35% de opacidad sin marcar),
fondo wash del mismo color; marcado invierte a fondo sólido + texto blanco + check que
entra con `transform: scale()` + `opacity` (nunca `width`, evita layout thrash). Un mismo
componente (`Casilla.jsx`) sirve para las 5 áreas, parametrizado por `color`.

### Select de institución
`<select>` nativo con `appearance: none`, flecha propia dibujada en CSS, fondo
`--surface-muted`, foco con anillo de índigo (`box-shadow` de 4px). Reemplazó la rejilla
de opciones tipo casilla de la primera versión.

### Modal
Fondo oscuro con blur, panel blanco centrado (hoja abajo en móvil), botón de cerrar (✕)
siempre visible en la esquina — no depende solo de clic-afuera o Escape. Contiene la
revisión antes de enviar; se abre desde el botón "Inscribir docentes".

### Sello de confirmación
Círculo con degradado de marca y check blanco, con un anillo de pulso que se expande y
desvanece una sola vez. Entrada en un solo arco (`scale(0.4)→scale(1)` con
`--ease-out`) — la versión anterior tenía un keyframe de rebote (overshoot a 1.08) que
se eliminó junto con el resto del easing tipo resorte.

### Tabla (panel admin)
Encabezado sticky, filas con hover en wash de índigo, chips de área con su color de
identidad en cada celda. Sin columna de fecha — se quitó a pedido explícito. Por debajo
de 780px se convierte en tarjetas vía `data-etiqueta`.

## Do's and Don'ts

### Do:
- **Do** dar a cada área del conocimiento su propio color y mantenerlo idéntico en
  formulario, tabla y desglose del admin.
- **Do** usar `transform`/`opacity` para toda animación de estado (chips, barras de
  progreso) — nunca `width` ni `height`.
- **Do** usar la curva `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) para toda entrada
  animada — desaceleración exponencial, sin rebote.
- **Do** dar a toda tarjeta contenedora un fondo más claro que los campos/chips que
  contiene, nunca el mismo tono.

### Don't:
- **Don't** usar easing elástico o de resorte (`cubic-bezier` con overshoot, keyframes
  con un paso intermedio que exceda el valor final) — se probó, el detector lo marcó, se
  retiró.
- **Don't** reintroducir un kicker/eyebrow encima de un heading (ban heredado de la
  primera versión, sigue vigente).
- **Don't** dejar un borde transparente en un input o select que se apoya solo en el
  color de fondo para notarse — siempre un borde real (`--border` en reposo, `--primary`
  en foco).
