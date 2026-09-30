import { VALORACION_OPCIONES } from '../data/catalogos.js';

/** Una estrategia de la Matriz 2 con su barra segmentada verde/amarillo/rojo,
 * según cómo la valoraron los docentes que la diligenciaron. */
function FilaEstrategia({ entrada }) {
  const { aspecto, conteo, total } = entrada;

  return (
    <li className="estrategia-fila">
      <span className="estrategia-nombre">{aspecto}</span>
      {total === 0 ? (
        <span className="estrategia-vacia">Todavía no la ha valorado ningún docente.</span>
      ) : (
        <>
          <span className="estrategia-barra">
            {VALORACION_OPCIONES.map((op) => (
              <span
                key={op.valor}
                className={`estrategia-segmento estrategia-segmento--${op.color}`}
                style={{ '--pct': conteo[op.valor] }}
                title={`${op.etiqueta}: ${conteo[op.valor]}`}
              />
            ))}
          </span>
          <span className="estrategia-conteos">
            {VALORACION_OPCIONES.map((op) => (
              <span key={op.valor} className={`estrategia-conteo estrategia-conteo--${op.color}`}>
                {conteo[op.valor]} {op.etiqueta.split(',')[0].split('.')[0]}
              </span>
            ))}
          </span>
        </>
      )}
    </li>
  );
}

/** Cómo valoraron los docentes cada estrategia de la Matriz 2, una barra por estrategia. */
export default function EstrategiasValoracion({ distribucion }) {
  const totalGeneral = distribucion.reduce((suma, d) => suma + d.total, 0);

  return (
    <section className="bloque">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Valoración por estrategia · Matriz 2</h2>
        <span className="chip chip--m2">
          {totalGeneral} {totalGeneral === 1 ? 'valoración' : 'valoraciones'}
        </span>
      </div>
      {totalGeneral === 0 ? (
        <p className="vacio">Todavía no hay estrategias valoradas.</p>
      ) : (
        <ul className="estrategias-lista">
          {distribucion.map((d) => (
            <FilaEstrategia key={d.aspecto} entrada={d} />
          ))}
        </ul>
      )}
    </section>
  );
}
