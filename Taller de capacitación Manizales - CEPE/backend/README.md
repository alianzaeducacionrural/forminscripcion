# Backend — Apps Script (clasp)

Script *bound* a su Google Sheet (creada dentro de la carpeta de Drive del proyecto). Ver
el README de la raíz para los enlaces al Sheet, al editor y al Web App desplegado, y para
el paso manual pendiente (`setup()`).

## Regenerar `.clasp.json` en otra máquina

`.clasp.json` no se versiona (contiene el `scriptId`, no es secreto pero no hace falta
compartirlo por git). Para clonar el proyecto en otra máquina con `clasp` ya autenticado:

```bash
cd backend
clasp clone-script 1iGeyjxheRxYJlYmyq4cgPoTXL8z7SrBXg8ed2LXp8RlMiOIG3Jzc8UQv --rootDir .
```

## Comandos frecuentes

```bash
clasp push                              # sube Code.js + appsscript.json
clasp status                            # qué se subiría en el próximo push
clasp list-deployments                  # ver deployments y sus IDs
clasp update-deployment <deploymentId>  # actualiza el deploy sin cambiar la URL pública
clasp open-script                       # abre el editor en el navegador
```

## Funciones administrativas (correr desde el editor de Apps Script)

- `setup()` — crea los tabs `Instituciones` (13 filas) y `Docentes`. Correr una sola vez.
- `limpiarRegistrosDePrueba()` — vacía `Docentes` dejando los encabezados. Correr antes de
  compartir el enlace del formulario con los rectores.
