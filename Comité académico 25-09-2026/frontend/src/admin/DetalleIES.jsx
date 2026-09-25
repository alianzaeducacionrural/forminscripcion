import { useMemo, useState } from 'react';
import FilasVista from './FilasVista.jsx';
import { MATRIZ_1, MATRIZ_2 } from '../data/catalogos.js';
import { filasParaCSV, formatearFecha } from './calculos.js';
import { descargarCSV } from './csv.js';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const contarFilas = (envios) => envios.reduce((suma, e) => suma + e.filas.length, 0);

function Envio({ config, envio, mostrarInstitucion }) {
  return (
    <div className="envio">
      <div className="envio-cabecera">
        <span className="envio-nombre">{envio.nombre}</span>
        {mostrarInstitucion && <span className="envio-institucion">{envio.institucion}</span>}
        <span className="envio-fecha">
          {formatearFecha(envio.fecha)}
          {envio.totalEnvios > 1 ? ` · ${envio.totalEnvios} envíos (vigente: el más reciente)` : ''}
        </span>
      </div>
      <FilasVista config={config} filas={envio.filas} />
    </div>
  );
}

/** Contenido de una matriz: resumen, descarga en CSV y los envíos vigentes de cada persona. */
function PanelMatriz({ config, unidad, envios, mostrarInstitucion, nombreArchivo }) {
  return (
    <div className={`detalle-seccion detalle-seccion--${config.tema}`}>
      <div className="bloque-cabecera">
        <p className="detalle-resumen">
          {envios.length === 0
            ? 'Todavía no hay envíos de esta matriz.'
            : `${plural(contarFilas(envios), unidad[0], unidad[1])} · ${plural(envios.length, 'persona', 'personas')}`}
        </p>
        {envios.length > 0 && (
          <button
            type="button"
            className="boton boton--chico"
            onClick={() => descargarCSV(nombreArchivo, filasParaCSV(config, envios))}
          >
            Descargar CSV
          </button>
        )}
      </div>
      {envios.length === 0 ? (
        <p className="vacio">Cuando alguien envíe esta matriz, aparecerá aquí.</p>
      ) : (
        <div className="envios">
          {envios.map((envio) => (
            <Envio key={envio.idEnvio} config={config} envio={envio} mostrarInstitucion={mostrarInstitucion} />
          ))}
        </div>
      )}
    </div>
  );
}

const MATRICES = [
  { id: 'm1', config: MATRIZ_1, nombre: 'Internacionalización', unidad: ['acción', 'acciones'] },
  { id: 'm2', config: MATRIZ_2, nombre: 'Fortalecimiento del modelo', unidad: ['aspecto', 'aspectos'] },
];

/**
 * Dos botones (pestañas) para ver la información de la Matriz 1 o de la Matriz 2.
 * Abre en la primera que tenga datos.
 */
function DetallePorMatriz({ enviosPorMatriz, mostrarInstitucion, sufijoArchivo }) {
  const [activa, setActiva] = useState(() => (enviosPorMatriz.m1.length === 0 && enviosPorMatriz.m2.length > 0 ? 'm2' : 'm1'));
  const actual = MATRICES.find((m) => m.id === activa);

  function elegir(e, id) {
    setActiva(id);
    // El contenido cambia de largo: volver arriba para no quedar a mitad de la otra matriz.
    e.currentTarget.closest('.modal-panel')?.scrollTo({ top: 0 });
  }

  return (
    <>
      <div className="pestanas" role="tablist" aria-label="Matriz a consultar">
        {MATRICES.map((m) => {
          const envios = enviosPorMatriz[m.id];
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              id={`pestana-${m.id}`}
              aria-selected={activa === m.id}
              aria-controls="panel-matriz"
              className={`pestana pestana--${m.config.tema} ${activa === m.id ? 'pestana--activa' : ''}`}
              onClick={(e) => elegir(e, m.id)}
            >
              <span className="pestana-titulo">
                Matriz {m.config.numero} · {m.nombre}
              </span>
              <span className="pestana-conteo">{contarFilas(envios)}</span>
            </button>
          );
        })}
      </div>

      <div id="panel-matriz" role="tabpanel" aria-labelledby={`pestana-${actual.id}`}>
        <PanelMatriz
          key={actual.id}
          config={actual.config}
          unidad={actual.unidad}
          envios={enviosPorMatriz[actual.id]}
          mostrarInstitucion={mostrarInstitucion}
          nombreArchivo={`${actual.id === 'm1' ? 'matriz1' : 'matriz2'}-${sufijoArchivo}.csv`}
        />
      </div>
    </>
  );
}

/** Detalle de una institución: pestañas con los envíos vigentes de cada persona en cada matriz. */
export function DetalleIES({ resumen }) {
  return (
    <div className="institucion-detalle entra">
      <h2>{resumen.institucion}</h2>
      <DetallePorMatriz
        enviosPorMatriz={{ m1: resumen.m1, m2: resumen.m2 }}
        mostrarInstitucion={false}
        sufijoArchivo={resumen.institucion}
      />
    </div>
  );
}

/** Consolidado de todas las instituciones, con filtro. */
export function DetalleGlobal({ resumenes }) {
  const [filtro, setFiltro] = useState('');

  const enviosPorMatriz = useMemo(() => {
    const visibles = filtro ? resumenes.filter((r) => r.clave === filtro) : resumenes;
    return { m1: visibles.flatMap((r) => r.m1), m2: visibles.flatMap((r) => r.m2) };
  }, [resumenes, filtro]);

  const sufijo = filtro ? resumenes.find((r) => r.clave === filtro)?.institucion : 'todas';

  return (
    <div className="institucion-detalle entra">
      <h2>Todas las instituciones</h2>
      <div className="detalle-filtro">
        <select
          className="campo-select filtro-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar por institución"
        >
          <option value="">Todas las instituciones</option>
          {resumenes.map((r) => (
            <option key={r.clave} value={r.clave}>
              {r.institucion}
            </option>
          ))}
        </select>
        <span className="detalle-filtro-nota">Se muestra el envío más reciente de cada persona.</span>
      </div>
      <DetallePorMatriz enviosPorMatriz={enviosPorMatriz} mostrarInstitucion sufijoArchivo={sufijo} />
    </div>
  );
}
