import { AREAS_COLOR } from '../data/catalogos.js';
import MiniAlineacion from './MiniAlineacion.jsx';

const ESTADO_LABEL = {
  completo: 'Pre + Post',
  'solo-pre': 'Solo Pretest',
  'solo-post': 'Solo Postest',
  'sin-datos': 'Sin datos',
};

/**
 * Tarjeta de una institución en la grilla del panel. El estado (completo /
 * solo-pre / solo-post / sin-datos) cambia el peso visual de la tarjeta a
 * propósito — no son 14 tarjetas idénticas, la que no tiene datos se ve
 * claramente distinta (borde punteado, sin métricas) de la que sí tiene.
 */
export default function InstitucionCard({ resumen, onAbrir }) {
  const { institucion, totalPretest, totalPostest, estado, areas, alineadoPre, alineadoPost } = resumen;
  const sinDatos = estado === 'sin-datos';

  return (
    <button
      type="button"
      className={`institucion-card institucion-card--${estado}`}
      onClick={onAbrir}
      aria-label={`Ver detalle de ${institucion}`}
    >
      <div className="institucion-card-cabecera">
        <span className="institucion-card-nombre">{institucion}</span>
        <span className={`institucion-card-estado institucion-card-estado--${estado}`}>{ESTADO_LABEL[estado]}</span>
      </div>

      {sinDatos ? (
        <p className="institucion-card-vacio">Todavía no hay registros de esta institución.</p>
      ) : (
        <>
          <MiniAlineacion pre={alineadoPre} post={alineadoPost} />
          <div className="institucion-card-pie">
            <span className="institucion-card-conteo">
              {totalPretest} pretest · {totalPostest} postest
            </span>
            {areas.length > 0 && (
              <span className="institucion-card-areas">
                {areas.map((a) => (
                  <span key={a} className={`institucion-card-punto institucion-card-punto--${AREAS_COLOR[a] || 'indigo'}`} title={a} />
                ))}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  );
}
