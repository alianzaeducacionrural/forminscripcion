import { useMemo, useState } from 'react';
import FilasVista from './FilasVista.jsx';
import { MATRIZ_1, MATRIZ_2, INSTITUCIONES } from '../data/catalogos.js';
import { filasParaCSV, filasVigentes, formatearFecha } from './calculos.js';
import { descargarCSV } from './csv.js';

function Seccion({ config, titulo, filas, envio, mostrarIES, nombreArchivo }) {
  return (
    <section className={`detalle-seccion detalle-seccion--${config.tema}`}>
      <div className="bloque-cabecera">
        <div>
          <h3 className="detalle-seccion-titulo">{titulo}</h3>
          {envio && <p className="detalle-seccion-fecha">Enviada el {formatearFecha(envio.fecha)}</p>}
        </div>
        {filas.length > 0 && (
          <button
            type="button"
            className="boton boton--secundario boton--chico"
            onClick={() => descargarCSV(nombreArchivo, filasParaCSV(config, filas))}
          >
            Descargar CSV
          </button>
        )}
      </div>
      {filas.length === 0 ? (
        <p className="tabla-vacia">Todavía no hay envíos de esta matriz.</p>
      ) : (
        <FilasVista config={config} filas={filas} mostrarIES={mostrarIES} />
      )}
    </section>
  );
}

const conFecha = (envio) => (envio ? envio.filas.map((f) => ({ ...f, fechaEnvio: envio.fecha })) : []);

/** Detalle de una IES: las dos matrices con su envío vigente. */
export function DetalleIES({ resumen }) {
  const { institucion, m1, m2 } = resumen;

  return (
    <div className="institucion-detalle entra">
      <h2>{institucion}</h2>
      <Seccion
        config={MATRIZ_1}
        titulo="Matriz 1 · Internacionalización"
        filas={conFecha(m1)}
        envio={m1}
        nombreArchivo={`matriz1-${institucion}.csv`}
      />
      <Seccion
        config={MATRIZ_2}
        titulo="Matriz 2 · Fortalecimiento de la implementación del modelo"
        filas={conFecha(m2)}
        envio={m2}
        nombreArchivo={`matriz2-${institucion}.csv`}
      />
    </div>
  );
}

/** Consolidado de todas las IES, con filtro por institución. */
export function DetalleGlobal({ resumenes }) {
  const [filtro, setFiltro] = useState('');

  const { filas1, filas2 } = useMemo(() => {
    const visibles = filtro ? resumenes.filter((r) => r.institucion === filtro) : resumenes;
    return { filas1: filasVigentes(visibles, 'm1'), filas2: filasVigentes(visibles, 'm2') };
  }, [resumenes, filtro]);

  const sufijo = filtro || 'todas-las-IES';

  return (
    <div className="institucion-detalle entra">
      <h2>Todas las IES</h2>
      <div className="detalle-filtro">
        <select
          className="filtro-select"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          aria-label="Filtrar por institución"
        >
          <option value="">Todas las instituciones</option>
          {INSTITUCIONES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="detalle-filtro-nota">Se muestra el envío más reciente de cada institución.</span>
      </div>
      <Seccion
        config={MATRIZ_1}
        titulo="Matriz 1 · Internacionalización"
        filas={filas1}
        mostrarIES
        nombreArchivo={`matriz1-${sufijo}.csv`}
      />
      <Seccion
        config={MATRIZ_2}
        titulo="Matriz 2 · Fortalecimiento de la implementación del modelo"
        filas={filas2}
        mostrarIES
        nombreArchivo={`matriz2-${sufijo}.csv`}
      />
    </div>
  );
}
