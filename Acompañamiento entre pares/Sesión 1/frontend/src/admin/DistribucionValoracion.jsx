import { VALORACIONES } from '../data/catalogos.js';

/** Semáforo de "Mi capital de experiencia" por componente: cuántos rectores
 * marcaron cada nivel, como barra apilada de 3 colores fijos. */
export default function DistribucionValoracion({ distribucion }) {
  const total = distribucion.reduce((suma, d) => suma + d.total, 0);

  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Semáforo de experiencia por componente</h2>
        <span className="chip chip--exp">
          {total} {total === 1 ? 'valoración' : 'valoraciones'}
        </span>
      </div>
      {total === 0 ? (
        <p className="vacio">Todavía no hay valoraciones registradas.</p>
      ) : (
        <>
          <ul className="semaforo-lista">
            {distribucion.map((d) => (
              <li key={d.componente} className="semaforo-fila">
                <span className="semaforo-fila-etiqueta">{d.componente}</span>
                <span className="semaforo-fila-barra" role="img" aria-label={`${d.componente}: ${d.domina} dominan, ${d.fortaleciendo} fortaleciendo, ${d.aprender} quieren aprender`}>
                  {d.total === 0 ? (
                    <span className="semaforo-segmento semaforo-segmento--vacio" style={{ flexGrow: 1 }} />
                  ) : (
                    VALORACIONES.map((v) => {
                      const n = d[v.valor];
                      if (n === 0) return null;
                      return (
                        <span
                          key={v.valor}
                          className={`semaforo-segmento semaforo-segmento--${v.color}`}
                          style={{ flexGrow: n }}
                          title={`${v.etiquetaCorta}: ${n}`}
                        >
                          {n}
                        </span>
                      );
                    })
                  )}
                </span>
                <span className="semaforo-fila-total">{d.total}</span>
              </li>
            ))}
          </ul>
          <ul className="semaforo-leyenda">
            {VALORACIONES.map((v) => (
              <li key={v.valor} className={`semaforo-leyenda-item semaforo-leyenda-item--${v.color}`}>
                <span className="semaforo-leyenda-punto" aria-hidden="true" />
                {v.etiquetaCorta}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
