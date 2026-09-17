import { INSTITUCIONES, PRETEST_P4_ELEMENTOS, POSTEST_Q3_ESTRATEGIAS, POSTEST_Q4_ELEMENTOS } from '../data/catalogos.js';

const PRETEST_ALINEACION_CAMPOS = ['p1_alineado', 'p2_alineado', 'p3_alineado'];
const POSTEST_ALINEACION_CAMPOS = ['q1_alineado', 'q2_alineado', 'q4_alineado'];

function clave(institucion, nombre) {
  return `${String(institucion || '').trim().toLowerCase()}|${String(nombre || '').trim().toLowerCase()}`;
}

function distribucionOpciones(filas, campo) {
  const conteo = { a: 0, b: 0, c: 0, d: 0 };
  filas.forEach((f) => {
    if (conteo[f[campo]] !== undefined) conteo[f[campo]]++;
  });
  return conteo;
}

function contarChecklist(filas, campo, catalogo) {
  const conteo = {};
  catalogo.forEach((op) => {
    conteo[op] = 0;
  });
  filas.forEach((f) => {
    (f[campo] || []).forEach((op) => {
      conteo[op] = (conteo[op] || 0) + 1;
    });
  });
  return conteo;
}

/** Promedio de % de respuestas alineadas con la práctica recomendada, sobre
 * todas las preguntas de opción marcadas como alineación en `campos`. */
function porcentajeAlineadoPromedio(filas, campos) {
  if (filas.length === 0) return null;
  let alineadas = 0;
  filas.forEach((f) => {
    campos.forEach((c) => {
      if (f[c] === true) alineadas++;
    });
  });
  return Math.round((alineadas / (filas.length * campos.length)) * 100);
}

export function calcularResumenPretest(pretest) {
  const porInstitucion = {};
  INSTITUCIONES.forEach((n) => {
    porInstitucion[n] = 0;
  });
  pretest.forEach((f) => {
    porInstitucion[f.institucion] = (porInstitucion[f.institucion] || 0) + 1;
  });

  return {
    total: pretest.length,
    porInstitucion,
    porcentajeAlineadoPromedio: porcentajeAlineadoPromedio(pretest, PRETEST_ALINEACION_CAMPOS),
    p1: { distribucion: distribucionOpciones(pretest, 'p1_opcion'), alineadoPct: porcentajeAlineadoPromedio(pretest, ['p1_alineado']) },
    p2: { distribucion: distribucionOpciones(pretest, 'p2_opcion'), alineadoPct: porcentajeAlineadoPromedio(pretest, ['p2_alineado']) },
    p3: { distribucion: distribucionOpciones(pretest, 'p3_opcion'), alineadoPct: porcentajeAlineadoPromedio(pretest, ['p3_alineado']) },
    p4: contarChecklist(pretest, 'p4_elementos', PRETEST_P4_ELEMENTOS),
  };
}

export function calcularResumenPostest(postest) {
  const porInstitucion = {};
  INSTITUCIONES.forEach((n) => {
    porInstitucion[n] = 0;
  });
  postest.forEach((f) => {
    porInstitucion[f.institucion] = (porInstitucion[f.institucion] || 0) + 1;
  });

  return {
    total: postest.length,
    porInstitucion,
    porcentajeAlineadoPromedio: porcentajeAlineadoPromedio(postest, POSTEST_ALINEACION_CAMPOS),
    q1: { distribucion: distribucionOpciones(postest, 'q1_opcion'), alineadoPct: porcentajeAlineadoPromedio(postest, ['q1_alineado']) },
    q2: { distribucion: distribucionOpciones(postest, 'q2_opcion'), alineadoPct: porcentajeAlineadoPromedio(postest, ['q2_alineado']) },
    q3: contarChecklist(postest, 'q3_estrategias', POSTEST_Q3_ESTRATEGIAS),
    q4: { conteo: contarChecklist(postest, 'q4_elementos', POSTEST_Q4_ELEMENTOS), alineadoPct: porcentajeAlineadoPromedio(postest, ['q4_alineado']) },
  };
}

/** Un docente puede aparecer en Pretest, en Postest, en ambos o en ninguno.
 * Coincide por institución + nombre (mismo criterio, sin tildes eliminadas,
 * que el bloqueo de duplicados del backend). */
export function calcularParticipacion(pretest, postest) {
  const clavesPre = new Set(pretest.map((f) => clave(f.institucion, f.nombre_docente)));
  const clavesPost = new Set(postest.map((f) => clave(f.institucion, f.nombre_docente)));

  let ambos = 0;
  clavesPre.forEach((k) => {
    if (clavesPost.has(k)) ambos++;
  });

  return {
    soloPretest: clavesPre.size - ambos,
    soloPostest: clavesPost.size - ambos,
    ambos,
    totalPretest: clavesPre.size,
    totalPostest: clavesPost.size,
  };
}

/** Comparación agregada (no pregunta-a-pregunta) del % de alineación
 * promedio, global y por institución. */
export function calcularEvolucion(pretest, postest) {
  const porInstitucion = INSTITUCIONES.map((institucion) => {
    const filasPre = pretest.filter((f) => f.institucion === institucion);
    const filasPost = postest.filter((f) => f.institucion === institucion);
    return {
      institucion,
      pre: porcentajeAlineadoPromedio(filasPre, PRETEST_ALINEACION_CAMPOS),
      post: porcentajeAlineadoPromedio(filasPost, POSTEST_ALINEACION_CAMPOS),
    };
  }).filter((fila) => fila.pre !== null || fila.post !== null);

  return {
    global: {
      pre: porcentajeAlineadoPromedio(pretest, PRETEST_ALINEACION_CAMPOS),
      post: porcentajeAlineadoPromedio(postest, POSTEST_ALINEACION_CAMPOS),
    },
    porInstitucion,
  };
}
