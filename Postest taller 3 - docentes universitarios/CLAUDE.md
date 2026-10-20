# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Built (not yet deployed). Source instrument: `PRUEBA DE SALIDA FORMACIÓN DOCENTES UNIVERSITARIOS.docx`
("Seguimiento a la pertinencia, apropiación y aplicación de los aprendizajes"; docentes universitarios,
talleres Escuela Nueva / Atención a la diversidad / Empresarismo). Official copy, do not paraphrase.

- `frontend/`: Vite + React 19 wizard (`src/App.jsx`; instrument in `src/data/encuesta.js`; catalogs in
  `src/data/catalogos.js`, copied from `../Percepción pertinencia del programa`). Admin panel at `/admin/`
  (`src/admin/`). Commands: `npm run dev|build|lint`. Draft in localStorage; `idEnvio` makes submits idempotent.
- `backend/Code.js`: Apps Script bound to a Sheet, sheet `Respuestas` self-created. Keys: p01–p05 (agreement
  scale), a01–a03 (appropriation levels 1–5/N/A); multi-selects stored joined with "; ". Option lists and
  catalogs are duplicated from the frontend files: after changing either, re-sync both and `clasp push`.
  The block between `PROGRAMAS_POR_UNIVERSIDAD` and `APOYOS` was generated from the frontend data; there is no
  generator in the repo.
- Deploy: root workflow slot 7, slug `postest-taller-3-docentes-universitarios`, secret
  `VITE_API_URL_POSTEST_TALLER3_DOCENTES`. Still needed: create the bound Sheet in the Drive folder
  `1DdFw9Sx6UgZEbEuqAJ9O04XplMcH8vuv`, `clasp push`/deploy as Web App, set the secret and local `frontend/.env`.
- The form asks for `nombre` (user-requested; the .docx has none), stored as column 3 of `Respuestas`.

The .docx files are real Word files: parse `word/document.xml` as UTF-8, not as plain text.

## Repository context

Subfolder of the monorepo `alianzaeducacionrural/forminscripcion` (repo root is one level up, `Formularios/`).
Each instrument is a sibling subfolder with its own `backend/` (Google Apps Script bound to a Sheet, pushed
with `clasp`) and `frontend/` (Vite + React 19, plain CSS tokens, oxlint; `npm run dev|build|preview|lint`),
all deployed to one GitHub Pages site under different slugs. **`.github/workflows/deploy.yml` exists only at the
repo root**: it has one `PROJECT_DIR_n` / `SITE_SLUG_n` pair, an install step, a build step (with its own
`VITE_API_URL_*` secret), a `cp` into `site/<slug>/` and a `paths:` trigger per project. This project is slot 7. `base` in `vite.config.js` must equal the `SITE_SLUG`.

Best model to copy: `../Pretest - Postest Educación Media/` (pre/post pair) and
`../Percepción pertinencia del programa/` (has a detailed `CLAUDE.md`, admin panel at `/admin/`, catalogs
duplicated in frontend `src/data/catalogos.js` and backend validation, `idEnvio` idempotent submits).
A related earlier workshop form is `../Taller de capacitación Manizales - CEPE/`.

Shared conventions: no auth (unlisted link only); `VITE_API_URL` is a GitHub Actions secret and a gitignored
`frontend/.env` locally; all end-user UI text is Spanish (Colombia); settle `PRODUCT.md`/`DESIGN.md` with the user
(impeccable skill) before UI work, as the siblings did.
