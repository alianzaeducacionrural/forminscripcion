import { formatearFechaCorta } from './calculos.js';

const ESTADO_LABEL = {
  completo: '¡Completo!',
  parcial: 'Falta una matriz',
};

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

function LineaMatriz({ clase, nombre, unidad, envios }) {
  const hay = envios.length > 0;
  const filas = envios.reduce((suma, e) => suma + e.filas.length, 0);
  const reciente = hay ? envios[0].fecha : null;

  return (
    <div className={`linea linea--${clase} ${hay ? '' : 'linea--pendiente'}`}>
      <span className="linea-nombre">{nombre}</span>
      {hay ? (
        <span className="linea-dato">
          {plural(filas, unidad[0], unidad[1])}
          <span className="linea-sub">
            {plural(envios.length, 'persona', 'personas')} · {formatearFechaCorta(reciente)}
          </span>
        </span>
      ) : (
        <span className="linea-dato">Pendiente</span>
      )}
    </div>
  );
}

/**
 * Tarjeta de una institución en la grilla. Las dos matrices se ven de un
 * vistazo, cada una en su color.
 */
export default function IESCard({ resumen, indice, onAbrir }) {
  const { institucion, m1, m2, estado } = resumen;
  const personas = [...new Set([...m1, ...m2].map((e) => e.nombre))];

  return (
    <button
      type="button"
      className={`ies-card ies-card--${estado}`}
      style={{ '--i': indice }}
      onClick={onAbrir}
      aria-label={`Ver detalle de ${institucion}`}
    >
      <div className="ies-card-cabecera">
        <span className="ies-card-nombre">{institucion}</span>
        <span className={`ies-card-estado ies-card-estado--${estado}`}>{ESTADO_LABEL[estado]}</span>
      </div>
      <LineaMatriz clase="m1" nombre="Matriz 1" unidad={['acción', 'acciones']} envios={m1} />
      <LineaMatriz clase="m2" nombre="Matriz 2" unidad={['aspecto', 'aspectos']} envios={m2} />
      <span className="ies-card-personas">{personas.join(' · ')}</span>
    </button>
  );
}
