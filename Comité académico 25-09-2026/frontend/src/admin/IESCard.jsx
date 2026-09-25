import { formatearFechaCorta } from './calculos.js';

const ESTADO_LABEL = {
  completo: 'Completo',
  parcial: 'Falta una matriz',
  'sin-datos': 'Sin envíos',
};

function LineaMatriz({ clase, nombre, unidad, envio }) {
  return (
    <div className={`ies-linea ies-linea--${clase} ${envio ? '' : 'ies-linea--pendiente'}`}>
      <span className="ies-linea-nombre">{nombre}</span>
      {envio ? (
        <span className="ies-linea-dato">
          {envio.filas.length} {envio.filas.length === 1 ? unidad[0] : unidad[1]} · {formatearFechaCorta(envio.fecha)}
        </span>
      ) : (
        <span className="ies-linea-dato">Pendiente</span>
      )}
    </div>
  );
}

/**
 * Tarjeta de una IES en la grilla. Las dos matrices se ven de un vistazo, cada
 * una en su color; una IES sin envíos se ve claramente distinta (borde punteado).
 */
export default function IESCard({ resumen, onAbrir }) {
  const { institucion, m1, m2, estado } = resumen;
  const reenvios = Math.max((m1?.totalEnvios || 1) - 1, 0) + Math.max((m2?.totalEnvios || 1) - 1, 0);

  return (
    <button
      type="button"
      className={`ies-card ies-card--${estado}`}
      onClick={onAbrir}
      aria-label={`Ver detalle de ${institucion}`}
    >
      <div className="ies-card-cabecera">
        <span className="ies-card-nombre">{institucion}</span>
        <span className={`ies-card-estado ies-card-estado--${estado}`}>{ESTADO_LABEL[estado]}</span>
      </div>
      <LineaMatriz clase="m1" nombre="Matriz 1" unidad={['acción', 'acciones']} envio={m1} />
      <LineaMatriz clase="m2" nombre="Matriz 2" unidad={['aspecto', 'aspectos']} envio={m2} />
      {reenvios > 0 && (
        <span className="ies-card-nota">
          {reenvios} {reenvios === 1 ? 'reenvío' : 'reenvíos'} · se muestra el más reciente
        </span>
      )}
    </button>
  );
}
