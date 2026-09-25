export default function TarjetaGlobal({ totales, onAbrir }) {
  return (
    <button type="button" className="ies-card ies-card--global" style={{ '--i': 0 }} onClick={onAbrir} aria-label="Ver todas las instituciones">
      <span className="ies-card-global-rotulo">Consolidado</span>
      <span className="ies-card-global-titulo">Todas las instituciones</span>
      <span className="ies-card-global-texto">
        {totales.acciones} acciones · {totales.aspectos} aspectos
      </span>
      <span className="ies-card-global-cta">Ver todo →</span>
    </button>
  );
}
