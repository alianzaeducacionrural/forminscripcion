/** Acciones vigentes por categoría orientadora de la Matriz 1. */
export default function CategoriasBarra({ distribucion }) {
  const total = distribucion.reduce((suma, d) => suma + d.total, 0);
  const max = Math.max(1, ...distribucion.map((d) => d.total));

  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Acciones por categoría · Matriz 1</h2>
        <span className="chip chip--m1">
          {total} {total === 1 ? 'acción' : 'acciones'}
        </span>
      </div>
      {total === 0 ? (
        <p className="vacio">Todavía no hay acciones registradas.</p>
      ) : (
        <ul className="distribucion-lista">
          {distribucion.map((d) => (
            <li key={d.categoria} className={`distribucion-fila ${d.total === 0 ? 'distribucion-fila--cero' : ''}`}>
              <span
                className="distribucion-fila-etiqueta"
                title={d.detalle.length ? `${d.categoria}: ${d.detalle.join(', ')}` : d.categoria}
              >
                {d.categoria}
                {d.detalle.length > 0 && <span className="distribucion-fila-detalle"> — {d.detalle.join(', ')}</span>}
              </span>
              <span className="distribucion-fila-pista">
                <span className="distribucion-fila-barra" style={{ '--pct': d.total / max }} />
              </span>
              <span className="distribucion-fila-numero">{d.total}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
