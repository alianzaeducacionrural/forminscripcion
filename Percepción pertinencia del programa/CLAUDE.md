# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Built. `Encuesta de valoración del Programa Técnico Profesional CEPE.docx` is the source content.

- `frontend/`: Vite + React 19 single-page wizard (`src/App.jsx`; survey copy in `src/data/encuesta.js`;
  catalogs in `src/data/catalogos.js`). Commands: `npm run dev|build|lint`. Draft saved in localStorage;
  `idEnvio` UUID makes submits idempotent. Cascading selects: Universidad→Programa, Municipio→Institución.
- `backend/`: Apps Script bound to a Sheet in the Drive folder `1YR2JruHCSf7kmgFI0sbnytCcCTUfuEfn`
  (`clasp push -f`, `clasp create-deployment`). `Code.js` self-creates the `Respuestas` sheet on first
  request and validates against catalogs duplicated from the frontend. Questions are keys p01..p26.
- Catalog rules (user-requested): no IES CINOC, no Católica "Microcredenciales", Universidad de Manizales
  only "(modalidad combinada)" programs. Source sheet: `1sDwOuJk0x1mO6lxJbzzWTd088SOg7fAWEuXSZEM1Eog`
  (tabs Instituciones, Programas). Municipios/instituciones come from the Instituciones tab (all municipios).
- Panel admin: `/admin/` (second Vite entry, `src/admin/`); reads `getRespuestas` from the backend, filters + charts + open answers + CSV. Unlisted link, no auth.
- Deploy: root workflow slot 5, slug `percepcion-pertinencia-programa`, secret `VITE_API_URL_PERCEPCION_PERTINENCIA`.

The .docx is a real Word file: read it by unzipping and parsing `word/document.xml`
(e.g. `unzip -p *.docx word/document.xml | sed 's/<\/w:p>/\n/g; s/<[^>]*>//g'`), not with a plain-text reader.

The instrument is the **"Encuesta de valoración del Programa Técnico Profesional"**
(*La Universidad en el Campo* – iniciativa *Comunidades de Cambio*), answered by **students**
(not teachers, unlike the sibling forms). Structure:

- **Escala de valoración** used by all Likert items: 1–5 (Totalmente en desacuerdo →
  Totalmente de acuerdo) plus **N/A** ("No aplica / No tengo información").
- **1. Caracterización**: Universidad (closed list: Caldas, Manizales, Católica de Manizales,
  Autónoma de Manizales, + "Otra"), programa técnico profesional, municipio, institución educativa.
- **2–6. Likert blocks** (items numbered continuously across sections, 1–27): Pertinencia del
  programa, Experiencia de aprendizaje, Articulación media–superior, Acompañamiento y bienestar,
  Motivación y permanencia.
- **7. Valoración global**: one 5-level choice (Muy bajo → Muy alto) + 5 open-text questions.
- **8. Pregunta clave**: multi-select, **máximo tres** (with "Ninguna" and "Otra") of factors
  affecting permanence.
- **9. Pregunta de proyección**: single choice about plans after finishing (with "Otra").

Quirks in the source doc to confirm with the user before building: item numbering jumps
(Likert goes to 27, then open questions are unnumbered, then the key questions are numbered
34 and 35), and item 22 appears to be missing from section 5's text. Wording of items and
the purpose/instruction paragraphs is official copy — do not paraphrase.

## Repository context

This directory is a subfolder of the monorepo `alianzaeducacionrural/forminscripcion`
(repo root is one level up, at `Formularios/`). Each instrument lives in its own sibling
subfolder with its own backend + frontend, all deployed to one GitHub Pages site under
different slugs. **`.github/workflows/deploy.yml` exists only at the repo root** — it has one
`PROJECT_DIR_n` / `SITE_SLUG_n` pair, install step and build step per project (with its own
`VITE_API_URL_*` secret), plus a `cp` into `site/<slug>/` and a `paths:` trigger. Adding this
project means adding all of those there, not inside this folder.

Sibling pattern to follow (see `../Pretest - Postest/` and `../Taller de capacitación Manizales - CEPE/`
for worked examples with `README.md`, `PRODUCT.md`, `DESIGN.md`; `../Comité académico 25-09-2026/`
is the most recent, with matrices and an admin view with charts):

```
<this folder>/
├── PRODUCT.md   # settle with the user before UI work (impeccable skill)
├── backend/     # Google Apps Script bound to a Sheet, pushed with clasp (Code.js, appsscript.json)
└── frontend/    # Vite + React 19, deployed to GitHub Pages
```

Conventions shared by the siblings (reuse unless told otherwise):
- **Frontend**: Vite + React 19, plain CSS with design tokens, oxlint. Scripts: `npm run dev` /
  `build` / `preview` / `lint`. `base` in `vite.config.js` must equal the workflow's `SITE_SLUG`.
- **Backend**: Apps Script bound to a Google Sheet (no `SPREADSHEET_ID`), `clasp push`. No auth —
  protection is only an unlisted link. `VITE_API_URL` (Web App URL) is a GitHub Actions secret
  at build time and a gitignored `frontend/.env` locally.
- Closed catalogs (universities, etc.) are duplicated in `frontend/src/data/catalogos.js` and the
  backend validation constants — change both, then `clasp push`.
- Backend test-data cleanup helpers are destructive once real submissions exist; prefer the
  agent-scoped variant (see recent history of the Comité académico backend).

## Working with this project

- All end-user UI text is Spanish (Colombia). Respondents are young students, so keep copy and
  the mobile Likert layout simple.
- Before writing frontend code, establish `PRODUCT.md`/`DESIGN.md` with the user via the
  `impeccable` skill, as the siblings did.
- Mirror a sibling's `package.json` scripts rather than inventing new tooling.
