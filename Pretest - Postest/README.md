# Pretest / Postest — Estrategias Metodológicas Activas

Dos formularios (Pretest antes del taller, Postest después) para que los docentes de 14
instituciones educativas rurales de Manizales cuenten qué saben y qué aprendieron sobre
**Estrategias metodológicas activas y uso pedagógico de evidencias** (iniciativa *La
Universidad en el Campo* / *Comunidades de Cambio*). No es calificativo: solo recopila
información. Incluye un panel de coordinación en un enlace no listado con resultados de
Pretest y Postest por separado, y una comparación agregada de la evolución entre ambos.

## Repositorio

Vive en [`alianzaeducacionrural/forminscripcion`](https://github.com/alianzaeducacionrural/forminscripcion),
dentro de esta subcarpeta (el repo es un monorepo: cada formulario tiene su propia
subcarpeta, con su propio Apps Script y publicado bajo su propio slug en el mismo sitio
de Pages). El workflow de deploy compartido vive en la raíz del repo
(`.github/workflows/deploy.yml`) — GitHub Actions no lee workflows anidados.

## Estructura

```
Pretest - Postest/
├── PRODUCT.md / DESIGN.md   # verdad de producto y sistema visual (impeccable)
├── PRETEST.docx             # contenido original de ambos instrumentos
├── backend/                 # Google Apps Script, gestionado con clasp
│   └── Code.js
└── frontend/                # Vite + React 19, publicado en GitHub Pages
    └── src/
        ├── pretest/         # formulario público ("/pretest")
        ├── postest/         # formulario público ("/postest")
        └── admin/           # panel de coordinación ("/admin", enlace no listado)
```

## Backend (Google Apps Script vía clasp)

El script está **bound** a su propia Google Sheet, así que no necesita `SPREADSHEET_ID`
en Script Properties.

- Carpeta en Drive: https://drive.google.com/drive/folders/1RiEvGdF0JWYg2uJjHDIyBzjeZpT36Khd
- Sheet: https://drive.google.com/open?id=1XIc8QCU6B25xWeRUIrs__Cl3I20ETmrsG6C2xuLIL8c
- Editor de Apps Script: https://script.google.com/d/1C57488Qa3O9oQ_bZyViEN7BmBtl6n6nCswwaLI1aU0JkbbE8IQ0VDSNM/edit
- Web App (deployment `v1`): `https://script.google.com/macros/s/AKfycbyabJuxiVTjKdvX2_QpdwCMgtMbH7uMnutmuAUfY_2zMBLqLLmkM6cROZmiXdM6xGtW/exec`

### Ciclo de trabajo

```bash
cd backend
clasp push                                   # sube Code.js + appsscript.json
clasp deploy --description "vX"              # nueva versión de deployment
```

### ⚠️ Pendiente antes de compartir los enlaces (acción manual, una sola vez)

Igual que en el proyecto hermano, esto **no se puede hacer desde la CLI** — requiere
abrir el editor en el navegador porque Google pide una pantalla de autorización en vivo:

1. Abrir el [editor de Apps Script](https://script.google.com/d/1C57488Qa3O9oQ_bZyViEN7BmBtl6n6nCswwaLI1aU0JkbbE8IQ0VDSNM/edit),
   seleccionar la función `setup` en el desplegable de funciones y presionar **Ejecutar**.
   La primera vez pedirá autorizar el script (pantalla "Google no verificó esta app" →
   Configuración avanzada → Ir a Pretest-Postest... → Permitir). Esto crea los tabs
   `Instituciones`, `Pretest` y `Postest` con encabezados y siembra las 14 instituciones.
2. En **Implementar → Administrar implementaciones**, confirmar que la implementación
   web app apunta a la versión más reciente del código (o crear una nueva implementación
   si `v1` quedó desactualizada) — esto también dispara la pantalla de autorización si no
   se ha hecho antes.
3. Verificar que la URL `/exec` responde JSON (no una página de login de Google) antes de
   dar por buena la conexión: `curl "<url>/exec?action=listInstituciones"`.
4. Antes de compartir los enlaces reales, ejecutar `limpiarRegistrosDePrueba` desde el
   mismo editor para vaciar cualquier registro de prueba.

`clasp run setup` no funcionó en remoto (misma limitación documentada en el proyecto
hermano: la API de Apps Script no está habilitada por defecto para el proyecto de GCP
asociado). Si se quiere que funcione en el futuro: habilitar la Apps Script API en
https://script.google.com/home/usersettings y asociar el script a un proyecto de GCP
estándar desde **Configuración del proyecto** en el editor.

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

1. En **Settings → Secrets and variables → Actions** del repo `forminscripcion`, crear el
   secret `VITE_API_URL_PRETEST_POSTEST` con la misma URL del Web App de este proyecto
   (nombre distinto del `VITE_API_URL` que ya usa el proyecto CEPE — son dos Apps Script
   separados).
2. Hacer push a `main`: el workflow en `.github/workflows/deploy.yml` construye y publica
   en `https://alianzaeducacionrural.github.io/forminscripcion/pretest-postest-metodologias-activas/`.

El `base` de `frontend/vite.config.js` y el `SITE_SLUG_2` del workflow deben coincidir
siempre.

## Enlaces (independientes, sin router compartido)

App multi-página de Vite (sin react-router): cada enlace es un HTML propio con su propio
punto de entrada, no una ruta de cliente detrás de un `#` compartido. Cargar directamente
cualquiera de estos enlaces funciona igual que cargarlo desde la landing — ninguno
depende de los otros ni de un estado de navegación:

- `https://alianzaeducacionrural.github.io/forminscripcion/pretest-postest-metodologias-activas/`
  — landing con elección Pretest / Postest (opcional, solo de cortesía).
- `.../pretest/` — formulario público del Pretest. **Este es el enlace para compartir antes del taller.**
- `.../postest/` — formulario público del Postest, con recuperación de datos del docente
  desde su registro de Pretest (por institución, con salida manual). **Enlace para
  compartir después del taller.**
- `.../admin/` — panel de coordinación. Enlace no listado (sin login, `noindex`), solo
  para el coordinador.

## Catálogos

Instituciones (14) y áreas (5) son listas cerradas, duplicadas intencionalmente en
`frontend/src/data/catalogos.js` y `backend/Code.js` (`INSTITUCIONES_SEED` /
`AREAS_VALIDAS`). Si cambian, se actualizan en los dos lugares y se vuelve a correr
`clasp push`. Un docente puede orientar **una o más** áreas.

## Alineación pedagógica (no calificativa)

El backend calcula internamente, al momento de guardar cada envío, si la respuesta de
opción elegida coincide con la práctica pedagógica recomendada (`PRETEST_ANSWER_KEY` /
`POSTEST_ANSWER_KEY` en `Code.js`). Esta clave **vive solo en el backend** y el resultado
(`TRUE`/`FALSE`) solo se usa en el panel de administración — nunca se muestra ni se
etiqueta como correcto/incorrecto al docente. Ver `PRODUCT.md` para el detalle de este
compromiso de producto.

## Diseño

Dirección visual heredada tal cual del proyecto hermano "Taller de capacitación Manizales
- CEPE" (misma organización, misma audiencia) — documentado en `DESIGN.md`, junto con las
piezas nuevas de este proyecto (radio-cards de opción única, modal de recuperación de
docente, panel de evolución con Recharts).
