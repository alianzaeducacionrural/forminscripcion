import MiniAlineacion from './MiniAlineacion.jsx';

/** Tarjeta fija al inicio de la grilla: abre el mismo detalle que una
 * institución, pero sobre el agregado completo — mismo mecanismo, un solo
 * componente de detalle para las 15 vistas posibles. */
export default function TarjetaGlobal({ totalPretest, totalPostest, alineadoPre, alineadoPost, onAbrir }) {
  return (
    <button type="button" className="institucion-card institucion-card--global" onClick={onAbrir} aria-label="Ver detalle de todas las instituciones">
      <div className="institucion-card-cabecera">
        <span className="institucion-card-nombre">Todas las instituciones</span>
        <span className="institucion-card-estado institucion-card-estado--global">Vista global</span>
      </div>
      <MiniAlineacion pre={alineadoPre} post={alineadoPost} />
      <div className="institucion-card-pie">
        <span className="institucion-card-conteo">
          {totalPretest} pretest · {totalPostest} postest en total
        </span>
      </div>
    </button>
  );
}
