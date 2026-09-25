# Comité Académico 25-09-2026 — Matrices de trabajo

Dos formularios para que cada institución de educación superior (IES) de *La Universidad en
el Campo* diligencie las matrices del Comité Académico, más un panel de coordinación:

| Enlace | Qué es |
|---|---|
| `…/comite-academico-matrices/` | Landing con las dos matrices (opcional) |
| `…/matriz-1/` | **Matriz 1. Internacionalización** — propuestas de las IES. Filas dinámicas (una por acción), 7 columnas + categoría orientadora opcional |
| `…/matriz-2/` | **Matriz 2. Fortalecimiento de la implementación del modelo por los docentes universitarios** — 3 aspectos fijos + los que la IES quiera agregar, 6 columnas cada uno |
| `…/admin/` | Panel de coordinación (enlace no listado, sin login, `noindex`) |

Base: `https://alianzaeducacionrural.github.io/forminscripcion/comite-academico-matrices/`

## Cómo funciona

- **IES (catálogo cerrado, 5):** IES CINOC, Universidad Autónoma de Manizales, Universidad
  Católica de Manizales, Universidad de Caldas, Universidad de Manizales. Duplicado en
  `frontend/src/data/catalogos.js` y `backend/Code.js` (`INSTITUCIONES_SEED`): si cambia,
  se actualizan los dos y se hace `clasp push`.
- **Todos los campos de cada fila son obligatorios** (validado en el frontend y en el
  backend). La categoría orientadora de la Matriz 1 es lo único opcional.
- **Reenvíos:** una IES puede volver a enviar para corregir. Los envíos anteriores quedan
  en la Sheet como historial; el panel muestra como vigente el más reciente de cada IES.
  Tras enviar, el botón "Enviar una versión corregida" reabre el formulario con los datos.
- **Borrador:** lo escrito se guarda en el navegador (localStorage) hasta que se envía.
- **Panel:** resumen (IES con cada matriz, acciones y aspectos registrados), tarjeta por
  IES con el estado de cada matriz, distribución de acciones por categoría, detalle de cada
  IES, consolidado de todas y descarga de CSV por matriz.
- Textos oficiales (preguntas orientadoras, categorías, encabezados de columna, producto,
  aspectos) transcritos de los documentos del Comité, en `catalogos.js`.
- Colores: Matriz 1 índigo, Matriz 2 verde — iguales en formulario, tarjetas y detalle.

## Estructura

```
Comité académico 25-09-2026/
├── backend/    # Google Apps Script (clasp) ligado a una Google Sheet
│   └── Code.js
└── frontend/   # Vite + React 19, publicado en GitHub Pages
    ├── matriz-1/ matriz-2/ admin/ index.html   # una página HTML por enlace
    └── src/  data/ matriz/ admin/ components/
```

Sheet: tabs `Instituciones`, `Matriz1` (una fila por acción) y `Matriz2` (una fila por
aspecto). Cada envío comparte `id_envio` y `timestamp`.

## Backend (ya creado)

- Carpeta de bases de datos en Drive: https://drive.google.com/drive/folders/1TftmXVoZ_5v0wR0kmT4JCnpJhLfDXX76
- Sheet: https://docs.google.com/spreadsheets/d/1Lpv2jF1yCjxrsXxEFXck9A8WbG2in4d178gRuyXdifo/edit
- Editor de Apps Script: https://script.google.com/d/1tHQRGBxxPwPH1O2PFIrg4MmbH6FDDeqE_YodiIPq1YDO-WTNmECloKf-/edit
- Web App (deployment `v1`): `https://script.google.com/macros/s/AKfycbxAj3w-tpOh82YA07PEmNbrK0cVx3MlTp4Fxszk04_Z0GIVDdwZYgHmPiTPtwnS-jZZ/exec`

```bash
cd backend
clasp push
clasp deploy -i AKfycbxAj3w-tpOh82YA07PEmNbrK0cVx3MlTp4Fxszk04_Z0GIVDdwZYgHmPiTPtwnS-jZZ --description "vX"   # actualiza la Web App EN VIVO
```

`clasp push` solo no actualiza la Web App publicada: hay que redesplegar el deployment existente.

### ⚠️ Pendiente (acción manual, una sola vez)

Google exige una pantalla de autorización en vivo, por lo que no se puede hacer desde la CLI
(`clasp run` falla igual que en los proyectos hermanos):

1. Abrir el editor de Apps Script, elegir la función `setup` y presionar **Ejecutar**;
   autorizar (Configuración avanzada → Ir a … → Permitir). Crea los tabs `Instituciones`,
   `Matriz1` y `Matriz2` y siembra las 5 IES.
2. Verificar que `…/exec?action=listInstituciones` responde JSON con las 5 IES.
3. Antes de compartir los enlaces, ejecutar `limpiarRegistrosDePrueba`.

## Frontend y deploy

`frontend/.env` (gitignored) ya apunta a la Web App. `npm install && npm run dev` para
trabajar local. El secret `VITE_API_URL_COMITE_ACADEMICO` está configurado en el repo, y cada
push a `main` que toque este frontend dispara `.github/workflows/deploy.yml`. El `base` de
`frontend/vite.config.js` y `SITE_SLUG_3` del workflow deben coincidir siempre.

## Verificación hecha

- `npm run build` y `npm run lint` sin errores (1 advertencia de estilo en el panel, igual
  que en los proyectos hermanos).
- `Code.js` ejecutado con las APIs de Apps Script simuladas: validaciones, escritura por
  lotes, reenvíos, protección contra fórmulas y lectura.
- Flujo completo en Chromium contra ese backend: formularios (móvil y escritorio),
  errores, borrador, reenvío, panel, detalle, consolidado y CSV.
- **No verificado aún:** la Web App real respondiendo, hasta que se ejecute `setup` (ver arriba).
