import { useMemo, useState } from 'react';
import FilasVista from './FilasVista.jsx';
import { HERRAMIENTA_EXPERIMENTADOS, HERRAMIENTA_NUEVOS } from '../data/catalogos.js';
import { filasParaCSV, formatearFecha } from './calculos.js';
import { descargarCSV } from './csv.js';

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

/** Contenido de una herramienta: resumen, descarga en CSV y los envíos vigentes de cada rector. */
function PanelHerramienta({ config, envios, mostrarInstitucion, nombreArchivo }) {
  return (
    <div className={`detalle-seccion detalle-seccion--${config.tema}`}>
      <div className="bloque-cabecera">
        <p className="detalle-resumen">
          {envios.length === 0
            ? 'Todavía no hay envíos de esta herramienta.'
            : `${contarFilas(envios)} ${contarFilas(envios) === 1 ? 'componente' : 'componentes'} · ${envios.length} ${envios.length === 1 ? 'rector' : 'rectores'}`}
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
        <p className="vacio">Cuando alguien envíe esta herramienta, aparecerá aquí.</p>
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

const HERRAMIENTAS = [
  { id: 'exp', config: HERRAMIENTA_EXPERIMENTADOS, nombre: 'Con experiencia' },
  { id: 'nue', config: HERRAMIENTA_NUEVOS, nombre: 'Nuevos' },
];

/**
 * Dos botones (pestañas) para ver la información de cada herramienta. Abre
 * en la primera que tenga datos.
 */
function DetallePorHerramienta({ enviosPorHerramienta, mostrarInstitucion, sufijoArchivo }) {
  const [activa, setActiva] = useState(() =>
    enviosPorHerramienta.exp.length === 0 && enviosPorHerramienta.nue.length > 0 ? 'nue' : 'exp'
  );
  const actual = HERRAMIENTAS.find((h) => h.id === activa);

  function elegir(e, id) {
    setActiva(id);
    // El contenido cambia de largo: volver arriba para no quedar a mitad de la otra herramienta.
    e.currentTarget.closest('.modal-panel')?.scrollTo({ top: 0 });
  }

  return (
    <>
      <div className="pestanas" role="tablist" aria-label="Herramienta a consultar">
        {HERRAMIENTAS.map((h) => {
          const envios = enviosPorHerramienta[h.id];
          return (
            <button
              key={h.id}
              type="button"
              role="tab"
              id={`pestana-${h.id}`}
              aria-selected={activa === h.id}
              aria-controls="panel-herramienta"
              className={`pestana pestana--${h.config.tema} ${activa === h.id ? 'pestana--activa' : ''}`}
              onClick={(e) => elegir(e, h.id)}
            >
              <span className="pestana-titulo">{h.nombre}</span>
              <span className="pestana-conteo">{contarFilas(envios)}</span>
            </button>
          );
        })}
      </div>

      <div id="panel-herramienta" role="tabpanel" aria-labelledby={`pestana-${actual.id}`}>
        <PanelHerramienta
          key={actual.id}
          config={actual.config}
          envios={enviosPorHerramienta[actual.id]}
          mostrarInstitucion={mostrarInstitucion}
          nombreArchivo={`${actual.id}-${sufijoArchivo}.csv`}
        />
      </div>
    </>
  );
}

/** Detalle de una institución: pestañas con los envíos vigentes de cada rector en cada herramienta. */
export function DetalleInstitucion({ resumen }) {
  return (
    <div className="institucion-detalle entra">
      <h2>{resumen.institucion}</h2>
      <DetallePorHerramienta
        enviosPorHerramienta={{ exp: resumen.exp, nue: resumen.nue }}
        mostrarInstitucion={false}
        sufijoArchivo={resumen.institucion}
      />
    </div>
  );
}

/** Consolidado de todas las instituciones, con filtro. */
export function DetalleGlobal({ resumenes }) {
  const [filtro, setFiltro] = useState('');

  const enviosPorHerramienta = useMemo(() => {
    const visibles = filtro ? resumenes.filter((r) => r.clave === filtro) : resumenes;
    return { exp: visibles.flatMap((r) => r.exp), nue: visibles.flatMap((r) => r.nue) };
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
        <span className="detalle-filtro-nota">Se muestra el envío más reciente de cada rector.</span>
      </div>
      <DetallePorHerramienta enviosPorHerramienta={enviosPorHerramienta} mostrarInstitucion sufijoArchivo={sufijo} />
    </div>
  );
}
