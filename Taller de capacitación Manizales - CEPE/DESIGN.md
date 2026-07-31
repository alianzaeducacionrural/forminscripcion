---
name: Inscripción de docentes — Metodologías Activas
description: El formulario oficial de rectoría, vivo — casillas de ledger, folio y sello de recibido para inscribir docentes al taller.
colors:
  paper: "#f2f4f7"
  paper-raised: "#fbfcfd"
  paper-inset: "#eaedf2"
  paper-band: "#e4e9f0"
  ink: "#1c2733"
  ink-secondary: "#47566a"
  ink-tertiary: "#6f7c8c"
  ink-muted: "#97a1ad"
  accent: "#1a5bab"
  accent-dark: "#123f7d"
  success: "#2f6b3f"
  error: "#b23026"
  warning: "#9a6a10"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  heading:
    fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  mono-label:
    fontFamily: "ui-monospace, 'Cascadia Code', 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  sm: "3px"
  md: "6px"
  stamp: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper-raised}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  casilla:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  casilla-marcada:
    backgroundColor: "{colors.accent}"
---

# Design System: Inscripción de docentes — Metodologías Activas

## Overview

**Creative North Star: "El formulario oficial de rectoría, vivo"**

El producto no se viste de dashboard ni de landing page: se viste del objeto que un
rector ya conoce de memoria — el formulario administrativo colombiano, con sus casillas
cuadriculadas, su membrete de logos, su radicado y su sello de recibido. La diferencia con
el papel es que aquí las casillas validan en vivo, el contador de docentes sube en tiempo
real y el sello se estampa con una animación al confirmar. Es un mundo deliberadamente
distinto del cluster genérico de interfaces de IA (nada de pergamino cálido + terracota +
serif editorial, nada de negro casi puro con acento neón): papel bond frío, tinta
azul-negro de bolígrafo, un único acento azul institucional.

Rechazo confirmado durante la construcción: ninguna línea de "ruled paper" de fondo
continua — cruzaba el texto de los encabezados como un tachado y se retiró; el carácter de
ledger vive en los bordes entre secciones, no en una textura de fondo.

**Key Characteristics:**
- Registro de "formulario oficial vivo": casillas, radicado, sello — nunca tarjetas de dashboard genéricas.
- Una sola familia sans de sistema para todo el cuerpo; una mono de sistema reservada para códigos, folios, teléfonos y etiquetas de campo — cero descarga de fuentes (conectividad rural).
- Acento único, azul institucional, usado solo en acción primaria, selección y foco.
- Sin kickers/eyebrows sobre encabezados en ningún punto: el heading siempre lidera, el contexto va debajo en mono minúsculo.

## Colors

Paleta Restrained: neutros de papel bond frío más un único acento azul institucional.
Reservada — nunca decorativa fuera de acción primaria, selección y estados.

### Primary
- **Azul institucional** (`#1a5bab`): acción primaria (botón "Revisar inscripción", "Confirmar y enviar"), casilla marcada, folio, barra de cobertura y de volumen, sello de "recibido". Deliberadamente menos saturado que el azul eléctrico del logo 1 (misma familia, mucho más oscuro) para no competir con el membrete.
- **Azul institucional oscuro** (`#123f7d`): hover de botón primario, texto de institución en la revisión.

### Neutral
- **Papel** (`#f2f4f7`): fondo de la hoja principal.
- **Papel elevado** (`#fbfcfd`): inputs, filas de docente, casillas sin marcar.
- **Papel hundido** (`#eaedf2`): fondo de fila vacía, chips de área, avisos informativos.
- **Franja de membrete** (`#e4e9f0`): banda que aloja los 3 logos.
- **Tinta** (`#1c2733`): texto principal — azul-negro de bolígrafo, nunca negro puro.
- **Tinta secundaria** (`#47566a`): subtítulos, etiquetas de campo.
- **Tinta terciaria** (`#6f7c8c`): notas, placeholders, columnas secundarias de tabla.
- **Tinta apagada** (`#97a1ad`): instituciones en cero, texto deshabilitado.

### Semántica
- **Éxito** (`#2f6b3f`): estado "cobertura completa" en el panel.
- **Error** (`#b23026`): validación de campo, error de envío. Reservado — el sello de confirmación usa el azul, no el rojo, para no cargar dos significados sobre el mismo color.
- **Advertencia** (`#9a6a10`): aviso de conexión no confirmada.

### Named Rules
**The One Accent Rule.** El azul institucional es el único color que puede marcar
acción o selección. El verde y el rojo son semánticos y exclusivos de sus estados — nunca
se usan como acento decorativo.

## Typography

**Body/Heading Font:** system-ui sans stack (`ui-sans-serif, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)
**Label/Mono Font:** system mono stack (`ui-monospace, 'Cascadia Code', 'SFMono-Regular', Menlo, Consolas, monospace`)

**Character:** una sola familia sans hace todo el trabajo de cuerpo y encabezados —
Operate mode no necesita un par display/body. La mono aparece únicamente donde el
formulario oficial la usaría: códigos de institución (IE01…IE13), folios, teléfonos,
fechas y etiquetas de campo en mayúscula — nunca como decoración "técnica".

### Hierarchy
- **Heading** (700, 1.5rem/1.25rem según contexto, line-height 1.2): título de la página (`h1`, `h2`). Siempre lidera — nunca precedido por un kicker.
- **Subtítulo mono** (600, 0.75rem, letter-spacing 0.06em, mayúsculas): contexto inmediatamente debajo del heading (p. ej. "Formulario de inscripción de docentes" bajo el h1). Nunca arriba del heading.
- **Body** (400, 0.9375rem, line-height 1.55): texto corrido, instrucciones, notas.
- **Label** (600, 0.75rem, letter-spacing 0.06em, mayúsculas, mono): etiquetas de campo ("NOMBRE COMPLETO", "TELÉFONO DE CONTACTO").

### Named Rules
**The No-Kicker Rule.** Ningún encabezado lleva una etiqueta de una línea encima. El
heading dice lo que es; el contexto adicional va debajo, en mono minúsculo. (Este es un
ban explícito descubierto por el detector de patrones de IA durante la construcción —
había tres instancias y las tres se invirtieron.)

## Layout

Contenedor único (`.hoja`), máximo 760px en el formulario y 1080px en el panel admin,
centrado, con borde de 1px y esquinas de 6px. Las secciones se separan con bordes
horizontales de 1px (`--rule-standard`), nunca con espacio en blanco solo — el carácter de
ledger viene de esas reglas entre secciones.

Responsive: estructural, no tipográfico. El selector de instituciones pasa de 2 columnas a
1 por debajo de 560px; la tabla del panel se convierte en tarjetas por debajo de 780px
(`data-etiqueta` como pseudo-encabezado por celda); los dos bloques del panel (cobertura +
volumen) se apilan por debajo de 780px.

## Elevation & Depth

Sistema mayormente plano con una sola sombra suave (`0 4px 16px rgba(28,39,51,.08)`) en el
contenedor `.hoja`, que ancla la hoja sobre el fondo `--paper-inset`. Todo lo demás dentro
de la hoja se distingue por borde de 1.5px, no por sombra — evita el "ghost card" (borde
fino bajo sombra ancha).

### Named Rules
**The Border-Not-Shadow Rule.** Dentro de la hoja, la jerarquía entre fila de docente,
input y casilla se resuelve con `border` de 1.5px, nunca con sombra adicional.

## Shapes

Radios pequeños y consistentes: 3px en casillas/inputs/chips, 6px en contenedores mayores
(`.hoja`, fila de docente), circular (`999px`) solo en el anillo del sello y en las barras
de progreso. Sin esquinas grandes tipo "app card" — el radio pequeño sostiene el registro
de formulario impreso.

## Components

### Botones
- **Shape:** radio 3px, padding 12px 20px.
- **Primario:** fondo `--accent`, texto `--accent-contrast`; hover `--accent-dark`; activo se desplaza 1px.
- **Secundario:** fondo `--paper-raised`, borde 1.5px `--rule-emphasis`; hover borda en `--accent`.
- **Agregar (+):** borde punteado, sin relleno; hover llena con `--accent-wash`.

### Casilla (componente de firma)
Cuadro de 19×19px con borde 1.5px; marcado invierte a fondo `--accent` con check SVG
animado (180ms). `type="radio"` usa esquina circular; `type="checkbox"` esquina de 2px.
Cada casilla puede llevar un código mono a la izquierda (p. ej. `IE01`). Es el control que
más se repite en el producto — selector de institución y grupo de áreas comparten el mismo
componente, con distinto `type`.

### Sello (componente de firma)
Anillo SVG + check trazado a mano, con texto "RECIBIDO" y fecha en mono **debajo** del
anillo (nunca superpuesto: la primera versión ponía el texto encima con margen negativo y
quedaba ilegible). Animación de estampado: escala 1.6→1, rotación -8°→-3°, 480ms.

### Inputs / Campos
- **Style:** borde 1.5px `--rule-standard`, fondo `--paper-raised`, radio 3px.
- **Focus:** borde pasa a `--accent`.
- **Error:** borde y fondo `--error`/`--error-wash`, mensaje en línea debajo del campo.

### Tabla (panel admin)
Encabezado sticky en `--paper-band`, filas con hover `--accent-wash`. Por debajo de 780px
se transforma en tarjetas apiladas vía `data-etiqueta` en cada celda — no hay una vista
separada para móvil.

### Barras de progreso/volumen
`transform: scaleX()` desde `transform-origin: left`, nunca `width` animado (layout
thrash confirmado por el detector y corregido).

## Do's and Don'ts

### Do:
- **Do** usar la mono de sistema solo para códigos, folios, teléfonos, fechas y
  etiquetas de campo — nunca como decoración de "look técnico".
- **Do** animar barras de progreso con `transform: scaleX()`, nunca con `width`.
- **Do** mantener el heading como primer elemento de cada bloque; cualquier contexto
  adicional va debajo, en mono minúsculo.
- **Do** reservar el azul institucional para acción primaria, selección y foco —
  cualquier otro uso es decoración y se retira.

### Don't:
- **Don't** poner un kicker/eyebrow encima de un heading, bajo ninguna circunstancia
  (ban absoluto, no un default con excepción de marca).
- **Don't** usar `border-left`/`border-right` de color como acento de tarjeta o callout;
  el borde de sección es siempre `--rule-standard` neutro.
- **Don't** reintroducir la ruled-line de fondo continua en `.hoja` — cruza texto de
  altura variable de forma impredecible.
- **Don't** usar el rojo de error para el sello de confirmación exitosa; el sello es
  siempre azul institucional.
