# Acompañamiento entre Pares — Sesión 1 (rectores)

Dos formularios digitales para la estrategia de **acompañamiento entre pares** entre rectores
de instituciones educativas rurales de Manizales, más un panel de coordinación:

| Enlace | Qué es |
|---|---|
| `…/acompanamiento-pares-sesion-1/` | Landing: elegir la herramienta según el rol |
| `…/experimentados/` | **"Mi capital de experiencia"** — rectores experimentados: fortaleza + evidencia + posibilidad de transferencia, con semáforo de valoración |
| `…/nuevos/` | **"Mi mapa de necesidades para acompañar la trayectoria"** — rectores nuevos |
| `…/admin/` | Panel de coordinación (enlace no listado, sin login, `noindex`) |

Base: `https://alianzaeducacionrural.github.io/forminscripcion/acompanamiento-pares-sesion-1/`

## Cómo funciona

- Cada herramienta tiene **4 filas fijas** (Administrativo, Curricular, Capacitación,
  Comunitario) que corresponden a los componentes de la gestión escolar de las hojas
  originales en papel del Comité de Cafeteros de Caldas — no se agregan ni se quitan filas.
- **"Mi capital de experiencia"** agrega, por cada componente, un semáforo de valoración de 3
  niveles (verde "lo domino", amarillo "lo estoy fortaleciendo", azul "quiero aprender"),
  transcrito literalmente de la hoja original.
- **Quién diligencia:** el nombre es texto libre; la institución es un `<select>` con **lista
  cerrada** de las 13 instituciones educativas rurales de Manizales que acompaña el programa
  (mismo catálogo que los formularios hermanos). Validado también en el backend (no distingue
  tildes ni mayúsculas). Lista en `frontend/src/data/catalogos.js`
  (`INSTITUCIONES_MANIZALES`) y en `backend/Code.js` (`INSTITUCIONES_SEED`); si la red de
  instituciones cambia, se actualiza en los dos lugares y se vuelve a correr `clasp push` +
  `clasp deploy -i <deploymentId>`.
- **Todos los campos de cada componente son obligatorios**, validado en el frontend y en el
  backend.
- **Reenvíos:** una persona puede volver a enviar para corregir. Los envíos anteriores quedan
  en la Sheet como historial; el panel muestra como vigente el más reciente de cada pareja
  institución + nombre. Tras enviar, el botón "Enviar una versión corregida" reabre el
  formulario.
- **Borrador:** lo escrito se guarda en el navegador (localStorage) hasta que se envía.
- **Panel:** resumen (instituciones registradas, rectores experimentados/nuevos), tarjeta por
  institución (solo aparecen las que ya enviaron algo) con el estado de cada herramienta,
  semáforo de valoración por componente (consolidado de todos los rectores experimentados),
  detalle de cada institución y consolidado de todas, descarga de CSV por herramienta.
- Diseño: papel cálido + tinta, bordes gruesos y sombras duras, Bricolage Grotesque + Figtree
  (mismo lenguaje visual de los formularios hermanos). "Mi capital de experiencia" en ámbar
  (oficio, trayectoria); "Mi mapa de necesidades" en turquesa (arranque). El semáforo de
  valoración (verde/amarillo/azul) es fijo y no cambia con el tema de la página.
- Logos de CEPE (Colombia Evidencia Potencial en Educación), Comité de Cafeteros de Caldas y
  Alcaldía de Manizales en una franja de membrete propia (mismo lockup que
  "Taller de capacitación Manizales - CEPE"), en el formulario y en el panel.

## Estructura

```
Acompañamiento entre pares/Sesión 1/
├── backend/    # Google Apps Script (clasp) ligado a una Google Sheet
│   └── Code.js
└── frontend/   # Vite + React 19, publicado en GitHub Pages
    ├── experimentados/ nuevos/ admin/ index.html   # una página HTML por enlace
    └── src/  data/ herramienta/ admin/ components/
```

> El workflow de deploy vive en la raíz del repo (`.github/workflows/deploy.yml`) — GitHub
> Actions no lee workflows anidados. Ya se actualizó para incluir este formulario.

Sheet: tabs `Instituciones`, `Experimentados` (una fila por componente) y `Nuevos` (una fila
por componente). Cada envío comparte `id_envio`, `timestamp`, `institucion` y `nombre`. Si
cambian los encabezados y el tab aún no tiene datos, el backend los reescribe solo.

## Backend (ya creado)

El script está **bound** a su propia Google Sheet, así que no necesita `SPREADSHEET_ID` en
Script Properties.

- Sheet: https://drive.google.com/open?id=1-TuUqCWAXXmYVDT-Rr8nLsIIFzLqJtUe_Q8TfJ3W92o
- Editor de Apps Script: https://script.google.com/d/159f3XDe4BMr3LuIBOps3l2yP79Wda0154rGcnPPBsCiWuygjrcIY8_gc/edit
- Web App (deployment `v1`): `https://script.google.com/macros/s/AKfycbzuQVbgXjIvIjAsXK9vxWAZQ4wELeqcm3LNja-cpgTNQmrsNHlkWR2ibzavt1tyUaVViA/exec`

```bash
cd backend
clasp push                                   # sube Code.js + appsscript.json
clasp deploy -i AKfycbzuQVbgXjIvIjAsXK9vxWAZQ4wELeqcm3LNja-cpgTNQmrsNHlkWR2ibzavt1tyUaVViA --description "vX"   # actualiza la Web App EN VIVO
```

`clasp push` solo no actualiza la Web App publicada: hay que redesplegar el deployment
existente.

### ⚠️ Pendiente antes de compartir los enlaces (acción manual, una sola vez)

`clasp run setup` falla igual que en los proyectos hermanos (la API de Apps Script no está
habilitada por defecto para el proyecto de GCP asociado, y Google exige de todas formas una
pantalla de autorización en vivo la primera vez que el script corre). Probar el Web App ahora
mismo devuelve "Necesitas acceso" porque los tabs todavía no existen y nadie ha autorizado el
script como el usuario que lo despliega.

1. Abrir el editor de Apps Script (enlace arriba), elegir la función `setup` en el desplegable
   y presionar **Ejecutar**; autorizar (Configuración avanzada → Ir a … → Permitir). Esto crea
   los tabs `Instituciones`, `Experimentados` y `Nuevos`, siembra las 13 IE, y — al correr una
   función una vez como el usuario que hizo el deploy — habilita que el Web App funcione para
   visitantes anónimos.
2. Verificar que `.../exec?action=listInstituciones` responde JSON con las 13 IE (no la
   pantalla "Necesitas acceso").
3. Probar el flujo completo (los dos formularios y el panel) contra el backend real.
4. Antes de compartir los enlaces con los rectores, correr `limpiarRegistrosDePrueba()` desde
   el editor para vaciar cualquier registro de prueba.

## Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

`VITE_API_URL` (en `frontend/.env`, gitignored) ya apunta al Web App desplegado arriba.

### Deploy a GitHub Pages

Ya está todo listo: el secret `VITE_API_URL_ACOMPANAMIENTO_PARES` está configurado en el repo,
y `.github/workflows/deploy.yml` ya incluye este formulario (`SITE_SLUG_4`,
`acompanamiento-pares-sesion-1`). El primer push a `main` que toque
`Acompañamiento entre pares/Sesión 1/frontend/**` lo publica en
`https://alianzaeducacionrural.github.io/forminscripcion/acompanamiento-pares-sesion-1/`.

El `base` de `frontend/vite.config.js` y `SITE_SLUG_4` del workflow deben coincidir siempre.

## Verificación hecha

- `npm install`, `npm run build` y `npm run lint` sin errores (2 advertencias de estilo
  conocidas — impureza de `Date` en la pantalla de éxito y `setState` dentro de un efecto en
  el panel —, el mismo patrón que en los proyectos hermanos).
- Google Sheet y Apps Script creados con `clasp`, código empujado (`clasp push`) y Web App
  desplegado (`clasp create-deployment`).
- **No verificado aún:** la Web App real respondiendo, ni el flujo de punta a punta contra el
  backend — pendiente de correr `setup()` manualmente (ver arriba).
