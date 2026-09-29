import { COMPONENTES, HERRAMIENTA_EXPERIMENTADOS, valoracionPorValor } from '../data/catalogos.js';

/** Clave de comparación: sin tildes, mayúsculas ni espacios de más. "Univ. de  Caldas" ≈ "univ. de caldas". */
export function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cada envío es un conjunto de 4 filas (una por componente) con el mismo
 * `id_envio`. Institución y nombre son texto libre, así que una persona
 * (institución + nombre) puede reenviar para corregir: su envío vigente es
 * el de `timestamp` más reciente. Devuelve una lista de envíos vigentes
 * { idEnvio, fecha, institucion, nombre, filas, totalEnvios }.
 */
export function enviosVigentes(filas) {
  const porPersona = new Map();
  filas.forEach((fila) => {
    const clave = `${normalizar(fila.institucion)}|${normalizar(fila.nombre)}`;
    if (!porPersona.has(clave)) porPersona.set(clave, new Map());
    const envios = porPersona.get(clave);
    if (!envios.has(fila.id_envio)) envios.set(fila.id_envio, []);
    envios.get(fila.id_envio).push(fila);
  });

  const vigentes = [];
  porPersona.forEach((envios) => {
    let elegido = null;
    envios.forEach((filasEnvio, idEnvio) => {
      const fecha = filasEnvio[0].timestamp;
      if (!elegido || fecha > elegido.fecha) elegido = { idEnvio, fecha, filas: filasEnvio };
    });
    vigentes.push({
      idEnvio: elegido.idEnvio,
      fecha: elegido.fecha,
      institucion: elegido.filas[0].institucion,
      nombre: elegido.filas[0].nombre,
      filas: [...elegido.filas].sort((a, b) => a.orden - b.orden),
      totalEnvios: envios.size,
    });
  });
  return vigentes.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

/**
 * Una entrada por institución (agrupadas sin distinguir tildes/mayúsculas) con
 * los envíos vigentes de cada herramienta. Solo aparecen las instituciones que
 * ya enviaron algo: no hay lista cerrada de la que "faltar".
 */
export function resumenPorInstitucion(experimentados, nuevos) {
  const grupos = new Map();
  const agregar = (envios, herramienta) => {
    envios.forEach((envio) => {
      const clave = normalizar(envio.institucion);
      if (!grupos.has(clave)) {
        grupos.set(clave, { clave, institucion: envio.institucion, exp: [], nue: [] });
      }
      grupos.get(clave)[herramienta].push(envio);
    });
  };
  agregar(enviosVigentes(experimentados), 'exp');
  agregar(enviosVigentes(nuevos), 'nue');

  return [...grupos.values()]
    .map((g) => ({ ...g, estado: g.exp.length || g.nue.length ? 'registrado' : 'pendiente' }))
    .sort((a, b) => a.institucion.localeCompare(b.institucion, 'es'));
}

const contarFilas = (envios) => envios.reduce((suma, e) => suma + e.filas.length, 0);
const contarRectores = (envios) => new Set(envios.map((e) => `${e.institucion}|${e.nombre}`)).size;

export function calcularTotales(resumenes) {
  return {
    instituciones: resumenes.length,
    rectoresExperimentados: resumenes.reduce((suma, r) => suma + contarRectores(r.exp), 0),
    rectoresNuevos: resumenes.reduce((suma, r) => suma + contarRectores(r.nue), 0),
    componentesExp: resumenes.reduce((suma, r) => suma + contarFilas(r.exp), 0),
    componentesNue: resumenes.reduce((suma, r) => suma + contarFilas(r.nue), 0),
  };
}

/**
 * Distribución del semáforo de valoración de "Mi capital de experiencia": una
 * fila por componente con cuántos rectores marcaron cada nivel (domina /
 * fortaleciendo / aprender). Sirve para ver de un vistazo en qué componente
 * hay más experiencia acumulada y en cuál hace falta acompañamiento.
 */
export function distribucionValoracion(resumenes) {
  const conteo = new Map(COMPONENTES.map((c) => [c, { domina: 0, fortaleciendo: 0, aprender: 0 }]));

  resumenes.forEach((r) => {
    r.exp.forEach((envio) =>
      envio.filas.forEach((fila) => {
        const bucket = conteo.get(fila.componente);
        if (bucket && fila.valoracion in bucket) bucket[fila.valoracion] += 1;
      })
    );
  });

  return COMPONENTES.map((componente) => {
    const c = conteo.get(componente);
    return { componente, ...c, total: c.domina + c.fortaleciendo + c.aprender };
  });
}

/** Filas para CSV: institución, quién diligenció, fecha del envío y una columna por campo de la herramienta. */
export function filasParaCSV(config, envios) {
  return envios.flatMap((envio) =>
    envio.filas.map((fila) => {
      const salida = {
        institucion: envio.institucion,
        nombre: envio.nombre,
        fecha_envio: envio.fecha,
        componente: fila.componente,
      };
      config.campos.forEach((c) => {
        salida[c.etiqueta] = fila[c.columna];
      });
      if (config.conValoracion) {
        const val = valoracionPorValor(fila.valoracion);
        salida.valoracion = val ? val.etiquetaCorta : fila.valoracion;
      }
      return salida;
    })
  );
}

export const ES_EXPERIMENTADOS = (config) => config === HERRAMIENTA_EXPERIMENTADOS;

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
const FORMATO_HORA = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });

export function formatearFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${FORMATO_FECHA.format(d)}, ${FORMATO_HORA.format(d)}`;
}

export function formatearFechaCorta(iso) {
  return iso ? FORMATO_FECHA.format(new Date(iso)) : '';
}
