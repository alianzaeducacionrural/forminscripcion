import { INSTITUCIONES, MAX_CARACTERES } from './data/catalogos.js';

let contador = 0;
function nuevoId() {
  contador += 1;
  return `f${Date.now().toString(36)}${contador}`;
}

/** Una fila de la matriz: una acción (Matriz 1) o un aspecto a fortalecer (Matriz 2). */
export function filaVacia(config, aspectoFijo = null) {
  const fila = { id: nuevoId(), fija: aspectoFijo !== null, aspecto: aspectoFijo || '' };
  if (config.categorias.length > 0) fila.categoria = '';
  config.campos.forEach((c) => {
    fila[c.clave] = '';
  });
  return fila;
}

export function estadoInicial(config) {
  const fijas = config.filasFijas.map((aspecto) => filaVacia(config, aspecto));
  return { institucion: '', filas: fijas.length > 0 ? fijas : [filaVacia(config)] };
}

/** Combina un borrador guardado con la configuración actual: garantiza que
 * estén todas las filas fijas y descarta cualquier campo que ya no exista. */
export function restaurarBorrador(config, borrador) {
  const base = estadoInicial(config);
  if (!borrador || !Array.isArray(borrador.filas)) return base;

  const guardadas = borrador.filas.filter((f) => f && typeof f === 'object');
  const filas = config.filasFijas.map((aspecto) => {
    const previa = guardadas.find((f) => f.fija && f.aspecto === aspecto);
    return previa ? { ...filaVacia(config, aspecto), ...previa } : filaVacia(config, aspecto);
  });
  guardadas
    .filter((f) => !f.fija)
    .forEach((f) => filas.push({ ...filaVacia(config), ...f }));

  return {
    institucion: INSTITUCIONES.includes(borrador.institucion) ? borrador.institucion : '',
    filas: filas.length > 0 ? filas : base.filas,
  };
}

function vacio(valor) {
  return !valor || !String(valor).trim();
}

/** errores = { institucion?, filas: { [idFila]: { [clave]: mensaje } } } */
export function validarMatriz(config, datos) {
  const errores = { filas: {} };

  if (!datos.institucion || !INSTITUCIONES.includes(datos.institucion)) {
    errores.institucion = 'Seleccione la institución de educación superior.';
  }

  const aspectosVistos = new Set(config.filasFijas.map((a) => a.trim().toLowerCase()));

  datos.filas.forEach((fila) => {
    const e = {};
    if (!fila.fija && config.filasFijas.length > 0) {
      if (vacio(fila.aspecto)) {
        e.aspecto = 'Escriba el aspecto a fortalecer.';
      } else {
        const clave = fila.aspecto.trim().toLowerCase();
        if (aspectosVistos.has(clave)) e.aspecto = 'Este aspecto ya está en la matriz.';
        aspectosVistos.add(clave);
      }
    }
    config.campos.forEach((c) => {
      if (vacio(fila[c.clave])) e[c.clave] = 'Este campo es obligatorio.';
      else if (String(fila[c.clave]).length > MAX_CARACTERES) e[c.clave] = `Máximo ${MAX_CARACTERES} caracteres.`;
    });
    if (Object.keys(e).length > 0) errores.filas[fila.id] = e;
  });

  return errores;
}

export function esValido(errores) {
  return !errores.institucion && Object.keys(errores.filas).length === 0;
}

/** Progreso: campos obligatorios con contenido / campos obligatorios totales. */
export function calcularProgreso(config, datos) {
  let total = 1;
  let listos = datos.institucion ? 1 : 0;
  datos.filas.forEach((fila) => {
    if (!fila.fija && config.filasFijas.length > 0) {
      total += 1;
      if (!vacio(fila.aspecto)) listos += 1;
    }
    config.campos.forEach((c) => {
      total += 1;
      if (!vacio(fila[c.clave])) listos += 1;
    });
  });
  return { listos, total };
}

/** Lo que viaja al backend: sin ids internos, con texto recortado. */
export function armarPayload(config, datos) {
  return {
    institucion: datos.institucion,
    filas: datos.filas.map((fila) => {
      const salida = {};
      if (config.filasFijas.length > 0) {
        salida.aspecto = String(fila.aspecto).trim();
        salida.personalizado = !fila.fija;
      }
      if (config.categorias.length > 0) salida.categoria = fila.categoria || '';
      config.campos.forEach((c) => {
        salida[c.clave] = String(fila[c.clave]).trim();
      });
      return salida;
    }),
  };
}
