# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 19, CSS plano con tokens (sin framework CSS). Backend: Google Apps Script
(clasp) ligado a una Google Sheet; evidencias en Drive. Deploy: GitHub Pages vía GitHub
Actions, slot 6 del workflow raíz. Misma arquitectura que los proyectos hermanos del
monorepo (decidida por el usuario, no delegada).

## Users

1. **Padrino** que visita una de las 12 instituciones educativas (IE) de
   Manizales y diligencia la lista de chequeo *durante la visita*, de pie, en el teléfono,
   con conectividad irregular. Necesita avanzar rápido, adjuntar fotos/PDF como evidencia y
   no perder lo escrito si se cae la señal.
2. **Coordinación del programa** (Comité de Cafeteros de Caldas / Alianza Educación Rural):
   usa el panel `/admin/` (enlace no listado) para ver el estado de implementación por IE,
   brechas por componente y compromisos pendientes.

## Product Purpose

Hacer seguimiento a la implementación del **Protocolo de Articulación de la Educación Media
con la Posmedia** (*La Universidad en el Campo* – *Comunidades de Cambio*) mediante la
**Lista de chequeo de uso y apropiación institucional**: 14 criterios verificables
(SÍ / PARCIAL / NO / NO APLICA + evidencia), hallazgos con acción de mejora, responsable y
fecha, y un nivel de apropiación final (Consolidado, En desarrollo, Inicial, No evidenciado).
El texto de criterios y niveles es copia oficial: no se parafrasea.

## Positioning

No es un Google Form: la lista se vive como la **construcción de un puente** entre la
Educación Media y la Posmedia; cada criterio respondido tiende una tabla del puente, con
color según el estado. El panel muestra el mismo puente por IE, un mapa de calor
criterios × IE y los compromisos vencidos.

## Operating Context

- Visitas presenciales; una IE puede tener varias visitas (se registra número de visita).
- Alcance: solo las 12 IE aprobadas de Manizales (catálogo cerrado).
- Evidencia: texto + archivos (foto/PDF) subidos a Drive, privados (hay imágenes de menores).
- Sin autenticación; el panel está protegido solo por ser un enlace no listado (criterio
  de los proyectos hermanos).
- Todo el texto de interfaz en español (Colombia).

## Capabilities and Constraints

- La fila "Gestión de acuerdos" duplicada en el Word se deja una sola vez: 14 criterios
  (decisión del usuario).
- Identificación: padrino (select de los 19 padrinos), IE, fecha de visita, número de visita.
- Envío idempotente por `idEnvio`; borrador en localStorage (incluye enlaces de archivos).
- Los archivos se suben al instante al elegirlos; se reduce el tamaño de imágenes en el
  cliente. Límite ~8 MB, solo jpeg/png/webp/heic/pdf.

## Brand Commitments

Los 3 logos usados en los proyectos hermanos (Evidencia Potencial, Comité de Cafeteros,
Alcaldía de Manizales), sin alterar colores. Copia oficial de criterios y niveles.

## Evidence on Hand

- `LISTA DE CHEQUEO DE USO Y APROPIACIÓN INSTITUCIONAL.docx` (contenido final).
- Proyectos hermanos como plantilla técnica (`../Percepción pertinencia del programa/`,
  `../Acompañamiento entre pares/`). Su identidad visual NO se reutiliza: el usuario pidió
  algo "llamativo, creativo y muy diferente".

## Product Principles

1. **Un criterio a la vez, con la mano en el teléfono.** Botones grandes, un toque responde.
2. **Nada se pierde.** Borrador, subidas y reintentos resisten mala señal.
3. **El estado se ve, no se lee.** Color + forma + texto: nunca solo color.
4. **La evidencia es privada.** Los archivos no se publican con enlace abierto.
5. **El panel responde "¿dónde está la brecha y quién se comprometió a cerrarla?"**

## Accessibility & Inclusion

Labels reales, foco visible, áreas de toque ≥ 48 px, contraste AA, estados SÍ/PARCIAL/NO/NA
diferenciados por forma y texto además de color, `prefers-reduced-motion` respetado.
