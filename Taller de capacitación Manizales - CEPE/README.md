# Inscripción de docentes — Capacitación en Metodologías Activas

Formulario para que los rectores de las 13 instituciones educativas rurales de Manizales
inscriban a los docentes que participarán en la **Capacitación en Metodologías Activas**
(objetivo: fortalecer habilidades en metodologías activas y el mejoramiento de aprendizajes
de los estudiantes, en procura de las trayectorias educativas completas). Incluye un panel
de coordinación en un enlace no listado para ver cobertura, volumen por institución y por
área, y descargar todo en CSV.

## Repositorio

Vive en [`alianzaeducacionrural/forminscripcion`](https://github.com/alianzaeducacionrural/forminscripcion),
dentro de esta subcarpeta (el repo es un monorepo: cada formulario de inscripción tiene su
propia subcarpeta, con su propio workflow de deploy publicando a su propio slug bajo el
mismo sitio de Pages).

## Estructura

```
forminscripcion/                                # raíz del repo
├── .github/workflows/deploy.yml                # build + deploy de ESTE formulario
└── Taller de capacitación Manizales - CEPE/     # esta carpeta
    ├── PRODUCT.md          # verdad de producto (impeccable)
    ├── Logos/               # logos originales entregados por el usuario
    ├── backend/              # Google Apps Script, gestionado con clasp
    │   ├── Code.js
    │   └── appsscript.json
    └── frontend/              # Vite + React 19, publicado en GitHub Pages
        └── src/
            ├── formulario/    # formulario público ("/")
            └── admin/         # panel de coordinación ("/admin", enlace no listado)
```

> El workflow de deploy vive en la raíz del repo (`.github/workflows/` solo se reconoce ahí),
> no dentro de esta subcarpeta — GitHub Actions no lee workflows anidados.

## Backend (Google Apps Script vía clasp)

El script está **bound** a su propia Google Sheet, así que no necesita `SPREADSHEET_ID` en
Script Properties.

- Carpeta en Drive: https://drive.google.com/drive/folders/1MG7Tb2BU8OK5DkK_ynvzXKJwwXkPF628
  ("Taller de capacitación metodologías activas", dentro de "Formularios de inscripción")
- Sheet: https://drive.google.com/open?id=1FFtziQ0Ybusgph5cRGZ55082IoGdb0ILEvVk2w3dndU
- Editor de Apps Script: https://script.google.com/d/1iGeyjxheRxYJlYmyq4cgPoTXL8z7SrBXg8ed2LXp8RlMiOIG3Jzc8UQv/edit
- Web App (deployment `v1`): `https://script.google.com/macros/s/AKfycbzXxLAGmXFaVmMXOQSQeemF52g27yl2L9xxfdk3Bd_ards1Ys4vKiLpZIb_3MeuZorl/exec`

> Nota: `clasp create-script --type sheets --parentId ...` ignoró el `--parentId` (limitación
> conocida de clasp para este tipo) y la Sheet se creó en la raíz de "Mi unidad". Se movió
> manualmente a la carpeta correcta — mover en Drive no cambia el ID del archivo, así que el
> binding del script no se vio afectado.

### Ciclo de trabajo

```bash
cd backend
clasp push                                   # sube Code.js + appsscript.json
clasp update-deployment <deploymentId>       # actualiza el deploy sin cambiar la URL
```

### ⚠️ Pendiente antes de compartir el enlace del formulario

`setup()` ya se corrió manualmente desde el editor (`clasp run` no funcionó en remoto — la
API de Apps Script no está habilitada por defecto para el proyecto de GCP asociado) y los
tabs `Instituciones` (13 filas) y `Docentes` existen. El formulario ya se probó de punta a
punta contra este backend real.

Antes de compartir el enlace con los rectores, correr `limpiarRegistrosDePrueba()` desde el
editor para vaciar los registros de prueba (`San Peregrino` y `La Violeta`, ambos con
nombre `PRUEBA — Nombre de Prueba`).

Si se prefiere que `clasp run` funcione en el futuro: habilitar la Apps Script API en
https://script.google.com/home/usersettings y asociar el script a un proyecto de GCP
estándar (no el de Apps Script por defecto) desde **Configuración del proyecto** en el
editor.

## Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

`VITE_API_URL` (en `frontend/.env`, gitignored) ya apunta al Web App desplegado arriba.

### Antes del primer deploy a GitHub Pages

1. En **Settings → Pages** del repo `forminscripcion`, fuente = GitHub Actions.
2. En **Settings → Secrets and variables → Actions**, crear el secret `VITE_API_URL` con la
   misma URL del Web App.
3. Hacer push a `main`: el workflow en `.github/workflows/deploy.yml` construye y publica en
   `https://alianzaeducacionrural.github.io/forminscripcion/metodologias-activas-manizales/`.

El `base` de `frontend/vite.config.js` (`/forminscripcion/metodologias-activas-manizales/`)
y el `SITE_SLUG` del workflow deben coincidir siempre.

## Catálogos

Instituciones y áreas son listas cerradas, duplicadas intencionalmente en
`frontend/src/data/catalogos.js` y `backend/Code.js` (`INSTITUCIONES_SEED` /
`AREAS_VALIDAS`). Si cambian, se actualizan en los dos lugares y se vuelve a correr
`clasp push`.

Un docente puede pertenecer a **una o más** áreas — no es una lista de opción única.

## Diseño

Dirección visual documentada en `PRODUCT.md` (compromisos de marca y restricciones) y en
`DESIGN.md` (una vez generado por el cierre del flujo de impeccable).
