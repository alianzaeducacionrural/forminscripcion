import { MATRIZ_1, MATRIZ_2, valoracionPorValor } from '../data/catalogos.js';

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
 * Cada envío es un conjunto de filas con el mismo `id_envio`. Institución y
 * nombre son texto libre, así que una persona (institución + nombre) puede
 * reenviar para corregir: su envío vigente es el de `timestamp` más reciente.
 * Devuelve una lista de envíos vigentes { idEnvio, fecha, institucion, nombre, filas, totalEnvios }.
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
 * los envíos vigentes de cada matriz. Solo aparecen las instituciones que ya
 * enviaron algo: no hay lista cerrada de la que "faltar".
 */
export function resumenPorInstitucion(matriz1, matriz2) {
  const grupos = new Map();
  const agregar = (envios, matriz) => {
    envios.forEach((envio) => {
      const clave = normalizar(envio.institucion);
      if (!grupos.has(clave)) {
        grupos.set(clave, { clave, institucion: envio.institucion, m1: [], m2: [] });
      }
      grupos.get(clave)[matriz].push(envio);
    });
  };
  agregar(enviosVigentes(matriz1), 'm1');
  agregar(enviosVigentes(matriz2), 'm2');

  return [...grupos.values()]
    .map((g) => ({ ...g, estado: g.m1.length && g.m2.length ? 'completo' : 'parcial' }))
    .sort((a, b) => a.institucion.localeCompare(b.institucion, 'es'));
}

const contarFilas = (envios) => envios.reduce((suma, e) => suma + e.filas.length, 0);

export function calcularTotales(resumenes) {
  return {
    instituciones: resumenes.length,
    iesM1: resumenes.filter((r) => r.m1.length > 0).length,
    iesM2: resumenes.filter((r) => r.m2.length > 0).length,
    completas: resumenes.filter((r) => r.estado === 'completo').length,
    acciones: resumenes.reduce((suma, r) => suma + contarFilas(r.m1), 0),
    aspectos: resumenes.reduce((suma, r) => suma + contarFilas(r.m2), 0),
  };
}

/** Cuántas acciones vigentes hay por categoría orientadora (Matriz 1). */
export function distribucionCategorias(resumenes) {
  const conteo = new Map(MATRIZ_1.categorias.map((c) => [c, 0]));
  conteo.set('Otra', 0);
  const otras = new Set(); // lo que escribieron bajo "Otra"
  let sinCategoria = 0;

  resumenes.forEach((r) => {
    r.m1.forEach((envio) =>
      envio.filas.forEach((fila) => {
        if (!fila.categoria) sinCategoria += 1;
        else conteo.set(fila.categoria, (conteo.get(fila.categoria) || 0) + 1);
        if (fila.categoria === 'Otra' && fila.categoria_otra) otras.add(String(fila.categoria_otra).trim());
      })
    );
  });

  const lista = [...conteo.entries()].map(([categoria, total]) => ({
    categoria,
    total,
    detalle: categoria === 'Otra' ? [...otras] : [],
  }));
  if (sinCategoria > 0) lista.push({ categoria: 'Sin categoría', total: sinCategoria, detalle: [] });
  return lista.sort((a, b) => b.total - a.total);
}

/**
 * Cómo valoraron los docentes cada estrategia de la Matriz 2 (Matriz 2), una entrada
 * por estrategia con el conteo por nivel de la escala. Los 5 aspectos fijos siempre
 * aparecen, en su orden, aunque todavía no tengan valoraciones; los aspectos que una
 * IES haya agregado por su cuenta aparecen después, alfabéticamente.
 */
export function distribucionPorEstrategia(resumenes) {
  const mapa = new Map();
  const vacio = () => ({ domino: 0, fortaleciendo: 0, inicial: 0 });
  MATRIZ_2.filasFijas.forEach((aspecto) => mapa.set(aspecto, { aspecto, conteo: vacio(), total: 0 }));

  resumenes.forEach((r) => {
    r.m2.forEach((envio) =>
      envio.filas.forEach((fila) => {
        const aspecto = fila.aspecto;
        if (!aspecto) return;
        if (!mapa.has(aspecto)) mapa.set(aspecto, { aspecto, conteo: vacio(), total: 0 });
        const entrada = mapa.get(aspecto);
        if (fila.valoracion && entrada.conteo[fila.valoracion] !== undefined) {
          entrada.conteo[fila.valoracion] += 1;
          entrada.total += 1;
        }
      })
    );
  });

  const fijos = MATRIZ_2.filasFijas;
  return [...mapa.values()].sort((a, b) => {
    const ia = fijos.indexOf(a.aspecto);
    const ib = fijos.indexOf(b.aspecto);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? fijos.length : ia) - (ib === -1 ? fijos.length : ib);
    return a.aspecto.localeCompare(b.aspecto, 'es');
  });
}

/** Filas para CSV: institución, quién diligenció, fecha del envío y una columna por campo de la matriz. */
export function filasParaCSV(config, envios) {
  return envios.flatMap((envio) =>
    envio.filas.map((fila) => {
      const salida = {
        institucion: envio.institucion,
        nombre: envio.nombre,
        fecha_envio: envio.fecha,
        orden: fila.orden,
      };
      if (config === MATRIZ_2) salida.aspecto = fila.aspecto;
      if (config.categorias.length > 0) {
        salida.categoria = fila.categoria || '';
        salida.categoria_otra = fila.categoria === 'Otra' ? fila.categoria_otra || '' : '';
      }
      config.campos.forEach((c) => {
        if (c.tipo === 'valoracion') {
          const op = valoracionPorValor(fila[c.columna]);
          salida[c.etiqueta] = op ? op.etiqueta : fila[c.columna] || '';
        } else {
          salida[c.etiqueta] = fila[c.columna];
        }
      });
      return salida;
    })
  );
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
