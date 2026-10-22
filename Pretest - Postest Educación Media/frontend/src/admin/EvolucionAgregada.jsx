/**
 * Comparación agregada (no pregunta-a-pregunta, ver PRODUCT.md) del % de
 * alineación con la práctica pedagógica recomendada, antes y después del
 * taller. Una fila por institución, ordenadas por cambio: el punto gris es
 * el Pretest, el índigo el Postest y el tramo entre ambos es el cambio.
 * Nunca se muestra ni se etiqueta así al docente.
 */
function Fila({ nombre, pre, post, global }) {
  const delta = pre !== null && post !== null ? post - pre : null;
  const a = Math.min(pre ?? post ?? 0, post ?? pre ?? 0);
  const b = Math.max(pre ?? post ?? 0, post ?? pre ?? 0);

  return (
    <li className={`evo-fila${global ? ' evo-fila--global' : ''}`}>
      <span className="evo-nombre" title={nombre}>{nombre}</span>
      <span className="evo-pista">
        {delta !== null && <span className="evo-tramo" style={{ left: `${a}%`, width: `${b - a}%` }} />}
        {pre !== null && <span className="evo-punto evo-punto--pre" style={{ left: `${pre}%` }} title={`Antes: ${pre}%`} />}
        {post !== null && <span className="evo-punto evo-punto--post" style={{ left: `${post}%` }} title={`Después: ${post}%`} />}
      </span>
      <span className="evo-valores">{pre ?? '—'}% → {post ?? '—'}%</span>
      <span className={`evo-delta ${delta === null ? '' : delta >= 0 ? 'evo-delta--sube' : 'evo-delta--baja'}`}>
        {delta === null ? 'sin par' : `${delta > 0 ? '+' : ''}${delta} pts`}
      </span>
    </li>
  );
}

const cambio = (f) => (f.pre !== null && f.post !== null ? f.post - f.pre : -Infinity);

export default function EvolucionAgregada({ evolucion }) {
  const filas = [...evolucion.porInstitucion].sort((x, y) => cambio(y) - cambio(x));
  const hayGlobal = evolucion.global.pre !== null || evolucion.global.post !== null;

  return (
    <section className="bloque bloque--evolucion">
      <div className="bloque-cabecera">
        <h2 className="bloque-titulo">Evolución — % de alineación con la práctica recomendada</h2>
        <div className="evo-leyenda">
          <span><i className="evo-punto evo-punto--pre" /> Antes</span>
          <span><i className="evo-punto evo-punto--post" /> Después</span>
        </div>
      </div>
      <p className="volumen-nota">
        Comparación agregada, no pregunta por pregunta: el Pretest y el Postest tienen
        preguntas propias. Ordenado por mayor cambio. Nunca se muestra al docente.
      </p>

      {!hayGlobal ? (
        <p className="tabla-vacia">Aún no hay suficientes respuestas de Pretest y Postest para comparar.</p>
      ) : (
        <ul className="evo-lista">
          <Fila nombre="Global" pre={evolucion.global.pre} post={evolucion.global.post} global />
          {filas.map((f) => (
            <Fila key={f.institucion} nombre={f.institucion} pre={f.pre} post={f.post} />
          ))}
        </ul>
      )}
    </section>
  );
}
