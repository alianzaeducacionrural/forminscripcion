import { INSTITUCIONES, MATRIZ_1, MATRIZ_2 } from '../data/catalogos.js';

/**
 * Cada envío es un conjunto de filas con el mismo `id_envio`. Una IES puede
 * reenviar para corregir; el vigente es el de `timestamp` más reciente.
 * Devuelve Map<institucion, { idEnvio, fecha, filas, totalEnvios }>.
 */
export function envioVigentePorIES(filas) {
  const porIES = new Map();
  filas.forEach((fila) => {
    if (!porIES.has(fila.institucion)) porIES.set(fila.institucion, new Map());
    const envios = porIES.get(fila.institucion);
    if (!envios.has(fila.id_envio)) envios.set(fila.id_envio, []);
    envios.get(fila.id_envio).push(fila);
  });

  const vigentes = new Map();
  porIES.forEach((envios, institucion) => {
    let elegido = null;
    envios.forEach((filasEnvio, idEnvio) => {
      const fecha = filasEnvio[0].timestamp;
      if (!elegido || fecha > elegido.fecha) elegido = { idEnvio, fecha, filas: filasEnvio };
    });
    vigentes.set(institucion, {
      ...elegido,
      filas: [...elegido.filas].sort((a, b) => a.orden - b.orden),
      totalEnvios: envios.size,
    });
  });
  return vigentes;
}

/** Una entrada por IES del catálogo, con su envío vigente de cada matriz. */
export function resumenPorIES(matriz1, matriz2) {
  const v1 = envioVigentePorIES(matriz1);
  const v2 = envioVigentePorIES(matriz2);

  return INSTITUCIONES.map((institucion) => {
    const m1 = v1.get(institucion) || null;
    const m2 = v2.get(institucion) || null;
    const estado = m1 && m2 ? 'completo' : m1 || m2 ? 'parcial' : 'sin-datos';
    return { institucion, m1, m2, estado };
  });
}

export function calcularTotales(resumenes) {
  const conM1 = resumenes.filter((r) => r.m1);
  const conM2 = resumenes.filter((r) => r.m2);
  return {
    totalIES: resumenes.length,
    iesM1: conM1.length,
    iesM2: conM2.length,
    iesCompletas: resumenes.filter((r) => r.estado === 'completo').length,
    acciones: conM1.reduce((suma, r) => suma + r.m1.filas.length, 0),
    aspectos: conM2.reduce((suma, r) => suma + r.m2.filas.length, 0),
  };
}

/** Cuántas acciones vigentes hay por categoría orientadora (Matriz 1). */
export function distribucionCategorias(resumenes) {
  const conteo = new Map(MATRIZ_1.categorias.map((c) => [c, 0]));
  conteo.set('Otra', 0);
  let sinCategoria = 0;

  resumenes.forEach((r) => {
    (r.m1?.filas || []).forEach((fila) => {
      if (!fila.categoria) sinCategoria += 1;
      else conteo.set(fila.categoria, (conteo.get(fila.categoria) || 0) + 1);
    });
  });

  const lista = [...conteo.entries()].map(([categoria, total]) => ({ categoria, total }));
  if (sinCategoria > 0) lista.push({ categoria: 'Sin categoría', total: sinCategoria });
  return lista.sort((a, b) => b.total - a.total);
}

/** Filas vigentes de todas las IES para una matriz, con la IES y la fecha de cada envío. */
export function filasVigentes(resumenes, clave) {
  return resumenes.flatMap((r) =>
    (r[clave]?.filas || []).map((fila) => ({ ...fila, fechaEnvio: r[clave].fecha }))
  );
}

/** Filas listas para CSV: institución, fecha de envío y una columna por campo de la matriz. */
export function filasParaCSV(config, filas) {
  return filas.map((fila) => {
    const salida = { institucion: fila.institucion, fecha_envio: fila.fechaEnvio || fila.timestamp, orden: fila.orden };
    if (config === MATRIZ_2) salida.aspecto = fila.aspecto;
    if (config.categorias.length > 0) salida.categoria = fila.categoria || '';
    config.campos.forEach((c) => {
      salida[c.etiqueta] = fila[c.columna];
    });
    return salida;
  });
}

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
