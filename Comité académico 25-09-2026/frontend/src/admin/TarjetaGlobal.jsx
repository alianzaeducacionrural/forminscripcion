export default function TarjetaGlobal({ totales, onAbrir }) {
  return (
    <button type="button" className="ies-card ies-card--global" onClick={onAbrir} aria-label="Ver todas las IES">
      <div className="ies-card-cabecera">
        <span className="ies-card-nombre">Todas las IES</span>
        <span className="ies-card-estado ies-card-estado--global">Consolidado</span>
      </div>
      <p className="ies-card-global-texto">
        {totales.acciones} acciones · {totales.aspectos} aspectos
      </p>
      <span className="ies-card-nota">
        {totales.iesCompletas} de {totales.totalIES} IES con las dos matrices
      </span>
    </button>
  );
}
