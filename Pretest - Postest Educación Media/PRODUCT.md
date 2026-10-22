# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 19, plain CSS with tokens (no CSS framework). Backend: Google Apps Script
(managed via `clasp`) bound to a Google Sheet. Deploy: GitHub Pages via GitHub Actions.
Decided by the user, not delegated — matches the sibling project in this same monorepo
("Taller de capacitación Manizales - CEPE") whose architecture this reuses exactly.

## Users

Two distinct users, both served by this one product:

1. **Docente** de una de 14 instituciones educativas rurales de Manizales, Caldas.
   Llena el Pretest antes del taller y el Postest después, desde el enlace público
   correspondiente. A menudo desde un teléfono, sin cuenta ni login. No está siendo
   evaluado — se le pide honestidad, no una respuesta "correcta".
2. **Coordinador(a) del programa** (Comité de Cafeteros de Caldas / Alianza Educación
   Rural). Usa el panel de administración en una ruta no listada para ver participación,
   resultados de Pretest y Postest por separado, y un análisis agregado de la evolución
   entre ambos, por institución y en conjunto.

## Product Purpose

Dos cuestionarios de una sola vez — **Pretest** y **Postest** — para el taller
"Estrategias metodológicas activas y uso pedagógico de evidencias" (iniciativa *La
Universidad en el Campo* / *Comunidades de Cambio*). El propósito **no es calificativo**:
no hay nota ni resultado correcto/incorrecto visible para el docente. El fin es
recopilar qué sabían los docentes antes del taller y qué aprendieron después, para que el
coordinador pueda ver el efecto del taller sin perseguir a nadie por WhatsApp.

Propósito oficial del Postest (verbatim, debe aparecer en el formulario tal cual):

> Valorar los aprendizajes alcanzados durante el taller y la capacidad de los docentes
> para utilizar estrategias metodológicas activas a partir del análisis de evidencias de
> aprendizaje.

## Positioning

No es una encuesta genérica de Google Forms/Typeform: el mecanismo que estos no replican
es (1) la recuperación de datos del docente entre Pretest y Postest — el docente elige su
institución en el Postest y el sistema le ofrece autocompletar su nombre y áreas desde su
registro previo de Pretest, sin obligarlo a re-digitar nada, con salida manual si no
aplica — y (2) un panel que calcula, sin exponerlo nunca al docente, una métrica interna
de alineación con la práctica pedagógica recomendada por pregunta, agregada por
institución y en conjunto, mostrando la evolución pre→post del taller.

## Operating Context

- Los docentes reciben el enlace correspondiente (Pretest antes del taller, Postest
  después) probablemente por WhatsApp o correo del coordinador, y lo llenan una sola vez,
  en vivo, a menudo desde el teléfono en la institución.
- El Pretest y el Postest son instrumentos independientes, con preguntas y redacción
  propias (no son la misma pregunta repetida) — no hay emparejamiento pregunta a
  pregunta entre ambos; la comparación pre→post es agregada, no por pregunta.
- Un mismo docente puede aparecer en Pretest, en Postest, en ambos, o en ninguno; el
  panel debe mostrar participación en esos términos (solo-pre / solo-post / ambos).
- Reenvío duplicado (misma institución + mismo nombre, mismo test) se bloquea con un
  error visible — no se sobrescribe ni se acumula.
- Todo el texto de la interfaz está en español (Colombia).
- El coordinador abre la ruta de administración periódicamente (no continuamente) para
  revisar avance y resultados, no en tiempo real.
- Sin autenticación en ningún lado. La ruta de administración está protegida solo por ser
  un enlace no listado — mismo criterio que el proyecto hermano.

## Capabilities and Constraints

- Catálogo cerrado de 14 instituciones (no texto libre): Adolfo Hoyos Ocampo, Giovanni
  Montini, Granada, José Antonio Galán, La Cabaña, La Linda, La Trinidad, La Violeta,
  Maltería, María Goretti, Miguel Antonio Caro, Rafael Pombo, San Peregrino, Seráfico San
  Antonio de Padua.
- Catálogo cerrado de 5 áreas (selección múltiple por docente, no de opción única):
  Matemáticas, Lenguaje, Sociales, Ciencias Naturales, Líder La Universidad en el Campo.
- Encabezado común a Pretest y Postest: institución (select), nombre del docente (texto,
  normalizado a estilo Nombre Propio antes de guardar), áreas que orienta (multi-select).
- El Pretest tiene 4 preguntas cerradas (3 de opción única + 1 checklist con "Otro" libre)
  y una sección abierta de 3 sub-campos. El Postest tiene un párrafo de propósito, 2
  preguntas de opción única, 2 checklists (uno con "Otra" libre) y una sección abierta de
  4 sub-campos. Los sub-campos de texto abierto son opcionales, no obligatorios —
  coherente con "no es calificativo, es para recopilar información" y para no generar
  fricción de envío.
- El panel de administración calcula internamente, por pregunta de opción única o
  checklist con una opción claramente desalineada, un indicador de alineación con la
  práctica pedagógica recomendada. Este indicador **nunca se muestra ni se etiqueta como
  correcto/incorrecto al docente** — solo existe en el panel del coordinador. La clave de
  respuestas vive únicamente en el backend (Google Apps Script), nunca en el bundle del
  frontend público.
- Backend: una Google Sheet (bound script) con tabs `Instituciones`, `Pretest`,
  `Postest` — una fila por envío, no por sub-respuesta — para que un miembro del programa
  no técnico pueda abrirla directamente si lo necesita.
- Sin login/autenticación en ningún punto del producto.

## Brand Commitments

Los mismos 3 logos ya usados en el proyecto hermano "Taller de capacitación Manizales -
CEPE" (Colombia Evidencia Potencial en Educación, Comité de Cafeteros de Caldas, Alcaldía
de Manizales) — reutilizados tal cual, sin pedirlos de nuevo al usuario. Mismo lockup, sin
alterar sus colores. El nombre del taller y el párrafo de propósito del Postest son copia
oficial y no deben parafrasearse.

## Evidence on Hand

- El contenido real y final de ambos instrumentos (todas las preguntas, opciones y
  checklists) viene de `PRETEST.docx` en la raíz de este proyecto — no es contenido de
  relleno.
- Proyecto hermano **"Taller de capacitación Manizales - CEPE"** (mismo monorepo) resuelve
  un problema operativo similar para una audiencia de docentes/rectores superpuesta. Su
  *arquitectura* (backend GAS, workaround de CORS, exportación CSV, patrón de borrador en
  localStorage, patrón de modal) se reutiliza explícitamente. Su *identidad visual*
  (índigo/violeta, Plus Jakarta Sans) no está confirmada como reutilizable — pendiente de
  decidir en la fase de diseño (new-work), junto con la pregunta abierta de qué tan
  "dinámico" (progressive reveal, feedback en vivo) debe sentirse el formulario, que el
  usuario pidió explícitamente sin especificar el mecanismo exacto.
- No hay mockups ni capturas previas específicas de este producto.

## Product Principles

1. **No es un examen.** Ningún texto, color, ícono o comportamiento debe sugerirle al
   docente que hay una respuesta correcta o que está siendo calificado.
2. **El docente nunca vuelve a escribir lo que ya escribió.** El Postest siempre ofrece
   recuperar nombre y áreas desde el Pretest de su institución, con salida manual clara
   si no aplica.
3. **La alineación pedagógica es una herramienta del coordinador, no del docente.** Vive
   solo en el backend y solo se muestra en el panel de administración.
4. **Pretest y Postest son instrumentos propios, no un antes/después forzado
   pregunta-por-pregunta.** La comparación de evolución es agregada (participación,
   promedio de alineación), nunca una tabla de "pregunta 3 antes vs. pregunta 3 después"
   inventada donde el contenido real no corresponde.
5. **Sin fricción, sin login.** Both enlaces (Pretest, Postest, admin) se abren directo;
   los campos de texto libre son opcionales para no frenar el envío.

## Accessibility & Inclusion

No se mandató un estándar explícito. Dado el público principal (docentes en el teléfono,
algunos con conectividad limitada, llenando esto en medio de su jornada), el producto
debe cubrir lo básico con solidez: labels reales, estados de foco visibles, áreas de
toque adecuadas para los checkboxes de checklist y de áreas, y no depender solo del color
para comunicar selección o error de validación.
