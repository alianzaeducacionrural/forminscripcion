import EstadisticasPretest from './EstadisticasPretest.jsx';
import EstadisticasPostest from './EstadisticasPostest.jsx';
import RespuestasAbiertas from './RespuestasAbiertas.jsx';
import { calcularResumenPretest, calcularResumenPostest } from './calculos.js';

/**
 * Contenido del modal de detalle — el mismo componente sirve para una
 * institución puntual o para "Todas las instituciones" (agregado global);
 * quien lo abre ya filtró `pretest`/`postest` según corresponda.
 */
export default function InstitucionDetalle({ titulo, pretest, postest, esGlobal, onDescargarPretest, onDescargarPostest }) {
  const resumenPretest = calcularResumenPretest(pretest);
  const resumenPostest = calcularResumenPostest(postest);

  return (
    <div className="institucion-detalle entra">
      <h2>{titulo}</h2>
      {resumenPretest.total === 0 && resumenPostest.total === 0 ? (
        <p className="tabla-vacia">Todavía no hay registros de {esGlobal ? 'ninguna institución' : titulo}.</p>
      ) : (
        <>
          <EstadisticasPretest resumen={resumenPretest} onDescargarCSV={onDescargarPretest} mostrarPorInstitucion={false} />
          <EstadisticasPostest resumen={resumenPostest} onDescargarCSV={onDescargarPostest} mostrarPorInstitucion={false} />
          <RespuestasAbiertas pretest={pretest} postest={postest} mostrarFiltroInstitucion={esGlobal} />
        </>
      )}
    </div>
  );
}
