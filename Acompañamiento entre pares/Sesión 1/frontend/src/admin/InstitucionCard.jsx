import { formatearFechaCorta } from './calculos.js';

function LineaHerramienta({ clase, nombre, envios }) {
  const hay = envios.length > 0;
  const rectores = new Set(envios.map((e) => e.nombre)).size;
  const reciente = hay ? envios[0].fecha : null;

  return (
    <div className={`linea linea--${clase} ${hay ? '' : 'linea--pendiente'}`}>
      <span className="linea-nombre">{nombre}</span>
      {hay ? (
        <span className="linea-dato">
          {rectores} {rectores === 1 ? 'rector' : 'rectores'}
          <span className="linea-sub">{formatearFechaCorta(reciente)}</span>
        </span>
      ) : (
        <span className="linea-dato">Pendiente</span>
      )}
    </div>
  );
}

/**
 * Tarjeta de una institución en la grilla. Las dos herramientas se ven de un
 * vistazo, cada una en su color.
 */
export default function InstitucionCard({ resumen, indice, onAbrir }) {
  const { institucion, exp, nue } = resumen;
  const rectores = [...new Set([...exp, ...nue].map((e) => e.nombre))];

  return (
    <button
      type="button"
      className="ies-card"
      style={{ '--i': indice }}
      onClick={onAbrir}
      aria-label={`Ver detalle de ${institucion}`}
    >
      <div className="ies-card-cabecera">
        <span className="ies-card-nombre">{institucion}</span>
      </div>
      <LineaHerramienta clase="exp" nombre="Experimentados" envios={exp} />
      <LineaHerramienta clase="nue" nombre="Nuevos" envios={nue} />
      <span className="ies-card-personas">{rectores.join(' · ')}</span>
    </button>
  );
}
