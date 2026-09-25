import { useMemo, useState } from 'react';
import FilasVista from './FilasVista.jsx';
import { MATRIZ_1, MATRIZ_2 } from '../data/catalogos.js';
import { filasParaCSV, formatearFecha } from './calculos.js';
import { descargarCSV } from './csv.js';

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

function Seccion({ config, titulo, envios, mostrarInstitucion, nombreArchivo }) {
  return (
    <section className={`detalle-seccion detalle-seccion--${config.tema}`}>
      <div className="bloque-cabecera">
        <h3 className="detalle-seccion-titulo">{titulo}</h3>
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
        <p className="vacio">Todavía no hay envíos de esta matriz.</p>
      ) : (
        <div className="envios">
          {envios.map((envio) => (
            <Envio key={envio.idEnvio} config={config} envio={envio} mostrarInstitucion={mostrarInstitucion} />
          ))}
        </div>
      )}
    </section>
  );
}

const TITULO_1 = 'Matriz 1 · Internacionalización';
const TITULO_2 = 'Matriz 2 · Fortalecimiento de la implementación del modelo';

/** Detalle de una institución: las dos matrices con los envíos vigentes de cada persona. */
export function DetalleIES({ resumen }) {
  return (
    <div className="institucion-detalle entra">
      <h2>{resumen.institucion}</h2>
      <Seccion config={MATRIZ_1} titulo={TITULO_1} envios={resumen.m1} nombreArchivo={`matriz1-${resumen.institucion}.csv`} />
      <Seccion config={MATRIZ_2} titulo={TITULO_2} envios={resumen.m2} nombreArchivo={`matriz2-${resumen.institucion}.csv`} />
    </div>
  );
}

/** Consolidado de todas las instituciones, con filtro. */
export function DetalleGlobal({ resumenes }) {
  const [filtro, setFiltro] = useState('');

  const { envios1, envios2 } = useMemo(() => {
    const visibles = filtro ? resumenes.filter((r) => r.clave === filtro) : resumenes;
    return { envios1: visibles.flatMap((r) => r.m1), envios2: visibles.flatMap((r) => r.m2) };
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
      <Seccion config={MATRIZ_1} titulo={TITULO_1} envios={envios1} mostrarInstitucion nombreArchivo={`matriz1-${sufijo}.csv`} />
      <Seccion config={MATRIZ_2} titulo={TITULO_2} envios={envios2} mostrarInstitucion nombreArchivo={`matriz2-${sufijo}.csv`} />
    </div>
  );
}
