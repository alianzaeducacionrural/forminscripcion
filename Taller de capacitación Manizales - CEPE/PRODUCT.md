# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 19, plain CSS with tokens (no CSS framework). Backend: Google Apps Script
(managed via `clasp`) bound to a Google Sheet. Deploy: GitHub Pages via GitHub Actions.
Decided by the user, not delegated — matches the existing sibling project ("Pretest de
Microcredenciales") whose architecture this reuses.

## Users

Two distinct users, both served by this one product:

1. **Rector(a)** of one of 13 rural educational institutions (IE) in Manizales, Caldas.
   Fills the public form once (or a few times, to add teachers they forgot) to register the
   teachers from their IE who will attend the workshop. Often on a mobile phone, sometimes
   with unreliable connectivity. Not a technical user — has no account, no login, just an
   unlisted link shared by program coordinators.
2. **Program coordinator** (the requester, Comité de Cafeteros de Caldas / Alianza
   Educación Rural staff). Uses the admin panel at an unlisted route to track which of the
   13 IE have registered, how many teachers total, and by which área del conocimiento, then
   exports a CSV for workshop logistics (materials, room groups, attendance sheets).

## Product Purpose

A single-purpose registration form: **Capacitación en Metodologías Activas**, a teacher
training workshop. Rectors register their institution's participating teachers (name,
phone, one or more knowledge areas). Success = knowing, without chasing anyone by
WhatsApp, how many of the 13 IE have registered, who is missing, and the full teacher
roster with contact info and area, ready to export.

Official workshop objective (verbatim, must appear on the form as the reason this exists):

> Fortalecer habilidades en los docentes para el uso de metodologías activas y el
> mejoramiento de aprendizajes de los estudiantes, en procura de las trayectorias
> educativas completas.

## Positioning

Not a general survey tool — a purpose-built, single-workshop roster intake. The mechanism
a generic Google Form or Typeform could not replicate: institution-scoped submission that
accumulates across multiple visits from the same rector (resubmitting adds teachers rather
than overwriting), plus a live coverage view (which of the 13 named IE are still missing)
that a generic form's response sheet does not surface without manual work.

## Operating Context

- Rectors receive the form link (likely via WhatsApp or email from the program
  coordinator) and fill it once, live, often from a phone at their institution.
  Connectivity in rural Caldas is not guaranteed to be fast or stable.
- One rector may return to the link a second time to add teachers they initially forgot;
  the product must not let this silently discard the first submission.
- All UI text is in Spanish (Colombia).
- The coordinator opens the admin route periodically (not continuously) to check
  coverage before the workshop date and to pull the CSV for logistics.
- No authentication anywhere. The admin route is protected only by being an unlisted
  link — same posture as the sibling Pretest project.

## Capabilities and Constraints

- Fixed catalog of 13 institutions (closed list, not free text):
  Giovanni Montini, Granada, José Antonio Galán, La Cabaña, La Linda, La Trinidad,
  La Violeta, Maltería, María Goretti, Miguel Antonio Caro, Rafael Pombo, San Peregrino,
  Seráfico San Antonio de Padua.
- Fixed catalog of 5 knowledge areas (closed list): Matemáticas, Lenguaje, Ciencias
  Naturales, Ciencias Sociales, Docente líder La Universidad en el Campo.
- **A teacher can belong to one, two, or more areas at once** — area selection is
  multi-select per teacher, not single-choice. This affects how counts are computed and
  displayed: per-area counts will sum to more than the total teacher count, and that must
  be labeled honestly rather than shown as if it were a percentage breakdown.
- Per-teacher fields are intentionally minimal: full name, contact phone, area(s). No
  email, no ID/cédula, no sede — confirmed explicitly, not an oversight.
- The header only asks for the institution — no rector name, email, or phone is
  collected. Confirmed explicitly.
- Backend is a Google Sheet (one row per teacher, not one row per teacher-area pair), so
  a program staffer who is not a developer can open it directly if needed.
- No login/auth anywhere in this product.

## Brand Commitments

Three partner logos, supplied as-is in `Logos/` at the project root and copied into
`frontend/src/assets/`. These are a fixed lockup, not placeholders, and materially
constrain any visual world:

| File | Mark | Graphic character |
|---|---|---|
| `logo-1-evidencia-potencial.png` | Colombia Evidencia Potencial en Educación | Electric blue + saturated yellow, condensed geometric sans, on transparent background |
| `logo-2-comite-cafeteros.png` | Comité de Cafeteros de Caldas | Pure black, monochrome, includes the Federación Nacional de Cafeteros shield |
| `logo-3-alcaldia-manizales.png` | MZL Manizales del alma + Alcaldía de Manizales | Black wordmark + a polychrome shield (green, brown, red) |

Constraint this imposes: two marks are black-on-transparent and the third carries a
saturated blue/yellow palette plus a polychrome shield. Whatever surface hosts this
lockup needs a light, fairly neutral backing field, and the product's own accent color
must not compete with the blue/yellow or the shield. The lockup reads as its own band,
not embedded inside a saturated color field.

Workshop name is fixed: **"Capacitación en Metodologías Activas"**. The objective
paragraph above is official copy and must not be paraphrased.

## Evidence on Hand

- No existing screenshots, mockups, or prior visual system for this specific product.
- Sibling project **"Pretest de Microcredenciales"** (`../Microcredenciales Liderazgo
  Directivo - Rectores/Pretest/`) solves an operationally similar problem for an
  overlapping rector audience. Its *architecture* (GAS backend shape, CORS workaround,
  CSV export, localStorage draft pattern) is reused. Its *visual system* (parchment/
  terracotta palette, Fraunces + Inter) and its four-logo set are explicitly **not**
  reused — different logo set here, and a new visual world is being built for this
  product rather than inheriting that one.
- Real institution and area names above are the actual, final catalog data — not
  placeholder content.

## Product Principles

1. **The rector should never lose work.** Draft state persists locally; a second visit
   from the same institution adds to what exists rather than replacing it.
2. **Multi-area is real, not an edge case.** Every count, filter, and export must treat a
   teacher's areas as a set, and never silently collapse it to one.
3. **The coordinator's first question is "who's missing."** Coverage against the 13 IE is
   a first-class, always-visible fact in the admin view, not something derived by
   scanning a table.
4. **No login, no friction.** Both the form and the admin route stay reachable by a bare
   link. Security posture is "unlisted," matching the sibling project by design, not by
   default.
5. **The lockup is non-negotiable.** All three logos ship together, legibly, on a backing
   that does not fight their existing colors.

## Accessibility & Inclusion

No explicit standard was mandated. Given the primary audience (rectors on phones, some in
areas with modest connectivity, filling this during a work day), the product should
default to strong basics: real form labels, visible focus states, adequate touch targets
for the multi-select area controls, and no reliance on color alone to convey selection or
validation state.
