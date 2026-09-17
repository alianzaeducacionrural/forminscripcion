# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

This directory is **not yet built** — it contains only `PRETEST.docx`, the source content
for a pretest/postest questionnaire. There is no frontend, backend, or config here yet.

`PRETEST.docx` (a real .docx, read it by unzipping and parsing `word/document.xml`, not
with a plain-text reader) holds two instruments for a teacher-training workshop titled
**"Estrategias metodológicas activas y uso pedagógico de evidencias"** (iniciativa *La
Universidad en el Campo* / *Comunidades de Cambio*):

- **Pretest**: 4 single-choice questions, 1 multi-select checklist (with an "Otro" free-text
  option), 1 open-response block (competencia/estrategia/evidencia).
- **Postest**: a stated purpose paragraph, 2 single-choice questions, 1 multi-select
  checklist of named active-learning strategies (with "Otra" free-text), 1 more multi-select
  checklist, and an open-response "Aplicación a mi práctica" block.

Building the actual form (frontend + backend) means first deciding, with the user, whether
this is a single form with a pretest/postest mode toggle or two separate flows, and how
responses should be scored/aggregated — that isn't specified in the docx alone.

## Repository context

This directory is a subfolder of the monorepo `alianzaeducacionrural/forminscripcion`
(repo root is one level up, at `Formularios/`). Each form/instrument in the org lives in
its own sibling subfolder with its own backend + frontend, all deployed to the same GitHub
Pages site under different slugs. **`.github/workflows/` only exists at the repo root** —
GitHub Actions does not read nested workflow directories, so a new deploy workflow (or a
new job/step in the existing `deploy.yml`) must be added there, not inside this folder.

The established sibling pattern to follow (see `../Taller de capacitación Manizales - CEPE/`
for a full worked example, including its `README.md`, `PRODUCT.md`, and `DESIGN.md`):

```
<this folder>/
├── PRODUCT.md            # product truth (platform, users, constraints) — write this
│                           # with the user before designing UI, per the impeccable skill
├── backend/               # Google Apps Script, managed with clasp, bound to a Sheet
│   ├── Code.js
│   └── appsscript.json
└── frontend/              # Vite + React 19, deployed to GitHub Pages
    └── src/
```

Stack conventions used by every sibling form in this repo (reuse unless the user says
otherwise):
- **Frontend**: Vite + React 19, plain CSS with design tokens (no CSS framework), oxlint for
  linting, deployed static to GitHub Pages. Scripts: `npm run dev` / `build` / `preview`,
  `npm run lint` (oxlint).
- **Backend**: Google Apps Script bound to a Google Sheet, pushed with `clasp push`; no
  separate `SPREADSHEET_ID` needed because the script is bound. No authentication anywhere
  in these products — routes are protected only by being unlisted links.
- **Deploy**: GitHub Actions workflow at the repo root builds the Vite app and publishes it
  into `site/<SITE_SLUG>/` of the shared Pages site
  (`https://alianzaeducacionrural.github.io/forminscripcion/<slug>/`). The `base` in
  `vite.config.js` must match the workflow's `SITE_SLUG` exactly. `VITE_API_URL` (the Apps
  Script Web App URL) is a GitHub Actions secret at build time and a gitignored
  `frontend/.env` locally.
- Closed catalogs (institutions, areas, etc.) are intentionally duplicated between
  `frontend/src/data/catalogos.js` and the backend's validation constants — update both, then
  `clasp push`, when they change.

## Working with this project

- All end-user UI text is in Spanish (Colombia); official workshop/objective copy quoted
  from source documents must not be paraphrased.
- Before writing frontend code, use the `impeccable` skill to establish `PRODUCT.md` (and
  later `DESIGN.md`) the same way the CEPE sibling project did — platform, users, product
  purpose, and brand/content constraints should be settled before visual design.
- No test suite, linter config, or build tooling exists in this folder yet — once scaffolded,
  mirror the sibling project's `package.json` scripts rather than inventing new ones.
