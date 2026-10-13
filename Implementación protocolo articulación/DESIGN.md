---
name: El Puente — Protocolo de articulación media–posmedia
description: Plano de obra cálido. Papel crema, tinta azul de plano, un puente SVG que se construye tabla a tabla; acentos de café y estados SÍ/PARCIAL/NO/NA con forma propia.
colors:
  paper: "#f4efe6"
  paper-2: "#ebe4d6"
  surface: "#fffdf8"
  ink: "#14263f"
  ink-2: "#44546b"
  ink-3: "#6b778a"
  line: "#d9cfbb"
  blueprint: "#1d3a63"
  cafe: "#6b3f26"
  si: "#0f8b7f"
  parcial: "#d99a00"
  no: "#c4452d"
  na: "#8a8f98"
  focus: "#f26b21"
typography:
  display:
    fontFamily: "'Fraunces Variable', Georgia, serif"
    fontWeight: 700
  body:
    fontFamily: "'Figtree Variable', system-ui, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.5
  mono:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    note: "Etiquetas tipo plano: números de criterio, cotas, fechas."
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
---

# Design

## Concepto
Mesa de ingeniería: papel crema con cuadrícula tenue de plano, tinta azul, cotas en mono.
Dos orillas (**Educación Media** a la izquierda, **Posmedia** a la derecha) y 14 tablas entre
ellas. El puente es el elemento firma: header del formulario, pantalla final y tarjetas del panel.

## Estados (forma + color + texto)
- **SÍ**: tabla sólida teal, check.
- **PARCIAL**: tabla a medias (relleno 50 %), ámbar, trazo discontinuo.
- **NO**: hueco con contorno terracota, cruz.
- **NO APLICA**: tabla fantasma gris, guion.
- Sin responder: contorno punteado tinta.

## Movimiento
La tabla "cae" en su lugar (200–300 ms, ease-out) al responder; transición de tarjeta
deslizando en horizontal. Todo se desactiva con `prefers-reduced-motion`.

## Componentes clave
- **Tarjeta de criterio**: número en mono, componente en display, criterio oficial, 4
  botones grandes, evidencia (texto + adjuntar), pista del Word como placeholder.
- **Sellos** de nivel de apropiación: 4 sellos circulares tipo timbre.
- **Panel**: tarjetas por IE con mini-puente, mapa de calor criterios × IE, lista de
  compromisos con vencidos resaltados.
