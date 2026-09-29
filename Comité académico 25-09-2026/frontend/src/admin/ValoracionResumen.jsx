/** Cuántas estrategias vigentes hay en cada nivel de la escala (Matriz 2). */
export default function ValoracionResumen({ distribucion }) {
  const total = distribucion.reduce((suma, d) => suma + d.total, 0);
  const max = Math.max(1, ...distribucion.map((d) => d.total));

  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Valoración de las estrategias · Matriz 2</h2>
        <span className="chip chip--m2">
          {total} {total === 1 ? 'estrategia valorada' : 'estrategias valoradas'}
        </span>
      </div>
      {total === 0 ? (
        <p className="vacio">Todavía no hay estrategias valoradas.</p>
      ) : (
        <ul className="distribucion-lista">
          {distribucion.map((d) => (
            <li key={d.valor || 'sin-valorar'} className={`distribucion-fila ${d.total === 0 ? 'distribucion-fila--cero' : ''}`}>
              <span className={`distribucion-fila-etiqueta distribucion-fila-etiqueta--${d.color}`}>{d.etiqueta}</span>
              <span className="distribucion-fila-pista">
                <span
                  className={`distribucion-fila-barra distribucion-fila-barra--${d.color}`}
                  style={{ '--pct': d.total / max }}
                />
              </span>
              <span className="distribucion-fila-numero">{d.total}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
