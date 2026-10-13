# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Built (form + `/admin/` panel + backend). Concept "El Puente": an SVG bridge (`frontend/src/components/Puente.jsx`)
whose 14 planks (one per criterion) change shape/colour with the answer; see `PRODUCT.md` / `DESIGN.md`.

- `frontend/`: Vite + React 19, two entries (form `src/App.jsx`, admin `src/admin/Admin.jsx`). Official copy lives in
  `src/data/checklist.js`; the 12 Manizales IEs in `src/data/catalogos.js` (duplicated in `backend/Code.js`).
  Commands: `npm run dev|build|lint`. Draft in localStorage; `idEnvio` UUID makes submit idempotent. Evidence files
  upload immediately on pick (`subirEvidencia`, images downscaled client-side in `api.js`).
- `backend/`: Apps Script bound to the Sheet in Drive folder `1rSpalm4p7OrYgtYJFSV_zN9N6fs27AVf`
  (`clasp push -f`, `clasp create-deployment`). Sheets `Visitas` (one row/visit) and `Hallazgos`; self-created.
  Evidence goes to **private** Drive folders `Evidencias/<IE>/<fecha · id>` next to the Sheet. After the first
  `clasp push`, run `probarPermisos` once in the Apps Script editor to grant Drive access, then redeploy.
- Deploy: root workflow slot 6, slug `protocolo-articulacion-manizales`, secret `VITE_API_URL_PROTOCOLO_ARTICULACION`.
- Decisions: visitor (acompañante) fills it in; duplicated "Gestión de acuerdos" row kept once (14 criteria).
  Admin has no date-range filter (IE filter + "solo vencidas" on compromisos only).

## The instrument

**"Lista de chequeo de uso y apropiación institucional – Comunidad de Cambio"** (*La Universidad en el Campo*).
It is a checklist filled in by a **visitor/acompañante during a visit to an Institución Educativa (IE)**, not a
student or teacher self-survey. Structure:

- **Matrix, 15 rows**: `Componente` + `Criterio verificable en la IE`, answered with one of
  **SÍ / PARCIAL / NO / NO APLICA**, plus a free-text `Evidencia verificable` (the doc gives example evidence per
  row, e.g. "PEI / actas / plan institucional"; treat these as hints/placeholder text, not answers).
  Components: Articulación institucional, Liderazgo, Escuela Nueva, Guías de interaprendizaje, Gobierno estudiantil,
  Currículo–contexto, PPP, Seguimiento a estudiantes, Permanencia, Familia, Articulación con universidad,
  Gestión de acuerdos, Comunidad de Cambio, Mejoramiento.
- **Hallazgos table**: `Hallazgo` / `Acción de mejora acordada` / `Responsable y fecha` (repeatable rows).
- **Nivel de apropiación** (single choice, final valuation of the IE): Consolidado, En desarrollo, Inicial,
  No evidenciado — each with a definition sentence that is part of the official copy.

Quirks in the source doc to confirm with the user before building: the **"Gestión de acuerdos" row appears twice**
with identical text (likely a copy/paste duplicate), and the doc has no header fields (IE, municipio, date,
visitor) — the siblings capture those, so ask what identification fields are wanted. Wording of criteria and
levels is official copy — do not paraphrase.

## Repository context

This directory is a subfolder of the monorepo `alianzaeducacionrural/forminscripcion`
(repo root is one level up, at `Formularios/`). Each instrument lives in its own sibling subfolder with its own
backend + frontend, all deployed to one GitHub Pages site under different slugs. **`.github/workflows/deploy.yml`
exists only at the repo root** — it has one `PROJECT_DIR_n` / `SITE_SLUG_n` pair, install step and build step per
project (with its own `VITE_API_URL_*` secret), plus a `cp` into `site/<slug>/` and a `paths:` trigger; slots 1–5
are taken, so this would be slot 6. Adding this project means editing all of those there, not inside this folder.

Pattern to follow (worked examples: `../Percepción pertinencia del programa/` — its `CLAUDE.md` documents the
conventions in detail — and `../Comité académico 25-09-2026/`, which has matrices and an admin view with charts):

```
<this folder>/
├── PRODUCT.md   # settle with the user before UI work (impeccable skill)
├── backend/     # Google Apps Script bound to a Sheet, pushed with clasp (Code.js, appsscript.json)
└── frontend/    # Vite + React 19, deployed to GitHub Pages
```

Shared conventions (reuse unless told otherwise):
- **Frontend**: Vite + React 19, plain CSS with design tokens, oxlint. Scripts: `npm run dev` / `build` /
  `preview` / `lint`. `base` in `vite.config.js` must equal the workflow's `SITE_SLUG`. Admin panel as a second Vite
  entry at `/admin/`, unlisted link, no auth.
- **Backend**: Apps Script bound to a Google Sheet (no `SPREADSHEET_ID`), `clasp push`; the script self-creates its
  sheet on first request and validates against catalogs duplicated from the frontend (change both). `VITE_API_URL`
  (Web App URL) is a GitHub Actions secret at build time and a gitignored `frontend/.env` locally.
- Submits are idempotent via a client-generated `idEnvio` UUID; drafts live in localStorage.
- Backend test-data cleanup helpers are destructive once real submissions exist; prefer an agent/scope-limited variant.

## Working with this project

- All end-user UI text is Spanish (Colombia).
- Before writing frontend code, establish `PRODUCT.md`/`DESIGN.md` with the user via the `impeccable` skill, as the
  siblings did.
- Mirror a sibling's `package.json` scripts rather than inventing new tooling.
