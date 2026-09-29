import { MAX_ACCIONES, MAX_CARACTERES, MAX_CORTO } from '../data/catalogos.js';

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let contador = 0;
function nuevoId() {
  contador += 1;
  return `a${Date.now().toString(36)}${contador}`;
}

/** Una acción de acompañamiento: reto, acción, responsable, fecha, evidencia. */
export function accionVacia(config) {
  const fila = { id: nuevoId() };
  config.campos.forEach((c) => {
    fila[c.clave] = '';
  });
  return fila;
}

export function estadoInicial(config) {
  return {
    institucionExperimentado: '',
    nombreExperimentado: '',
    correoExperimentado: '',
    institucionNuevo: '',
    nombreNuevo: '',
    correoNuevo: '',
    acciones: [accionVacia(config)],
    compromiso: '',
  };
}

/** Combina un borrador guardado con la configuración actual: garantiza al
 * menos 1 acción y descarta cualquier campo que ya no exista. */
export function restaurarBorrador(config, borrador) {
  const base = estadoInicial(config);
  if (!borrador || typeof borrador !== 'object') return base;

  const guardadas = Array.isArray(borrador.acciones) ? borrador.acciones.filter((f) => f && typeof f === 'object') : [];
  const acciones = guardadas.map((f) => ({ ...accionVacia(config), ...f }));

  return {
    institucionExperimentado: typeof borrador.institucionExperimentado === 'string' ? borrador.institucionExperimentado : '',
    nombreExperimentado: typeof borrador.nombreExperimentado === 'string' ? borrador.nombreExperimentado : '',
    correoExperimentado: typeof borrador.correoExperimentado === 'string' ? borrador.correoExperimentado : '',
    institucionNuevo: typeof borrador.institucionNuevo === 'string' ? borrador.institucionNuevo : '',
    nombreNuevo: typeof borrador.nombreNuevo === 'string' ? borrador.nombreNuevo : '',
    correoNuevo: typeof borrador.correoNuevo === 'string' ? borrador.correoNuevo : '',
    acciones: acciones.length > 0 ? acciones : base.acciones,
    compromiso: typeof borrador.compromiso === 'string' ? borrador.compromiso : '',
  };
}

/** Recorta y colapsa espacios internos (igual que el backend). */
export function limpiarTexto(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ');
}

function vacio(valor) {
  return !valor || !String(valor).trim();
}

/** errores = { institucionExperimentado?, nombreExperimentado?, correoExperimentado?,
 *              institucionNuevo?, nombreNuevo?, correoNuevo?, compromiso?,
 *              acciones: { [idAccion]: { [clave]: mensaje } } } */
export function validarPlan(config, datos) {
  const errores = { acciones: {} };

  ['Experimentado', 'Nuevo'].forEach((sufijo) => {
    const institucionK = `institucion${sufijo}`;
    const nombreK = `nombre${sufijo}`;
    const correoK = `correo${sufijo}`;

    if (vacio(datos[institucionK])) errores[institucionK] = 'Seleccione la institución.';

    if (vacio(datos[nombreK])) errores[nombreK] = 'Escriba el nombre.';
    else if (datos[nombreK].trim().length > MAX_CORTO) errores[nombreK] = `Máximo ${MAX_CORTO} caracteres.`;

    if (vacio(datos[correoK])) errores[correoK] = 'Escriba el correo.';
    else if (!CORREO_RE.test(datos[correoK].trim())) errores[correoK] = 'Escriba un correo válido.';
    else if (datos[correoK].trim().length > MAX_CORTO) errores[correoK] = `Máximo ${MAX_CORTO} caracteres.`;
  });

  if (vacio(datos.compromiso)) errores.compromiso = 'Escriba el compromiso de cierre.';
  else if (datos.compromiso.trim().length > MAX_CARACTERES) errores.compromiso = `Máximo ${MAX_CARACTERES} caracteres.`;

  datos.acciones.forEach((accion) => {
    const e = {};
    config.campos.forEach((c) => {
      if (vacio(accion[c.clave])) e[c.clave] = 'Este campo es obligatorio.';
      else if (String(accion[c.clave]).length > MAX_CARACTERES) e[c.clave] = `Máximo ${MAX_CARACTERES} caracteres.`;
    });
    if (Object.keys(e).length > 0) errores.acciones[accion.id] = e;
  });

  return errores;
}

export function esValido(errores) {
  const camposPlanos = ['institucionExperimentado', 'nombreExperimentado', 'correoExperimentado', 'institucionNuevo', 'nombreNuevo', 'correoNuevo', 'compromiso'];
  return camposPlanos.every((k) => !errores[k]) && Object.keys(errores.acciones).length === 0;
}

/** Progreso: campos obligatorios con contenido / campos obligatorios totales. */
export function calcularProgreso(config, datos) {
  const camposPlanos = ['institucionExperimentado', 'nombreExperimentado', 'correoExperimentado', 'institucionNuevo', 'nombreNuevo', 'correoNuevo', 'compromiso'];
  let total = camposPlanos.length;
  let listos = camposPlanos.filter((k) => !vacio(datos[k])).length;
  datos.acciones.forEach((accion) => {
    config.campos.forEach((c) => {
      total += 1;
      if (!vacio(accion[c.clave])) listos += 1;
    });
  });
  return { listos, total };
}

/** Identificador único de un intento de envío: el backend lo usa para no guardar dos veces lo mismo. */
export function nuevoIdEnvio() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Puede quitar una acción mientras quede al menos 1. */
export function puedeQuitarAccion(datos) {
  return datos.acciones.length > 1;
}

export function puedeAgregarAccion(datos) {
  return datos.acciones.length < MAX_ACCIONES;
}

/** Lo que viaja al backend: sin ids internos, con texto recortado. */
export function armarPayload(config, datos) {
  return {
    institucionExperimentado: limpiarTexto(datos.institucionExperimentado),
    nombreExperimentado: limpiarTexto(datos.nombreExperimentado),
    correoExperimentado: limpiarTexto(datos.correoExperimentado).toLowerCase(),
    institucionNuevo: limpiarTexto(datos.institucionNuevo),
    nombreNuevo: limpiarTexto(datos.nombreNuevo),
    correoNuevo: limpiarTexto(datos.correoNuevo).toLowerCase(),
    compromiso: limpiarTexto(datos.compromiso),
    acciones: datos.acciones.map((accion) => {
      const salida = {};
      config.campos.forEach((c) => {
        salida[c.clave] = String(accion[c.clave]).trim();
      });
      return salida;
    }),
  };
}
