import { COMPONENTES, MAX_CARACTERES, MAX_CORTO, VALORACIONES } from './data/catalogos.js';

const VALORACIONES_VALIDAS = VALORACIONES.map((v) => v.valor);

/** Una fila de la herramienta: siempre un componente fijo (no se agregan ni se quitan). */
function filaVacia(config, componente) {
  const fila = { componente };
  config.campos.forEach((c) => {
    fila[c.clave] = '';
  });
  if (config.conValoracion) fila.valoracion = '';
  return fila;
}

export function estadoInicial(config) {
  return { nombre: '', institucion: '', filas: COMPONENTES.map((c) => filaVacia(config, c)) };
}

/** Combina un borrador guardado con la configuración actual: garantiza los 4
 * componentes en orden y descarta cualquier campo que ya no exista. */
export function restaurarBorrador(config, borrador) {
  const base = estadoInicial(config);
  if (!borrador || !Array.isArray(borrador.filas)) return base;

  const guardadas = borrador.filas.filter((f) => f && typeof f === 'object');
  const filas = COMPONENTES.map((componente) => {
    const previa = guardadas.find((f) => f.componente === componente);
    return previa ? { ...filaVacia(config, componente), ...previa, componente } : filaVacia(config, componente);
  });

  return {
    nombre: typeof borrador.nombre === 'string' ? borrador.nombre : '',
    institucion: typeof borrador.institucion === 'string' ? borrador.institucion : '',
    filas,
  };
}

/** Recorta y colapsa espacios internos (igual que el backend): "  Sur   Sur " -> "Sur Sur". */
export function limpiarTexto(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ');
}

function vacio(valor) {
  return !valor || !String(valor).trim();
}

/** errores = { nombre?, institucion?, filas: { [componente]: { [clave]: mensaje } } } */
export function validarHerramienta(config, datos) {
  const errores = { filas: {} };

  if (vacio(datos.nombre)) errores.nombre = 'Escriba su nombre.';
  else if (datos.nombre.trim().length > MAX_CORTO) errores.nombre = `Máximo ${MAX_CORTO} caracteres.`;

  if (vacio(datos.institucion)) errores.institucion = 'Escriba el nombre de su institución.';
  else if (datos.institucion.trim().length > MAX_CORTO) errores.institucion = `Máximo ${MAX_CORTO} caracteres.`;

  datos.filas.forEach((fila) => {
    const e = {};
    config.campos.forEach((c) => {
      if (vacio(fila[c.clave])) e[c.clave] = 'Este campo es obligatorio.';
      else if (String(fila[c.clave]).length > MAX_CARACTERES) e[c.clave] = `Máximo ${MAX_CARACTERES} caracteres.`;
    });
    if (config.conValoracion && (!fila.valoracion || !VALORACIONES_VALIDAS.includes(fila.valoracion))) {
      e.valoracion = 'Elija una valoración.';
    }
    if (Object.keys(e).length > 0) errores.filas[fila.componente] = e;
  });

  return errores;
}

export function esValido(errores) {
  return !errores.nombre && !errores.institucion && Object.keys(errores.filas).length === 0;
}

/** Progreso: campos obligatorios con contenido / campos obligatorios totales. */
export function calcularProgreso(config, datos) {
  let total = 2;
  let listos = (vacio(datos.nombre) ? 0 : 1) + (vacio(datos.institucion) ? 0 : 1);
  datos.filas.forEach((fila) => {
    config.campos.forEach((c) => {
      total += 1;
      if (!vacio(fila[c.clave])) listos += 1;
    });
    if (config.conValoracion) {
      total += 1;
      if (fila.valoracion) listos += 1;
    }
  });
  return { listos, total };
}

/** Identificador único de un intento de envío: el backend lo usa para no guardar dos veces lo mismo. */
export function nuevoIdEnvio() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Lo que viaja al backend: sin ids internos, con texto recortado. */
export function armarPayload(config, datos) {
  return {
    nombre: limpiarTexto(datos.nombre),
    institucion: limpiarTexto(datos.institucion),
    filas: datos.filas.map((fila) => {
      const salida = { componente: fila.componente };
      config.campos.forEach((c) => {
        salida[c.clave] = String(fila[c.clave]).trim();
      });
      if (config.conValoracion) salida.valoracion = fila.valoracion;
      return salida;
    }),
  };
}
