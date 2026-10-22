import { INSTITUCIONES } from './data/catalogos.js';

const CONECTORES_MINUSCULA = ['de', 'del', 'la', 'las', 'los', 'y'];

/** Espejo del normalizador del backend, para que el docente vea su nombre ya en
 * estilo Nombre Propio antes de enviar. El backend normaliza de nuevo de todas
 * formas — esto es solo para la experiencia, no la fuente de verdad. */
export function normalizarNombrePropio(nombre) {
  const limpio = String(nombre || '').trim().replace(/\s+/g, ' ');
  if (!limpio) return '';
  return limpio
    .toLowerCase()
    .split(' ')
    .map((palabra, i) => {
      if (i > 0 && CONECTORES_MINUSCULA.includes(palabra)) return palabra;
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
}

export function validarEncabezado({ institucion, nombreDocente, areas }) {
  const errores = {};

  if (!institucion || !INSTITUCIONES.includes(institucion)) {
    errores.institucion = 'Seleccione la institución educativa.';
  }

  if (!nombreDocente || !nombreDocente.trim()) {
    errores.nombreDocente = 'Escriba el nombre completo del docente.';
  }

  if (!areas || areas.length === 0) {
    errores.areas = 'Seleccione al menos un área que orienta.';
  }

  return errores;
}

function validarChecklist(seleccion, { sentinelOtro, textoOtro } = {}) {
  const errores = {};
  if (!seleccion || seleccion.length === 0) {
    errores.seleccion = 'Marque al menos una opción.';
  } else if (sentinelOtro && seleccion.includes(sentinelOtro) && (!textoOtro || !textoOtro.trim())) {
    errores.otro = `Especifique el texto de "${sentinelOtro}".`;
  }
  return errores;
}

export function validarPretest(datos) {
  const errores = validarEncabezado(datos);

  if (!datos.p1) errores.p1 = 'Seleccione una opción.';
  if (!datos.p2) errores.p2 = 'Seleccione una opción.';
  if (!datos.p3) errores.p3 = 'Seleccione una opción.';

  const p4 = validarChecklist(datos.p4Elementos, { sentinelOtro: 'Otro', textoOtro: datos.p4Otro });
  if (p4.seleccion) errores.p4Elementos = p4.seleccion;
  if (p4.otro) errores.p4Otro = p4.otro;

  return errores;
}

export function validarPostest(datos) {
  const errores = validarEncabezado(datos);

  if (!datos.q1) errores.q1 = 'Seleccione una opción.';
  if (!datos.q2) errores.q2 = 'Seleccione una opción.';

  const q3 = validarChecklist(datos.q3Estrategias, { sentinelOtro: 'Otra', textoOtro: datos.q3Otra });
  if (q3.seleccion) errores.q3Estrategias = q3.seleccion;
  if (q3.otro) errores.q3Otra = q3.otro;

  const q4 = validarChecklist(datos.q4Elementos);
  if (q4.seleccion) errores.q4Elementos = q4.seleccion;

  return errores;
}

export function formularioEsValido(errores) {
  return Object.keys(errores).length === 0;
}
